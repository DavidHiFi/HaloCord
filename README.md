<div align="center">

<img src="https://socialify.git.ci/DavidHiFi/MochaCord-Client/image?description=1&font=Inter&language=1&name=1&owner=1&pattern=Plus&theme=Dark" alt="Socialify card for DavidHiFi/MochaCord-Client" width="100%">

# MochaCord

**A Windows Discord client built for voice, forked from KurtCord.**

96 kHz stereo voice, three call guards, camera control to 4K60, and a full Voice & Video quick panel.

<a href="https://github.com/DavidHiFi/MochaCord-Client/releases/latest">
<img src="https://img.shields.io/badge/%E2%AC%87%EF%B8%8F%20DOWNLOAD%20LATEST%20RELEASE-2EA043?style=for-the-badge&labelColor=161B22" alt="Download the latest release" height="42">
</a>

<br><br>

<img src="https://img.shields.io/github/v/release/DavidHiFi/MochaCord-Client?style=flat-square&label=version&color=8957E5&labelColor=161B22" alt="Latest version">
<img src="https://img.shields.io/github/downloads/DavidHiFi/MochaCord-Client/total?style=flat-square&label=downloads&color=1F6FEB&labelColor=161B22" alt="Total downloads">
<img src="https://img.shields.io/badge/platform-Windows-DB6D28?style=flat-square&labelColor=161B22" alt="Platform: Windows">

</div>

---

## Installation

There is no release right now. MochaCord is a work in progress, and installers come back once it is ready. Until then you can build it yourself; [docs/building.md](docs/building.md) has the steps.

## Source

| Folder | What it holds |
|---|---|
| `base/` | KurtCord 2.8.3's app files, unchanged, as the shell starts from them. |
| `shell/` | MochaCord's own shell code: the acrylic window blur and the voice effects engine. |
| `build/` | `assemble.py`, which patches the shell, adds the bundle and makes the installer. |
| `web/` | The TestCord-based plugin bundle with MochaCord's changes. |
| `brand/` | Icon sources. |
| `tools/` | Small scripts for checking a running build over the debug port. |

## Features

### Voice

- **96 kHz HD voice** with stereo, when both ends support it.
- **Opus controls** for bitrate, sample rate, frame time, complexity, FEC, DTX and CBR.
- **Microphone chain** with gain, reverb and EQ, plus second and third microphone inputs with their own devices.
- **Input bypass** that sends your microphone raw, past system processing.
- **Voice effects** in Voice & Video: pitch, echo, robot, bitcrush, radio static and eleven presets, heard in the mic test.
- **Screen share with audio**, captured without echo cancellation, noise suppression or gain control.

### Voice guards

- **StereoGuard** locally mutes anyone whose audio is not fully mono, with a per-person allow list.
- **MicSpamGuard** locally mutes anyone who gets too loud or spams the mic.
- **MicSpamGuard DH** balances voice volumes automatically and protects against sustained extreme loudness.
- Allow and un-allow anyone from the user context menu, under the volume slider.

### Camera and screen share

- **Camera presets** from 720p60 to 2160p60, plus 1080p120 and custom resolution, frame rate and bitrate.
- **Constant bitrate camera encoder** instead of Discord's adaptive ladder.
- **Advanced Camera Controls** and **Advanced Hardware Acceleration** for caps, rasterisation and decode.
- **Native camera rendering** with no canvas re-encode when no filter is set.

### Window

- **Acrylic blur** behind the window on Windows 11, the same effect Windhawk's translucent-windows mod gives Discord.

### Privacy

- Every setting lives on your machine. No analytics, no telemetry, no backend server.
- A standard Chrome fingerprint with no automation flags.

### Built-in plugins

- The Equicord plugin suite and the Testcord plugins, ready out of the box.
- Twelve maintained voice plugins, including ClickToUnmute, StaffTag, FakeVoice, LyricsStatus, StreamEnhancer, Custom Stream Quality, RoundedVCPFP, MicSpamGuard, StereoGuard, VoiceVUMeters, HasStrip and PanelLayout.

## Notes

> [!IMPORTANT]
> **Work in progress.** The source here builds MochaCord 2.8.4, which already runs under its own name, stores settings in `%APPDATA%\MochaCord`, and checks this repo for updates. There is no release yet.

> [!WARNING]
> **Third-party client.** Discord does not officially support third-party clients. KurtCord's own FAQ says the client-side cause of account flags was fixed in 2.7.7, but behavior no client controls, like mass friend requests or brand new accounts, can still draw action. Use it at your own risk.

## Contributing

Bug reports with the client version and a screenshot help most right now.

<a href="CONTRIBUTING.md">
<img src="https://img.shields.io/badge/%F0%9F%A4%9D%20HOW%20TO%20CONTRIBUTE-8957E5?style=for-the-badge&labelColor=161B22" alt="How to contribute" height="36">
</a>

## Star history

Thank you for starring the repo.

<a href="https://www.star-history.com/?repos=DavidHiFi%2FMochaCord-Client&amp;type=date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=DavidHiFi/MochaCord-Client&amp;type=date&amp;theme=dark&amp;legend=top-left" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=DavidHiFi/MochaCord-Client&amp;type=date" />
    <img alt="DavidHiFi/MochaCord-Client GitHub star history" src="https://api.star-history.com/chart?repos=DavidHiFi/MochaCord-Client&amp;type=date" />
  </picture>
</a>

## Credits

- **Author:** Myself, [DavidHiFi](https://github.com/DavidHiFi)

| Who | What |
|---|---|
| **Kurtzon** ([KurtCord](https://github.com/kurtzonaudio/kurtcord)) | The whole client: voice engine, guards, camera path, installers and plugins. MochaCord is a fork of KurtCord 2.8.3. |
| **Equicord contributors** ([Equicord](https://github.com/Equicord/Equicord)) | The bundled Equicord plugin suite. |
| **TestcordDev** ([TestCord](https://github.com/TestcordDev/TestCord)) | The bundled Testcord plugins and the base of `web/`. |
| **Vladimír Kalouš** ([koffi](https://github.com/Koromix/koffi)) | The library the shell uses to call Windows for the acrylic blur. |

Built on [Electron](https://www.electronjs.org/), running [Discord](https://discord.com)'s web app, with the [Equicord](https://github.com/Equicord/Equicord) plugin suite.

> Missing or wrong credit? [Open an issue](https://github.com/DavidHiFi/MochaCord-Client/issues/new) and I'll fix it.

## Disclaimers

This repository was set up with an AI coding agent working for the repo owner, and the MochaCord changes in `shell/`, `build/` and `web/` were written the same way. The client underneath is Kurtzon's work.

The [DavidHiFi/MochaCord](https://github.com/DavidHiFi/MochaCord) theme is a separate project. It is a Catppuccin Mocha theme for Vencord-based clients, not this client.

<div align="center">
<br>
<sub>Not affiliated with Discord or Kurtzon Audio. Requires a Discord account.</sub>
</div>
