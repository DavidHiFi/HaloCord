/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

import { transformSync } from "esbuild";

const read = (file: string) => readFileSync(new URL(`../src/testcordplugins/haloCalls/${file}`, import.meta.url), "utf8");
const pluginSource = read("index.tsx");
// tiles.tsx runs in a sandbox: its imports become sandbox globals and its exports a plain object.
const source = read("tiles.tsx")
    .replace(/^import .*;\r?\n/gm, "")
    .replace(/^export (?=function|const)/gm, "")
    + "\nglobalThis.plugin = { start: syncTiles, stop: stopTiles, getVoiceBackgroundStyles, useTileBanner };";
let lookups = 0;
let user: { getDefaultAvatarURL?: unknown; } = {};
const voiceState: { channelId?: string; } = {};
// The call the current user is connected to, and the channel the last speaking lookup used
let selfVoiceChannel: string | undefined;
let speakingChannel: string | undefined;
let profile: { banner?: string; } | undefined;
let fetches = 0;
let fetchFails = 0;
const fetchCacheArgs: unknown[] = [];
const usrbgState = { enabled: false, hasBackground: false };
// What ChannelRTCStore.getSelectedParticipant would return for the voice
// channel: the stream the call view currently paints, or none.
let selectedStream: { type?: unknown; id?: unknown } | null = null;
const store: Record<string, unknown> = {
    tiles: true,
    avatarRadius: 5,
    cornerRadius: 12,
    zoom: 100,
    hideTileBackground: false,
    hideUserBackgrounds: false,
    showUserBanners: false,
    preferBanners: false,
    overrideGlow: false,
    hoverGlow: false,
    glowColor: "#45475a",
    glowColor2: "",
    speakingIndicator: "box"
};
const windowListeners = new Map<string, Set<unknown>>();
const fakeWindow = {
    addEventListener: (type: string, fn: unknown) => { if (!windowListeners.has(type)) windowListeners.set(type, new Set()); windowListeners.get(type)!.add(fn); },
    removeEventListener: (type: string, fn: unknown) => { windowListeners.get(type)?.delete(fn); }
};
const sandbox = {
    window: fakeWindow,
    settings: { store },
    Settings: { plugins: {} },
    MediaEngineStore: { isDeaf: () => false, addReactChangeListener: () => {}, removeReactChangeListener: () => {} },
    // syncTiles writes the glow override onto <html> and watches it for Discord's rewrites
    document: { documentElement: { classList: { add: () => {}, remove: () => {}, toggle: () => {}, contains: () => false }, style: { setProperty: () => {}, removeProperty: () => {}, getPropertyValue: () => "" } } },
    MutationObserver: class { observe() {} disconnect() {} },
    HEX_COLOR: /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i,
    style: "",
    enableStyle: () => {},
    disableStyle: () => {},
    UserStore: { getUser: () => { lookups++; return user; } },
    VoiceStateStore: { getVoiceStateForUser: () => voiceState.channelId ? voiceState : undefined, addReactChangeListener: () => {}, removeReactChangeListener: () => {} },
    SelectedChannelStore: { getVoiceChannelId: () => selfVoiceChannel, addReactChangeListener: () => {}, removeReactChangeListener: () => {} },
    ChannelStore: { getChannel: () => ({ guild_id: "guild-1" }) },
    ChannelRTCStore: { getSpeakingParticipants: (channelId: string) => { speakingChannel = channelId; return [{ user: { id: "1" }, speaking: true }]; }, getSelectedParticipant: () => selectedStream, addReactChangeListener: () => {}, removeReactChangeListener: () => {} },
    UserProfileStore: { getUserProfile: () => profile, addReactChangeListener: () => {}, removeReactChangeListener: () => {} },
    IconUtils: { getUserBannerURL: () => "banner-url" },
    fetchUserProfile: (_id: string, _options: unknown, cache: unknown) => {
        fetches++;
        fetchCacheArgs.push(cache);
        if (fetchFails > 0) { fetchFails--; return Promise.reject(new Error("429")); }
        return Promise.resolve();
    },
    // the banner fetch queue paces itself and retries with timers
    setTimeout: (fn: () => void) => setImmediate(fn),
    isPluginEnabled: () => usrbgState.enabled,
    usrbg: { name: "USRBG", userHasBackground: () => usrbgState.hasBackground },
    // Discord's Flux useStateFromStores subscribes through addReactChangeListener
    // on every store it receives; the stub enforces that contract so a plain
    // object store fails here instead of crashing the tile render live.
    useStateFromStores: (stores: Array<Record<string, unknown>>) => {
        for (const store of stores) store.addReactChangeListener(() => {});
        return undefined;
    },
    getUserAvatarUrl: () => undefined,
    useSettings: () => {}
};
vm.createContext(sandbox);
vm.runInContext(transformSync(source, { loader: "tsx", format: "cjs" }).code, sandbox);
const plugin = (sandbox as typeof sandbox & { plugin: { start(): void; stop(): void; getVoiceBackgroundStyles(props: { className?: string; participantUserId?: string; children?: unknown; }): Record<string, string> | undefined; useTileBanner(props: { participantUserId?: string; }): void; }; }).plugin;

const styles = (props: { participantUserId: string; }) => plugin.getVoiceBackgroundStyles({ className: "tile", participantUserId: props.participantUserId }) ?? {};



test("Only participant tiles receive avatar styles", () => {
    for (const props of [{ participantUserId: "1" }, { className: "other", participantUserId: "1" }, { className: "tile" }]) {
        assert.equal(plugin.getVoiceBackgroundStyles(props), undefined);
    }
    assert.equal(lookups, 0);
});

test("The callable default avatar fallback applies to tiles", () => {
    user = { getDefaultAvatarURL: () => "default-avatar" };
    const result = plugin.getVoiceBackgroundStyles({ className: "tile_example", participantUserId: "1" });
    assert.equal(result?.["--full-res-avatar"], 'url("default-avatar")');
    assert.equal(result?.["--vc-pfp-radius"], "12px");
});

test("A missing or noncallable default avatar uses the CDN fallback", () => {
    for (const value of [undefined, "not-a-function"]) {
        user = { getDefaultAvatarURL: value };
        assert.equal(plugin.getVoiceBackgroundStyles({ className: "tile", participantUserId: "1" })?.["--full-res-avatar"], 'url("https://cdn.discordapp.com/embed/avatars/0.png")');
    }
});

test("Picture masking follows the radius slider and the theme slot is always set", () => {
    Object.assign(store, { avatarRadius: 24 });
    const result = styles({ participantUserId: "1" });
    assert.ok(result["--vc-pfp-avatar-mask"]?.includes("rx%3D'24'"));
    assert.equal(result["--vc-pfp-avatar-radius"], "24%");
    assert.equal(result["--vc-pfp-glow-slot"], "1");
    Object.assign(store, { avatarRadius: 5 });
});

test("Hiding the tile background clears only Discord's box, and silent tiles carry no glow", () => {
    Object.assign(store, { hideTileBackground: false });
    const result = styles({ participantUserId: "1" });
    assert.equal(result["backgroundColor"], "");
    assert.equal("backgroundImage" in result, false);
    assert.equal(result["--vc-pfp-hide-bg"], "");
    assert.equal(result["--vc-pfp-glow-filter"], "");

    Object.assign(store, { hideTileBackground: true });
    const floating = styles({ participantUserId: "1" });
    assert.equal(floating["backgroundColor"], "transparent");
    assert.equal(floating["--vc-pfp-hide-bg"], "1");
    assert.equal(floating["--vc-pfp-glow-filter"], "");
    Object.assign(store, { hideTileBackground: false });
});

test("The speaking ring emits its markers only in picture mode while speaking", () => {
    Object.assign(store, { speakingIndicator: "box" });
    const boxed = styles({ participantUserId: "1" });
    assert.equal(boxed["--vc-pfp-ring-pic"], "");
    assert.equal(boxed["--vc-pfp-speaking"], "");

    Object.assign(store, { speakingIndicator: "picture" });
    const silent = styles({ participantUserId: "1" });
    assert.equal(silent["--vc-pfp-ring-pic"], "1");
    assert.equal(silent["--vc-pfp-speaking"], "");
    assert.equal(silent["--vc-pfp-glow-filter"], "");
    Object.assign(store, { speakingIndicator: "box" });
});

// The picture-mode ring: two tight and two soft drop-shadows, left in the first colour, right in the second.
const ring = (first: string, second = first) => `drop-shadow(-1px 0 1.5px ${first}) drop-shadow(1px 0 1.5px ${second}) drop-shadow(-2px 0 5px ${first}) drop-shadow(2px 0 5px ${second})`;
const DISCORD_GREEN = "var(--status-speaking, #23a55a)";

test("Picture mode rings the picture through the filter only while speaking", () => {
    voiceState.channelId = "channel-1";
    Object.assign(store, { speakingIndicator: "picture", overrideGlow: true, glowColor: "#45475a" });
    const talking = styles({ participantUserId: "1" });
    assert.equal(talking["--vc-pfp-speaking"], "1");
    assert.equal(talking["--vc-pfp-glow-filter"], ring("#45475a"));

    Object.assign(store, { overrideGlow: false });
    assert.equal(styles({ participantUserId: "1" })["--vc-pfp-glow-filter"], ring(DISCORD_GREEN));

    Object.assign(store, { speakingIndicator: "box" });
    assert.equal(styles({ participantUserId: "1" })["--vc-pfp-glow-filter"], "");
    delete voiceState.channelId;
});

test("User backgrounds stay visible without their own switch and hide with it", () => {
    Object.assign(store, { hideTileBackground: true, hideUserBackgrounds: false });
    const keep = styles({ participantUserId: "1" });
    assert.equal(keep["backgroundColor"], "transparent");
    assert.equal("backgroundImage" in keep, false);

    Object.assign(store, { hideTileBackground: false, hideUserBackgrounds: true });
    const hideUser = styles({ participantUserId: "1" });
    assert.equal(hideUser["backgroundImage"], "none");
    assert.equal(hideUser["backgroundColor"], "");

    Object.assign(store, { hideTileBackground: true, hideUserBackgrounds: true });
    const both = styles({ participantUserId: "1" });
    assert.equal(both["backgroundImage"], "none");
    assert.equal(both["backgroundColor"], "transparent");

    Object.assign(store, { hideTileBackground: false, hideUserBackgrounds: false });
    assert.equal("backgroundImage" in styles({ participantUserId: "1" }), false);
});

test("A profile banner paints the tile unless USRBG already claims it", () => {
    profile = { banner: "banner-hash" };
    Object.assign(store, { showUserBanners: true, hideUserBackgrounds: true });
    assert.equal(styles({ participantUserId: "1" })["backgroundImage"], "none");

    Object.assign(store, { hideUserBackgrounds: false });
    const banner = styles({ participantUserId: "1" });
    assert.equal(banner["backgroundImage"], 'url("banner-url")');
    assert.equal(banner["backgroundSize"], "cover");
    assert.equal(banner["backgroundPosition"], "center");
    assert.equal(banner["backgroundRepeat"], "no-repeat");

    usrbgState.enabled = true;
    usrbgState.hasBackground = true;
    assert.equal("backgroundImage" in styles({ participantUserId: "1" }), false);

    Object.assign(store, { preferBanners: true });
    assert.equal(styles({ participantUserId: "1" })["backgroundImage"], 'url("banner-url")');

    usrbgState.enabled = false;
    usrbgState.hasBackground = false;
    Object.assign(store, { preferBanners: false });
    profile = undefined;
});

test("Users without a banner keep the default look and are fetched once", () => {
    Object.assign(store, { showUserBanners: true });
    fetches = 0;
    assert.equal("backgroundImage" in styles({ participantUserId: "2" }), false);
    assert.equal("backgroundImage" in styles({ participantUserId: "2" }), false);
    assert.equal(fetches, 1);
    Object.assign(store, { showUserBanners: false });
});

test("A failed banner fetch retries uncached so rate-limited users still get their banner", async () => {
    Object.assign(store, { showUserBanners: true });
    fetches = 0;
    fetchFails = 1;
    fetchCacheArgs.length = 0;
    styles({ participantUserId: "3" });
    for (let i = 0; i < 20 && fetches < 2; i++) await new Promise(resolve => setImmediate(resolve));
    assert.equal(fetches, 2);
    // a cached stub profile from a failed fetch must not short-circuit the request
    assert.deepEqual(fetchCacheArgs, [false, false]);
    Object.assign(store, { showUserBanners: false });
});

test("The ring takes the configured colours and falls back to Discord's for a bad hex", () => {
    voiceState.channelId = "channel-1";
    Object.assign(store, { speakingIndicator: "picture", overrideGlow: true, glowColor: "#45475a", glowColor2: "#cba6f7" });
    assert.equal(styles({ participantUserId: "1" })["--vc-pfp-glow-filter"], ring("#45475a", "#cba6f7"));
    assert.equal(styles({ participantUserId: "1" })["--vc-pfp-custom-glow-2"], "#cba6f7");

    Object.assign(store, { glowColor: "not-a-color", glowColor2: "" });
    assert.equal(styles({ participantUserId: "1" })["--vc-pfp-glow-filter"], ring(DISCORD_GREEN));
    Object.assign(store, { speakingIndicator: "box", overrideGlow: false, glowColor: "#45475a" });
    delete voiceState.channelId;
});

test("Stream tiles never glow in either mode, watched or not", () => {
    voiceState.channelId = "channel-1";
    const children = { props: { children: [{ props: { participant: { type: 0, streamId: "stream-1" } } }] } };
    for (const speakingIndicator of ["picture", "box"]) {
        Object.assign(store, { speakingIndicator, overrideGlow: false });
        for (const selection of [null, { type: "STREAM", id: "guild:guild-1:channel-1:1" }]) {
            selectedStream = selection;
            const stream = plugin.getVoiceBackgroundStyles({ className: "tile", participantUserId: "1", children });
            assert.equal(stream?.["--vc-pfp-stream"], "1");
            assert.equal(stream?.["--vc-pfp-speaking"], "");
            assert.equal(stream?.["--vc-pfp-glow-filter"], "");
        }
    }
    // The same speaker's own voice tile still glows.
    selectedStream = null;
    Object.assign(store, { speakingIndicator: "picture" });
    const person = styles({ participantUserId: "1" });
    assert.equal(person["--vc-pfp-stream"], "");
    assert.equal(person["--vc-pfp-speaking"], "1");
    assert.equal(person["--vc-pfp-glow-filter"], ring(DISCORD_GREEN));
    Object.assign(store, { speakingIndicator: "box" });
    delete voiceState.channelId;
});

test("Speaking resolves through the call we are in while a participant's own voice state lags", () => {
    delete voiceState.channelId;
    selfVoiceChannel = "call-1";
    speakingChannel = undefined;
    store["speakingIndicator"] = "picture";
    assert.equal(styles({ participantUserId: "1" })["--vc-pfp-speaking"], "1");
    assert.equal(speakingChannel, "call-1");
    // Their own voice state wins once it has arrived
    voiceState.channelId = "other-call";
    styles({ participantUserId: "1" });
    assert.equal(speakingChannel, "other-call");
    // Not in a call and no voice state: nothing to look up, so no glow
    delete voiceState.channelId;
    selfVoiceChannel = undefined;
    speakingChannel = undefined;
    assert.equal(styles({ participantUserId: "1" })["--vc-pfp-speaking"], "");
    assert.equal(speakingChannel, undefined);
    store["speakingIndicator"] = "box";
});

test("Camera tiles keep their speaking state and tile border in picture mode", () => {
    Object.assign(store, { speakingIndicator: "picture", overrideGlow: false });
    voiceState.channelId = "channel-1";
    const children = { props: { children: [{ props: { participant: { type: 2, streamId: "camera-1" } } }] } };
    const camera = plugin.getVoiceBackgroundStyles({ className: "tile", participantUserId: "1", children });
    assert.equal(camera?.["--vc-pfp-stream"], "");
    assert.equal(camera?.["--vc-pfp-camera"], "1");
    assert.equal(camera?.["--vc-pfp-speaking"], "1");
    const person = styles({ participantUserId: "1" });
    assert.equal(person["--vc-pfp-camera"], "");
    Object.assign(store, { speakingIndicator: "box" });
    delete voiceState.channelId;
});

test("Every store handed to useStateFromStores carries the Flux listener contract", () => {
    voiceState.channelId = "channel-1";
    // The tile hook subscribes to three Flux stores and the plain audio-activity
    // store; the contract-enforcing stub throws if any of them lacks the pair.
    assert.doesNotThrow(() => plugin.useTileBanner({ participantUserId: "1" }));
    delete voiceState.channelId;
});

// Strip comments so assertions only see real rules.
const rules = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");

test("The only box ring is box mode's, and it skips stream tiles", () => {
    const css = rules(readFileSync(new URL("../src/testcordplugins/haloCalls/tiles.css", import.meta.url), "utf8"));
    const boxRings = [...css.matchAll(/([^{}]+)\{[^}]*box-shadow:\s*0 0 0 2px var\(--vc-pfp-custom-glow/g)].map(m => m[1].trim());
    assert.deepEqual(boxRings, ['div[data-selenium-video-tile][style*="--vc-pfp-speaking"]:not([style*="--vc-pfp-ring-pic"], [style*="--vc-pfp-stream"])']);
});

test("The glow filter sits on the unmasked avatar element so it traces only the picture", () => {
    const css = rules(readFileSync(new URL("../src/testcordplugins/haloCalls/tiles.css", import.meta.url), "utf8"));
    const block = (selector: string) => css.split("}").map(part => part.split("{")).find(([sel]) => sel.trim() === selector)?.[1] ?? "";
    const avatar = block('div[data-selenium-video-tile] div[role="img"]');
    assert.match(avatar, /filter:\s*var\(--vc-pfp-glow-filter/, "glow filter must be on the avatar element");
    assert.doesNotMatch(avatar, /mask/, "the filtered element must not carry the mask");
    const picture = block('div[data-selenium-video-tile] div[role="img"]::before');
    assert.match(picture, /background-image:\s*var\(--full-res-avatar\)/, "picture must paint on ::before");
    assert.match(picture, /mask-image:/, "picture mask must live on ::before");
    // The backdrop wrapper may hold a profile gradient; a filter there traces its box.
    assert.doesNotMatch(css, /div\[class\*="background"\]\s*\{[^}]*filter/, "no glow filter on the backdrop wrapper");
});

test("Tile styles go into a fresh style object so cleared keys leave the DOM", () => {
    // Mutating the parent's style object in place made React compare it with
    // itself, so switching to box mode kept the picture-mode ring painted.
    assert.ok(pluginSource.includes('replace: "$self.useTileBanner($2);$1={...$1,...$self.getVoiceBackgroundStyles($2)};"'));
    assert.ok(!pluginSource.includes("Object.assign($1"));
});

test("The audio-activity window listener is added on start and removed on stop", () => {
    assert.equal(windowListeners.get("testcord-vu-audio-change")?.size ?? 0, 0);
    plugin.start();
    assert.equal(windowListeners.get("testcord-vu-audio-change")?.size, 1);
    plugin.stop();
    assert.equal(windowListeners.get("testcord-vu-audio-change")?.size, 0);
});
