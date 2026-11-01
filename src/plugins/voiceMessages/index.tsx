/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2023 Vendicated and contributors
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

import "./styles.css";

import { NavContextMenuPatchCallback } from "@api/ContextMenu";
import { definePluginSettings } from "@api/Settings";
import { Microphone } from "@components/Icons";
import { lastState as silentMessageEnabled } from "@plugins/silentMessageToggle";
import { Devs } from "@utils/constants";
import { classNameFactory } from "@utils/css";
import definePlugin, { OptionType } from "@utils/types";
import { CloudUploadPlatform } from "@vencord/discord-types/enums";
import { CloudUploader, Constants, FluxDispatcher, Menu, MessageActions, openModal, PendingReplyStore, PermissionsBits, PermissionStore, RestAPI, SelectedChannelStore, showToast, SnowflakeUtils } from "@webpack/common";

import { VoiceMessageModal } from "./components/VoiceMessageModal";

const VOICE_MESSAGE_FLAG = 1 << 13;
const SILENT_MESSAGE_FLAG = 4096;

export const cl = classNameFactory("vc-vmsg-");

export type AudioMetadata = {
    waveform: string,
    duration: number,
};

export const settings = definePluginSettings({
    noiseSuppression: {
        type: OptionType.BOOLEAN,
        description: "Noise Suppression",
        default: true,
    },
    echoCancellation: {
        type: OptionType.BOOLEAN,
        description: "Echo Cancellation",
        default: true,
    },
    micId: {
        type: OptionType.STRING,
        description: "Microphone used for the last voice message.",
        default: "",
        hidden: true,
    },
});

const ctxMenuPatch: NavContextMenuPatchCallback = (children, props) => {
    if (props.channel.guild_id && !(PermissionStore.can(PermissionsBits.SEND_VOICE_MESSAGES, props.channel) && PermissionStore.can(PermissionsBits.SEND_MESSAGES, props.channel))) return;

    children.push(
        <Menu.MenuItem
            id="vc-send-vmsg"
            iconLeft={Microphone}
            leadingAccessory={{
                type: "icon",
                icon: Microphone
            }}
            label="Send Voice Message"
            action={() => openModal(modalProps => <VoiceMessageModal modalProps={modalProps} />)}
        />
    );
};

export default definePlugin({
    id: "VoiceMessages",
    name: "VoiceMessages",
    description: "Allows you to send voice messages like on mobile. To do so, right click the upload button and click Send Voice Message",
    tags: ["Voice"],
    authors: [Devs.Ven, Devs.Vap, Devs.Nickyux],
    // Built into HaloCord: always on and kept out of the plugin list.
    required: true,
    hidden: true,
    settings,

    contextMenus: {
        "channel-attach": ctxMenuPatch
    }
});

export function sendAudio(blob: Blob, meta: AudioMetadata) {
    const channelId = SelectedChannelStore.getChannelId();
    const reply = PendingReplyStore.getPendingReply(channelId);
    if (reply) FluxDispatcher.dispatch({ type: "DELETE_PENDING_REPLY", channelId });

    const upload = new CloudUploader({
        file: new File([blob], "voice-message.ogg", { type: "audio/ogg; codecs=opus" }),
        isThumbnail: false,
        platform: CloudUploadPlatform.WEB,
    }, channelId);

    upload.on("complete", () => {
        RestAPI.post({
            url: Constants.Endpoints.MESSAGES(channelId),
            body: {
                flags: VOICE_MESSAGE_FLAG | (silentMessageEnabled ? SILENT_MESSAGE_FLAG : 0),
                channel_id: channelId,
                content: "",
                nonce: SnowflakeUtils.fromTimestamp(Date.now()),
                sticker_ids: [],
                type: 0,
                attachments: [{
                    id: "0",
                    filename: upload.filename,
                    uploaded_filename: upload.uploadedFilename,
                    waveform: meta.waveform,
                    duration_secs: meta.duration,
                }],
                message_reference: reply ? MessageActions.getSendMessageOptionsForReply(reply)?.messageReference : null,
            }
        });
    });
    upload.on("error", () => showToast({ text: "Failed to upload voice message", variant: "critical" }));

    upload.upload();
}
