// Screen share sound, captured per process the way Discord's desktop app does it: a window
// share hears only that app's process tree, a screen share hears everything except HaloCord,
// so the call and your own voice never go out with the stream. halocord-loopback.exe does the
// capture (48 kHz stereo float32 on stdout); the page (StreamEnhancer shareCapture.ts) turns
// it into the stream's audio track.
const { spawn } = require("child_process");
const path = require("path");
let cur = null, pidOf;

function windowPid(id) {
    const m = /^window:(\d+):/.exec(String(id));
    if (!m) return 0;
    if (!pidOf) {
        const k = require("koffi");
        pidOf = k.load("user32.dll").func("uint32 __stdcall GetWindowThreadProcessId(uintptr_t hwnd, _Out_ uint32_t *pid)");
    }
    const out = [0];
    pidOf(BigInt(m[1]), out);
    return out[0];
}

function stop() {
    if (cur) try { cur.kill(); } catch (e) {}
    cur = null;
}

// Returns true when capture started.
function start(source, wc) {
    stop();
    if (process.platform !== "win32" || !source || !wc || wc.isDestroyed()) return false;
    const isWindow = String(source.id).startsWith("window:");
    const pid = isWindow ? windowPid(source.id) : 0;
    // A HaloCord window would share the call itself, and an unknown window has no safe target.
    if (isWindow && (!pid || pid === process.pid)) return false;
    const p = spawn(path.join(process.resourcesPath, "halocord-loopback.exe"), [String(pid || process.pid), isWindow ? "include" : "exclude"],
        { windowsHide: true, stdio: ["pipe", "pipe", "ignore"] });
    cur = p;
    p.on("error", e => { console.error("[HaloCord] share audio failed", e); if (cur === p) cur = null; });
    p.on("exit", () => { if (cur === p) cur = null; });
    p.stdout.on("data", d => { if (cur === p && !wc.isDestroyed()) wc.send("halocord:share-audio", d); });
    return true;
}

module.exports = { start, stop };
