/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { addGlobalContextMenuPatch, removeGlobalContextMenuPatch } from "@api/ContextMenu";
import { SettingsStore } from "@api/Settings";
import { UserAreaButton, type UserAreaRenderProps } from "@api/UserArea";
import { ScreenshareIcon } from "@components/Icons";
import { EquicordDevs, TestcordDevs } from "@utils/constants";
import definePlugin from "@utils/types";

import {
    getGoLiveStreamEnhanceSourceOption,
    getGoLiveStreamEnhanceSourceType,
    openGoLiveButtonContextMenu,
    renderGoLiveStreamEnhancePanel,
    syncGoLiveModalState,
} from "./components/GoLiveSettingsModal";
import { openSharePicker } from "./components/SharePicker";
import { openStreamSettings } from "./components/StreamSettings";
import { ViewerControls } from "./components/ViewerControls";
import { mediaButtonMenuPatch, streamContextPatch, userContextPatch } from "./contextMenus";
import { requestLocalPreview, setLocalPreviewChangeListener } from "./customPreviewImage";
import { streamEnhancerPatches } from "./patches";
import { startPreviewSender, stopPreviewSender } from "./previewSender";
import { getPreviewRefreshIntervalMs, getPreviewThumbnailDataUrl, refreshCustomPreview, shouldSpoofStreamPanelPreview, stopCustomPreviewLoader, streamEnhancerRuntime, streamEnhancerSettings } from "./settings";
import { installShareCapture, uninstallShareCapture } from "./shareCapture";
import * as streamState from "./state";
import managedStyle from "./styles.css?managed";
import type { StreamParticipant } from "./types";

export function StreamEnhancerButton({ iconForeground, hideTooltips, nameplate }: UserAreaRenderProps) {
    const { showPanelButton } = streamEnhancerSettings.use(["showPanelButton"]);
    if (!showPanelButton) return null;
    return <UserAreaButton
        icon={<ScreenshareIcon className={iconForeground} />}
        tooltipText={hideTooltips ? undefined : "Stream Settings"}
        aria-label="Stream Settings"
        plated={nameplate != null}
        onClick={openStreamSettings}
    />;
}

const streamEnhancer = definePlugin({
    id: "StreamEnhancer",
    name: "StreamEnhancer",
    description: "Stream tuning, native camera previews, viewer controls, and optional spoofed stream badges. DavidHiFi fork.",
    authors: [EquicordDevs.omaw, TestcordDevs.DavidHiFi],
    // Built into HaloCord: always on, kept out of the plugin list, configured from the stream menu.
    required: true,
    hidden: true,
    requiresRestart: true,
    managedStyle,
    settings: streamEnhancerSettings,
    userAreaButton: { icon: ScreenshareIcon, render: StreamEnhancerButton },
    contextMenus: {
        "stream-context": streamContextPatch,
        "user-context": userContextPatch
    },
    patches: streamEnhancerPatches,
    start() {
        // No mirrored camera moved here from EquiTweaks; carry the old choice over once.
        const equiTweaks = SettingsStore.plain.plugins.EquiTweaks;
        if (equiTweaks && Object.hasOwn(equiTweaks, "noMirroredCamera")) {
            if (equiTweaks.noMirroredCamera) streamEnhancerSettings.store.noMirroredCamera = true;
            delete equiTweaks.noMirroredCamera;
            SettingsStore.markAsChanged();
        }
        installShareCapture();
        addGlobalContextMenuPatch(mediaButtonMenuPatch);
        setLocalPreviewChangeListener(refreshCustomPreview);
        requestLocalPreview();
        startPreviewSender({
            isEnabled: shouldSpoofStreamPanelPreview,
            getThumbnail: getPreviewThumbnailDataUrl,
            getIntervalMs: getPreviewRefreshIntervalMs
        });
        streamState.startAutoWatch();
    },
    stop() {
        uninstallShareCapture();
        removeGlobalContextMenuPatch(mediaButtonMenuPatch);
        stopCustomPreviewLoader();
        stopPreviewSender();
        streamState.stopStreamEnhancerState();
    },
    cameraMirror<T>(mirror: T) {
        return streamEnhancerSettings.store.noMirroredCamera ? false : mirror;
    },
    cameraPreviewStyle() {
        return streamEnhancerSettings.store.noMirroredCamera ? { transform: "scaleX(1)" } : undefined;
    },
    isMediaParticipant: streamState.isMediaParticipant,
    isStreamParticipant: streamState.isStreamParticipant,
    getGoLiveStreamEnhanceSourceOption,
    getGoLiveStreamEnhanceSourceType,
    openGoLiveButtonContextMenu,
    openWebGoLive: openSharePicker,
    renderGoLiveStreamEnhancePanel,
    syncGoLiveModalState,
    renderViewerControls(participant: StreamParticipant, className?: string) {
        return <ViewerControls participant={participant} className={className} />;
    },
    renderZoomableCameraVideo: streamState.renderZoomableCameraVideo,
    getRenderedStreamTileStyle: streamState.getRenderedStreamTileStyle,
    getRenderedStreamFit: streamState.getRenderedStreamFit,
    getRenderedMediaWrapperClassName: streamState.getRenderedMediaWrapperClassName,
    getRenderedMediaWrapperStyle: streamState.getRenderedMediaWrapperStyle,
    getRenderedStreamVideoClassName: streamState.getRenderedStreamVideoClassName,
    mergeRenderedStreamVideoClassName: streamState.mergeRenderedStreamVideoClassName,
    getRenderedFrameStyle: streamState.getRenderedFrameStyle,
    getRenderedStreamVideoStyle: streamState.getRenderedStreamVideoStyle,
    getVideoFrameStyle: streamState.getVideoFrameStyle,
    getSelectedRootClassName: streamState.getSelectedRootClassName,
    useSelectedRootClassName: streamState.useSelectedRootClassName,
    getActionRowClassName: streamState.getActionRowClassName,
    getParticipantsWrapperClassName: streamState.getParticipantsWrapperClassName,
    getParticipantsWrapperStyle: streamState.getParticipantsWrapperStyle,
    getParticipantsListClassName: streamState.getParticipantsListClassName,
    getParticipantsTileClassName: streamState.getParticipantsTileClassName,
    getParticipantsItemClassName: streamState.getParticipantsItemClassName,
    getSelectedStreamContainerStyle: streamState.getSelectedStreamContainerStyle,
    getSelectedStreamItemStyle: streamState.getSelectedStreamItemStyle,
    getSelectedStreamWidth: streamState.getSelectedStreamWidth,
    getShowStreamParticipants: streamState.getShowStreamParticipants,
    useShowStreamParticipants: streamState.useShowStreamParticipants,
    getVideoGridTileStyle: streamState.getVideoGridTileStyle,
    setRenderedStreamBrightness: streamState.setRenderedStreamBrightness,
    setRenderedStreamScale: streamState.setRenderedStreamScale,
    getRenderedStreamScalePercent: streamState.getRenderedStreamScalePercent,
    minRenderedStreamScalePercent: streamState.minRenderedStreamScalePercent,
    maxRenderedStreamScalePercent: streamState.maxRenderedStreamScalePercent,
    applyStreamFitToDom: streamState.applyStreamFitToDom,
    applyStreamScaleToDom: streamState.applyStreamScaleToDom,
    setStreamFitAnchor: streamState.setStreamFitAnchor,
    setHideChannelList: streamState.setHideChannelList,
    shouldHideChannelList: streamState.shouldHideChannelList,
    useRenderedStreamVideoState: streamState.useRenderedStreamVideoState,
    useRenderedStreamScaleVersion: streamState.useRenderedStreamScaleVersion,
    useRenderedStreamWidth: streamState.useRenderedStreamWidth,
    useRenderedWidthFromProps: streamState.useRenderedWidthFromProps,
    ...streamEnhancerRuntime
});

export default streamEnhancer;

// Exposed for debugging from the Discord console: __vcStreamEnhancerFitDebug()
(globalThis as Record<string, unknown>).__vcStreamEnhancerFitDebug = streamState.debugStreamFitChain;
