/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { NavContextMenuPatchCallback } from "@api/ContextMenu";
import { UserAreaButton, UserAreaRenderProps } from "@api/UserArea";
import ErrorBoundary from "@components/ErrorBoundary";
import { EquicordDevs } from "@utils/constants";
import { useForceUpdater } from "@utils/react";
import definePlugin from "@utils/types";
import type { Channel, VoiceState } from "@vencord/discord-types";
import { findByCode, findByProps, findStore, findStoreLazy } from "@webpack";
import { ChannelStore, ContextMenuApi, MediaEngineStore, Menu, PermissionsBits, PermissionStore, React, SelectedChannelStore, UserStore, VoiceActions } from "@webpack/common";

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

async function startActivity(channelId: string) {
    const activityApi = findByProps("su", "_H");
    if (!activityApi?.su) return;

    await activityApi.su({
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

function hasFakeStream() {
    const connectionStore = findStore("StreamRTCConnectionStore");
    return connectionStore?.getAllActiveStreamKeys?.().length > 0;
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

async function startStream() {
    const startStream = findByCode('type:"STREAM_START"');
    const stopStream = findByCode('type:"STREAM_STOP"');
    const ConnectionStore = findStore("StreamRTCConnectionStore");

    const selected = SelectedChannelStore.getVoiceChannelId();
    if (!selected) return;

    const channel = ChannelStore.getChannel(selected);

    if (settings.store.fakeStream) {
        startStream(channel.guild_id, selected, {
            pid: null,
            sourceId: null,
            sourceName: null,
            audioSourceId: null,
            sound: false,
            previewDisabled: true
        });
    } else {
        for (const streamKey of ConnectionStore.getAllActiveStreamKeys()) {
            stopStream(streamKey, { streamKey, appContext: "app" });
            break;
        }
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

    if (!enabled && settings.store.fakeGame) {
        leaveActivity(channel?.id);
    }

    if (!channel) {
        fakeStreamActive = false;
        scheduleMicCutoffSync(false);
        return;
    }

    fakeStreamActive = enabled && settings.store.fakeStream && PermissionStore.can(STREAM, channel);

    if (fakeStreamActive) {
        startStream();
    }

    if (settings.store.fakeGame && enabled && canUseFakeActivity(channel)) {
        void startActivity(channel.id);
    }

    if (settings.store.fakeCam && canUseFakeCamera(channel) && MediaEngineStore.isVideoEnabled() !== enabled) {
        VoiceActions.setVideoEnabled(enabled);
    }

    if (!enabled) {
        const ConnectionStore = findStore("StreamRTCConnectionStore");
        const stopStream = findByCode('type:"STREAM_STOP"');
        for (const streamKey of ConnectionStore.getAllActiveStreamKeys()) {
            stopStream(streamKey, { streamKey, appContext: "app" });
            break;
        }
    }

    if (settings.store.fakeMute || settings.store.fakeDeafen || settings.store.fakeCam) {
        syncFakeVoiceState();
    }

    scheduleMicCutoffSync(enabled, enabled ? 450 : 0);
}

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
            action={() => {
                settings.store.fakeMute = !settings.store.fakeMute;
                if (faked) syncFakeVoiceState();
            }}
        />,
        <Menu.MenuCheckboxItem
            id="update-deafen"
            key="update-deafen"
            label="Fake Deafen"
            checked={settings.store.fakeDeafen}
            action={() => {
                settings.store.fakeDeafen = !settings.store.fakeDeafen;
                if (faked) syncFakeVoiceState();
            }}
        />,
        <Menu.MenuCheckboxItem
            id="update-camera"
            key="update-camera"
            label="Fake Camera"
            checked={settings.store.fakeCam}
            action={() => {
                setFakeCameraEnabled(!settings.store.fakeCam);
            }}
        />,
        <Menu.MenuCheckboxItem
            id="update-stream"
            key="update-stream"
            label="Fake Stream"
            checked={settings.store.fakeStream}
            action={() => {
                settings.store.fakeStream = !settings.store.fakeStream;
            }}
        />,
        <Menu.MenuCheckboxItem
            id="update-game"
            key="update-game"
            label="Fake Game"
            checked={settings.store.fakeGame}
            action={() => {
                settings.store.fakeGame = !settings.store.fakeGame;
            }}
        />,
        <Menu.MenuCheckboxItem
            id="update-cut-mic"
            key="update-cut-mic"
            label="Cut Mic Transmission"
            checked={settings.store.cutMicTransmission}
            action={() => {
                settings.store.cutMicTransmission = !settings.store.cutMicTransmission;
                scheduleMicCutoffSync(faked);
            }}
        />
    ];
}

function FakeVoiceOptionToggleButton({ iconForeground, hideTooltips, nameplate }: UserAreaRenderProps) {
    const forceUpdate = useForceUpdater();
    const Icon = makeIcon(!faked);

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
    authors: [EquicordDevs.omaw],
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
                match: /\i\.open\(\i\.\i\.ACTIVITY_POPOUT,.{0,80}?defaultHeight:480\}\)/,
                replace: "$self.shouldOpenEmbeddedActivity()&&$&"
            }
        },
        {
            find: "CAMERA_PREVIEW]:",
            replacement: {
                match: /d\.set\(\i,\i\),(\i)===(\i\.\i)\.VIDEO.{0,100}?\2\.HAVEN&&null==\i&&\(\i=\i\)/,
                replace: "(($1!==$2.ACTIVITY||$self.shouldOpenEmbeddedActivity())&&($1!==$2.VIDEO||$self.shouldOpenStreamPip()))&&($&)"
            }
        }
    ],
    flux: {
        async VOICE_STATE_UPDATES({ voiceStates }: { voiceStates: VoiceState[]; }) {
            const myId = UserStore.getCurrentUser().id;
            const selected = SelectedChannelStore.getVoiceChannelId();
            if (!selected) return;
            const channel = ChannelStore.getChannel(selected);
            const myVoiceState = voiceStates.find(state => state.userId === myId && state.channelId === selected);

            scheduleMicCutoffSync(faked);

            if (settings.store.fakeGame && faked && myVoiceState && canUseFakeActivity(channel) && !hasFakeActivity(selected)) {
                void startActivity(selected);
            }

            if (settings.store.fakeStream && faked && myVoiceState && PermissionStore.can(STREAM, channel)) {
                fakeStreamActive = true;

                if (!hasFakeStream()) {
                    const startStream = findByCode('type:"STREAM_START"');
                    startStream(channel.guild_id, selected, {
                        pid: null,
                        sourceId: null,
                        sourceName: null,
                        audioSourceId: null,
                        sound: false,
                        previewDisabled: true
                    });
                }
            }
        }
    },
    FakeVoiceOptionToggleButton: ErrorBoundary.wrap(FakeVoiceOptionToggleButton, { noop: true }),
    settings,
    stop() {
        setFakeVoiceEnabled(false);
    },
    shouldOpenEmbeddedActivity: () => !(faked && settings.store.fakeGame),
    shouldOpenStreamPip: () => !(faked && fakeStreamActive),
    shouldShowFakeVoiceState: () => faked,
    toggle: (value: boolean, key: keyof typeof settings.store) => (faked ? settings.store[key] : value)
});
