/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { TestcordDevs } from "@utils/constants";
import definePlugin from "@utils/types";

export default definePlugin({
    id: "NoDraftLengthLimit",
    name: "NoDraftLengthLimit",
    description: "Removes the 4500 character saved draft message truncation",
    tags: ["Chat", "Utility"],
    authors: [TestcordDevs.x2b],
    patches: [
        {
            find: "ApplicationLauncherCommand=3",
            replacement: {
                match: /(\(\i=\i\)\.length>)4500/,
                replace: "$1Number.MAX_SAFE_INTEGER"
            }
        }
    ]
});
