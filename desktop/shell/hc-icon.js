// HaloCord app icon choice (green or Catppuccin Mocha blue): window and taskbar icons, the tray,
// the Start menu, desktop and pinned taskbar shortcuts, and the icon inside HaloCord.exe.
// The .ico files sit in resources\icons, outside app.asar, so shortcuts can point at them.
// A running exe cannot be written, but it can be renamed: the icon goes into a copy, the running
// file steps aside as HaloCord.exe.<time>.old (deleted at the next start) and the copy takes its name.
const { app, BrowserWindow, shell } = require("electron");
const fs = require("fs");
const path = require("path");

const FILES = { green: "halocord.ico", mocha: "halocord-mocha.ico" };
const RT_ICON = 3, RT_GROUP_ICON = 14, GROUP_ID = 1, LANG = 1033;  // the layout rcedit leaves in HaloCord.exe

const variantOf = v => Object.hasOwn(FILES, v) ? v : "green";
function icoPath(variant) {
    const p = path.join(process.resourcesPath, "icons", FILES[variantOf(variant)]);
    return fs.existsSync(p) ? p : path.join(__dirname, "icon.ico");
}

let api;
function win32() {
    if (api) return api;
    const k = require("koffi");
    const kernel = k.load("kernel32.dll"), sh = k.load("shell32.dll");
    api = {
        begin: kernel.func("void* __stdcall BeginUpdateResourceW(str16 file, int deleteExisting)"),
        update: kernel.func("int __stdcall UpdateResourceW(void* h, uintptr_t type, uintptr_t name, uint16_t lang, const uint8_t* data, uint32_t size)"),
        end: kernel.func("int __stdcall EndUpdateResourceW(void* h, int discard)"),
        loadLib: kernel.func("void* __stdcall LoadLibraryExW(str16 file, void* reserved, uint32_t flags)"),
        findRes: kernel.func("void* __stdcall FindResourceExW(void* module, uintptr_t type, uintptr_t name, uint16_t lang)"),
        resSize: kernel.func("uint32_t __stdcall SizeofResource(void* module, void* res)"),
        freeLib: kernel.func("int __stdcall FreeLibrary(void* module)"),
        notify: sh.func("void __stdcall SHChangeNotify(int32_t event, uint32_t flags, str16 item1, void* item2)")
    };
    return api;
}

// Explorer redraws one changed file (SHCNE_UPDATEITEM, SHCNF_PATHW) or all icons (SHCNE_ASSOCCHANGED).
function refreshShell(paths) {
    try {
        const { notify } = win32();
        for (const p of paths) notify(0x2000, 0x5, p, null);
        notify(0x8000000, 0, null, null);
    } catch (e) { console.error("[HaloCord] icon refresh failed", e); }
}

// An .ico file as the RT_ICON images and the RT_GROUP_ICON directory that indexes them.
function parseIco(buf) {
    if (buf.readUInt16LE(0) !== 0 || buf.readUInt16LE(2) !== 1) throw new Error("not an .ico file");
    const count = buf.readUInt16LE(4), group = Buffer.alloc(6 + 14 * count), images = [];
    buf.copy(group, 0, 0, 6);
    for (let i = 0; i < count; i++) {
        const e = 6 + 16 * i, size = buf.readUInt32LE(e + 8), offset = buf.readUInt32LE(e + 12);
        images.push(buf.subarray(offset, offset + size));
        buf.copy(group, 6 + 14 * i, e, e + 12);
        group.writeUInt16LE(i + 1, 6 + 14 * i + 12);
    }
    return { group, images };
}

function resourceSizes(file, ids) {
    const { loadLib, findRes, resSize, freeLib } = win32();
    const mod = loadLib(file, null, 0x2 | 0x20);  // LOAD_LIBRARY_AS_DATAFILE | AS_IMAGE_RESOURCE
    if (!mod) return null;
    try {
        return ids.map(([type, id]) => { const r = findRes(mod, type, id, LANG); return r ? resSize(mod, r) : -1; });
    } finally { freeLib(mod); }
}

const endAsync = (h, discard) => new Promise((resolve, reject) =>
    win32().end.async(h, discard, (e, ok) => e ? reject(e) : resolve(ok)));

async function setExeIcon(variant) {
    // The process may already run from an earlier .old file, so every rewrite gets its own name.
    const exe = process.execPath, next = `${exe}.new`, old = `${exe}.${Date.now()}.old`;
    const { group, images } = parseIco(fs.readFileSync(icoPath(variant)));
    if (!(resourceSizes(exe, [[RT_GROUP_ICON, GROUP_ID]])?.[0] > 0)) throw new Error("HaloCord.exe has no icon group to replace");
    await fs.promises.copyFile(exe, next);
    try {
        const { begin, update } = win32();
        const h = begin(next, 0);
        if (!h) throw new Error("could not open the copy for writing");
        let ok = images.every((img, i) => update(h, RT_ICON, i + 1, LANG, img, img.length));
        ok = update(h, RT_GROUP_ICON, GROUP_ID, LANG, group, group.length) && ok;
        if (!await endAsync(h, ok ? 0 : 1) || !ok) throw new Error("writing the icon failed");
        const want = [group.length, ...images.map(i => i.length)];
        const got = resourceSizes(next, [[RT_GROUP_ICON, GROUP_ID], ...images.map((_, i) => [RT_ICON, i + 1])]);
        if (!got || got.some((n, i) => n !== want[i])) throw new Error("the rewritten copy did not check out");
        fs.renameSync(exe, old);
        try { fs.renameSync(next, exe); } catch (e) { fs.renameSync(old, exe); throw e; }
    } finally {
        fs.rmSync(next, { force: true });
    }
    const st = fs.statSync(exe);
    return { variant, size: st.size, mtimeMs: st.mtimeMs };
}

// Shortcuts to this exe in the places the installer and Windows put them.
function shortcuts() {
    const roaming = app.getPath("appData"), exe = process.execPath.toLowerCase(), found = [];
    for (const dir of [app.getPath("desktop"), path.join(roaming, "Microsoft", "Windows", "Start Menu", "Programs"),
        path.join(roaming, "Microsoft", "Internet Explorer", "Quick Launch", "User Pinned", "TaskBar")]) {
        let names = [];
        try { names = fs.readdirSync(dir).filter(n => n.toLowerCase().endsWith(".lnk")); } catch { }
        for (const n of names) {
            const file = path.join(dir, n);
            try {
                const link = shell.readShortcutLink(file);
                if (link.target?.toLowerCase() === exe) found.push({ file, link });
            } catch { }
        }
    }
    return found;
}

function setShortcutIcons(variant) {
    const ico = icoPath(variant), all = shortcuts(), changed = [];
    for (const { file, link } of all) {
        const icon = (link.icon || process.execPath).toLowerCase();
        // The installer's shortcuts show the exe's own icon, which is green until a rewrite.
        if (!link.iconIndex && (icon === ico.toLowerCase() || variant === "green" && icon === process.execPath.toLowerCase())) continue;
        if (shell.writeShortcutLink(file, "update", { icon: ico, iconIndex: 0 })) changed.push(file);
    }
    return { changed, total: all.length };
}

function setWindowIcons(variant, tray) {
    const ico = icoPath(variant);
    for (const w of BrowserWindow.getAllWindows()) if (!w.isDestroyed()) w.setIcon(ico);
    try { tray?.setImage(ico); } catch { }
}

// Applies the choice everywhere. exeState is what the last exe rewrite left ({ variant, size, mtimeMs }),
// so a start after an update (which puts the green exe back) rewrites it again only when needed.
async function apply(variant, { tray, exeState, windows = true }) {
    variant = variantOf(variant);
    if (windows) setWindowIcons(variant, tray);
    const result = { variant, shortcuts: 0, exe: "unchanged", exeState };
    if (process.platform !== "win32" || !app.isPackaged) return { ...result, exe: "dev build" };
    const changedFiles = [];
    try {
        const s = setShortcutIcons(variant);
        result.shortcuts = s.total;
        changedFiles.push(...s.changed);
    } catch (e) { console.error("[HaloCord] shortcut icons failed", e); }
    try {
        const st = fs.statSync(process.execPath);
        const same = exeState && exeState.size === st.size && exeState.mtimeMs === st.mtimeMs;
        // A fresh install or update carries the green icon, and a rewrite records what it wrote.
        const current = same ? exeState.variant : "green";
        if (!same) result.exeState = null;
        if (current !== variant) {
            result.exeState = await setExeIcon(variant);
            result.exe = "updated";
            changedFiles.push(process.execPath);
        }
    } catch (e) {
        console.error("[HaloCord] exe icon failed", e);
        result.exe = `failed: ${e.message}`;
    }
    if (changedFiles.length) refreshShell(changedFiles);
    return result;
}

// Removes the exe files earlier rewrites set aside; the one this process runs from stays locked.
function cleanup() {
    if (!app.isPackaged) return;
    const dir = path.dirname(process.execPath), prefix = `${path.basename(process.execPath)}.`.toLowerCase();
    fs.readdir(dir, (e, names) => {
        for (const n of e ? [] : names) {
            const l = n.toLowerCase();
            if (l.startsWith(prefix) && (/^\d+\.old$/.test(l.slice(prefix.length)) || l === `${prefix}new`)) fs.rm(path.join(dir, n), { force: true }, () => { });
        }
    });
}

module.exports = { icoPath, variantOf, apply, cleanup };
