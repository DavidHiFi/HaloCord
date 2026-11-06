/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

export type BadgeVisibility = "shown" | "local" | "all";

export interface BadgeConfig {
    badgeVisibility: BadgeVisibility;
    spoofBadgeEnabled: boolean;
    spoofBadgeWidth: number;
    spoofBadgeHeight: number;
    spoofBadgeFps: number;
}

export const badgeResolutionPresets = [144, 360, 480, 720, 1080, 1440, 2160, 4320, 8640, 17280, 34560, 69420];
export const badgeFpsPresets = [30, 60, 67, 120, 144, 240, 360, 1000];
export const maxBadgeHeight = 69420;
export const maxBadgeWidth = Math.round(maxBadgeHeight * 16 / 9);
export const maxBadgeFps = 1000;

export function sanitizeBadgeVisibility(value: unknown): BadgeVisibility {
    switch (value) {
        case "local": return "local";
        case "all": return "all";
        default: return "shown";
    }
}

export function normalizeBadgeConfig(source: Partial<BadgeConfig> & { badgeVisible?: boolean; }): BadgeConfig {
    const bounded = (value: number | undefined, fallback: number, max: number) =>
        Number.isFinite(value) ? Math.min(max, Math.max(1, Math.round(value ?? fallback))) : fallback;
    return {
        badgeVisibility: source.badgeVisibility !== undefined
            ? sanitizeBadgeVisibility(source.badgeVisibility)
            : source.badgeVisible === false ? "local" : "shown",
        spoofBadgeEnabled: source.spoofBadgeEnabled === true,
        spoofBadgeWidth: bounded(source.spoofBadgeWidth, 7680, maxBadgeWidth),
        spoofBadgeHeight: bounded(source.spoofBadgeHeight, 4320, maxBadgeHeight),
        spoofBadgeFps: bounded(source.spoofBadgeFps, 360, maxBadgeFps)
    };
}

// Badge cosmetics must not change receiver capabilities or encoder negotiation.
export function advertiseBadge(_rtc: { context?: string; }, streams: unknown, _config: BadgeConfig): unknown {
    return streams;
}

export function badgeFps(fps: number, config: BadgeConfig): number {
    return config.spoofBadgeEnabled ? config.spoofBadgeFps : fps;
}

export function badgeResolution<T extends { width: number; height: number; type: unknown; }>(resolution: T, config: BadgeConfig): T {
    if (!config.spoofBadgeEnabled) return resolution;

    return {
        ...resolution,
        width: config.spoofBadgeWidth,
        height: config.spoofBadgeHeight,
        type: typeof resolution.type === "string" ? resolution.type : "fixed"
    };
}
