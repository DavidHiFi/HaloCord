/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { classNameFactory } from "@utils/css";
import { ModalRoot, ModalSize, openModal, type RenderModalProps } from "@utils/modal";
import { useEffect, useState } from "@webpack/common";

import { normalizeConfig, streamEnhancerSettings } from "../settings";
import { setPendingShare,type ShareChoice } from "../shareCapture";

const cl = classNameFactory("vc-stream-enhancer-share-");

type Tab = "apps" | "screens" | "devices";
type Mode = "gaming" | "screenshare" | "custom";
interface Source { id: string; name: string; thumb: string; icon?: string; }
interface Tile { id: string; name: string; thumb?: string; icon?: string; }
type Size = { width: number; height: number; };

const resolutions = [
    { label: "720p", height: 720 },
    { label: "1080p", height: 1080 },
    { label: "1440p", height: 1440 },
    { label: "Source", height: 0 }
] as const;
const frameRates = [15, 30, 60] as const;
const modes: Record<Exclude<Mode, "custom">, { label: string; note: string; height: number; fps: number; }> = {
    gaming: { label: "Gaming", note: "1440p · 60fps", height: 1440, fps: 60 },
    screenshare: { label: "Screenshare", note: "Source · 15fps", height: 0, fps: 15 }
};

const sourceSize = (): Size => ({
    width: Math.round(screen.width * devicePixelRatio / 2) * 2,
    height: Math.round(screen.height * devicePixelRatio / 2) * 2
});
const sizeFor = (height: number): Size => height ? { width: Math.round(height * 16 / 9 / 2) * 2, height } : sourceSize();
const modeFor = (height: number, fps: number): Mode =>
    (Object.keys(modes) as Array<keyof typeof modes>).find(k => modes[k].height === height && modes[k].fps === fps) ?? "custom";

interface Saved { height: number; fps: number; mute: boolean; audio: string; }
const loadSaved = (): Saved => {
    const c = normalizeConfig(streamEnhancerSettings.store.config);
    const s = streamEnhancerSettings.store;
    const height = resolutions.some(r => r.height === s.shareHeight) ? s.shareHeight : 1080;
    const fps = (frameRates as readonly number[]).includes(c.streamMaxFps) ? c.streamMaxFps : 60;
    return { height, fps, mute: !!s.shareMute, audio: s.shareAudio || "default" };
};
const save = (v: Saved) => {
    const { store } = streamEnhancerSettings;
    store.shareHeight = v.height;
    store.shareMute = v.mute;
    store.shareAudio = v.audio;
    const size = sizeFor(v.height);
    store.config = normalizeConfig({ ...normalizeConfig(store.config), streamTweaksEnabled: true, streamWidth: size.width, streamHeight: size.height, streamMaxFps: v.fps });
};

const Native = () => (window as { HaloCordNative?: { getShareSources?: () => Promise<Source[]>; }; }).HaloCordNative;

function GearIcon() {
    return <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" fillRule="evenodd" d="M10.56 1.1c-.46.05-.7.53-.64.98.18 1.16-.19 2.2-.98 2.53-.8.33-1.79-.15-2.49-1.1-.27-.36-.78-.52-1.14-.24-.77.59-1.45 1.27-2.04 2.04-.28.36-.12.87.24 1.14.96.7 1.43 1.7 1.1 2.49-.33.8-1.37 1.16-2.53.98-.45-.07-.93.18-.99.64a11.1 11.1 0 0 0 0 2.88c.06.46.54.7.99.64 1.16-.18 2.2.19 2.53.98.33.8-.14 1.79-1.1 2.49-.36.27-.52.78-.24 1.14.59.77 1.27 1.45 2.04 2.04.36.28.87.12 1.14-.24.7-.95 1.7-1.43 2.49-1.1.8.33 1.16 1.37.98 2.53-.07.45.18.93.64.99a11.1 11.1 0 0 0 2.88 0c.46-.06.7-.54.64-.99-.18-1.16.19-2.2.98-2.53.8-.33 1.79.14 2.49 1.1.27.36.78.52 1.14.24.77-.59 1.45-1.27 2.04-2.04.28-.36.12-.87-.24-1.14-.96-.7-1.43-1.7-1.1-2.49.33-.8 1.37-1.16 2.53-.98.45.07.93-.18.99-.64a11.1 11.1 0 0 0 0-2.88c-.06-.46-.54-.7-.99-.64-1.16.18-2.2-.19-2.53-.98-.33-.8.14-1.79 1.1-2.49.36-.27.52-.78.24-1.14a11.07 11.07 0 0 0-2.04-2.04c-.36-.28-.87-.12-1.14.24-.7.96-1.7 1.43-2.49 1.1-.8-.33-1.16-1.37-.98-2.53.07-.45-.18-.93-.64-.99a11.1 11.1 0 0 0-2.88 0ZM16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" clipRule="evenodd" /></svg>;
}

function SharePicker({ modalProps, onStart }: { modalProps: RenderModalProps; onStart: (choice: ShareChoice, size: Size, fps: number, sound: boolean) => void; }) {
    const [tab, setTab] = useState<Tab>("apps");
    const [sources, setSources] = useState<Source[] | null>(null);
    const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
    const [inputs, setInputs] = useState<MediaDeviceInfo[]>([]);
    const [picked, setPicked] = useState<string | null>(null);
    const [gear, setGear] = useState(false);
    const [advanced, setAdvanced] = useState(false);
    const [opts, setOpts] = useState<Saved>(loadSaved);
    const set = (next: Partial<Saved>) => setOpts(o => ({ ...o, ...next }));

    useEffect(() => {
        let live = true;
        const load = () => Native()?.getShareSources?.().then(s => live && setSources(s ?? [])).catch(() => live && setSources([]));
        load();
        const timer = setInterval(load, 3000);
        navigator.mediaDevices.enumerateDevices().then(d => {
            if (!live) return;
            setCameras(d.filter(x => x.kind === "videoinput" && x.deviceId));
            setInputs(d.filter(x => x.kind === "audioinput" && x.deviceId && x.deviceId !== "default" && x.deviceId !== "communications"));
        }).catch(() => { });
        return () => { live = false; clearInterval(timer); };
    }, []);

    const tiles: Tile[] = tab === "devices"
        ? cameras.map((c, i) => ({ id: "device:" + c.deviceId, name: c.label || `Camera ${i + 1}` }))
        : (sources ?? []).filter(s => s.id.startsWith(tab === "apps" ? "window:" : "screen:"));
    const mode = modeFor(opts.height, opts.fps);
    const resLabel = resolutions.find(r => r.height === opts.height)?.label ?? "1080p";
    const summary = `${mode === "custom" ? "Custom" : modes[mode].label} ${resLabel} · ${opts.fps}fps`;
    const audioName = opts.audio === "default" ? "Default" : inputs.find(i => i.deviceId === opts.audio)?.label || "Default";

    const go = () => {
        if (!picked) return;
        save(opts);
        modalProps.onClose();
        const choice: ShareChoice = picked.startsWith("device:")
            ? { kind: "device", id: picked.slice(7), audio: opts.mute ? "none" : opts.audio }
            : { kind: "desktop", id: picked, audio: opts.mute ? "none" : opts.audio };
        onStart(choice, sizeFor(opts.height), opts.fps, !opts.mute);
    };

    const tabButton = (id: Tab, label: string) => (
        <button className={cl("tab", tab === id && "tab-on")} onClick={() => { setTab(id); setPicked(null); }}>{label}</button>
    );
    const pill = (on: boolean, label: string, onClick: () => void) => (
        <button key={label} className={cl("pill", on && "pill-on")} onClick={onClick}>{label}</button>
    );

    return (
        <ModalRoot {...modalProps} size={ModalSize.LARGE} className={cl("root")}>
            <div className={cl("head")}>
                <h2 className={cl("title")}>Screen Share</h2>
                <button className={cl("close")} aria-label="Close" onClick={modalProps.onClose}>✕</button>
            </div>
            <div className={cl("tabs")}>
                {tabButton("apps", "Applications")}
                {tabButton("screens", "Entire Screen")}
                {tabButton("devices", "Devices")}
            </div>
            <div className={cl("grid")}>
                {sources == null && tab !== "devices" && <div className={cl("empty")}>Loading…</div>}
                {(sources != null || tab === "devices") && !tiles.length && <div className={cl("empty")}>{tab === "devices" ? "No cameras or capture devices found." : "Nothing to share here."}</div>}
                {tiles.map(t => (
                    <button key={t.id} className={cl("tile", picked === t.id && "tile-on")} onClick={() => setPicked(t.id)}>
                        <div className={cl("thumb")}>{t.thumb ? <img src={t.thumb} alt="" /> : <span className={cl("cam")}>🎥</span>}</div>
                        <div className={cl("name")}>{t.icon && <img className={cl("icon")} src={t.icon} alt="" />}<span>{t.name}</span></div>
                    </button>
                ))}
            </div>
            <div className={cl("foot")}>
                {gear && (
                    <div className={cl("menu")}>
                        <div className={cl("label")}>Stream Mode</div>
                        {(Object.keys(modes) as Array<keyof typeof modes>).map(k => (
                            <button key={k} className={cl("row", mode === k && "row-on")} onClick={() => set({ height: modes[k].height, fps: modes[k].fps })}>
                                <span className={cl("radio")} /><span>{modes[k].label}</span><span className={cl("note")}>{modes[k].note}</span>
                            </button>
                        ))}
                        <button className={cl("row", mode === "custom" && "row-on")} onClick={() => mode !== "custom" && set({ height: 1080, fps: 30 })}>
                            <span className={cl("radio")} /><span>Custom</span>
                        </button>
                        <div className={cl("label")}>Screen Resolution</div>
                        <div className={cl("pills")}>{resolutions.map(r => pill(opts.height === r.height, r.label, () => set({ height: r.height })))}</div>
                        <div className={cl("label")}>Frame Rate</div>
                        <div className={cl("pills")}>{frameRates.map(f => pill(opts.fps === f, `${f} FPS`, () => set({ fps: f })))}</div>
                        <button className={cl("row", "check")} onClick={() => set({ mute: !opts.mute })}>
                            <span>Mute stream audio</span><span className={cl("box", opts.mute && "box-on")} />
                        </button>
                        <button className={cl("row", "check")} onClick={() => setAdvanced(!advanced)}>
                            <span>Advanced</span><span className={cl("note")}>{advanced ? "▾" : "▸"}</span>
                        </button>
                        {advanced && (
                            <>
                                <div className={cl("label")}>Audio Source</div>
                                <select className={cl("select")} value={opts.audio} disabled={opts.mute} onChange={e => set({ audio: e.currentTarget.value })}>
                                    <option value="default">Default: app or screen sound, without HaloCord</option>
                                    {inputs.map(i => <option key={i.deviceId} value={i.deviceId}>{i.label || "Input device"}</option>)}
                                </select>
                            </>
                        )}
                    </div>
                )}
                <button className={cl("summary")} onClick={() => setGear(!gear)}>
                    <GearIcon /><span>{summary}</span>{!opts.mute && opts.audio !== "default" && <span className={cl("note")}>· {audioName}</span>}{opts.mute && <span className={cl("note")}>· muted</span>}
                </button>
                <div className={cl("spacer")} />
                <button className={cl("cancel")} onClick={modalProps.onClose}>Cancel</button>
                <button className={cl("go")} disabled={!picked} onClick={go}>Go Live</button>
            </div>
        </ModalRoot>
    );
}

// The web build starts a stream straight from the Share Screen button, so HaloCord opens a picker
// laid out like the desktop app's: what to share, quality, sound, then Go Live.
export const openSharePicker = (start: (size: Size, sound: boolean, fps: number) => void) => {
    openModal(props => <SharePicker modalProps={props} onStart={(choice, size, fps, sound) => {
        setPendingShare(choice);
        start(size, sound, fps);
    }} />);
};
