/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

// Chromium's MediaRecorder writes Opus only into WebM, while Discord voice messages must be Ogg Opus.
// This moves the same Opus packets from WebM (EBML) into Ogg pages (RFC 7845) without re-encoding.

const CONTAINERS = new Set([0x18538067, 0x1F43B675, 0x1654AE6B, 0xAE, 0xA0]); // Segment, Cluster, Tracks, TrackEntry, BlockGroup
const CODEC_PRIVATE = 0x63A2;
const SIMPLE_BLOCK = 0xA3;
const BLOCK = 0xA1;
const FRAME_SAMPLES = [480, 960, 1920, 2880, 480, 960, 1920, 2880, 480, 960, 1920, 2880, 480, 960, 480, 960, 120, 240, 480, 960];

function readVint(buf: Uint8Array, pos: number, keepMarker: boolean) {
    const first = buf[pos];
    let len = 1;
    while (len <= 8 && !(first & (0x80 >> (len - 1)))) len++;
    if (len > 8) throw new Error("Broken WebM data");
    let value = keepMarker ? first : first & (0xFF >> len);
    let allOnes = value === (0xFF >> len);
    for (let i = 1; i < len; i++) {
        value = value * 256 + buf[pos + i];
        if (buf[pos + i] !== 0xFF) allOnes = false;
    }
    return { value, len, unknown: !keepMarker && allOnes };
}

function parseWebm(buf: Uint8Array) {
    let head: Uint8Array | null = null;
    const packets: Uint8Array[] = [];
    let pos = 0;
    while (pos < buf.length) {
        const id = readVint(buf, pos, true);
        const size = readVint(buf, pos + id.len, false);
        const start = pos + id.len + size.len;
        if (CONTAINERS.has(id.value)) {
            pos = start;
            continue;
        }
        const end = size.unknown ? buf.length : start + size.value;
        if (id.value === CODEC_PRIVATE) head = buf.slice(start, end);
        else if (id.value === SIMPLE_BLOCK || id.value === BLOCK) {
            const track = readVint(buf, start, false);
            const flags = buf[start + track.len + 2];
            if (flags & 0x06) throw new Error("Laced WebM blocks are not supported");
            packets.push(buf.slice(start + track.len + 3, end));
        }
        pos = end;
    }
    if (!head || !packets.length) throw new Error("The recording is empty");
    return { head, packets };
}

function packetSamples(packet: Uint8Array) {
    const toc = packet[0];
    const code = toc & 3;
    const frames = code === 0 ? 1 : code === 3 ? packet[1] & 0x3F : 2;
    const config = toc >> 3;
    return FRAME_SAMPLES[config < 16 ? config : 16 + (config & 3)] * frames;
}

const CRC_TABLE = new Uint32Array(256).map((_, i) => {
    let r = i << 24;
    for (let j = 0; j < 8; j++) r = r & 0x80000000 ? (r << 1) ^ 0x04C11DB7 : r << 1;
    return r >>> 0;
});

function oggPage(packets: Uint8Array[], granule: number, seq: number, type: number) {
    const lacing: number[] = [];
    for (const p of packets) {
        for (let n = p.length; ; n -= 255) {
            lacing.push(Math.min(n, 255));
            if (n < 255) break;
        }
    }
    const bodyLen = packets.reduce((n, p) => n + p.length, 0);
    const page = new Uint8Array(27 + lacing.length + bodyLen);
    const view = new DataView(page.buffer);
    page.set([0x4F, 0x67, 0x67, 0x53, 0, type]);
    view.setUint32(6, granule % 0x100000000, true);
    view.setUint32(10, Math.floor(granule / 0x100000000), true);
    view.setUint32(14, 0x564D5347, true);
    view.setUint32(18, seq, true);
    page[26] = lacing.length;
    page.set(lacing, 27);
    let off = 27 + lacing.length;
    for (const p of packets) {
        page.set(p, off);
        off += p.length;
    }
    let crc = 0;
    for (const b of page) crc = ((crc << 8) ^ CRC_TABLE[((crc >>> 24) ^ b) & 0xFF]) >>> 0;
    view.setUint32(22, crc, true);
    return page;
}

export function webmOpusToOgg(webm: ArrayBuffer) {
    const { head, packets } = parseWebm(new Uint8Array(webm));
    const vendor = new TextEncoder().encode("HaloCord");
    const tags = new Uint8Array(16 + vendor.length);
    tags.set(new TextEncoder().encode("OpusTags"));
    new DataView(tags.buffer).setUint32(8, vendor.length, true);
    tags.set(vendor, 12);

    const pages = [oggPage([head], 0, 0, 2), oggPage([tags], 0, 1, 0)];
    let granule = 0;
    let group: Uint8Array[] = [];
    let segments = 0;
    for (let i = 0; i < packets.length; i++) {
        group.push(packets[i]);
        granule += packetSamples(packets[i]);
        segments += Math.floor(packets[i].length / 255) + 1;
        const last = i === packets.length - 1;
        const next = last ? 0 : Math.floor(packets[i + 1].length / 255) + 1;
        if (last || group.length >= 50 || segments + next > 255) {
            pages.push(oggPage(group, granule, pages.length, last ? 4 : 0));
            group = [];
            segments = 0;
        }
    }
    return new Blob(pages, { type: "audio/ogg; codecs=opus" });
}
