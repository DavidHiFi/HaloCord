/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { UserAreaButton, UserAreaRenderProps } from "@api/UserArea";
import { TestcordDevs } from "@utils/constants";
import { copyWithToast } from "@utils/discord";
import { useFixedTimer } from "@utils/react";
import definePlugin from "@utils/types";
import { SelectedChannelStore, useStateFromStores } from "@webpack/common";
import { waitForStore } from "@webpack/common/internal";
import EventEmitter from "events";

interface CodecOptions {
    type?: unknown;
    freq?: unknown;
    channels?: unknown;
    pacsize?: unknown;
    bitrate?: unknown;
    params?: { bitrate?: unknown; };
}

interface VoiceConnection {
    context: string;
    conn: {
        setTransportOptions: (options: Record<string, unknown>) => unknown;
    } | undefined;
    getCodecOptions?: (codec: string) => { audioEncoder?: CodecOptions; };
}

interface Snapshot {
    send: string | null;
    receive: string | null;
    sendBitrate: number | null;
}

let snapshot: Snapshot = { send: null, receive: null, sendBitrate: null };
let mediaEngineEmitter: EventEmitter | null = null;
let connectionHandler: ((connection: VoiceConnection) => void) | null = null;
const patchedConns = new Set<Record<string, unknown>>();

function readBitrate(options: Record<string, unknown>): number | null {
    if (typeof options.encodingVoiceBitRate === "number") return options.encodingVoiceBitRate;
    const encoder = options.audioEncoder;
    if (encoder && typeof encoder === "object") {
        const enc = encoder as CodecOptions;
        if (typeof enc.bitrate === "number") return enc.bitrate;
        if (typeof enc.params?.bitrate === "number") return enc.params.bitrate;
    }
    return null;
}

function describe(codec: CodecOptions | undefined, bitrate: number | null): string | null {
    if (!codec) return null;
    const parts: string[] = [];
    if (typeof codec.type === "string") parts.push(codec.type);
    if (typeof codec.freq === "number") parts.push(`${(codec.freq / 1000).toFixed(1)} kHz`);
    if (codec.channels === 1) parts.push("mono");
    if (codec.channels === 2) parts.push("stereo");
    if (typeof codec.pacsize === "number" && typeof codec.freq === "number" && codec.freq > 0) {
        parts.push(`${Math.round((codec.pacsize / codec.freq) * 1000)} ms frames`);
    }
    if (bitrate !== null) parts.push(`${Math.round(bitrate / 1000)} kbps`);
    return parts.length > 0 ? parts.join(" · ") : null;
}

function recordFromOptions(options: Record<string, unknown>) {
    const encoder = options.audioEncoder;
    if (encoder && typeof encoder === "object") {
        const bitrate = readBitrate(options);
        snapshot.send = describe(encoder as CodecOptions, bitrate);
        snapshot.sendBitrate = bitrate;
    }
    const decoders = options.audioDecoders;
    if (Array.isArray(decoders) && decoders[0] && typeof decoders[0] === "object") {
        snapshot.receive = describe(decoders[0] as CodecOptions, null);
    }
}

function resetSnapshot() {
    snapshot = { send: null, receive: null, sendBitrate: null };
}

function WaveIcon({ className }: { className?: string; }) {
    const active = snapshot.sendBitrate !== null && snapshot.sendBitrate >= 128_000;
    return (
        <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
                d="M3 12h2m3-5v10m4-14v18m4-14v10m4-5h2"
                stroke={active ? "var(--status-positive, currentColor)" : "currentColor"}
                strokeWidth="2"
                strokeLinecap="round"
            />
        </svg>
    );
}

function ReadoutButton({ iconForeground, hideTooltips }: UserAreaRenderProps) {
    useFixedTimer({ interval: 1000 });
    const inVoice = useStateFromStores([SelectedChannelStore], () => SelectedChannelStore.getVoiceChannelId() !== null);

    const lines = [snapshot.send, snapshot.receive].filter(Boolean).join("; ");
    const tooltip = inVoice ? (lines.length > 0 ? lines : "No voice data yet") : "Not connected to voice";

    return (
        <UserAreaButton
            tooltipText={hideTooltips ? undefined : tooltip}
            icon={<WaveIcon className={iconForeground} />}
            onClick={() => copyWithToast(tooltip)}
        />
    );
}

export default definePlugin({
    id: "VoiceQualityReadout",
    name: "VoiceQualityReadout",
    description: "Shows the live voice codec, sample rate, frame size and bitrate for the current call.",
    tags: ["Voice", "Utility"],
    authors: [TestcordDevs.DavidHiFi],
    enabledByDefault: true,

    userAreaButton: {
        icon: WaveIcon,
        render: ReadoutButton
    },

    start() {
        waitForStore("MediaEngineStore", store => {
            const mediaEngine = store.getMediaEngine();
            if (!mediaEngine?.emitter) return;

            const { emitter } = mediaEngine;
            mediaEngineEmitter = emitter;
            connectionHandler = connection => {
                if (connection.context !== "default" || !connection.conn) return;

                resetSnapshot();
                const initial = connection.getCodecOptions?.("opus")?.audioEncoder;
                if (initial) snapshot.send = describe(initial, null);

                const conn = connection.conn as Record<string, unknown>;
                if (conn._voiceReadoutOrig) return;

                const original = connection.conn.setTransportOptions;
                conn._voiceReadoutOrig = original;
                patchedConns.add(conn);

                connection.conn.setTransportOptions = function (options: Record<string, unknown>) {
                    recordFromOptions(options);
                    return original.apply(this, [options]);
                };
            };

            emitter.on("connection", connectionHandler);
        });
    },

    stop() {
        if (mediaEngineEmitter && connectionHandler) {
            mediaEngineEmitter.removeListener("connection", connectionHandler);
        }
        connectionHandler = null;
        mediaEngineEmitter = null;

        for (const conn of patchedConns) {
            try {
                if (conn._voiceReadoutOrig) {
                    conn.setTransportOptions = conn._voiceReadoutOrig;
                    delete conn._voiceReadoutOrig;
                }
            } catch { }
        }
        patchedConns.clear();
        resetSnapshot();
    }
});
