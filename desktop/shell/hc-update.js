// HaloCord updater. Like Discord, every launch checks first: a small window says "Checking for updates",
// and when GitHub has a newer release it downloads the installer, checks its SHA-256, installs it silently
// and starts the new version before the app opens. It also serves the bundle's updater calls (Settings >
// Updater and the half-hourly check), which install on restart. Plugins from Vencord, Equicord and TestCord
// ship inside each release, so this one path updates the client and its plugins.
// Release downloads are not under GitHub's API limit of 60 calls an hour per network.
// The repo is private, so anonymous requests get 404; on a PC where the GitHub CLI is signed in to an
// account that can read the repo, the same files come through the API with that login.
const { app, BrowserWindow, ipcMain, net } = require("electron");
const { execFile, spawn } = require("child_process");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const REPO = "DavidHiFi/HaloCord";
// HALOCORD_UPDATE_FEED points the check at a local folder served over HTTP, for testing an update. Only a
// loopback address is taken, so a variable set by something else cannot send updates to another server.
const TEST_FEED = (() => {
    const raw = process.env.HALOCORD_UPDATE_FEED;
    if (!raw) return null;
    try {
        const u = new URL(raw);
        if (u.protocol === "http:" && ["127.0.0.1", "localhost", "[::1]"].includes(u.hostname)) return u.href.replace(/\/?$/, "/");
    } catch { }
    console.warn("[HaloCord] HALOCORD_UPDATE_FEED ignored: only http://127.0.0.1 or localhost is allowed");
    return null;
})();
const FEED = TEST_FEED || `https://github.com/${REPO}/releases/latest/download/`;
// The release script signs each update file with the private half, kept in the owner's Bitwarden. The hash
// and the installer come over the same connection, so the signature is what proves the file is ours.
const UPDATE_KEY = crypto.createPublicKey({ key: Buffer.from("MCowBQYDK2VwAyEAouQOcOxvfNnPEtreGhZ1tD0jtF2DjdfzeJ4vY6g7+2k=", "base64"), format: "der", type: "spki" });
const signedText = (version, url, sha256) => Buffer.from(`HaloCord-update\n${version}\n${url}\n${sha256}`, "utf8");
function signatureOk(version, url, sha256, sig) {
    try { return typeof sig === "string" && crypto.verify(null, signedText(version, url, sha256), UPDATE_KEY, Buffer.from(sig, "base64")); } catch { return false; }
}
// The installer must come from this repo's release downloads (or the loopback test feed), compared as a URL.
function trustedInstallerUrl(raw) {
    let u;
    try { u = new URL(raw); } catch { return false; }
    if (TEST_FEED) return u.origin === new URL(TEST_FEED).origin;
    return u.protocol === "https:" && u.hostname === "github.com" && u.pathname.startsWith(`/${REPO}/releases/download/`) && !u.search && !u.hash;
}
const DIR = path.join(app.getPath("temp"), "HaloCord-update");
const build = (() => { try { return require("./build.json"); } catch { return {}; } })();
const UA = { "User-Agent": `HaloCord/${app.getVersion()}` };

let latest = null;  // newest release when it is newer than this build
let staged = null;  // verified installer for `latest`
let installing = false;
let downloading = null;  // the download in progress, shared by the startup update and the Updater page
let onProgress = null;  // (received, total) while the launch window shows a download
// A downloaded update waits here for the next launch; the installer it names is in DIR as well.
const READY = path.join(DIR, "ready.json");

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
        res = await net.fetch(url, { headers: { ...UA, ...headers }, cache: "no-store", signal: AbortSignal.timeout(30000) });
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
const assetLink = (url, headers) => new Promise((done, fail) => {
    // A stalled request would otherwise leave the update check waiting for the rest of the session.
    const stall = setTimeout(() => { req.abort(); fail(new Error("GitHub did not answer. Check your connection and try again.")); }, 30000);
    const resolve = v => { clearTimeout(stall); done(v); }, reject = e => { clearTimeout(stall); fail(e); };
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
    if (!sha256 || !trustedInstallerUrl(url))
        throw new Error(`The update file for HaloCord ${version} is incomplete, so nothing was downloaded`);
    if (!signatureOk(version, url, sha256, m.sig))
        throw new Error(`The update file for HaloCord ${version} is not signed by HaloCord, so nothing was downloaded`);
    if (latest?.version !== version) staged = null;
    latest = { version, sha256, url, sig: m.sig, fetch: () => open(url) };
    const notes = Array.isArray(m.notes) && m.notes.length ? m.notes : [`HaloCord ${version}`];
    return { changes: notes.map(message => ({ hash: `v${version}`, author: "HaloCord", message: String(message) })), diverged: false };
}

const download = () => downloading ??= fetchInstaller().finally(() => { downloading = null; });

const sha256Of = file => new Promise((resolve, reject) => {
    const h = crypto.createHash("sha256");
    fs.createReadStream(file).on("error", reject).on("data", c => h.update(c)).on("end", () => resolve(h.digest("hex")));
});

// An installer an earlier session downloaded, when it is still newer than this build and still intact.
async function readyInstaller() {
    try {
        const r = JSON.parse(fs.readFileSync(READY, "utf8"));
        const file = path.join(DIR, `HaloCord-Setup-${r.version}.exe`);
        // Signed like the update file, so an installer and ready.json planted in the temp folder are not run.
        if (isNewer(r.version, app.getVersion()) && signatureOk(r.version, r.url, r.sha256, r.sig) && fs.existsSync(file) && await sha256Of(file) === r.sha256) {
            latest = { version: r.version, sha256: r.sha256, url: r.url, sig: r.sig, fetch: null };
            staged = file;
            return true;
        }
    } catch { }
    try { fs.rmSync(DIR, { recursive: true, force: true }); } catch { }
    return false;
}

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
    const total = Number(res.headers.get("content-length")) || 0;
    let received = 0;
    // A full disk fails the write stream; without a listener that error would crash the main process.
    let failed = null;
    const failure = new Promise((_, reject) => out.once("error", e => reject(failed = e)));
    failure.catch(() => { });
    try {
        for await (const chunk of res.body) {
            if (failed) throw failed;
            hash.update(chunk);
            received += chunk.length;
            onProgress?.(received, total);
            if (!out.write(chunk)) await Promise.race([new Promise(r => out.once("drain", r)), failure]);
        }
        await Promise.race([new Promise((resolve, reject) => out.end(e => e ? reject(e) : resolve())), failure]);
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
    fs.writeFileSync(READY, JSON.stringify({ version: latest.version, sha256: latest.sha256, url: latest.url, sig: latest.sig }));
    console.log(`[HaloCord] update ${latest.version} downloaded and verified: ${file}`);
    return "updated";
}

// The installer force-closes every running HaloCord.exe, installs over it without UI (/S, --updated keeps
// the shortcuts) and, with --force-run, starts the new version. It always restarts: an install that
// started nothing left people opening HaloCord while their files were being replaced, and the installer
// killed that window seconds later. Settings in %APPDATA%\HaloCord are not touched.
// Hashes the staged installer again right before it runs, so a file swapped in the temp folder after the
// download check never starts. Blocks the main process briefly, but only while HaloCord is closing to update.
function stagedIntact() {
    try {
        if (crypto.createHash("sha256").update(fs.readFileSync(staged)).digest("hex") === latest.sha256) return true;
    } catch { }
    console.warn("[HaloCord] the downloaded installer changed after it was checked, so it was deleted");
    try { fs.rmSync(DIR, { recursive: true, force: true }); } catch { }
    staged = null;
    return false;
}

function runInstaller() {
    if (!stagedIntact()) return false;
    installing = true;
    // The loopback helper follows the shared app, not HaloCord, so stop it here; the keys and
    // Stream Deck helpers exit with HaloCord.
    try { require("./shareaudio.js").stop(); } catch { }
    noteAttempt(latest.version);
    spawn(staged, ["/S", "--updated", "--force-run"], { detached: true, stdio: "ignore", windowsHide: true }).unref();
    console.log(`[HaloCord] installing update ${latest.version}`);
    return true;
}

// Restart: install the downloaded update and start the new version. Returns false when there is none.
function install() {
    if (!staged || installing) return false;
    if (!runInstaller()) return false;
    app.quit();
    setTimeout(() => app.exit(0), 5000);
    return true;
}

// Two launch installs of one version that still left this build running mean the installer fails on
// this PC; the launch check then stops retrying it for a day so HaloCord still opens.
const ATTEMPTS = () => path.join(app.getPath("userData"), "update-attempt.json");
function noteAttempt(version) {
    let a = {};
    try { a = JSON.parse(fs.readFileSync(ATTEMPTS(), "utf8")) || {}; } catch { }
    const count = a.version === version && Date.now() - a.at < 864e5 ? a.count + 1 : 1;
    try { fs.writeFileSync(ATTEMPTS(), JSON.stringify({ version, count, at: Date.now() })); } catch { }
}
function gaveUpOn(version) {
    try {
        const a = JSON.parse(fs.readFileSync(ATTEMPTS(), "utf8"));
        return a.version === version && a.count >= 2 && Date.now() - a.at < 864e5;
    } catch { return false; }
}

// The bundle's own settings: the Updater page's automatic updates switch and the theme for the window.
function bundleSettings() {
    try {
        return JSON.parse(fs.readFileSync(path.join(process.env.TESTCORD_USER_DATA_DIR || "", "settings", "settings.json"), "utf8")) || {};
    } catch { return {}; }
}

// A HaloCord installer, or the old uninstaller it runs, is still replacing files.
const installerRunning = () => new Promise(resolve => execFile("tasklist.exe", ["/FO", "CSV", "/NH"], { windowsHide: true, timeout: 10000 },
    (e, out) => resolve(!e && /^"(HaloCord-Setup[^"]*|Uninstall HaloCord)\.exe"/im.test(String(out)))));

const exeStamp = () => { try { const st = fs.statSync(process.execPath); return `${st.size}:${st.mtimeMs}`; } catch { return ""; } };
const startStamp = exeStamp();

const within = (ms, p) => Promise.race([p, new Promise((_, reject) => setTimeout(() => reject(new Error("timed out")), ms))]);

function splashPage(s) {
    const mocha = s.haloTheming !== false && s.haloThemeVariant === "mochacord";
    const [bg, fg, dim, accent, track] = mocha ? ["#1e1e2e", "#cdd6f4", "#a6adc8", "#89b4fa", "#313244"] : ["#16191d", "#f2f3f5", "#a3a6aa", "#afe37f", "#2b2f35"];
    let logo = "";
    try { logo = "data:image/png;base64," + fs.readFileSync(path.join(__dirname, "icon.png")).toString("base64"); } catch { }
    return `<!doctype html><html><head><meta charset="utf-8"><style>
html,body{margin:0;height:100%;background:${bg};color:${fg};font:14px "Segoe UI",system-ui,sans-serif;user-select:none;-webkit-app-region:drag;overflow:hidden}
main{height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px}
img{width:88px;height:88px;margin-bottom:6px;animation:p 1.6s ease-in-out infinite}
@keyframes p{50%{transform:scale(.94);opacity:.85}}
@media (prefers-reduced-motion:reduce){img{animation:none}}
#t{font-weight:600}#d{color:${dim};font-size:12px;min-height:16px}
.bar{width:180px;height:4px;border-radius:2px;background:${track};overflow:hidden;visibility:hidden}
.bar i{display:block;height:100%;width:0;background:${accent};border-radius:2px;transition:width .2s}
</style></head><body><main><img src="${logo}" alt=""><div id="t">Checking for updates</div><div id="d"></div><div class="bar" id="b"><i id="f"></i></div></main>
<script>function set(t,d,p){document.getElementById("t").textContent=t;document.getElementById("d").textContent=d;
const b=document.getElementById("b");b.style.visibility=p==null?"hidden":"visible";document.getElementById("f").style.width=(p||0)+"%"}</script></body></html>`;
}

// Launch check. Runs before the main window shows (main.js creates it hidden). Resolves once HaloCord should
// open; when an update installs, HaloCord quits instead and the installer starts the new version.
async function launch({ win, hidden }) {
    const settings = bundleSettings();
    const reveal = () => { const w = win(); if (!hidden && w && !w.isDestroyed() && !w.isVisible()) w.show(); };
    if (hidden) {
        // Started minimised at sign-in: nobody is waiting, so only fetch the update; the next launch installs it.
        if (!await readyInstaller() && settings.autoUpdate !== false)
            setTimeout(() => download().catch(e => console.warn("[HaloCord] background update check failed:", e.message)), 15000);
        return;
    }
    const splash = new BrowserWindow({
        width: 300, height: 320, frame: false, resizable: false, maximizable: false, minimizable: false, fullscreenable: false,
        show: false, center: true, title: "HaloCord", backgroundColor: settings.haloThemeVariant === "mochacord" ? "#1e1e2e" : "#16191d",
        webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true }
    });
    splash.once("ready-to-show", () => splash.isDestroyed() || splash.show());
    splash.loadURL("data:text/html;charset=utf-8," + encodeURIComponent(splashPage(settings))).catch(() => { });
    const say = (t, d, p) => splash.isDestroyed() || splash.webContents.executeJavaScript(
        `typeof set==="function"&&set(${JSON.stringify(t)},${JSON.stringify(d ?? "")},${p == null ? "null" : Math.round(p)})`).catch(() => { });
    const done = () => { reveal(); setTimeout(() => splash.isDestroyed() || splash.destroy(), 150); };
    const installNow = () => {
        say("Installing update", `HaloCord ${latest.version}`, 100);
        console.log(`[HaloCord] launch update: installing ${latest.version}`);
        if (!runInstaller()) return done();
        setTimeout(() => { app.quit(); setTimeout(() => app.exit(0), 5000); }, 400);
    };
    try {
        // Opened while an update was still installing: wait for it, then start again on the new files.
        if (await installerRunning()) {
            say("Finishing an update", "HaloCord opens again in a moment");
            const until = Date.now() + 120000;
            while (Date.now() < until && await installerRunning()) await new Promise(r => setTimeout(r, 1000));
            // The installer starts the new version as its last step, so a launch from it finds the files already in place.
            if (Date.now() < until && exeStamp() !== startStamp) {
                console.log("[HaloCord] launch update: an install finished, starting again");
                require("./hc-guard.js").clean();
                app.relaunch();
                app.exit(0);
                return;
            }
        }
        if (await readyInstaller() && !gaveUpOn(latest.version)) return installNow();
        if (settings.autoUpdate === false) return done();
        await within(8000, check());
        if (!latest || gaveUpOn(latest.version)) return done();
        const { version } = latest;
        say("Downloading update", `HaloCord ${version}`, 0);
        onProgress = (got, total) => total && say("Downloading update",
            `HaloCord ${version} · ${Math.round(got / 1048576)} of ${Math.round(total / 1048576)} MB`, got / total * 100);
        // A slow line still opens HaloCord after two minutes; the download carries on for the Updater page.
        if (await within(120000, download()) !== "updated" || !staged) return done();
        return installNow();
    } catch (e) {
        console.warn("[HaloCord] launch update check:", e.message);
        done();
    } finally {
        onProgress = null;
    }
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

// win: the main window getter; hidden: started with --start-minimized. main.js creates the main window
// hidden, and the launch check shows it once HaloCord should open.
exports.init = ({ win, hidden }) => {
    app.whenReady().then(() => launch({ win, hidden })).catch(e => {
        console.error("[HaloCord] launch update failed:", e);
        const w = win();
        if (!hidden && w && !w.isDestroyed()) w.show();
    });
    handle("VencordGetRepo", () => `https://github.com/${REPO}`);
    handle("VencordGetUpdates", check);
    handle("VencordUpdate", download);
    handle("VencordForceUpdate", download);
    // The bundle calls this after an update to apply it; the installer applies it on restart instead.
    handle("VencordBuild", () => !!staged);
    ipcMain.handle("halocord:update-info", () => ({ version: app.getVersion(), commit: build.commit || "", upstream: build.upstream || {}, ready: latest && staged ? latest.version : null }));
    return { install };
};
