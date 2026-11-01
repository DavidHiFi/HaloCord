/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import "./HaloUI.css";

import { classes } from "@utils/misc";
import type { ReactNode } from "react";

// HaloCord's own settings rows, in the look of the voice panel in Voice & Video: dark rounded rows,
// green accents and green switches. Layout ideas for the status pill and header card come from
// Sudocord's settings pages.

export function HaloSection({ title, children }: { title?: string; children: ReactNode; }) {
    return (
        <section className="hc-ui">
            {title && <h3 className="hc-ui-title">{title}</h3>}
            {children}
        </section>
    );
}

export interface HaloRowProps {
    title: ReactNode;
    description?: ReactNode;
    disabled?: boolean;
    /** Green-tinted row, for the one setting a section is about. */
    accent?: boolean;
    children?: ReactNode;
}

export function HaloRow({ title, description, disabled, accent, children }: HaloRowProps) {
    return (
        <div className={classes("hc-ui-row", accent && "hc-ui-row-accent", disabled && "hc-ui-row-disabled")}>
            <div className="hc-ui-row-text">
                <div className="hc-ui-row-title">{title}</div>
                {description && <div className="hc-ui-row-desc">{description}</div>}
            </div>
            {children && <div className="hc-ui-row-side">{children}</div>}
        </div>
    );
}

export interface HaloSwitchProps {
    checked: boolean;
    onChange(value: boolean): void;
    label: string;
    disabled?: boolean;
}

export function HaloSwitch({ checked, onChange, label, disabled }: HaloSwitchProps) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            disabled={disabled}
            className={classes("hc-ui-switch", checked && "hc-ui-switch-on")}
            onClick={() => onChange(!checked)}
        >
            <span className="hc-ui-switch-knob" />
        </button>
    );
}

/** A switch row: the row title doubles as the switch's label. */
export function HaloSwitchRow({ title, description, value, onChange, disabled, children }: Omit<HaloRowProps, "title"> & { title: string; value: boolean; onChange(value: boolean): void; }) {
    return (
        <HaloRow title={title} description={description} disabled={disabled}>
            {children}
            <HaloSwitch checked={value} onChange={onChange} label={title} disabled={disabled} />
        </HaloRow>
    );
}

export type HaloTone = "good" | "info" | "warn" | "bad" | "muted";

export function HaloPill({ tone, children }: { tone: HaloTone; children: ReactNode; }) {
    return <span className={`hc-ui-pill hc-ui-pill-${tone}`}><span className="hc-ui-pill-dot" />{children}</span>;
}
