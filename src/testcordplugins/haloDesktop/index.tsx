/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { isPluginEnabled, setPluginEnabled } from "@api/PluginManager";
import { useSettings } from "@api/Settings";
import { Button } from "@components/Button";
import ErrorBoundary from "@components/ErrorBoundary";
import { changeNeedsRestart, HaloRestartButton } from "@components/HaloRestart";
import { HaloRow, HaloSection, HaloSwitchRow } from "@components/HaloUI";
import { openPluginModal } from "@components/settings/tabs/plugins/PluginModal";
import SettingsPlugin from "@plugins/_core/settings";
import { TestcordDevs } from "@utils/constants";
import definePlugin from "@utils/types";
import { i18n, Select, useEffect, useState } from "@webpack/common";
import type { ComponentType } from "react";

import Plugins from "~plugins";

// Shell side: desktop/shell/hc-desktop.js, exposed by the preload as window.HaloCordDesktop.
interface DesktopPrefs {
    openOnStartup: boolean;
    startMinimized: boolean;
    minimizeToTray: boolean;
    startupMethod: "shortcut" | "task";
    build: "stable" | "ptb" | "canary";
    canAutostart: boolean;
}

const native = () => window.HaloCordDesktop as undefined | {
    get(): Promise<DesktopPrefs>;
    set(key: string, value: unknown): Promise<boolean>;
};

// Discord's own wording for these rows, in the user's language, with the app name swapped.
const discordString = (key: string, fallback: string) => {
    try { return i18n.intl.string(i18n.t[key]).replace(/Discord/g, "HaloCord"); } catch { return fallback; }
};

function useDesktopPrefs() {
    const [prefs, setPrefs] = useState<DesktopPrefs | null>(null);
    const load = () => native()?.get().then(setPrefs);
    useEffect(() => { load(); }, []);
    const set = (key: keyof DesktopPrefs, value: unknown) => native()?.set(key, value).then(load);
    return [prefs, set] as const;
}

const STARTUP_METHODS = [
    { label: "Shortcut", value: "shortcut" },
    { label: "Scheduled task", value: "task" }
];

function WindowsSettings() {
    const [prefs, set] = useDesktopPrefs();
    if (!prefs) return null;
    const startup = prefs.canAutostart;
    return (
        <HaloSection>
            <HaloSwitchRow
                title={discordString("3BeZti", "Automatically open HaloCord when your computer starts up")}
                description={startup ? undefined : "Only the installed HaloCord can open at startup."}
                value={prefs.openOnStartup}
                disabled={!startup}
                onChange={v => set("openOnStartup", v)}
            />
            <HaloSwitchRow
                title={discordString("GfBL83", "Start HaloCord minimised")}
                description={discordString("XGyhhc", "Start HaloCord in the background, out of your way.")}
                value={prefs.openOnStartup && prefs.startMinimized}
                disabled={!prefs.openOnStartup}
                onChange={v => set("startMinimized", v)}
            />
            <HaloRow
                title="Startup method"
                description="A shortcut in your Startup folder, or a scheduled task, which Windows runs sooner after you sign in."
            >
                <div style={{ width: 180 }}>
                    <Select
                        options={STARTUP_METHODS}
                        closeOnSelect
                        isDisabled={!prefs.openOnStartup}
                        isSelected={v => v === prefs.startupMethod}
                        serialize={String}
                        select={v => v !== prefs.startupMethod && set("startupMethod", v)}
                    />
                </div>
            </HaloRow>
            <HaloSwitchRow
                title={discordString("dJ5MUh", "Minimise HaloCord to System Tray")}
                description={discordString("nQavHr", "Clicking X minimises HaloCord instead of closing it completely.")}
                value={prefs.minimizeToTray}
                onChange={v => set("minimizeToTray", v)}
            />
        </HaloSection>
    );
}

interface PassiveVoiceUpdate {
    guildId: string;
    voiceStates: { userId: string; }[];
    removedVoiceStateUsers: string[];
}

type VoiceStatesHandler = (action: { voiceStates: object[]; }) => boolean;

const BUILDS = [
    { label: "Stable", value: "stable" },
    { label: "PTB", value: "ptb" },
    { label: "Canary", value: "canary" }
];

const BUILD_KEY = "halocord.desktop.build";
const buildLabel = (build: string) => `Switching to ${BUILDS.find(b => b.value === build)?.label ?? build}`;

function BuildSelector() {
    const [prefs, set] = useDesktopPrefs();
    if (!prefs) return null;
    return (
        <HaloSection>
            <HaloRow
                title={<>Discord build<HaloRestartButton label={buildLabel(prefs.build)} pendingKey={BUILD_KEY} /></>}
                description="Which Discord web build HaloCord loads. Each build is its own site, so you log in again the first time and plugin data kept in the page (like the voice panel) starts fresh there."
            >
                <div style={{ width: 160 }}>
                    <Select
                        options={BUILDS}
                        closeOnSelect
                        isSelected={v => v === prefs.build}
                        serialize={String}
                        select={async v => {
                            if (v === prefs.build) return;
                            const from = prefs.build;
                            await set("build", v);
                            changeNeedsRestart(BUILD_KEY, from, v, buildLabel(v));
                        }}
                    />
                </div>
            </HaloRow>
        </HaloSection>
    );
}

function togglePlugin(name: string, enabled: boolean, title: string) {
    if (setPluginEnabled(name, enabled)) changeNeedsRestart(`plugins.${name}.enabled`, !enabled, enabled, title);
}

const IDLE_TITLE = "Stay in calls when idle";
const REJOIN_TITLE = "Rejoin calls after a restart";

// DisableCallIdle and VoiceRejoin are hidden from the plugin list; they are switched here instead.
function CallSettings() {
    useSettings(["plugins.DisableCallIdle.enabled", "plugins.VoiceRejoin.enabled"]);
    const rejoin = isPluginEnabled("VoiceRejoin");
    return (
        <HaloSection>
            <HaloSwitchRow
                title={IDLE_TITLE}
                description="Stops Discord from dropping you from a DM call after 3 minutes alone or moving you to the AFK channel."
                value={isPluginEnabled("DisableCallIdle")}
                onChange={v => togglePlugin("DisableCallIdle", v, IDLE_TITLE)}
            >
                <HaloRestartButton label={IDLE_TITLE} pendingKey="plugins.DisableCallIdle.enabled" />
            </HaloSwitchRow>
            <HaloSwitchRow
                title={REJOIN_TITLE}
                description="Puts you back in the DM or server call you were in when HaloCord restarts."
                value={rejoin}
                onChange={v => togglePlugin("VoiceRejoin", v, REJOIN_TITLE)}
            >
                <HaloRestartButton label={REJOIN_TITLE} pendingKey="plugins.VoiceRejoin.enabled" />
                {rejoin && <Button variant="secondary" size="small" className="hc-ui-btn-quiet" onClick={() => openPluginModal(Plugins.VoiceRejoin)}>Options</Button>}
            </HaloSwitchRow>
        </HaloSection>
    );
}

// Puts a category at the top, the end, or right before the first category whose key matches `before`,
// in one of Discord's own settings panels (Settings plugin layoutHooks).
function addCategory(panelKey: string, key: string, title: () => string, terms: string[], Component: ComponentType, atEnd = false, before?: RegExp) {
    const Wrapped = () => <ErrorBoundary noop><Component /></ErrorBoundary>;
    SettingsPlugin.layoutHooks[panelKey] = (layout, types) => {
        if (!native() || layout.some(n => n?.key === key)) return;
        const at = before ? layout.findIndex(n => n?.type === types.CATEGORY && before.test(n.key ?? "")) : -1;
        const index = at >= 0 ? at : atEnd ? layout.length : 0;
        layout.splice(index, 0, {
            type: types.CATEGORY,
            key,
            useTitle: title,
            buildLayout: () => [{
                type: types.CUSTOM,
                key: key + "_custom",
                Component: Wrapped,
                useSearchTerms: () => terms
            }]
        });
    };
}

export default definePlugin({
    name: "HaloDesktop",
    description: "Desktop client behaviour for HaloCord: startup and tray settings, Discord build choice, call options in Voice & Video, update notice, no web download prompts.",
    authors: [TestcordDevs.DavidHiFi],
    required: true,
    hidden: true,

    patches: [
        // "Download Apps" button at the bottom of the server list (same patch as Vesktop's, so it
        // stacks with JunkCleanup's copy).
        {
            find: 'id:"app-download-button"',
            replacement: {
                match: /return(?=.{0,50}id:"app-download-button")/,
                replace: "return null;return"
            }
        },
        // "Get the desktop app" notice bar.
        {
            find: ".DOWNLOAD_NAG]:{predicate:",
            replacement: {
                match: /(\.DOWNLOAD_NAG\]:\{predicate:\(\)=>)/,
                replace: "$1!1&&"
            }
        },
        // "Download the Discord App" step in a new server's welcome checklist.
        {
            find: 'key:"download",iconUrl:',
            replacement: {
                match: /\(0,\i\.\i\)\(\)(?=&&\i\.push\(\{key:"download")/,
                replace: "!1"
            }
        },
        // A new web build only lights the green update icon if Discord marks it required, or once
        // a week on Stable. Show it for every new build; clicking it reloads (asking first in voice).
        {
            find: "lastNonRequiredUpdateShown",
            replacement: {
                match: /if\(\i\.body\.required\|\|/,
                replace: "if(!0||"
            }
        },
        // The stream store only listens to VOICE_STATE_UPDATES, so passive guilds never clear a
        // stream when its owner leaves voice: ghost avatars in the guild tooltip and Active Now.
        {
            find: 'displayName="ApplicationStreamingStore"',
            replacement: {
                match: /VOICE_STATE_UPDATES:function\(/,
                replace: "PASSIVE_UPDATE_V2:e=>$self.passiveStreams(e),VOICE_STATE_UPDATES:$self.streamVoiceStateUpdates=function("
            }
        }
    ],

    streamVoiceStateUpdates: null as VoiceStatesHandler | null,

    passiveStreams({ guildId, voiceStates, removedVoiceStateUsers }: PassiveVoiceUpdate) {
        return this.streamVoiceStateUpdates?.({
            voiceStates: [
                ...voiceStates.map(s => ({ ...s, guildId })),
                ...removedVoiceStateUsers.map(userId => ({ userId, guildId, channelId: null }))
            ]
        }) ?? false;
    },

    start() {
        const general = () => discordString("cg6ltt", "General");
        addCategory("system_panel", "halocord_windows_category", general,
            ["Windows Settings", "startup", "tray", "minimise", "minimize"], WindowsSettings);
        addCategory("developer_options_panel", "halocord_build_category", () => "Discord Build",
            ["Discord Build", "Stable", "PTB", "Canary"], BuildSelector);
        addCategory("voice_and_video_panel", "halocord_calls_category", () => "Calls",
            ["Calls", "idle", "AFK", "rejoin", "reconnect"], CallSettings, true, /advanced/i);
    }
});
