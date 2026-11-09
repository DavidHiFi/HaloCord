/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

export interface Preset {
    id: string;
    title: string;
    description: string;
    /** Options this preset turns on. Every other option goes back to its default. */
    values: Record<string, boolean>;
}

const on = (...keys: string[]) => Object.fromEntries(keys.map(key => [key, true]));

const BALANCED = on(
    "freezeWhenUnfocused",
    "reduceFpsBackground",
    "forcePassiveListeners",
    "pauseOffscreenMedia",
    "networkCache",
    "memoryManagement",
    "cacheLimitsEnabled",
    "preconnectDiscordCdn",
    "suppressConsoleSpam",
    "killGatewayAnalytics",
    "killSentry"
);

const FAST = {
    ...BALANCED,
    ...on(
        "reduceMotion",
        "disableSpringAnimations",
        "killHoverTransitions",
        "killBackdropBlur",
        "killConfettiCanvas",
        "killMessageEffects",
        "disableCanvasEffects",
        "disableAnimatedHeaders",
        "suppressChannelAnimations",
        "suppressUnreadBadgeAnimations",
        "suppressMentionBadgeAnimations",
        "suppressModalAnimations",
        "suppressContextMenuAnimations",
        "suppressEmojiPickerAnimations",
        "suppressSkeletonAnimation",
        "disableFolderAnimations",
        "optimizeToasts",
        "simplifySpoilers",
        "suppressProfileEffects",
        "suppressGifAutoplay",
        "freezeAnimatedAvatars",
        "lazyEmbedImages",
        "optimizeChatInput",
        "throttleFluxDispatches"
    )
};

const LIGHTNING = {
    ...FAST,
    ...on(
        "stripDecorativeStyling",
        "disableCSSFilters",
        "disableBoxShadows",
        "disableTextShadows",
        "forceScrollBehavior",
        "suppressReactionAnimations",
        "suppressScrollbarAnimations",
        "suppressDiscoveryAnimations",
        "suppressAllCanvas",
        "disableAnimatedEmoji",
        "suppressStickerAnimation",
        "freezeGifsUntilHover",
        "forceLowImageQuality",
        "reduceAvatarQuality",
        "hideAvatarDecorations",
        "hideServerBanner",
        "hideServerBoosting",
        "hideNitroUpsell",
        "killPerformanceMetrics",
        "suppressConsoleWarn",
        "suppressConsoleTimers"
    )
};

export const PRESETS: Preset[] = [
    { id: "stock", title: "Stock", description: "Everything as Discord ships it.", values: {} },
    { id: "balanced", title: "Balanced", description: "Safe savings. Nothing looks different.", values: BALANCED },
    { id: "fast", title: "Fast", description: "Fewer animations and lighter effects.", values: FAST },
    { id: "lightning", title: "Lightning", description: "Fastest. Plain look, no animations.", values: LIGHTNING }
];
