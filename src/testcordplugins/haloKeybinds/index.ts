/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { TestcordDevs } from "@utils/constants";
import definePlugin from "@utils/types";

// Discord's web build only offers keybinds inside its own desktop app (isPlatformEmbedded) and otherwise
// shows "not supported in the browser". In HaloCord the shell's hckeys.exe helper (desktop/keys) supplies
// global key events, so these patches send Discord's keybind code down its desktop path and answer the
// desktop input calls (inputEventRegister, inputWatchAll) from those events.

type Combo = [type: number, code: number, env?: number][];
interface KeyOpts { focused?: boolean; blurred?: boolean; keydown?: boolean; keyup?: boolean; }
interface Bind { keys: string[]; cb: (down: boolean) => void; opts: KeyOpts; active: boolean; fired: boolean; }
type KeyEvent = (device: number, down: number, code: number) => void;
interface HaloCordKeysApi { setFilter(codes: string[], all: boolean): void; onEvent(cb: KeyEvent): boolean; }

const api = () => (window as { HaloCordKeys?: HaloCordKeysApi; }).HaloCordKeys;
const binds = new Map<number, Bind>();
const held = new Set<string>();
let watcher: KeyEvent | null = null;
let queued = false;

// Left/right modifier variants (Windows key codes) count as the plain modifier, as browser keybinds store them.
const SAME: Record<number, number> = { 160: 16, 161: 16, 162: 17, 163: 17, 164: 18, 165: 18, 92: 91 };

function keyOf([type, code, env]: Combo[number]) {
    if (env === 2 || env === 3) return null; // macOS and Linux key codes
    if (type === 0 || type === 2) return "k" + (SAME[code] ?? code);
    if (type === 1) return "m" + code;
    return null; // gamepad
}

// The helper only reports keys some keybind uses, plus every key while a key recorder is open.
function sync() {
    if (queued) return;
    queued = true;
    queueMicrotask(() => {
        queued = false;
        const codes = new Set<string>();
        for (const b of binds.values()) b.keys.forEach(k => codes.add(k));
        api()?.setFilter([...codes], watcher != null);
    });
}

function onEvent(device: number, down: number, code: number) {
    const key = (device === 1 ? "m" : "k") + code;
    if (down) held.add(key);
    else held.delete(key);
    watcher?.(device, down, code);
    const focused = document.hasFocus();
    for (const b of binds.values()) {
        if (!b.keys.includes(key)) continue;
        if (down && !b.active && b.keys.every(k => held.has(k))) {
            b.active = true;
            b.fired = focused ? b.opts.focused !== false : b.opts.blurred !== false;
            if (b.fired && b.opts.keydown) b.cb(true);
        } else if (!down && b.active) {
            b.active = false;
            if (b.fired && b.opts.keyup) b.cb(false);
        }
    }
}

export default definePlugin({
    name: "HaloKeybinds",
    description: "Custom keybinds and push to talk that work while HaloCord is in the background.",
    authors: [TestcordDevs.DavidHiFi],
    required: true,
    hidden: true,

    get on() {
        return api() != null;
    },

    patches: [
        {
            find: "inputWatchAll",
            replacement: [
                {
                    match: /inputEventRegister\((\i),(\i),(\i),(\i)\)\{/,
                    replace: "$&if($self.on)return $self.register($1,$2,$3,$4);"
                },
                {
                    match: /inputEventUnregister\((\i)\)\{/,
                    replace: "$&if($self.on)return $self.unregister($1);"
                },
                {
                    match: /setOnInputEventCallback\((\i)\)\{/,
                    replace: "$&if($self.on)return $self.watchAll($1);"
                }
            ]
        },
        {
            find: "[kb store] KeybindStore: Looking for callback action",
            replacement: [
                {
                    match: /if\((\i\.isPlatformEmbedded)\)(try\{\i\.\i\.inputEventRegister\()/,
                    replace: "if($1||$self.on)$2"
                },
                {
                    match: /if\((\i\.isPlatformEmbedded)\)(\{let \i=\i\[\i\],\i=null!=\i\?\i\[\i\.action\]:null)/,
                    replace: "if($1||$self.on)$2"
                }
            ]
        },
        {
            // Key recorder: record from the global events (keyboard and mouse) instead of page key presses.
            find: "key-recorder-",
            replacement: [
                {
                    // Ignore left clicks, as the Windows desktop app does.
                    match: /let (\i)=\+!\(0,(\i\.\i)\)\(\);/,
                    replace: "let $1=+!((0,$2)()||$self.on);"
                },
                {
                    match: /(\i\.isPlatformEmbedded)(&&!\i&&\(this\.gs=new)/,
                    replace: "($1||$self.on)$2"
                },
                {
                    match: /cleanUp\(\)\{(\i\.isPlatformEmbedded)&&/,
                    replace: "cleanUp(){($1||$self.on)&&"
                },
                {
                    match: /:(\i\.isPlatformEmbedded)\|\|(\(\i=this\.handleComboKeys\))/,
                    replace: ":$1||$self.on||$2"
                }
            ]
        },
        {
            // Settings: the keybind list, its Add button, the desktop-only actions and full push to talk.
            find: 'id:"add-keybind"',
            replacement: [
                {
                    match: /return (\i\.\i)(\?\(0,\i\.jsx\)\(\i,\{\}\):\(0,\i\.jsx\)\(\i\.\i,\{type:"info",message:\i\.intl\.format\(\i\.t\.mPi3F3)/,
                    replace: "return($1||$self.on)$2",
                    noWarn: true // overlaps GoofcordSettings
                },
                {
                    match: /useHeaderDecoration:\(\)=>(\i\.\i)\?(?=\{type:\i\.\i\.BUTTON_GROUP,buttons:\[\{id:"add-keybind")/,
                    replace: "useHeaderDecoration:()=>($1||$self.on)?",
                    noWarn: true // overlaps GoofcordSettings
                },
                {
                    match: /\(0,(\i\.\i)\)\(\)(?=&&\(\i\.push\(\{id:"navigate-back")/,
                    replace: "($self.on||(0,$1)())"
                },
                {
                    match: /\(0,(\i\.\i)\)\(\)(?=&&\(\i\[\i\.\i\.NAVIGATE_BACK\])/,
                    replace: "($self.on||(0,$1)())"
                },
                {
                    match: /(\i)=!(\i\.\i);(?=function \i\(\)\{return\(0,\i\.\i\)\(\[\i\.\i\],\(\)=>\i\.\i\.getMode\(\)===\i\.\i\.PUSH_TO_TALK\)\})/,
                    replace: "$1=!($2||$self.on);"
                },
                {
                    match: /useTitle:function\(\)\{return (\i\.\i)\?(?=\i\.intl\.string\(\i\.t\.tG4Np5\))/,
                    replace: "useTitle:function(){return($1||$self.on)?"
                },
                {
                    match: /!(\i\.\i)(?=&&\i===\i\.\i\.PUSH_TO_TALK\)return \i\.intl\.format\(\i\.t\["VHI4\+Y"\])/,
                    replace: "!($1||$self.on)"
                }
            ]
        }
    ],

    register(id: number | string, combo: Combo, cb: (down: boolean) => void, opts: KeyOpts) {
        const keys = combo.map(keyOf);
        if (!keys.length || keys.some(k => k == null)) return;
        binds.set(Number(id), { keys: keys as string[], cb, opts: opts ?? {}, active: false, fired: false });
        sync();
    },

    unregister(id: number | string) {
        binds.delete(Number(id));
        sync();
    },

    watchAll(cb: KeyEvent | null) {
        watcher = cb ?? null;
        sync();
    },

    start() {
        api()?.onEvent(onEvent);
    },

    stop() {
        watcher = null;
        held.clear();
        api()?.setFilter([], false);
    }
});
