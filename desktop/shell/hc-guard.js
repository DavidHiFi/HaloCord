// Startup guard, loaded first in main.js.
// - A log file (userData\logs\halocord.log) with the main process output, crashed page or GPU processes, and the
//   Windows crash record of a run that ended on its own, so someone whose HaloCord closes can send what happened.
// - A safe start: after HaloCord closed by itself twice in a row within a minute of opening, it starts without
//   hardware acceleration, window transparency or blur, the game overlay and the exe icon rewrite. That stays on
//   for the rest of this version, so the next update tries the full app again.
const { app } = require("electron");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFile } = require("child_process");

const ud = app.getPath("userData");
const LOG_DIR = path.join(ud, "logs");
const LOG = path.join(LOG_DIR, "halocord.log");
const STATE = path.join(ud, "launch-guard.json");
const SETTLED_MS = 60000;  // a run that lasts this long did not crash at startup
const QUICK_LIMIT = 2;     // quick unclean exits in a row before a safe start
const LOG_MAX = 1024 * 1024, SESSION_MAX = 2 * 1024 * 1024;

let written = 0;
function line(text) {
    if (written > SESSION_MAX) return;
    const s = `${new Date().toISOString()} ${String(text).slice(0, 2000)}\n`;
    written += s.length;
    try { fs.appendFileSync(LOG, s); } catch { }
}

try {
    fs.mkdirSync(LOG_DIR, { recursive: true });
    if (fs.statSync(LOG, { throwIfNoEntry: false })?.size > LOG_MAX) fs.renameSync(LOG, path.join(LOG_DIR, "halocord.old.log"));
} catch { }

const read = () => { try { return JSON.parse(fs.readFileSync(STATE, "utf8")) || {}; } catch { return {}; } };
const version = app.getVersion();
const before = read();
const same = before.version === version;
// The run before this one ended without quitting and inside the first minute.
const crashedBefore = same && before.started && !before.clean;
const quickBefore = crashedBefore && !before.settled;
const quick = quickBefore ? (before.quick || 0) + 1 : 0;
const safe = same && (before.safe === true || quick >= QUICK_LIMIT);
exports.safe = safe;

line(`---- HaloCord ${version} starting, pid ${process.pid}, Windows ${os.release()}, ${os.arch()}, ${Math.round(os.totalmem() / 1073741824)} GB` +
    (crashedBefore ? `; the last run ended on its own${quickBefore ? " within a minute" : ""}` : "") + (safe ? "; SAFE START" : ""));
if (safe) app.disableHardwareAcceleration();

for (const level of ["log", "warn", "error"]) {
    const orig = console[level].bind(console);
    console[level] = (...args) => {
        orig(...args);
        line(`${level === "log" ? "" : level + ": "}${args.map(a => a instanceof Error ? a.stack : typeof a === "string" ? a : (() => { try { return JSON.stringify(a); } catch { return String(a); } })()).join(" ")}`);
    };
}
process.on("uncaughtExceptionMonitor", e => line(`uncaught exception: ${e?.stack ?? e}`));

let state = null;
const save = patch => {
    if (!state) return;
    Object.assign(state, patch);
    try { fs.writeFileSync(STATE, JSON.stringify(state)); } catch { }
};
// Marks this run as ended on purpose. Called at quit, and before app.exit, which skips will-quit.
exports.clean = () => { if (state && !state.clean) { save({ clean: true }); line("quit"); } };

// Windows' own crash record (Application Error / Application Hang) for HaloCord.exe from the last day.
function crashRecord() {
    const q = "*[System[(Provider[@Name='Application Error'] or Provider[@Name='Application Hang']) and TimeCreated[timediff(@SystemTime) <= 86400000]]]";
    execFile("wevtutil.exe", ["qe", "Application", `/q:${q}`, "/c:20", "/rd:true", "/f:text"], { windowsHide: true, timeout: 15000, maxBuffer: 4 << 20 }, (e, out) => {
        if (e) return line(`crash record: unavailable (${e.message})`);
        const hits = String(out).split(/\r?\nEvent\[\d+\]:?/).filter(b => /HaloCord\.exe/i.test(b)).slice(0, 2);
        if (!hits.length) return line("crash record: Windows logged no HaloCord crash in the last day");
        for (const b of hits) line("crash record:\n" + b.replace(/\r/g, "").split("\n").filter(l => l.trim()).slice(0, 30).join("\n"));
    });
}

app.whenReady().then(() => {
    // A second copy hands over to the running one and quits, so it leaves the running copy's record alone.
    if (!app.hasSingleInstanceLock()) return;
    state = { version, started: Date.now(), clean: false, settled: false, quick, safe };
    save({});
    setTimeout(() => { save({ settled: true, quick: 0 }); line("running for a minute"); }, SETTLED_MS).unref?.();
    app.on("will-quit", exports.clean);
    if (crashedBefore && process.platform === "win32") crashRecord();
    app.getGPUInfo("basic").then(g => {
        const d = (g.gpuDevice || []).map(x => `${x.active ? "*" : ""}${x.vendorId?.toString(16)}:${x.deviceId?.toString(16)} driver ${x.driverVersion ?? "?"}`).join(", ");
        line(`GPU: ${d || "unknown"}${safe ? " (hardware acceleration off)" : ""}`);
    }).catch(() => { });
}).catch(() => { });

app.on("child-process-gone", (_, d) => line(`process gone: ${d.type} ${d.reason} code ${d.exitCode}${d.name ? " " + d.name : ""}`));
app.on("render-process-gone", (_, wc, d) => line(`page process gone: ${d.reason} code ${d.exitCode} ${wc?.getURL?.().slice(0, 80) ?? ""}`));
app.on("session-end", exports.clean);
