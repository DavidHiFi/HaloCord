/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { isPluginEnabled, setPluginEnabled } from "@api/PluginManager";
import { definePluginSettings, useSettings } from "@api/Settings";
import ErrorBoundary from "@components/ErrorBoundary";
import { changeNeedsRestart, HaloRestartButton } from "@components/HaloRestart";
import { HaloRow, HaloSection, HaloSwitchRow } from "@components/HaloUI";
import SettingsPlugin from "@plugins/_core/settings";
import { RejoinSettings, TileSettings } from "@testcordplugins/haloCalls/CallSettings";
import { VuMeterSettings } from "@testcordplugins/VoiceVUMeters";
import { TestcordDevs } from "@utils/constants";
import definePlugin, { OptionType } from "@utils/types";
import { findStoreLazy } from "@webpack";
import { FluxDispatcher, i18n, Select, SelectedChannelStore, useEffect, useRef, useState, useStateFromStores } from "@webpack/common";
import type { ComponentType } from "react";

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

// DisableCallIdle is hidden from the plugin list and switched here; rejoin and tiles are HaloCalls, built in.
function CallSettings() {
    useSettings(["plugins.DisableCallIdle.enabled"]);
    return (
        <>
            <HaloSection>
                <HaloSwitchRow
                    title={IDLE_TITLE}
                    description="Stops Discord from dropping you from a DM call after 3 minutes alone or moving you to the AFK channel."
                    value={isPluginEnabled("DisableCallIdle")}
                    onChange={v => togglePlugin("DisableCallIdle", v, IDLE_TITLE)}
                >
                    <HaloRestartButton label={IDLE_TITLE} pendingKey="plugins.DisableCallIdle.enabled" />
                </HaloSwitchRow>
                <RejoinSettings />
            </HaloSection>
            <TileSettings />
        </>
    );
}

// The stream info box's borders are switched by attributes on <html>, read by PanelLayout's halo.css.
function applyStreamInfoLook() {
    const root = document.documentElement;
    root.toggleAttribute("data-hc-si-no-border", !settings.store.streamInfoBorder);
    root.toggleAttribute("data-hc-si-no-hover", !settings.store.streamInfoHoverBorder);
}

const settings = definePluginSettings({
    // Titles of the Voice & Video categories folded shut with their chevron
    collapsedVoiceCategories: { type: OptionType.STRING, default: "[]", description: "", hidden: true },
    streamInfoAlways: { type: OptionType.BOOLEAN, default: false, description: "Show the stream info box on every stream, not only the one under the pointer", hidden: true },
    streamInfoBorder: { type: OptionType.BOOLEAN, default: true, description: "Resting border around the stream info box", hidden: true, onChange: applyStreamInfoLook },
    streamInfoHoverBorder: { type: OptionType.BOOLEAN, default: true, description: "Gradient border on the stream info box on hover", hidden: true, onChange: applyStreamInfoLook }
});

// Discord's call tile participant: type 0 is a Go Live stream (1 hidden stream, 2 user, 3 activity).
const STREAM_PARTICIPANT = 0;
interface StreamParticipant { type?: number; stream?: { channelId?: string | null; }; }

const DeveloperOptionsStore = findStoreLazy("DeveloperOptionsStore") as { isStreamInfoOverlayEnabled?: boolean; };

function StreamInfoCategory() {
    const s = settings.use(["streamInfoAlways", "streamInfoBorder", "streamInfoHoverBorder"]);
    const on = useStateFromStores([DeveloperOptionsStore as never], () => DeveloperOptionsStore.isStreamInfoOverlayEnabled === true);
    return (
        <>
            <CategoryFolds />
            <HaloSection>
                <HaloSwitchRow
                    title="Stream info overlay"
                    description="Resolution, frame rate, bitrate and codec in a box over streams and cameras. The same switch as Discord's own under Diagnostics."
                    value={on}
                    onChange={v => FluxDispatcher.dispatch({ type: "DEVELOPER_OPTIONS_UPDATE_SETTINGS", settings: { isStreamInfoOverlayEnabled: v } })}
                />
                <HaloSwitchRow
                    title="Always show overlay"
                    description="Keep the box on every stream. Off, it only shows on the stream under the pointer."
                    value={s.streamInfoAlways}
                    disabled={!on}
                    onChange={v => settings.store.streamInfoAlways = v}
                />
                <HaloSwitchRow
                    title="Resting border"
                    description="A thin border around the box."
                    value={s.streamInfoBorder}
                    disabled={!on}
                    onChange={v => settings.store.streamInfoBorder = v}
                />
                <HaloSwitchRow
                    title="Hover border"
                    description="The blue to mauve gradient border when the pointer is over the box."
                    value={s.streamInfoHoverBorder}
                    disabled={!on}
                    onChange={v => settings.store.streamInfoHoverBorder = v}
                />
            </HaloSection>
        </>
    );
}

const collapsed = (): string[] => { try { return JSON.parse(settings.store.collapsedVoiceCategories); } catch { return []; } };

// Gives every titled category on the open settings page a chevron that folds it to its title. Discord
// re-renders the page freely, so an observer puts the chevrons and the folded state back.
function CategoryFolds() {
    const ref = useRef<HTMLSpanElement>(null);
    useEffect(() => {
        const list = ref.current?.closest('[class*="categories_"]');
        if (!list || list.hasAttribute("data-hc-folds")) return;
        list.setAttribute("data-hc-folds", "");
        const apply = () => {
            const shut = collapsed();
            for (const category of list.children) {
                const title = category.firstElementChild;
                const heading = title?.querySelector("h2");
                if (!title || !heading) continue;
                const name = heading.textContent?.trim() ?? "";
                const isShut = shut.includes(name);
                if (category.hasAttribute("data-hc-folded") !== isShut) category.toggleAttribute("data-hc-folded", isShut);
                let button = title.querySelector<HTMLButtonElement>(":scope > .hc-fold");
                if (!button) {
                    button = document.createElement("button");
                    button.type = "button";
                    button.className = "hc-fold";
                    button.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" d="m6 9 6 6 6-6"/></svg>';
                    button.onclick = () => {
                        const now = collapsed().filter(n => n !== name);
                        if (!category.hasAttribute("data-hc-folded")) now.push(name);
                        settings.store.collapsedVoiceCategories = JSON.stringify(now);
                        apply();
                    };
                    heading.style.cursor = "pointer";
                    heading.onclick = () => button?.click();
                    title.append(button);
                }
                const label = (isShut ? "Expand " : "Collapse ") + name;
                if (button.getAttribute("aria-label") !== label) {
                    button.setAttribute("aria-label", label);
                    button.setAttribute("aria-expanded", String(!isShut));
                }
            }
        };
        apply();
        const observer = new MutationObserver(apply);
        observer.observe(list, { childList: true, subtree: true });
        return () => { observer.disconnect(); list.removeAttribute("data-hc-folds"); };
    }, []);
    return <span ref={ref} hidden />;
}

function VuCategory() {
    return <><CategoryFolds /><VuMeterSettings /></>;
}

function CallsCategory() {
    return <><CategoryFolds /><CallSettings /></>;
}

// Puts a category at the top, the end, or right before the first category whose key matches `before`,
// in one of Discord's own settings panels (Settings plugin layoutHooks).
function addCategory(panelKey: string, key: string, title: () => string, terms: string[], Component: ComponentType, atEnd = false, before?: RegExp) {
    const Wrapped = () => <ErrorBoundary noop><Component /></ErrorBoundary>;
    // Several categories can join one panel: each hook runs the one before it.
    const previous = SettingsPlugin.layoutHooks[panelKey];
    SettingsPlugin.layoutHooks[panelKey] = (layout, types) => {
        previous?.(layout, types);
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
    settings,
    required: true,
    hidden: true,

    patches: [
        {
            find: '"suspended"!==this.input.getAudioState()',
            replacement: [
                {
                    match: /(\.InteractionRequired:this\.interacted\|\|"suspended"!==this\.input\.getAudioState\(\)\|\|setImmediate\(\(\)=>)this\.emit\(\i,!0\)/,
                    replace: "$1this.interact()"
                },
                {
                    match: /async playAudio\((\i)\)\{try\{await \1\.play\(\)\}catch\{this\.emit\("interactionrequired",!0\)\}\}/,
                    replace: "async playAudio($1){for(let i=0;i<6;i++){try{await $1.play();return}catch{await new Promise(r=>setTimeout(r,500))}}}"
                }
            ]
        },
        {
            find: "MEDIA_ENGINE_INTERACTION_REQUIRED:function",
            replacement: {
                match: /MEDIA_ENGINE_INTERACTION_REQUIRED:function\(\i\)\{return (\i)!==\i\.required&&\(\1=\i\.required,\i\.required\|\|(\i)\.interact\(\),!0\)\}/,
                replace: "MEDIA_ENGINE_INTERACTION_REQUIRED:function(){return $2.interact(),$1&&($1=!1,!0)}"
            }
        },
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
        // Stream info box: Discord only draws it on the call tile under the pointer. Always on is limited to
        // stream tiles in the call you are in, so a channel's preview (not joined) shows no boxes.
        {
            find: ".isStreamInfoOverlayEnabled),[",
            replacement: {
                match: /(\i)&&(\i)&&(?=\(0,\i\.jsx\)\(\i\.\i,\{currentUserId:\i,participant:(\i)\}\))/,
                replace: "$1&&($2||$self.streamInfoAlways($3))&&"
            }
        },
        {
            find: 'displayName="ApplicationStreamingStore"',
            replacement: {
                match: /VOICE_STATE_UPDATES:function\(/,
                replace: "PASSIVE_UPDATE_V2:e=>$self.passiveStreams(e),VOICE_STATE_UPDATES:$self.streamVoiceStateUpdates=function("
            }
        }
    ],

    streamVoiceStateUpdates: null as VoiceStatesHandler | null,

    streamInfoAlways(participant?: StreamParticipant) {
        if (!settings.store.streamInfoAlways || participant?.type !== STREAM_PARTICIPANT) return false;
        const channelId = participant.stream?.channelId;
        return channelId == null || channelId === SelectedChannelStore.getVoiceChannelId();
    },

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
        applyStreamInfoLook();
        addCategory("system_panel", "halocord_windows_category", general,
            ["Windows Settings", "startup", "tray", "minimise", "minimize"], WindowsSettings);
        addCategory("developer_options_panel", "halocord_build_category", () => "Discord Build",
            ["Discord Build", "Stable", "PTB", "Canary"], BuildSelector);
        // VU Meters, then Calls at the very bottom of Voice & Video
        addCategory("voice_and_video_panel", "halocord_vu_category", () => "VU Meters",
            ["VU Meters", "meter", "peak", "position", "spot", "profile picture"], VuCategory, true);
        addCategory("voice_and_video_panel", "halocord_stream_info_category", () => "Stream Info",
            ["Stream Info", "overlay", "bitrate", "resolution", "codec", "fps", "always show", "border"], StreamInfoCategory, true);
        addCategory("voice_and_video_panel", "halocord_calls_category", () => "Calls",
            ["Calls", "idle", "AFK", "rejoin", "reconnect", "tiles", "profile picture", "glow", "banner"], CallsCategory, true);
    }
});
