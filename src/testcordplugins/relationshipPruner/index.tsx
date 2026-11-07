/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { classNameFactory, disableStyle, enableStyle } from "@api/Styles";
import { Devs, TestcordDevs } from "@utils/constants";
import { openModal } from "@utils/modal";
import definePlugin from "@utils/types";

import { FriendPruneModal } from "./components/FriendPruneModal";
import { GuildPruneModal } from "./components/GuildPruneModal";
import style from "./style.css?managed";

export const cl = classNameFactory("vc-relationshipPruner-");

export default definePlugin({
    id: "RelationshipPruner",
    name: "RelationshipPruner",
    description: "Adds a way to easily prune your servers and friends. To open, right click the home button or friends tab button",
    tags: ["Friends", "Utility"],
    authors: [
        Devs.Samwich
    , TestcordDevs.x2b],
    onContextMenu(type)
    {
        openModal(props => (type === "guild" ? <GuildPruneModal {...props}/> : <FriendPruneModal {...props}/>));
    },
    patches: [
        {
            find: '"guild-list-unread-dms"',
            replacement: {
                match: /(onMouseEnter:\(\)=>\i\(!0\),onMouseLeave:\(\)=>\i\(!1\),)(?=onClick:function\(\)\{)/,
                replace: "$1onContextMenu:() => $self.onContextMenu(\"guild\"),"
            }
        },
        {
            find: /showHoverGradient:\i,onClick:\i,selected:\i,route:\i\.\i\.FRIENDS/,
            replacement:
            {
                match: /(showHoverGradient:\i,)(onClick:\i,selected:\i,route:\i\.\i\.FRIENDS)/,
                replace: "$1onContextMenu:() => $self.onContextMenu(\"friend\"),$2"
            }
        }
    ],
    start() {
        enableStyle(style);
    },
    stop() {
        disableStyle(style);
    }
});
