# Builds HaloCord: the 2.8.3 base shell + this repo's equibop bundle (dist/equibop), then the installer.
# Inputs that are not in the repo come from environment variables; see docs/building.md.
import json, os, re, shutil, subprocess, sys
from pathlib import Path
D = Path(__file__).resolve().parent
BUNDLE = D.parent / "dist" / "equibop"
SRC_APP = Path(os.environ["HALOCORD_BASE_APP"])  # unpacked 2.8.3 app folder (Electron + app.asar)
KOFFI = Path(os.environ["HALOCORD_KOFFI"])  # unpacked koffi 2.16.3 npm package
OUT = Path(os.environ.get("HALOCORD_OUT", D / "out"))
app, asrc = OUT / "app", OUT / "asar-src"
NW = dict(creationflags=subprocess.CREATE_NO_WINDOW, shell=True, check=True)
for p in (app, asrc):
    shutil.rmtree(p, ignore_errors=True)
shutil.copytree(SRC_APP, app)
subprocess.run(f'npx -y @electron/asar extract "{app/"resources"/"app.asar"}" "{asrc}"', **NW)
# The equibop build carries every plugin, desktop-only ones included. Its main.js runs in the shell's
# main process, its preload in the shell's preload, and renderer.js in the page.
shutil.rmtree(asrc / "equicord")
(asrc / "equicord").mkdir()
for f in ("main.js", "preload.js", "renderer.js", "renderer.css", "main.js.LEGAL.txt", "renderer.js.LEGAL.txt"):
    shutil.copy2(BUNDLE / f, asrc / "equicord" / f)
# koffi (MIT) for the acrylic blur calls; Windows x64 binary only.
kd = asrc / "node_modules" / "koffi"
for f in ("index.js", "package.json", "LICENSE.txt"):
    (kd / f).parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(KOFFI / f, kd / f)
(kd / "build" / "koffi" / "win32_x64").mkdir(parents=True)
shutil.copy2(KOFFI / "build" / "koffi" / "win32_x64" / "koffi.node", kd / "build" / "koffi" / "win32_x64" / "koffi.node")
shutil.copy2(D / "shell" / "mcblur.js", asrc / "mcblur.js")
shutil.copy2(D / "shell" / "shareaudio.js", asrc / "shareaudio.js")
# halocord-loopback.exe sits next to app.asar (process.resourcesPath); build it if it is missing.
lb = D / "loopback" / "halocord-loopback.exe"
if not lb.exists():
    subprocess.run(f'"{D / "loopback" / "build.cmd"}"', **NW)
shutil.copy2(lb, app / "resources" / lb.name)
m = (asrc / "main.js").read_text(encoding="utf-8")
assert m.count('UPD_REPO="kurtzonaudio/kurtcord"') == 1
m = m.replace('UPD_REPO="kurtzonaudio/kurtcord"', 'UPD_REPO="DavidHiFi/HaloCord"')
m = m.replace("https://github.com/kurtzonaudio/kurtcord/releases/latest", "https://github.com/DavidHiFi/HaloCord/releases/latest")
m = m.replace("<p class='r'>Kurtzon</p>", "<p class='r'>HaloCord</p>")
# Match the installer shortcut's id, or the taskbar groups HaloCord under a stale "Kurtcord" name.
assert m.count('app.setAppUserModelId("com.kurtcord.desktop")') == 1
m = m.replace('app.setAppUserModelId("com.kurtcord.desktop")', 'app.setAppUserModelId("com.davidhifi.halocord")')
# Load the bundle's main side first, with its settings in %APPDATA%\HaloCord\TestCord (Stable keeps %APPDATA%\Testcord).
a = 'Menu:Menu}=require("electron");'
assert m.count(a) == 1
m = m.replace(a, a + 'process.env.TESTCORD_USER_DATA_DIR=require("path").join(app.getPath("appData"),"HaloCord","TestCord");require("./equicord/main.js");')
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
                   'mcAcrylic(win);const e=win.webContents.session;')
m += ('\nfunction mcWinFile(){return require("path").join(app.getPath("userData"),"halocord-window.json")}'
      'function mcWinPrefs(){try{return JSON.parse(require("fs").readFileSync(mcWinFile(),"utf8"))||{}}catch(e){return{}}}'
      'function mcWinOpts(){const p=mcWinPrefs(),o={};p.disableMinSize&&(o.minWidth=0,o.minHeight=0);'
      'p.transparent&&(o.transparent=!0,o.backgroundColor="#00000000");'
      '"win32"===process.platform&&["mica","tabbed"].includes(p.windowsMaterial)&&(o.backgroundMaterial=p.windowsMaterial,o.backgroundColor="#00000000");'
      '"win32"===process.platform&&"acrylic"===p.windowsMaterial&&(o.backgroundColor="#00000000");return o}'
      'function mcAcrylic(w){if("win32"===process.platform&&"acrylic"===mcWinPrefs().windowsMaterial)try{require("./mcblur.js").apply(w,!0)}catch(e){console.error("[HaloCord] acrylic failed",e)}}'
      'ipcMain.handle("halocord:show-item",(e,t)=>shell.showItemInFolder(String(t)));'
      'ipcMain.handle("halocord:relaunch",()=>{app.relaunch(),app.exit(0)});'
      'ipcMain.handle("halocord:open-settings-folder",()=>shell.openPath(app.getPath("userData")));'
      'ipcMain.handle("halocord:set-window-prefs",(e,t)=>{const p={};for(const k of["disableMinSize","transparent","winCtrlQ"])p[k]=!!(t&&t[k]);'
      'p.windowsMaterial=t&&"string"==typeof t.windowsMaterial?t.windowsMaterial:"none";require("fs").writeFileSync(mcWinFile(),JSON.stringify(p))});\n')
(asrc / "main.js").write_text(m, encoding="utf-8")
# Display text only; lowercase ids (kurtcordDirect, KurtcordMLKEM, wire tags) stay so P2P and E2EE still talk to Kurtcord users.
for f in ("preload.js", "userscript.js"):
    s = (asrc / f).read_text(encoding="utf-8")
    s, k = re.subn(r"Kurtcord(?![A-Za-z])", "HaloCord", s)
    s = s.replace(r"Made\x20with\x20❤\x20by\x20<a\x20href=\x22https://www.youtube.com/@unpbeatsuk\x22\x20target=\x22_blank\x22>UNP\x20Beats\x20UK</a>\x20·\x20<a\x20href=\x22https://www.youtube.com/@Kurtzonaudio\x22\x20target=\x22_blank\x22>Kurtzon</a>",
                  r"HaloCord\x20by\x20<a\x20href=\x22https://github.com/DavidHiFi\x22\x20target=\x22_blank\x22>DavidHiFi</a>")
    if f == "preload.js":
        a = 'contextBridge.exposeInMainWorld("__kurtcord",__kcBridge),'
        assert s.count(a) == 1
        s = s.replace(a, a + 'contextBridge.exposeInMainWorld("HaloCordNative",{relaunch:()=>ipcRenderer.invoke("halocord:relaunch"),'
                             'openSettingsFolder:()=>ipcRenderer.invoke("halocord:open-settings-folder"),'
                             'setWindowPrefs:A=>ipcRenderer.invoke("halocord:set-window-prefs",A),'
                             'getShareSources:()=>ipcRenderer.invoke("halocord:share-sources"),'
                             'selectShareSource:A=>ipcRenderer.invoke("halocord:share-select",String(A)),'
                             'startShareAudio:()=>ipcRenderer.invoke("halocord:share-audio-start"),'
                             'stopShareAudio:()=>ipcRenderer.invoke("halocord:share-audio-stop"),'
                             'takeShareAudio:A=>{ipcRenderer.removeAllListeners("halocord:share-audio");'
                             'ipcRenderer.on("halocord:share-audio",(B,C)=>A(new Uint8Array(C)));return!0}}),')
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
            ("dvxMicMutedNext=Date['now']()+9e4;", "dvxMicMutedNext=Date['now']()+2e3;"),
        ]
        for a, b in fixes:
            assert s.count(a) == 1, a
            s = s.replace(a, b)
        # Voice & Video wording: Kurt's "kurtopus" codec name becomes plain Opus 1.6 HD.
        for a, b in [
            (r"'Experimental\x20QEXT\x20Layer','kurtopus\x201.6\x20HD\x20experimental\x20QEXT\x20layer'",
             r"'Opus\x201.6\x20HD','Experimental\x20QEXT\x20quality\x20layer,\x20up\x20to\x20530\x20kbps.\x20Both\x20ends\x20need\x20it\x20on.'"),
            (r"'Enable\x20Experimental\x20QEXT\x20Layer'", r"'Enable\x20Opus\x201.6\x20HD'"),
            (r"\x20kurtopus\x201.6\x20HD\x20Kurtzon", r"\x20·\x20Opus\x201.6\x20HD"),
            ("/kurtopus/i", r"/Opus\x201\.6\x20HD/i"),
            (r"kurtopus\x201.6\x20HD", r"Opus\x201.6\x20HD"),
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
            ("dvxSrc['connect'](dvxNode);", "var mcFxOut=dvxSrc;try{mcFxOut=mcFxAttach(dvxCtx,dvxSrc)||dvxSrc;window['HaloCordFx']=mcFxOut;}catch(mcFxErr){mcFxOut=dvxSrc;}mcFxOut['connect'](dvxNode);"),
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
pkg = json.loads((asrc / "package.json").read_text())
pkg.update(name="halocord", productName="HaloCord", version="2.8.4", description="HaloCord", author="DavidHiFi")
(asrc / "package.json").write_text(json.dumps(pkg, indent=2))
(app / "resources" / "app.asar").unlink()
subprocess.run(f'npx -y @electron/asar pack "{asrc}" "{app/"resources"/"app.asar"}" --unpack "*.node"', **NW)
exe = app / "HaloCord.exe"
(app / "Kurtcord.exe").rename(exe)
rc = [str(OUT / "tools" / "rcedit" / "rcedit-x64.exe"), str(exe), "--set-icon", str(D / "brand" / "halocord.ico"),
      "--set-file-version", "2.8.4", "--set-product-version", "2.8.4"]
for k, v in dict(CompanyName="DavidHiFi", ProductName="HaloCord", FileDescription="HaloCord", InternalName="HaloCord",
                 OriginalFilename="HaloCord.exe", LegalCopyright="Copyright (c) 2026 DavidHiFi").items():
    rc += ["--set-version-string", k, v]
subprocess.run(rc, creationflags=subprocess.CREATE_NO_WINDOW, check=True)
print("rebranded strings in main.js:", n)
shutil.rmtree(OUT / "installer" / "dist", ignore_errors=True)
(OUT / "installer").mkdir(exist_ok=True)
(OUT / "installer" / "package.json").write_text((D / "installer-package.json").read_text(encoding="utf-8")
                                                .replace("../brand/", (D / "brand").as_posix() + "/"), encoding="utf-8")
subprocess.run("npx -y electron-builder@26.18.0 --win nsis --prepackaged ../app", cwd=OUT / "installer", **NW)
print("installer:", next((OUT / "installer" / "dist").glob("*.exe")))
