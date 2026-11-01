/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import ErrorBoundary from "@components/ErrorBoundary";
import { HaloSection, HaloSwitchRow } from "@components/HaloUI";
import { classNameFactory } from "@utils/css";
import { classes } from "@utils/misc";
import { ModalRoot, ModalSize, openModal, type RenderModalProps } from "@utils/modal";
import type { VideoDevice } from "@vencord/discord-types";
import { FluxDispatcher, MediaEngineStore, Select, useEffect, useRef, useState, useStateFromStores } from "@webpack/common";

import { streamEnhancerSettings } from "../settings";
import { Field, Segmented, Warn } from "./StreamSettings";

const cl = classNameFactory("vc-stream-enhancer-share-");
const ccl = classNameFactory("vc-stream-enhancer-camera-");

interface Dvx { get(key: string): unknown; set(key: string, value: unknown): void; applyCamera(): void; }
// Older shells expose __dvx without get/set; treat that as no camera controls instead of crashing.
const dvx = () => {
    const api = (window as { __dvx?: Partial<Dvx>; }).__dvx;
    return typeof api?.get === "function" && typeof api.set === "function" && typeof api.applyCamera === "function" ? api as Dvx : undefined;
};

const presets = [
    { id: "720p60", label: "720p · 60fps", vW: 1280, vH: 720, vFps: 60, vbMin: 2500000, vbTarget: 6000000, vbMax: 12000000 },
    { id: "1080p30", label: "1080p · 30fps", vW: 1920, vH: 1080, vFps: 30, vbMin: 4000000, vbTarget: 8000000, vbMax: 16000000 },
    { id: "1080p60", label: "1080p · 60fps", vW: 1920, vH: 1080, vFps: 60, vbMin: 2000000, vbTarget: 8000000, vbMax: 12000000 },
    { id: "1440p30", label: "1440p · 30fps", vW: 2560, vH: 1440, vFps: 30, vbMin: 8000000, vbTarget: 16000000, vbMax: 40000000 },
    { id: "1440p60", label: "1440p · 60fps", vW: 2560, vH: 1440, vFps: 60, vbMin: 10000000, vbTarget: 20000000, vbMax: 40000000 },
    { id: "1080p120", label: "1080p · 120fps", vW: 1920, vH: 1080, vFps: 120, vbMin: 10000000, vbTarget: 20000000, vbMax: 40000000 },
    { id: "2160p60", label: "4K · 60fps", vW: 3840, vH: 2160, vFps: 60, vbMin: 20000000, vbTarget: 40000000, vbMax: 80000000 }
] as const;
const presetChoices = presets.map(p => ({ value: p.id, label: p.label }));

// The preview's on/off is a plugin setting, so it stays as left across openings and restarts.
function Preview({ deviceId }: { deviceId: string; }) {
    const video = useRef<HTMLVideoElement>(null);
    const { cameraPreview: on, noMirroredCamera } = streamEnhancerSettings.use(["cameraPreview", "noMirroredCamera"]);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        if (!on) return;
        let stream: MediaStream | undefined;
        let live = true;
        setFailed(false);
        navigator.mediaDevices.getUserMedia({ video: { deviceId: deviceId && deviceId !== "default" ? { exact: deviceId } : undefined }, audio: false })
            .then(s => {
                if (!live) return s.getTracks().forEach(t => t.stop());
                stream = s;
                if (video.current) video.current.srcObject = s;
            })
            .catch(() => { if (live) setFailed(true); });
        return () => { live = false; stream?.getTracks().forEach(t => t.stop()); };
    }, [on, deviceId]);

    return (
        <>
            <div className={ccl("preview", !noMirroredCamera && "preview-mirror")}>
                {on && !failed ? <video ref={video} autoPlay muted playsInline /> : <span>{failed ? "The camera could not be opened." : "Preview is off."}</span>}
            </div>
            <HaloSwitchRow title="Camera preview" value={on} onChange={v => { streamEnhancerSettings.store.cameraPreview = v; }} />
        </>
    );
}

const CameraSettings = ErrorBoundary.wrap(function CameraSettings({ modalProps }: { modalProps: RenderModalProps; }) {
    const [, redraw] = useState(0);
    const { noMirroredCamera } = streamEnhancerSettings.use(["noMirroredCamera"]);
    const deviceMap = useStateFromStores([MediaEngineStore], () => MediaEngineStore.getVideoDevices());
    const devices = Object.values(deviceMap ?? {}) as VideoDevice[];
    const current = useStateFromStores([MediaEngineStore], () => MediaEngineStore.getVideoDeviceId() as string);
    const api = dvx();
    const unlocked = !!api?.get("videoHD");
    const active = presets.find(p => api?.get("vW") === p.vW && api?.get("vH") === p.vH && api?.get("vFps") === p.vFps)?.id;

    const change = (apply: () => void) => {
        apply();
        api?.applyCamera();
        redraw(n => n + 1);
    };
    const toggle = () => change(() => {
        api?.set("videoHD", !unlocked);
        api?.set("videoHDUserSet", true);
    });
    const pick = (id: typeof presets[number]["id"]) => change(() => {
        const p = presets.find(x => x.id === id);
        if (p) for (const key of ["vW", "vH", "vFps", "vbMin", "vbTarget", "vbMax"] as const) api?.set(key, p[key]);
    });

    return (
        <ModalRoot {...modalProps} size={ModalSize.LARGE} className={classes(ccl("root"), "vc-stream-enhancer-halo")}>
            <div className={cl("head")}>
                <h2 className={cl("title")}>Video Settings</h2>
                <button className={cl("close")} aria-label="Close" onClick={modalProps.onClose}>✕</button>
            </div>
            <div className={ccl("body")}>
                <HaloSection title="Camera">
                    <Field title="Camera">
                        <Select
                            options={devices.map(d => ({ label: d.name, value: d.id }))}
                            placeholder="No cameras found"
                            isDisabled={!devices.length}
                            isSelected={v => v === current}
                            select={id => FluxDispatcher.dispatch({ type: "MEDIA_ENGINE_SET_VIDEO_DEVICE", id })}
                            serialize={v => v}
                        />
                    </Field>
                    <Preview deviceId={current} />
                    <HaloSwitchRow title="No mirrored camera" description="Shows your own camera the way others see it instead of as a mirror image."
                        value={noMirroredCamera} onChange={v => { streamEnhancerSettings.store.noMirroredCamera = v; }} />
                </HaloSection>
                <HaloSection title="Advanced camera controls">
                    <HaloSwitchRow title="Unlocked camera" description={api ? "Removes Discord's 720p limit." : "Needs the HaloCord desktop shell. Not available in this window."}
                        value={unlocked} disabled={!api} onChange={toggle} />
                    <Warn title="Unlocked camera.">Resolution is negotiated up to the preset below. Your camera and connection decide the real result, and more cameras on a call cost more CPU and GPU.</Warn>
                    <Field title="Quality preset">
                        <Segmented label="Quality preset" choices={presetChoices} value={active} disabled={!api || !unlocked} onChange={pick} />
                        {api && !unlocked && <div className="hc-ui-row-desc">Turn on Unlocked camera to choose a preset.</div>}
                    </Field>
                </HaloSection>
            </div>
            <div className={cl("foot")}>
                <div className={cl("spacer")} />
                <button className={cl("go")} onClick={modalProps.onClose}>Done</button>
            </div>
        </ModalRoot>
    );
});

export const openCameraSettings = () => openModal(props => <CameraSettings modalProps={props} />);
