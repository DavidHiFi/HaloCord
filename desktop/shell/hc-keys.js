// Global keybinds: runs resources\keys\hckeys.exe (desktop/keys) while the page has keybinds and passes its
// key events to the page, where the haloKeybinds plugin turns them into Discord's keybind callbacks. The
// page sends only the keys its keybinds use ("k65" = key code, "m3" = mouse button), plus every key while a
// key recorder is open, so the helper reports nothing else. Nothing is logged.
const { app, ipcMain } = require("electron");
const { spawn } = require("child_process");
const path = require("path");
let proc = null, target = null, codes = [], all = false, restarts = 0, quitting = false;

function send() {
    if (proc && proc.stdin.writable) proc.stdin.write(`f ${codes.join(" ")}\nw ${all ? 1 : 0}\n`);
}

function stop() {
    const p = proc;
    proc = null;
    if (p) try { p.kill(); } catch (e) {}
}

function start() {
    if (proc || quitting || restarts > 5) return;
    const p = proc = spawn(path.join(process.resourcesPath, "keys", "hckeys.exe"), [String(process.pid)],
        { windowsHide: true, stdio: ["pipe", "pipe", "ignore"] });
    let buf = "";
    p.stdout.setEncoding("ascii");
    // A helper that ran for a while was healthy, so its later exits start a fresh restart budget.
    const healthy = setTimeout(() => { if (proc === p) restarts = 0; }, 30000);
    p.stdout.on("data", d => {
        buf += d;
        for (let i; (i = buf.indexOf("\n")) >= 0; buf = buf.slice(i + 1)) {
            const [dev, down, code] = buf.slice(0, i).split(" ").map(Number);
            if (target && !target.isDestroyed()) target.send("halocord:keys-event", dev, down, code);
        }
    });
    p.stdin.on("error", () => {});
    p.on("error", e => {
        if (e.code === "ENOENT") restarts = 99;
        if (proc === p) proc = null;
    });
    p.on("exit", () => {
        clearTimeout(healthy);
        if (proc !== p) return;
        proc = null;
        if (!quitting && ++restarts <= 5) setTimeout(() => (codes.length || all) && start(), 2000);
    });
    send();
}

function init() {
    if (process.platform !== "win32") return;
    ipcMain.on("halocord:keys-filter", (e, list, watchAll) => {
        target = e.sender;
        codes = (Array.isArray(list) ? list : []).filter(c => /^[km]\d{1,3}$/.test(c)).slice(0, 512);
        all = !!watchAll;
        if (!codes.length && !all) return stop();
        if (proc) send();
        else start();
    });
    app.on("will-quit", () => {
        quitting = true;
        stop();
    });
}

module.exports = { init };
