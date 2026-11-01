/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { type MochaCordSettings, Settings, SettingsStore } from "@api/Settings";
import { createAndAppendStyle } from "@utils/css";
import { PopoutWindowStore } from "@webpack/common";

import { managedStyleRootNode } from "./Styles";

const UI_FALLBACK = '"gg sans", "Noto Sans", "Helvetica Neue", Helvetica, Arial, sans-serif';
const CODE_FALLBACK = '"gg mono", "Source Code Pro", Consolas, Monaco, monospace';

type Flag = { [K in keyof MochaCordSettings]: MochaCordSettings[K] extends boolean ? K : never }[keyof MochaCordSettings];

// [setting, attribute, the theme's default, attribute value when the setting differs]
const flags: [Flag, string, boolean, string][] = [
    ["typingDots", "typing-dots", false, "show"],
    ["hoverColors", "hover", true, "off"],
    ["animations", "animations", false, "on"],
    ["windowControls", "window-controls", true, "off"],
    ["transparency", "transparency", true, "off"],
    ["panelBlur", "panel-blur", true, "off"],
    ["separatedChatBar", "chatbar", true, "off"],
    ["smallUserPanel", "small-user-panel", true, "off"],
    ["hideVoiceMenus", "voice-menus", true, "show"],
    ["reorderPicker", "picker-order", true, "stock"],
    ["whiteNames", "white-names", true, "off"],
    ["voiceButtonColors", "voice-buttons", true, "stock"],
    ["hideBarTitle", "bar-title", true, "show"]
];

const choices = [
    ["typing", "typing", "center"],
    ["topBarButtons", "top-bar-buttons", "off"],
    ["topBarTitle", "top-bar-title", "off"]
] as const;

export const mochaColors = [
    ["accent", "accent"],
    ["text", "text"],
    ["textMuted", "text-muted"],
    ["surface", "surface"],
    ["background", "background"],
    ["hoverColor", "hover-color"]
] as const;

export const isHexColor = (value: string) => /^#(?:[\da-f]{3}|[\da-f]{6}|[\da-f]{8})$/i.test(value);

function fontStack(font: string, fallback: string) {
    const name = font.replace(/[;{}<>\\"]/g, "").trim();
    if (!name) return null;
    return `${name.includes(",") ? name : `"${name}"`}, ${fallback}`;
}

function fontCss() {
    const ui = fontStack(Settings.uiFont, UI_FALLBACK);
    const code = fontStack(Settings.codeFont, CODE_FALLBACK);
    if (!ui && !code) return "";
    const vars = [
        ui && `--font-primary: ${ui} !important; --font-display: ${ui} !important; --font-headline: ${ui} !important;`,
        code && `--font-code: ${code} !important;`
    ].filter(Boolean).join(" ");
    return `:root, body, #app-mount { ${vars} }`;
}

export function applyHaloAppearance(root: HTMLElement) {
    const mc = Settings.mochacord;
    for (const attr of Array.from(root.attributes)) {
        if (attr.name.startsWith("data-mc-")) root.removeAttribute(attr.name);
    }
    for (const [key, name, fallback, value] of flags) {
        if (mc[key] !== fallback) root.setAttribute(`data-mc-${name}`, value);
    }
    for (const [key, name, fallback] of choices) {
        if (mc[key] !== fallback) root.setAttribute(`data-mc-${name}`, mc[key]);
    }
    for (const [key, name] of mochaColors) {
        const value = mc[key];
        if (isHexColor(value)) {
            root.setAttribute(`data-mc-${name}`, "");
            root.style.setProperty(`--mc-${name}`, value);
        } else {
            root.style.removeProperty(`--mc-${name}`);
        }
    }

    const style = root.ownerDocument.getElementById("halo-fonts");
    if (style) style.textContent = fontCss();
}

function applyEverywhere() {
    applyHaloAppearance(document.documentElement);
    if (!PopoutWindowStore) return;
    for (const key of PopoutWindowStore.getWindowKeys()) {
        const root = PopoutWindowStore.getWindow(key)?.document?.documentElement;
        if (root) applyHaloAppearance(root);
    }
}

function migrateFontLoader() {
    const old = SettingsStore.plain.plugins.FontLoader;
    if (!old) return;
    const font = typeof old.selectedFont === "string" ? old.selectedFont.trim() : "";
    if (old.enabled && font && !Settings.uiFont) {
        Settings.uiFont = font;
        if (old.applyOnCodeBlocks && !Settings.codeFont) Settings.codeFont = font;
    }
    delete Settings.plugins.FontLoader;
}

document.addEventListener("DOMContentLoaded", () => {
    if (IS_USERSCRIPT) return;

    migrateFontLoader();
    createAndAppendStyle("halo-fonts", managedStyleRootNode);
    applyEverywhere();

    SettingsStore.addChangeListener("uiFont", applyEverywhere);
    SettingsStore.addChangeListener("codeFont", applyEverywhere);
    SettingsStore.addPrefixChangeListener("mochacord", applyEverywhere);
}, { once: true });
