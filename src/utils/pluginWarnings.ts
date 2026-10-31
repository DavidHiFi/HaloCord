/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import experimentalIconBase64 from "file://../../browser/ExpirimentalIcon.svg?base64";
import legacyIconBase64 from "file://../../browser/LegacyIcon.svg?base64";

export const ExperimentalIconUrl = `data:image/svg+xml;base64,${experimentalIconBase64}`;
export const LegacyIconUrl = `data:image/svg+xml;base64,${legacyIconBase64}`;

export type PluginWarningType = "experimental" | "legacy" | "warning";

export interface PluginWarningInfo {
    type: PluginWarningType;
    label: string;
    title: string;
    description: string;
    icon: string;
    badgeClass?: string;
    replacementPlugin?: string;
}

/**
 * Add plugin names here that should be marked as EXPERIMENTAL.
 */
export const EXPERIMENTAL_PLUGINS: string[] = [
    "BadgeSpoofer",
    "AntilogPremium",
    "TestcordOptimizer",
    "NoButtons",
    "NSFWGateBypass",
    "TrustMeBro",
    "trustmebro"
];

/**
 * Add plugin names here that should be marked as LEGACY.
 */
export const LEGACY_PLUGINS: string[] = [
    "StereoInstaller",
    "AntiStereo",
    "FakeMuteDeafen",
    "fakemuteanddeafen",
    "NitroSniper",
    "GuildCopier",
    "UserAreaTweaks",
    "OSSpoofer",
    "BetterScreenshare",
    "CustomStreamQuality",
    "FakeProfile",
    "fakeProfile",
    "FakeUserProfile",
    "fakeUserProfile",
    "Force Mono",
    "forcemono",
    "ForceMono",
    "Fake Accounts",
    "fakeAccounts",
    "FakeAccounts"
];

/**
 * Map of legacy plugin names to their replacement plugin names.
 * Matching is case-insensitive and ignores spaces, hyphens, and underscores.
 */
export const LEGACY_REPLACEMENTS: Record<string, string> = {
    "ChromeTabs": "ChannelTabs",
    "ProfileMedia": "ViewIcons",
    "AvatarGrabber": "ViewIcons",
    "ZIP+": "ZipPreview",
    "FileViewer": "PdfViewer",
    "RecentDMSwitcher": "RecentChannelSwitcher",
    "StaffScanner": "StaffTag",
    "AntiMod": "StaffTag",
    "ServerPruner": "RelationshipPruner",
    "BulkFriendRemove": "RelationshipPruner",
    "FriendsRemover": "RelationshipPruner",
    "ChatsScrapper": "RelationshipPruner",
    "CloseAllDms": "RelationshipPruner",
    "PerformanceBoost": "TestcordOptimizer",
    "FastDiscord": "TestcordOptimizer",
    "Perf": "TestcordOptimizer",
    "OpenOptimizer": "TestcordOptimizer",
    "CacheResetButton": "TestcordOptimizer",
    "ChatGPT": "TestcordAI",
    "SummarizeAI": "TestcordAI",
    "CrashHandlerEnhanced": "CrashHandler",
    "HyprTilesPremium": "HyprTiles",
    "FollowVoiceUser": "FollowUser",
    "FollowVoiceUser-Extand": "FollowUser",
    "WebcamStartNotifier": "VideoStartNotifier",
    "FullVCPFP": "RoundedVCPFP",
    "MessageScheduler": "ScheduledMessages",
    "ViewRawVariant": "ViewRaw",
    "Token Display": "GetMyToken",
    "RepeatMessage": "RepeatMessages",
    "Grammar": "PolishWording",
    "GrammarFix": "PolishWording",
    "AutoCorrect": "PolishWording",
    "AutoCorrectNC": "PolishWording",
    "ChatGPTWriting": "PolishWording",
    "MessageTranslate": "Translate",
    "BigFileUploadEnhanced": "BigFileUpload",
    "VoiceGuard": "VoiceRejoin",
    "BetterGifLoad": "FastGifPicker",
    "MoreAlts": "UnlimitedAccounts",
    "FakeUserSwitcher": "UnlimitedAccounts",
    "DXTokenImporter": "TokenImporter",
    "FakeDM": "SystemMessageSpoofer",
    "SpoofSystemV2": "SystemMessageSpoofer",
    "AutoReplyContent": "AutoReply",
    "Boo": "Ghosted",
    "FakeProfile": "UnlimitedAccounts",
    "fakeprofile": "UnlimitedAccounts",
    "FakeUserProfile": "UnlimitedAccounts",
    "fakeuserprofile": "UnlimitedAccounts",
    "AntiStereo": "StereoGuard",
    "antistereo": "Force Mono",
    "FakeMuteDeafen": "FakeVoiceStates",
    "FakeVoicePremium": "FakeVoiceStates",
    "FakeVoice": "FakeVoiceStates",
    "fakemutedeafen": "FakeVoiceStates",
    "fakemuteanddeafen": "FakeVoiceStates",
    "GuildCopier": "ServerToolkit",
    "guildcopier": "ServerToolkit",
    "NitroSniper": "AutoRedeem",
    "nitrosniper": "AutoRedeem",
    "OSSpoofer": "PlatformEmulator",
    "UserAreaTweaks": "PanelLayout",
    "userareatweaks": "PanelLayout",
    "BetterScreenshare": "StreamEnhancer",
    "betterscreenshare": "StreamEnhancer",
    "CustomStreamQuality": "StreamEnhancer",
    "MusicControls": "PanelLayout",
    "musiccontrols": "PanelLayout",
    "ActivityBanner": "PanelLayout",
    "activitybanner": "PanelLayout",
    "DiscordDevBanner": "PanelLayout",
    "discorddevbanner": "PanelLayout",
    "deraculpanellayout": "PanelLayout",
    "Force Mono": "StereoGuard",
    "forcemono": "StereoGuard",
    "ForceMono": "StereoGuard",
    "Fake Accounts": "UnlimitedAccounts",
    "fakeAccounts": "UnlimitedAccounts",
    "FakeAccounts": "UnlimitedAccounts"
};

/**
 * Optional custom warning configurations for specific plugins.
 */
export const CUSTOM_PLUGIN_WARNINGS: Record<string, {
    label: string;
    title?: string;
    description: string;
    type?: PluginWarningType;
    icon?: string;
    replacementPlugin?: string;
}> = {};

const EXPERIMENTAL_INFO: PluginWarningInfo = {
    type: "experimental",
    label: "Experimental",
    title: "Experimental Plugin",
    description: "This plugin is in active experimentation and may be unstable, have bugs, or change frequently.",
    icon: ExperimentalIconUrl,
    badgeClass: "vc-plugin-warning-experimental",
};

const LEGACY_INFO: PluginWarningInfo = {
    type: "legacy",
    label: "Legacy",
    title: "Legacy Plugin",
    description: "This plugin is legacy and may no longer be actively maintained or receive updates.",
    icon: LegacyIconUrl,
    badgeClass: "vc-plugin-warning-legacy",
};

/**
 * Normalizes plugin names for consistent matching.
 */
export function normalizeName(name: string): string {
    return name.trim().toLowerCase().replace(/[\s\-_]/g, "");
}

/**
 * Normalised lookup tables for the registries above.
 *
 * `getPluginWarning` runs for every rendered plugin card, and each call used to
 * `Object.entries()` two records and re-run `normalizeName` over ~44 registry entries
 * (three string allocations and a regex each) just to answer a membership question. The
 * registries are module constants that are never mutated, so index them once. First
 * entry wins on both maps, matching the previous `find`/loop behaviour.
 */
function indexByNormalizedName<V>(record: Record<string, V>): Map<string, V> {
    const index = new Map<string, V>();
    for (const [key, value] of Object.entries(record)) {
        const norm = normalizeName(key);
        if (!index.has(norm)) index.set(norm, value);
    }
    return index;
}

const legacyReplacementsByName = indexByNormalizedName(LEGACY_REPLACEMENTS);
const customWarningsByName = indexByNormalizedName(CUSTOM_PLUGIN_WARNINGS);
const experimentalNames = new Set(EXPERIMENTAL_PLUGINS.map(normalizeName));
const legacyNames = new Set(LEGACY_PLUGINS.map(normalizeName));

/**
 * Gets the replacement plugin name for a legacy plugin if defined.
 */
export function getLegacyReplacement(pluginName: string): string | undefined {
    return legacyReplacementsByName.get(normalizeName(pluginName));
}

/**
 * Checks whether a given plugin name is in the EXPERIMENTAL list.
 */
export function isExperimentalPlugin(pluginName: string): boolean {
    return experimentalNames.has(normalizeName(pluginName));
}

/**
 * Checks whether a given plugin name is in the LEGACY list or has a legacy replacement.
 */
export function isLegacyPlugin(pluginName: string): boolean {
    return legacyReplacementsByName.has(normalizeName(pluginName)) || legacyNames.has(normalizeName(pluginName));
}

/**
 * Determines the warning info (if any) for a given plugin or plugin name.
 * Checks the central registry lists, custom warnings, plugin definition properties, and tags.
 */
export function getPluginWarning(pluginOrName: { name?: string; experimental?: boolean; legacy?: boolean; tags?: string[]; } | string | undefined | null): PluginWarningInfo | null {
    if (!pluginOrName) return null;

    const name = typeof pluginOrName === "string" ? pluginOrName : pluginOrName.name;
    if (!name) return null;

    const norm = normalizeName(name);
    const replacementPlugin = getLegacyReplacement(name);

    const customMatch = customWarningsByName.get(norm);
    if (customMatch) {
        const val = customMatch;
        const type = val.type ?? "warning";
        const rep = val.replacementPlugin ?? (type === "legacy" ? replacementPlugin : undefined);
        return {
            type,
            label: val.label,
            title: val.title ?? `${val.label} Plugin`,
            description: rep
                ? `This plugin is legacy and has been replaced by ${rep}.`
                : val.description,
            icon: val.icon ?? (type === "legacy" ? LegacyIconUrl : ExperimentalIconUrl),
            badgeClass: `vc-plugin-warning-${type}`,
            replacementPlugin: rep,
        };
    }

    if (experimentalNames.has(norm)) {
        return EXPERIMENTAL_INFO;
    }

    if (replacementPlugin || legacyNames.has(norm)) {
        return {
            ...LEGACY_INFO,
            replacementPlugin,
            description: replacementPlugin
                ? `This plugin is legacy and has been replaced by ${replacementPlugin}.`
                : LEGACY_INFO.description,
        };
    }

    if (typeof pluginOrName !== "string") {
        if (pluginOrName.experimental || pluginOrName.tags?.includes("experimental")) {
            return EXPERIMENTAL_INFO;
        }
        if (pluginOrName.legacy || pluginOrName.tags?.includes("legacy")) {
            return {
                ...LEGACY_INFO,
                replacementPlugin,
                description: replacementPlugin
                    ? `This plugin is legacy and has been replaced by ${replacementPlugin}.`
                    : LEGACY_INFO.description,
            };
        }
    }

    return null;
}
