/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { createHash } from "crypto";
import haloCordPalette from "file://HaloCordPalette.css";
import { mkdir, readFile, writeFile } from "fs/promises";
import { join } from "path";

import { SETTINGS_DIR, THEMES_DIR } from "./utils/constants";

// HaloCord.css is MochaCord.css with HaloCord's colours added at the end, so the two themes share one
// layout and differ only in colour. It is rebuilt whenever MochaCord.css changes (mochacordTheme.ts).
// A copy the user edited is left alone: only the file we wrote last is replaced.
const THEME = join(THEMES_DIR, "HaloCord.css");
const CUSTOM_THEME = join(THEMES_DIR, "Custom.css");
const RECORD = join(SETTINGS_DIR, "halocord-theme.json");

const CUSTOM_HEADER = `/**
 * @name Custom
 * @description Your own CSS, loaded on top of stock Discord while Theme is Custom.
 * @author you
 * @version 1.0.0
*/
`;

const sha = (text: string) => createHash("sha256").update(text).digest("hex");

/** MochaCord.css as the HaloCord theme, or null when the text is not the MochaCord theme. */
export function buildHaloCordCss(mochaCss: string) {
    const header = /^\/\*\*[\s\S]*?\*\//.exec(mochaCss)?.[0];
    if (!header?.includes("@name MochaCord")) return null;
    const version = /@version\s+(\S+)/.exec(header)?.[1] ?? "1.0.0";
    return `/**
 * @name HaloCord
 * @description HaloCord's dark green theme: the MochaCord layout in HaloCord's own colours.
 * @author davidhifi
 * @version ${version}
 * @website https://github.com/DavidHiFi/HaloCord
*/${mochaCss.slice(header.length).trimEnd()}

${haloCordPalette}`;
}

async function readRecordedSha() {
    try {
        const parsed: unknown = JSON.parse(await readFile(RECORD, "utf8"));
        return typeof parsed === "object" && parsed !== null && "sha" in parsed && typeof parsed.sha === "string" ? parsed.sha : undefined;
    } catch {
        return undefined;
    }
}

export async function writeHaloCordTheme(mochaCss: string) {
    const css = buildHaloCordCss(mochaCss);
    if (!css) return;
    const onDisk = await readFile(THEME, "utf8").catch(() => null);
    if (onDisk === css) return;
    const recorded = await readRecordedSha();
    if (onDisk !== null && (!recorded || sha(onDisk) !== recorded)) return;
    await writeFile(THEME, css);
    await writeFile(RECORD, JSON.stringify({ sha: sha(css) }));
}

export async function installCustomTheme() {
    try {
        await mkdir(THEMES_DIR, { recursive: true });
        await writeFile(CUSTOM_THEME, CUSTOM_HEADER, { flag: "wx" }).catch(() => { });
    } catch (err) {
        console.error("[HaloCord] Could not create the Custom theme file", err);
    }
}
