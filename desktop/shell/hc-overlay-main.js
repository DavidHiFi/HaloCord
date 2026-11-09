// HaloCord in-game overlay, main process side. The page (HaloOverlay plugin) sends its settings, the
// voice channel, friends' activity and notices; this draws them in one transparent, click-through,
// always-on-top window over the display of the foreground game. It is a normal window, so it shows over
// windowed and borderless games but not exclusive fullscreen ones. Games are found by matching running
// processes against Discord's public list of detectable games (hc-overlay-games.js).
const { app, BrowserWindow, globalShortcut, ipcMain, screen } = require("electron");
const fs = require("fs"), path = require("path");
const games = require("./hc-overlay-games.js");

const TOAST_MS = 6000; // hc-overlay.js keeps a toast up this long, plus its 300 ms fade
const POLL_MS = 1000, SCAN_MS = 5000, HOVER_MS = 100;
const DAY = 864e5, RETRY_MS = 36e5, PENDING_MS = 60000, MAX_SEEN = 60;
const DETECTABLE = "https://discord.com/api/v9/applications/detectable";
// Shell surfaces that are never a game: desktop, taskbars, Start, Alt+Tab, Task View.
const SHELL = new Set(["Progman", "WorkerW", "Shell_TrayWnd", "Shell_SecondaryTrayWnd", "Windows.UI.Core.CoreWindow",
    "XamlExplorerHostIslandWindow", "ForegroundStaging", "MultitaskingViewFrame", "TaskListThumbnailWnd"]);
const WIDGETS = ["voice", "quick", "activity"];
const NOTICES = ["message", "welcome", "golive", "activity", "nowplaying"];

let cfg = null, voice = null, activity = [], owner = null, win = null, ready = false, queue = [];
let locked = true, toastUntil = 0, key = null, poll = null, bounds = "", user32;
let pending = [], regions = [], hoverTimer = null, passThrough = true;
let index = null, indexAt = 0, fetching = false, lastFetch = 0, scanTimer = null, running = new Map(), runningKey = "";

const userFile = n => path.join(app.getPath("userData"), n);
const num = (v, lo, hi, d) => Number.isFinite(Number(v)) ? Math.min(hi, Math.max(lo, Math.round(Number(v)))) : d;
const str = (v, n) => String(v == null ? "" : v).slice(0, n);
const img = v => typeof v === "string" && v.startsWith("https://cdn.discordapp.com/") ? v.slice(0, 300) : "";
const snowflake = v => typeof v === "string" && /^\d{1,20}$/.test(v) ? v : "";
const hex = v => typeof v === "string" && /^#[0-9a-f]{6}$/i.test(v) ? v.toLowerCase() : "";

// halocord-overlay.json: widget positions (per widget, relative to the display) and per-game on/off.
// Before 2.11 it held only { pos: { x, y } } for the voice widget.
const store = { pos: {}, games: {} };
try {
    const j = JSON.parse(fs.readFileSync(userFile("halocord-overlay.json"), "utf8")) || {};
    const p = j.pos && typeof j.pos.x === "number" ? { voice: j.pos } : j.pos || {};
    for (const w of WIDGETS) if (p[w]) store.pos[w] = { x: num(p[w].x, -1e5, 1e5, 0), y: num(p[w].y, -1e5, 1e5, 0) };
    for (const [id, g] of Object.entries(j.games || {}))
        if (snowflake(id) && g) store.games[id] = { name: str(g.name, 100), icon: str(g.icon, 64), on: g.on !== false, seen: num(g.seen, 0, 9e15, 0) };
} catch (e) { }

function save() {
    try { fs.writeFileSync(userFile("halocord-overlay.json"), JSON.stringify(store)); } catch (e) { }
}

function emit(type, data) {
    if (owner && !owner.isDestroyed()) owner.send("halocord:overlay-event", type, data);
}

function gameList() {
    const ids = new Set(running.values());
    const list = Object.entries(store.games).map(([id, g]) => ({ id, name: g.name, icon: g.icon, on: g.on, seen: g.seen, running: ids.has(id) }));
    return list.sort((a, b) => b.running - a.running || b.seen - a.seen);
}

// Detectable games list: cached under userData for a day; a failed fetch keeps the old copy and retries hourly.
async function refreshIndex() {
    if (!index) {
        try {
            const j = JSON.parse(fs.readFileSync(userFile("halocord-detectable.json"), "utf8"));
            if (j && j.index && j.index.exe && j.index.apps) ({ index } = j), indexAt = Number(j.t) || 0;
        } catch (e) { }
    }
    if (fetching || Date.now() - indexAt < DAY || Date.now() - lastFetch < RETRY_MS) return;
    fetching = true;
    lastFetch = Date.now();
    try {
        const r = await fetch(DETECTABLE, { signal: AbortSignal.timeout(30000) });
        if (!r.ok) throw new Error("HTTP " + r.status);
        const next = games.buildIndex(await r.json());
        if (!Object.keys(next.apps).length) throw new Error("empty list");
        index = next;
        indexAt = Date.now();
        fs.writeFile(userFile("halocord-detectable.json"), JSON.stringify({ t: indexAt, index }), () => { });
        scan();
    } catch (e) {
        console.error("[HaloCord] overlay: could not fetch the detectable games list", e);
    } finally { fetching = false; }
}

function scan() {
    if (!cfg || !cfg.enabled || !index) return;
    let hits;
    try { hits = games.match(index, games.processes(), games.fullPath); } catch (e) { return; }
    const ids = [...new Set(hits.values())].sort(), was = new Set(running.values());
    let changed = false;
    for (const id of ids) {
        const [name, icon] = index.apps[id], g = store.games[id];
        if (!g) store.games[id] = { name, icon, on: true, seen: Date.now() };
        else if (!was.has(id)) Object.assign(g, { name, icon, seen: Date.now() });
        else continue;
        changed = true;
    }
    if (changed) {
        const old = Object.entries(store.games).sort((a, b) => b[1].seen - a[1].seen).slice(MAX_SEEN);
        for (const [id] of old) delete store.games[id];
        save();
    }
    running = hits;
    // A game started (or the overlay was just turned on with one running): the page sends its game notices.
    for (const id of ids) if (!was.has(id) && store.games[id] && store.games[id].on) emit("playing", { id, name: store.games[id].name });
    if (changed || ids.join() !== runningKey) {
        runningKey = ids.join();
        emit("games", gameList());
    }
    update();
}

function setScanning(on) {
    if (!on) {
        clearInterval(scanTimer);
        scanTimer = null;
        if (running.size) emit("games", (running = new Map(), runningKey = "", gameList()));
        return;
    }
    if (scanTimer) return;
    scanTimer = setInterval(() => { scan(); refreshIndex(); }, SCAN_MS);
    refreshIndex().then(scan);
}

function fgApi() {
    if (user32 !== undefined) return user32;
    user32 = null;
    if (process.platform !== "win32") return null;
    try {
        const k = require("koffi"), u = k.load("user32.dll");
        k.struct("HC_OV_RECT", { left: "int32", top: "int32", right: "int32", bottom: "int32" });
        user32 = {
            fg: u.func("uintptr_t __stdcall GetForegroundWindow()"),
            rect: u.func("int __stdcall GetWindowRect(uintptr_t hwnd, _Out_ HC_OV_RECT *rect)"),
            pid: u.func("uint32 __stdcall GetWindowThreadProcessId(uintptr_t hwnd, _Out_ uint32 *pid)"),
            cls: u.func("int __stdcall GetClassNameW(uintptr_t hwnd, void *buf, int max)")
        };
    } catch (e) { console.error("[HaloCord] overlay: user32 unavailable, using the primary display", e); }
    return user32;
}

// The display to draw on, or null when nothing qualifies. "games" (default) wants a detected game in front;
// "fullscreen" any foreground window that covers its display; "always" any foreground app. Games switched
// off, HaloCord itself and the Windows shell never count. Unlocked always shows, on the cursor's display.
function target() {
    if (!locked) return screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
    const u = fgApi();
    if (!u) return cfg.showOn === "games" ? null : screen.getPrimaryDisplay();
    try {
        const h = u.fg();
        if (!h) return null;
        const p = [0];
        u.pid(h, p);
        if (p[0] === process.pid) return null;
        const id = running.get(p[0]);
        if (id && store.games[id] && !store.games[id].on) return null;
        if (cfg.showOn === "games" && !id) return null;
        const b = Buffer.alloc(512), n = u.cls(h, b, 256);
        if (SHELL.has(b.toString("utf16le", 0, n * 2))) return null;
        const r = {};
        if (!u.rect(h, r)) return null;
        const d = screen.screenToDipRect(null, { x: r.left, y: r.top, width: r.right - r.left, height: r.bottom - r.top });
        const disp = screen.getDisplayMatching(d), db = disp.bounds;
        if (cfg.showOn !== "fullscreen") return disp;
        const full = d.x <= db.x + 1 && d.y <= db.y + 1 && d.x + d.width >= db.x + db.width - 1 && d.y + d.height >= db.y + db.height - 1;
        return full ? disp : null;
    } catch (e) { return null; }
}

function send(ch, data) {
    if (!win || win.isDestroyed()) return;
    if (ready) win.webContents.send(ch, data);
    else queue.push([ch, data]);
}

function push() {
    send("hc-overlay:state", { cfg, voice, activity, locked, pos: store.pos });
}

function makeWin() {
    if (win && !win.isDestroyed()) return win;
    ready = false;
    passThrough = true;
    win = new BrowserWindow({
        show: false, frame: false, transparent: true, backgroundColor: "#00000000", hasShadow: false,
        focusable: false, skipTaskbar: true, resizable: false, movable: false, minimizable: false,
        maximizable: false, fullscreenable: false, alwaysOnTop: true, title: "HaloCord Overlay",
        webPreferences: { preload: path.join(__dirname, "hc-overlay-preload.js"), contextIsolation: true, sandbox: true, spellcheck: false }
    });
    win.setAlwaysOnTop(true, "screen-saver");
    win.setIgnoreMouseEvents(true);
    win.webContents.on("did-finish-load", () => {
        ready = true;
        push();
        for (const [ch, data] of queue.splice(0)) win.webContents.send(ch, data);
    });
    win.on("closed", () => { win = null; ready = false; queue = []; bounds = ""; regions = []; hover(); });
    win.loadFile(path.join(__dirname, "hc-overlay.html"));
    return win;
}

function hide() {
    if (win && !win.isDestroyed() && win.isVisible()) win.hide();
    hover();
}

function inVoice() {
    return !!(voice && voice.members.length && cfg.widgets.voice || voice && cfg.widgets.quick);
}

// Shows, moves or hides the window. Polls the foreground window only while there is something to show.
function update() {
    const on = cfg && cfg.enabled;
    pending = pending.filter(n => n.until > Date.now());
    const want = on && (!locked || inVoice() || Date.now() < toastUntil || pending.length > 0);
    if (!want) {
        clearInterval(poll);
        poll = null;
        return on ? hide() : teardown();
    }
    if (!poll) poll = setInterval(update, POLL_MS);
    const d = target();
    if (!d) return hide();
    const w = makeWin(), b = JSON.stringify(d.bounds);
    if (b !== bounds) {
        bounds = b;
        w.setBounds(d.bounds);
    }
    if (!w.isVisible()) {
        w.setAlwaysOnTop(true, "screen-saver");
        w.showInactive();
    }
    if (pending.length) for (const n of pending.splice(0)) toast(n.toast);
    hover();
}

function toast(t) {
    toastUntil = Date.now() + TOAST_MS + 500;
    send("hc-overlay:toast", t);
}

function teardown() {
    clearInterval(poll);
    poll = null;
    setScanning(false);
    setKey(null);
    locked = true;
    toastUntil = 0;
    pending = [];
    if (win && !win.isDestroyed()) win.destroy();
    win = null;
    hover();
}

function setPassThrough(v) {
    if (!win || win.isDestroyed() || passThrough === v) return;
    passThrough = v;
    win.setIgnoreMouseEvents(v);
}

// Clickable regions while locked: the page reports where its buttons and toasts are; the window takes
// clicks only while the cursor is over one. A cursor check every 100 ms, only while such a region is on screen.
function hover() {
    const live = win && !win.isDestroyed() && win.isVisible();
    if (!live || !locked || !cfg || !cfg.clickable || !regions.length) {
        clearInterval(hoverTimer);
        hoverTimer = null;
        return setPassThrough(locked);
    }
    hoverTimer ||= setInterval(() => {
        if (!win || win.isDestroyed()) return;
        const c = screen.getCursorScreenPoint(), b = win.getBounds(), x = c.x - b.x, y = c.y - b.y;
        setPassThrough(!regions.some(r => x >= r[0] && y >= r[1] && x < r[0] + r[2] && y < r[1] + r[3]));
    }, HOVER_MS);
}

function toggleLock() {
    locked = !locked;
    emit("lock", locked);
    push();
    update();
    hover();
}

function setKey(accel) {
    if (key === accel) return true;
    if (key) try { globalShortcut.unregister(key); } catch (e) { }
    key = null;
    if (!accel) return true;
    try {
        if (globalShortcut.register(accel, toggleLock)) key = accel;
    } catch (e) { }
    return key === accel;
}

const pick = (v, list, d) => list.includes(v) ? v : d;

ipcMain.handle("halocord:overlay-config", (e, c) => {
    if (owner !== e.sender) {
        owner = e.sender;
        const was = owner;
        // Only the current owner going away clears the state; a replaced owner's page can close later.
        was.once("destroyed", () => { if (owner !== was) return; owner = null; cfg = null; voice = null; activity = []; teardown(); });
    }
    c = c || {};
    const w = c.widgets || {}, n = c.notices || {};
    cfg = {
        enabled: !!c.enabled, keybind: str(c.keybind, 64), showOn: pick(c.showOn, ["games", "fullscreen", "always"], "games"),
        avatarSize: pick(c.avatarSize, ["large", "small"], "large"),
        displayNames: pick(c.displayNames, ["always", "speaking", "never"], "always"),
        displayUsers: pick(c.displayUsers, ["always", "speaking"], "always"),
        maxUsers: num(c.maxUsers, 0, 25, 8),
        notifPos: pick(c.notifPos, ["topLeft", "topRight", "bottomLeft", "bottomRight"], "bottomRight"),
        opacity: num(c.opacity, 10, 100, 100), clickable: !!c.clickable,
        widgets: { voice: w.voice !== false, quick: w.quick !== false, notifications: w.notifications !== false, activity: !!w.activity },
        notices: Object.fromEntries(NOTICES.map(k => [k, n[k] !== false])),
        accent: hex(c.accent) || "#dbdee1"
    };
    const keyOk = cfg.enabled ? setKey(cfg.keybind || null) : setKey(null);
    if (!cfg.enabled) voice = null, activity = [];
    setScanning(cfg.enabled);
    push();
    update();
    return { keybind: keyOk };
});

ipcMain.handle("halocord:overlay-games", e => e.sender === owner ? gameList() : []);

ipcMain.handle("halocord:overlay-set-game", (e, id, on) => {
    const g = e.sender === owner && store.games[snowflake(id)];
    if (!g) return false;
    g.on = !!on;
    save();
    emit("games", gameList());
    update();
    return true;
});

ipcMain.handle("halocord:overlay-reset", e => {
    if (e.sender !== owner) return false;
    store.pos = {};
    save();
    push();
    return true;
});

ipcMain.on("halocord:overlay-voice", (e, v) => {
    if (e.sender !== owner) return;
    voice = v && Array.isArray(v.members) ? {
        channel: str(v.channel, 100),
        self: { mute: !!(v.self && v.self.mute), deaf: !!(v.self && v.self.deaf) },
        members: v.members.slice(0, 50).map(m => ({
            id: str(m.id, 24), name: str(m.name, 64), avatar: img(m.avatar),
            speaking: !!m.speaking, mute: !!m.mute, deaf: !!m.deaf
        }))
    } : null;
    if (!cfg || !cfg.enabled) return;
    push();
    update();
});

ipcMain.on("halocord:overlay-activity", (e, list) => {
    if (e.sender !== owner || !cfg || !cfg.enabled) return;
    activity = Array.isArray(list) ? list.slice(0, 20).map(a => ({
        id: str(a && a.id, 24), name: str(a && a.name, 64), avatar: img(a && a.avatar), game: str(a && a.game, 100), same: !!(a && a.same)
    })) : [];
    push();
});

ipcMain.on("halocord:overlay-notify", (e, n) => {
    if (e.sender !== owner || !cfg || !cfg.enabled || !cfg.widgets.notifications || !n) return;
    const kind = pick(n.kind, NOTICES, "message");
    if (!cfg.notices[kind]) return;
    const t = { kind, title: str(n.title, 120), body: str(n.body, 240), icon: img(n.icon), channelId: snowflake(n.channelId) };
    // Game notices fire when the game starts, often before its window is up: hold them until it is in front.
    if (!target()) {
        if (kind !== "message") pending = [...pending, { toast: t, until: Date.now() + PENDING_MS }].slice(-3);
        return update();
    }
    makeWin();
    toast(t);
    update();
});

const fromOverlay = e => win && !win.isDestroyed() && e.sender === win.webContents;

ipcMain.on("hc-overlay:pos", (e, p) => {
    if (!fromOverlay(e) || !p || !WIDGETS.includes(p.widget)) return;
    store.pos[p.widget] = { x: num(p.x, -1e5, 1e5, 0), y: num(p.y, -1e5, 1e5, 0) };
    save();
});

ipcMain.on("hc-overlay:regions", (e, list) => {
    if (!fromOverlay(e)) return;
    regions = Array.isArray(list) ? list.slice(0, 16).filter(Array.isArray)
        .map(r => [num(r[0], -1e5, 1e5, 0), num(r[1], -1e5, 1e5, 0), num(r[2], 0, 1e5, 0), num(r[3], 0, 1e5, 0)])
        .filter(r => r[2] > 0 && r[3] > 0) : [];
    hover();
});

// Overlay buttons: mute, deafen, disconnect run in the page; a toast click opens its channel in HaloCord.
ipcMain.on("hc-overlay:action", (e, a) => {
    if (!fromOverlay(e) || !a || !owner || owner.isDestroyed() || (locked && !(cfg && cfg.clickable))) return;
    const kind = pick(a.kind, ["mute", "deaf", "disconnect", "open"], "");
    if (!kind) return;
    if (kind === "open") {
        const w = BrowserWindow.fromWebContents(owner);
        if (w) {
            if (w.isMinimized()) w.restore();
            w.show();
            w.focus();
        }
    }
    emit("action", { kind, channelId: snowflake(a.channelId) });
});

app.on("will-quit", () => setKey(null));
