/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { definePluginSettings } from "@api/Settings";
import { TestcordDevs } from "@utils/constants";
import definePlugin, { OptionType } from "@utils/types";

const settings = definePluginSettings({
    spoilerFilenames: {
        description: "Strings in filenames that should be spoilered. Comma separated.",
        type: OptionType.STRING,
        default: "",
    },
    spoilerLinks: {
        description: "Strings in link attachments that should be spoilered. Comma separated.",
        type: OptionType.STRING,
        default: ""
    },
    gifSpoilersOnly: {
        description: "Should the links only be gifs?",
        type: OptionType.BOOLEAN,
        default: true

    },
});

export default definePlugin({
    id: "TriggerWarning",
    name: "TriggerWarning",
    authors: [TestcordDevs.x2b],
    description: "Spoiler attachments based on filenames and links.",
    tags: ["Notifications", "Utility"],
    patches: [
        {
            // message attachments
            find: /if\(0===\i\.length\)return null;let \i=1===\i\.length;function/,
            replacement: {
                match: /(function \i\((\i),\i\)\{let \i=)(?=\(0,\i\.\i\)\(\2\.originalItem\.flags\?\?0,\i\.\i\.IS_SPOILER\))/,
                replace: "$1$self.shouldSpoiler($2.originalItem.filename)||"
            }
        },
        {
            // message attachments in the media mosaic
            find: /IS_SPOILER\)\|\|\(0,\i\.\i\)\(\i\);return\(0,\i\.\i\)\(\i\.originalItem,/,
            replacement: {
                match: /(function \i\((\i),\i\)\{let \i=)(?=\(0,\i\.\i\)\(\2\.originalItem\.flags\?\?0,\i\.\i\.IS_SPOILER\))/,
                replace: "$1$self.shouldSpoiler($2.originalItem.filename)||"
            }
        },
        {
            // embed media (gifs, images from links)
            find: /\.media,\i,\i\.spoiler,\i\?\.author\.bot/,
            replacement: {
                match: /(\{let (\i)=\i\.originalItem;return\(0,\i\.\i\)\(\i\.media,\i,)\i\.spoiler/,
                replace: "$1$self.spoilerLink($2.spoiler,$2.media.url,$2.media.originalContentType??$2.media.contentType)"
            }
        }
    ],
    settings,
    _spoilerFilenames: [] as string[],
    _spoilerFilenamesRaw: undefined as string | undefined,
    _spoilerLinks: [] as string[],
    _spoilerLinksRaw: undefined as string | undefined,
    _getSpoilerFilenames(): string[] {
        const raw = settings.store.spoilerFilenames;
        if (raw === this._spoilerFilenamesRaw) return this._spoilerFilenames;
        this._spoilerFilenamesRaw = raw;
        this._spoilerFilenames = (raw || "").split(",").map(s => s.trim()).filter(Boolean);
        return this._spoilerFilenames;
    },
    _getSpoilerLinks(): string[] {
        const raw = settings.store.spoilerLinks;
        if (raw === this._spoilerLinksRaw) return this._spoilerLinks;
        this._spoilerLinksRaw = raw;
        this._spoilerLinks = (raw || "").split(",").map(s => s.trim()).filter(Boolean);
        return this._spoilerLinks;
    },
    shouldSpoiler(filename: string): string | null {
        if (!filename) return null;
        const strings = this._getSpoilerFilenames();
        if (!strings.length) return null;
        return strings.some(s => filename.includes(s)) ? "spoiler" : null;
    },
    spoilerLink(alreadySpoilered: any, link: string, type?: string): any {
        if (alreadySpoilered) return alreadySpoilered;
        if (!link) return null;
        const strings = this._getSpoilerLinks();
        if (!strings.length) return alreadySpoilered;
        const isLinkSpoiler = strings.some(s => link.includes(s));

        if (settings.store.gifSpoilersOnly) {
            return (type === "gifv" || type === "image/gif") && isLinkSpoiler ? "spoiler" : null;
        } else {
            return isLinkSpoiler ? "spoiler" : null;
        }
    }
});
