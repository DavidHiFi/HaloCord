/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { type MochaCordSettings, Settings, SettingsStore } from "@api/Settings";
import { IS_MAC, IS_WINDOWS } from "@utils/constants";
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

export interface LocalFace { style: string; weight: number; italic: boolean; ps: string; full: string; }

// Style name -> CSS weight. Order matters: "SemiBold" must hit semi before bold.
const STYLE_WEIGHTS: [RegExp, number][] = [
    [/thin|hairline/, 100], [/(extra|ultra)-?light/, 200], [/(semi|demi)-?light/, 350], [/light/, 300],
    [/retina/, 450], [/medium|\bmed\b/, 500], [/(semi|demi)-?bold|sembd/, 600], [/(extra|ultra)-?bold|extbd/, 800],
    [/black|heavy/, 900], [/bold/, 700]
];

const styleWeight = (style: string) => STYLE_WEIGHTS.find(([re]) => re.test(style.toLowerCase().replace(/\s+/g, "")))?.[1] ?? 400;

// Installed font styles by lower-cased family, from the Local Font Access API. Empty when it is unavailable.
let localFaces = new Map<string, LocalFace[]>();

export const localFacesReady: Promise<void> = (async () => {
    if (IS_USERSCRIPT || typeof (window as any).queryLocalFonts !== "function") return;
    try {
        for (const f of await (window as any).queryLocalFonts()) {
            const key = String(f.family).toLowerCase();
            const list = localFaces.get(key) ?? [];
            list.push({ style: f.style, weight: styleWeight(f.style), italic: /italic|oblique/i.test(f.style), ps: f.postscriptName, full: f.fullName });
            localFaces.set(key, list);
        }
    } catch (e) {
        localFaces = new Map();
        console.warn("[HaloCord] Could not list installed fonts", e);
    }
})();

export const facesFor = (family: string) => localFaces.get(family.trim().toLowerCase());

const cleanFont = (font: string) => font.replace(/[;{}<>\\"]/g, "").trim();

/** The installed face closest to a weight, heavier on a tie. */
export function nearestFace(faces: LocalFace[], weight: number) {
    return faces.reduce((best, f) => {
        const d = Math.abs(f.weight - weight), bd = Math.abs(best.weight - weight);
        return d < bd || (d === bd && f.weight > best.weight) ? f : best;
    });
}

// Discord asks for a handful of weights. Each bucket is shifted by the picked style's distance from
// Regular and served by the nearest installed face, so picking Bold makes body text Bold while titles
// stay at least as heavy as before.
const BUCKETS = [[1, 449, 400], [450, 549, 500], [550, 649, 600], [650, 749, 700], [750, 1000, 800]];

function aliasFaces(alias: string, family: string, weight: number) {
    const faces = family.includes(",") || weight === 400 ? undefined : facesFor(family);
    if (!faces?.length) return "";
    const css: string[] = [];
    for (const italic of [false, true]) {
        const group = faces.filter(f => f.italic === italic);
        if (!group.length) continue;
        for (const [lo, hi, base] of BUCKETS) {
            const f = nearestFace(group, Math.min(900, Math.max(100, base + weight - 400)));
            const src = [f.ps, f.full].filter(Boolean).map(n => `local("${cleanFont(n)}")`).join(", ");
            css.push(`@font-face { font-family: "${alias}"; font-style: ${italic ? "italic" : "normal"}; font-weight: ${lo} ${hi}; src: ${src}; }`);
        }
    }
    return css.join("\n");
}

function fontStack(font: string, fallback: string, alias: string, faceCss: string) {
    const name = cleanFont(font);
    if (!name) return null;
    return `${faceCss ? `"${alias}", ` : ""}${name.includes(",") ? name : `"${name}"`}, ${fallback}`;
}

function fontCss() {
    const uiFaces = aliasFaces("HaloCord UI", cleanFont(Settings.uiFont), Settings.uiFontWeight);
    const codeFaces = aliasFaces("HaloCord Code", cleanFont(Settings.codeFont), Settings.codeFontWeight);
    const ui = fontStack(Settings.uiFont, UI_FALLBACK, "HaloCord UI", uiFaces);
    const code = fontStack(Settings.codeFont, CODE_FALLBACK, "HaloCord Code", codeFaces);
    const uiItalic = !!ui && Settings.uiFontItalic, codeItalic = !!code && Settings.codeFontItalic;
    if (!ui && !code) return "";
    const vars = [
        ui && `--font-primary: ${ui} !important; --font-display: ${ui} !important; --font-headline: ${ui} !important;`,
        code && `--font-code: ${code} !important;`
    ].filter(Boolean).join(" ");
    return [
        uiFaces, codeFaces,
        `:root, body, #app-mount { ${vars} }`,
        uiItalic && "body { font-style: italic; }",
        // Code inherits the body's slant unless its own switch says otherwise.
        uiItalic !== codeItalic && `code, pre, .hljs { font-style: ${codeItalic ? "italic" : "normal"}; }`
    ].filter(Boolean).join("\n");
}

let mainWindowBlur: boolean | undefined;

// The window material is picked once, when the window is created, and popouts never get one.
function hasWindowBlur(root: HTMLElement) {
    if (root !== document.documentElement) return false;
    return mainWindowBlur ??= Settings.transparent
        || (IS_WINDOWS && Settings.windowsMaterial !== "none")
        || (IS_MAC && !!Settings.macosVibrancyStyle);
}

export function applyHaloAppearance(root: HTMLElement) {
    const mc = Settings.mochacord;
    for (const attr of Array.from(root.attributes)) {
        if (attr.name.startsWith("data-mc-")) root.removeAttribute(attr.name);
    }
    if (!hasWindowBlur(root)) root.setAttribute("data-mc-window-blur", "off");
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

    localFacesReady.then(applyEverywhere);

    for (const key of ["uiFont", "uiFontWeight", "uiFontItalic", "codeFont", "codeFontWeight", "codeFontItalic"])
        SettingsStore.addChangeListener(key, applyEverywhere);
    SettingsStore.addPrefixChangeListener("mochacord", applyEverywhere);
}, { once: true });
