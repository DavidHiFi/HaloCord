/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { TestcordDevs } from "@utils/constants";
import { Logger } from "@utils/Logger";
import definePlugin, { PluginNative } from "@utils/types";
import { filters, mapMangledModuleLazy } from "@webpack";
import { ChannelStore, PermissionsBits, PermissionStore, RestAPI, showToast, Toasts } from "@webpack/common";

import type { PipeEvent } from "./pipeServer";
import { type BridgeSocket, createBridge } from "./transport";

const Native = VencordNative.pluginHelpers.StreamDeckRpc as PluginNative<typeof import("./native")> | undefined;
const logger = new Logger("StreamDeckRpc");

// Client id of the official Elgato "Discord" Stream Deck plugin (ESDDiscord.exe handshake).
const ELGATO_CLIENT_ID = "1224385725949284403";
const BRIDGE = "__streamDeckRpcBridge";

// The web build ships Discord's whole RPC server with every command and event handler; only the
// native IPC transport is missing. Both modules are required by id, so they load even if idle.
const { server } = mapMangledModuleLazy('"RPC_STORE_WAIT"', {
    server: filters.byProps("registerTransport", "dispatchToSubscriptions", "handleRequest"),
});
const { validateSocket } = mapMangledModuleLazy('"No Client ID Specified"', {
    validateSocket: filters.byCode("No Client ID Specified"),
});
// Discord's own GET_CHANNEL reply builder: (channel, includeMessages, fetchMessages).
const { channelPayload } = mapMangledModuleLazy("user_limit:e.userLimit", {
    channelPayload: filters.byCode("user_limit:", "voice_states:", "whenReady"),
});

function authorizeElgato(socket: BridgeSocket, payload: any) {
    const { args = {}, nonce } = payload;
    const scope = Array.isArray(args.scopes) ? args.scopes : Array.isArray(args.scope) ? args.scope
        : String(args.scopes || args.scope || "").split(" ").filter(Boolean);

    socket.authorization.authing = true;
    RestAPI.post({
        url: "/oauth2/authorize",
        query: { client_id: ELGATO_CLIENT_ID, response_type: "code", scope: scope.join(" ") },
        body: { authorize: true, permissions: "0", integration_type: 0 },
    }).then(res => {
        const code = new URL(res.body.location).searchParams.get("code");
        if (!code) throw new Error("no code in authorize response");
        socket.authorization.authing = false;
        socket.send({ cmd: "AUTHORIZE", data: { code }, evt: null, nonce });
        showToast("Stream Deck connected", Toasts.Type.SUCCESS);
    }).catch(err => {
        // Fall back to Discord's own consent dialog, the stock desktop behaviour.
        logger.warn("Silent Stream Deck authorize failed, showing Discord's dialog:", err?.status ?? err?.message);
        socket.authorization.authing = false;
        if (!socket.closed) bridge.forward(socket, payload, true);
    });
    return true;
}

// Discord's GET_CHANNEL waits for a 30-message fetch before it replies. For a channel the user can't
// view (shown by ShowHiddenChannels) that fetch never finishes, so the reply never came and the
// Elgato plugin piled up unanswered requests. Answer those with Discord's own builder, no fetch:
// what its scoped GET_CHANNEL path does, and what the desktop app returns for them.
function answerHiddenChannel(socket: BridgeSocket, payload: any) {
    const { nonce, args } = payload;
    if (!nonce || socket.authorization.accessToken == null) return false;
    const channel = ChannelStore.getChannel(args?.channel_id);
    if (!channel?.guild_id || PermissionStore.can(PermissionsBits.VIEW_CHANNEL, channel)) return false;
    Promise.resolve(channelPayload(channel, false, false)).then(
        data => socket.send({ cmd: "GET_CHANNEL", data, evt: null, nonce }),
        err => {
            logger.warn("Hidden channel reply failed, passing to Discord:", err?.message);
            if (!socket.closed) bridge.forward(socket, payload, true);
        },
    );
    return true;
}

// Only the Elgato plugin gets a silent AUTHORIZE. Every other client goes through Discord's own
// OAuth2 dialog, exactly like the desktop app.
function intercept(socket: BridgeSocket, payload: any) {
    if (payload?.cmd === "GET_CHANNEL") return answerHiddenChannel(socket, payload);
    if (payload?.cmd !== "AUTHORIZE") return false;
    if (socket.clientId !== ELGATO_CLIENT_ID || payload.args?.client_id !== ELGATO_CLIENT_ID) return false;
    if (socket.application.id !== ELGATO_CLIENT_ID || !payload.nonce) return false;
    if (socket.authorization.accessToken != null || socket.authorization.authing) return false;
    return authorizeElgato(socket, payload);
}

const bridge = createBridge({
    native: {
        send: (id, json) => Native?.send(id, json),
        close: (id, code, message) => Native?.close(id, code, message),
    },
    validate: (socket, origin, clientId) => validateSocket(socket, origin, clientId),
    intercept,
});

let registered = false;

export default definePlugin({
    name: "StreamDeckRpc",
    description: "Runs Discord's RPC pipe (discord-ipc-0) so the Elgato Stream Deck Discord plugin works: mute, deafen, push to talk, volume, channels, soundboard, camera and screen share.",
    authors: [TestcordDevs.DavidHiFi],
    required: true,
    enabledByDefault: true,

    async start() {
        if (!Native) return logger.warn("No native helper (web build), Stream Deck RPC is unavailable");

        if (!registered) {
            try {
                // Registered once per page: Discord's server has no way to unregister a transport.
                server.registerTransport(bridge.transport);
                registered = true;
            } catch (e) {
                return logger.error("Discord's RPC server was not found; Stream Deck RPC is off", e);
            }
        }

        // Main sends events in batches, in arrival order. One bad event must not drop the rest.
        (window as any)[BRIDGE] = (events: PipeEvent[]) => {
            for (const event of events) {
                try { bridge.handle(event); } catch (e) { logger.error("Stream Deck event failed", e); }
            }
        };
        const res = await Native.start();
        if (res.ok) logger.info(`Listening on ${res.path}`);
        else logger.error(`Could not open the RPC pipe: ${res.error}`);
    },

    stop() {
        bridge.disconnectAll();
        delete (window as any)[BRIDGE];
        void Native?.stop();
    },
});
