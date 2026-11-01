/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { MediaEngineStore } from "@webpack/common";

export interface Mic {
    id: string;
    title: string;
    label: string;
}

// The page's own getUserMedia is HaloCord's call mic chain (desktop/base/userscript.js swaps the call's mic track on
// every capture), so recordings and device lists come from a blank frame's untouched copy.
let frame: HTMLIFrameElement | null = null;
function cleanWindow() {
    if (!frame?.isConnected) {
        frame = document.createElement("iframe");
        frame.style.display = "none";
        document.body.appendChild(frame);
    }
    if (!frame.contentWindow) throw new Error("No clean frame for the microphone");
    return frame.contentWindow;
}

export const cleanMedia = () => cleanWindow().navigator.mediaDevices;

// HaloCord's Voice & Video card keeps its extra mics in the userscript's config.
function haloExtraMics(): string[] {
    try {
        const config: unknown = JSON.parse(cleanWindow().localStorage.getItem("discord-stereo-config") ?? "{}");
        if (!config || typeof config !== "object") return [];
        return ["secondaryMicDevice", "thirdMicDevice"].map(key => {
            const id = (config as Record<string, unknown>)[key];
            return typeof id === "string" ? id : "";
        });
    } catch {
        return [];
    }
}

const PSEUDO_DEVICES = ["default", "communications"];

export async function listMics(): Promise<Mic[]> {
    const devices = (await cleanMedia().enumerateDevices()).filter(d => d.kind === "audioinput");
    const labelOf = (id: string) => devices.find(d => d.deviceId === id)?.label || "Microphone";

    const discordId = MediaEngineStore.getInputDeviceId();
    const discordName = MediaEngineStore.getInputDevices()[discordId]?.name;
    const mainId = devices.find(d => d.deviceId === discordId)?.deviceId
        ?? devices.find(d => discordName && d.label === discordName)?.deviceId
        ?? "default";

    const mics: Mic[] = [{ id: mainId, title: "Main microphone", label: discordName || labelOf(mainId) }];
    const add = (id: string, title: string) => {
        if (!mics.some(m => m.id === id)) mics.push({ id, title, label: labelOf(id) });
    };
    const [second, third] = haloExtraMics();
    if (second && devices.some(d => d.deviceId === second)) add(second, "Secondary microphone");
    if (third && devices.some(d => d.deviceId === third)) add(third, "Third microphone");
    for (const d of devices) {
        if (!PSEUDO_DEVICES.includes(d.deviceId)) add(d.deviceId, "Other input");
    }
    return mics;
}
