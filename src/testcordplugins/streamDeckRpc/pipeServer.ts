/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { createServer, type Server, type Socket } from "net";

// Wire format of Discord's desktop RPC IPC transport: uint32 LE opcode, uint32 LE length, JSON body.
export const enum Op { HANDSHAKE = 0, FRAME = 1, CLOSE = 2, PING = 3, PONG = 4 }

// Close codes Discord's IPC transport uses for transport-level failures.
const CLOSE_NORMAL = 1000;
const CLOSE_UNSUPPORTED = 1003;
const CLOSE_ABNORMAL = 1006;
const INVALID_VERSION = 4004;

const RPC_VERSION = 1;
const MAX_BUFFER = 5 * 1024 * 1024;
const MAX_MESSAGE = 3 * 1024 * 1024;
const HANDSHAKE_TIMEOUT_MS = 10_000;
const MAX_CONNECTIONS = 100;
const MAX_PIPE_INDEX = 9;

export type PipeEvent =
    | { t: "connect"; id: number; clientId: string | null; v: number; }
    | { t: "request"; id: number; payload: unknown; }
    | { t: "disconnect"; id: number; reason: string; };

export interface PipeServerOptions {
    /** Receives connection events in order, batched. Return false when nobody is listening so the sockets get closed. */
    deliver(events: PipeEvent[]): Promise<boolean> | boolean;
    log?(message: string): void;
    /** Override for tests. Defaults to \\?\pipe\discord-ipc-N. */
    pipePath?(index: number): string;
}

export function encodeFrame(op: Op, body: unknown, preEncoded = false) {
    const json = Buffer.from(preEncoded ? body as string : JSON.stringify(body));
    const header = Buffer.alloc(8);
    header.writeUInt32LE(op, 0);
    header.writeUInt32LE(json.length, 4);
    return Buffer.concat([header, json]);
}

interface Conn {
    id: number;
    socket: Socket;
    buffer: Buffer;
    handshaken: boolean;
    closed: boolean;
}

export function createPipeServer(opts: PipeServerOptions) {
    const log = opts.log ?? (() => { });
    const pipePath = opts.pipePath ?? (i => `\\\\?\\pipe\\discord-ipc-${i}`);
    const conns = new Map<number, Conn>();
    let server: Server | null = null;
    let path: string | null = null;
    let nextId = 1;
    let pending: PipeEvent[] = [];
    let draining = false;

    async function tryDeliver(batch: PipeEvent[]) {
        try { return await opts.deliver(batch); } catch { return null; }
    }

    // Events go out strictly in arrival order; a request must never overtake its connect. Whatever
    // queued while one round-trip was in flight goes in the next one, so a key press never waits
    // behind a backlog of channel updates.
    async function drain() {
        if (draining) return;
        draining = true;
        while (pending.length) {
            const batch = pending;
            pending = [];
            let ok = await tryDeliver(batch);
            // A throw is a busy or reloading page, not a missing listener: retry once before giving up.
            if (ok === null) {
                await new Promise(r => setTimeout(r, 250));
                ok = await tryDeliver(batch);
            }
            if (ok) continue;
            for (const event of batch) {
                if (event.t !== "disconnect") close(event.id, CLOSE_ABNORMAL, "Discord is not ready");
            }
        }
        draining = false;
    }

    function emit(_conn: Conn, event: PipeEvent) {
        pending.push(event);
        void drain();
    }

    function close(id: number, code: number, message: string) {
        const conn = conns.get(id);
        if (!conn || conn.closed) return;
        conn.closed = true;
        try { conn.socket.end(encodeFrame(Op.CLOSE, { code, message })); } catch { }
        setTimeout(() => conn.socket.destroy(), 250).unref?.();
    }

    // Takes JSON text: the renderer serializes, exactly like Discord's own IPC socket does.
    function send(id: number, json: string) {
        const conn = conns.get(id);
        if (!conn || conn.closed) return false;
        conn.socket.write(encodeFrame(Op.FRAME, json, true));
        return true;
    }

    function onMessage(conn: Conn, op: number, body: any) {
        switch (op) {
            case Op.PING:
                conn.socket.write(encodeFrame(Op.PONG, body));
                break;
            case Op.PONG:
                break;
            case Op.HANDSHAKE: {
                if (conn.handshaken) throw new Error("already did handshake");
                const v = Number(body?.v);
                if (v !== RPC_VERSION) {
                    close(conn.id, INVALID_VERSION, `Invalid Version: ${body?.v}`);
                    return;
                }
                conn.handshaken = true;
                const clientId = typeof body?.client_id === "string" ? body.client_id : null;
                log(`connection ${conn.id} handshake client_id=${clientId ?? "none"}`);
                emit(conn, { t: "connect", id: conn.id, clientId, v });
                break;
            }
            case Op.FRAME:
                if (!conn.handshaken) throw new Error("did not handshake");
                emit(conn, { t: "request", id: conn.id, payload: body });
                break;
            case Op.CLOSE:
                close(conn.id, CLOSE_NORMAL, "client disconnect");
                break;
        }
    }

    function read(conn: Conn, chunk: Buffer) {
        if (conn.buffer.length + chunk.length > MAX_BUFFER) throw new Error("total buffer size exceeded");
        conn.buffer = Buffer.concat([conn.buffer, chunk]);
        while (conn.buffer.length >= 8 && !conn.closed) {
            const op = conn.buffer.readUInt32LE(0);
            const size = conn.buffer.readUInt32LE(4);
            if (op > Op.PONG) throw new Error("protocol error");
            if (size > MAX_MESSAGE) throw new Error("message too large");
            if (conn.buffer.length < 8 + size) break;
            const body = JSON.parse(conn.buffer.subarray(8, 8 + size).toString("utf8"));
            conn.buffer = conn.buffer.subarray(8 + size);
            onMessage(conn, op, body);
        }
    }

    function accept(socket: Socket) {
        if (conns.size >= MAX_CONNECTIONS) {
            socket.end(encodeFrame(Op.CLOSE, { code: CLOSE_ABNORMAL, message: "Server at capacity" }));
            return;
        }
        const conn: Conn = { id: nextId++, socket, buffer: Buffer.alloc(0), handshaken: false, closed: false };
        conns.set(conn.id, conn);

        const timer = setTimeout(() => {
            if (!conn.handshaken) close(conn.id, CLOSE_ABNORMAL, "Handshake timeout");
        }, HANDSHAKE_TIMEOUT_MS);
        timer.unref?.();

        socket.on("data", chunk => {
            try {
                read(conn, Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
            } catch (e) {
                close(conn.id, CLOSE_UNSUPPORTED, (e as Error).message);
            }
        });
        socket.on("error", () => { });
        socket.on("close", () => {
            clearTimeout(timer);
            conns.delete(conn.id);
            conn.closed = true;
            if (conn.handshaken) emit(conn, { t: "disconnect", id: conn.id, reason: "socket closed" });
        });
    }

    // Same rule as Discord: take the first free discord-ipc-N, so a running stock client keeps index 0.
    function listenAt(index: number): Promise<string> {
        return new Promise((resolve, reject) => {
            if (index > MAX_PIPE_INDEX) return reject(new Error("no free discord-ipc pipe (0-9 all taken)"));
            const candidate = createServer(accept);
            const target = pipePath(index);
            candidate.once("error", (err: NodeJS.ErrnoException) => {
                candidate.close();
                if (err.code === "EADDRINUSE" || err.code === "EACCES") listenAt(index + 1).then(resolve, reject);
                else reject(err);
            });
            candidate.listen(target, () => {
                server = candidate;
                resolve(target);
            });
        });
    }

    return {
        async start() {
            if (server) return path!;
            path = await listenAt(0);
            log(`listening on ${path}`);
            return path;
        },
        stop() {
            for (const conn of conns.values()) {
                conn.closed = true;
                conn.socket.destroy();
            }
            conns.clear();
            server?.close();
            server = null;
            path = null;
        },
        send,
        close,
        get path() { return path; },
        get connectionCount() { return conns.size; },
    };
}

export type PipeServer = ReturnType<typeof createPipeServer>;
