/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import ErrorBoundary from "@components/ErrorBoundary";
import { FormSwitch } from "@components/FormSwitch";
import { Paragraph } from "@components/Paragraph";
import SettingsPlugin from "@plugins/_core/settings";
import { TestcordDevs } from "@utils/constants";
import definePlugin from "@utils/types";
import { Alerts, i18n, Select, useEffect, useState } from "@webpack/common";
import type { ComponentType } from "react";

// Shell side: desktop/shell/hc-desktop.js, exposed by the preload as window.HaloCordDesktop.
interface DesktopPrefs {
    openOnStartup: boolean;
    startMinimized: boolean;
    minimizeToTray: boolean;
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

function WindowsSettings() {
    const [prefs, set] = useDesktopPrefs();
    if (!prefs) return null;
    const startup = prefs.canAutostart;
    return (
        <>
            <FormSwitch
                title={discordString("3BeZti", "Automatically open HaloCord when your computer starts up")}
                description={startup ? undefined : "Only the installed HaloCord can open at startup."}
                value={prefs.openOnStartup}
                disabled={!startup}
                onChange={v => set("openOnStartup", v)}
            />
            <FormSwitch
                title={discordString("GfBL83", "Start HaloCord minimised")}
                description={discordString("XGyhhc", "Start HaloCord in the background, out of your way.")}
                value={prefs.openOnStartup && prefs.startMinimized}
                disabled={!prefs.openOnStartup}
                onChange={v => set("startMinimized", v)}
            />
            <FormSwitch
                title={discordString("dJ5MUh", "Minimise HaloCord to System Tray")}
                description={discordString("nQavHr", "Clicking X minimises HaloCord instead of closing it completely.")}
                value={prefs.minimizeToTray}
                onChange={v => set("minimizeToTray", v)}
                hideBorder
            />
        </>
    );
}

const BUILDS = [
    { label: "Stable", value: "stable" },
    { label: "PTB", value: "ptb" },
    { label: "Canary", value: "canary" }
];

function BuildSelector() {
    const [prefs, set] = useDesktopPrefs();
    if (!prefs) return null;
    return (
        <>
            <Paragraph style={{ marginBottom: 8 }}>
                Which Discord web build HaloCord loads. Each build is its own site, so you log in again the first time and plugin data
                kept in the page (like the voice panel) starts fresh there.
            </Paragraph>
            <Select
                options={BUILDS}
                closeOnSelect
                isSelected={v => v === prefs.build}
                serialize={String}
                select={async v => {
                    if (v === prefs.build) return;
                    await set("build", v);
                    Alerts.show({
                        title: "Restart HaloCord?",
                        body: `HaloCord loads ${BUILDS.find(b => b.value === v)!.label} after a restart.`,
                        confirmText: "Restart now",
                        cancelText: "Later",
                        onConfirm: () => window.HaloCordNative?.relaunch()
                    });
                }}
            />
        </>
    );
}

// Puts a category at the top of one of Discord's own settings panels (Settings plugin layoutHooks).
function addCategory(panelKey: string, key: string, title: () => string, terms: string[], Component: ComponentType) {
    const Wrapped = () => <ErrorBoundary noop><Component /></ErrorBoundary>;
    SettingsPlugin.layoutHooks[panelKey] = (layout, types) => {
        if (!native() || layout.some(n => n?.key === key)) return;
        layout.unshift({
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
    description: "Desktop client behaviour for HaloCord: startup and tray settings, Discord build choice, update notice, no web download prompts.",
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
                match: /\(0,\i\.isWeb\)\(\)(?=&&\i\.push\(\{key:"download")/,
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
        }
    ],

    start() {
        const general = () => discordString("cg6ltt", "General");
        addCategory("system_panel", "halocord_windows_category", general,
            ["Windows Settings", "startup", "tray", "minimise", "minimize"], WindowsSettings);
        addCategory("developer_options_panel", "halocord_build_category", () => "Discord Build",
            ["Discord Build", "Stable", "PTB", "Canary"], BuildSelector);
    }
});
