/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type { GlobalContextMenuPatchCallback, NavContextMenuPatchCallback } from "@api/ContextMenu";
import type { User } from "@vencord/discord-types";
import { Menu, React } from "@webpack/common";
import type { ReactElement } from "react";

import { openCameraSettings } from "./components/CameraSettings";
import { openStreamSettings } from "./components/StreamSettings";
import { applyLive, frameRates, loadSaved, resolutions } from "./quality";
import { applicationStreamingStore } from "./runtime";
import * as streamState from "./state";
import type { StreamDescriptor } from "./types";

const renderStreamContextItems = (ownerId: string | null, stream?: StreamDescriptor | null) => {
    if (ownerId == null && stream == null) return null;

    const items: ReactElement[] = [];

    if (ownerId != null) {
        const autoWatchEnabled = streamState.isAutoWatchEnabledForUser(ownerId);
        const autoFocusEnabled = streamState.isAutoFocusEnabledForUser(ownerId);

        items.push(
            <Menu.MenuCheckboxItem
                id="stream-enhancer-auto-watch"
                key="stream-enhancer-auto-watch"
                label="Auto watch stream"
                checked={autoWatchEnabled}
                action={() => {
                    const nextEnabled = !autoWatchEnabled;
                    streamState.setAutoWatchEnabledForUser(ownerId, nextEnabled);
                }}
            />
        );
        items.push(
            <Menu.MenuCheckboxItem
                id="stream-enhancer-auto-focus"
                key="stream-enhancer-auto-focus"
                label="Auto focus stream"
                checked={autoFocusEnabled}
                action={() => {
                    const nextEnabled = !autoFocusEnabled;
                    streamState.setAutoFocusEnabledForUser(ownerId, nextEnabled);
                    if (nextEnabled) streamState.setAutoWatchEnabledForUser(ownerId, true);
                }}
            />
        );
    }

    return items;
};

export const streamContextPatch: NavContextMenuPatchCallback = (children, { stream }: { stream?: StreamDescriptor; }) => {
    const items = renderStreamContextItems(streamState.normalizeUserId(stream?.ownerId), stream);
    if (items?.length == null || items.length === 0) return;

    children.push(<Menu.MenuSeparator key="stream-enhancer-separator" />, ...items);
};

export const userContextPatch: NavContextMenuPatchCallback = (children, { user }: { user?: User; }) => {
    if (user == null) return;

    const items = renderStreamContextItems(
        streamState.normalizeUserId(user.id),
        applicationStreamingStore?.getAnyStreamForUser?.(user.id)
    );

    if (items?.length == null || items.length === 0) return;

    children.push(<Menu.MenuSeparator key="stream-enhancer-separator" />, ...items);
};

type MenuNode = ReactElement<any> | null | undefined;

const findItem = (children: MenuNode[], label: RegExp): { list: MenuNode[]; index: number; } | null => {
    for (let index = 0; index < children.length; index++) {
        const child = children[index];
        if (child == null) continue;
        if (Array.isArray(child)) {
            const found = findItem(child, label);
            if (found) return found;
            continue;
        }
        if (typeof child.props?.label === "string" && label.test(child.props.label)) return { list: children, index };
        let inner = child.props?.children;
        if (!inner || typeof inner === "function") continue;
        if (!Array.isArray(inner)) child.props.children = inner = [inner];
        const found = findItem(inner, label);
        if (found) return found;
    }
    return null;
};

const streamQualityItems = () => {
    const { height, fps, mute } = loadSaved();
    return [
        <Menu.MenuItem id="stream-enhancer-quality" key="stream-enhancer-quality" label="Stream Quality">
            <Menu.MenuGroup label="Resolution">
                {resolutions.map(r => (
                    <Menu.MenuRadioItem key={r.label} group="stream-enhancer-quality-resolution" id={`stream-enhancer-quality-res-${r.label}`}
                        label={r.label} checked={height === r.height} action={() => applyLive({ height: r.height })} />
                ))}
            </Menu.MenuGroup>
            <Menu.MenuGroup label="Frame Rate">
                {frameRates.map(f => (
                    <Menu.MenuRadioItem key={f} group="stream-enhancer-quality-fps" id={`stream-enhancer-quality-fps-${f}`}
                        label={`${f} FPS`} checked={fps === f} action={() => applyLive({ fps: f })} />
                ))}
            </Menu.MenuGroup>
        </Menu.MenuItem>,
        <Menu.MenuItem id="stream-enhancer-advanced" key="stream-enhancer-advanced" label="Advanced Stream Settings" action={openStreamSettings} />,
        <Menu.MenuCheckboxItem id="stream-enhancer-audio" key="stream-enhancer-audio" label="Share stream audio"
            checked={!mute} action={() => applyLive({ mute: !mute })} />
    ];
};

// Discord's stream button arrow and camera arrow menus have no navId we can name ahead of time, so find them by their items.
export const mediaButtonMenuPatch: GlobalContextMenuPatchCallback = (_navId, children) => {
    const stop = findItem(children, /^stop stream(ing)?$/i);
    if (stop && !findItem(children, /^stream quality$/i)) {
        const change = findItem(stop.list, /^change (stream|windows?)$/i) ?? stop;
        change.list.splice(change.index + 1, 0, ...streamQualityItems());
    }

    const video = findItem(children, /^video settings$/i);
    const item = video?.list[video.index];
    if (video && item) video.list[video.index] = React.cloneElement(item, { action: openCameraSettings });
};
