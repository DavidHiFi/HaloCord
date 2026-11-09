/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { createHash } from "crypto";
import { net } from "electron";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";

import { writeHaloCordTheme } from "./haloCordTheme";
import { SETTINGS_DIR, THEMES_DIR } from "./utils/constants";

// HaloCord ships the MochaCord theme in the themes folder (off until the user enables it) and keeps it in step
// with the theme repo. A copy the user edited by hand is left alone: only the file we wrote last is replaced.
// HaloCord.css is rebuilt from whatever MochaCord.css ends up on disk, so both themes keep one layout.
const SOURCE = "https://raw.githubusercontent.com/DavidHiFi/MochaCord-Theme/main/MochaCord.css";
const THEME = join(THEMES_DIR, "MochaCord.css");
const RECORD = join(SETTINGS_DIR, "mochacord-theme.json");
const BUNDLED = join(__dirname, "MochaCord.css");
const HOUR = 60 * 60 * 1000;

interface ThemeRecord { sha?: string; etag?: string; }

const sha = (text: string) => createHash("sha256").update(text).digest("hex");

async function readRecord(): Promise<ThemeRecord> {
    try {
        const parsed: unknown = JSON.parse(await readFile(RECORD, "utf8"));
        if (typeof parsed !== "object" || parsed === null) return {};
        const hash = "sha" in parsed && typeof parsed.sha === "string" ? parsed.sha : undefined;
        const etag = "etag" in parsed && typeof parsed.etag === "string" ? parsed.etag : undefined;
        return { sha: hash, etag };
    } catch {
        return {};
    }
}

async function install(css: string, etag?: string) {
    const record = await readRecord();
    const onDisk = await readFile(THEME, "utf8").catch(() => null);
    if (onDisk !== null && onDisk !== css && record.sha && sha(onDisk) !== record.sha) {
        // Edited by the user: keep their file, but remember the tag so the hourly check is a cheap 304.
        if (etag) await writeFile(RECORD, JSON.stringify({ ...record, etag }));
        return;
    }
    if (onDisk !== css) await writeFile(THEME, css);
    await writeFile(RECORD, JSON.stringify({ sha: sha(css), etag: etag ?? record.etag }));
}

const rebuildHaloCord = async () => writeHaloCordTheme(await readFile(THEME, "utf8"));

async function setUpLocal() {
    try {
        const onDisk = await readFile(THEME, "utf8").catch(() => null);
        if (onDisk === null) await install(await readFile(BUNDLED, "utf8"));
        await rebuildHaloCord();
    } catch (err) {
        console.error("[HaloCord] Could not set up the bundled MochaCord and HaloCord themes", err);
    }
}

async function checkForUpdate() {
    try {
        const { etag } = await readRecord();
        const res = await net.fetch(SOURCE, { headers: etag ? { "If-None-Match": etag } : {}, cache: "no-store" });
        if (res.status === 304) return;
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const css = await res.text();
        if (!css.includes("@name MochaCord")) return;
        await install(css, res.headers.get("etag") ?? undefined);
        await rebuildHaloCord();
    } catch (err) {
        console.error("[HaloCord] MochaCord theme update check failed", err);
    }
}

export function startMochaCordThemeSync() {
    setUpLocal().then(checkForUpdate);
    setInterval(checkForUpdate, HOUR).unref();
}
