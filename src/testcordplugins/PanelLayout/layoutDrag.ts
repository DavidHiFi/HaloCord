/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { getBtnLabelWithCallButtons, getCanonicalLabel, S } from "./modules/buttonDetection";

export type LayoutSection = "account" | "actions" | "plugins" | "name";
export type ButtonLayout = Record<string, { s: LayoutSection; i: number; }>;

export interface LayoutDragApi {
    getLayout(): ButtonLayout;
    setLayout(layout: ButtonLayout): void;
    isLocked(): boolean;
    getOrderBase(): number;
    getGap(): number;
    /** True when buttons can sit in their own row beside the username (the "All Buttons Top" layout). */
    wantsNameRow(): boolean;
}

interface Drop {
    section: LayoutSection;
    index: number;
}

interface Hosts {
    panels: HTMLElement;
    account: HTMLElement | null;
    actions: HTMLElement | null;
    plugins: HTMLElement | null;
    name: HTMLElement | null;
}

const PANELS = 'section[class*="panels_"]';
const KEY = "data-hc-ua-key";
const ROW = "hc-ua-row";
const NAME = "hc-ua-name";
const STYLE_ID = "hc-ua-layout-style";
const HOLD_MS = 250;
const MOVE_PX = 4;
const SECTIONS: LayoutSection[] = ["account", "actions", "plugins", "name"];

let api: LayoutDragApi | null = null;
let observer: MutationObserver | null = null;
let observed: HTMLElement | null = null;
let poll = 0;
let frame = 0;
let lastCss = "";

const moved = new Map<HTMLElement, { home: HTMLElement; mark: Comment; }>();

let pending: { el: HTMLElement; id: number; x: number; y: number; timer: number; } | null = null;
let drag: { el: HTMLElement; id: number; ghost: HTMLElement; dx: number; dy: number; drop: Drop | null; } | null = null;
let marker: HTMLElement | null = null;

function getHosts(createRow: boolean): Hosts | null {
    const panels = document.querySelector<HTMLElement>(PANELS);
    if (!panels) return null;
    let plugins = panels.querySelector<HTMLElement>(`:scope > .${ROW}`);
    if (!plugins && createRow) {
        plugins = document.createElement("div");
        plugins.className = `${S.panelButtons.slice(1)} ${ROW}`;
        panels.appendChild(plugins);
    }
    const container = panels.querySelector<HTMLElement>(S.panelContainer);
    let name = container?.querySelector<HTMLElement>(`:scope > .${NAME}`) ?? null;
    if (!name && container && api?.wantsNameRow()) {
        name = document.createElement("div");
        name.className = `${S.panelButtons.slice(1)} ${NAME}`;
        container.appendChild(name);
    }
    return {
        panels,
        account: panels.querySelector<HTMLElement>(`${S.panelButtons}:not(.${ROW}):not(.${NAME})`),
        actions: panels.querySelector<HTMLElement>(S.callControls),
        plugins,
        name,
    };
}

function keyOf(el: HTMLElement) {
    const raw = getBtnLabelWithCallButtons(el);
    return raw ? getCanonicalLabel(raw) : null;
}

function keyedChildren(host: HTMLElement | null) {
    if (!host) return [];
    return Array.from(host.children).filter((c): c is HTMLElement => c instanceof HTMLElement && c.hasAttribute(KEY));
}

function orderOf(el: HTMLElement) {
    return Number(getComputedStyle(el).order) || 0;
}

function guard(parent: HTMLElement) {
    if (Object.prototype.hasOwnProperty.call(parent, "removeChild")) return;
    Object.defineProperty(parent, "removeChild", {
        configurable: true,
        writable: true,
        value: function (this: Node, child: Node) {
            if (!(child instanceof HTMLElement) || !moved.has(child)) return Node.prototype.removeChild.call(this, child);
            forget(child);
            child.remove();
            return child;
        }
    });
    Object.defineProperty(parent, "insertBefore", {
        configurable: true,
        writable: true,
        value: function (this: Node, node: Node, ref: Node | null) {
            const rec = ref instanceof HTMLElement ? moved.get(ref) : undefined;
            return Node.prototype.insertBefore.call(this, node, rec ? rec.mark : ref);
        }
    });
}

function unguard(home: HTMLElement) {
    for (const rec of moved.values()) if (rec.home === home) return;
    Reflect.deleteProperty(home, "removeChild");
    Reflect.deleteProperty(home, "insertBefore");
}

function forget(el: HTMLElement) {
    const rec = moved.get(el);
    if (!rec) return;
    rec.mark.remove();
    moved.delete(el);
    unguard(rec.home);
}

function moveTo(el: HTMLElement, host: HTMLElement) {
    if (el.parentElement === host) return;
    const rec = moved.get(el);
    if (!rec) {
        const home = el.parentElement;
        if (!home) return;
        const mark = document.createComment("hc-ua");
        home.insertBefore(mark, el);
        guard(home);
        moved.set(el, { home, mark });
        host.appendChild(el);
    } else if (rec.home === host) {
        host.insertBefore(el, rec.mark);
        forget(el);
    } else {
        host.appendChild(el);
    }
}

function restoreAll() {
    for (const [el, rec] of Array.from(moved)) {
        if (rec.mark.isConnected) rec.mark.before(el);
        else el.remove();
        forget(el);
    }
}

function buildCss(layout: ButtonLayout, gap: number, base: number) {
    const rules = Object.entries(layout).map(([key, { s, i }]) => {
        const q = JSON.stringify(key);
        const sel = `[${KEY}=${q}]`;
        return `html body ${PANELS} ${sel}${sel}${sel} { order: ${(s === "account" || s === "name" ? base : 0) + i * 10} !important; }`;
    });
    return `
${PANELS} > .${ROW} { display: flex !important; flex-wrap: wrap !important; align-items: center !important; flex-direction: row !important; gap: ${gap}px !important; padding: 6px 8px !important; box-sizing: border-box; flex-shrink: 0; width: auto !important; height: auto !important; }
${PANELS} > .${ROW}:empty { display: none !important; }
html[data-hc-ua-unlocked] ${PANELS} > .${ROW}:empty { display: flex !important; min-height: 40px; outline: 1px dashed rgb(203 166 247 / 60%); outline-offset: -3px; border-radius: 8px; justify-content: center; }
html[data-hc-ua-unlocked] ${PANELS} > .${ROW}:empty::before { content: "Drop buttons here"; font-size: 12px; color: var(--text-muted, #a6adc8); }
html[data-hc-ua-unlocked] ${PANELS} [${KEY}] { outline: 1px dashed rgb(137 180 250 / 65%); outline-offset: 1px; border-radius: 8px; cursor: grab; }
html body ${PANELS} ${S.panelContainer} > .${NAME}.${NAME} { display: flex !important; flex-direction: row !important; flex-wrap: nowrap !important; align-items: center !important; justify-content: flex-end !important; gap: ${gap}px !important; order: 4 !important; flex: 0 0 auto !important; width: auto !important; height: auto !important; min-width: 0 !important; margin: 0 !important; padding: 0 0 0 ${gap}px !important; grid-template-columns: none !important; }
html body ${PANELS} ${S.panelContainer} > .${NAME}.${NAME}::before, html body ${PANELS} ${S.panelContainer} > .${NAME}.${NAME}::after { content: none !important; display: none !important; }
html body ${PANELS} ${S.panelContainer} > .${NAME}.${NAME}:empty { display: none !important; }
html[data-hc-ua-unlocked] body ${PANELS} ${S.panelContainer} > .${NAME}.${NAME}:empty { display: flex !important; min-width: 40px; min-height: 32px; outline: 1px dashed rgb(203 166 247 / 60%); outline-offset: -3px; border-radius: 8px; justify-content: center !important; margin-left: ${gap}px !important; padding: 0 !important; }
html[data-hc-ua-unlocked] body ${PANELS} ${S.panelContainer} > .${NAME}.${NAME}:empty::before { content: "+" !important; display: block !important; font-size: 14px; color: var(--text-muted, #a6adc8); }
${PANELS} [data-hc-ua-dragging] { opacity: 0.3; }
html[data-hc-ua-drag], html[data-hc-ua-drag] * { cursor: grabbing !important; user-select: none !important; }
.hc-ua-ghost { position: fixed; z-index: 2147483000; pointer-events: none; margin: 0 !important; display: flex; align-items: center; justify-content: center; box-sizing: border-box; border-radius: 8px; opacity: 0.92; color: var(--interactive-icon-active, #cdd6f4); background: rgb(var(--hc-accent-rgb, 137 180 250) / 22%); outline: 1px solid var(--hc-accent, #89b4fa); box-shadow: 0 6px 18px rgb(0 0 0 / 40%); transform: scale(1.08); }
.hc-ua-marker { position: fixed; z-index: 2147483001; pointer-events: none; border-radius: 1px; background: var(--hc-gradient, linear-gradient(#89b4fa, #cba6f7)); }
${rules.join("\n")}`;
}

export function syncLayout() {
    frame = 0;
    if (!api) return;
    const layout = api.getLayout();
    const unlocked = !api.isLocked();
    // The spare row sits above the version banner, so it only shows when a saved layout already uses it;
    // unlocking no longer offers an empty drop zone up there.
    const wantRow = Object.values(layout).some(e => e.s === "plugins");
    if (!api.wantsNameRow()) dropNameRow();
    const found = getHosts(wantRow);
    document.documentElement.toggleAttribute("data-hc-ua-unlocked", unlocked);

    let style = document.getElementById(STYLE_ID);
    const css = buildCss(layout, api.getGap(), api.getOrderBase());
    if (!style) {
        style = document.createElement("style");
        style.id = STYLE_ID;
        document.head.appendChild(style);
        lastCss = "";
    }
    if (css !== lastCss) {
        style.textContent = css;
        lastCss = css;
    }
    if (!found) return;

    for (const [el, rec] of Array.from(moved)) {
        if (rec.mark.isConnected) {
            if (el.isConnected) continue;
            rec.mark.before(el);
        } else el.remove();
        forget(el);
    }

    const hosts: Record<LayoutSection, HTMLElement | null> = found;
    for (const host of [found.account, found.actions, found.plugins, found.name]) {
        if (!host) continue;
        for (const el of Array.from(host.children)) {
            if (!(el instanceof HTMLElement)) continue;
            const key = keyOf(el);
            if (key && el.getAttribute(KEY) !== key) el.setAttribute(KEY, key);
        }
    }

    for (const el of [...keyedChildren(found.account), ...keyedChildren(found.actions), ...keyedChildren(found.plugins), ...keyedChildren(found.name)]) {
        const entry = layout[el.getAttribute(KEY) ?? ""];
        const rec = moved.get(el);
        const host = entry ? hosts[entry.s] : null;
        if (host) moveTo(el, host);
        else if (rec) moveTo(el, rec.home);
    }

    if (found.plugins) {
        if (!wantRow || (!unlocked && found.plugins.childElementCount === 0)) found.plugins.remove();
        else {
            const accountPanel = found.panels.querySelector<HTMLElement>(`:scope > ${S.panelContainer}`);
            found.plugins.style.order = String((accountPanel ? orderOf(accountPanel) : 0) - 1);
        }
    }
}

// Leaving "All Buttons Top" sends every button in the name row back to where Discord put it, then drops the row.
function dropNameRow() {
    const row = document.querySelector<HTMLElement>(`${PANELS} ${S.panelContainer} > .${NAME}`);
    if (!row) return;
    for (const el of Array.from(row.children)) {
        const rec = el instanceof HTMLElement ? moved.get(el) : undefined;
        if (el instanceof HTMLElement && rec) moveTo(el, rec.home);
    }
    row.remove();
}

function queueSync() {
    if (!frame) frame = requestAnimationFrame(syncLayout);
}

function watchPanels() {
    const panels = document.querySelector<HTMLElement>(PANELS);
    if (panels === observed) return;
    observer?.disconnect();
    observed = panels;
    if (panels) observer?.observe(panels, { childList: true, subtree: true });
    queueSync();
}

function findDraggable(target: Element) {
    for (let n: Element | null = target; n?.parentElement; n = n.parentElement) {
        if (n.hasAttribute(KEY) && n.parentElement.matches(`${S.panelButtons}, ${S.callControls}`) && n.parentElement.closest(PANELS)) {
            return n as HTMLElement;
        }
    }
    return null;
}

function flatten(host: HTMLElement, list: HTMLElement[]) {
    const r = host.getBoundingClientRect();
    if (r.width > 0 || r.height > 0 || getComputedStyle(host).display !== "contents") return r;
    const rects = list.map(e => e.getBoundingClientRect()).filter(c => c.width > 0);
    if (!rects.length) return host.closest(S.panelContainer)?.getBoundingClientRect() ?? r;
    const left = Math.min(...rects.map(c => c.left)), right = Math.max(...rects.map(c => c.right));
    const top = Math.min(...rects.map(c => c.top)), bottom = Math.max(...rects.map(c => c.bottom));
    return new DOMRect(left, top, right - left, bottom - top);
}

function sectionList(found: Hosts, section: LayoutSection, skip: HTMLElement | null) {
    const host = found[section];
    const base = api?.getOrderBase() ?? 0;
    let list = keyedChildren(host).filter(e => e !== skip);
    if (section === "account" && base > 0) list = list.filter(e => orderOf(e) >= base);
    return list
        .map((e, i) => ({ e, i, o: orderOf(e) }))
        .sort((a, b) => a.o - b.o || a.i - b.i)
        .map(x => x.e);
}

function resolveDrop(x: number, y: number): { drop: Drop; box: DOMRect; vertical: boolean; } | null {
    const found = getHosts(false);
    if (!found || !drag) return null;
    let best: { section: LayoutSection; host: HTMLElement; list: HTMLElement[]; rect: DOMRect; dist: number; } | null = null;
    for (const section of SECTIONS) {
        const host = found[section];
        if (!host) continue;
        const list = sectionList(found, section, drag.el);
        const rect = flatten(host, list);
        if (rect.width === 0 && rect.height === 0) continue;
        const dist = Math.hypot(Math.max(rect.left - x, 0, x - rect.right), Math.max(rect.top - y, 0, y - rect.bottom));
        if (dist <= 40 && (!best || dist < best.dist)) best = { section, host, list, rect, dist };
    }
    if (!best) return null;

    const style = getComputedStyle(best.host);
    const vertical = style.display !== "contents" && style.flexDirection.startsWith("column");
    let nearest: { el: HTMLElement; r: DOMRect; d: number; } | null = null;
    for (const el of best.list) {
        const r = el.getBoundingClientRect();
        if (r.width === 0) continue;
        const d = Math.hypot(x - (r.left + r.width / 2), y - (r.top + r.height / 2));
        if (!nearest || d < nearest.d) nearest = { el, r, d };
    }
    if (!nearest) return { drop: { section: best.section, index: 0 }, box: new DOMRect(best.rect.left + 4, best.rect.top + 4, 2, Math.min(28, best.rect.height - 8)), vertical: false };

    const { r } = nearest;
    const before = vertical ? y < r.top + r.height / 2 : x < r.left + r.width / 2;
    const index = best.list.indexOf(nearest.el) + (before ? 0 : 1);
    const box = vertical
        ? new DOMRect(r.left, before ? r.top - 3 : r.bottom + 1, r.width, 2)
        : new DOMRect(before ? r.left - 3 : r.right + 1, r.top, 2, r.height);
    return { drop: { section: best.section, index }, box, vertical };
}

function moveGhost(x: number, y: number) {
    if (!drag) return;
    drag.ghost.style.left = `${x - drag.dx}px`;
    drag.ghost.style.top = `${y - drag.dy}px`;
    const res = resolveDrop(x, y);
    drag.drop = res?.drop ?? null;
    if (!res) {
        marker?.remove();
        marker = null;
        return;
    }
    if (!marker) {
        marker = document.createElement("div");
        marker.className = "hc-ua-marker";
        document.body.appendChild(marker);
    }
    marker.style.left = `${res.box.left}px`;
    marker.style.top = `${res.box.top}px`;
    marker.style.width = `${res.box.width}px`;
    marker.style.height = `${res.box.height}px`;
}

function swallowClick(e: Event) {
    e.stopPropagation();
    e.preventDefault();
}

function detach() {
    document.removeEventListener("pointermove", onPointerMove, true);
    document.removeEventListener("pointerup", onPointerUp, true);
    document.removeEventListener("pointercancel", onCancel, true);
    document.removeEventListener("keydown", onKeyDown, true);
    window.removeEventListener("blur", onCancel);
}

function beginDrag() {
    if (!pending) return;
    const { el, id, x, y } = pending;
    clearTimeout(pending.timer);
    pending = null;
    const rect = el.getBoundingClientRect();
    const ghost = el.cloneNode(true) as HTMLElement;
    ghost.querySelectorAll("[id]").forEach(n => n.removeAttribute("id"));
    ghost.removeAttribute(KEY);
    ghost.removeAttribute("id");
    ghost.className = `${ghost.className} hc-ua-ghost`;
    Object.assign(ghost.style, { width: `${rect.width}px`, height: `${rect.height}px`, left: `${rect.left}px`, top: `${rect.top}px`, order: "0" });
    document.body.appendChild(ghost);
    try { el.setPointerCapture(id); } catch { }
    el.setAttribute("data-hc-ua-dragging", "");
    document.documentElement.setAttribute("data-hc-ua-drag", "");
    window.getSelection()?.removeAllRanges();
    drag = { el, id, ghost, dx: x - rect.left, dy: y - rect.top, drop: null };
    document.addEventListener("click", swallowClick, true);
    moveGhost(x, y);
}

function endDrag(commit: boolean) {
    detach();
    if (pending) {
        clearTimeout(pending.timer);
        pending = null;
    }
    if (!drag) return;
    const { el, id, ghost, drop } = drag;
    drag = null;
    try { el.releasePointerCapture(id); } catch { }
    ghost.remove();
    marker?.remove();
    marker = null;
    el.removeAttribute("data-hc-ua-dragging");
    document.documentElement.removeAttribute("data-hc-ua-drag");
    setTimeout(() => document.removeEventListener("click", swallowClick, true), 60);

    const found = getHosts(false);
    const key = el.getAttribute(KEY);
    if (!commit || !drop || !found || !key || !api) return;
    const next = { ...api.getLayout() };
    const sequences = Object.fromEntries(SECTIONS.map(s => [s, sectionList(found, s, el).map(e => e.getAttribute(KEY) ?? "")])) as Record<LayoutSection, string[]>;
    sequences[drop.section].splice(drop.index, 0, key);
    for (const section of SECTIONS) {
        sequences[section].forEach((k, i) => { if (k) next[k] = { s: section, i }; });
    }
    api.setLayout(next);
    syncLayout();
}

function onPointerMove(e: PointerEvent) {
    if (pending && e.pointerId === pending.id && Math.hypot(e.clientX - pending.x, e.clientY - pending.y) > MOVE_PX) {
        pending.x = e.clientX;
        pending.y = e.clientY;
        beginDrag();
    }
    if (drag && e.pointerId === drag.id) {
        e.preventDefault();
        moveGhost(e.clientX, e.clientY);
    }
}

function onPointerUp(e: PointerEvent) {
    endDrag(Boolean(drag) && e.pointerId === drag?.id);
}

function onCancel() {
    endDrag(false);
}

function onKeyDown(e: KeyboardEvent) {
    if (e.key !== "Escape" || !drag) return;
    e.stopPropagation();
    e.preventDefault();
    endDrag(false);
}

function onPointerDown(e: PointerEvent) {
    if (!api || api.isLocked() || e.button !== 0 || !e.isTrusted || pending || drag) return;
    if (!(e.target instanceof Element)) return;
    const el = findDraggable(e.target);
    if (!el) return;
    pending = { el, id: e.pointerId, x: e.clientX, y: e.clientY, timer: window.setTimeout(beginDrag, HOLD_MS) };
    document.addEventListener("pointermove", onPointerMove, true);
    document.addEventListener("pointerup", onPointerUp, true);
    document.addEventListener("pointercancel", onCancel, true);
    document.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("blur", onCancel);
}

export function startLayoutDrag(newApi: LayoutDragApi) {
    stopLayoutDrag();
    api = newApi;
    observer = new MutationObserver(queueSync);
    document.addEventListener("pointerdown", onPointerDown, true);
    poll = window.setInterval(watchPanels, 1500);
    watchPanels();
    syncLayout();
}

export function stopLayoutDrag() {
    if (!api) return;
    endDrag(false);
    document.removeEventListener("pointerdown", onPointerDown, true);
    clearInterval(poll);
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    observer?.disconnect();
    observer = null;
    observed = null;
    api = null;
    restoreAll();
    document.getElementById(STYLE_ID)?.remove();
    lastCss = "";
    document.documentElement.removeAttribute("data-hc-ua-unlocked");
    document.querySelector(`${PANELS} > .${ROW}`)?.remove();
    document.querySelector(`${PANELS} .${NAME}`)?.remove();
    document.querySelectorAll(`[${KEY}]`).forEach(e => e.removeAttribute(KEY));
}
