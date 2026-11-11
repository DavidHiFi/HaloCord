/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { desktopCapturer, type IpcMainInvokeEvent, screen, type WebContents } from "electron";
import { createServer, type IncomingMessage, type Server, type ServerResponse } from "http";

const BRIDGE = "__screenShareDeck";
const PORT = 47831;
const LAYOUT_TTL = 5_000;

let target: WebContents | null = null;
let server: Server | null = null;

interface SlotScreen { slot: number; id: string; name: string; thumb?: string; }

let layout: SlotScreen[] | null = null;
let layoutAt = 0;

// Slot 1 is the leftmost display, 2 the primary (middle) one, 3 the rightmost and 4 the highest.
// Each capture source names the Electron display it shows, so the mapping needs no guessing.
async function readLayout(thumbs: boolean): Promise<SlotScreen[]> {
    const size = thumbs ? { width: 288, height: 162 } : { width: 0, height: 0 };
    const sources = await desktopCapturer.getSources({ types: ["screen"], thumbnailSize: size });
    const displays = screen.getAllDisplays();
    const primary = screen.getPrimaryDisplay();
    const rest = displays.filter(d => d.id !== primary.id);
    const pick: Record<number, number | undefined> = { 2: primary.id };
    if (rest.length) {
        pick[1] = rest.reduce((a, b) => (b.bounds.x < a.bounds.x ? b : a)).id;
        pick[3] = rest.reduce((a, b) => (b.bounds.x > a.bounds.x ? b : a)).id;
        pick[4] = rest.reduce((a, b) => (b.bounds.y < a.bounds.y ? b : a)).id;
    }
    const out: SlotScreen[] = [];
    for (const slot of [1, 2, 3, 4]) {
        const src = sources.find(s => s.display_id === String(pick[slot]));
        if (src) out.push({ slot, id: src.id, name: src.name, thumb: thumbs ? src.thumbnail.toDataURL() : undefined });
    }
    layout = out.map(({ thumb, ...s }) => s);
    layoutAt = Date.now();
    return out;
}

async function currentLayout() {
    if (layout && Date.now() - layoutAt < LAYOUT_TTL) return layout;
    return readLayout(false);
}

let watching = false;
function watchDisplays() {
    if (watching) return;
    watching = true;
    const drop = () => { layout = null; };
    screen.on("display-added", drop);
    screen.on("display-removed", drop);
    screen.on("display-metrics-changed", drop);
}

// The page owns the stream; main only shuttles between the deck and the renderer.
async function ask(cmd: unknown): Promise<unknown> {
    const wc = target;
    if (!wc || wc.isDestroyed()) return null;
    const script = `(window.${BRIDGE} && typeof window.${BRIDGE}.handle === "function" ? window.${BRIDGE}.handle(${JSON.stringify(cmd)}) : null)`;
    return await wc.executeJavaScript(script);
}

function reply(res: ServerResponse, status: number, body: unknown) {
    res.writeHead(status, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
    res.end(JSON.stringify(body));
}

const NOT_RUNNING = { ok: false, error: "Screen Share Deck is not running" };

async function route(req: IncomingMessage, res: ServerResponse) {
    const url = new URL(req.url ?? "/", "http://127.0.0.1");
    if (req.method !== "GET") return reply(res, 405, { ok: false, error: "GET only" });

    if (url.pathname === "/ping") return reply(res, 200, { ok: true, port: PORT });

    if (url.pathname === "/state") {
        const [slots, page] = await Promise.all([currentLayout(), ask({ type: "state" })]);
        if (!page || typeof page !== "object") return reply(res, 503, NOT_RUNNING);
        const s = page as { ok?: boolean; inCall?: boolean; streaming?: boolean; activeScreen?: string | null; };
        if (!s.ok) return reply(res, 200, s);
        return reply(res, 200, {
            ok: true, inCall: s.inCall === true, streaming: s.streaming === true,
            slots: [1, 2, 3, 4].map(slot => {
                const hit = slots.find(x => x.slot === slot);
                return { slot, device: hit ? slot : null, name: hit?.name ?? null, active: !!hit && s.streaming === true && hit.id === s.activeScreen };
            })
        });
    }

    if (url.pathname === "/thumbs") {
        const slots = await readLayout(true);
        return reply(res, 200, {
            ok: true,
            slots: [1, 2, 3, 4].map(slot => {
                const hit = slots.find(x => x.slot === slot);
                return { slot, name: hit?.name ?? null, thumb: hit?.thumb ?? null };
            })
        });
    }

    const toggleMatch = url.pathname.match(/^\/toggle\/([1-4])$/);
    if (toggleMatch) {
        const hit = (await currentLayout()).find(x => x.slot === Number(toggleMatch[1]));
        if (!hit) return reply(res, 200, { ok: false, error: "No display matches this slot" });
        const page = await ask({ type: "toggle", screenId: hit.id, name: hit.name });
        return reply(res, page ? 200 : 503, page ?? NOT_RUNNING);
    }

    return reply(res, 404, { ok: false, error: "Not found" });
}

export async function start(event: IpcMainInvokeEvent): Promise<{ ok: boolean; port?: number; error?: string; }> {
    const { sender } = event;
    watchDisplays();
    if (target && target !== sender && !target.isDestroyed()) {
        return { ok: false, error: "another window already owns the Screen Share Deck bridge" };
    }

    if (target !== sender) {
        target = sender;
        sender.once("destroyed", () => {
            if (target === sender) stop();
        });
    }

    if (!server) {
        const candidate = createServer((req, res) => {
            route(req, res).catch(e => {
                try { reply(res, 500, { ok: false, error: String((e as Error)?.message ?? e) }); } catch { }
            });
        });
        candidate.on("error", () => { });
        try {
            await new Promise<void>((resolve, reject) => {
                candidate.once("error", reject);
                candidate.listen(PORT, "127.0.0.1", () => resolve());
            });
        } catch (e) {
            return { ok: false, error: (e as Error).message };
        }
        server = candidate;
    }
    return { ok: true, port: PORT };
}

export function stop() {
    target = null;
    server?.close();
    server = null;
}
