/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { TestcordDevs } from "@utils/constants";
import { Logger } from "@utils/Logger";
import definePlugin, { PluginNative } from "@utils/types";
import { findByCodeLazy, findByPropsLazy } from "@webpack";
import { ChannelStore, MediaEngineStore, PermissionStore, PermissionsBits, SelectedChannelStore, showToast, Toasts } from "@webpack/common";

import { loadSaved, sizeFor } from "../StreamEnhancer/quality";
import { setPendingShare } from "../StreamEnhancer/shareCapture";

const Native = VencordNative.pluginHelpers.ScreenShareDeck as PluginNative<typeof import("./native")> | undefined;
const logger = new Logger("ScreenShareDeck");

const startStream = findByCodeLazy('type:"STREAM_START"');
const stopStream = findByCodeLazy('type:"STREAM_STOP"');
const updateStreamSettings = findByCodeLazy('type:"STREAM_UPDATE_SETTINGS"');
const streamKeys = findByPropsLazy("_z", "Iy") as { _z(stream: StreamLike): string; };
const AppStreams = findByPropsLazy("getCurrentUserActiveStream", "getStreamerActiveStreamMetadata") as {
    getCurrentUserActiveStream(): StreamLike | null;
};

const PRESET_CUSTOM = 3;

interface StreamLike {
    streamType: string;
    guildId?: string | null;
    channelId: string;
    ownerId: string;
}

type DesktopEngine = { getDesktopSource(size: { width: number; height: number; }, sound: boolean): Promise<string>; };

// The screen this plugin put on the stream. The web build's stream id is its own capture handle,
// so the screen behind a running stream is only known when the deck started it.
let activeScreen: string | null = null;
let busy = false;

function liveStream() {
    const stream = AppStreams.getCurrentUserActiveStream();
    if (!stream) activeScreen = null;
    return stream;
}

function voiceChannel() {
    const voice = SelectedChannelStore.getVoiceChannelId();
    if (!voice) return { error: "Join a voice channel first" } as const;
    const channel = ChannelStore.getChannel(voice);
    if (!channel) return { error: "Voice channel not found" } as const;
    if (channel.type === 13) return { error: "Stage channels cannot be screenshared" } as const;
    const isGuildChannel = !channel.isDM() && !channel.isGroupDM();
    if (isGuildChannel && !PermissionStore.can(PermissionsBits.STREAM, channel)) return { error: "No stream permission in this channel" } as const;
    return { voice, guildId: channel.guild_id ?? null } as const;
}

// The same steps as the web Go Live button: settings, capture through getDisplayMedia (the shell
// answers it with the preselected screen, no picker), then start the stream on that capture.
async function goLive(screenId: string, guildId: string | null, voice: string) {
    const opts = loadSaved();
    const size = sizeFor(opts.height);
    setPendingShare({ kind: "desktop", id: screenId, audio: opts.audio, muted: opts.mute, pan: opts.pan });
    updateStreamSettings({ preset: PRESET_CUSTOM, resolution: size.height, frameRate: opts.fps, soundshareEnabled: true });
    const engine = MediaEngineStore.getMediaEngine() as unknown as DesktopEngine;
    const sourceId = await engine.getDesktopSource(size, true);
    startStream(guildId, voice, { pid: null, sourceId, sourceName: null });
    activeScreen = screenId;
}

async function stopAndWait(stream: StreamLike) {
    stopStream(streamKeys._z(stream));
    for (let i = 0; i < 20 && AppStreams.getCurrentUserActiveStream(); i++) await new Promise(r => setTimeout(r, 25));
    activeScreen = null;
}

async function toggle(screenId: string, name: string) {
    const vc = voiceChannel();
    if (!vc.voice) {
        const error = vc.error ?? "Not in a voice channel";
        showToast(error, Toasts.Type.FAILURE);
        return { ok: false, error };
    }
    if (busy) return { ok: false, error: "Busy" };
    busy = true;
    try {
        const stream = liveStream();
        if (stream && activeScreen === screenId) {
            await stopAndWait(stream);
            showToast("Stream ended", Toasts.Type.MESSAGE);
            return { ok: true, action: "stopped" };
        }
        if (stream) await stopAndWait(stream);
        await goLive(screenId, vc.guildId, vc.voice);
        showToast(stream ? `Switched to ${name}` : `Sharing ${name}`, Toasts.Type.SUCCESS);
        return { ok: true, action: stream ? "switched" : "started" };
    } finally {
        busy = false;
    }
}

async function handle(cmd: { type: string; screenId?: string; name?: string; }): Promise<unknown> {
    try {
        if (cmd.type === "state") {
            const stream = liveStream();
            return { ok: true, inCall: SelectedChannelStore.getVoiceChannelId() != null, streaming: !!stream, activeScreen };
        }
        if (cmd.type === "toggle" && cmd.screenId) return await toggle(cmd.screenId, cmd.name ?? "screen");
        return { ok: false, error: "Unknown command" };
    } catch (e) {
        logger.error("bridge command failed:", e);
        activeScreen = null;
        return { ok: false, error: String((e as Error)?.message ?? e) };
    }
}

const BRIDGE = "__screenShareDeck";

export default definePlugin({
    name: "ScreenShareDeck",
    description: "Answers the Stream Deck display keys on 127.0.0.1:47831: share a whole monitor, switch between them and end the stream, all without prompts.",
    authors: [TestcordDevs.DavidHiFi],
    enabledByDefault: true,

    async start() {
        if (!Native) return logger.warn("No native helper (web build), the Screen Share Deck bridge is unavailable");
        (window as Record<string, unknown>)[BRIDGE] = { handle };
        const res = await Native.start();
        if (res.ok) logger.info(`Listening on 127.0.0.1:${res.port}`);
        else logger.error("Could not open the Screen Share Deck bridge:", res.error);
    },

    stop() {
        delete (window as Record<string, unknown>)[BRIDGE];
        void Native?.stop();
    }
});
