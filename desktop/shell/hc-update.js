// HaloCord updater. Serves the bundle's updater calls (Settings > Updater and the startup check):
// reads HaloCord-update.json from the newest GitHub release, downloads the installer it names, checks
// the installer's SHA-256 against it and installs it silently on restart. Plugins from Vencord,
// Equicord and TestCord ship inside each release, so this one path updates the client and its plugins.
// Release downloads are not under GitHub's API limit of 60 calls an hour per network.
// The repo is private, so anonymous requests get 404; on a PC where the GitHub CLI is signed in to an
// account that can read the repo, the same files come through the API with that login.
const { app, ipcMain, net } = require("electron");
const { execFile, spawn } = require("child_process");
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

const NOT_FOUND = "No HaloCord release with an update file was found on GitHub";

async function get(url, headers) {
    let res;
    try {
        res = await net.fetch(url, { headers: { ...UA, ...headers }, cache: "no-store" });
    } catch (e) {
        throw new Error(`Could not reach GitHub (${e.message}). Check your connection and try again.`);
    }
    if (res.status === 404) throw Object.assign(new Error(NOT_FOUND), { notFound: true });
    if (!res.ok) throw new Error(`GitHub answered ${res.status} ${res.statusText}`.trim());
    return res;
}

const ghToken = () => new Promise(resolve => execFile("gh", ["auth", "token"], { windowsHide: true, timeout: 10000 },
    (e, out) => resolve(e ? null : String(out).trim() || null)));

// The API answers an asset request with a redirect to a signed download link that needs no login.
// Read the link without following it: Electron 37 crashes when a request hook (TrafficGuard's token
// guard) removes a header while net.fetch follows a redirect, and the login stays on api.github.com.
const assetLink = (url, headers) => new Promise((resolve, reject) => {
    const req = net.request({ url, redirect: "manual" });
    for (const [k, v] of Object.entries({ ...UA, ...headers })) req.setHeader(k, v);
    req.on("redirect", (_status, _method, to) => { req.abort(); resolve(to); });
    req.on("response", res => { req.abort(); reject(new Error(`GitHub answered ${res.statusCode} instead of a download link`)); });
    req.on("error", e => reject(new Error(`Could not reach GitHub (${e.message}). Check your connection and try again.`)));
    req.end();
});

// Reads the newest release's HaloCord-update.json. Returns it with `open(url)`, which downloads a file
// that release names: directly, or through the API with the GitHub CLI login when the repo is private.
// The token stays in this process.
async function readFeed() {
    try {
        return { m: await (await get(FEED + "HaloCord-update.json")).json(), open: url => get(url) };
    } catch (e) {
        if (TEST_FEED || !e.notFound) throw e;
    }
    const token = await ghToken();
    if (!token) throw new Error(`${NOT_FOUND}. The repo is private: sign in with the GitHub CLI (gh auth login) to get updates.`);
    const auth = { Authorization: `Bearer ${token}` };
    const release = await (await get(`https://api.github.com/repos/${REPO}/releases/latest`, { ...auth, Accept: "application/vnd.github+json" })).json();
    const assets = new Map((release.assets ?? []).map(a => [a.name, a.url]));
    const open = async url => {
        const name = decodeURIComponent(url.split("/").pop());
        if (!assets.has(name)) throw new Error(`${name} is missing from the newest HaloCord release`);
        return get(await assetLink(assets.get(name), { ...auth, Accept: "application/octet-stream" }));
    };
    return { m: await (await open("HaloCord-update.json")).json(), open };
}

// HaloCord-update.json: { version, url, sha256, notes: [...] }, written by the release script.
async function check() {
    const { m, open } = await readFeed();
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
    latest = { version, sha256, fetch: () => open(url) };
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
    const res = await latest.fetch();
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
