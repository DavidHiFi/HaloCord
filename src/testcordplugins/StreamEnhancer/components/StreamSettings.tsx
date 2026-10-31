/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import ErrorBoundary from "@components/ErrorBoundary";
import { classNameFactory } from "@utils/css";
import { ModalRoot, ModalSize, openModal, type RenderModalProps } from "@utils/modal";
import { useEffect, useState } from "@webpack/common";

import { applyLive, frameRates, heavyNote, isHeavy, loadSaved, modeFor, modes, resolutions, type Saved } from "../quality";
import { StreamEnhancerControlPanel, streamEnhancerSettings } from "../settings";

const cl = classNameFactory("vc-stream-enhancer-share-");
const ccl = classNameFactory("vc-stream-enhancer-camera-");

export function useAudioInputs() {
    const [inputs, setInputs] = useState<MediaDeviceInfo[]>([]);
    useEffect(() => {
        let live = true;
        navigator.mediaDevices.enumerateDevices()
            .then(d => live && setInputs(d.filter(x => x.kind === "audioinput" && x.deviceId && x.deviceId !== "default" && x.deviceId !== "communications")))
            .catch(() => { });
        return () => { live = false; };
    }, []);
    return inputs;
}

// Stream mode, resolution, frame rate and sound: the share picker's gear menu and the stream settings modal both show this.
export function QualityPanel({ opts, set, inputs }: { opts: Saved; set: (next: Partial<Saved>) => void; inputs: MediaDeviceInfo[]; }) {
    const [advanced, setAdvanced] = useState(opts.audio !== "default");
    const mode = modeFor(opts.height, opts.fps);
    const pill = (on: boolean, label: string, onClick: () => void) => (
        <button key={label} className={cl("pill", on && "pill-on")} onClick={onClick}>{label}</button>
    );

    return (
        <>
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
            {isHeavy(opts.height, opts.fps) && <p className={cl("warn")}>{heavyNote}</p>}
            <button className={cl("row", "check")} role="switch" aria-checked={opts.mute} onClick={() => set({ mute: !opts.mute })}>
                <span>Mute stream audio</span><span className={cl("box", opts.mute && "box-on")} />
            </button>
            <button className={cl("row", "check")} onClick={() => setAdvanced(!advanced)}>
                <span>Audio source</span><span className={cl("note")}>{advanced ? "▾" : "▸"}</span>
            </button>
            {advanced && (
                <select className={cl("select")} value={opts.audio} disabled={opts.mute} onChange={e => set({ audio: e.currentTarget.value })}>
                    <option value="default">Default: app or screen sound, without HaloCord</option>
                    {inputs.map(i => <option key={i.deviceId} value={i.deviceId}>{i.label || "Input device"}</option>)}
                </select>
            )}
        </>
    );
}

const StreamSettings = ErrorBoundary.wrap(function StreamSettings({ modalProps }: { modalProps: RenderModalProps; }) {
    const [opts, setOpts] = useState<Saved>(loadSaved);
    const inputs = useAudioInputs();
    const { showPanelButton } = streamEnhancerSettings.use(["showPanelButton"]);
    // Changes here apply to a running stream right away and become the defaults for the next one.
    const set = (next: Partial<Saved>) => {
        setOpts(o => ({ ...o, ...next }));
        applyLive(next);
    };

    return (
        <ModalRoot {...modalProps} size={ModalSize.LARGE} className={ccl("root")}>
            <div className={cl("head")}>
                <h2 className={cl("title")}>Advanced Stream Settings</h2>
                <button className={cl("close")} aria-label="Close" onClick={modalProps.onClose}>✕</button>
            </div>
            <div className={ccl("body")}>
                <QualityPanel opts={opts} set={set} inputs={inputs} />
                <StreamEnhancerControlPanel />
                <button className={cl("row", "check")} role="switch" aria-checked={showPanelButton}
                    onClick={() => { streamEnhancerSettings.store.showPanelButton = !showPanelButton; }}>
                    <span>Show a stream settings button in the user panel</span><span className={cl("box", showPanelButton && "box-on")} />
                </button>
            </div>
            <div className={cl("foot")}>
                <div className={cl("spacer")} />
                <button className={cl("go")} onClick={modalProps.onClose}>Done</button>
            </div>
        </ModalRoot>
    );
});

export const openStreamSettings = () => openModal(props => <StreamSettings modalProps={props} />);
