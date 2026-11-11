/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { DataStore } from "@api/index";
import { definePluginSettings } from "@api/Settings";
import { UserAreaButton, UserAreaRenderProps } from "@api/UserArea";
import { getUserSettingLazy } from "@api/UserSettings";
import { EquicordDevs, TestcordDevs } from "@utils/constants";
import { Logger } from "@utils/Logger";
import definePlugin, { OptionType } from "@utils/types";
import { findByPropsLazy } from "@webpack";
import { ContextMenuApi, FluxDispatcher, MediaEngineStore, Menu, React, showToast, Toasts, UserStore, VoiceStateStore } from "@webpack/common";

type LoopbackActions = {
    setLoopback(tag: string, enabled: boolean): unknown;
    toggleSelfDeaf(): unknown;
};

// HaloCord's own mic test, exposed by the desktop userscript: plays the picked mic through HaloCord's chain.
interface HcMicSource { id: string; label: string; on: boolean; dev: string; }
interface HcMicTest {
    sources(): HcMicSource[];
    selected(): string;
    active(): string | null;
    start(id: string): Promise<boolean>;
    stop(): void;
}

const getHcMicTest = () => (window as Window & { __hcMicTest?: HcMicTest; }).__hcMicTest;

const VoiceActions = findByPropsLazy("setLoopback", "toggleSelfDeaf") as unknown as LoopbackActions | null;

// Discord's engine option setters live together; every menu row that uses one is hidden while the module is missing.
type EngineActions = {
    setNoiseCancellation?(enable: boolean, options?: { section?: string }): unknown;
    setEchoCancellation?(enable: boolean, options?: { section?: string }): unknown;
    setAutomaticGainControl?(enable: boolean, options?: { section?: string }): unknown;
};
const EngineActions = findByPropsLazy("setNoiseCancellation") as unknown as (EngineActions & Record<string, unknown>) | null;

function engineAction(name: keyof EngineActions): ((...args: unknown[]) => unknown) | undefined {
    try {
        const fn = (EngineActions as Record<string, unknown> | null)?.[name];
        return typeof fn === "function" ? fn as (...args: unknown[]) => unknown : undefined;
    } catch {
        return undefined;
    }
}

function readInputDevices(): Array<{ id: string; name: string; }> {
    try {
        return Object.values((MediaEngineStore as unknown as { getInputDevices?: () => Record<string, { id: string; name: string; }> }).getInputDevices?.() ?? {});
    } catch {
        return [];
    }
}

function currentInputDevice(): string | null {
    try {
        return (MediaEngineStore as unknown as { getInputDeviceId?: () => string }).getInputDeviceId?.() ?? null;
    } catch {
        return null;
    }
}

function readInputVolume(): number {
    try {
        const v = (MediaEngineStore as unknown as { getInputVolume?: () => number }).getInputVolume?.();
        return typeof v === "number" ? v : 100;
    } catch {
        return 100;
    }
}

const ShowCurrentGame = getUserSettingLazy<boolean>("status", "showCurrentGame")!;
const StatusSetting = getUserSettingLazy<string>("status", "status")!;

const settings = definePluginSettings({
    micLoopbackButton: {
        description: "Show Mic Test Loopback button",
        type: OptionType.BOOLEAN,
        default: true
    },
    offTheRadarButton: {
        description: "Show Off The Radar button",
        type: OptionType.BOOLEAN,
        default: true
    },
    deafenWhileTest: {
        description: "Deafen yourself while a mic test runs, and restore afterwards",
        type: OptionType.BOOLEAN,
        default: false
    }
});

const log = new Logger("BetterUserTools");

let loopbackActive = false;
let selfDeafenedByPlugin = false;
let missingModuleNotified = false;

const OTR_DATA_KEY = "BetterUserTools_OffTheRadar_State";
interface OffTheRadarState {
    enabled: boolean;
    prevStatus?: string;
    prevShowCurrentGame?: boolean;
}
let otrState: OffTheRadarState = { enabled: false };

function notifyMic(msg: string, type: Parameters<typeof showToast>[1]) {
    showToast(msg, type);
}

function getVoiceActions(): LoopbackActions | null {
    try {
        const actions = VoiceActions as LoopbackActions | null;
        if (!actions?.setLoopback || !actions?.toggleSelfDeaf) {
            if (!missingModuleNotified) {
                missingModuleNotified = true;
                notifyMic("Mic test controls unavailable (missing VoiceActions module)", Toasts.Type.FAILURE);
            }
            return null;
        }
        return actions;
    } catch (err) {
        if (!missingModuleNotified) {
            missingModuleNotified = true;
            notifyMic("Mic test controls unavailable (see console)", Toasts.Type.FAILURE);
        }
        log.error("Failed to resolve VoiceActions module", err);
        return null;
    }
}

function isInVoiceChannel() {
    const id = UserStore.getCurrentUser()?.id;
    if (!id) return false;
    const state = VoiceStateStore.getVoiceStateForUser(id);
    return Boolean(state?.channelId);
}

// The "deafen while testing" choice: take deafen when a test starts, hand it back when it ends.
async function beginTestDeafen() {
    const actions = getVoiceActions();
    if (!actions || !settings.store.deafenWhileTest) return;
    if (isInVoiceChannel() && !MediaEngineStore.isSelfDeaf()) {
        try {
            await actions.toggleSelfDeaf();
            selfDeafenedByPlugin = true;
        } catch (err) {
            log.error("Failed to deafen for mic test", err);
        }
    }
}

async function endTestDeafen() {
    const actions = getVoiceActions();
    if (selfDeafenedByPlugin && actions && MediaEngineStore.isSelfDeaf()) {
        try {
            await actions.toggleSelfDeaf();
        } catch (err) {
            log.error("Failed to restore deafen after mic test", err);
        }
    }
    selfDeafenedByPlugin = false;
}

async function enableLoopback() {
    const actions = getVoiceActions();
    if (!actions) return false;

    try {
        await actions.setLoopback("mic_test", true);
        loopbackActive = true;
        await beginTestDeafen();

        notifyMic("Mic test loopback enabled", Toasts.Type.SUCCESS);
        return true;
    } catch (err) {
        log.error("Failed to enable mic test loopback", err);
        notifyMic("Failed to start mic test loopback (see console)", Toasts.Type.FAILURE);
        return false;
    }
}

async function disableLoopback(silent = false) {
    const actions = getVoiceActions();
    if (!actions) {
        loopbackActive = false;
        selfDeafenedByPlugin = false;
        return;
    }

    try {
        await actions.setLoopback("mic_test", false);
        loopbackActive = false;
        await endTestDeafen();

        if (!silent) notifyMic("Mic test loopback disabled", Toasts.Type.SUCCESS);
    } catch (err) {
        log.error("Failed to disable mic test loopback", err);
        if (!silent) notifyMic("Failed to stop mic test loopback (see console)", Toasts.Type.FAILURE);
    }
}

async function startHcTest(hc: HcMicTest, id: string) {
    const source = hc.sources().find(s => s.id === id);
    if (!source) return;
    if (id !== "main" && !source.dev) {
        notifyMic(`Choose a device for ${source.label} in Voice & Video first`, Toasts.Type.FAILURE);
        return;
    }
    if (await hc.start(id)) {
        await beginTestDeafen();
        notifyMic(`Mic test: ${source.label}`, Toasts.Type.SUCCESS);
    } else if (hc.active() === null) notifyMic(`Mic test failed for ${source.label} (see console)`, Toasts.Type.FAILURE);
}

function MicTestMenu({ hc, onChange }: { hc: HcMicTest; onChange(): void; }) {
    const [, rerender] = React.useReducer(x => x + 1, 0);
    const update = () => { rerender(); onChange(); };
    const active = hc.active();
    const current = active ?? hc.selected();

    // Voice & Video page inputs, mirrored live so the menu shows what the engine has right now.
    const [devices, setDevices] = React.useState(readInputDevices);
    const [volume, setVolume] = React.useState(readInputVolume);
    React.useEffect(() => {
        const refresh = () => { setDevices(readInputDevices()); setVolume(readInputVolume()); };
        FluxDispatcher.subscribe("AUDIO_SET_INPUT_DEVICE", refresh);
        FluxDispatcher.subscribe("AUDIO_SET_INPUT_VOLUME", refresh);
        return () => {
            FluxDispatcher.unsubscribe("AUDIO_SET_INPUT_DEVICE", refresh);
            FluxDispatcher.unsubscribe("AUDIO_SET_INPUT_VOLUME", refresh);
        };
    }, []);

    const testMainDevice = (id: string) => {
        FluxDispatcher.dispatch({ type: "AUDIO_SET_INPUT_DEVICE", id });
        startHcTest(hc, "main").then(update);
    };

    const engineToggle = (name: keyof EngineActions, label: string, get: () => boolean) => {
        const set = engineAction(name);
        if (!set) return null;
        return (
            <Menu.MenuCheckboxItem
                key={name}
                id={`better-user-tools-mic-test-${name}`}
                label={label}
                checked={get()}
                action={() => { try { set(!get(), { section: "Mic Test" }); } catch (err) { log.error(`Failed to toggle ${label}`, err); } update(); }}
            />
        );
    };

    return (
        <Menu.Menu navId="better-user-tools-mic-test" onClose={ContextMenuApi.closeContextMenu} aria-label="Mic Test Loopback">
            {hc.sources().map(s => (
                <Menu.MenuRadioItem
                    key={s.id}
                    id={`better-user-tools-mic-test-${s.id}`}
                    group="better-user-tools-mic-test"
                    label={s.id !== "main" && !s.dev ? `${s.label} (no device chosen)` : s.label}
                    checked={current === s.id}
                    disabled={s.id !== "main" && !s.dev}
                    action={() => startHcTest(hc, s.id).then(update)}
                />
            ))}
            <Menu.MenuSeparator />
            {devices.length > 0 && (
                <Menu.MenuItem id="better-user-tools-mic-test-devices" label="Test input device">
                    {devices.map(d => (
                        <Menu.MenuRadioItem
                            key={d.id}
                            id={`better-user-tools-mic-test-dev-${d.id}`}
                            group="better-user-tools-mic-test-dev"
                            label={d.name}
                            checked={d.id === currentInputDevice()}
                            action={() => testMainDevice(d.id)}
                        />
                    ))}
                </Menu.MenuItem>
            )}
            <Menu.MenuCheckboxItem
                id="better-user-tools-mic-test-deafen"
                label="Deafen while testing"
                checked={settings.store.deafenWhileTest}
                action={() => { settings.store.deafenWhileTest = !settings.store.deafenWhileTest; update(); }}
            />
            <Menu.MenuGroup label="INPUT VOLUME">
                <Menu.MenuControlItem
                    id="better-user-tools-mic-test-volume"
                    control={(props, ref) => (
                        <Menu.MenuSliderControl
                            ref={ref}
                            {...props}
                            minValue={0}
                            maxValue={100}
                            value={volume}
                            onChange={v => {
                                setVolume(v);
                                FluxDispatcher.dispatch({ type: "AUDIO_SET_INPUT_VOLUME", volume: v });
                            }}
                        />
                    )}
                />
            </Menu.MenuGroup>
            {engineToggle("setNoiseCancellation", "Noise suppression", () => (MediaEngineStore as unknown as { getNoiseSuppression?: () => boolean }).getNoiseSuppression?.() ?? true)}
            {engineToggle("setEchoCancellation", "Echo cancellation", () => (MediaEngineStore as unknown as { getEchoCancellation?: () => boolean }).getEchoCancellation?.() ?? true)}
            {engineToggle("setAutomaticGainControl", "Automatic gain control", () => (MediaEngineStore as unknown as { getAutomaticGainControl?: () => boolean }).getAutomaticGainControl?.() ?? true)}
            <Menu.MenuSeparator />
            <Menu.MenuItem
                id="better-user-tools-mic-test-stop"
                label="Stop Mic Test"
                disabled={active === null}
                action={() => {
                    hc.stop();
                    endTestDeafen();
                    notifyMic("Mic test stopped", Toasts.Type.SUCCESS);
                    update();
                }}
            />
        </Menu.Menu>
    );
}

function MicLoopbackIcon({ active, className }: { active: boolean; className?: string; }) {
    const lineLength = 30;
    const lineStyle: React.CSSProperties = {
        strokeDasharray: lineLength,
        strokeDashoffset: active ? lineLength : 0,
        transition: "stroke-dashoffset 0.1s ease-in-out",
    };

    return (
        <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
            <mask id="BetterUserToolsMicLoopbackLine">
                <rect width="100%" height="100%" fill="#ffffff" />
                <line
                    className="blackLine"
                    x1="22"
                    y1="2"
                    x2="2"
                    y2="22"
                    stroke="#000000"
                    strokeWidth="6"
                    strokeLinecap="round"
                    style={lineStyle}
                />
            </mask>

            <g mask="url(#BetterUserToolsMicLoopbackLine)">
                <rect
                    x="9"
                    y="4"
                    width="6"
                    height="10"
                    rx="3"
                    stroke="currentColor"
                    strokeWidth="1.6"
                />
                <path
                    d="M7 10a5 5 0 0 0 10 0"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                />
                <path
                    d="M12 15v4m-3 1h6"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                />
                <path
                    d="M6 7c-1.333 1.333-1.333 4.667 0 6m12-6c1.333 1.333 1.333 4.667 0 6"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeDasharray="2 2"
                />
            </g>

            <line
                x1="22"
                y1="2"
                x2="2"
                y2="22"
                stroke="var(--status-danger, currentColor)"
                strokeWidth="2"
                strokeLinecap="round"
                style={lineStyle}
            />
        </svg>
    );
}

function MicLoopbackButton({ iconForeground, hideTooltips, nameplate }: UserAreaRenderProps) {
    const [, forceUpdate] = React.useReducer(x => x + 1, 0);

    const hc = getHcMicTest();
    const active = hc ? hc.active() !== null : loopbackActive;

    const handleToggle = React.useCallback(async () => {
        const hc = getHcMicTest();
        if (hc) {
            if (hc.active() !== null) {
                hc.stop();
                endTestDeafen();
                notifyMic("Mic test stopped", Toasts.Type.SUCCESS);
            } else {
                await startHcTest(hc, hc.selected());
            }
        } else if (loopbackActive) {
            await disableLoopback();
        } else {
            await enableLoopback();
        }
        forceUpdate();
    }, []);

    return (
        <UserAreaButton
            tooltipText={hideTooltips ? void 0 : "Mic Test Loopback"}
            icon={<MicLoopbackIcon active={active} className={iconForeground} />}
            role="switch"
            redGlow={!active}
            aria-checked={active}
            onClick={handleToggle}
            onContextMenu={hc ? e => ContextMenuApi.openContextMenu(e, () => <MicTestMenu hc={hc} onChange={forceUpdate} />) : void 0}
            plated={nameplate != null}
            className={`button__201d5 wrapper__201d5 vc-betterusertools-btn${active ? " danger" : ""}`}
        />
    );
}

function RadarIcon({ active, className }: { active: boolean; className?: string; }) {
    const lineLength = 30;
    const lineStyle: React.CSSProperties = {
        strokeDasharray: lineLength,
        strokeDashoffset: active ? lineLength : 0,
        transition: "stroke-dashoffset 0.1s ease-in-out",
    };

    return (
        <svg
            className={className}
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
        >
            <mask id="BetterUserToolsRadarLine">
                <rect width="100%" height="100%" fill="#ffffff" />
                <line
                    className="blackLine"
                    x1="22"
                    y1="2"
                    x2="2"
                    y2="22"
                    stroke="#000000"
                    strokeWidth="6"
                    strokeLinecap="round"
                    style={lineStyle}
                />
            </mask>

            <g mask="url(#BetterUserToolsRadarLine)">
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M11.291 11.295a1 1 0 0 0 .709 1.705v8c2.488 0 4.74 -1.01 6.37 -2.642m1.675 -2.319a8.962 8.962 0 0 0 .955 -4.039h-5" />
                <path d="M16 9a5 5 0 0 0 -5.063 -1.88m-2.466 1.347a5 5 0 0 0 .53 7.535" />
                <path d="M20.486 9a9 9 0 0 0 -12.525 -5.032m-2.317 1.675a9 9 0 0 0 3.36 14.852" />
            </g>

            <line
                x1="22"
                y1="2"
                x2="2"
                y2="22"
                stroke="var(--status-danger, currentColor)"
                strokeWidth="2"
                strokeLinecap="round"
                style={lineStyle}
            />
        </svg>
    );
}

async function loadOtrState() {
    otrState = await DataStore.get<OffTheRadarState>(OTR_DATA_KEY) || { enabled: false };
}

function persistOtrState() {
    return DataStore.set(OTR_DATA_KEY, otrState);
}

async function applyOtrEnable() {
    if (!ShowCurrentGame || !StatusSetting) return;
    const currentStatus = StatusSetting.getSetting?.();
    const currentShow = ShowCurrentGame.getSetting?.();

    if (otrState.prevStatus === undefined) otrState.prevStatus = currentStatus;
    if (otrState.prevShowCurrentGame === undefined) otrState.prevShowCurrentGame = currentShow;

    await Promise.all([
        ShowCurrentGame.updateSetting(false),
        StatusSetting.updateSetting("idle")
    ]);
    otrState.enabled = true;
    await persistOtrState();
}

async function applyOtrDisable() {
    if (!ShowCurrentGame || !StatusSetting) return;
    const tasks: Array<Promise<unknown>> = [];
    tasks.push(ShowCurrentGame.updateSetting(otrState.prevShowCurrentGame ?? true));
    if (otrState.prevStatus) tasks.push(StatusSetting.updateSetting(otrState.prevStatus));
    otrState.enabled = false;
    await Promise.all(tasks);
    await persistOtrState();
}

function OffTheRadarButton({ iconForeground, hideTooltips, nameplate }: UserAreaRenderProps) {
    const [, forceUpdate] = React.useReducer(x => x + 1, 0);

    const toggle = async () => {
        try {
            if (otrState.enabled) {
                await applyOtrDisable();
            } else {
                await applyOtrEnable();
            }
            forceUpdate();
        } catch (err) {
            log.error("OffTheRadar toggle failed", err);
            showToast("OffTheRadar toggle failed", Toasts.Type.FAILURE);
        }
    };

    return (
        <UserAreaButton
            tooltipText={hideTooltips ? void 0 : otrState.enabled ? "Off The Radar (on)" : "Off The Radar (off)"}
            icon={<RadarIcon active={otrState.enabled} className={iconForeground} />}
            role="switch"
            redGlow={!otrState.enabled}
            aria-checked={otrState.enabled}
            plated={nameplate != null}
            onClick={toggle}
            className={`button__201d5 wrapper__201d5 vc-betterusertools-btn${otrState.enabled ? " danger" : ""}`}
        />
    );
}

function renderMicLoopbackButton({ iconForeground, hideTooltips, nameplate }: UserAreaRenderProps) {
    const { micLoopbackButton } = settings.store;
    return micLoopbackButton ? <MicLoopbackButton iconForeground={iconForeground} hideTooltips={hideTooltips} nameplate={nameplate} /> : null;
}

function renderOffTheRadarButton({ iconForeground, hideTooltips, nameplate }: UserAreaRenderProps) {
    const { offTheRadarButton } = settings.store;
    return offTheRadarButton ? <OffTheRadarButton iconForeground={iconForeground} hideTooltips={hideTooltips} nameplate={nameplate} /> : null;
}

const styles = `
.vc-betterusertools-btn { color: var(--interactive-normal); }
`;

export default definePlugin({
    id: "BetterUserTools",
    name: "BetterUserTools",
    description: "Adds mic test shortcut button and off-the-radar button to the user panel, both are toggles. MicTest Simply lets you test your mic without entering the settings page; right-click it to pick which HaloCord microphone to test.OffTheRadar Enables idle status and hides activity while enabled. just added before equicord, if the original gets added to equicord I will delete this one.",
    tags: ["Utility", "Customisation", "Shortcuts"],
    authors: [EquicordDevs.Benjii, TestcordDevs.x2b, TestcordDevs.nnenaza, TestcordDevs.DavidHiFi],
    dependencies: ["UserSettingsAPI"],
    settings,
    styles,

    async start() {
        await loadOtrState();
        if (otrState.enabled) await applyOtrEnable();

        Vencord.Api.UserArea.addUserAreaButton("better-user-tools-mic-loopback", renderMicLoopbackButton);
        Vencord.Api.UserArea.addUserAreaButton("better-user-tools-off-the-radar", renderOffTheRadarButton);
    },

    stop() {
        void disableLoopback(true);
        getHcMicTest()?.stop();
        loopbackActive = false;
        selfDeafenedByPlugin = false;
        missingModuleNotified = false;

        if (otrState.enabled) void applyOtrDisable();

        Vencord.Api.UserArea.removeUserAreaButton("better-user-tools-mic-loopback");
        Vencord.Api.UserArea.removeUserAreaButton("better-user-tools-off-the-radar");
    },
});
