/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2022 Vendicated and contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { createHash } from "node:crypto";

import { fetchBuffer, fetchJson } from "@main/utils/http";
import { IpcEvents } from "@shared/IpcEvents";
import { VENCORD_USER_AGENT } from "@shared/vencordUserAgent";
import { ipcMain } from "electron";
import { writeFileSync } from "original-fs";

import gitHash from "~git-hash";
import gitRemote from "~git-remote";

import { ASAR_FILE, serializeErrors, UpdateOutcome } from "./common";

const API_BASE = `https://api.github.com/repos/${gitRemote}`;
let PendingUpdate: string | null = null;
let PendingChecksum: string | null = null;

async function githubGet<T = any>(endpoint: string) {
    return fetchJson<T>(API_BASE + endpoint, {
        headers: {
            Accept: "application/vnd.github+json",
            // "All API requests MUST include a valid User-Agent header.
            // Requests with no User-Agent header will be rejected."
            "User-Agent": VENCORD_USER_AGENT
        }
    });
}

async function calculateGitChanges() {
    const isOutdated = await fetchUpdate();
    if (!isOutdated) return { changes: [], diverged: false };

    const data = await githubGet(`/compare/${gitHash}...HEAD`);

    return {
        diverged: false,
        changes: data.commits.map((c: any) => ({
            hash: c.sha,
            author: c.author?.login ?? c.commit?.author?.name ?? "Unknown Author",
            message: c.commit.message.split("\n")[0]
        }))
    };
}

async function fetchUpdate() {
    const data = await githubGet("/releases/latest");

    const hash = data.name.slice(data.name.lastIndexOf(" ") + 1);
    if (hash === gitHash)
        return false;

    const asset = data.assets.find(a => a.name === ASAR_FILE);
    const checksum = data.assets.find(a => a.name === `${ASAR_FILE}.sha256`);
    if (!asset || !checksum) {
        throw new Error(`Latest release has no ${ASAR_FILE} with a matching ${ASAR_FILE}.sha256 checksum, refusing to update`);
    }

    PendingUpdate = asset.browser_download_url;
    PendingChecksum = checksum.browser_download_url;

    return true;
}

async function applyUpdate() {
    if (!PendingUpdate) return true;
    if (!PendingChecksum) {
        throw new Error("No checksum is recorded for the pending update, refusing to write it");
    }

    const [data, checksumFile] = await Promise.all([fetchBuffer(PendingUpdate), fetchBuffer(PendingChecksum)]);
    const expected = /^([a-f0-9]{64})/im.exec(checksumFile.toString("utf8"))?.[1];
    if (!expected) {
        throw new Error("The checksum file for the pending update could not be read, refusing to write it");
    }

    const actual = createHash("sha256").update(data).digest("hex");
    if (actual !== expected) {
        throw new Error(`Downloaded update failed its checksum: expected ${expected}, got ${actual}`);
    }

    writeFileSync(__dirname, data, { flush: true });

    PendingUpdate = null;
    PendingChecksum = null;

    return true;
}

ipcMain.handle(IpcEvents.GET_REPO, serializeErrors(() => `https://github.com/${gitRemote}`));
ipcMain.handle(IpcEvents.GET_UPDATES, serializeErrors(calculateGitChanges));
// there is no git tree to diverge from in standalone builds
ipcMain.handle(IpcEvents.UPDATE, serializeErrors(async (): Promise<UpdateOutcome> => (await fetchUpdate() ? "updated" : "upToDate")));
ipcMain.handle(IpcEvents.FORCE_UPDATE, serializeErrors(async (): Promise<UpdateOutcome> => (await fetchUpdate() ? "updated" : "upToDate")));
ipcMain.handle(IpcEvents.BUILD, serializeErrors(applyUpdate));
