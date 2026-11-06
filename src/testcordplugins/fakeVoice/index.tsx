/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { NavContextMenuPatchCallback } from "@api/ContextMenu";
import { UserAreaButton, UserAreaRenderProps } from "@api/UserArea";
import ErrorBoundary from "@components/ErrorBoundary";
import { EquicordDevs, TestcordDevs } from "@utils/constants";
import { useForceUpdater } from "@utils/react";
import definePlugin from "@utils/types";
import type { Channel, VoiceState } from "@vencord/discord-types";
import { findByCode, findByProps, findStore, findStoreLazy } from "@webpack";
import { ApplicationStreamingStore, ChannelStore, ContextMenuApi, MediaEngineStore, Menu, PermissionsBits, PermissionStore, React, SelectedChannelStore, UserStore, VoiceActions } from "@webpack/common";

import { settings } from "./settings";

export let faked = false;

const STREAM = 1n << 9n;
const DEFAULT_VOICE_CONTEXT = "default";
const WATCH_TOGETHER_APPLICATION_ID = "880218394199220334";

const GatewayConnectionStore = findStoreLazy("GatewayConnectionStore") as {
    getSocket(): {
        voiceStateUpdate(state: {
            guildId: string | null;
            channelId: string;
            selfMute: boolean;
            selfDeaf: boolean;
            selfVideo: boolean;
        }): void;
    };
};

let micCutoffApplied = false;
let selfMuteBeforeMicCutoff = false;
let micCutoffTimeout: ReturnType<typeof setTimeout> | null = null;
let fakeStreamActive = false;
// Key of the stream FakeVoice started, so only that one is ever stopped (never a real or watched stream).
let fakeStreamKey: string | null = null;
let fakeGameStarted = false;
let fakeGameLaunching = false;
let fakeGameFailed = false;

function getSelectedVoiceChannel() {
    const selected = SelectedChannelStore.getVoiceChannelId();
    if (!selected) return null;

    return ChannelStore.getChannel(selected);
}

function syncFakeVoiceState() {
    const channel = getSelectedVoiceChannel();
    if (!channel) return;

    GatewayConnectionStore.getSocket().voiceStateUpdate({
        guildId: channel.guild_id ?? null,
        channelId: channel.id,
        selfMute: MediaEngineStore.isSelfMute(),
        selfDeaf: MediaEngineStore.isSelfDeaf(),
        selfVideo: MediaEngineStore.isVideoEnabled()
    });
}

function setFakeCameraEnabled(enabled: boolean) {
    settings.store.fakeCam = enabled;

    if (faked) {
        syncFakeVoiceState();
    }
}

function canUseFakeCamera(channel: Channel) {
    return PermissionStore.can(STREAM, channel);
}

function canUseFakeActivity(channel: Channel) {
    return PermissionStore.can(PermissionsBits.USE_EMBEDDED_ACTIVITIES, channel);
}

function getEmbeddedActivityLocation(channelId: string) {
    return {
        channelId,
        guildId: ChannelStore.getChannel(channelId)?.guild_id ?? null
    };
}

async function startActivity(channelId: string): Promise<boolean> {
    const activityApi = findByProps("su", "_H");
    if (!activityApi?.su) return false;

    return await activityApi.su({
        channelId,
        applicationId: WATCH_TOGETHER_APPLICATION_ID,
        isStart: true,
        locationObject: getEmbeddedActivityLocation(channelId)
    });
}

function hasFakeActivity(channelId: string) {
    const embeddedActivitiesStore = findStore("EmbeddedActivitiesStore");
    return embeddedActivitiesStore?.getSelfEmbeddedActivityForChannel?.(channelId)?.applicationId === WATCH_TOGETHER_APPLICATION_ID;
}

// The current user's own live stream (real or fake). Watched streams are not included.
function getOwnLiveStream() {
    const stream = ApplicationStreamingStore.getCurrentUserActiveStream() as (ReturnType<typeof ApplicationStreamingStore.getCurrentUserActiveStream> & { state?: string; }) | null;
    if (!stream || stream.state === "ENDED" || stream.state === "FAILED") return null;
    return stream;
}

function encodeStreamKey({ streamType, guildId, channelId, ownerId }: { streamType: string; guildId: string | null; channelId: string; ownerId: string; }) {
    return (streamType === "guild" ? [streamType, guildId, channelId, ownerId] : [streamType, channelId, ownerId]).join(":");
}

function leaveActivity(channelId?: string) {
    const activityApi = findByProps("su", "_H");
    const frameApi = findByProps("launchFrame", "refreshProxyTicket", "stopFrame");
    const embeddedActivitiesStore = findStore("EmbeddedActivitiesStore");
    const activity = embeddedActivitiesStore?.getCurrentEmbeddedActivity?.()
        ?? (channelId ? embeddedActivitiesStore?.getSelfEmbeddedActivityForChannel?.(channelId) : null);
    const location = embeddedActivitiesStore?.getConnectedActivityLocation?.()
        ?? activity?.location
        ?? (channelId ? getEmbeddedActivityLocation(channelId) : null);

    if (!location) return;
    if (!activity?.applicationId) return;

    activityApi?._H?.({
        location,
        applicationId: activity.applicationId,
        showFeedback: false
    });
    frameApi?.stopFrame?.({ applicationId: activity.applicationId });
}

function syncMicCutoff(enabled: boolean) {
    const shouldCutMic = enabled && settings.store.cutMicTransmission && getSelectedVoiceChannel();

    if (!shouldCutMic) {
        if (!micCutoffApplied) return;

        if (!selfMuteBeforeMicCutoff && MediaEngineStore.isSelfMute()) {
            VoiceActions.setSelfMute(DEFAULT_VOICE_CONTEXT, false, false);
        }

        micCutoffApplied = false;
        selfMuteBeforeMicCutoff = false;
        return;
    }

    if (micCutoffApplied) return;

    selfMuteBeforeMicCutoff = MediaEngineStore.isSelfMute();
    if (!selfMuteBeforeMicCutoff) {
        VoiceActions.setSelfMute(DEFAULT_VOICE_CONTEXT, true, false);
        micCutoffApplied = true;
    }
}

function scheduleMicCutoffSync(enabled: boolean, delay = 0) {
    if (micCutoffTimeout != null) clearTimeout(micCutoffTimeout);

    if (delay <= 0) {
        micCutoffTimeout = null;
        syncMicCutoff(enabled);
        return;
    }

    micCutoffTimeout = setTimeout(() => {
        micCutoffTimeout = null;
        syncMicCutoff(enabled);
    }, delay);
}

// Fake Stream: a Go Live with no capture source. STREAM_START makes the gateway send STREAM_CREATE,
// which is what puts the LIVE badge on you for everyone else; nothing is captured or sent.
function syncFakeStream() {
    const channel = getSelectedVoiceChannel();
    fakeStreamActive = Boolean(faked && settings.store.fakeStream && channel && PermissionStore.can(STREAM, channel));
    const ownStream = getOwnLiveStream();

    if (fakeStreamActive && channel) {
        if (ownStream) return;
        const startStream = findByCode('type:"STREAM_START"');
        const guildId = channel.guild_id ?? null;
        startStream(guildId, channel.id, {
            pid: null,
            sourceId: null,
            sourceName: null,
            audioSourceId: null,
            sound: false,
            previewDisabled: true
        });
        fakeStreamKey = encodeStreamKey({ streamType: guildId != null ? "guild" : "call", guildId, channelId: channel.id, ownerId: UserStore.getCurrentUser().id });
        return;
    }

    if (fakeStreamKey && ownStream && encodeStreamKey(ownStream) === fakeStreamKey) {
        findByCode('type:"STREAM_STOP"')(fakeStreamKey);
    }
    fakeStreamKey = null;
}

// Fake Game: launches Watch Together in the voice channel; the patches below keep its window closed.
function syncFakeGame() {
    const channel = getSelectedVoiceChannel();
    if (faked && settings.store.fakeGame && channel && canUseFakeActivity(channel)) {
        if (fakeGameLaunching || fakeGameFailed || hasFakeActivity(channel.id)) return;
        fakeGameLaunching = true;
        startActivity(channel.id)
            .then(ok => {
                fakeGameStarted ||= ok;
                fakeGameFailed = !ok;
            })
            .catch(() => { fakeGameFailed = true; })
            .finally(() => { fakeGameLaunching = false; });
        return;
    }

    fakeGameFailed = false;
    if (fakeGameStarted) {
        fakeGameStarted = false;
        leaveActivity(channel?.id);
    }
}

function makeIcon(enabled?: boolean) {
    return ({ className }: { className?: string; }) => (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 512 512">
            <path
                fill="currentColor"
                d="M256 48C141.1 48 48 141.1 48 256v40c0 13.3-10.7 24-24 24s-24-10.7-24-24V256C0 114.6 114.6 0 256 0S512 114.6 512 256V400.1c0 48.6-39.4 88-88.1 88L313.6 488c-8.3 14.3-23.8 24-41.6 24H240c-26.5 0-48-21.5-48-48s21.5-48 48-48h32c17.8 0 33.3 9.7 41.6 24l110.4.1c22.1 0 40-17.9 40-40V256c0-114.9-93.1-208-208-208zM144 208h16c17.7 0 32 14.3 32 32V352c0 17.7-14.3 32-32 32H144c-35.3 0-64-28.7-64-64V272c0-35.3 28.7-64 64-64zm224 0c35.3 0 64 28.7 64 64v48c0 35.3-28.7 64-64 64H352c-17.7 0-32-14.3-32-32V240c0-17.7 14.3-32 32-32h16z"
            />
            {!enabled && (
                <line
                    x1="495"
                    y1="10"
                    x2="10"
                    y2="464"
                    stroke="var(--status-danger)"
                    strokeWidth="40"
                />
            )}
        </svg>
    );
}

function setFakeVoiceEnabled(enabled: boolean) {
    faked = enabled;

    const channel = getSelectedVoiceChannel();

    syncFakeStream();
    syncFakeGame();

    if (!channel) {
        scheduleMicCutoffSync(false);
        return;
    }

    if (settings.store.fakeCam && canUseFakeCamera(channel) && MediaEngineStore.isVideoEnabled() !== enabled) {
        VoiceActions.setVideoEnabled(enabled);
    }

    if (settings.store.fakeMute || settings.store.fakeDeafen || settings.store.fakeCam) {
        syncFakeVoiceState();
    }

    scheduleMicCutoffSync(enabled, enabled ? 450 : 0);
}

let refreshButton: (() => void) | null = null;

const fakeVoiceSetters = {
    enabled: (value: boolean) => {
        setFakeVoiceEnabled(value);
        refreshButton?.();
    },
    mute: (value: boolean) => {
        settings.store.fakeMute = value;
        if (faked) syncFakeVoiceState();
    },
    deafen: (value: boolean) => {
        settings.store.fakeDeafen = value;
        if (faked) syncFakeVoiceState();
    },
    camera: setFakeCameraEnabled,
    stream: (value: boolean) => {
        settings.store.fakeStream = value;
        syncFakeStream();
    },
    game: (value: boolean) => {
        settings.store.fakeGame = value;
        syncFakeGame();
    },
    cutmic: (value: boolean) => {
        settings.store.cutMicTransmission = value;
        scheduleMicCutoffSync(faked);
    }
};

type FakeVoiceKind = keyof typeof fakeVoiceSetters;

function getFakeVoiceStates(): Record<FakeVoiceKind, boolean> {
    return {
        enabled: faked,
        mute: settings.store.fakeMute,
        deafen: settings.store.fakeDeafen,
        camera: settings.store.fakeCam,
        stream: settings.store.fakeStream,
        game: settings.store.fakeGame,
        cutmic: settings.store.cutMicTransmission
    };
}

const fakeVoiceBridge = {
    state: getFakeVoiceStates,
    set(kind: FakeVoiceKind, value: boolean) {
        if (getFakeVoiceStates()[kind] !== value) fakeVoiceSetters[kind](value);
        return getFakeVoiceStates();
    },
    toggle(kind: FakeVoiceKind) {
        return this.set(kind, !getFakeVoiceStates()[kind]);
    }
};

function renderFakeVoiceMenuItems(includeEnabledToggle = false, enabled = faked, setEnabled?: (value: boolean) => void) {
    return [
        includeEnabledToggle && (
            <Menu.MenuCheckboxItem
                id="toggle-fake-voice"
                key="toggle-fake-voice"
                label="Enabled"
                checked={enabled}
                action={() => {
                    const newEnabled = !enabled;
                    setEnabled?.(newEnabled);
                    setFakeVoiceEnabled(newEnabled);
                }}
            />
        ),
        <Menu.MenuCheckboxItem
            id="update-mute"
            key="update-mute"
            label="Fake Mute"
            checked={settings.store.fakeMute}
            action={() => fakeVoiceSetters.mute(!settings.store.fakeMute)}
        />,
        <Menu.MenuCheckboxItem
            id="update-deafen"
            key="update-deafen"
            label="Fake Deafen"
            checked={settings.store.fakeDeafen}
            action={() => fakeVoiceSetters.deafen(!settings.store.fakeDeafen)}
        />,
        <Menu.MenuCheckboxItem
            id="update-camera"
            key="update-camera"
            label="Fake Camera"
            checked={settings.store.fakeCam}
            action={() => fakeVoiceSetters.camera(!settings.store.fakeCam)}
        />,
        <Menu.MenuCheckboxItem
            id="update-stream"
            key="update-stream"
            label="Fake Stream"
            checked={settings.store.fakeStream}
            action={() => fakeVoiceSetters.stream(!settings.store.fakeStream)}
        />,
        <Menu.MenuCheckboxItem
            id="update-game"
            key="update-game"
            label="Fake Game"
            checked={settings.store.fakeGame}
            action={() => fakeVoiceSetters.game(!settings.store.fakeGame)}
        />,
        <Menu.MenuCheckboxItem
            id="update-cut-mic"
            key="update-cut-mic"
            label="Cut Mic Transmission"
            checked={settings.store.cutMicTransmission}
            action={() => fakeVoiceSetters.cutmic(!settings.store.cutMicTransmission)}
        />
    ];
}

function FakeVoiceOptionToggleButton({ iconForeground, hideTooltips, nameplate }: UserAreaRenderProps) {
    const forceUpdate = useForceUpdater();
    const Icon = makeIcon(!faked);

    React.useEffect(() => {
        refreshButton = forceUpdate;
        return () => { refreshButton = null; };
    }, []);

    return (
        <div className="button-container">
            <UserAreaButton
                tooltipText={hideTooltips ? void 0 : faked ? "Disable Fake States" : "Enable Fake States"}
                icon={<Icon className={iconForeground} />}
                role="switch"
                aria-checked={faked}
                plated={nameplate != null}
                onContextMenu={e => ContextMenuApi.openContextMenu(e, () => <ContextMenu />)}
                onClick={() => {
                    setFakeVoiceEnabled(!faked);
                    forceUpdate();
                }}
            />
        </div>
    );
}

function ContextMenu() {
    const [enabled, setEnabled] = React.useState(faked);
    settings.use([
        "fakeMute",
        "fakeDeafen",
        "fakeStream",
        "fakeGame",
        "fakeCam",
        "cutMicTransmission"
    ]);

    return (
        <Menu.Menu
            navId="Voice-state-modifier"
            onClose={() => { }}
            aria-label="Voice state modifier"
        >
            <Menu.MenuGroup label="FAKE VOICE STATES">
                {renderFakeVoiceMenuItems(true, enabled, setEnabled)}
            </Menu.MenuGroup>
        </Menu.Menu>
    );
}

const VoiceChannelContext: NavContextMenuPatchCallback = (children, { channel }: { channel: Channel; }) => {
    if (!channel || (channel.type !== 2 && channel.type !== 13)) return;
    settings.use([
        "fakeMute",
        "fakeDeafen",
        "fakeStream",
        "fakeGame",
        "fakeCam",
        "cutMicTransmission"
    ]);

    children.splice(
        -1,
        0,
        <Menu.MenuItem
            id="fake-voice-context"
            key="fake-voice-context"
            label="Fake Voice"
        >
            {renderFakeVoiceMenuItems(true)}
        </Menu.MenuItem>
    );
};

export default definePlugin({
    name: "FakeVoiceStates",
    description: "Allows you to have a fake deafen, mute, stream, and game and adds a context-menu option to the button.",
    authors: [EquicordDevs.omaw, TestcordDevs.DavidHiFi],
    contextMenus: {
        "channel-context": VoiceChannelContext
    },
    userAreaButton: {
        icon: makeIcon(!faked),
        render: FakeVoiceOptionToggleButton
    },
    patches: [
        {
            find: ".merge({selfMute:",
            replacement: {
                match: /\i\.sessionId===\i(?=\?)/,
                replace: "$&&&!$self.shouldShowFakeVoiceState()"
            }
        },
        {
            find: "}voiceStateUpdate(",
            replacement: {
                match: /self_mute:([^,]+),self_deaf:([^,]+),self_video:([^,]+)/,
                replace: "self_mute:$self.toggle($1,'fakeMute'),self_deaf:$self.toggle($2,'fakeDeafen'),self_video:$self.toggle($3,'fakeCam')"
            }
        },
        {
            find: "OPEN_EMBEDDED_ACTIVITY,{location:",
            replacement: {
                match: /\i\._\.dispatch\(\i\.\i\.OPEN_EMBEDDED_ACTIVITY,\{location:\i,applicationId:\i,/,
                replace: "$self.shouldOpenEmbeddedActivity()&&$&"
            }
        },
        {
            find: "handleOpenActivityPopout",
            replacement: {
                match: /\i\.\i\(\i\.\i\.ACTIVITY_POPOUT,.{0,80}?defaultHeight:480\}\)/,
                replace: "$self.shouldOpenEmbeddedActivity()&&$&"
            }
        },
        {
            find: "CAMERA_PREVIEW]:",
            replacement: {
                // Skip registering the PiP window (and its switch) when faking hides it
                match: /switch\((\i\.set\(\i,\i\)),(\i)\)\{case (\i\.\i)\.VIDEO:/,
                replace: "switch((($2!==$3.ACTIVITY||$self.shouldOpenEmbeddedActivity())&&($2!==$3.VIDEO||$self.shouldOpenStreamPip()))?($1,$2):null){case $3.VIDEO:"
            }
        }
    ],
    flux: {
        VOICE_STATE_UPDATES({ voiceStates }: { voiceStates: VoiceState[]; }) {
            const myId = UserStore.getCurrentUser().id;
            const selected = SelectedChannelStore.getVoiceChannelId();
            if (!selected) return;

            scheduleMicCutoffSync(faked);

            if (!faked || !voiceStates.some(state => state.userId === myId && state.channelId === selected)) return;
            syncFakeGame();
            syncFakeStream();
        }
    },
    FakeVoiceOptionToggleButton: ErrorBoundary.wrap(FakeVoiceOptionToggleButton, { noop: true }),
    settings,
    start() {
        Object.assign(window, { __fakeVoice: fakeVoiceBridge });
    },
    stop() {
        Reflect.deleteProperty(window, "__fakeVoice");
        setFakeVoiceEnabled(false);
    },
    shouldOpenEmbeddedActivity: () => !(faked && settings.store.fakeGame),
    shouldOpenStreamPip: () => !(faked && fakeStreamActive),
    shouldShowFakeVoiceState: () => faked,
    toggle: (value: boolean, key: keyof typeof settings.store) => (faked ? settings.store[key] : value)
});
