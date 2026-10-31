// usage: node blur-check.cjs  -> reads the acrylic accent state of each visible MochaCord window
const k = require("../vendor/package");
const u = k.load("user32.dll");
const AP = k.struct("AP", { AccentState: "int32", AccentFlags: "int32", GradientColor: "uint32", AnimationId: "int32" });
const WD = k.struct("WD", { Attrib: "int32", pvData: "void*", cbData: "size_t" });
const gwca = u.func("int __stdcall GetWindowCompositionAttribute(uintptr_t hwnd, WD *data)");
const findEx = u.func("uintptr_t __stdcall FindWindowExW(uintptr_t p, uintptr_t a, const char16_t *c, const char16_t *t)");
const gtp = u.func("uint32 __stdcall GetWindowThreadProcessId(uintptr_t h, _Out_ uint32 *pid)");
const vis = u.func("int __stdcall IsWindowVisible(uintptr_t h)");
const title = u.func("int __stdcall GetWindowTextW(uintptr_t h, _Out_ char16_t *buf, int n)");
const pids = new Set(process.argv.slice(2).map(Number));
let h = 0;
while ((h = findEx(0, h, "Chrome_WidgetWin_1", null))) {
    const pid = [0]; gtp(h, pid);
    if (!pids.has(pid[0]) || !vis(h)) continue;
    const buf = Buffer.alloc(512); title(h, buf, 256);
    const mem = k.alloc(AP, 1);
    const ok = gwca(h, { Attrib: 19, pvData: mem, cbData: k.sizeof(AP) });
    const ap = k.decode(mem, AP); k.free(mem);
    console.log(JSON.stringify({ title: buf.toString("utf16le").replace(/\0.*$/, ""), ok, accent: ap.AccentState, tint: "0x" + ap.GradientColor.toString(16) }));
}
