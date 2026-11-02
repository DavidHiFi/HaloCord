// Game detection for the HaloCord overlay: Discord's public list of detectable games, matched against
// running Windows processes by executable name (and path suffix, like "_retail_/wow.exe").
// Pure helpers plus the kernel32 calls; hc-overlay-main.js owns the timers and the cache file.

// Keeps only what matching needs: { apps: { id: [name, iconHash] }, exe: { basename: [[id, suffix], ...] } }.
// Launchers are not games, and ">name" entries need the command line (javaw.exe for Minecraft), so both are left out.
function buildIndex(list) {
    const apps = {}, exe = {};
    for (const a of Array.isArray(list) ? list : []) {
        if (!a || typeof a.id !== "string" || typeof a.name !== "string" || !Array.isArray(a.executables)) continue;
        let used = false;
        for (const e of a.executables) {
            if (!e || e.os !== "win32" || e.is_launcher || typeof e.name !== "string") continue;
            const n = e.name.toLowerCase().replace(/\\/g, "/");
            if (!n || n.startsWith(">")) continue;
            const base = n.slice(n.lastIndexOf("/") + 1);
            if (!base) continue;
            (exe[base] ||= []).push([a.id, n.includes("/") ? "/" + n : ""]);
            used = true;
        }
        if (used) apps[a.id] = [a.name.slice(0, 100), typeof a.icon_hash === "string" ? a.icon_hash : ""];
    }
    return { apps, exe };
}

// procs: [{ pid, exe }]. fullPath(pid) is only asked for when a candidate needs a path suffix.
// Returns Map pid -> app id. A plain name match wins over nothing; a suffix match wins over a plain one.
function match(index, procs, fullPath) {
    const out = new Map();
    for (const p of procs) {
        const list = index.exe[String(p.exe).toLowerCase()];
        if (!list) continue;
        let hit = null, path;
        for (const [id, suffix] of list) {
            if (!suffix) {
                hit ||= id;
                continue;
            }
            if (path === undefined) path = String(fullPath(p.pid) || "").toLowerCase().replace(/\\/g, "/");
            if (path && path.endsWith(suffix)) {
                hit = id;
                break;
            }
        }
        if (hit && index.apps[hit]) out.set(p.pid, hit);
    }
    return out;
}

let k32;
function api() {
    if (k32 !== undefined) return k32;
    k32 = null;
    if (process.platform !== "win32") return null;
    try {
        const k = require("koffi"), l = k.load("kernel32.dll");
        k32 = {
            snap: l.func("void * __stdcall CreateToolhelp32Snapshot(uint32 flags, uint32 pid)"),
            first: l.func("int __stdcall Process32FirstW(void *snap, void *entry)"),
            next: l.func("int __stdcall Process32NextW(void *snap, void *entry)"),
            close: l.func("int __stdcall CloseHandle(void *h)"),
            open: l.func("void * __stdcall OpenProcess(uint32 access, int inherit, uint32 pid)"),
            image: l.func("int __stdcall QueryFullProcessImageNameW(void *h, uint32 flags, void *buf, _Inout_ uint32 *size)"),
            address: v => k.address(v)
        };
    } catch (e) { console.error("[HaloCord] overlay: kernel32 unavailable, no game detection", e); }
    return k32;
}

// PROCESSENTRY32W on x64: th32ProcessID at 8, szExeFile (260 UTF-16 chars) at 44, 568 bytes in all.
const ENTRY = 568, PID_AT = 8, EXE_AT = 44;
const entry = Buffer.alloc(ENTRY), pathBuf = Buffer.alloc(2048);

function processes() {
    const k = api();
    if (!k) return [];
    const h = k.snap(2, 0); // TH32CS_SNAPPROCESS
    if (!h || k.address(h) === 0xFFFFFFFFFFFFFFFFn) return []; // INVALID_HANDLE_VALUE
    const out = [];
    try {
        entry.fill(0);
        entry.writeUInt32LE(ENTRY, 0);
        for (let ok = k.first(h, entry); ok; ok = k.next(h, entry)) {
            let end = EXE_AT;
            while (end < ENTRY && entry.readUInt16LE(end) !== 0) end += 2;
            out.push({ pid: entry.readUInt32LE(PID_AT), exe: entry.toString("utf16le", EXE_AT, end) });
        }
    } finally { k.close(h); }
    return out;
}

function fullPath(pid) {
    const k = api();
    if (!k) return "";
    const h = k.open(0x1000, 0, pid); // PROCESS_QUERY_LIMITED_INFORMATION
    if (!h || k.address(h) === 0n) return "";
    try {
        const size = [pathBuf.length / 2];
        return k.image(h, 0, pathBuf, size) ? pathBuf.toString("utf16le", 0, size[0] * 2) : "";
    } finally { k.close(h); }
}

module.exports = { buildIndex, match, processes, fullPath };
