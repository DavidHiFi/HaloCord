/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import "./SettingsSidebarSection.css";

import { classes } from "@utils/misc";
import { find } from "@webpack";
import { AccessibilityStore, React, useLayoutEffect, useRef, useState } from "@webpack/common";
import type { ReactElement, ReactNode } from "react";

// Discord's settings sidebar section header and item list, wrapped so each section can
// collapse. Only the React output changes: the heading gets a button child and the list
// renders fewer children. No Discord-owned DOM node is moved or restyled outside hc-theming.

export interface SidebarNode {
    key?: string;
    hideTitle?: boolean;
    layout?: SidebarNode[];
}

interface FieldStore {
    useField(field: string): unknown;
}

const storeCache: Record<string, FieldStore | null> = {};

function findFieldStore(fields: string[]): FieldStore | null {
    const id = fields.join();
    if (storeCache[id]) return storeCache[id];

    const store = find(m => {
        try {
            return typeof m?.useField === "function" && typeof m.resetState === "function"
                && typeof m.getState === "function" && fields.every(f => f in m.getState());
        } catch {
            return false;
        }
    }) as FieldStore | null;

    if (store) storeCache[id] = store;
    return store;
}

// Hook order stays fixed: a missing store is looked up once per mount and never appears later.
function useStoreField<T>(fields: string[], field: string): T | undefined {
    const [store] = useState(() => findFieldStore(fields));
    return store?.useField(field) as T | undefined;
}

const NAV_FIELDS = ["currentPanelKey", "currentCategoryKey"];
const SEARCH_FIELDS = ["query", "isActive", "isFocused", "selected"];

function useSearching() {
    const query = useStoreField<string>(SEARCH_FIELDS, "query");
    return typeof query === "string" && query.trim() !== "";
}

function containsKey(node: SidebarNode | undefined, keys: Set<string>, depth = 0): boolean {
    if (!node || depth > 6) return false;
    if (node.key && keys.has(node.key)) return true;
    return Array.isArray(node.layout) && node.layout.some(child => containsKey(child, keys, depth + 1));
}

function useActiveItemKey(section: SidebarNode) {
    const panel = useStoreField<string>(NAV_FIELDS, "currentPanelKey");
    const category = useStoreField<string>(NAV_FIELDS, "currentCategoryKey");
    const keys = new Set([panel, category].filter((k): k is string => typeof k === "string"));
    if (!keys.size || !Array.isArray(section.layout)) return null;
    return section.layout.find(item => containsKey(item, keys))?.key ?? null;
}

function prefersReducedMotion() {
    if (AccessibilityStore?.useReducedMotion) return true;
    try {
        return matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch {
        return false;
    }
}

export const sectionBodyId = (key: string) => `hc-settings-section-${key.replace(/[^\w-]/g, "_")}`;

export interface SectionHeaderProps {
    section: SidebarNode;
    className?: string;
    children?: ReactNode;
    collapsed: boolean;
    onToggle(): void;
}

export function SettingsSectionHeader({ section, className, children, collapsed, onToggle }: SectionHeaderProps) {
    const searching = useSearching();
    const heading = children as ReactElement<{ className?: string; children?: ReactNode; }>;

    if (!section.key || !React.isValidElement(heading)) {
        return <div className={className}>{children}</div>;
    }

    const expanded = searching || !collapsed;
    const button = (
        <button
            type="button"
            className="hc-settings-section-toggle"
            aria-expanded={expanded}
            aria-controls={sectionBodyId(section.key)}
            disabled={searching}
            onClick={onToggle}
        >
            <span className="hc-settings-section-title">{heading.props.children}</span>
            <svg className="hc-settings-section-chevron" aria-hidden="true" width="12" height="12" viewBox="0 0 24 24">
                <path fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
            </svg>
        </button>
    );

    return (
        <div className={classes(className, "hc-settings-section-header", !expanded && "hc-settings-section-header-collapsed")}>
            {React.cloneElement(heading, { className: classes(heading.props.className, "hc-settings-section-heading") }, button)}
        </div>
    );
}

export interface SectionBodyProps {
    section: SidebarNode;
    className?: string;
    children?: ReactNode;
    collapsed: boolean;
    /** Runs after items that were hidden mount again. */
    onItemsShown?(): void;
}

const ANIMATING = "hc-settings-section-animating";

export function SettingsSectionBody({ section, className, children, collapsed: stored, onItemsShown }: SectionBodyProps) {
    const searching = useSearching();
    const activeKey = useActiveItemKey(section);
    const collapsed = stored && !searching && !section.hideTitle;

    const ref = useRef<HTMLUListElement>(null);
    const anim = useRef<Animation | null>(null);
    const lastHeight = useRef(0);
    const prevCollapsed = useRef(collapsed);
    const [settled, setSettled] = useState(collapsed);

    const items = Array.isArray(children) ? children as ReactNode[] : [children];
    const shown = collapsed && settled
        ? items.filter(child => activeKey != null && React.isValidElement(child) && child.key === activeKey)
        : items;

    function stopAnimation() {
        anim.current?.cancel();
        anim.current = null;
        ref.current?.classList.remove(ANIMATING);
    }

    useLayoutEffect(() => {
        const el = ref.current;
        if (prevCollapsed.current === collapsed) return;
        prevCollapsed.current = collapsed;

        const from = el && anim.current ? el.getBoundingClientRect().height : lastHeight.current;
        stopAnimation();

        if (!el || prefersReducedMotion()) {
            setSettled(collapsed);
            return;
        }

        if (collapsed) {
            // The open page stays listed, so there is nothing to clip: drop the others at once.
            if (activeKey != null) {
                setSettled(true);
                return;
            }
            el.classList.add(ANIMATING);
            const a = el.animate([{ height: `${el.scrollHeight}px` }, { height: "0px" }], { duration: 180, easing: "ease-out", fill: "forwards" });
            a.onfinish = () => setSettled(true);
            anim.current = a;
        } else {
            setSettled(false);
            el.classList.add(ANIMATING);
            const a = el.animate([{ height: `${from}px` }, { height: `${el.scrollHeight}px` }], { duration: 180, easing: "ease-out" });
            a.onfinish = stopAnimation;
            anim.current = a;
        }
    }, [collapsed]);

    // Settled: the list now renders its final children, so the clip can go.
    useLayoutEffect(() => {
        if (collapsed && settled && anim.current) stopAnimation();
        if (ref.current && settled) lastHeight.current = ref.current.offsetHeight;
    }, [collapsed, settled]);

    const shownCount = shown.length;
    const prevShown = useRef(shownCount);
    useLayoutEffect(() => {
        if (shownCount > prevShown.current) onItemsShown?.();
        prevShown.current = shownCount;
    }, [shownCount]);

    useLayoutEffect(() => stopAnimation, []);

    return (
        <ul
            ref={ref}
            id={section.key ? sectionBodyId(section.key) : undefined}
            className={classes(className, "hc-settings-section-list", collapsed && settled && "hc-settings-section-list-collapsed")}
        >
            {shown}
        </ul>
    );
}
