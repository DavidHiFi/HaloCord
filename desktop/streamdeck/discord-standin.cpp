// The Elgato Stream Deck Discord plugin only runs its actions while a process named Discord.exe,
// DiscordPTB.exe or DiscordCanary.exe exists. HaloCord serves the same RPC pipe, so this stand-in
// carries that name and does nothing else: it waits for the HaloCord process id it was given, then exits.
#include <windows.h>
#include <stdlib.h>

int WINAPI wWinMain(HINSTANCE, HINSTANCE, LPWSTR cmd, int) {
    DWORD pid = wcstoul(cmd, nullptr, 10);
    if (!pid) return 1;
    HANDLE parent = OpenProcess(SYNCHRONIZE, FALSE, pid);
    if (!parent) return 1;
    WaitForSingleObject(parent, INFINITE);
    CloseHandle(parent);
    return 0;
}
