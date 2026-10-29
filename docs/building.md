# Building MochaCord

MochaCord is built on Windows from three parts: KurtCord 2.8.3's packaged app, the plugin bundle in `web/`, and the shell code in `shell/`. `build/assemble.py` puts them together.

## What you need

- Windows 11 x64, Python 3.12 or newer, Node.js 22 or newer and pnpm.
- The KurtCord 2.8.3 portable or installed app folder, unpacked. `base/` holds the files from its `app.asar` for reference; the build reads the whole app folder because it also needs Electron.
- koffi 2.16.3 from npm (`npm pack koffi@2.16.3`, then unpack it). Only its Windows x64 binary is used.
- `rcedit-x64.exe` from [electron/rcedit](https://github.com/electron/rcedit/releases) in `tools/rcedit/`.

## Steps

1. Build the bundle in `web/`:

   ```
   pnpm install --frozen-lockfile
   pnpm build --standalone --disable-updater
   ```

   The output lands in `web/dist/equibop/`.

2. Open `build/assemble.py` and point the paths at the top at your folders: `SRC_APP` is the KurtCord app folder, `BUNDLE` is `web/dist/equibop`, `KOFFI` is the unpacked koffi package and `OUT` is this repo's root. The script reads `shell/`, `brand/` and `tools/rcedit/` from there and builds into `app/`, `asar-src/` and `installer/`, which git ignores.

3. Copy `build/installer-package.json` to `installer/package.json`, then run:

   ```
   python build/assemble.py
   ```

   It patches the shell, packs the app and writes `installer/dist/MochaCord-Setup-2.8.4.exe`.

## Checking a build

Start MochaCord with `--remote-debugging-port=9335`, then use the scripts in `tools/`. `cdp-eval.mjs` runs an expression in the page, `shot.mjs` saves a screenshot of the page, and `blur-check.cjs` reports the window's blur state. None of them move the mouse or touch other windows.
