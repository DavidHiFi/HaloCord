/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { definePluginSettings, SettingsStore } from "@api/Settings";
import { OptionType } from "@utils/types";

export const HEX_COLOR = /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

export type RejoinSkip = "none" | "dms" | "servers" | "both";
export type SpeakingIndicator = "box" | "picture";

// Every option is shown by HaloCord's own rows in Voice & Video, so none carry plugin-modal copy.
export const settings = definePluginSettings({
    rejoin: { type: OptionType.BOOLEAN, default: false, description: "" },
    rejoinDelay: { type: OptionType.NUMBER, default: 2, description: "" },
    rejoinTimeout: { type: OptionType.NUMBER, default: 30, description: "" },
    rejoinSkip: { type: OptionType.STRING, default: "both" as RejoinSkip, description: "" },
    rejoinDmsOnly: { type: OptionType.BOOLEAN, default: false, description: "" },

    tiles: { type: OptionType.BOOLEAN, default: true, description: "" },
    avatarRadius: { type: OptionType.NUMBER, default: 5, description: "" },
    cornerRadius: { type: OptionType.NUMBER, default: 12, description: "" },
    zoom: { type: OptionType.NUMBER, default: 100, description: "" },
    // One of the nine VU meter spots ("center", "top-left", "right" ...): where the picture sits in its tile
    picturePosition: { type: OptionType.STRING, default: "center", description: "" },
    hideTileBackground: { type: OptionType.BOOLEAN, default: false, description: "" },
    hideUserBackgrounds: { type: OptionType.BOOLEAN, default: false, description: "" },
    showUserBanners: { type: OptionType.BOOLEAN, default: true, description: "" },
    preferBanners: { type: OptionType.BOOLEAN, default: false, description: "" },
    speakingIndicator: { type: OptionType.STRING, default: "box" as SpeakingIndicator, description: "" },
    overrideGlow: { type: OptionType.BOOLEAN, default: false, description: "" },
    glowColor: { type: OptionType.STRING, default: "#89B4FA", description: "" },
    glowColor2: { type: OptionType.STRING, default: "", description: "" },
    hoverGlow: { type: OptionType.BOOLEAN, default: false, description: "" }
});

type Stored = Record<string, unknown>;

const pick = (from: Stored | undefined, keys: Record<string, string>) => {
    const out: Stored = {};
    if (!from) return out;
    for (const [oldKey, newKey] of Object.entries(keys)) {
        if (from[oldKey] !== undefined) out[newKey] = from[oldKey];
    }
    return out;
};

// Call tiles and call rejoin were the RoundedVCPFP and VoiceRejoin plugins. Their saved values,
// on/off state included, move here once and the old entries go.
export function migrateFromPlugins() {
    const { plugins } = SettingsStore.plain;
    const tiles: Stored | undefined = plugins.RoundedVCPFP;
    const rejoin: Stored | undefined = plugins.VoiceRejoin;
    if (!tiles && !rejoin) return;

    if (!plugins.HaloCalls) {
        plugins.HaloCalls = {
            enabled: true,
            ...pick(tiles, {
                enabled: "tiles",
                avatarRadius: "avatarRadius",
                cornerRadius: "cornerRadius",
                zoom: "zoom",
                hideTileBackground: "hideTileBackground",
                hideUserBackgrounds: "hideUserBackgrounds",
                showUserBanners: "showUserBanners",
                preferBanners: "preferBanners",
                speakingIndicator: "speakingIndicator",
                enableGlow: "overrideGlow",
                overrideGlow: "overrideGlow",
                glowColor: "glowColor",
                glowColor2: "glowColor2",
                hoverGlow: "hoverGlow"
            }),
            ...pick(rejoin, {
                enabled: "rejoin",
                rejoinDelay: "rejoinDelay",
                rejoinTimeout: "rejoinTimeout",
                preventReconnectIfCallEnded: "rejoinSkip",
                applyOnlyToDms: "rejoinDmsOnly"
            })
        };
    }
    delete plugins.RoundedVCPFP;
    delete plugins.VoiceRejoin;
    SettingsStore.markAsChanged();
}
