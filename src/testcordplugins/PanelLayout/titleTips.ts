/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { findCssClassesLazy } from "@webpack";

// Plain `title` hints inside the Panel Layout windows show the browser's own grey box. Inside any element marked
// with ROOT they are drawn with Discord's tooltip classes instead, so the theme styles them like every other tooltip.
export const TITLE_TIPS_ROOT = "data-hc-title-tips";

const TipClasses = findCssClassesLazy("tooltip", "tooltipTop", "tooltipBottom", "tooltipPrimary", "tooltipPointer", "tooltipContent");
const TEXT = "data-hc-tip";
const DELAY_MS = 200;
const GAP_PX = 8;

let current: HTMLElement | null = null;
let tip: HTMLElement | null = null;
let timer = 0;

function hide() {
    clearTimeout(timer);
    timer = 0;
    current = null;
    tip?.remove();
    tip = null;
}

function show(el: HTMLElement) {
    const text = el.getAttribute(TEXT);
    if (!text || !el.isConnected) return;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return;

    const node = document.createElement("div");
    node.setAttribute("role", "tooltip");
    const pointer = document.createElement("div");
    const content = document.createElement("div");
    content.textContent = text;
    node.append(pointer, content);
    node.style.cssText = "position: fixed; z-index: 2147483000; pointer-events: none; left: 0; top: 0;";
    document.body.appendChild(node);

    const box = node.getBoundingClientRect();
    const below = rect.top - box.height - GAP_PX < 4;
    node.className = `${TipClasses.tooltip} ${below ? TipClasses.tooltipBottom : TipClasses.tooltipTop} ${TipClasses.tooltipPrimary}`;
    pointer.className = TipClasses.tooltipPointer;
    content.className = TipClasses.tooltipContent;

    const sized = node.getBoundingClientRect();
    const left = Math.min(Math.max(4, rect.left + rect.width / 2 - sized.width / 2), window.innerWidth - sized.width - 4);
    const top = below ? rect.bottom + GAP_PX : rect.top - sized.height - GAP_PX;
    node.style.left = `${Math.round(left)}px`;
    node.style.top = `${Math.round(top)}px`;
    tip = node;
}

function onOver(e: PointerEvent) {
    if (!(e.target instanceof Element)) return;
    const el = e.target.closest<HTMLElement>(`[title], [${TEXT}]`);
    if (!el || !el.closest(`[${TITLE_TIPS_ROOT}]`)) {
        if (current && !(e.target instanceof Node && current.contains(e.target))) hide();
        return;
    }
    const title = el.getAttribute("title");
    if (title !== null) {
        el.removeAttribute("title");
        if (title) el.setAttribute(TEXT, title);
    }
    if (el === current) return;
    hide();
    if (!el.getAttribute(TEXT)) return;
    current = el;
    timer = window.setTimeout(() => show(el), DELAY_MS);
}

function onOut(e: PointerEvent) {
    if (!current) return;
    if (e.relatedTarget instanceof Node && current.contains(e.relatedTarget)) return;
    hide();
}

export function startTitleTips() {
    document.addEventListener("pointerover", onOver, true);
    document.addEventListener("pointerout", onOut, true);
    document.addEventListener("pointerdown", hide, true);
    document.addEventListener("dragstart", hide, true);
    document.addEventListener("wheel", hide, { capture: true, passive: true });
}

export function stopTitleTips() {
    hide();
    document.removeEventListener("pointerover", onOver, true);
    document.removeEventListener("pointerout", onOut, true);
    document.removeEventListener("pointerdown", hide, true);
    document.removeEventListener("dragstart", hide, true);
    document.removeEventListener("wheel", hide, true);
}
