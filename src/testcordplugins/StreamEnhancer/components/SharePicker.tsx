/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { classNameFactory } from "@utils/css";
import { ModalRoot, ModalSize, openModal, type RenderModalProps } from "@utils/modal";
import { useEffect, useRef, useState } from "@webpack/common";

import { loadSaved, modeFor, modes, resolutions, save, type Saved, type Size, sizeFor } from "../quality";
import { streamEnhancerSettings } from "../settings";
import { setPendingShare, type ShareChoice } from "../shareCapture";
import { QualityPanel, useAudioInputs } from "./StreamSettings";

const cl = classNameFactory("vc-stream-enhancer-share-");

type Tab = "apps" | "screens" | "devices";
interface Source { id: string; name: string; thumb: string; icon?: string; }
interface Tile { id: string; name: string; thumb?: string; icon?: string; }

const Native = () => (window as { HaloCordNative?: { getShareSources?: () => Promise<Source[]>; }; }).HaloCordNative;

function GearIcon() {
    return <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" fillRule="evenodd" d="M10.56 1.1c-.46.05-.7.53-.64.98.18 1.16-.19 2.2-.98 2.53-.8.33-1.79-.15-2.49-1.1-.27-.36-.78-.52-1.14-.24-.77.59-1.45 1.27-2.04 2.04-.28.36-.12.87.24 1.14.96.7 1.43 1.7 1.1 2.49-.33.8-1.37 1.16-2.53.98-.45-.07-.93.18-.99.64a11.1 11.1 0 0 0 0 2.88c.06.46.54.7.99.64 1.16-.18 2.2.19 2.53.98.33.8-.14 1.79-1.1 2.49-.36.27-.52.78-.24 1.14.59.77 1.27 1.45 2.04 2.04.36.28.87.12 1.14-.24.7-.95 1.7-1.43 2.49-1.1.8.33 1.16 1.37.98 2.53-.07.45.18.93.64.99a11.1 11.1 0 0 0 2.88 0c.46-.06.7-.54.64-.99-.18-1.16.19-2.2.98-2.53.8-.33 1.79.14 2.49 1.1.27.36.78.52 1.14.24.77-.59 1.45-1.27 2.04-2.04.28-.36.12-.87-.24-1.14-.96-.7-1.43-1.7-1.1-2.49.33-.8 1.37-1.16 2.53-.98.45.07.93-.18.99-.64a11.1 11.1 0 0 0 0-2.88c-.06-.46-.54-.7-.99-.64-1.16.18-2.2-.19-2.53-.98-.33-.8.14-1.79 1.1-2.49.36-.27.52-.78.24-1.14a11.07 11.07 0 0 0-2.04-2.04c-.36-.28-.87-.12-1.14.24-.7.96-1.7 1.43-2.49 1.1-.8-.33-1.16-1.37-.98-2.53.07-.45-.18-.93-.64-.99a11.1 11.1 0 0 0-2.88 0ZM16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" clipRule="evenodd" /></svg>;
}

function SharePicker({ modalProps, onStart }: { modalProps: RenderModalProps; onStart: (choice: ShareChoice, size: Size, fps: number, sound: boolean) => void; }) {
    const [tab, setTab] = useState<Tab>("apps");
    const [sources, setSources] = useState<Source[] | null>(null);
    const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
    const inputs = useAudioInputs();
    const [picked, setPicked] = useState<string | null>(null);
    const [gear, setGear] = useState(false);
    const [opts, setOpts] = useState<Saved>(loadSaved);
    const { shareInstant } = streamEnhancerSettings.use(["shareInstant"]);
    const menu = useRef<HTMLDivElement>(null);
    const gearButton = useRef<HTMLButtonElement>(null);
    const set = (next: Partial<Saved>) => setOpts(o => ({ ...o, ...next }));

    // A click anywhere outside the open gear menu closes it.
    useEffect(() => {
        if (!gear) return;
        const close = (e: MouseEvent) => {
            const t = e.target as Node;
            if (!menu.current?.contains(t) && !gearButton.current?.contains(t)) setGear(false);
        };
        document.addEventListener("mousedown", close, true);
        return () => document.removeEventListener("mousedown", close, true);
    }, [gear]);

    useEffect(() => {
        let live = true;
        const load = () => Native()?.getShareSources?.().then(s => live && setSources(s ?? [])).catch(() => live && setSources([]));
        load();
        const timer = setInterval(load, 3000);
        navigator.mediaDevices.enumerateDevices()
            .then(d => live && setCameras(d.filter(x => x.kind === "videoinput" && x.deviceId)))
            .catch(() => { });
        return () => { live = false; clearInterval(timer); };
    }, []);

    const tiles: Tile[] = tab === "devices"
        ? cameras.map((c, i) => ({ id: "device:" + c.deviceId, name: c.label || `Camera ${i + 1}` }))
        : (sources ?? []).filter(s => s.id.startsWith(tab === "apps" ? "window:" : "screen:"));
    const mode = modeFor(opts.height, opts.fps);
    const resLabel = resolutions.find(r => r.height === opts.height)?.label ?? "1080p";
    const summary = `${mode === "custom" ? "Custom" : modes[mode].label} ${resLabel} · ${opts.fps}fps`;
    const audioName = opts.audio === "default" ? "Default" : inputs.find(i => i.deviceId === opts.audio)?.label || "Default";

    const go = (id = picked) => {
        if (!id) return;
        save(opts);
        modalProps.onClose();
        const choice: ShareChoice = id.startsWith("device:")
            ? { kind: "device", id: id.slice(7), audio: opts.audio, muted: opts.mute }
            : { kind: "desktop", id, audio: opts.audio, muted: opts.mute };
        onStart(choice, sizeFor(opts.height), opts.fps, true);
    };

    const tabButton = (id: Tab, label: string) => (
        <button className={cl("tab", tab === id && "tab-on")} onClick={() => { setTab(id); setPicked(null); }}>{label}</button>
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
                    <button key={t.id} className={cl("tile", picked === t.id && "tile-on")} onClick={() => shareInstant ? go(t.id) : setPicked(t.id)}>
                        <div className={cl("thumb")}>{t.thumb ? <img src={t.thumb} alt="" /> : <span className={cl("cam")}>🎥</span>}</div>
                        <div className={cl("name")}>{t.icon && <img className={cl("icon")} src={t.icon} alt="" />}<span>{t.name}</span></div>
                    </button>
                ))}
            </div>
            <div className={cl("foot")}>
                {gear && (
                    <div ref={menu} className={cl("menu")}>
                        <QualityPanel opts={opts} set={set} inputs={inputs} />
                    </div>
                )}
                <button ref={gearButton} className={cl("summary")} onClick={() => setGear(!gear)}>
                    <GearIcon /><span>{summary}</span>{!opts.mute && opts.audio !== "default" && <span className={cl("note")}>· {audioName}</span>}{opts.mute && <span className={cl("note")}>· muted</span>}
                </button>
                <div className={cl("spacer")} />
                <button className={cl("cancel")} onClick={modalProps.onClose}>Cancel</button>
                <button className={cl("go")} disabled={!picked} onClick={() => go()}>Go Live</button>
                <button className={cl("instant", shareInstant && "instant-on")} role="switch" aria-checked={shareInstant}
                    title={shareInstant ? "Clicking a window or screen starts the stream right away. Click to pick first and press Go Live." : "Pick a window or screen, then press Go Live. Click to start the stream on the first click instead."}
                    onClick={() => { streamEnhancerSettings.store.shareInstant = !shareInstant; setPicked(null); }}>
                    <span className={cl("box", shareInstant && "box-on")} /><span>Start on click</span>
                </button>
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
