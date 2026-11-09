/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as DataStore from "@api/DataStore";
import { Logger } from "@utils/Logger";
import { VoiceState } from "@vencord/discord-types";
import { ChannelStore, FluxDispatcher, SelectedChannelStore, UserStore, VoiceStateStore } from "@webpack/common";

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

const saveCall = (guildId: string | null, channelId: string) => Promise.all([
    DataStore.set(LAST_CHANNEL_KEY, { guildId, channelId, timestamp: Date.now() } satisfies SavedCall),
    DataStore.set(IN_CALL_KEY, true)
]).catch(err => logger.error("Could not save the current call", err));

// Bumped on stop, so a rejoin that is still waiting gives up instead of acting after the plugin stopped.
let generation = 0;
let rejoinTimer: ReturnType<typeof setTimeout> | undefined;
// "Give up after" counts from when the call was last seen. Voice updates alone left the timestamp
// hours old in a quiet call, so a restart skipped the rejoin; this keeps it fresh while in a call.
let heartbeat: ReturnType<typeof setInterval> | undefined;

// A page reload drops the call: HaloCord's watchdog reloads a page that hung or crashed, and Ctrl+R does
// too. The call is kept in this window's session storage, which a reload keeps and a restart clears, so
// the reloaded page goes straight back in, whatever the rejoin setting says. 2 minutes covers a hang
// (30 s) plus a slow reload.
const RELOAD_KEY = "hc-call-before-reload";
const RELOAD_FRESH_MS = 120_000;
let reloadBeat: ReturnType<typeof setInterval> | undefined;

function keepForReload(call: { guildId: string | null; channelId: string; } | null) {
    clearInterval(reloadBeat);
    reloadBeat = undefined;
    const write = () => { try { sessionStorage.setItem(RELOAD_KEY, JSON.stringify({ ...call, timestamp: Date.now() })); } catch { } };
    if (!call) { try { sessionStorage.removeItem(RELOAD_KEY); } catch { } return; }
    write();
    reloadBeat = setInterval(write, 10_000);
}

let reloadChecked = false;
async function rejoinAfterReload() {
    if (reloadChecked) return;
    reloadChecked = true;
    let saved: SavedCall | null = null;
    try { saved = JSON.parse(sessionStorage.getItem(RELOAD_KEY) ?? "null"); } catch { }
    try { sessionStorage.removeItem(RELOAD_KEY); } catch { }
    if (!saved?.channelId || Date.now() - saved.timestamp > RELOAD_FRESH_MS) return;
    for (let i = 0; i < 40 && !ChannelStore.getChannel(saved.channelId); i++) await new Promise(resolve => setTimeout(resolve, 250));
    // The server can still list the old voice session for a moment, so ask the client whether it is in a call.
    if (!ChannelStore.getChannel(saved.channelId) || SelectedChannelStore.getVoiceChannelId()) return;
    logger.info("Back in the call after a page reload");
    FluxDispatcher.dispatch({ type: "VOICE_CHANNEL_SELECT", guildId: saved.guildId, channelId: saved.channelId });
}

export function rememberCall({ voiceStates }: { voiceStates: VoiceState[]; }) {
    const me = UserStore.getCurrentUser()?.id;
    const mine = me && voiceStates.find(s => s.userId === me);
    if (!mine) return;
    // Only a call this window is in: Discord selects the channel here before the server confirms it.
    const selected = SelectedChannelStore.getVoiceChannelId();
    if (mine.channelId && mine.channelId === selected) keepForReload({ guildId: mine.guildId ?? null, channelId: mine.channelId });
    else if (!selected) keepForReload(null);
    if (!settings.store.rejoin) return;

    clearInterval(heartbeat);
    heartbeat = undefined;
    if (!mine.channelId) {
        leftCall().catch(err => logger.error("Could not save the current call", err));
        return;
    }
    const { guildId = null, channelId } = mine;
    saveCall(guildId, channelId);
    heartbeat = setInterval(() => {
        if (settings.store.rejoin) saveCall(guildId, channelId);
    }, 10_000);
}

export function cancelRejoin() {
    generation++;
    clearInterval(reloadBeat);
    reloadBeat = undefined;
    clearTimeout(rejoinTimer);
    clearInterval(heartbeat);
    rejoinTimer = heartbeat = undefined;
}

export async function rejoinAfterRestart() {
    await rejoinAfterReload();
    if (!settings.store.rejoin) return;
    const run = generation;
    if (await DataStore.get(IN_CALL_KEY) === false) {
        await DataStore.del(LAST_CHANNEL_KEY);
        return;
    }
    if (run !== generation) return;
    clearTimeout(rejoinTimer);
    rejoinTimer = setTimeout(() => {
        rejoinTimer = undefined;
        rejoin(run).catch(err => logger.error("Could not rejoin the call", err));
    }, settings.store.rejoinDelay * 1000);
}

async function rejoin(run: number) {
    const live = () => run === generation && settings.store.rejoin;
    const saved = await DataStore.get<SavedCall>(LAST_CHANNEL_KEY);
    if (!saved?.channelId || !live()) return;

    let channel = ChannelStore.getChannel(saved.channelId);
    for (let i = 0; i < 20 && !channel; i++) {
        await new Promise(resolve => setTimeout(resolve, 250));
        if (!live()) return;
        channel = ChannelStore.getChannel(saved.channelId);
    }
    const me = UserStore.getCurrentUser()?.id;
    if (!channel || !me) return leftCall();
    // CONNECTION_OPEN also fires when the gateway reconnects mid-call: nothing to do, and the call is still on.
    if (VoiceStateStore.getVoiceStateForUser(me)?.channelId) return;

    const isDM = channel.isDM() || channel.isGroupDM() || channel.isMultiUserDM();
    const { rejoinTimeout, rejoinDmsOnly, rejoinSkip } = settings.store;
    if (Date.now() - saved.timestamp > rejoinTimeout * 1000) return leftCall();
    if (rejoinDmsOnly && !isDM) return leftCall();

    const skipEmpty = rejoinSkip === "both" || (rejoinSkip === "dms" && isDM) || (rejoinSkip === "servers" && !isDM);
    if (skipEmpty) {
        const states = VoiceStateStore.getVoiceStatesForChannel(saved.channelId) as Record<string, VoiceState>;
        if (!Object.values(states).some(s => s.userId !== me)) return leftCall();
    }

    FluxDispatcher.dispatch({ type: "VOICE_CHANNEL_SELECT", guildId: saved.guildId, channelId: saved.channelId });
}
