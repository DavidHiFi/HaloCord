<div align="center">

<img src="docs/images/voice-effects.png" alt="HaloCord's Voice & Video settings with the voice effects panel open" width="100%">

# <img src="desktop/brand/icon.png" width="36" align="center" alt=""> HaloCord

**The Discord client built for voice.**

HD stereo voice, call guards, voice effects, full Go Live controls and hundreds of plugins, in one Windows app.

<a href="#installation">
<img src="https://img.shields.io/badge/%F0%9F%9B%A0%EF%B8%8F%20IN%20DEVELOPMENT-2EA043?style=for-the-badge&labelColor=161B22" alt="In development: see installation" height="42">
</a>

<br><br>

<img src="https://img.shields.io/github/license/DavidHiFi/HaloCord?style=flat-square&color=8957E5&labelColor=161B22" alt="License">
<img src="https://img.shields.io/github/last-commit/DavidHiFi/HaloCord?style=flat-square&label=updated&color=1F6FEB&labelColor=161B22" alt="Last commit">
<img src="https://img.shields.io/badge/platform-Windows-DB6D28?style=flat-square&labelColor=161B22" alt="Platform: Windows">

</div>

---

## Installation

There is no release yet. Installers come once HaloCord is ready. Until then you can build it yourself; [docs/building.md](docs/building.md) has the steps.

## Features

- **96 kHz stereo voice** with full Opus control: bitrate, sample rate, frame time, complexity, FEC, DTX and CBR.
- **Voice effects** you hear in the mic test: pitch, echo, robot, bitcrush, muffle, static and eleven presets.
- **Call guards** that locally mute people who blast stereo noise, get too loud or spam their mic, with a per-person allow list.
- **Go Live controls** before every stream: resolution, frame rate, bitrate and quality presets.
- **Camera up to 4K60** and 1080p120, with a constant bitrate encoder in place of Discord's adaptive ladder.
- **Microphone chain** with gain, reverb, EQ, extra inputs and a raw bypass that skips system processing.
- **Hundreds of built-in plugins**, from the Vencord, Equicord and TestCord sets plus HaloCord's own voice plugins.
- **Acrylic window** on Windows 11.
- **Private by default.** Settings stay on your machine. No analytics, no telemetry, no HaloCord server.

<div align="center">
<img src="docs/images/go-live.png" alt="The Go Live window with resolution, frame rate and bitrate controls" width="70%">
</div>

## Notes

> [!IMPORTANT]
> **Work in progress.** HaloCord 2.8.4 builds and runs from this source. It stores settings in `%APPDATA%\HaloCord` and checks this repo for updates. There is no release yet.

> [!WARNING]
> **Third-party client.** Discord does not support third-party clients. Spam-like behavior, such as mass friend requests, can get an account actioned. Use it at your own risk.

> [!NOTE]
> **Kept up to date on its own.** Every 6 hours a GitHub check loads Discord and tests every plugin's patches. When a Discord update breaks one, an issue opens with the list and closes again once it is fixed. Each Monday, Equicord's latest changes (which include Vencord's) arrive as a pull request.

<details>
<summary>What is in this repo</summary>

The root follows the Vencord and Equicord layout, so upstream changes merge cleanly.

| Folder | What it holds |
|---|---|
| `src/` | The mod layer, APIs and every built-in plugin. |
| `src/plugins/` | Plugins from Vencord. |
| `src/equicordplugins/` | Plugins from Equicord. |
| `src/testcordplugins/` | TestCord plugins and HaloCord's own voice plugins. |
| `scripts/` | Build, lint and the patch reporter. |
| `desktop/` | The Windows app: the base Electron shell, HaloCord's shell code, icons and the installer build. |
| `docs/` | Build steps and README images. |

</details>

## Contributing

Bug reports with the client version and a screenshot help most right now.

<a href="CONTRIBUTING.md">
<img src="https://img.shields.io/badge/%F0%9F%A4%9D%20HOW%20TO%20CONTRIBUTE-8957E5?style=for-the-badge&labelColor=161B22" alt="How to contribute" height="36">
</a>

## Star history

Thank you for starring the repo.

<a href="https://www.star-history.com/?repos=DavidHiFi%2FHaloCord&amp;type=date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=DavidHiFi/HaloCord&amp;type=date&amp;theme=dark&amp;legend=top-left" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=DavidHiFi/HaloCord&amp;type=date" />
    <img alt="DavidHiFi/HaloCord GitHub star history" src="https://api.star-history.com/chart?repos=DavidHiFi/HaloCord&amp;type=date" />
  </picture>
</a>

## Credits

- **Author:** Myself, [DavidHiFi](https://github.com/DavidHiFi)

| Who | What |
|---|---|
| **[Kurtzon](https://github.com/kurtzonaudio)** | Co-built the desktop shell. Its MIT notice is in [desktop/LICENSE](desktop/LICENSE). |
| **[Vencord](https://github.com/Vendicated/Vencord) and [Equicord](https://github.com/Equicord/Equicord) contributors** | The mod framework and plugin suites this repo is built on. |
| **[TestcordDev](https://github.com/TestcordDev/TestCord)** | The TestCord plugins. |
| **[Vladimír Kalouš](https://github.com/Koromix/koffi)** | koffi, which the shell uses to call Windows for the acrylic window. |

Built on [Electron](https://www.electronjs.org/), running [Discord](https://discord.com)'s web app, with [Equicord](https://github.com/Equicord/Equicord), [pnpm](https://pnpm.io/) and [electron-builder](https://www.electron.build/).

> Missing or wrong credit? [Open an issue](https://github.com/DavidHiFi/HaloCord/issues/new) and I'll fix it.

## Disclaimers

HaloCord is built with AI coding agents (Claude Code) working for the repo owner. The owner directs, tests and runs every build.

The [HaloCord Theme](https://github.com/DavidHiFi/HaloCord-Theme) is a separate project: a Catppuccin Mocha theme for Vencord-based clients. Old links to `HaloCord.css` in this repo forward to it.

Client mods are against Discord's Terms of Service. If your account matters a lot to you, think before you use any of them. Discord is a trademark of Discord Inc., named here only to say what HaloCord works with.

<div align="center">
<br>
<sub>Not affiliated with Discord. Requires a Discord account.</sub>
</div>
