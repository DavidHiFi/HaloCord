/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { isPluginEnabled } from "@api/PluginManager";
import { Settings, useSettings } from "@api/Settings";
import { disableStyle, enableStyle } from "@api/Styles";
import usrbg from "@plugins/usrbg";
import { fetchUserProfile } from "@utils/discord";
import { getUserAvatarUrl } from "@utils/misc";
import { ChannelRTCStore, ChannelStore, IconUtils, MediaEngineStore, SelectedChannelStore, UserProfileStore, UserStore, useStateFromStores, VoiceStateStore } from "@webpack/common";

import { HEX_COLOR, settings } from "./settings";
import style from "./tiles.css?managed";

// VoiceVUMeters broadcasts each person's mic activity through a window event,
// which can land before Discord's speaking flag. This store turns it into tile re-renders.
const audioActivityListeners = new Set<() => void>();
let audioActivityVersion = 0;
const audioActivityStore = {
    // useStateFromStores calls addReactChangeListener on every store it gets
    addReactChangeListener(listener: () => void) {
        audioActivityListeners.add(listener);
    },
    removeReactChangeListener(listener: () => void) {
        void audioActivityListeners.delete(listener);
    },
    subscribe(listener: () => void) {
        audioActivityListeners.add(listener);
        return () => void audioActivityListeners.delete(listener);
    },
    getVersion: () => audioActivityVersion
};
function onAudioActivityChange() {
    audioActivityVersion++;
    for (const listener of audioActivityListeners) listener();
}

function audioActiveNow(userId: string) {
    const api = (globalThis as { __testcordAudio?: { isActive(userId: string): boolean } }).__testcordAudio;
    return api ? api.isActive(userId) === true : false;
}

// The mask is a rounded rect in a 100x100 viewbox, so its rx scales the slider
// value with the painted picture; SVG clamps 52 to 50, which is the circle max.
function avatarMask(rx: number): string {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='${rx}' fill='#fff'/></svg>`;
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

// Discord paints every voice speaking ring with --status-speaking, so the
// override recolors it on the root and on each nested theme container.
let glowObserver: MutationObserver | undefined;

function themeGlow() {
    return Settings.haloTheming && Settings.haloThemeVariant !== "custom";
}

function overrideColor() {
    return themeGlow() ? "var(--hc-grad-a)" : settings.store.glowColor.trim();
}

function getGlowColors(): [string, string] {
    if (themeGlow()) return ["var(--hc-grad-a)", "var(--hc-grad-b)"];
    const color = settings.store.glowColor.trim();
    const first = settings.store.overrideGlow && HEX_COLOR.test(color) ? color : "var(--status-speaking, #23a55a)";
    const second = settings.store.glowColor2.trim();
    return [first, HEX_COLOR.test(second) ? second : first];
}

function applyGlowOverride() {
    const root = document.documentElement;
    const color = overrideColor();
    const on = themeGlow() || (settings.store.overrideGlow && HEX_COLOR.test(color));
    root.classList.toggle("vc-rvcpfp-override-glow", on);
    if (on) root.style.setProperty("--vc-rvcpfp-glow-color", color);
    else root.style.removeProperty("--vc-rvcpfp-glow-color");
    const [first, second] = getGlowColors();
    root.classList.toggle("vc-rvcpfp-hover-glow", settings.store.hoverGlow);
    root.style.setProperty("--vc-rvcpfp-glow-1", first);
    root.style.setProperty("--vc-rvcpfp-glow-2", second);
}

// Profile fetches run one at a time. A full channel used to fire every
// participant's fetch at once; the rate-limited ones failed, nothing re-rendered
// the tile, and those users never got their banner. A cached profile without a
// banner may be a stub left by a failed fetch, so each user gets one uncached
// fetch per session, retried on failure.
const bannerFetchAttempts = new Map<string, number>();
const bannerFetchQueue: string[] = [];
let bannerFetchRunning = false;
const bannerRetryTimers = new Set<ReturnType<typeof setTimeout>>();

async function runBannerFetchQueue() {
    if (bannerFetchRunning) return;
    bannerFetchRunning = true;
    while (bannerFetchQueue.length) {
        const userId = bannerFetchQueue.shift()!;
        try {
            await fetchUserProfile(userId, undefined, false);
        } catch {
            const attempts = (bannerFetchAttempts.get(userId) ?? 0) + 1;
            bannerFetchAttempts.set(userId, attempts);
            if (attempts < 4) {
                const retry = setTimeout(() => {
                    bannerRetryTimers.delete(retry);
                    bannerFetchQueue.push(userId);
                    void runBannerFetchQueue();
                }, 5000 * attempts);
                bannerRetryTimers.add(retry);
            }
        }
        await new Promise(resolve => setTimeout(resolve, 300));
    }
    bannerFetchRunning = false;
}

function getProfileBannerUrl(userId: string): string | undefined {
    const banner = UserProfileStore.getUserProfile(userId)?.banner ?? UserStore.getUser(userId)?.banner;
    if (!banner) {
        if (!bannerFetchAttempts.has(userId)) {
            bannerFetchAttempts.set(userId, 0);
            bannerFetchQueue.push(userId);
            void runBannerFetchQueue();
        }
        return undefined;
    }
    return IconUtils.getUserBannerURL({ id: userId, banner, canAnimate: false, size: 1024 }) ?? undefined;
}

// Participant types: STREAM 0, HIDDEN_STREAM 1, USER 2, ACTIVITY 3. Camera tiles
// are USER participants with a streamId, so streamId alone doesn't mean a stream.
const STREAM_PARTICIPANT_TYPES = new Set([0, 1]);

interface TileParticipant {
    type?: number;
    streamId?: unknown;
}

// The wrapper's children carry the participant somewhere below the tile root.
function findParticipant(children: unknown, depth = 0): TileParticipant | undefined {
    if (!children || typeof children !== "object" || depth > 6) return undefined;
    if (Array.isArray(children)) {
        for (const child of children) {
            const found = findParticipant(child, depth + 1);
            if (found) return found;
        }
        return undefined;
    }
    const { props } = children as { props?: { children?: unknown; participant?: TileParticipant; }; };
    if (!props) return undefined;
    return props.participant ?? findParticipant(props.children, depth + 1);
}

// A participant's own voice state can lag a join, so fall back to the call we are in
function getTileChannelId(userId: string): string | undefined {
    return VoiceStateStore.getVoiceStateForUser(userId)?.channelId ?? SelectedChannelStore.getVoiceChannelId() ?? undefined;
}

const GLOW_PROPS = ["--vc-rvcpfp-glow-color", "--vc-rvcpfp-glow-1", "--vc-rvcpfp-glow-2"];

function clearGlowOverride() {
    const root = document.documentElement;
    root.classList.remove("vc-rvcpfp-override-glow", "vc-rvcpfp-hover-glow");
    for (const prop of GLOW_PROPS) root.style.removeProperty(prop);
}

// Discord rewrites <html> class and style on theme changes, which drops the glow classes and colours.
function glowOverrideStale() {
    const root = document.documentElement;
    const color = overrideColor();
    const on = themeGlow() || (settings.store.overrideGlow && HEX_COLOR.test(color));
    return root.classList.contains("vc-rvcpfp-override-glow") !== on
        || root.classList.contains("vc-rvcpfp-hover-glow") !== settings.store.hoverGlow
        || root.style.getPropertyValue("--vc-rvcpfp-glow-2") !== getGlowColors()[1]
        || (on && root.style.getPropertyValue("--vc-rvcpfp-glow-color") !== color);
}

/** Turns the call tile look on or off to match the setting; safe to call repeatedly. */
export function syncTiles() {
    if (!settings.store.tiles) return stopTiles();
    enableStyle(style);
    applyGlowOverride();
    if (glowObserver) return;
    window.addEventListener("testcord-vu-audio-change", onAudioActivityChange);
    glowObserver = new MutationObserver(() => glowOverrideStale() && applyGlowOverride());
    glowObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style", "data-hc-theme"] });
}

export function stopTiles() {
    disableStyle(style);
    clearGlowOverride();
    if (!glowObserver) return;
    glowObserver.disconnect();
    glowObserver = undefined;
    window.removeEventListener("testcord-vu-audio-change", onAudioActivityChange);
    for (const timer of bannerRetryTimers) clearTimeout(timer);
    bannerRetryTimers.clear();
    bannerFetchQueue.length = 0;
    bannerFetchAttempts.clear();
}

export const applyTileGlow = () => settings.store.tiles && applyGlowOverride();

export function useTileBanner({ participantUserId }: { participantUserId?: string; }) {
    useStateFromStores([UserProfileStore], () => UserProfileStore.getUserProfile(participantUserId ?? "")?.banner, [participantUserId]);
    // getVoiceBackgroundStyles reads the speaking flag imperatively, so subscribe to re-render on changes
    useStateFromStores([ChannelRTCStore, VoiceStateStore, SelectedChannelStore], () => {
        const channelId = getTileChannelId(participantUserId ?? "");
        const speaking = channelId
            ? ChannelRTCStore.getSpeakingParticipants(channelId).some(p => p.user.id === participantUserId && p.speaking)
            : false;
        return speaking;
    }, [participantUserId]);
    // mic activity from VoiceVUMeters can light the glow before Discord's flag does
    useStateFromStores([audioActivityStore], audioActivityStore.getVersion, []);
    // the glow hides while deafened unless VoiceVUMeters' option keeps it
    useStateFromStores([MediaEngineStore], () => MediaEngineStore.isDeaf(), []);
    useSettings(["plugins.VoiceVUMeters.showWhileDeafened", "plugins.HaloCalls.*"]);
}

export function getVoiceBackgroundStyles({ className, participantUserId, children }: { className?: string; participantUserId?: string; children?: unknown; }) {
    if (!settings.store.tiles || !className?.includes("tile") || !participantUserId) return;

    const user = UserStore.getUser(participantUserId);
    if (!user) return;
    const legacyUser: typeof user & { getDefaultAvatarURL?: () => string; } = user;

    const channelId = getTileChannelId(participantUserId);
    const guildId = channelId ? ChannelStore.getChannel(channelId)?.guild_id : undefined;
    const participant = findParticipant(children);
    const participantType = participant?.type;
    const isStream = participantType !== undefined && STREAM_PARTICIPANT_TYPES.has(participantType);
    // Camera tiles keep Discord's own ring, there is no picture to glow
    const isCamera = !isStream && participant?.streamId != null;
    // Discord's flag and VoiceVUMeters' mic activity both mean the person is speaking
    const isSpeaking = (channelId
        ? ChannelRTCStore.getSpeakingParticipants(channelId).some(p => p.user.id === participantUserId && p.speaking)
        : false) || audioActiveNow(participantUserId);
    // Only voice tiles showing the participant's picture glow. Like Discord's
    // own border, the speaking glow belongs to the person, not their screen
    // share or activity, so stream and activity tiles never light up.
    // Deafened, you hear nobody, so nobody glows unless the owner opted in.
    const glowOff = MediaEngineStore.isDeaf() && !Settings.plugins.VoiceVUMeters?.showWhileDeafened;
    const speakingGlow = !glowOff && isSpeaking && (participantType === undefined || participantType === 2);

    // Fallback chain from the local FullVCPFP fix: getUserAvatarUrl's guild
    // branch can return undefined, which used to render blank tiles.
    const avatarUrl = getUserAvatarUrl(user, guildId, isSpeaking, 1024)
        || user.getAvatarURL?.(guildId, 1024, isSpeaking)
        || user.getAvatarURL?.(undefined, 1024, isSpeaking)
        || (typeof legacyUser.getDefaultAvatarURL === "function" ? legacyUser.getDefaultAvatarURL() : undefined)
        || "https://cdn.discordapp.com/embed/avatars/0.png";

    const hideBg = settings.store.hideTileBackground;
    const hideUserBg = settings.store.hideUserBackgrounds;
    let bannerUrl: string | undefined;
    if (settings.store.showUserBanners && !hideUserBg) {
        const usrbgWins = !settings.store.preferBanners
            && isPluginEnabled(usrbg.name)
            && usrbg.userHasBackground(participantUserId);
        if (!usrbgWins) bannerUrl = getProfileBannerUrl(participantUserId);
    }
    const ringPic = settings.store.speakingIndicator === "picture";
    // Picture mode puts the speaking ring in the filter, other tiles get a box from the stylesheet
    const [glowColor, glowColor2] = getGlowColors();
    // Chained drop-shadows add up: keep the total reach (about 13px) inside the gap the 90% zoom leaves
    // under the picture, or the tile's clip cuts the bottom of the halo off.
    const glowFilter = ringPic && speakingGlow ? `drop-shadow(-1px 0 1.5px ${glowColor}) drop-shadow(1px 0 1.5px ${glowColor2}) drop-shadow(-2px 0 5px ${glowColor}) drop-shadow(2px 0 5px ${glowColor2})` : "";
    return {
        "--full-res-avatar": `url("${avatarUrl}")`,
        "--vc-pfp-radius": `${Math.round(settings.store.cornerRadius)}px`,
        "--vc-pfp-avatar-mask": avatarMask(Math.round(settings.store.avatarRadius)),
        "--vc-pfp-avatar-radius": `${Math.round(settings.store.avatarRadius)}%`,
        "--vc-pfp-zoom": `${Math.round(settings.store.zoom) / 100}`,
        // The background shorthand resets every background key in the merged
        // style object and erased USRBG's inline banner with Discord's own
        // paint (measured live, work/rvcpfp-usrbg-toggle-20261008). The color
        // longhand clears only the native box, and the image key is sent only
        // when user backgrounds are meant to hide, so USRBG's own keys
        // survive untouched otherwise.
        backgroundColor: hideBg ? "transparent" : "",
        ...(hideUserBg ? { backgroundImage: "none" } : {}),
        ...(bannerUrl ? {
            backgroundImage: `url("${bannerUrl}")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat"
        } : {}),
        "--vc-pfp-hide-bg": hideBg ? "1" : "",
        "--vc-pfp-speaking": speakingGlow ? "1" : "",
        "--vc-pfp-ring-pic": ringPic ? "1" : "",
        // Stream tiles are not voice: their video never carries the
        // speaking ring, the stylesheet keys on this marker.
        "--vc-pfp-stream": isStream ? "1" : "",
        // camera tiles keep the native tile border in picture mode
        "--vc-pfp-camera": isCamera ? "1" : "",
        // deafened: Discord's own speaking border hides too
        "--vc-pfp-deaf": glowOff ? "1" : "",
        // Marks this plugin version for theme handoff: themes drop their own
        // fallback glow when the slot is present. The filter string carries the
        // configured color; themes and any other stylesheet consume it.
        "--vc-pfp-glow-slot": "1",
        "--vc-pfp-glow-filter": glowFilter,
        "--vc-pfp-custom-glow": glowColor,
        "--vc-pfp-custom-glow-2": glowColor2
    };
}
