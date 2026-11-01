/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type { PipeEvent } from "./pipeServer";

let socketSeq = 0;

// Mirrors Discord's RPC socket base class, so its RPC server treats this exactly like its native IPC socket.
export class BridgeSocket {
    readonly source = { type: "ipc" };
    readonly encoding = "json";
    readonly id: string;
    authorization = { authing: false, scopes: new Set<string>(), accessToken: null as string | null, expires: new Date(0) };
    application = { id: null as string | null, name: null as string | null, icon: null as string | null };
    abortController = new AbortController();
    connected = false;
    closed = false;

    constructor(
        readonly pipeId: number,
        readonly clientId: string | null,
        readonly version: number,
        private readonly native: BridgeNative,
    ) {
        this.id = `streamdeck-ipc-${++socketSeq}`;
    }

    get transport() { return this.source.type; }

    checkRpcVersion(v: number) {
        if (v == null || v > 1 || v < 1) throw Object.assign(new Error(`Invalid Version: ${v}`), { code: 4004 });
    }

    send(payload: unknown) {
        if (this.closed) return;
        void this.native.send(this.pipeId, JSON.stringify(payload));
    }

    close(code: number, message: string) {
        if (this.closed) return;
        this.closed = true;
        void this.native.close(this.pipeId, code, message);
    }
}

export interface BridgeNative {
    send(id: number, json: string): unknown;
    close(id: number, code: number, message: string): unknown;
}

export interface BridgeOptions {
    native: BridgeNative;
    /** Discord's own per-connection check: sets scopes, rate limits, fetches the application. */
    validate(socket: BridgeSocket, origin: null, clientId: string | null): Promise<unknown>;
    /** Return true to answer a request yourself instead of passing it to Discord's RPC server. */
    intercept?(socket: BridgeSocket, payload: any): boolean;
}

type Listener = (...args: any[]) => void;

export function createBridge(opts: BridgeOptions) {
    const listeners: Record<string, Listener[]> = {};
    const sockets = new Map<number, BridgeSocket>();
    const pending = new Map<number, unknown[]>();

    const emit = (name: string, ...args: unknown[]) => {
        for (const fn of listeners[name] ?? []) fn(...args);
    };

    // What Discord's RPC server.registerTransport() expects: an emitter with connect/request/disconnect.
    const transport = {
        on(name: string, fn: Listener) {
            (listeners[name] ??= []).push(fn);
            return transport;
        },
    };

    function forward(socket: BridgeSocket, payload: unknown, skipIntercept = false) {
        try {
            if (!skipIntercept && opts.intercept?.(socket, payload)) return;
        } catch { }
        emit("request", socket, payload);
    }

    function connect(id: number, clientId: string | null, v: number) {
        const socket = new BridgeSocket(id, clientId, v, opts.native);
        sockets.set(id, socket);
        pending.set(id, []);
        opts.validate(socket, null, clientId).then(() => {
            if (socket.abortController.signal.aborted || socket.closed) return;
            socket.connected = true;
            emit("connect", socket);
            const queued = pending.get(id) ?? [];
            pending.delete(id);
            for (const payload of queued) forward(socket, payload);
        }, (err: { code?: number; message?: string; }) => {
            if (socket.abortController.signal.aborted) return;
            socket.close(err?.code ?? 1006, err?.message ?? "Validation failed");
        });
    }

    function disconnect(id: number, reason: string) {
        const socket = sockets.get(id);
        if (!socket) return;
        sockets.delete(id);
        pending.delete(id);
        socket.closed = true;
        socket.abortController.abort();
        // Discord reads reason.code; anything but 1000 opens its activity "Error {code}" dialog.
        if (socket.connected) emit("disconnect", socket, { code: 1000, message: reason });
    }

    return {
        transport,
        forward,
        sockets,
        handle(event: PipeEvent) {
            switch (event.t) {
                case "connect":
                    connect(event.id, event.clientId, event.v);
                    break;
                case "request": {
                    const socket = sockets.get(event.id);
                    if (!socket) break;
                    // Discord only listens for requests once validation finished; keep early ones in order.
                    const queue = pending.get(event.id);
                    if (queue) queue.push(event.payload);
                    else forward(socket, event.payload);
                    break;
                }
                case "disconnect":
                    disconnect(event.id, event.reason);
                    break;
            }
        },
        disconnectAll() {
            for (const [id, socket] of sockets) {
                socket.close(1000, "Stream Deck RPC stopped");
                disconnect(id, "plugin stopped");
            }
        },
    };
}

export type Bridge = ReturnType<typeof createBridge>;
