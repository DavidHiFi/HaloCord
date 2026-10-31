// HaloCord updater. Serves the bundle's updater calls (Settings > Updater and the startup check):
// reads HaloCord-update.json from the newest GitHub release, downloads the installer it names, checks
// the installer's SHA-256 against it and installs it silently on restart. Plugins from Vencord,
// Equicord and TestCord ship inside each release, so this one path updates the client and its plugins.
// Release downloads are not under GitHub's API limit of 60 calls an hour per network.
const { app, ipcMain, net } = require("electron");
const { spawn } = require("child_process");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const REPO = "DavidHiFi/HaloCord";
const DOWNLOADS = `https://github.com/${REPO}/releases/download/`;
// HALOCORD_UPDATE_FEED points the check at a local folder served over HTTP, for testing an update.
const TEST_FEED = process.env.HALOCORD_UPDATE_FEED;
const FEED = TEST_FEED || `https://github.com/${REPO}/releases/latest/download/`;
const DIR = path.join(app.getPath("temp"), "HaloCord-update");
const build = (() => { try { return require("./build.json"); } catch { return {}; } })();
const UA = { "User-Agent": `HaloCord/${app.getVersion()}` };

let latest = null;  // newest release when it is newer than this build
let staged = null;  // verified installer for `latest`
let installing = false;
let downloading = null;  // the download in progress, shared by the startup update and the Updater page

const parts = v => String(v).replace(/^v/i, "").split(/[.-]/).slice(0, 3).map(n => parseInt(n, 10) || 0);
function isNewer(a, b) {
    const x = parts(a), y = parts(b);
    for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] > y[i];
    return false;
}

async function get(url) {
    let res;
    try {
        res = await net.fetch(url, { headers: UA, cache: "no-store" });
    } catch (e) {
        throw new Error(`Could not reach GitHub (${e.message}). Check your connection and try again.`);
    }
    if (res.status === 404) throw new Error("No HaloCord release with an update file was found on GitHub");
    if (!res.ok) throw new Error(`GitHub answered ${res.status} ${res.statusText}`.trim());
    return res;
}

// HaloCord-update.json: { version, url, sha256, notes: [...] }, written by the release script.
async function check() {
    const m = await (await get(FEED + "HaloCord-update.json")).json();
    const version = String(m.version ?? "").replace(/^v/i, "");
    if (!/^\d+\.\d+\.\d+$/.test(version)) throw new Error("The update file names no version");
    if (!isNewer(version, app.getVersion())) {
        latest = staged = null;
        return { changes: [], diverged: false };
    }
    const sha256 = /^[a-f0-9]{64}$/i.test(m.sha256 ?? "") ? m.sha256.toLowerCase() : null;
    const url = String(m.url ?? "");
    if (!sha256 || !url.startsWith(TEST_FEED || DOWNLOADS))
        throw new Error(`The update file for HaloCord ${version} is incomplete, so nothing was downloaded`);
    if (latest?.version !== version) staged = null;
    latest = { version, url, sha256 };
    const notes = Array.isArray(m.notes) && m.notes.length ? m.notes : [`HaloCord ${version}`];
    return { changes: notes.map(message => ({ hash: `v${version}`, author: "HaloCord", message: String(message) })), diverged: false };
}

const download = () => downloading ??= fetchInstaller().finally(() => { downloading = null; });

// Streams the installer to disk, hashing as it goes; a mismatch deletes the file.
async function fetchInstaller() {
    if (!latest) await check();
    if (!latest) return "upToDate";
    if (staged) return "updated";
    fs.rmSync(DIR, { recursive: true, force: true });
    fs.mkdirSync(DIR, { recursive: true });
    const file = path.join(DIR, `HaloCord-Setup-${latest.version}.exe`), part = file + ".part";
    const res = await get(latest.url);
    if (!res.body) throw new Error("The installer download came back empty");
    const hash = crypto.createHash("sha256"), out = fs.createWriteStream(part);
    try {
        for await (const chunk of res.body) {
            hash.update(chunk);
            if (!out.write(chunk)) await new Promise(r => out.once("drain", r));
        }
        await new Promise((resolve, reject) => out.end(e => e ? reject(e) : resolve()));
    } catch (e) {
        out.destroy();
        fs.rmSync(part, { force: true });
        throw e;
    }
    const got = hash.digest("hex");
    if (got !== latest.sha256) {
        fs.rmSync(part, { force: true });
        throw new Error("The downloaded installer did not match its SHA-256, so it was deleted. Try again.");
    }
    fs.renameSync(part, file);
    staged = file;
    console.log(`[HaloCord] update ${latest.version} downloaded and verified: ${file}`);
    return "updated";
}

// The installer closes the running HaloCord (--updated), installs over it without UI (/S) and, with
// --force-run, starts it again. Settings in %APPDATA%\HaloCord are not touched.
function runInstaller(restart) {
    installing = true;
    // The loopback helper follows the shared app, not HaloCord, so stop it here; the keys and
    // Stream Deck helpers exit with HaloCord.
    try { require("./shareaudio.js").stop(); } catch { }
    spawn(staged, ["/S", "--updated", ...(restart ? ["--force-run"] : [])], { detached: true, stdio: "ignore", windowsHide: true }).unref();
    console.log(`[HaloCord] installing update ${latest.version}`);
}

// Restart: install the downloaded update and start the new version. Returns false when there is none.
function install() {
    if (!staged || installing) return false;
    runInstaller(true);
    app.quit();
    setTimeout(() => app.exit(0), 5000);
    return true;
}

function handle(channel, fn) {
    // The bundle's main side registers Vencord's own updater on these channels first.
    ipcMain.removeHandler(channel);
    ipcMain.handle(channel, async (_, ...args) => {
        try { return { ok: true, value: await fn(...args) }; } catch (e) {
            console.error(`[HaloCord] ${channel} failed:`, e);
            return { ok: false, error: { message: String(e?.message ?? e), stack: String(e?.stack ?? "") } };
        }
    });
}

exports.init = () => {
    // Clear what an earlier update left behind; a running installer keeps its file locked.
    try { fs.rmSync(DIR, { recursive: true, force: true }); } catch { }
    // A downloaded update also installs when HaloCord quits, except when Windows is shutting down.
    let sessionEnding = false;
    app.on("session-end", () => { sessionEnding = true; });
    app.on("will-quit", () => { if (staged && !installing && !sessionEnding) runInstaller(false); });
    handle("VencordGetRepo", () => `https://github.com/${REPO}`);
    handle("VencordGetUpdates", check);
    handle("VencordUpdate", download);
    handle("VencordForceUpdate", download);
    // The bundle calls this after an update to apply it; the installer applies it on restart instead.
    handle("VencordBuild", () => !!staged);
    ipcMain.handle("halocord:update-info", () => ({ version: app.getVersion(), commit: build.commit || "", upstream: build.upstream || {}, ready: latest && staged ? latest.version : null }));
    return { install };
};
