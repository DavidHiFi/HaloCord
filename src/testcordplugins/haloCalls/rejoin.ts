/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as DataStore from "@api/DataStore";
import { Logger } from "@utils/Logger";
import { VoiceState } from "@vencord/discord-types";
import { ChannelStore, FluxDispatcher, UserStore, VoiceStateStore } from "@webpack/common";

import { settings } from "./settings";

// Same keys VoiceRejoin used, so a call saved before the update still rejoins after it.
const LAST_CHANNEL_KEY = "VCLastVoiceChannel";
const IN_CALL_KEY = "VCLastVoiceChannelSession";
const logger = new Logger("HaloCalls");

interface SavedCall {
    guildId: string | null;
    channelId: string;
    timestamp: number;
}

const leftCall = () => DataStore.set(IN_CALL_KEY, false);

export function rememberCall({ voiceStates }: { voiceStates: VoiceState[]; }) {
    if (!settings.store.rejoin) return;
    const me = UserStore.getCurrentUser()?.id;
    const mine = me && voiceStates.find(s => s.userId === me);
    if (!mine) return;

    const write = mine.channelId
        ? Promise.all([
            DataStore.set(LAST_CHANNEL_KEY, { guildId: mine.guildId ?? null, channelId: mine.channelId, timestamp: Date.now() } satisfies SavedCall),
            DataStore.set(IN_CALL_KEY, true)
        ])
        : leftCall();
    write.catch(err => logger.error("Could not save the current call", err));
}

let rejoinTimer: ReturnType<typeof setTimeout> | undefined;

export function cancelRejoin() {
    clearTimeout(rejoinTimer);
    rejoinTimer = undefined;
}

export async function rejoinAfterRestart() {
    if (!settings.store.rejoin) return;
    if (await DataStore.get(IN_CALL_KEY) === false) {
        await DataStore.del(LAST_CHANNEL_KEY);
        return;
    }
    cancelRejoin();
    rejoinTimer = setTimeout(() => {
        rejoinTimer = undefined;
        rejoin().catch(err => logger.error("Could not rejoin the call", err));
    }, settings.store.rejoinDelay * 1000);
}

async function rejoin() {
    const saved = await DataStore.get<SavedCall>(LAST_CHANNEL_KEY);
    if (!saved?.channelId) return;

    let channel = ChannelStore.getChannel(saved.channelId);
    for (let i = 0; i < 20 && !channel; i++) {
        await new Promise(resolve => setTimeout(resolve, 250));
        channel = ChannelStore.getChannel(saved.channelId);
    }
    const me = UserStore.getCurrentUser()?.id;
    if (!channel || !me) return leftCall();

    const isDM = channel.isDM() || channel.isGroupDM() || channel.isMultiUserDM();
    const { rejoinTimeout, rejoinDmsOnly, rejoinSkip } = settings.store;
    if (Date.now() - saved.timestamp > rejoinTimeout * 1000) return leftCall();
    if (rejoinDmsOnly && !isDM) return leftCall();
    if (VoiceStateStore.getVoiceStateForUser(me)?.channelId) return leftCall();

    const skipEmpty = rejoinSkip === "both" || (rejoinSkip === "dms" && isDM) || (rejoinSkip === "servers" && !isDM);
    if (skipEmpty) {
        const states = VoiceStateStore.getVoiceStatesForChannel(saved.channelId) as Record<string, VoiceState>;
        if (!Object.values(states).some(s => s.userId !== me)) return leftCall();
    }

    FluxDispatcher.dispatch({ type: "VOICE_CHANNEL_SELECT", guildId: saved.guildId, channelId: saved.channelId });
}
