/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import "./HaloUI.css";
import "./HaloRestart.css";

import { Button } from "@components/Button";
import { ModalRoot, ModalSize, openModal } from "@utils/modal";
import { relaunch } from "@utils/native";
import { React } from "@webpack/common";
import type { KeyboardEvent, MouseEvent, ReactNode } from "react";

export interface HaloConfirmOptions {
    title: string;
    body: ReactNode;
    confirmText?: string;
    cancelText?: string;
    danger?: boolean;
}

/** HaloCord's confirm dialog. Resolves true on confirm, false on Cancel, Escape or a click outside. */
export function openHaloConfirm({ title, body, confirmText = "Confirm", cancelText = "Cancel", danger }: HaloConfirmOptions): Promise<boolean> {
    return new Promise(resolve => {
        let confirmed = false;
        openModal(props => (
            <ModalRoot {...props} size={ModalSize.SMALL} className="hc-dialog">
                <div className="hc-dialog-body">
                    <h2 className="hc-dialog-title">{title}</h2>
                    <div className="hc-dialog-text">{body}</div>
                </div>
                <div className="hc-dialog-actions">
                    <Button variant="secondary" size="small" className="hc-dialog-cancel" onClick={props.onClose}>
                        {cancelText}
                    </Button>
                    <Button
                        variant={danger ? "dangerPrimary" : "primary"}
                        size="small"
                        className={danger ? "hc-dialog-danger" : "hc-dialog-confirm"}
                        autoFocus={!danger}
                        onClick={() => {
                            confirmed = true;
                            props.onClose();
                        }}
                    >
                        {confirmText}
                    </Button>
                </div>
            </ModalRoot>
        ), { onCloseCallback: () => resolve(confirmed) });
    });
}

export async function openRestartPrompt(label: string) {
    const restart = await openHaloConfirm({
        title: "Restart needed",
        body: `${label} takes effect after HaloCord restarts.`,
        confirmText: "Restart now"
    });
    if (restart) relaunch();
}

// Settings changed this session that only apply after a restart, keyed by setting path, holding the value
// HaloCord started with. Module state, so it outlives settings pages and modals until the restart.
const pending = new Map<string, unknown>();
const listeners = new Set<() => void>();

const sameValue = (a: unknown, b: unknown) => a === b || JSON.stringify(a) === JSON.stringify(b);

/** Records a change to a setting that applies after a restart. Returns true while it differs from the running value. */
export function noteRestartChange(key: string, from: unknown, to: unknown) {
    if (!pending.has(key)) {
        if (sameValue(from, to)) return false;
        pending.set(key, from);
    } else if (sameValue(pending.get(key), to)) {
        pending.delete(key);
    } else {
        return true;
    }
    listeners.forEach(l => l());
    return pending.has(key);
}

/** Records the change and, when a restart is now needed, shows the restart prompt. */
export function changeNeedsRestart(key: string, from: unknown, to: unknown, label: string) {
    if (noteRestartChange(key, from, to)) void openRestartPrompt(label);
}

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => void listeners.delete(listener);
}

/** Whether this setting, or with no key any setting, waits for a restart. */
export function useRestartPending(key?: string) {
    return React.useSyncExternalStore(subscribe, () => key ? pending.has(key) : pending.size > 0);
}

export interface HaloRestartButtonProps {
    label: string;
    /** Only show while this setting waits for a restart. */
    pendingKey?: string;
}

export function HaloRestartButton({ label, pendingKey }: HaloRestartButtonProps) {
    const isPending = useRestartPending(pendingKey);
    if (pendingKey && !isPending) return null;

    // A span, not a button: inside a setting's <label> a button would become the label's control.
    const open = (e: MouseEvent | KeyboardEvent) => {
        e.preventDefault();
        e.stopPropagation();
        void openRestartPrompt(label);
    };

    return (
        <span
            role="button"
            tabIndex={0}
            className="hc-ui-pill hc-ui-pill-warn hc-restart-pill"
            aria-label={`Restart HaloCord to apply ${label}`}
            title="Restart HaloCord to apply this change"
            onClick={open}
            onKeyDown={e => (e.key === "Enter" || e.key === " ") && open(e)}
        >
            <span className="hc-ui-pill-dot" />
            Restart
        </span>
    );
}

window.HaloCordUI = {
    restartPrompt: openRestartPrompt,
    confirm: openHaloConfirm
};
