/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { normalizeConfig, streamEnhancerSettings, syncCurrentGoLiveSource } from "./settings";
import { setLiveShareAudio } from "./shareCapture";

export type Mode = "gaming" | "screenshare" | "custom";
export type Size = { width: number; height: number; };
export interface Saved { height: number; fps: number; mute: boolean; audio: string; }

export const resolutions = [
    { label: "720p", height: 720 },
    { label: "1080p", height: 1080 },
    { label: "1440p", height: 1440 },
    { label: "4K", height: 2160 },
    { label: "Source", height: 0 }
] as const;
export const frameRates = [15, 30, 60, 120, 240, 360] as const;
// Shown in the picker once a choice goes past 1440p or 60 FPS.
export const heavyNote = "4K and anything above 60 FPS take a lot more from your GPU and your upload. Games can drop frames while you stream, and viewers only see the extra frames if their screen refreshes that fast.";
export const isHeavy = (height: number, fps: number) => height > 1440 || fps > 60;
export const modes: Record<Exclude<Mode, "custom">, { label: string; note: string; height: number; fps: number; }> = {
    gaming: { label: "Gaming", note: "1440p · 60fps", height: 1440, fps: 60 },
    screenshare: { label: "Screenshare", note: "Source · 15fps", height: 0, fps: 15 }
};

const sourceSize = (): Size => ({
    width: Math.round(screen.width * devicePixelRatio / 2) * 2,
    height: Math.round(screen.height * devicePixelRatio / 2) * 2
});
export const sizeFor = (height: number): Size => height ? { width: Math.round(height * 16 / 9 / 2) * 2, height } : sourceSize();
export const modeFor = (height: number, fps: number): Mode =>
    (Object.keys(modes) as Array<keyof typeof modes>).find(k => modes[k].height === height && modes[k].fps === fps) ?? "custom";

export const loadSaved = (): Saved => {
    const c = normalizeConfig(streamEnhancerSettings.store.config);
    const s = streamEnhancerSettings.store;
    const height = resolutions.some(r => r.height === s.shareHeight) ? s.shareHeight : 1080;
    const fps = (frameRates as readonly number[]).includes(c.streamMaxFps) ? c.streamMaxFps : 60;
    return { height, fps, mute: !!s.shareMute, audio: s.shareAudio || "default" };
};

export const save = (v: Saved) => {
    const { store } = streamEnhancerSettings;
    store.shareHeight = v.height;
    store.shareMute = v.mute;
    store.shareAudio = v.audio;
    const size = sizeFor(v.height);
    store.config = normalizeConfig({ ...normalizeConfig(store.config), streamTweaksEnabled: true, streamWidth: size.width, streamHeight: size.height, streamMaxFps: v.fps });
};

// The stream menu changes a running stream: same saved values as the picker, then the live source and sound follow.
export const applyLive = (next: Partial<Saved>) => {
    const v = { ...loadSaved(), ...next };
    save(v);
    syncCurrentGoLiveSource(normalizeConfig(streamEnhancerSettings.store.config));
    setLiveShareAudio(!v.mute);
};
