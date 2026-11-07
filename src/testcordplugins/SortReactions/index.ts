/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * Copyright (c) 2024 HAHALOSAH. All rights reserved.
 */

import { TestcordDevs } from "@utils/constants";
import definePlugin from "@utils/types";

export default definePlugin({
    id: "SortReactions",
    name: "SortReactions",
    description: "Sorts reactions by count in chat.",
    tags: ["Reactions", "Utility"],
    authors: [TestcordDevs.x2b],
    patches: [
        {
            find: "showImmediate:",
            replacement: [
                {
                    match: /(\i)\.map\((?=\i=>\(0,\i\.jsx\)\(\i,\{\.\.\.\i,\.\.\.\i,emojiSize:"reaction")/,
                    replace: "[...$1].sort((a,b)=>b.count-a.count).map(",
                },
            ],
        },
    ],
});
