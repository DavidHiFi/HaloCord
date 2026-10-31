// HaloCord in-game overlay, main process side. The page (HaloOverlay plugin) sends its settings,
// the voice channel member list and notification toasts; this draws them in one transparent,
// click-through, always-on-top window over the display of the foreground game. It is a normal
// window, so it shows over windowed and borderless games but not exclusive fullscreen ones.
const { app, BrowserWindow, globalShortcut, ipcMain, screen } = require("electron");
const fs = require("fs"), path = require("path");

const TOAST_MS = 6000; // hc-overlay.js keeps a toast up this long, plus its 300 ms fade
const POLL_MS = 1000;
// Shell surfaces that are never a game: desktop, taskbars, Start, Alt+Tab, Task View.
const SHELL = new Set(["Progman", "WorkerW", "Shell_TrayWnd", "Shell_SecondaryTrayWnd", "Windows.UI.Core.CoreWindow",
    "XamlExplorerHostIslandWindow", "ForegroundStaging", "MultitaskingViewFrame", "TaskListThumbnailWnd"]);

let cfg = null, voice = null, owner = null, win = null, ready = false, queue = [];
let locked = true, toastUntil = 0, key = null, poll = null, bounds = "", pos = null, user32;

const posFile = () => path.join(app.getPath("userData"), "halocord-overlay.json");
try { pos = JSON.parse(fs.readFileSync(posFile(), "utf8")).pos || null; } catch (e) { }

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

// The display to draw on, or null when no game is in front. "fullscreen" (default) wants a foreground
// window that covers its whole display (fullscreen or borderless); "always" takes any foreground app.
// HaloCord itself and the Windows shell never count. Unlocked always shows, on the cursor's display.
function target() {
    if (!locked) return screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
    const u = fgApi();
    if (!u) return screen.getPrimaryDisplay();
    try {
        const h = u.fg();
        if (!h) return null;
        const p = [0];
        u.pid(h, p);
        if (p[0] === process.pid) return null;
        const b = Buffer.alloc(512), n = u.cls(h, b, 256);
        if (SHELL.has(b.toString("utf16le", 0, n * 2))) return null;
        const r = {};
        if (!u.rect(h, r)) return null;
        const d = screen.screenToDipRect(null, { x: r.left, y: r.top, width: r.right - r.left, height: r.bottom - r.top });
        const disp = screen.getDisplayMatching(d), db = disp.bounds;
        if (cfg.showOn === "always") return disp;
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
    send("hc-overlay:state", { cfg, voice, locked, pos });
}

function makeWin() {
    if (win && !win.isDestroyed()) return win;
    ready = false;
    win = new BrowserWindow({
        show: false, frame: false, transparent: true, backgroundColor: "#00000000", hasShadow: false,
        focusable: false, skipTaskbar: true, resizable: false, movable: false, minimizable: false,
        maximizable: false, fullscreenable: false, alwaysOnTop: true, title: "HaloCord Overlay",
        webPreferences: { preload: path.join(__dirname, "hc-overlay-preload.js"), contextIsolation: true, sandbox: true, spellcheck: false }
    });
    win.setAlwaysOnTop(true, "screen-saver");
    win.setIgnoreMouseEvents(locked);
    win.webContents.on("did-finish-load", () => {
        ready = true;
        win.webContents.send("hc-overlay:state", { cfg, voice, locked, pos });
        for (const [ch, data] of queue.splice(0)) win.webContents.send(ch, data);
    });
    win.on("closed", () => { win = null; ready = false; queue = []; bounds = ""; });
    win.loadFile(path.join(__dirname, "hc-overlay.html"));
    return win;
}

function hide() {
    if (win && !win.isDestroyed() && win.isVisible()) win.hide();
}

// Shows, moves or hides the window. Polls the foreground window only while there is something to show.
function update() {
    const on = cfg && cfg.enabled;
    const want = on && (!locked || (voice && voice.members.length > 0) || Date.now() < toastUntil);
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
}

function teardown() {
    clearInterval(poll);
    poll = null;
    setKey(null);
    locked = true;
    toastUntil = 0;
    if (win && !win.isDestroyed()) win.destroy();
    win = null;
}

function toggleLock() {
    locked = !locked;
    if (win && !win.isDestroyed()) win.setIgnoreMouseEvents(locked);
    push();
    update();
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

const str = (v, n) => String(v == null ? "" : v).slice(0, n);
const img = v => typeof v === "string" && v.startsWith("https://cdn.discordapp.com/") ? v.slice(0, 300) : "";

ipcMain.handle("halocord:overlay-config", (e, c) => {
    if (owner !== e.sender) {
        owner = e.sender;
        owner.once("destroyed", () => { owner = null; cfg = null; voice = null; teardown(); });
    }
    c = c || {};
    cfg = {
        enabled: !!c.enabled, keybind: str(c.keybind, 64), showOn: c.showOn === "always" ? "always" : "fullscreen",
        avatarSize: c.avatarSize === "small" ? "small" : "large",
        displayNames: ["always", "speaking", "never"].includes(c.displayNames) ? c.displayNames : "always",
        displayUsers: c.displayUsers === "speaking" ? "speaking" : "always",
        notifPos: ["topLeft", "topRight", "bottomLeft", "bottomRight", "disabled"].includes(c.notifPos) ? c.notifPos : "bottomRight",
        textNotifs: c.textNotifs !== false, opacity: Math.min(100, Math.max(10, Number(c.opacity) || 100))
    };
    const keyOk = cfg.enabled ? setKey(cfg.keybind || null) : setKey(null);
    if (!cfg.enabled) voice = null;
    push();
    update();
    return { keybind: keyOk };
});

ipcMain.on("halocord:overlay-voice", (e, v) => {
    voice = v && Array.isArray(v.members) ? {
        members: v.members.slice(0, 50).map(m => ({
            id: str(m.id, 24), name: str(m.name, 64), avatar: img(m.avatar),
            speaking: !!m.speaking, mute: !!m.mute, deaf: !!m.deaf
        }))
    } : null;
    if (!cfg || !cfg.enabled) return;
    push();
    update();
});

ipcMain.on("halocord:overlay-notify", (e, n) => {
    if (!cfg || !cfg.enabled || !cfg.textNotifs || cfg.notifPos === "disabled" || !n || !target()) return;
    toastUntil = Date.now() + TOAST_MS + 500;
    makeWin();
    send("hc-overlay:toast", { title: str(n.title, 120), body: str(n.body, 240), icon: img(n.icon) });
    update();
});

ipcMain.on("hc-overlay:pos", (e, p) => {
    if (!win || e.sender !== win.webContents || !p) return;
    pos = { x: Math.round(Number(p.x) || 0), y: Math.round(Number(p.y) || 0) };
    try { fs.writeFileSync(posFile(), JSON.stringify({ pos })); } catch (err) { }
});

app.on("will-quit", () => setKey(null));
