/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2022 Vendicated and contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import "./style.css";

import { addServerListElement, removeServerListElement, ServerListRenderPosition } from "@api/ServerList";
import { definePluginSettings } from "@api/Settings";
import { TextButton } from "@components/Button";
import ErrorBoundary from "@components/ErrorBoundary";
import { Devs, EquicordDevs, TestcordDevs } from "@utils/constants";
import definePlugin, { OptionType } from "@utils/types";
import { ActiveJoinedThreadsStore, FluxDispatcher, GuildChannelStore, GuildStore, React, ReadStateStore } from "@webpack/common";

const settings = definePluginSettings({
    showBellIcon: {
        type: OptionType.BOOLEAN,
        description: "Show a bell icon instead of the Read All text.",
        default: false
    }
});

function onClick() {
    const channels: Array<any> = [];

    Object.values(GuildStore.getGuilds()).forEach(guild => {
        GuildChannelStore.getChannels(guild.id).SELECTABLE
            .concat(GuildChannelStore.getChannels(guild.id).VOCAL)
            .concat(
                Object.values(ActiveJoinedThreadsStore.getActiveJoinedThreadsForGuild(guild.id))
                    .flatMap(threadChannels => Object.values(threadChannels))
            )
            .forEach((c: { channel: { id: string; }; }) => {
                if (!ReadStateStore.hasUnread(c.channel.id)) return;

                channels.push({
                    channelId: c.channel.id,
                    messageId: ReadStateStore.lastMessageId(c.channel.id),
                    readStateType: 0
                });
            });
    });

    FluxDispatcher.dispatch({
        type: "BULK_ACK",
        context: "APP",
        channels: channels
    });
}

function ReadAllButton() {
    const { showBellIcon } = settings.use(["showBellIcon"]);
    return (
        <TextButton
            variant="secondary"
            onClick={onClick}
            className="vc-ranb-button"
            aria-label="Read All"
        >
            {showBellIcon ? (
                <svg className="vc-ranb-bell" viewBox="0 0 24 24" width={20} height={20} aria-hidden="true">
                    <path fill="currentColor" d="M9.7 2.89c.18-.07.32-.24.37-.43a2 2 0 0 1 3.86 0c.05.2.19.36.37.43A7 7 0 0 1 19 9.5v2.09c0 .12.05.24.13.33l1.1 1.22a3 3 0 0 1 .77 2.01v.28c0 .67-.34 1.29-.95 1.56-1.31.6-4 1.51-8.05 1.51s-6.74-.91-8.05-1.5c-.61-.28-.95-.9-.95-1.57v-.28a3 3 0 0 1 .77-2l1.1-1.23a.5.5 0 0 0 .13-.33V9.5a7 7 0 0 1 4.7-6.61ZM9.18 19.84c-.2-.05-.4.1-.33.29a3.34 3.34 0 0 0 6.3 0c.07-.2-.12-.34-.33-.3-.9.18-1.8.27-2.82.27s-1.92-.1-2.82-.26Z" />
                </svg>
            ) : "Read All"}
        </TextButton>
    );
}

export default definePlugin({
    id: "ReadAllNotificationsButton",
    name: "ReadAllNotificationsButton",
    description: "Read all server notifications with a single button click!",
    tags: ["Notifications", "Shortcuts"],
    authors: [Devs.kemo, EquicordDevs.KrystalSkull, TestcordDevs.DavidHiFi],
    dependencies: ["ServerListAPI"],
    settings,

    renderReadAllButton: ErrorBoundary.wrap(ReadAllButton, { noop: true }),

    start() {
        addServerListElement(ServerListRenderPosition.Above, this.renderReadAllButton);
    },

    stop() {
        removeServerListElement(ServerListRenderPosition.Above, this.renderReadAllButton);
    }
});
