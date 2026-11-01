// HaloCord desktop behaviour: Windows startup, start minimised, minimise to tray, and the
// Stable / PTB / Canary build choice. Prefs live in halocord-desktop.json in userData.
const { app, ipcMain } = require("electron");
const fs = require("fs");
const path = require("path");

const BUILDS = {
    stable: "https://discord.com/app",
    ptb: "https://ptb.discord.com/app",
    canary: "https://canary.discord.com/app"
};
const MIN_ARG = "--start-minimized";
const file = () => path.join(app.getPath("userData"), "halocord-desktop.json");

function read() {
    let p = {};
    try { p = JSON.parse(fs.readFileSync(file(), "utf8")) || {}; } catch { }
    return {
        startMinimized: !!p.startMinimized,
        // On by default, like Discord.
        minimizeToTray: p.minimizeToTray !== false,
        build: BUILDS[p.build] ? p.build : "stable"
    };
}

// Only the installed HaloCord.exe registers; a dev electron.exe would start a bare Electron at login.
const loginOpts = p => ({ path: process.execPath, args: p.startMinimized ? [MIN_ARG] : [] });
function openOnStartup(p) {
    if (!app.isPackaged) return false;
    const s = app.getLoginItemSettings(loginOpts(p));
    return !!(s.executableWillLaunchAtLogin ?? s.openAtLogin);
}
function setLogin(on, p) {
    if (app.isPackaged) app.setLoginItemSettings({ openAtLogin: on, name: "HaloCord", ...loginOpts(p) });
}

exports.init = ({ win, tray, show }) => {
    let prefs = read(), quitting = false;
    app.on("before-quit", () => { quitting = true; });
    // createWindow assigns win after the constructor returns, so check on the next tick.
    app.on("browser-window-created", (_, w) => setImmediate(() => {
        if (w !== win()) return;
        w.on("session-end", () => { quitting = true; });
        w.on("close", e => {
            if (quitting || !prefs.minimizeToTray) return;
            e.preventDefault();
            w.hide();
        });
    }));
    app.on("second-instance", () => { const w = win(); if (w && !w.isDestroyed() && !w.isVisible()) show(); });
    // The base tray only opens on double-click; Discord opens on a single click. createTray runs
    // in the base whenReady callback, which is registered before this one.
    app.whenReady().then(() => setImmediate(() => tray()?.on("click", show)));

    ipcMain.handle("halocord-desktop:get", () => ({
        ...prefs,
        openOnStartup: openOnStartup(prefs),
        canAutostart: app.isPackaged
    }));
    ipcMain.handle("halocord-desktop:set", (_, key, value) => {
        const on = !!value;
        if (key === "openOnStartup") setLogin(on, prefs);
        else if (key === "startMinimized" || key === "minimizeToTray") {
            const wasOn = openOnStartup(prefs);
            prefs = { ...prefs, [key]: on };
            // The login item carries the start-minimised arg; re-registering under the same name overwrites it.
            if (key === "startMinimized" && wasOn) setLogin(true, prefs);
        } else if (key === "build" && BUILDS[value]) prefs = { ...prefs, build: value };
        else return false;
        if (key !== "openOnStartup") fs.writeFileSync(file(), JSON.stringify(prefs));
        return true;
    });

    return {
        hidden: process.argv.includes(MIN_ARG),
        appUrl: () => BUILDS[prefs.build]
    };
};
