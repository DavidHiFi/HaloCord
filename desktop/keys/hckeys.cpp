// Global keybinds for HaloCord (the haloKeybinds plugin): low-level keyboard and mouse hooks in passthrough
// mode. The hook callbacks only queue the event and always hand it straight on with CallNextHookEx, so no
// key is ever blocked, changed or injected. A worker thread checks each event against the keys HaloCord
// asked for on stdin ("f k65 m3", "w 1" = every key while a key recorder is open) and writes
// "<device> <down> <code>" lines to stdout (device 0 = key with its Windows VK code, 1 = mouse button
// 0-4). Nothing is written to disk. Exits when stdin closes or the HaloCord process id it was given ends.
#include <windows.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

struct Ev { unsigned char dev, down; unsigned short code; };
static Ev queue[4096];
static unsigned qHead, qTail;
static CRITICAL_SECTION qLock, fLock;
static HANDLE qReady;
static DWORD mainThread;
static bool want[2][256], all; // guarded by fLock

static void push(unsigned char dev, unsigned char down, unsigned short code) {
    EnterCriticalSection(&qLock);
    if (qTail - qHead < 4096) queue[qTail++ % 4096] = { dev, down, code };
    LeaveCriticalSection(&qLock);
    SetEvent(qReady);
}

static LRESULT CALLBACK keyHook(int n, WPARAM w, LPARAM l) {
    if (n == HC_ACTION) {
        unsigned vk = ((KBDLLHOOKSTRUCT*)l)->vkCode & 255;
        push(0, w == WM_KEYDOWN || w == WM_SYSKEYDOWN, (unsigned short)vk);
    }
    return CallNextHookEx(nullptr, n, w, l);
}

static LRESULT CALLBACK mouseHook(int n, WPARAM w, LPARAM l) {
    if (n == HC_ACTION) {
        switch (w) {
        case WM_LBUTTONDOWN: case WM_LBUTTONUP: push(1, w == WM_LBUTTONDOWN, 0); break;
        case WM_RBUTTONDOWN: case WM_RBUTTONUP: push(1, w == WM_RBUTTONDOWN, 1); break;
        case WM_MBUTTONDOWN: case WM_MBUTTONUP: push(1, w == WM_MBUTTONDOWN, 2); break;
        case WM_XBUTTONDOWN: case WM_XBUTTONUP:
            push(1, w == WM_XBUTTONDOWN, HIWORD(((MSLLHOOKSTRUCT*)l)->mouseData) == XBUTTON2 ? 4 : 3);
            break;
        }
    }
    return CallNextHookEx(nullptr, n, w, l);
}

static void quit() { PostThreadMessageW(mainThread, WM_QUIT, 0, 0); }

// Left/right modifier variants report as the plain modifier, the way browser keybinds store them.
static unsigned same(unsigned vk) {
    switch (vk) {
    case VK_LSHIFT: case VK_RSHIFT: return VK_SHIFT;
    case VK_LCONTROL: case VK_RCONTROL: return VK_CONTROL;
    case VK_LMENU: case VK_RMENU: return VK_MENU;
    case VK_RWIN: return VK_LWIN;
    }
    return vk;
}

static DWORD WINAPI worker(LPVOID parent) {
    HANDLE out = GetStdHandle(STD_OUTPUT_HANDLE);
    HANDLE waits[2] = { qReady, (HANDLE)parent };
    bool raw[256] = {}, sent[2][256] = {};
    int count[256] = {};
    for (;;) {
        if (WaitForMultipleObjects(2, waits, FALSE, INFINITE) != WAIT_OBJECT_0) return quit(), 0;
        for (;;) {
            Ev e;
            EnterCriticalSection(&qLock);
            bool any = qHead != qTail;
            if (any) e = queue[qHead++ % 4096];
            LeaveCriticalSection(&qLock);
            if (!any) break;
            unsigned code = e.code;
            if (e.dev == 0) {
                if (code == VK_PACKET || code == 255 || raw[code] == !!e.down) continue; // auto-repeat or unknown key
                raw[code] = e.down;
                code = same(code);
                count[code] += e.down ? 1 : -1;
                if (count[code] != (e.down ? 1 : 0)) continue; // the other left/right variant is still held
            }
            // A release always goes out when its press did, even if the filter changed in between.
            EnterCriticalSection(&fLock);
            bool pass = e.down ? (all || want[e.dev][code]) : sent[e.dev][code];
            LeaveCriticalSection(&fLock);
            if (!pass) continue;
            sent[e.dev][code] = e.down;
            char line[32];
            int len = sprintf_s(line, "%d %d %u\n", e.dev, e.down, code);
            DWORD done;
            if (!WriteFile(out, line, len, &done, nullptr)) return quit(), 0;
        }
    }
}

static void apply(char* line) {
    bool next[2][256] = {};
    if (line[0] == 'w') {
        EnterCriticalSection(&fLock);
        all = line[2] == '1';
        LeaveCriticalSection(&fLock);
        return;
    }
    if (line[0] != 'f') return;
    char* ctx = nullptr;
    for (char* t = strtok_s(line + 1, " ", &ctx); t; t = strtok_s(nullptr, " ", &ctx)) {
        unsigned v = strtoul(t + 1, nullptr, 10);
        if (v < 256 && (t[0] == 'k' || t[0] == 'm')) next[t[0] == 'm'][v] = true;
    }
    EnterCriticalSection(&fLock);
    memcpy(want, next, sizeof want);
    LeaveCriticalSection(&fLock);
}

static DWORD WINAPI reader(LPVOID) {
    HANDLE in = GetStdHandle(STD_INPUT_HANDLE);
    char buf[8192];
    size_t used = 0;
    DWORD got;
    while (ReadFile(in, buf + used, (DWORD)(sizeof buf - 1 - used), &got, nullptr) && got) {
        used += got;
        char* start = buf;
        for (char* nl; (nl = (char*)memchr(start, '\n', buf + used - start)); start = nl + 1) {
            *nl = 0;
            if (nl > start && nl[-1] == '\r') nl[-1] = 0;
            apply(start);
        }
        used -= start - buf;
        memmove(buf, start, used);
        if (used == sizeof buf - 1) used = 0; // overlong line, drop it
    }
    quit();
    return 0;
}

int WINAPI wWinMain(HINSTANCE inst, HINSTANCE, LPWSTR cmd, int) {
    DWORD pid = wcstoul(cmd, nullptr, 10);
    HANDLE parent = pid ? OpenProcess(SYNCHRONIZE, FALSE, pid) : nullptr;
    if (!parent) return 1;
    MSG msg;
    PeekMessageW(&msg, nullptr, 0, 0, PM_NOREMOVE); // create the queue so the other threads can post WM_QUIT
    mainThread = GetCurrentThreadId();
    SetThreadPriority(GetCurrentThread(), THREAD_PRIORITY_HIGHEST); // every key press system-wide waits on this thread
    InitializeCriticalSection(&qLock);
    InitializeCriticalSection(&fLock);
    qReady = CreateEventW(nullptr, FALSE, FALSE, nullptr);
    HHOOK kh = SetWindowsHookExW(WH_KEYBOARD_LL, keyHook, inst, 0);
    HHOOK mh = SetWindowsHookExW(WH_MOUSE_LL, mouseHook, inst, 0);
    if (!kh || !mh) return 2;
    CloseHandle(CreateThread(nullptr, 0, worker, parent, 0, nullptr));
    CloseHandle(CreateThread(nullptr, 0, reader, nullptr, 0, nullptr));
    while (GetMessageW(&msg, nullptr, 0, 0) > 0) {}
    UnhookWindowsHookEx(kh);
    UnhookWindowsHookEx(mh);
    ExitProcess(0);
}
