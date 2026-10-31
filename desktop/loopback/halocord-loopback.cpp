// halocord-loopback: per-process WASAPI loopback for HaloCord screen share sound.
// Usage: halocord-loopback.exe <pid> <include|exclude>
// Writes 48 kHz stereo float32 PCM to stdout until stdin closes (the parent went away) or capture fails.
#include <windows.h>
#include <mmdeviceapi.h>
#include <audioclient.h>
#include <audioclientactivationparams.h>
#include <wrl/implements.h>
#include <io.h>
#include <fcntl.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <vector>
#pragma comment(lib, "mmdevapi.lib")
#pragma comment(lib, "ole32.lib")
using namespace Microsoft::WRL;

class Done : public RuntimeClass<RuntimeClassFlags<ClassicCom>, FtmBase, IActivateAudioInterfaceCompletionHandler> {
public:
    HANDLE ev = CreateEventW(nullptr, TRUE, FALSE, nullptr);
    STDMETHOD(ActivateCompleted)(IActivateAudioInterfaceAsyncOperation*) override { SetEvent(ev); return S_OK; }
};

static DWORD WINAPI WatchStdin(LPVOID) {
    char b[64];
    while (fread(b, 1, sizeof b, stdin) > 0) {}
    ExitProcess(0);
}

int wmain(int argc, wchar_t** argv) {
    if (argc < 3) { fwprintf(stderr, L"usage: mc-loopback <pid> <include|exclude>\n"); return 2; }
    _setmode(_fileno(stdout), _O_BINARY);
    _setmode(_fileno(stdin), _O_BINARY);
    CreateThread(nullptr, 0, WatchStdin, nullptr, 0, nullptr);
    if (FAILED(CoInitializeEx(nullptr, COINIT_MULTITHREADED))) return 3;

    AUDIOCLIENT_ACTIVATION_PARAMS ap = {};
    ap.ActivationType = AUDIOCLIENT_ACTIVATION_TYPE_PROCESS_LOOPBACK;
    ap.ProcessLoopbackParams.TargetProcessId = (DWORD)_wtoi(argv[1]);
    ap.ProcessLoopbackParams.ProcessLoopbackMode = wcscmp(argv[2], L"exclude") == 0
        ? PROCESS_LOOPBACK_MODE_EXCLUDE_TARGET_PROCESS_TREE : PROCESS_LOOPBACK_MODE_INCLUDE_TARGET_PROCESS_TREE;
    PROPVARIANT pv = {};
    pv.vt = VT_BLOB;
    pv.blob.cbSize = sizeof ap;
    pv.blob.pBlobData = (BYTE*)&ap;

    HRESULT hr;
    ComPtr<IAudioClient> client;
    if (wcscmp(argv[2], L"device") == 0) {
        // Diagnostic: plain loopback of the default output device.
        ComPtr<IMMDeviceEnumerator> en; ComPtr<IMMDevice> dev;
        CoCreateInstance(__uuidof(MMDeviceEnumerator), nullptr, CLSCTX_ALL, IID_PPV_ARGS(&en));
        if (!en || FAILED(en->GetDefaultAudioEndpoint(eRender, eConsole, &dev))) return 10;
        LPWSTR id; dev->GetId(&id); fwprintf(stderr, L"device %s\n", id);
        dev->Activate(__uuidof(IAudioClient), CLSCTX_ALL, nullptr, (void**)client.GetAddressOf());
    } else {
    auto done = Make<Done>();
    ComPtr<IActivateAudioInterfaceAsyncOperation> op;
    hr = ActivateAudioInterfaceAsync(VIRTUAL_AUDIO_DEVICE_PROCESS_LOOPBACK, __uuidof(IAudioClient), &pv, done.Get(), &op);
    if (FAILED(hr)) { fwprintf(stderr, L"activate 0x%08x\n", hr); return 4; }
    WaitForSingleObject(done->ev, INFINITE);
    HRESULT ar = E_FAIL;
    ComPtr<IUnknown> unk;
    op->GetActivateResult(&ar, &unk);
    if (FAILED(ar)) { fwprintf(stderr, L"activate result 0x%08x\n", ar); return 5; }
    unk.As(&client);
    }

    WAVEFORMATEX wf = {};
    // Process loopback hands back 16-bit PCM reliably; the float conversion happens below.
    wf.wFormatTag = WAVE_FORMAT_PCM;
    wf.nChannels = 2;
    wf.nSamplesPerSec = 48000;
    wf.wBitsPerSample = 16;
    wf.nBlockAlign = 4;
    wf.nAvgBytesPerSec = 48000 * 4;
    hr = client->Initialize(AUDCLNT_SHAREMODE_SHARED, AUDCLNT_STREAMFLAGS_LOOPBACK | AUDCLNT_STREAMFLAGS_EVENTCALLBACK | AUDCLNT_STREAMFLAGS_AUTOCONVERTPCM,
                            200000, 0, &wf, nullptr);
    if (FAILED(hr)) { fwprintf(stderr, L"initialize 0x%08x\n", hr); return 6; }
    HANDLE ready = CreateEventW(nullptr, FALSE, FALSE, nullptr);
    client->SetEventHandle(ready);
    ComPtr<IAudioCaptureClient> cap;
    if (FAILED(client->GetService(IID_PPV_ARGS(&cap)))) return 7;
    if (FAILED(client->Start())) return 8;
    fwprintf(stderr, L"capturing\n");

    std::vector<float> out;
    for (;;) {
        WaitForSingleObject(ready, 100);
        UINT32 n = 0;
        while (SUCCEEDED(cap->GetNextPacketSize(&n)) && n > 0) {
            BYTE* data; UINT32 frames; DWORD flags;
            if (FAILED(cap->GetBuffer(&data, &frames, &flags, nullptr, nullptr))) return 9;
            out.resize(frames * 2);
            const short* in = (const short*)data;
            for (UINT32 i = 0; i < frames * 2; i++) out[i] = (flags & AUDCLNT_BUFFERFLAGS_SILENT) ? 0.f : in[i] / 32768.f;
            if (fwrite(out.data(), 8, frames, stdout) != frames) return 0;
            cap->ReleaseBuffer(frames);
        }
        fflush(stdout);
    }
}
