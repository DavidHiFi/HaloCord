// Keeps the main window from staying blank: a hung or crashed page reloads, a failed load retries,
// and a window shown from the tray repaints and reloads when its page no longer answers.
const { app } = require("electron");

const HANG_MS = 15000;
const PING_MS = 8000;

exports.watch = function watch(w) {
    const wc = w.webContents;
    let hangTimer = null;
    let retryMs = 3000;
    const log = m => console.log("[HaloCord] watchdog:", m);
    const reload = why => {
        if (w.isDestroyed()) return;
        log("reload, " + why);
        try { wc.reloadIgnoringCache(); } catch { }
    };

    wc.on("unresponsive", () => {
        clearTimeout(hangTimer);
        hangTimer = setTimeout(() => {
            if (w.isDestroyed()) return;
            log("page hung for " + HANG_MS / 1000 + " s");
            try { wc.forcefullyCrashRenderer(); } catch { }
            setTimeout(() => reload("after hang"), 500);
        }, HANG_MS);
    });
    wc.on("responsive", () => { clearTimeout(hangTimer); hangTimer = null; });

    wc.on("render-process-gone", (_, d) => {
        if (d?.reason === "clean-exit") return;
        setTimeout(() => reload("page process " + d?.reason), 1000);
    });

    wc.on("did-fail-load", (_, code, desc, url, isMain) => {
        // -3 is an aborted load, which a newer navigation causes on purpose.
        if (!isMain || code === -3) return;
        log("load failed " + code + " " + desc + ", retry in " + retryMs / 1000 + " s");
        setTimeout(() => { if (!w.isDestroyed()) wc.loadURL(url).catch(() => { }); }, retryMs);
        retryMs = Math.min(retryMs * 2, 60000);
    });
    wc.on("did-finish-load", () => { retryMs = 3000; });

    w.on("show", () => {
        try { wc.invalidate(); } catch { }
        if (wc.isLoading() || wc.isCrashed()) return wc.isCrashed() && reload("crashed while hidden");
        let answered = false;
        wc.executeJavaScript("1", true).then(() => { answered = true; }).catch(() => { });
        setTimeout(() => { if (!answered && !wc.isLoading()) reload("no answer after show"); }, PING_MS);
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
