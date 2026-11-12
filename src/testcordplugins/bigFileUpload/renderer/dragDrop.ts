/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * Handles drag-and-drop override and paste interception helpers
 * Exposes functions consumed by the renderer entry
 */

import { ChannelStore, DraftType, SelectedChannelStore, showToast, Toasts, UploadManager } from "@webpack/common";

import { pluginLogger as log } from "../logging";
import { formatFileSize } from "./formatting";
import { startUploadBatch } from "./progress";

// Upload function will be injected by index.tsx
let uploadBufferFn: ((file: File) => Promise<void>) | null = null;

// Nitro limit checker function - injected by index.tsx
let shouldUseNativeUploadFn: ((fileSize: number) => boolean) | null = null;

// Visual overlay element
let dragOverlay: HTMLDivElement | null = null;

// Drag-and-drop size limit (1GB)
export const DRAG_DROP_MAX_SIZE = 1024 * 1024 * 1024;

export function setUploadFunction(fn: (file: File) => Promise<void>) {
    uploadBufferFn = fn;
}

export function setNitroLimitChecker(fn: (fileSize: number) => boolean) {
    shouldUseNativeUploadFn = fn;
}

const OVERLAY_STYLE_ID = "bigfileupload-animations";

// HaloCord's tokens (HaloUI.css) give the overlay the client's frosted dock look; the fallbacks are stock Discord.
const OVERLAY_CSS = `
.bfu-drop-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    background: rgb(var(--hc-crust-rgb, 0 0 0) / 45%);
    backdrop-filter: blur(12px) saturate(120%);
}
.bfu-drop-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    min-width: 360px;
    padding: 36px 56px 32px;
    border: var(--hc-ring-thin, 1.5px) solid transparent;
    border-radius: 16px;
    background:
        linear-gradient(var(--hc-window-bg, #313338), var(--hc-window-bg, #313338)) padding-box,
        var(--hc-gradient, linear-gradient(135deg, var(--brand-500, #5865f2), var(--brand-500, #5865f2))) border-box;
    box-shadow: 0 12px 40px rgb(0 0 0 / 45%);
}
.bfu-drop-icon {
    width: 128px;
    height: 128px;
    animation: bfu-drop-pulse 1.5s ease-in-out infinite;
}
.bfu-drop-title {
    color: var(--hc-text, #f2f3f5);
    font-size: 24px;
    font-weight: 700;
    text-align: center;
}
.bfu-drop-channel {
    color: var(--hc-accent, var(--brand-360, #949cf7));
}
.bfu-drop-sub {
    padding: 4px 12px;
    border: 1px solid var(--hc-row-border, rgb(255 255 255 / 6%));
    border-radius: 999px;
    background: var(--hc-row-bg, rgb(0 0 0 / 20%));
    color: var(--hc-text-muted, #b5bac1);
    font-size: 13px;
    font-weight: 500;
    text-align: center;
}
@keyframes bfu-drop-pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.9; }
}
`;

function ensureOverlayStyle() {
    if (document.getElementById(OVERLAY_STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = OVERLAY_STYLE_ID;
    style.textContent = OVERLAY_CSS;
    document.head.appendChild(style);
}

function showDragOverlay() {
    if (dragOverlay) return;
    log.debug("Creating drag overlay for secure upload prompt");

    const channelId = SelectedChannelStore.getChannelId();
    const channel = channelId ? ChannelStore.getChannel(channelId) : null;
    const channelName = channel?.name || "channel";

    ensureOverlayStyle();

    dragOverlay = document.createElement("div");
    dragOverlay.className = "bfu-drop-overlay";

    const content = document.createElement("div");
    content.className = "bfu-drop-card";

    const icon = document.createElement("img");
    icon.className = "bfu-drop-icon";
    icon.src = "https://media.discordapp.net/stickers/1039992459209490513.png";

    const text = document.createElement("div");
    text.className = "bfu-drop-title";
    text.append("Upload to ");
    const channelLabel = document.createElement("span");
    channelLabel.className = "bfu-drop-channel";
    channelLabel.textContent = "#" + channelName;
    text.appendChild(channelLabel);

    const subtext = document.createElement("div");
    subtext.className = "bfu-drop-sub";
    subtext.textContent = "Using BigFileUpload (Max 1GB via drag-and-drop)";

    content.appendChild(icon);
    content.appendChild(text);
    content.appendChild(subtext);
    dragOverlay.appendChild(content);

    document.body.appendChild(dragOverlay);
}

function hideDragOverlay() {
    if (dragOverlay) {
        dragOverlay.remove();
        dragOverlay = null;
    }
}

// Use counter instead of boolean to handle nested drag events correctly
// Each dragenter increments, each dragleave decrements, hide overlay when counter reaches 0
let dragEnterCount = 0;

function hasFileItems(dataTransfer: DataTransfer | null): boolean {
    if (!dataTransfer?.items?.length) return false;
    for (let i = 0; i < dataTransfer.items.length; i++) {
        if (dataTransfer.items[i].kind === "file") {
            return true;
        }
    }
    return false;
}

function handleDragEnter(e: DragEvent) {
    if (!hasFileItems(e.dataTransfer)) return;

    dragEnterCount++;
    log.debug("handleDragEnter invoked", {
        dragEnterCount,
        itemCount: e.dataTransfer?.items?.length ?? 0
    });

    e.preventDefault();
    e.stopPropagation();

    // Only show overlay on first enter
    if (dragEnterCount === 1) {
        showDragOverlay();
    }
}

function handleDragOver(e: DragEvent) {
    // Must prevent default for drop to work
    if (dragEnterCount > 0 || hasFileItems(e.dataTransfer)) {
        e.preventDefault();
        e.stopPropagation();
    }
}

function handleDragLeave(e: DragEvent) {
    if (dragEnterCount <= 0) return;

    dragEnterCount--;
    log.debug("handleDragLeave invoked", {
        dragEnterCount,
        isWindowLeave: e.relatedTarget === null
    });

    e.stopPropagation();

    // Hide overlay when counter reaches 0 (all drag leaves processed)
    if (dragEnterCount === 0) {
        hideDragOverlay();
    }
}

export async function handleDrop(e: DragEvent) {
    log.debug("handleDrop received event", {
        fileCount: e.dataTransfer?.files?.length ?? 0
    });
    if (!e.dataTransfer?.files?.length) return;

    const files = Array.from(e.dataTransfer.files);

    e.preventDefault();
    e.stopPropagation();

    // Check if ALL files are under Nitro limit - if so, use Discord's native UploadManager
    if (shouldUseNativeUploadFn) {
        const allUnderNitroLimit = files.every(file => shouldUseNativeUploadFn!(file.size));
        if (allUnderNitroLimit) {
            log.debug("All files under Nitro limit, using Discord's native upload", {
                files: files.map(f => ({ name: f.name, size: formatFileSize(f.size) }))
            });
            hideDragOverlay();
            dragEnterCount = 0;

            const channelId = SelectedChannelStore.getChannelId();
            if (channelId) {
                // Use Discord's native UploadManager to handle the files
                UploadManager.addFiles({
                    channelId,
                    draftType: DraftType.ChannelMessage,
                    files: files.map(file => ({ file, platform: 1 })),
                    showLargeMessageDialog: false
                });
            }
            return;
        }
    }

    hideDragOverlay();
    dragEnterCount = 0;

    if (!uploadBufferFn) return;

    const channelId = SelectedChannelStore.getChannelId();
    log.debug("Processing drop for channel", { channelId });

    if (!channelId) {
        showToast("Please select a channel before uploading", Toasts.Type.FAILURE);
        return;
    }

    UploadManager.clearAll(channelId, DraftType.ChannelMessage);

    log.debug(`Drag-and-drop: ${files.length} file(s) (exceeds Nitro limit)`, files.map(file => ({
        name: file.name,
        size: formatFileSize(file.size),
        type: file.type || "unknown"
    })));

    startUploadBatch(files.length);

    for (const file of files) {
        try {
            if (file.size > DRAG_DROP_MAX_SIZE) {
                showToast(
                    `'${file.name}' is too large (${formatFileSize(file.size)}). Drag-and-drop limit is ${formatFileSize(DRAG_DROP_MAX_SIZE)}. Use the Upload button for larger files.`,
                    Toasts.Type.FAILURE
                );
                continue;
            }

            log.debug("Dispatching uploadBufferFn for dropped file", {
                fileName: file.name,
                fileSize: file.size
            });
            await uploadBufferFn(file);

        } catch (error) {
            log.error(`Drag-and-drop upload failed for '${file.name}':`, error);
            showToast(`Failed to upload '${file.name}'. Try again or use the Upload button.`, Toasts.Type.FAILURE);
        }
    }
}

export function enableDragDropOverride() {
    document.addEventListener("dragenter", handleDragEnter, { capture: true });
    document.addEventListener("dragover", handleDragOver, { capture: true });
    document.addEventListener("dragleave", handleDragLeave, { capture: true });
    document.addEventListener("drop", handleDrop, { capture: true });
    log.debug("SECURE drag-and-drop override registered");
}

export function disableDragDropOverride() {
    document.removeEventListener("dragenter", handleDragEnter, { capture: true });
    document.removeEventListener("dragover", handleDragOver, { capture: true });
    document.removeEventListener("dragleave", handleDragLeave, { capture: true });
    document.removeEventListener("drop", handleDrop, { capture: true });
    hideDragOverlay();
    dragEnterCount = 0;

    // Clean up the animation style element to prevent memory leak
    const animationStyle = document.getElementById(OVERLAY_STYLE_ID);
    if (animationStyle) {
        animationStyle.remove();
    }
}
