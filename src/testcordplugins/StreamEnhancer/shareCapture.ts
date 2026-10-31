/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

// Carries the share picker's choice into Discord's getDisplayMedia call and gives the stream its
// sound the way the desktop app does: a window share hears only that app, a screen share hears
// everything except HaloCord (so the call and your mic never go out twice). The capture runs in
// the shell (halocord-loopback.exe); a chosen input device or a camera comes from getUserMedia.

export type ShareChoice = { kind: "desktop" | "device"; id: string; audio: string; };

interface NativeShare {
    selectShareSource?: (id: string) => Promise<void>;
    startShareAudio?: () => Promise<boolean>;
    stopShareAudio?: () => Promise<void>;
    takeShareAudio?: (cb: (chunk: Uint8Array) => void) => boolean;
}
const Native = () => (window as { HaloCordNative?: NativeShare; }).HaloCordNative;

let pending: ShareChoice | null = null;
let pendingAt = 0;

export const setPendingShare = (choice: ShareChoice) => {
    pending = choice;
    pendingAt = Date.now();
    if (choice.kind === "desktop") void Native()?.selectShareSource?.(choice.id);
};

// The page's own getUserMedia carries HaloCord's mic chain (noise filter, voice effects), so
// stream sound and cameras come from a blank frame's untouched copy.
let frame: HTMLIFrameElement | null = null;
const cleanMedia = (): MediaDevices => {
    try {
        if (!frame?.isConnected) {
            frame = document.createElement("iframe");
            frame.style.display = "none";
            document.body.appendChild(frame);
        }
        return frame.contentWindow!.navigator.mediaDevices ?? navigator.mediaDevices;
    } catch {
        return navigator.mediaDevices;
    }
};

const rawAudio = (deviceId: string) => cleanMedia().getUserMedia({
    audio: { deviceId: { exact: deviceId }, echoCancellation: false, noiseSuppression: false, autoGainControl: false, channelCount: 2 },
    video: false
});

// 48 kHz stereo float32 chunks from the shell, scheduled gap-free into one audio track.
const loopbackTrack = async (): Promise<{ track: MediaStreamTrack; stop: () => void; } | null> => {
    const N = Native();
    if (!N?.takeShareAudio || !N.startShareAudio) return null;
    const ctx = new AudioContext({ sampleRate: 48000, latencyHint: "interactive" });
    const dest = ctx.createMediaStreamDestination();
    let at = 0, rest: Uint8Array | null = null, done = false;
    N.takeShareAudio(u8 => {
        if (done) return;
        let b = u8;
        if (rest) { b = new Uint8Array(rest.length + u8.length); b.set(rest); b.set(u8, rest.length); }
        const frames = Math.floor(b.length / 8);
        rest = b.length % 8 ? b.slice(frames * 8) : null;
        if (!frames) return;
        const f = new Float32Array(b.buffer.slice(b.byteOffset, b.byteOffset + frames * 8));
        const buf = ctx.createBuffer(2, frames, 48000), L = buf.getChannelData(0), R = buf.getChannelData(1);
        for (let i = 0; i < frames; i++) { L[i] = f[i * 2]; R[i] = f[i * 2 + 1]; }
        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.connect(dest);
        // 60 ms of headroom absorbs IPC timing; after a stall, restart from now instead of piling up delay.
        const now = ctx.currentTime;
        if (at < now + 0.02 || at > now + 0.25) at = now + 0.06;
        src.start(at);
        at += frames / 48000;
    });
    if (!await N.startShareAudio().catch(() => false)) { done = true; void ctx.close(); return null; }
    return {
        track: dest.stream.getAudioTracks()[0],
        stop: () => { if (done) return; done = true; void N.stopShareAudio?.(); void ctx.close(); }
    };
};

const pickAudio = async (choice: ShareChoice | null) => {
    const audio = choice?.audio ?? "default";
    if (audio !== "default") {
        const s = await rawAudio(audio);
        return { track: s.getAudioTracks()[0], stop: () => s.getTracks().forEach(t => t.stop()) };
    }
    if (choice?.kind !== "device") return loopbackTrack();
    // A capture card's own sound input shares its group id with the video input.
    const devices = await navigator.mediaDevices.enumerateDevices();
    const group = devices.find(d => d.kind === "videoinput" && d.deviceId === choice.id)?.groupId;
    const input = group && devices.find(d => d.kind === "audioinput" && d.groupId === group && d.deviceId !== "default" && d.deviceId !== "communications");
    if (!input) return null;
    const s = await rawAudio(input.deviceId);
    return { track: s.getAudioTracks()[0], stop: () => s.getTracks().forEach(t => t.stop()) };
};

const videoConstraints = (c: MediaStreamConstraints | undefined) =>
    c?.video && typeof c.video === "object" ? c.video : {};

let restore: (() => void) | null = null;

export const installShareCapture = () => {
    if (restore || !navigator.mediaDevices?.getDisplayMedia) return;
    const md = navigator.mediaDevices;
    const original = md.getDisplayMedia;
    md.getDisplayMedia = async function (constraints?: MediaStreamConstraints) {
        const choice = pending && Date.now() - pendingAt < 20000 ? pending : null;
        pending = null;
        const stream = choice?.kind === "device"
            ? await cleanMedia().getUserMedia({ video: { ...videoConstraints(constraints), deviceId: { exact: choice.id } }, audio: false })
            : await original.call(this, constraints);
        // Chromium's own loopback hears HaloCord too; the shell or the chosen device replaces it.
        for (const t of stream.getAudioTracks()) { stream.removeTrack(t); t.stop(); }
        if (!constraints?.audio || choice?.audio === "none") return stream;
        const sound = await pickAudio(choice).catch(e => { console.error("[HaloCord] stream sound failed", e); return null; });
        if (!sound?.track) return stream;
        stream.addTrack(sound.track);
        // Discord ends a share with track.stop(), which fires no 'ended' event, so watch both.
        for (const t of stream.getVideoTracks()) {
            const { stop } = t;
            t.stop = function () { sound.stop(); sound.track.stop(); return stop.call(t); };
            t.addEventListener("ended", () => { sound.stop(); sound.track.stop(); });
        }
        return stream;
    };
    restore = () => { md.getDisplayMedia = original; restore = null; };
};

export const uninstallShareCapture = () => restore?.();
