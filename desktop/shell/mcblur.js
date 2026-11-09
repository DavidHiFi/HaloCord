// Acrylic blur behind the HaloCord window, done the same way the Windhawk
// translucent-windows mod does it for Stable Discord: blur-behind on the whole
// window, then the acrylic accent policy with a tint. AARRGGBB 661E1E2E in the
// mod's settings is COLORREF 0x662E1E1E (alpha, blue, green, red).
let api;
function load() {
    if (api) return api;
    const k = require("koffi");
    const user32 = k.load("user32.dll"), dwm = k.load("dwmapi.dll"), gdi = k.load("gdi32.dll");
    const BB = k.struct("MC_DWM_BLURBEHIND", { dwFlags: "uint32", fEnable: "int32", hRgnBlur: "void*", fTransitionOnMaximized: "int32" });
    const AP = k.struct("MC_ACCENT_POLICY", { AccentState: "int32", AccentFlags: "int32", GradientColor: "uint32", AnimationId: "int32" });
    const WD = k.struct("MC_WCA_DATA", { Attrib: "int32", pvData: "void*", cbData: "size_t" });
    api = {
        k, AP,
        blurBehind: dwm.func("long __stdcall DwmEnableBlurBehindWindow(uintptr_t hwnd, const MC_DWM_BLURBEHIND *bb)"),
        rectRgn: gdi.func("void* __stdcall CreateRectRgn(int x1, int y1, int x2, int y2)"),
        deleteObject: gdi.func("int __stdcall DeleteObject(void *obj)"),
        swca: user32.func("int __stdcall SetWindowCompositionAttribute(uintptr_t hwnd, const MC_WCA_DATA *data)")
    };
    return api;
}

function hwndOf(win) {
    const b = win.getNativeWindowHandle();
    return b.length >= 8 ? b.readBigUInt64LE(0) : BigInt(b.readUInt32LE(0));
}

function themeTint(settings) {
    if (settings.haloTheming === false || settings.haloThemeVariant === "custom") return 0x661E1E1E;
    return settings.haloThemeVariant === "mochacord" ? 0x662E1E1E : 0x66181C15;
}

function savedTint() {
    try {
        const { app } = require("electron");
        const file = require("path").join(app.getPath("userData"), "TestCord", "settings", "settings.json");
        return themeTint(JSON.parse(require("fs").readFileSync(file, "utf8")));
    } catch { return 0x66181C15; }
}

// on: true applies acrylic with the given tint, false turns it back off.
function apply(win, on, tint = savedTint()) {
    if (process.platform !== "win32" || !win || win.isDestroyed()) return false;
    const { k, AP, blurBehind, rectRgn, deleteObject, swca } = load();
    const hwnd = hwndOf(win);
    const rgn = rectRgn(0, 0, -1, -1);
    try {
        blurBehind(hwnd, { dwFlags: 0x1 | 0x2 | 0x4, fEnable: on ? 1 : 0, hRgnBlur: rgn, fTransitionOnMaximized: on ? 1 : 0 });
    } finally {
        deleteObject(rgn);
    }
    const accent = k.alloc(AP, 1);
    try {
        k.encode(accent, AP, { AccentState: on ? 4 : 0, AccentFlags: 0, GradientColor: tint >>> 0, AnimationId: 0 });
        return swca(hwnd, { Attrib: 19, pvData: accent, cbData: k.sizeof(AP) }) !== 0;
    } finally {
        k.free(accent);
    }
}

module.exports = { apply, themeTint };
