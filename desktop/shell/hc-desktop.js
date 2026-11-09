// HaloCord desktop behaviour: Windows startup, start minimised, minimise to tray, the
// Stable / PTB / Canary build choice and the app icon. Prefs live in halocord-desktop.json in userData.
const { app, ipcMain, shell } = require("electron");
const { execFile } = require("child_process");
const fs = require("fs");
const path = require("path");
const hcIcon = require("./hc-icon.js");

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
        startupMethod: METHODS.includes(p.startupMethod) ? p.startupMethod : "shortcut",
        build: BUILDS[p.build] ? p.build : "stable",
        appIcon: hcIcon.variantOf(p.appIcon),
        // What the last HaloCord.exe icon rewrite left, see hc-icon.js.
        exeIcon: p.exeIcon && typeof p.exeIcon === "object" ? p.exeIcon : null
    };
}
// The window and tray constructors in main.js call icon() before init's IPC is used, so prefs load lazily.
let prefs = null;
const current = () => prefs ??= read();
const save = () => fs.writeFileSync(file(), JSON.stringify(prefs));
exports.icon = () => hcIcon.icoPath(current().appIcon);

// Startup runs through a shortcut in the user's Startup folder (default) or a logon scheduled task,
// which Windows starts earlier. Only the installed HaloCord.exe registers; a dev electron.exe would
// start a bare Electron at login.
const METHODS = ["shortcut", "task"];
const TASK = "HaloCord Startup";
const startupLnk = () => path.join(app.getPath("appData"), "Microsoft", "Windows", "Start Menu", "Programs", "Startup", "HaloCord.lnk");
const startArgs = p => p.startMinimized ? [MIN_ARG] : [];
// Older builds registered through Electron's login item (the HKCU Run key).
const legacyOpts = { path: process.execPath, args: [] };
const legacyOn = () => {
    const s = app.getLoginItemSettings(legacyOpts);
    const m = app.getLoginItemSettings({ ...legacyOpts, args: [MIN_ARG] });
    return !!(s.executableWillLaunchAtLogin || s.openAtLogin || m.executableWillLaunchAtLogin || m.openAtLogin);
};
const clearLegacy = () => {
    for (const args of [[], [MIN_ARG]]) app.setLoginItemSettings({ openAtLogin: false, name: "HaloCord", path: process.execPath, args });
};

const schtasks = args => new Promise(resolve =>
    execFile("schtasks.exe", args, { windowsHide: true }, err => resolve(!err)));
const xmlEsc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
async function createTask(p) {
    const user = `${process.env.USERDOMAIN}\\${process.env.USERNAME}`;
    // Normal priority (the schtasks default is below normal), no battery or time limits, no delay.
    const xml = `<?xml version="1.0" encoding="UTF-16"?>
<Task version="1.2" xmlns="http://schemas.microsoft.com/windows/2004/02/mit/task">
  <RegistrationInfo><Description>Opens HaloCord when you sign in.</Description></RegistrationInfo>
  <Triggers><LogonTrigger><Enabled>true</Enabled><UserId>${xmlEsc(user)}</UserId></LogonTrigger></Triggers>
  <Principals><Principal id="Author"><UserId>${xmlEsc(user)}</UserId><LogonType>InteractiveToken</LogonType><RunLevel>LeastPrivilege</RunLevel></Principal></Principals>
  <Settings>
    <MultipleInstancesPolicy>IgnoreNew</MultipleInstancesPolicy>
    <DisallowStartIfOnBatteries>false</DisallowStartIfOnBatteries>
    <StopIfGoingOnBatteries>false</StopIfGoingOnBatteries>
    <ExecutionTimeLimit>PT0S</ExecutionTimeLimit>
    <Priority>4</Priority>
  </Settings>
  <Actions Context="Author"><Exec><Command>${xmlEsc(process.execPath)}</Command><Arguments>${xmlEsc(startArgs(p).join(" "))}</Arguments></Exec></Actions>
</Task>`;
    const tmp = path.join(app.getPath("temp"), `halocord-task-${process.pid}.xml`);
    fs.writeFileSync(tmp, "﻿" + xml, "utf16le");
    try { return await schtasks(["/Create", "/F", "/TN", TASK, "/XML", tmp]); } finally { fs.rmSync(tmp, { force: true }); }
}

async function openOnStartup() {
    if (!app.isPackaged) return false;
    return fs.existsSync(startupLnk()) || legacyOn() || await schtasks(["/Query", "/TN", TASK]);
}
// Clears every startup entry, then registers the chosen one, so switching never leaves two.
async function setLogin(on, p) {
    if (!app.isPackaged) return false;
    clearLegacy();
    fs.rmSync(startupLnk(), { force: true });
    if (await schtasks(["/Query", "/TN", TASK])) await schtasks(["/Delete", "/F", "/TN", TASK]);
    if (!on) return true;
    if (p.startupMethod === "task") return createTask(p);
    return shell.writeShortcutLink(startupLnk(), "create", {
        target: process.execPath, args: startArgs(p).join(" "), cwd: path.dirname(process.execPath),
        description: "HaloCord", icon: exports.icon(), iconIndex: 0
    });
}

exports.init = ({ win, tray, show }) => {
    let quitting = false;
    current();
    app.on("before-quit", () => { quitting = true; });
    app.on("will-quit", () => hcIcon.finishPending());
    // One icon rewrite at a time; each uses the newest choice, so quick switches settle on the last one.
    let iconQueue = Promise.resolve();
    const applyIcon = windows => iconQueue = iconQueue.then(async () => {
        const r = await hcIcon.apply(prefs.appIcon, { tray: tray(), exeState: prefs.exeIcon, windows });
        if (r.exeState !== prefs.exeIcon) { prefs = { ...prefs, exeIcon: r.exeState }; save(); }
        const { exeState, ...result } = r;
        return result;
    }).catch(e => ({ variant: prefs.appIcon, error: String(e?.message ?? e) }));
    // createWindow assigns win after the constructor returns, so check on the next tick.
    app.on("browser-window-created", (_, w) => setImmediate(() => {
        if (w.isDestroyed()) return;
        w.setIcon(exports.icon());
        if (w !== win()) return;
        require("./hc-watchdog.js").watch(w);
        w.on("session-end", () => { quitting = true; hcIcon.finishPending(); });
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
    // An install or update puts the green exe and fresh shortcuts back; restore the chosen icon after startup settles.
    app.whenReady().then(() => setTimeout(() => { hcIcon.cleanup(); applyIcon(false); }, 8000));

    // Move an older Run-key registration to the chosen method (the shortcut by default).
    app.whenReady().then(() => setTimeout(() => {
        if (app.isPackaged && legacyOn()) setLogin(true, prefs).catch(() => { });
    }, 5000));

    ipcMain.handle("halocord-desktop:get", async () => ({
        ...prefs,
        openOnStartup: await openOnStartup(),
        canAutostart: app.isPackaged,
        canSetAppIcon: app.isPackaged && process.platform === "win32"
    }));
    ipcMain.handle("halocord-desktop:set", async (_, key, value) => {
        const on = !!value;
        if (key === "openOnStartup") return setLogin(on, prefs);
        if (key === "startMinimized" || key === "minimizeToTray" || (key === "startupMethod" && METHODS.includes(value))) {
            const wasOn = key !== "minimizeToTray" && await openOnStartup();
            prefs = { ...prefs, [key]: key === "startupMethod" ? value : on };
            save();
            // The startup entry carries the start-minimised arg and the method; re-register it.
            return wasOn ? setLogin(true, prefs) : true;
        } else if (key === "build" && BUILDS[value]) prefs = { ...prefs, build: value };
        else if (key === "appIcon" && hcIcon.variantOf(value) === value) {
            prefs = { ...prefs, appIcon: value };
            save();
            return applyIcon(true);
        } else return false;
        save();
        return true;
    });

    return {
        hidden: process.argv.includes(MIN_ARG),
        appUrl: () => BUILDS[prefs.build]
    };
};
