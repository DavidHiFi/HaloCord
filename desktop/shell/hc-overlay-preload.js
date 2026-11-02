// Preload for the HaloCord overlay window (hc-overlay.html): state and toasts in; widget positions,
// clickable regions and button presses out.
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("hcOverlay", {
    onState: cb => ipcRenderer.on("hc-overlay:state", (e, s) => cb(s)),
    onToast: cb => ipcRenderer.on("hc-overlay:toast", (e, t) => cb(t)),
    savePos: (widget, x, y) => ipcRenderer.send("hc-overlay:pos", { widget, x, y }),
    regions: list => ipcRenderer.send("hc-overlay:regions", list),
    action: (kind, channelId) => ipcRenderer.send("hc-overlay:action", { kind, channelId })
});
