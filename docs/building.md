# Building HaloCord

HaloCord has two halves. The repo root is the mod and plugin bundle, laid out like Vencord and Equicord. `desktop/` is the Windows app around it: the base Electron shell, HaloCord's shell code and the installer build.

## What you need

- Windows 11 x64, Python 3.12 or newer, Node.js 22 or newer and pnpm.
- The unpacked 2.8.3 base app folder (Electron plus `resources\app.asar`). `desktop/base/` holds the files from that `app.asar`. `assemble.py` builds from `desktop/base/userscript.js`, so edit that file for userscript changes; the other files there are for reference.
- koffi 2.16.3 from npm (`npm pack koffi@2.16.3`, then unpack it). Only its Windows x64 binary is used.
- `rcedit-x64.exe` from [electron/rcedit](https://github.com/electron/rcedit/releases).

## Steps

1. Build the bundle from the repo root:

   ```
   pnpm install --frozen-lockfile
   pnpm build --standalone --disable-updater
   ```

   The output lands in `dist/equibop/`.

2. Point the build at the parts that are not in the repo, then run it:

   ```
   $env:HALOCORD_BASE_APP = "C:\path\to\base\app"
   $env:HALOCORD_KOFFI = "C:\path\to\koffi\package"
   $env:HALOCORD_OUT = "C:\path\to\build-folder"   # optional, defaults to desktop\out
   python desktop\assemble.py
   ```

   Put `rcedit-x64.exe` in `<build folder>\tools\rcedit\` first. The script patches the shell, packs the app and writes `<build folder>\installer\dist\HaloCord-Setup-<version>.exe`.

## Checking a build

Start HaloCord with `--remote-debugging-port=9335`, then use the scripts in `desktop/tools/`. `cdp-eval.mjs` runs an expression in the page, `shot.mjs` saves a screenshot of the page and `blur-check.cjs` reports the window's blur state. None of them move the mouse or touch other windows.

To see whether a Discord update broke a plugin, run `pnpm test` or open Settings, then Plugin Health. HaloCord also shows a notification about 30 seconds after start when an enabled plugin's patch stops matching.
