/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { EquicordDevs, TestcordDevs } from "@utils/constants";
import definePlugin from "@utils/types";

import { cancelRejoin, rejoinAfterRestart, rememberCall } from "./rejoin";
import { migrateFromPlugins, settings } from "./settings";
import { getVoiceBackgroundStyles, stopTiles, syncTiles, useTileBanner } from "./tiles";

migrateFromPlugins();

// Call rejoin and call tiles, built in and switched from Voice & Video > Calls at runtime.
// The tile patch always applies and adds nothing while tiles are off.
export default definePlugin({
    name: "HaloCalls",
    description: "Rejoins your call after a restart and fills voice tiles with full profile pictures.",
    authors: [EquicordDevs.mochienya, EquicordDevs.omaw, EquicordDevs.keircn, TestcordDevs.DavidHiFi],
    required: true,
    hidden: true,
    settings,

    patches: [
        {
            find: "\"data-selenium-video-tile\":",
            replacement: {
                // USRBG patches this component from the function head and wins the
                // patch-order race, so a head-anchored lookahead stops matching after
                // its Object.assign lands (notes/2026-10-08-voice-tile-avatars.md).
                // The styles go into a fresh object each render: the parent hands
                // down the same style object, and mutating it in place left React
                // comparing the object with itself, so cleared keys stayed in the DOM.
                // The hook call stays unconditional so hook order holds.
                match: /(?<=let\{children:\i,className:\i,style:(\i),noBorder:\i=!1,participantUserId:\i,ref:\i\}=(\i);)/,
                replace: "$self.useTileBanner($2);$1={...$1,...$self.getVoiceBackgroundStyles($2)};"
            }
        }
    ],

    useTileBanner,
    getVoiceBackgroundStyles,

    flux: {
        VOICE_STATE_UPDATES: rememberCall,
        CONNECTION_OPEN: rejoinAfterRestart
    },

    start: syncTiles,

    stop() {
        stopTiles();
        cancelRejoin();
    }
});
