# Builds HaloCord: the 2.8.3 base shell + this repo's equibop bundle (dist/equibop), then the installer.
# Inputs that are not in the repo come from environment variables; see docs/building.md.
import json, os, re, shutil, subprocess, sys, urllib.request
from pathlib import Path
D = Path(__file__).resolve().parent
BUNDLE = D.parent / "dist" / "equibop"
SRC_APP = Path(os.environ["HALOCORD_BASE_APP"])  # unpacked 2.8.3 app folder (Electron + app.asar)
KOFFI = Path(os.environ["HALOCORD_KOFFI"])  # unpacked koffi 2.16.3 npm package
OUT = Path(os.environ.get("HALOCORD_OUT", D / "out"))
# The version lives in installer-package.json; HALOCORD_VERSION overrides it for a test build.
INSTALLER = json.loads((D / "installer-package.json").read_text(encoding="utf-8"))
VERSION = INSTALLER["version"] = os.environ.get("HALOCORD_VERSION") or INSTALLER["version"]
app, asrc = OUT / "app", OUT / "asar-src"
NW = dict(creationflags=subprocess.CREATE_NO_WINDOW, shell=True, check=True)
for p in (app, asrc):
    shutil.rmtree(p, ignore_errors=True)
shutil.copytree(SRC_APP, app)
ASAR = D.parent / "node_modules" / "@electron" / "asar" / "bin" / "asar.mjs"
subprocess.run(["node", str(ASAR), "extract", str(app / "resources" / "app.asar"), str(asrc)], creationflags=subprocess.CREATE_NO_WINDOW, check=True)
# The equibop build carries every plugin, desktop-only ones included. Its main.js runs in the shell's
# main process, its preload in the shell's preload, and renderer.js in the page.
shutil.rmtree(asrc / "equicord")
(asrc / "equicord").mkdir()
for f in ("main.js", "preload.js", "renderer.js", "renderer.css", "main.js.LEGAL.txt", "renderer.js.LEGAL.txt"):
    shutil.copy2(BUNDLE / f, asrc / "equicord" / f)
# The MochaCord theme ships with every build; src/main/mochacordTheme.ts installs it and keeps it current.
if os.environ.get("HALOCORD_THEME_SOURCE"):
    css = Path(os.environ["HALOCORD_THEME_SOURCE"]).read_text(encoding="utf-8")
else:
    with urllib.request.urlopen("https://raw.githubusercontent.com/DavidHiFi/MochaCord-Theme/main/MochaCord.css", timeout=30) as r:
        css = r.read().decode("utf-8")
if "@name MochaCord" not in css:
    sys.exit("MochaCord theme download did not look like the theme")
(asrc / "equicord" / "MochaCord.css").write_text(css, encoding="utf-8", newline="")
# koffi (MIT) for the acrylic blur calls; Windows x64 binary only.
kd = asrc / "node_modules" / "koffi"
for f in ("index.js", "package.json", "LICENSE.txt"):
    (kd / f).parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(KOFFI / f, kd / f)
(kd / "build" / "koffi" / "win32_x64").mkdir(parents=True)
shutil.copy2(KOFFI / "build" / "koffi" / "win32_x64" / "koffi.node", kd / "build" / "koffi" / "win32_x64" / "koffi.node")
shutil.copy2(D / "shell" / "mcblur.js", asrc / "mcblur.js")
shutil.copy2(D / "shell" / "shareaudio.js", asrc / "shareaudio.js")
shutil.copy2(D / "shell" / "hc-desktop.js", asrc / "hc-desktop.js")  # hc-desktop: startup, tray, build choice, app icon
shutil.copy2(D / "shell" / "hc-icon.js", asrc / "hc-icon.js")  # hc-icon: applies the stock, green or Mocha blue app icon
shutil.copy2(D / "shell" / "hc-update.js", asrc / "hc-update.js")  # hc-update: the in-app updater
shutil.copy2(D / "shell" / "hc-guard.js", asrc / "hc-guard.js")  # hc-guard: log file and safe start after quick crashes
shutil.copy2(D / "shell" / "hc-watchdog.js", asrc / "hc-watchdog.js")  # hc-watchdog: reloads a hung, crashed or blank main window
# build.json tells hc-update.js which commit this build is, for the list of changes in the next update.
git = lambda *a: subprocess.run(["git", *a], cwd=D.parent, capture_output=True, text=True, creationflags=subprocess.CREATE_NO_WINDOW).stdout.strip()
base = lambda f: (D.parent / ".github" / f).read_text().strip() if (D.parent / ".github" / f).exists() else ""
(asrc / "build.json").write_text(json.dumps({"version": VERSION, "commit": git("rev-parse", "HEAD"),
                                            "upstream": {"Equicord": base("equicord-base"), "TestCord": base("testcord-base")}}))
# hc-overlay: in-game overlay window (main side, game detection, its preload and page), next to main.js.
for f in ("hc-overlay-main.js", "hc-overlay-games.js", "hc-overlay-preload.js", "hc-overlay.html", "hc-overlay.js"):
    shutil.copy2(D / "shell" / f, asrc / f)
# halocord-loopback.exe sits next to app.asar (process.resourcesPath); build it if it is missing.
lb = D / "loopback" / "halocord-loopback.exe"
if not lb.exists():
    subprocess.run(f'"{D / "loopback" / "build.cmd"}"', **NW)
shutil.copy2(lb, app / "resources" / lb.name)
# Discord.exe stand-in for the Elgato Stream Deck plugin (desktop/streamdeck), in resources\streamdeck.
sd = D / "streamdeck" / "Discord.exe"
if not sd.exists():
    subprocess.run(f'"{D / "streamdeck" / "build.cmd"}"', **NW)
(app / "resources" / "streamdeck").mkdir(exist_ok=True)
shutil.copy2(sd, app / "resources" / "streamdeck" / sd.name)
# hc-keys: global keybinds. shell/hc-keys.js runs keys/hckeys.exe (resources\keys) and feeds the haloKeybinds plugin.
shutil.copy2(D / "shell" / "hc-keys.js", asrc / "hc-keys.js")
hk = D / "keys" / "hckeys.exe"
if not hk.exists():
    subprocess.run(f'"{D / "keys" / "build.cmd"}"', **NW)
(app / "resources" / "keys").mkdir(exist_ok=True)
shutil.copy2(hk, app / "resources" / "keys" / hk.name)
m = (asrc / "main.js").read_text(encoding="utf-8")
assert m.count('UPD_REPO="kurtzonaudio/kurtcord"') == 1
m = m.replace('UPD_REPO="kurtzonaudio/kurtcord"', 'UPD_REPO="DavidHiFi/HaloCord"')
m = m.replace("https://github.com/kurtzonaudio/kurtcord/releases/latest", "https://github.com/DavidHiFi/HaloCord/releases/latest")
m = m.replace("<p class='r'>Kurtzon</p>", "<p class='r'>HaloCord</p>")
# Match the installer shortcut's id, or the taskbar groups HaloCord under a stale "Kurtcord" name.
assert m.count('app.setAppUserModelId("com.kurtcord.desktop")') == 1
m = m.replace('app.setAppUserModelId("com.kurtcord.desktop")', 'app.setAppUserModelId("com.davidhifi.halocord")')
# Stereo with voice processing: Chromium 138 runs mic processing in the audio service by default, where a
# renderer bug (num preferred channels -1 cast to uint32) pins it to one channel for good. In the page it
# goes stereo once a stereo sender takes the mic (userscript dvxStereoAnchor). Echo cancellation still
# uses Discord's voice playback as its reference, since Discord plays voices through audio elements.
a = 'app.commandLine.appendSwitch("disable-features","HardwareMediaKeyHandling,CalculateNativeWinOcclusion")'
assert m.count(a) == 1
m = m.replace(a, a[:-2] + ',ChromeWideEchoCancellation")')
# Main window, popout windows and tray load the chosen app icon from resources\icons (hc-icon.js).
assert m.count('path.join(__dirname,"icon.png")') == 3
m = m.replace('path.join(__dirname,"icon.png")', 'require("./hc-desktop.js").icon()')
# Load the bundle's main side first, with its settings in %APPDATA%\HaloCord\TestCord (Stable keeps %APPDATA%\Testcord).
a = 'Menu:Menu}=require("electron");'
assert m.count(a) == 1
# hc-guard first, so its log sees everything and a safe start can turn hardware acceleration off before ready.
m = m.replace(a, a + 'const hcGuard=require("./hc-guard.js");process.env.DVX_NO_UPDATE_CHECK="1";process.env.TESTCORD_USER_DATA_DIR=require("path").join(app.getPath("userData"),"TestCord");require("./equicord/main.js");')
# Screen share: the page's share picker (StreamEnhancer SharePicker) preselects the source, so the
# old "Choose what to share" window only opens when nothing was picked. Chromium gets video only;
# the sound comes from shell/shareaudio.js, which leaves HaloCord's own playback out.
# Three picker calls (two share handlers, one ac:pick-screenshare-source IPC); two hand video to Chromium.
for a, b, k in [("const e=await dvxPickSource(", "const e=await hcPickShare(", 3), ("t(e?{video:e}:{})", "hcShareSource=e,t(e?{video:e}:{})", 2)]:
    assert m.count(a) == k, a
    m = m.replace(a, b)
m += ('\nlet hcShareSel=null,hcShareSource=null;'
      'async function hcPickShare(o){const p=hcShareSel;hcShareSel=null;if(p&&Date.now()-p.t<2e4)try{'
      'const s=(await desktopCapturer.getSources({types:["screen","window"],thumbnailSize:{width:0,height:0}})).find(x=>x.id===p.id);'
      'if(s&&!(o&&o.windowsOnly&&!s.id.startsWith("window:")))return s}catch(e){}return dvxPickSource(o)}'
      'ipcMain.handle("halocord:share-sources",async()=>{const own=BrowserWindow.getAllWindows().map(w=>w.getMediaSourceId());'
      'return(await desktopCapturer.getSources({types:["window","screen"],thumbnailSize:{width:384,height:216},fetchWindowIcons:!0}))'
      '.filter(s=>s.name&&!own.includes(s.id)).map(s=>({id:s.id,name:s.name,thumb:s.thumbnail.toDataURL(),'
      'icon:s.appIcon&&!s.appIcon.isEmpty()?s.appIcon.toDataURL():void 0}))});'
      'ipcMain.handle("halocord:share-select",(e,t)=>{hcShareSel={id:String(t),t:Date.now()}});'
      'ipcMain.handle("halocord:share-audio-start",e=>require("./shareaudio.js").start(hcShareSource,e.sender));'
      'ipcMain.handle("halocord:share-audio-stop",()=>require("./shareaudio.js").stop());\n')
m, n = re.subn(r"Kurtcord(?![A-Za-z])", "HaloCord", m)
# Shell controls for the HaloCord settings tab: relaunch, settings folder, and window prefs
# (min size, transparency, background material, Ctrl+Q) read from halocord-window.json at window creation.
WIN = "spellcheck:!0}});const e=win.webContents.session;"
assert m.count(WIN) == 1
m = m.replace(WIN, 'spellcheck:!0},...mcWinOpts()});mcWinPrefs().winCtrlQ&&win.webContents.on("before-input-event",(e,t)=>{'
                   '"keyDown"===t.type&&t.control&&!t.alt&&!t.shift&&"q"===String(t.key).toLowerCase()&&app.quit()});'
                   'mcAcrylic(win);mcTransparentMax(win);const e=win.webContents.session;')
m += ('\nfunction mcWinFile(){return require("path").join(app.getPath("userData"),"halocord-window.json")}'
      'function mcWinPrefs(){const fs=require("fs"),f=mcWinFile(),old=require("path").join(app.getPath("userData"),"mochacord-window.json");try{fs.existsSync(f)||!fs.existsSync(old)||fs.copyFileSync(old,f)}catch(e){}try{return JSON.parse(fs.readFileSync(f,"utf8"))||{}}catch(e){return{}}}'
      'function mcWinOpts(){const p=mcWinPrefs(),o={};p.disableMinSize&&(o.minWidth=0,o.minHeight=0);'
      'p.transparent&&(o.transparent=!0,o.backgroundColor="#00000000");'
      '"win32"===process.platform&&["mica","tabbed"].includes(p.windowsMaterial)&&(o.backgroundMaterial=p.windowsMaterial,o.backgroundColor="#00000000");'
      '"win32"===process.platform&&"acrylic"===p.windowsMaterial&&(o.backgroundColor="#00000000");'
      # nativeTitleBar false: no Windows frame; Windows still draws the caption buttons over the page's top bar.
      '"win32"===process.platform&&!1===p.nativeTitleBar&&(o.titleBarStyle="hidden",o.titleBarOverlay={color:"#00000000",symbolColor:"#cdd6f4",height:28});return o}'
      # A transparent window has no resizable frame, so Windows ignores its maximise button: maximise it ourselves.
      'function mcTransparentMax(w){"win32"===process.platform&&mcWinPrefs().transparent&&w.hookWindowMessage(274,a=>{const c=65520&a.readUInt32LE(0);'
      '61488===c?setImmediate(()=>w.isDestroyed()||(w.isMaximized()?w.unmaximize():w.maximize())):61728===c&&w.isMaximized()&&setImmediate(()=>w.isDestroyed()||w.unmaximize())})}'
      'function mcAcrylic(w,again){if("win32"===process.platform&&"acrylic"===mcWinPrefs().windowsMaterial)try{require("./mcblur.js").apply(w,!0);'
      'again||[794,798].forEach(m=>w.hookWindowMessage(m,()=>setTimeout(()=>w.isDestroyed()||mcAcrylic(w,!0),400)))}catch(e){console.error("[HaloCord] acrylic failed",e)}}'
      'ipcMain.handle("halocord:show-item",(e,t)=>shell.showItemInFolder(String(t)));'
      # app.exit skips will-quit, so finish a waiting exe icon swap here or the copy is made again next start.
      'ipcMain.handle("halocord:relaunch",()=>{hcUpdate.install()||(require("./hc-icon.js").finishPending(),hcGuard.clean(),app.relaunch(),app.exit(0))});'
      'ipcMain.handle("halocord:open-settings-folder",()=>shell.openPath(app.getPath("userData")));'
      'ipcMain.handle("halocord:set-window-prefs",(e,t)=>{const p={};for(const k of["disableMinSize","transparent","winCtrlQ"])p[k]=!!(t&&t[k]);'
      'p.windowsMaterial=t&&"string"==typeof t.windowsMaterial?t.windowsMaterial:"none";p.nativeTitleBar=!t||!1!==t.nativeTitleBar;require("fs").writeFileSync(mcWinFile(),JSON.stringify(p))});\n')
# hc-desktop: shell/hc-desktop.js owns Windows startup, start minimised, minimise to tray and the
# Stable / PTB / Canary choice. The window stays hidden when launched with --start-minimized, and
# the app page skips the HTTP cache so every launch gets Discord's newest web build.
# The main window starts hidden either way: hc-update.js shows it after the launch update check.
for a, b in [('win=new BrowserWindow({width:1400,height:900,', 'win=new BrowserWindow({show:!1,width:1400,height:900,'),
             ('win.loadURL("https://discord.com/app")', 'win.loadURL(hcDesk.appUrl(),{extraHeaders:"Cache-Control: no-cache\\n"})')]:
    assert m.count(a) == 1, a
    m = m.replace(a, b)
m += '\nconst hcDesk=require("./hc-desktop.js").init({win:()=>win,tray:()=>tray,show:showWindow});\n'
# No File/Edit/View bar on Alt: the menu stays set (its shortcuts, Ctrl+R included, keep working) but never shows.
# The window guard and the user agent refresh act only on whole-window navigation, never on frames (hCaptcha, embeds).
for a, b in [('autoHideMenuBar:!0,backgroundColor:"#1e2124",title:"HaloCord"', 'autoHideMenuBar:!1,backgroundColor:"#1e2124",title:"HaloCord"'),
             ('mcAcrylic(win);mcTransparentMax(win);', 'win.setMenuBarVisibility(!1);mcAcrylic(win);mcTransparentMax(win);'),
             ('win.webContents.on("will-navigate",(e,t)=>{"about:blank"===t', 'win.webContents.on("will-navigate",(e,t,i,m)=>{!1===m||e&&(!1===e.isMainFrame||e.frame&&e.frame.parent)||"about:blank"===t'),
             ('win.webContents.on("did-start-navigation",t)', 'win.webContents.on("did-start-navigation",(e,u,p,m)=>{m&&t()})')]:
    assert m.count(a) == 1, a
    m = m.replace(a, b)
# hc-overlay: IPC halocord:overlay-* and the overlay window live in shell/hc-overlay-main.js.
# A safe start (hc-guard.js) leaves out the overlay, window transparency and blur.
m += '\nhcGuard.safe||require("./hc-overlay-main.js");\n'
for a, b in [('...mcWinOpts()});', '...(hcGuard.safe?{}:mcWinOpts())});'),
             ('mcAcrylic(win);mcTransparentMax(win);', 'hcGuard.safe||(mcAcrylic(win),mcTransparentMax(win));')]:
    assert m.count(a) == 1, a
    m = m.replace(a, b)
# hc-keys: start the keybind bridge in main.
m += '\nrequire("./hc-keys.js").init();\n'
# hc-update: the launch update check, which shows the main window, and the bundle's updater IPC
# (registered when equicord/main.js loaded above, so this takes it over).
m += '\nconst hcUpdate=require("./hc-update.js").init({win:()=>win,hidden:hcDesk.hidden});\n'
(asrc / "main.js").write_text(m, encoding="utf-8")
# Display text only; lowercase ids (kurtcordDirect, KurtcordMLKEM, wire tags) stay so P2P and E2EE still talk to Kurtcord users.
for f in ("preload.js", "userscript.js"):
    # userscript.js comes from desktop/base (the 2.8.3 original plus HaloCord's direct edits); the fixes below still apply on top.
    s = ((D / "base" / f) if f == "userscript.js" else (asrc / f)).read_text(encoding="utf-8")
    s, k = re.subn(r"Kurtcord(?![A-Za-z])", "HaloCord", s)
    s = s.replace(r"Made\x20with\x20❤\x20by\x20<a\x20href=\x22https://www.youtube.com/@unpbeatsuk\x22\x20target=\x22_blank\x22>UNP\x20Beats\x20UK</a>\x20·\x20<a\x20href=\x22https://www.youtube.com/@Kurtzonaudio\x22\x20target=\x22_blank\x22>Kurtzon</a>",
                  r"HaloCord\x20by\x20<a\x20href=\x22https://github.com/DavidHiFi\x22\x20target=\x22_blank\x22>DavidHiFi</a>")
    if f == "preload.js":
        a = 'contextBridge.exposeInMainWorld("__kurtcord",__kcBridge),'
        assert s.count(a) == 1
        s = s.replace(a, a + 'contextBridge.exposeInMainWorld("HaloCordNative",{relaunch:()=>ipcRenderer.invoke("halocord:relaunch"),'
                             'openSettingsFolder:()=>ipcRenderer.invoke("halocord:open-settings-folder"),'
                             'updateInfo:()=>ipcRenderer.invoke("halocord:update-info"),'
                             'setWindowPrefs:A=>ipcRenderer.invoke("halocord:set-window-prefs",A),'
                             'getShareSources:()=>ipcRenderer.invoke("halocord:share-sources"),'
                             'selectShareSource:A=>ipcRenderer.invoke("halocord:share-select",String(A)),'
                             'startShareAudio:()=>ipcRenderer.invoke("halocord:share-audio-start"),'
                             'stopShareAudio:()=>ipcRenderer.invoke("halocord:share-audio-stop"),'
                             'takeShareAudio:A=>{ipcRenderer.removeAllListeners("halocord:share-audio");'
                             'ipcRenderer.on("halocord:share-audio",(B,C)=>A(new Uint8Array(C)));return!0}}),')
        # hc-desktop: settings bridge for the HaloDesktop plugin.
        a = 'contextBridge.exposeInMainWorld("__kurtcord",__kcBridge),'
        assert s.count(a) == 1
        s = s.replace(a, a + 'contextBridge.exposeInMainWorld("HaloCordDesktop",{get:()=>ipcRenderer.invoke("halocord-desktop:get"),'
                             'set:(A,B)=>ipcRenderer.invoke("halocord-desktop:set",String(A),B)}),')
        # hc-overlay: page side of the overlay (HaloOverlay plugin), its own bridge object.
        a = 'contextBridge.exposeInMainWorld("__audiocord",__kcBridge)'
        assert s.count(a) == 1
        s = s.replace(a, a + ',contextBridge.exposeInMainWorld("HaloCordOverlay",{setConfig:A=>ipcRenderer.invoke("halocord:overlay-config",A),'
                             'voice:A=>ipcRenderer.send("halocord:overlay-voice",A),notify:A=>ipcRenderer.send("halocord:overlay-notify",A),'
                             'activity:A=>ipcRenderer.send("halocord:overlay-activity",A),games:()=>ipcRenderer.invoke("halocord:overlay-games"),'
                             'setGame:(A,B)=>ipcRenderer.invoke("halocord:overlay-set-game",String(A),!!B),reset:()=>ipcRenderer.invoke("halocord:overlay-reset"),'
                             'onEvent:A=>{ipcRenderer.removeAllListeners("halocord:overlay-event");ipcRenderer.on("halocord:overlay-event",(B,C,D)=>A(C,D));return!0}})')
        # hc-keys: HaloCordKeys, the page side of shell/hc-keys.js.
        a = 'contextBridge.exposeInMainWorld("__kurtcord",__kcBridge),'
        assert s.count(a) == 1
        s = s.replace(a, a + 'contextBridge.exposeInMainWorld("HaloCordKeys",{setFilter:(A,B)=>ipcRenderer.send("halocord:keys-filter",Array.isArray(A)?A.map(String):[],!!B),'
                             'onEvent:A=>{ipcRenderer.removeAllListeners("halocord:keys-event");'
                             'ipcRenderer.on("halocord:keys-event",(B,C,D,E)=>A(C,D,E));return!0}}),')
        a = s[s.index("function injectEquicord(){"):s.index("try{var __kcBridge=")]
        s = s.replace(a, 'function injectEquicord(){try{contextBridge.exposeInMainWorld("VesktopNative",{app:{'
                         'getVersion:()=>require("./package.json").version,getGitHash:()=>"",isDevBuild:()=>!1,'
                         'getPlatformSpoofInfo:()=>({spoofed:!1,originalPlatform:process.platform}),'
                         'relaunch:()=>ipcRenderer.invoke("halocord:relaunch"),isOutdated:()=>Promise.resolve(!1),'
                         'openUpdater:()=>ipcRenderer.invoke("ac:open-url","https://github.com/DavidHiFi/HaloCord/releases")},'
                         'fileManager:{showItemInFolder:A=>ipcRenderer.invoke("halocord:show-item",String(A))},'
                         'clipboard:{copyImage:()=>Promise.resolve()}});require("./equicord/preload.js");'
                         'webFrame.executeJavaScript(fs.readFileSync(path.join(__dirname,"equicord","renderer.js"),"utf8")).catch(function(){});'
                             'console.log("[HaloCord] TestCord injected")}catch(A){console.error("[HaloCord] TestCord inject failed:",A)}}')
    if f == "userscript.js":
        fixes = [
            # Bypass switch saved and applied the value but never repainted, so it looked dead.
            ("function(nx){Q['bypassInputProcessing']=!!nx,e4();}", "function(nx,nU){Q['bypassInputProcessing']=!!nx,e4(),nU['_render']();}"),
            # Voice Volume Meter row goes; the VoiceVUMeters plugin covers it.
            (r"Gz['appendChild'](Qr('Voice\x20Volume\x20Meter','Live\x20volume\x20bars\x20on\x20voice\x20call\x20tiles.\x20Inbound\x20(other)\x20users\x20only.',nn));", ""),
            ("if(Q['voiceMeter'])setTimeout(", "if(!1)setTimeout("),
            ("'voicemeter':!!Q['voiceMeter']", "'voicemeter':!1"),
            # The Open Settings button no longer opens the old privacy overlay.
            ("try{Gn();}catch(nW){}", ""),
            # Voice join crashed the renderer (Chromium CHECK, 0x80000003): forcing a=ptime:10 and
            # a=maxptime:10 into Discord's remote answer is fatal. Keep ptime on the local offer only.
            ("Gz=eT(Gz,", "Gz=GZ==='sRD'?Gz:eT(Gz,"),
            # The mic guard waited 15 s after each failed rebuild and a minute after four, so a mic
            # another app held for a while (FreeDictate's mic privacy holds it for a whole take)
            # stayed dead long after it was free. Retry every 2 s with no lockout (2026-10-31).
            ("dvxMicBusy=!![];dvxMicNext=Date['now']()+15e3;", "dvxMicBusy=!![];dvxMicNext=Date['now']()+2e3;"),
            ("if(dvxMicFail>3&&Date['now']()<dvxMicNext+6e4)return;", ""),
            # A muted mic gets a fresh capture 2 s after the 8 s mute check, but some inputs (a VB-Audio
            # virtual mic) flip to muted on their own and come back without help. Reopening one every
            # 10 s gained nothing and stranded Discord's old inputs each time (measured 2026-11-09:
            # 98 dead sources). Each muted reopen within 5 minutes of the last doubles the wait, up to
            # 2 minutes, so a single dictation take still gets its mic back after 2 s.
            ("dvxMicMutedNext=0,", "dvxMicMutedNext=0,dvxMicMutedAt=0,dvxMicMutedGap=0,"),
            ("dvxMicMutedNext=Date['now']()+9e4;",
             "dvxMicMutedGap=Date['now']()-dvxMicMutedAt<3e5?Math['min'](dvxMicMutedGap*2,12e4):2e3;dvxMicMutedAt=Date['now']();dvxMicMutedNext=dvxMicMutedAt+dvxMicMutedGap;"),
            # Swapping a fresh track into the sender left Discord's own input on the ended track, so its
            # voice activity never fired and nobody heard the owner until a rejoin. Reopen Discord's input.
            ("function dvxMicCloseOld(dvxG,dvxNewT){",
             "function dvxMicDcAudio(){var r=null;try{Vencord.Webpack.findStore('MediaEngineStore').getMediaEngine().connections.forEach(function(c){var a=c&&c.context==='default'&&c.input&&c.input.audio;if(a&&!a.destroyed&&!r)r=a;});}catch(x){}return r;}"
             "function dvxMicDcEnded(){var a=dvxMicDcAudio();if(!a)return ![];var t=a.stream&&a.stream.getAudioTracks()[0];return !t||t.readyState==='ended';}"
             "function dvxMicCloseOld(dvxG,dvxNewT){"),
            ("try{dvxP=navigator['mediaDevices']['getUserMedia']({'audio':dvxMicLastGumAudio||!![],'video':![]});}",
             "try{var dvxA=dvxMicDcAudio();dvxP=dvxA?dvxA.enable():navigator['mediaDevices']['getUserMedia']({'audio':dvxMicLastGumAudio||!![],'video':![]});}"),
            ("if(!dvxT||dvxT['readyState']!=='live')dvxWhy=", "if(dvxMicDcEnded())dvxWhy='discord input ended';else if(!dvxT||dvxT['readyState']!=='live')dvxWhy="),
        ]
        for a, b in fixes:
            assert s.count(a) == 1, a
            s = s.replace(a, b)
        # Voice & Video wording. desktop/base no longer carries the "kurtopus 1.6 HD" label (the libopus
        # version is not 1.6; see notes/2026-11-01-halocord-2.10.0-release-notes.md), so only these remain.
        for a, b in [
            (r"Ping\x20(Kurtzon)", r"Ping\x20(HaloCord)"),
        ]:
            assert s.count(a) >= 1, a
            s = s.replace(a, b)
        assert "kurtopus" not in s.lower()
        a = "Gd=GO;return Q['videoGoLive']&&GO&&GO['video']&&(Gd=Object['assign']({},GO),"
        assert s.count(a) == 1
        s = s.replace(a, "Gd=GO&&GO['audio']?Object['assign']({},GO,{'audio':Object['assign']({},typeof GO['audio']==='object'?GO['audio']:{},"
                         "{'echoCancellation':!1,'noiseSuppression':!1,'autoGainControl':!1,'channelCount':2,'sampleRate':48000})}):GO;"
                         "return Q['videoGoLive']&&GO&&GO['video']&&(Gd=Object['assign']({},Gd),")
        # The StereoMode user-area button (mochacord-web) flips the engine's stereo switch through this.
        a = "if(!b)e4();"
        assert s.count(a) == 1
        s = s.replace(a, a + "window['HaloCordStereo']={get:function(){return!!Q['stereo'];},set:function(v){Q['stereo']=!!v;"
                             "if(!v)Q['spatialInput']=![];e4();if(typeof Qs==='function')Qs();}};"
                             # Native dropdown popups (mic pickers and the like) drew white; dark color-scheme fixes them.
                             # The page load replaces the early head, so add it again once the DOM is ready.
                             + "function mcSelAdd(){try{if(document['getElementById']('mc-dark-select')||!document['head'])return;var mcSel=document['createElement']('style');"
                             "mcSel['id']='mc-dark-select';mcSel['textContent']='select{color-scheme:dark!important}select option{background:#1e1f22;color:#f2f3f5}';"
                             "document['head']['appendChild'](mcSel);}catch(mcSelErr){}}mcSelAdd();document['addEventListener']('DOMContentLoaded',mcSelAdd);"
                             "window['addEventListener']('load',mcSelAdd);"
                             + (D / "shell" / "micfx.js").read_text(encoding="utf-8") + "\n")
        # Voice effects moved over from StreamEnhancer (shell/micfx.js): saved settings, the mic
        # chain hook ahead of the input gain, and the panel under the EQ in Voice & Video.
        for a, b in [
            ("var Q={", "var Q={'micFxOn':![],'micFxPreset':'none','micFxPitch':0,'micFxBoost':0,'micFxEcho':0,'micFxRing':0,'micFxCrush':0,"
                        "'micFxMuffle':0,'micFxBass':0,'micFxResonance':0,'micFxStatic':0,'micFxDropout':0,'micFxClip':0,"),
            ("dvxSrc['connect'](dvxNode);", "var mcFxOut=dvxSrc;try{mcFxOut=mcFxAttach(dvxCtx,dvxSrc)||dvxSrc;window['HaloCordFx']=mcFxOut;}catch(mcFxErr){mcFxOut=dvxSrc;}mcFxOut['connect'](dvxMono),dvxMono['connect'](dvxNode);"),
            ("Gz['appendChild'](dvxEQcard);\ndvxEQpaint();\n}catch(dvxEQuiErr){}",
             "Gz['appendChild'](dvxEQcard);\ndvxEQpaint();\n}catch(dvxEQuiErr){}try{Gz['appendChild'](mcFxPanel(QP,Qr));}catch(mcFxUiErr){}"),
        ]:
            assert s.count(a) == 1, a
            s = s.replace(a, b)
        # Kurt's privacy page drew an overlay over whatever settings tab was open. Drop its sidebar
        # section and mount the same options inside Privacy & Security (host div from mochacord-web).
        a = s.index("function Ga(){")
        b = s.index("function Gb(", a)
        s = s[:a] + ("function Ga(){var h=document['getElementById']('halocord-privacy-host');if(!h)return;"
                     "if(G4&&h['contains'](G4))return;if(!G4)G4=G5();h['appendChild'](G4);}") + s[b:]
    (asrc / f).write_text(s, encoding="utf-8")
    print(f, "display strings:", k)
shutil.copy2(D / "brand" / "icon.png", asrc / "icon.png")
# Windows picks the .ico's prerendered 16/20/24 px frames for the title bar and tray instead of
# shrinking the 256 px PNG into a blocky blur.
shutil.copy2(D / "brand" / "halocord.ico", asrc / "icon.ico")
# Both app icons as real files, so shortcuts can point at the chosen one (Themes > App icon).
(app / "resources" / "icons").mkdir(exist_ok=True)
for f in ("discord.ico", "halocord.ico", "halocord-mocha.ico"):
    shutil.copy2(D / "brand" / f, app / "resources" / "icons" / f)
pkg = json.loads((asrc / "package.json").read_text())
pkg.update(name="halocord", productName="HaloCord", version=VERSION, description="HaloCord", author="DavidHiFi")
(asrc / "package.json").write_text(json.dumps(pkg, indent=2))
(app / "resources" / "app.asar").unlink()
subprocess.run(["node", str(ASAR), "pack", str(asrc), str(app / "resources" / "app.asar"), "--unpack", "*.node"], creationflags=subprocess.CREATE_NO_WINDOW, check=True)
exe = app / "HaloCord.exe"
(app / "Kurtcord.exe").rename(exe)
rc = [str(OUT / "tools" / "rcedit" / "rcedit-x64.exe"), str(exe), "--set-icon", str(D / "brand" / "halocord.ico"),
      "--set-file-version", VERSION, "--set-product-version", VERSION]
for k, v in dict(CompanyName="DavidHiFi", ProductName="HaloCord", FileDescription="HaloCord", InternalName="HaloCord",
                 OriginalFilename="HaloCord.exe", LegalCopyright="Copyright (c) 2026 DavidHiFi").items():
    rc += ["--set-version-string", k, v]
subprocess.run(rc, creationflags=subprocess.CREATE_NO_WINDOW, check=True)
print("rebranded strings in main.js:", n)
shutil.rmtree(OUT / "installer" / "dist", ignore_errors=True)
(OUT / "installer").mkdir(exist_ok=True)
(OUT / "installer" / "package.json").write_text(json.dumps(INSTALLER, indent=2)
                                                .replace("../brand/", (D / "brand").as_posix() + "/"), encoding="utf-8")
subprocess.run("npx -y electron-builder@26.18.0 --win nsis --prepackaged ../app", cwd=OUT / "installer", **NW)
print("installer:", next((OUT / "installer" / "dist").glob("*.exe")))
