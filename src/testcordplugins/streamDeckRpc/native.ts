/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type { IpcMainInvokeEvent, WebContents } from "electron";

import { createPipeServer, type PipeEvent, type PipeServer } from "./pipeServer";

const BRIDGE = "__streamDeckRpcBridge";

let target: WebContents | null = null;
let pipe: PipeServer | null = null;

// Main only moves frames. Every command runs in the renderer, inside Discord's own RPC server.
async function deliver(event: PipeEvent) {
    const wc = target;
    if (!wc || wc.isDestroyed()) return false;
    const script = `(typeof window.${BRIDGE} === "function" ? (window.${BRIDGE}(${JSON.stringify(event)}), true) : false)`;
    return await wc.executeJavaScript(script) === true;
}

export async function start(event: IpcMainInvokeEvent): Promise<{ ok: boolean; path?: string; error?: string; }> {
    const { sender } = event;
    if (target && target !== sender && !target.isDestroyed()) {
        return { ok: false, error: "another window already owns the Stream Deck RPC pipe" };
    }

    if (target !== sender) {
        target = sender;
        sender.once("destroyed", () => {
            if (target === sender) stop();
        });
    } else {
        // Page reload: the renderer lost every RPC socket, so drop the pipe connections too.
        pipe?.stop();
    }

    pipe ??= createPipeServer({ deliver, log: m => console.log(`[StreamDeckRpc] ${m}`) });
    try {
        return { ok: true, path: await pipe.start() };
    } catch (e) {
        return { ok: false, error: (e as Error).message };
    }
}

export function stop() {
    target = null;
    pipe?.stop();
    pipe = null;
}

export function send(event: IpcMainInvokeEvent, id: number, json: string) {
    if (event.sender !== target || typeof json !== "string") return false;
    return pipe?.send(id, json) ?? false;
}

export function close(event: IpcMainInvokeEvent, id: number, code: number, message: string) {
    if (event.sender !== target) return;
    pipe?.close(id, code, message);
}
