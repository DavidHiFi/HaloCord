<div align="center">

<img src="docs/images/voice-effects.png" alt="MochaCord's Voice & Video settings with the voice effects panel open" width="100%">

# <img src="brand/icon.png" width="36" align="center" alt=""> MochaCord

**The Discord client built for voice.**

HD stereo voice, call guards, voice effects, full Go Live controls and hundreds of plugins, in one Windows app.

<a href="#installation">
<img src="https://img.shields.io/badge/%F0%9F%9B%A0%EF%B8%8F%20IN%20DEVELOPMENT-2EA043?style=for-the-badge&labelColor=161B22" alt="In development: see installation" height="42">
</a>

<br><br>

<img src="https://img.shields.io/github/license/DavidHiFi/MochaCord-Client?style=flat-square&color=8957E5&labelColor=161B22" alt="License: MIT">
<img src="https://img.shields.io/github/last-commit/DavidHiFi/MochaCord-Client?style=flat-square&label=updated&color=1F6FEB&labelColor=161B22" alt="Last commit">
<img src="https://img.shields.io/badge/platform-Windows-DB6D28?style=flat-square&labelColor=161B22" alt="Platform: Windows">

</div>

---

## Installation

There is no release yet. Installers come once MochaCord is ready. Until then you can build it yourself; [docs/building.md](docs/building.md) has the steps.

## Features

- **96 kHz stereo voice** with full Opus control: bitrate, sample rate, frame time, complexity, FEC, DTX and CBR.
- **Voice effects** you hear in the mic test: pitch, echo, robot, bitcrush, muffle, static and eleven presets.
- **Call guards** that locally mute people who blast stereo noise, get too loud or spam their mic, with a per-person allow list.
- **Go Live controls** before every stream: resolution, frame rate, bitrate and quality presets.
- **Camera up to 4K60** and 1080p120, with a constant bitrate encoder in place of Discord's adaptive ladder.
- **Microphone chain** with gain, reverb, EQ, extra inputs and a raw bypass that skips system processing.
- **Hundreds of built-in plugins**, from the Vencord, Equicord and TestCord sets plus MochaCord's own voice plugins.
- **Acrylic window** on Windows 11.
- **Private by default.** Settings stay on your machine. No analytics, no telemetry, no MochaCord server.

<div align="center">
<img src="docs/images/go-live.png" alt="The Go Live window with resolution, frame rate and bitrate controls" width="70%">
</div>

## Notes

> [!IMPORTANT]
> **Work in progress.** MochaCord 2.8.4 builds and runs from this source. It stores settings in `%APPDATA%\MochaCord` and checks this repo for updates. There is no release yet.

> [!WARNING]
> **Third-party client.** Discord does not support third-party clients. Spam-like behavior, such as mass friend requests, can get an account actioned. Use it at your own risk.

<details>
<summary>What is in this repo</summary>

| Folder | What it holds |
|---|---|
| `base/` | The 2.8.3 Electron app files MochaCord's shell starts from, unchanged. |
| `shell/` | MochaCord's shell code: the acrylic window and the voice effects engine. |
| `build/` | `assemble.py`, which patches the shell, adds the plugin bundle and makes the installer. |
| `web/` | The plugin bundle: MochaCord's mod layer and every built-in plugin. |
| `brand/` | Icon sources. |
| `tools/` | Small scripts that check a running build over the debug port. |
| `docs/` | Build steps and README images. |

</details>

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
| **[Kurtzon](https://github.com/kurtzonaudio)** | The original Electron shell and voice engine MochaCord's shell is built from, under the MIT license. |
| **[Vencord](https://github.com/Vendicated/Vencord) and [Equicord](https://github.com/Equicord/Equicord) contributors** | The mod framework and plugin suites bundled in `web/`. |
| **[TestcordDev](https://github.com/TestcordDev/TestCord)** | The TestCord plugins and the base of `web/`. |
| **[Vladimír Kalouš](https://github.com/Koromix/koffi)** | koffi, which the shell uses to call Windows for the acrylic window. |

Built on [Electron](https://www.electronjs.org/), running [Discord](https://discord.com)'s web app, with [Equicord](https://github.com/Equicord/Equicord), [pnpm](https://pnpm.io/) and [electron-builder](https://www.electron.build/).

> Missing or wrong credit? [Open an issue](https://github.com/DavidHiFi/MochaCord-Client/issues/new) and I'll fix it.

## Disclaimers

MochaCord is built with AI coding agents (Claude Code) working for the repo owner. The owner directs, tests and runs every build.

The [DavidHiFi/MochaCord](https://github.com/DavidHiFi/MochaCord) theme is a separate project: a Catppuccin Mocha theme for Vencord-based clients.

Client mods are against Discord's Terms of Service. If your account matters a lot to you, think before you use any of them. Discord is a trademark of Discord Inc., named here only to say what MochaCord works with.

<div align="center">
<br>
<sub>Not affiliated with Discord. Requires a Discord account.</sub>
</div>
