/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { app, BrowserWindow } from "electron";
import { createServer, IncomingMessage, ServerResponse } from "http";

const HOST = "127.0.0.1";
const PORT = 47830;
const KINDS = ["enabled", "mute", "deafen", "camera", "stream", "game", "cutmic"];
const NOT_LOADED = { ok: false, error: "FakeVoice is not loaded in the Discord renderer" };

async function callRenderer(call: string): Promise<string | null> {
    for (const win of BrowserWindow.getAllWindows()) {
        if (win.isDestroyed()) continue;
        try {
            const result = await win.webContents.executeJavaScript(`window.__fakeVoice ? JSON.stringify(window.__fakeVoice.${call}) : null`, true);
            if (typeof result === "string") return result;
        } catch { }
    }
    return null;
}

function send(res: ServerResponse, status: number, body: unknown) {
    const json = JSON.stringify(body);
    res.writeHead(status, {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Length": Buffer.byteLength(json),
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store"
    });
    res.end(json);
}

async function handleRequest(req: IncomingMessage, res: ServerResponse) {
    const path = new URL(req.url ?? "/", `http://${HOST}:${PORT}`).pathname.replace(/\/+$/, "");

    if (path === "/fakevoice/ping") return send(res, 200, { ok: true, plugin: "FakeVoice", port: PORT });

    const toggle = /^\/fakevoice\/toggle\/([a-z]+)$/.exec(path);
    const set = /^\/fakevoice\/set\/([a-z]+)\/([01])$/.exec(path);
    const kind = toggle?.[1] ?? set?.[1];
    if (kind && !KINDS.includes(kind)) return send(res, 400, { ok: false, error: `Unknown fake state "${kind}"` });

    let call: string;
    if (path === "/fakevoice/state") call = "state()";
    else if (toggle) call = `toggle(${JSON.stringify(kind)})`;
    else if (set) call = `set(${JSON.stringify(kind)}, ${set[2] === "1"})`;
    else return send(res, 404, { ok: false, error: `No route for ${path}` });

    const raw = await callRenderer(call);
    if (raw === null) return send(res, 503, NOT_LOADED);

    const state = JSON.parse(raw);
    send(res, 200, path === "/fakevoice/state" ? state : { ok: true, kind, state });
}

const server = createServer((req, res) => {
    handleRequest(req, res).catch(err => {
        console.error("[FakeVoice][bridge]", err);
        send(res, 500, { ok: false, error: "Internal bridge error" });
    });
});
server.on("error", err => console.error("[FakeVoice][bridge] server error on", `${HOST}:${PORT}`, err));
server.listen(PORT, HOST);

app.on("before-quit", () => server.close());
