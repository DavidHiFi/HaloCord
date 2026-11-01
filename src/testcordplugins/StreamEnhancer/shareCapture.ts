/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { getConfiguredStreamFps } from "./settings";

// Carries the share picker's choice into Discord's getDisplayMedia call and gives the stream its
// sound the way the desktop app does: a window share hears only that app, a screen share hears
// everything except HaloCord (so the call and your mic never go out twice). The capture runs in
// the shell (halocord-loopback.exe); a chosen input device or a camera comes from getUserMedia.

// `muted` starts the stream with its sound track switched off, so the stream menu can switch it on later.
// `pan` is the left/right balance, -1 (left) to 1 (right).
export type ShareChoice = { kind: "desktop" | "device"; id: string; audio: string; muted?: boolean; pan?: number; };

interface NativeShare {
    selectShareSource?: (id: string) => Promise<void>;
    startShareAudio?: () => Promise<boolean>;
    stopShareAudio?: () => Promise<void>;
    takeShareAudio?: (cb: (chunk: Uint8Array) => void) => boolean;
}
const Native = () => (window as { HaloCordNative?: NativeShare; }).HaloCordNative;

let pending: ShareChoice | null = null;
let pendingAt = 0;

export const setPendingShare = (choice: ShareChoice) => {
    pending = choice;
    pendingAt = Date.now();
    if (choice.kind === "desktop") void Native()?.selectShareSource?.(choice.id);
};

// The page's own getUserMedia carries HaloCord's mic chain (noise filter, voice effects), so
// stream sound and cameras come from a blank frame's untouched copy.
let frame: HTMLIFrameElement | null = null;
const cleanWindow = (): Window | null => {
    try {
        if (!frame?.isConnected) {
            frame = document.createElement("iframe");
            frame.style.display = "none";
            document.body.appendChild(frame);
        }
        return frame.contentWindow;
    } catch {
        return null;
    }
};
const cleanMedia = (): MediaDevices => cleanWindow()?.navigator.mediaDevices ?? navigator.mediaDevices;

// The userscript's balance stage (the voice card's pan), so the stream pans exactly like the mic and speakers.
type Balance = (from: AudioNode, to: AudioNode, pan: number, level: number) => void;
const balance = () => (window as { __hcBalance?: Balance; }).__hcBalance;

// Why the pan can't work right now, or null. The userscript's Opus "Stereo" switch writes stereo=1 into every call
// connection's SDP, the stream's included; with it off the stream is encoded in mono and a pan would do nothing.
export const sharePanBlocker = () => {
    if (typeof balance() !== "function") return "Needs HaloCord's audio engine (the desktop shell).";
    try {
        if (JSON.parse(cleanWindow()?.localStorage.getItem("discord-stereo-config") ?? "{}")?.stereo === false)
            return "Needs Stereo: turn on Stereo in HaloCord's audio settings. Stream sound is sent in mono without it.";
    } catch { }
    return null;
};

type Sound = { track: MediaStreamTrack; stop: () => void; bus: GainNode; dest: AudioNode; };

// Every source ends in one stereo bus whose pan is the last stage before the stream's track.
const stereoOut = (ctx: AudioContext) => {
    const dest = ctx.createMediaStreamDestination();
    const bus = ctx.createGain();
    bus.connect(dest);
    return { bus, dest, track: dest.stream.getAudioTracks()[0] };
};

// A chosen input or capture card, routed through the stereo bus (a mono input reaches both ears before the pan).
const rawAudio = async (deviceId: string): Promise<Sound> => {
    const s = await cleanMedia().getUserMedia({
        audio: { deviceId: { exact: deviceId }, echoCancellation: false, noiseSuppression: false, autoGainControl: false, channelCount: 2 },
        video: false
    });
    const ctx = new AudioContext({ sampleRate: 48000, latencyHint: "interactive" });
    const out = stereoOut(ctx);
    ctx.createMediaStreamSource(s).connect(out.bus);
    return { ...out, stop: () => { s.getTracks().forEach(t => t.stop()); void ctx.close(); } };
};

// 48 kHz stereo float32 chunks from the shell, scheduled gap-free into one audio track.
const loopbackTrack = async (): Promise<Sound | null> => {
    const N = Native();
    if (!N?.takeShareAudio || !N.startShareAudio) return null;
    const ctx = new AudioContext({ sampleRate: 48000, latencyHint: "interactive" });
    const { bus, dest, track } = stereoOut(ctx);
    let at = 0, rest: Uint8Array | null = null, done = false;
    N.takeShareAudio(u8 => {
        if (done) return;
        let b = u8;
        if (rest) { b = new Uint8Array(rest.length + u8.length); b.set(rest); b.set(u8, rest.length); }
        const frames = Math.floor(b.length / 8);
        rest = b.length % 8 ? b.slice(frames * 8) : null;
        if (!frames) return;
        const f = new Float32Array(b.buffer.slice(b.byteOffset, b.byteOffset + frames * 8));
        const buf = ctx.createBuffer(2, frames, 48000), L = buf.getChannelData(0), R = buf.getChannelData(1);
        for (let i = 0; i < frames; i++) { L[i] = f[i * 2]; R[i] = f[i * 2 + 1]; }
        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.connect(bus);
        // 60 ms of headroom absorbs IPC timing; after a stall, restart from now instead of piling up delay.
        const now = ctx.currentTime;
        if (at < now + 0.02 || at > now + 0.25) at = now + 0.06;
        src.start(at);
        at += frames / 48000;
    });
    if (!await N.startShareAudio().catch(() => false)) { done = true; void ctx.close(); return null; }
    return {
        bus, dest, track,
        stop: () => { if (done) return; done = true; void N.stopShareAudio?.(); void ctx.close(); }
    };
};

const pickAudio = async (choice: ShareChoice | null): Promise<Sound | null> => {
    const audio = choice?.audio ?? "default";
    if (audio !== "default") return rawAudio(audio);
    if (choice?.kind !== "device") return loopbackTrack();
    // A capture card's own sound input shares its group id with the video input.
    const devices = await navigator.mediaDevices.enumerateDevices();
    const group = devices.find(d => d.kind === "videoinput" && d.deviceId === choice.id)?.groupId;
    const input = group && devices.find(d => d.kind === "audioinput" && d.groupId === group && d.deviceId !== "default" && d.deviceId !== "communications");
    return input ? rawAudio(input.deviceId) : null;
};

const videoConstraints = (c: MediaStreamConstraints | undefined) =>
    c?.video && typeof c.video === "object" ? c.video : {};

let restore: (() => void) | null = null;
let liveSound: Sound | null = null;

// Switches the running stream's sound on or off. False when no share with sound is running.
export const setLiveShareAudio = (on: boolean) => {
    if (!liveSound) return false;
    liveSound.track.enabled = on;
    return true;
};

// Pans the running stream's sound (gain changes, so it applies live). False when no share with sound is running.
// A mono stream stays centred: a pan there would only make it quieter.
export const setLiveSharePan = (pan: number) => {
    if (!liveSound) return false;
    balance()?.(liveSound.bus, liveSound.dest, sharePanBlocker() ? 0 : pan, 1);
    return true;
};

export const installShareCapture = () => {
    if (restore || !navigator.mediaDevices?.getDisplayMedia) return;
    const md = navigator.mediaDevices;
    const original = md.getDisplayMedia;
    md.getDisplayMedia = async function (constraints?: MediaStreamConstraints) {
        const choice = pending && Date.now() - pendingAt < 20000 ? pending : null;
        pending = null;
        const stream = choice?.kind === "device"
            ? await cleanMedia().getUserMedia({ video: { ...videoConstraints(constraints), deviceId: { exact: choice.id } }, audio: false })
            : await original.call(this, constraints);
        // Chromium's own loopback hears HaloCord too; the shell or the chosen device replaces it.
        for (const t of stream.getAudioTracks()) { stream.removeTrack(t); t.stop(); }
        // Without a hint Chromium encodes a screen as a slideshow: it keeps resolution and drops frames under load.
        if (getConfiguredStreamFps() > 15) for (const t of stream.getVideoTracks()) t.contentHint = "motion";
        if (!constraints?.audio || choice?.audio === "none") return stream;
        const sound = await pickAudio(choice).catch(e => { console.error("[HaloCord] stream sound failed", e); return null; });
        if (!sound?.track) return stream;
        // The mic-processing hook in the userscript must never swap this track for the mic.
        (sound.track as MediaStreamTrack & { __haloStreamAudio?: boolean; }).__haloStreamAudio = true;
        sound.track.enabled = !choice?.muted;
        liveSound = sound;
        setLiveSharePan(choice?.pan ?? 0);
        stream.addTrack(sound.track);
        const release = () => { if (liveSound === sound) liveSound = null; sound.stop(); sound.track.stop(); };
        // Discord ends a share with track.stop(), which fires no 'ended' event, so watch both.
        for (const t of stream.getVideoTracks()) {
            const { stop } = t;
            t.stop = function () { release(); return stop.call(t); };
            t.addEventListener("ended", release);
        }
        return stream;
    };
    restore = () => { md.getDisplayMedia = original; restore = null; };
};

export const uninstallShareCapture = () => restore?.();
