/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { definePluginSettings } from "@api/Settings";
import { OptionType } from "@utils/types";

export const settings = definePluginSettings({
    fakeMute: {
        description: "Make everyone believe you're muted (you can still speak)",
        type: OptionType.BOOLEAN,
        default: true,
    },
    fakeDeafen: {
        description: "Make everyone believe you're deafened (you can still hear)",
        type: OptionType.BOOLEAN,
        default: true,
    },
    fakeStream: {
        description: "Make everyone believe you're streaming (when you're not)",
        type: OptionType.BOOLEAN,
        default: true,
    },
    fakeGame: {
        description: "Make everyone believe you're in an activity (when you're not)",
        type: OptionType.BOOLEAN,
        default: true,
    },
    fakeCam: {
        description: "Make everyone believe your camera is on (even if it's not)",
        type: OptionType.BOOLEAN,
        default: false,
    },
    cutMicTransmission: {
        description: "Locally mute your microphone while Fake Voice is enabled so no mic input is transmitted",
        type: OptionType.BOOLEAN,
        default: false,
    }
});
