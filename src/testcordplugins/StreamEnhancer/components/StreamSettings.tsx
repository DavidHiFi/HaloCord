/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import ErrorBoundary from "@components/ErrorBoundary";
import { Switch } from "@components/Switch";
import { classNameFactory } from "@utils/css";
import { ModalRoot, ModalSize, openModal, type RenderModalProps } from "@utils/modal";
import { Select, Slider, useEffect, useState } from "@webpack/common";

import { applyLive, frameRates, heavyNote, isHeavy, loadSaved, modeFor, modes, resolutions, type Saved } from "../quality";
import { pickerTabs, StreamEnhancerControlPanel, streamEnhancerSettings } from "../settings";
import { sharePanBlocker } from "../shareCapture";
import { choiceAt, nearestChoice, showChoiceLabel } from "../slider";

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

// A labelled row with the same pill switch the plugin list uses; the whole row toggles it.
export function ToggleRow({ label, checked, onChange, disabled, title }: { label: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean; title?: string; }) {
    return (
        <label className={cl("toggle", disabled && "toggle-off")} title={title}>
            <span>{label}</span>
            <Switch checked={checked} onChange={onChange} disabled={disabled} />
        </label>
    );
}

// Pan positions in percent, 5% apart like the voice card's pan; the slider snaps to them, so the middle is exact centre.
const panChoices = Array.from({ length: 41 }, (_, i) => i * 5 - 100);
// Same wording as the voice card's pan (dvxPanText in the userscript).
const panText = (pct: number) => !pct ? "Center" : pct < 0 ? `L ${-pct}` : `R ${pct}`;

// Left/right balance of the stream's sound. Double-click puts it back in the centre.
function PanRow({ pan, set, muted }: { pan: number; set: (pan: number) => void; muted: boolean; }) {
    const [resets, setResets] = useState(0);
    const blocked = sharePanBlocker();
    const pct = Math.round(pan * 100);
    return (
        <div onDoubleClick={() => { if (blocked || muted) return; set(0); setResets(n => n + 1); }}>
            <div className={cl("label")}>Pan: {panText(pct)}</div>
            <Slider
                key={resets}
                disabled={!!blocked || muted}
                minValue={0}
                maxValue={panChoices.length - 1}
                markers={panChoices.map((_, i) => i)}
                initialValue={nearestChoice(pct, panChoices)}
                keyboardStep={1}
                stickToMarkers={true}
                onValueChange={i => set(choiceAt(i, panChoices) / 100)}
                onMarkerRender={i => <span className="vc-stream-enhancer-slider-marker">{showChoiceLabel(i, panChoices.length) ? panText(choiceAt(i, panChoices)) : ""}</span>}
                onValueRender={i => panText(choiceAt(i, panChoices))}
            />
            {blocked && <p className={cl("warn")}>{blocked}</p>}
        </div>
    );
}

// Stream mode, resolution, frame rate and sound, shown in the stream settings modal (the share picker's gear opens it).
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
            <ToggleRow label="Mute stream audio" checked={opts.mute} onChange={mute => set({ mute })} />
            <button className={cl("row", "check")} onClick={() => setAdvanced(!advanced)}>
                <span>Audio source</span><span className={cl("note")}>{advanced ? "▾" : "▸"}</span>
            </button>
            {advanced && (
                <select className={cl("select")} value={opts.audio} disabled={opts.mute} onChange={e => set({ audio: e.currentTarget.value })}>
                    <option value="default">Default: app or screen sound, without HaloCord</option>
                    {inputs.map(i => <option key={i.deviceId} value={i.deviceId}>{i.label || "Input device"}</option>)}
                </select>
            )}
            <PanRow pan={opts.pan} set={pan => set({ pan })} muted={opts.mute} />
        </>
    );
}

const StreamSettings = ErrorBoundary.wrap(function StreamSettings({ modalProps }: { modalProps: RenderModalProps; }) {
    const [opts, setOpts] = useState<Saved>(loadSaved);
    const inputs = useAudioInputs();
    const { showPanelButton, pickerTab } = streamEnhancerSettings.use(["showPanelButton", "pickerTab"]);
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
                <div className={cl("label")}>Picker opens on</div>
                <Select
                    options={pickerTabs}
                    isSelected={v => v === pickerTab}
                    select={v => { streamEnhancerSettings.store.pickerTab = v; }}
                    serialize={v => v}
                />
                <StreamEnhancerControlPanel />
                <ToggleRow label="Show a stream settings button in the user panel" checked={showPanelButton}
                    onChange={v => { streamEnhancerSettings.store.showPanelButton = v; }} />
            </div>
            <div className={cl("foot")}>
                <div className={cl("spacer")} />
                <button className={cl("go")} onClick={modalProps.onClose}>Done</button>
            </div>
        </ModalRoot>
    );
});

export const openStreamSettings = () => openModal(props => <StreamSettings modalProps={props} />);
