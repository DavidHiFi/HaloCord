/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import ErrorBoundary from "@components/ErrorBoundary";
import { HaloPill, HaloSection, HaloSwitchRow } from "@components/HaloUI";
import { Switch } from "@components/Switch";
import { classNameFactory } from "@utils/css";
import { classes } from "@utils/misc";
import { ModalRoot, ModalSize, openModal, type RenderModalProps } from "@utils/modal";
import { Slider, useEffect, useState } from "@webpack/common";
import type { ReactNode } from "react";

import { applyLive, frameRates, heavyNote, isHeavy, loadSaved, type Mode, modeFor, modes, resolutions, type Saved } from "../quality";
import { type PickerTab, pickerTabs, StreamEnhancerControlPanel, streamEnhancerSettings } from "../settings";
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

// The yellow warning box. It stays visible whatever the settings are.
export function Warn({ title, children }: { title: string; children: ReactNode; }) {
    return (
        <div className={cl("warn")} role="note">
            <span aria-hidden="true">⚠️ </span><b>{title}</b> {children}
        </div>
    );
}

// A HaloCord row with its control below the title instead of beside it.
export function Field({ title, side, children }: { title: string; side?: ReactNode; children: ReactNode; }) {
    return (
        <div className={classes("hc-ui-row", cl("field"))}>
            <div className={cl("field-head")}>
                <span className="hc-ui-row-title">{title}</span>
                {side}
            </div>
            {children}
        </div>
    );
}

export interface Choice<T> { value: T; label: string; note?: string; }

// Every choice in view at once; the picked one is lit green.
export function Segmented<T extends string | number>({ label, choices, value, onChange, disabled }: {
    label: string;
    choices: ReadonlyArray<Choice<T>>;
    value: T | undefined;
    onChange: (value: T) => void;
    disabled?: boolean;
}) {
    return (
        <div className={cl("seg")} role="radiogroup" aria-label={label}>
            {choices.map(c => (
                <button key={String(c.value)} type="button" role="radio" aria-checked={c.value === value} disabled={disabled}
                    className={cl("seg-item", c.value === value && "seg-on")} onClick={() => onChange(c.value)}>
                    <span>{c.label}</span>
                    {c.note && <span className={cl("seg-note")}>{c.note}</span>}
                </button>
            ))}
        </div>
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
        <Field title={`Pan: ${panText(pct)}`} side={blocked ? <HaloPill tone="warn">Off</HaloPill> : <HaloPill tone="good">Stereo on</HaloPill>}>
            <div onDoubleClick={() => { if (blocked || muted) return; set(0); setResets(n => n + 1); }}>
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
            </div>
            {blocked && <div className="hc-ui-row-desc">{blocked}</div>}
            <Warn title="Pan needs Stereo.">It only works while Stereo is on in HaloCord's audio settings. Without it, stream sound is sent in mono.</Warn>
        </Field>
    );
}

// Where the stream's sound comes from, every choice shown as a radio row.
function AudioSource({ value, inputs, disabled, onChange }: { value: string; inputs: MediaDeviceInfo[]; disabled: boolean; onChange: (id: string) => void; }) {
    const rows: Array<{ id: string; label: string; note?: string; }> = [
        { id: "default", label: "Default", note: "App or screen sound, without HaloCord" },
        ...inputs.map(i => ({ id: i.deviceId, label: i.label || "Input device" }))
    ];
    if (inputs.length && !rows.some(r => r.id === value)) rows.push({ id: value, label: "Saved input", note: "Not connected" });
    return (
        <div className={cl("radios")} role="radiogroup" aria-label="Audio source">
            {rows.map(r => (
                <button key={r.id} type="button" role="radio" aria-checked={value === r.id} disabled={disabled}
                    className={cl("row", value === r.id && "row-on")} onClick={() => onChange(r.id)}>
                    <span className={cl("radio")} /><span>{r.label}</span>{r.note && <span className={cl("note")}>{r.note}</span>}
                </button>
            ))}
        </div>
    );
}

const modeChoices: Array<Choice<Mode>> = [
    ...(Object.keys(modes) as Array<keyof typeof modes>).map(k => ({ value: k, label: modes[k].label, note: modes[k].note })),
    { value: "custom", label: "Custom" }
];
const resolutionChoices = resolutions.map(r => ({ value: r.height, label: r.label }));
const fpsChoices = frameRates.map(f => ({ value: f, label: `${f} FPS` }));

// Stream mode, resolution, frame rate and sound, shown in the stream settings modal (the share picker's gear opens it).
export function QualityPanel({ opts, set, inputs }: { opts: Saved; set: (next: Partial<Saved>) => void; inputs: MediaDeviceInfo[]; }) {
    const mode = modeFor(opts.height, opts.fps);
    const pickMode = (m: Mode) => {
        if (m !== "custom") set({ height: modes[m].height, fps: modes[m].fps });
        else if (mode !== "custom") set({ height: 1080, fps: 30 });
    };

    return (
        <>
            <HaloSection title="Quality">
                <Field title="Stream mode">
                    <Segmented label="Stream mode" choices={modeChoices} value={mode} onChange={pickMode} />
                </Field>
                <Field title="Screen resolution">
                    <Segmented label="Screen resolution" choices={resolutionChoices} value={opts.height} onChange={height => set({ height })} />
                </Field>
                <Field title="Frame rate" side={isHeavy(opts.height, opts.fps) && <HaloPill tone="warn">Heavy</HaloPill>}>
                    <Segmented label="Frame rate" choices={fpsChoices} value={opts.fps} onChange={fps => set({ fps })} />
                </Field>
                <Warn title="Heavy settings.">{heavyNote}</Warn>
            </HaloSection>
            <HaloSection title="Sound">
                <HaloSwitchRow title="Mute stream audio" value={opts.mute} onChange={mute => set({ mute })} />
                <Field title="Audio source">
                    <AudioSource value={opts.audio} inputs={inputs} disabled={opts.mute} onChange={audio => set({ audio })} />
                </Field>
                <PanRow pan={opts.pan} set={pan => set({ pan })} muted={opts.mute} />
            </HaloSection>
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
        <ModalRoot {...modalProps} size={ModalSize.LARGE} className={classes(ccl("root"), "vc-stream-enhancer-halo")}>
            <div className={cl("head")}>
                <h2 className={cl("title")}>Advanced Stream Settings</h2>
                <button className={cl("close")} aria-label="Close" onClick={modalProps.onClose}>✕</button>
            </div>
            <div className={ccl("body")}>
                <QualityPanel opts={opts} set={set} inputs={inputs} />
                <HaloSection title="Share picker">
                    <Field title="Picker opens on">
                        <Segmented label="Picker opens on" choices={pickerTabs} value={pickerTab as PickerTab} onChange={v => { streamEnhancerSettings.store.pickerTab = v; }} />
                    </Field>
                    <HaloSwitchRow title="Show a stream settings button in the user panel" value={showPanelButton}
                        onChange={v => { streamEnhancerSettings.store.showPanelButton = v; }} />
                </HaloSection>
                <HaloSection title="Badge, preview and viewer">
                    <StreamEnhancerControlPanel />
                </HaloSection>
            </div>
            <div className={cl("foot")}>
                <div className={cl("spacer")} />
                <button className={cl("go")} onClick={modalProps.onClose}>Done</button>
            </div>
        </ModalRoot>
    );
});

export const openStreamSettings = () => openModal(props => <StreamSettings modalProps={props} />);
