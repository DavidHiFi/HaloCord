/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as DataStore from "@api/DataStore";
import { definePluginSettings, SettingsStore } from "@api/Settings";
import { UserAreaButton, UserAreaRenderProps } from "@api/UserArea";
import { TestcordDevs } from "@utils/constants";
import { Logger } from "@utils/Logger";
import definePlugin, { OptionType } from "@utils/types";
import { findByPropsLazy, onceReady } from "@webpack";
import { MediaEngineStore, React, Toasts } from "@webpack/common";

const logger = new Logger("ForceMono");
const { setLocalVolume } = findByPropsLazy("setLocalVolume");

// Force Mono used to live inside StereoGuard. Carry its choices over once so nothing changes,
// and give back any volume the old guard still held when the client last closed.
const oldGuard = SettingsStore.plain.plugins.StereoGuard;
if (oldGuard) {
    const { plugins } = SettingsStore.plain;
    if (!plugins.ForceMono) {
        const forceMono = oldGuard.forceMono === true;
        const showButton = oldGuard.forceMonoButton === true;
        plugins.ForceMono = { enabled: oldGuard.enabled === true && (forceMono || showButton), forceMono, showButton };
    }
    delete plugins.StereoGuard;
    SettingsStore.markAsChanged();
    void onceReady.then(async () => {
        try {
            const held = await DataStore.get("StereoGuard_held_volumes");
            if (held && typeof held === "object") {
                for (const [userId, volume] of Object.entries(held as Record<string, unknown>)) {
                    if (typeof volume === "number" && Number.isFinite(volume) && volume >= 0) setLocalVolume(userId, volume);
                }
            }
            await DataStore.delMany(["StereoGuard_held_volumes", "StereoGuard_ignored"]);
        } catch (e) {
            logger.error("failed to clean up StereoGuard data", e);
        }
    });
}

const settings = definePluginSettings({
    forceMono: {
        type: OptionType.BOOLEAN,
        description: "Play everyone's incoming voice in mono.",
        default: false,
        onChange: () => applyForceMono()
    },
    showButton: {
        type: OptionType.BOOLEAN,
        description: "Show a Force Mono button next to your mute and deafen buttons.",
        default: true
    }
});

interface VoiceOutput {
    gainNode?: GainNode;
}

interface MonoConnection {
    context?: string;
    outputs?: Record<string, VoiceOutput>;
    audioContext?: AudioContext;
    conn?: {
        setTransportOptions(options: Record<string, any>): unknown;
        _forceMonoOrig?: (options: Record<string, any>) => unknown;
    };
}

interface MediaEngineEmitter {
    on?(event: "connection", handler: (connection: MonoConnection) => void): void;
    removeListener?(event: "connection", handler: (connection: MonoConnection) => void): void;
}

const WEB_SYNC_MS = 1000;

let nativeConnection: MonoConnection | undefined;
let webConnection: MonoConnection | undefined;
let emitter: MediaEngineEmitter | undefined;
let webTimer: ReturnType<typeof setInterval> | undefined;
const patchedConns = new Set<NonNullable<MonoConnection["conn"]>>();
const monoNodes = new Set<GainNode>();

// deracul's Force Mono: stereo "0" asks the Opus decoder to downmix to mono.
const getAudioDecoder = (mono: boolean) => ({
    channels: 2,
    freq: 48000,
    params: { stereo: mono ? "0" : "1" },
    type: 120,
    name: "opus",
});

function updateDecoder(mono: boolean) {
    nativeConnection?.conn?.setTransportOptions({ audioDecoders: [getAudioDecoder(mono)] });
}

// HaloCord plays each person through a gain node. A one channel input on that node downmixes
// stereo to mono. The audio guard rebuilds its nodes now and then, so this runs again each second.
function syncWebMono(mono: boolean) {
    const outputs = webConnection?.outputs;
    if (!outputs) return;
    for (const output of Object.values(outputs)) {
        const node = output?.gainNode;
        if (!node || (mono && node.channelCount === 1)) continue;
        try {
            if (mono) {
                node.channelCount = 1;
                node.channelCountMode = "explicit";
                node.channelInterpretation = "speakers";
                monoNodes.add(node);
            } else if (monoNodes.delete(node)) {
                node.channelCount = 2;
                node.channelCountMode = "max";
            }
        } catch (e) {
            logger.error("force mono failed", e);
        }
    }
}

function applyForceMono(mono = settings.store.forceMono) {
    updateDecoder(mono);
    syncWebMono(mono);
    if (webTimer !== undefined) clearInterval(webTimer);
    webTimer = mono && webConnection ? setInterval(() => syncWebMono(true), WEB_SYNC_MS) : undefined;
}

function onConnection(connection: MonoConnection) {
    if (connection?.context !== "default") return;

    const { conn } = connection;
    // Web voice connections have no native conn; their audio plays through HaloCord's gain nodes.
    if (!conn) webConnection = connection;
    else {
        nativeConnection = connection;
        if (!conn._forceMonoOrig) {
            const original = conn.setTransportOptions;
            conn._forceMonoOrig = original;
            patchedConns.add(conn);
            conn.setTransportOptions = function (options: Record<string, any>) {
                if (options.audioDecoders) options.audioDecoders[0] = getAudioDecoder(settings.store.forceMono);
                return original.call(this, options);
            };
        }
    }

    applyForceMono();
}

function MonoIcon({ className, active }: { className?: string; active?: boolean; }) {
    const lineLength = 30;
    const lineStyle: React.CSSProperties = {
        strokeDasharray: lineLength,
        strokeDashoffset: active ? lineLength : 0,
        transition: "stroke-dashoffset 0.1s ease-in-out",
    };

    return (
        <svg className={className} width="20" height="20" viewBox="0 0 256 256">
            <mask id="foremonoLine">
                <rect width="100%" height="100%" fill="#ffffff" />
                <line x1="235" y1="21" x2="21" y2="235" stroke="#000000" strokeWidth="64" strokeLinecap="round" style={lineStyle} />
            </mask>
            <path
                fill={active ? "currentColor" : "var(--status-danger)"}
                fillRule="evenodd"
                mask="url(#foremonoLine)"
                d="M128.802 95.03c-9.229-9.369-22.39-15.228-37-15.228-27.92 0-50.555 21.402-50.555 47.803 0 26.4 22.634 47.802 50.555 47.802 14.711 0 27.954-5.94 37.193-15.423-12.232-16.88-14.177-19.888-14.177-32.38 0-12.016 5.924-18.458 14.19-31.142 6.753 13.293 13.629 19.445 13.629 31.538 0 12.802-6.03 20.525-13.402 32.614 9.206 9.115 22.185 14.793 36.567 14.793 27.922 0 50.556-21.401 50.556-47.802 0-26.4-22.634-47.803-50.556-47.803-14.608 0-27.77 5.86-37 15.228zM128 75.374C138.501 68.202 151.252 64 165 64c35.899 0 65 28.654 65 64 0 35.346-29.101 64-65 64-13.748 0-26.499-4.202-37-11.374C117.499 187.798 104.748 192 91 192c-35.899 0-65-28.654-65-64 0-35.346 29.101-64 65-64 13.748 0 26.499 4.202 37 11.374z"
            />
            <line x1="235" y1="21" x2="21" y2="235" stroke="var(--status-danger, currentColor)" strokeWidth="21" strokeLinecap="round" style={lineStyle} />
        </svg>
    );
}

const BUTTON_KEYS = ["forceMono", "showButton"] as const;

function ForceMonoButton({ iconForeground, hideTooltips, nameplate }: UserAreaRenderProps) {
    const { forceMono, showButton } = settings.use(BUTTON_KEYS);
    if (!showButton) return null;

    return (
        <UserAreaButton
            tooltipText={hideTooltips ? void 0 : forceMono ? "Disable Force Mono" : "Enable Force Mono"}
            aria-label="Force Mono"
            icon={<MonoIcon className={iconForeground} active={forceMono} />}
            role="switch"
            aria-checked={forceMono}
            redGlow={!forceMono}
            plated={nameplate != null}
            onClick={() => {
                settings.store.forceMono = !forceMono;
                Toasts.show({
                    message: settings.store.forceMono ? "Force Mono on" : "Force Mono off",
                    id: "MonoToast",
                    type: Toasts.Type.MESSAGE
                });
            }}
        />
    );
}

export default definePlugin({
    name: "ForceMono",
    description: "Plays everyone's incoming voice in mono, with an optional button next to mute and deafen.",
    authors: [TestcordDevs.deracul, TestcordDevs.DavidHiFi],
    tags: ["Voice", "Utility"],
    settings,

    userAreaButton: {
        icon: MonoIcon,
        render: ForceMonoButton
    },

    start() {
        const engine = MediaEngineStore.getMediaEngine() as { emitter?: MediaEngineEmitter; connections?: Iterable<MonoConnection>; } | undefined;
        emitter = engine?.emitter;
        emitter?.on?.("connection", onConnection);
        for (const conn of engine?.connections ?? []) onConnection(conn);
    },

    stop() {
        emitter?.removeListener?.("connection", onConnection);
        emitter = undefined;
        // Unpatch first: the patched setter would put the saved choice back over the stereo request.
        for (const conn of patchedConns) {
            if (conn._forceMonoOrig) {
                conn.setTransportOptions = conn._forceMonoOrig;
                delete conn._forceMonoOrig;
            }
        }
        patchedConns.clear();
        applyForceMono(false);
        monoNodes.clear();
        nativeConnection = undefined;
        webConnection = undefined;
    }
});
