/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2023 Vendicated and contributors
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

import "./checkNodeVersion.js";

import { execFileSync } from "child_process";
import { createWriteStream, existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { Readable } from "stream";
import { finished } from "stream/promises";
import { fileURLToPath } from "url";

const BASE_URL = "https://github.com/Equicord/Equilotl/releases/latest/download/";
const USER_AGENT = "HaloCord (https://github.com/DavidHiFi/HaloCord)";

const BASE_DIR = join(dirname(fileURLToPath(import.meta.url)), "..");
const FILE_DIR = join(BASE_DIR, "dist", "Installer");
const ETAG_FILE = join(FILE_DIR, "etag.txt");

function byArch(files) {
    return files[process.arch] ?? files.default;
}

function getFilename() {
    switch (process.platform) {
        case "win32":
            return byArch({
                arm64: "EquilotlCli-arm64.exe",
                default: "EquilotlCli.exe"
            });
        case "darwin":
            return byArch({
                x64: "EquilotlCli-x64",
                arm64: "EquilotlCli-arm64",
                default: "EquilotlCli-universal"
            });
        case "linux":
            return byArch({
                arm64: "EquilotlCli-linux-arm64",
                default: "EquilotlCli-linux"
            });
        default:
            throw new Error("Unsupported platform: " + process.platform);
    }
}

async function ensureBinary() {
    mkdirSync(FILE_DIR, { recursive: true });

    const filename = getFilename();
    const outputFile = join(FILE_DIR, filename);

    const legacyBinary = process.platform === "win32"
        ? join(FILE_DIR, "Windows_Testcord_installer-rel_cli.exe")
        : join(FILE_DIR, "Linux_Testcord_installer-rel_cli");

    const etag = existsSync(outputFile) && existsSync(ETAG_FILE)
        ? readFileSync(ETAG_FILE, "utf-8")
        : null;

    try {
        console.log("Downloading " + filename + "...");
        const res = await fetch(BASE_URL + filename, {
            headers: {
                "User-Agent": USER_AGENT,
                ...(etag ? { "If-None-Match": etag } : {})
            }
        });

        if (res.status === 304) {
            console.log("Up to date, not redownloading!");
            return outputFile;
        }

        if (res.ok) {
            const body = Readable.fromWeb(res.body);
            await finished(body.pipe(createWriteStream(outputFile, {
                mode: 0o755,
                autoClose: true
            })));

            const resEtag = res.headers.get("etag");
            if (resEtag) {
                writeFileSync(ETAG_FILE, resEtag);
            }

            console.log("Finished downloading!");
            return outputFile;
        }

        throw new Error(`Failed to download installer: ${res.status} ${res.statusText}`);
    } catch (err) {
        if (existsSync(outputFile)) {
            console.warn(`Download failed (${err.message}). Using existing installer binary.`);
            return outputFile;
        }
        if (existsSync(legacyBinary)) {
            console.warn(`Download failed (${err.message}). Using existing legacy installer binary.`);
            return legacyBinary;
        }
        throw err;
    }
}

const installerBin = await ensureBinary();

console.log("Now running Installer...");

const argStart = process.argv.indexOf("--");
const args = argStart === -1 ? [] : process.argv.slice(argStart + 1).filter(a => a !== "--");

try {
    execFileSync(installerBin, args, {
        stdio: "inherit",
        env: {
            ...process.env,
            TESTCORD_USER_DATA_DIR: BASE_DIR,
            TESTCORD_DIRECTORY: join(BASE_DIR, "dist/desktop"),
            TESTCORD_DEV_INSTALL: "1",
            EQUICORD_USER_DATA_DIR: BASE_DIR,
            EQUICORD_DIRECTORY: join(BASE_DIR, "dist/desktop"),
            EQUICORD_DEV_INSTALL: "1",
            HALOCORD_USER_DATA_DIR: BASE_DIR,
            HALOCORD_DIRECTORY: join(BASE_DIR, "dist/desktop"),
            HALOCORD_DEV_INSTALL: "1"
        }
    });
} catch {
    console.error("Something went wrong. Please check the logs above.");
}
