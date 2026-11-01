// Preload for the HaloCord overlay window (hc-overlay.html): state and toasts in, widget position out.
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("hcOverlay", {
    onState: cb => ipcRenderer.on("hc-overlay:state", (e, s) => cb(s)),
    onToast: cb => ipcRenderer.on("hc-overlay:toast", (e, t) => cb(t)),
    savePos: (x, y) => ipcRenderer.send("hc-overlay:pos", { x, y })
});
