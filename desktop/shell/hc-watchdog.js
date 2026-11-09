// Keeps the main window from staying blank: a hung or crashed page reloads, a failed load retries,
// and a window shown from the tray repaints and reloads when its page no longer answers.
const { app } = require("electron");

const HANG_MS = 30000;
const PING_MS = 8000;
// Two crashes or hangs this close together are a loop (for example on joining a call): restart in safe start.
const LOOP_MS = 180000;
let trouble = [];
function loopCheck(why) {
    const now = Date.now();
    trouble = trouble.filter(t => now - t < LOOP_MS).concat(now);
    if (trouble.length < 2) return false;
    try { return require("./hc-guard.js").enterSafe("page " + why + " twice in 3 minutes"); } catch { return false; }
}

exports.watch = function watch(w) {
    const wc = w.webContents;
    let hangTimer = null;
    // Set while Electron reports the page as not answering. A reload drops any call, so only a page that is
    // really stuck gets one; HaloCalls rejoins the call after it.
    let hung = false;
    let retryMs = 3000;
    const log = m => console.log("[HaloCord] watchdog:", m);
    const reload = why => {
        if (w.isDestroyed()) return;
        log("reload, " + why);
        try { wc.reloadIgnoringCache(); } catch { }
    };

    wc.on("unresponsive", () => {
        hung = true;
        clearTimeout(hangTimer);
        hangTimer = setTimeout(() => {
            if (w.isDestroyed()) return;
            log("page hung for " + HANG_MS / 1000 + " s");
            if (loopCheck("hung")) return;
            try { wc.forcefullyCrashRenderer(); } catch { }
            setTimeout(() => reload("after hang"), 500);
        }, HANG_MS);
    });
    wc.on("responsive", () => { hung = false; clearTimeout(hangTimer); hangTimer = null; });

    // A page that keeps crashing backs off like a failed load instead of reloading every second.
    let crashMs = 1000;
    wc.on("render-process-gone", (_, d) => {
        if (d?.reason === "clean-exit") return;
        // A hang this watchdog ended is already counted.
        if (d?.reason !== "killed" && loopCheck("crashed (" + d?.reason + ")")) return;
        setTimeout(() => reload("page process " + d?.reason), crashMs);
        crashMs = Math.min(crashMs * 2, 60000);
    });

    wc.on("did-fail-load", (_, code, desc, url, isMain) => {
        // -3 is an aborted load, which a newer navigation causes on purpose.
        if (!isMain || code === -3) return;
        log("load failed " + code + " " + desc + ", retry in " + retryMs / 1000 + " s");
        setTimeout(() => { if (!w.isDestroyed()) wc.loadURL(url).catch(() => { }); }, retryMs);
        retryMs = Math.min(retryMs * 2, 60000);
    });
    wc.on("did-finish-load", () => { retryMs = 3000; crashMs = 1000; });

    w.on("show", () => {
        try { wc.invalidate(); } catch { }
        if (wc.isLoading() || wc.isCrashed()) return wc.isCrashed() && reload("crashed while hidden");
        let answered = false;
        wc.executeJavaScript("1", true).then(() => { answered = true; }).catch(() => { });
        // A busy page (joining a big call, a heavy channel) answers late but is fine: reload only a hung one.
        setTimeout(() => {
            if (answered || wc.isLoading()) return;
            if (hung) reload("no answer after show");
            else log("slow answer after show, left alone");
        }, PING_MS);
    });
};

// A lost GPU process leaves the window painted in its background colour until something redraws it.
app.on("child-process-gone", (_, d) => {
    if (d?.type !== "GPU") return;
    console.log("[HaloCord] watchdog: GPU process " + d.reason);
    setTimeout(() => {
        for (const w of require("electron").BrowserWindow.getAllWindows()) try { w.webContents.invalidate(); } catch { }
    }, 1500);
});
