/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import experimentalIconBase64 from "file://../../browser/ExpirimentalIcon.svg?base64";

export const ExperimentalIconUrl = `data:image/svg+xml;base64,${experimentalIconBase64}`;

export type PluginWarningType = "experimental" | "warning";

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

const customWarningsByName = indexByNormalizedName(CUSTOM_PLUGIN_WARNINGS);
const experimentalNames = new Set(EXPERIMENTAL_PLUGINS.map(normalizeName));

/**
 * Checks whether a given plugin name is in the EXPERIMENTAL list.
 */
export function isExperimentalPlugin(pluginName: string): boolean {
    return experimentalNames.has(normalizeName(pluginName));
}

/**
 * Determines the warning info (if any) for a given plugin or plugin name.
 * Checks the central registry lists, custom warnings, plugin definition properties, and tags.
 */
export function getPluginWarning(pluginOrName: { name?: string; experimental?: boolean; tags?: string[]; } | string | undefined | null): PluginWarningInfo | null {
    if (!pluginOrName) return null;

    const name = typeof pluginOrName === "string" ? pluginOrName : pluginOrName.name;
    if (!name) return null;

    const norm = normalizeName(name);

    const customMatch = customWarningsByName.get(norm);
    if (customMatch) {
        const type = customMatch.type ?? "warning";
        return {
            type,
            label: customMatch.label,
            title: customMatch.title ?? `${customMatch.label} Plugin`,
            description: customMatch.description,
            icon: customMatch.icon ?? ExperimentalIconUrl,
            badgeClass: `vc-plugin-warning-${type}`,
            replacementPlugin: customMatch.replacementPlugin,
        };
    }

    if (experimentalNames.has(norm)) {
        return EXPERIMENTAL_INFO;
    }

    if (typeof pluginOrName !== "string") {
        if (pluginOrName.experimental || pluginOrName.tags?.includes("experimental")) {
            return EXPERIMENTAL_INFO;
        }
    }

    return null;
}
