/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Button } from "@components/Button";
import { Divider } from "@components/Divider";
import { FormSwitch } from "@components/FormSwitch";
import { Heading } from "@components/Heading";
import { classNameFactory } from "@utils/css";
import { ModalContent, ModalFooter, ModalHeader, ModalRoot, ModalSize, openModal,type RenderModalProps } from "@utils/modal";
import type { SelectOption } from "@vencord/discord-types";
import { findByCode, findByPropsLazy, findStoreLazy } from "@webpack";
import { ContextMenuApi, Menu, Select, Slider, TextInput, Toasts, useEffect, useState, useStateFromStores } from "@webpack/common";
import type { MouseEvent, ReactNode } from "react";

import {
    applyStreamPreset,
    defaultStreamEnhancerConfig,
    getDefaultGoLiveSourceTypeValue,
    getSupportedStreamCodec,
    isStreamCodecAvailable,
    normalizeConfig,
    refreshAvailableVideoCodecs,
    shouldOverrideStreamResolution,
    type StreamCodec,
    type StreamEnhancerConfig,
    streamEnhancerSettings,
    streamPresetButtons,
    streamResolutionOptions,
    syncCurrentGoLiveSource,
    syncCustomPreviewForKey
} from "../settings";
import { choiceAt, nearestChoice, showChoiceLabel, sliderChoices } from "../slider";

const cl = classNameFactory("vc-stream-enhancer-");

function StreamEnhancerSourceIcon({ className, height = 24, width = 24 }: { className?: string; height?: number; width?: number; }) {
    return (
        <svg className={className} height={height} width={width} viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M4 5h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-6v2h3v2H7v-2h3v-2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm0 2v8h16V7H4Zm7 2 4 2-4 2V9Z" />
        </svg>
    );
}
const codecOptions = ["auto", "av1", "vp9", "h264"] as const;
const fpsOptions = [10, 30, 60, 120, 240, 320] as const;
const streamBitrateOptions = [12000, 24000, 50000, 110000] as const;
const previewScaleMarkers = [80, 90, 100, 110, 120, 140, 160] as const;
const previewColorMarkers = [50, 75, 100, 125, 150, 175, 200] as const;
const previewWidthMarkers = [640, 960, 1280, 1600, 1920, 2560, 3840] as const;
const previewHeightMarkers = [360, 540, 720, 900, 1080, 1440, 2160] as const;
const previewRetryMarkers = [3, 5, 10, 15, 30, 60, 120] as const;

type GoLiveAudioSource = {
    deviceId: string;
    label: string;
};
type GoLiveStreamSource = {
    id: string;
    name?: string;
};

export const goLiveStreamEnhanceSourceType = "stream_enhance";

type GoLivePreset = 3;
type GoLiveResolution = 480 | 720 | 1080 | 1440;
type GoLiveFps = 5 | 15 | 30 | 60;
type GoLiveAction =
    | { type: "set_audio_source"; audioSourceId: string; }
    | { type: "set_fps"; fps: GoLiveFps; }
    | { type: "set_notify_friends"; value: boolean; }
    | { type: "set_preset"; preset: GoLivePreset; }
    | { type: "set_resolution"; resolution: GoLiveResolution; }
    | { type: "set_source_type"; sourceType: string; };
type GoLiveDispatch = (action: GoLiveAction) => void;
type GoLiveModalState = {
    audioSourceId?: string | null;
    deviceSources?: GoLiveStreamSource[];
    fps: GoLiveFps;
    fetchingSources?: boolean;
    muteStreamAudio?: boolean;
    notifyFriends?: boolean;
    resolution: GoLiveResolution;
    screenSources?: GoLiveStreamSource[];
    selectedChannel?: string | null;
    sourceType?: string;
    windowSources?: GoLiveStreamSource[];
};
type GoLiveModalBinding = {
    dispatch: GoLiveDispatch;
    state: GoLiveModalState;
};
type GoLiveSourceStoreLike = {
    getGoLiveSource?: () => {
        cameraSource?: {
            audioDeviceGuid?: string | null;
            videoDeviceGuid?: string | null;
        };
        desktopSource?: {
            id?: string | null;
        };
    } | null;
};
type GoLiveActionCreatorsLike = {
    setGoLiveSource?: (source: {
        cameraSettings?: {
            audioDeviceGuid?: string | null;
            videoDeviceGuid: string;
        };
        context: "stream";
        desktopSettings?: {
            sound: boolean;
            sourceId: string;
        };
        qualityOptions: {
            frameRate: GoLiveFps;
            preset: GoLivePreset;
            resolution: GoLiveResolution;
        };
    }) => void;
};
type OpenGoLiveModalArgs = {
    analyticsLocation?: string;
    allowOneClickGoLive?: boolean;
    appContext?: string;
    pid?: number | null;
};
type OpenGoLiveModalExports = {
    H?: (args: OpenGoLiveModalArgs) => Promise<void>;
};
type GoLiveAnalyticsConstants = {
    BRT: {
        APP: string;
    };
    ThZ: {
        OVERLAY_NUDGE: string;
    };
};
type AudioSettingsActionCreatorsLike = {
    setBypassSystemInputProcessing?: (enabled: boolean) => void;
    setQoS?: (enabled: boolean) => void;
};
type MediaEngineStoreLike = {
    getBypassSystemInputProcessing?: () => boolean;
    getQoS?: () => boolean;
};

let currentGoLiveAudioSourceId: string | null = null;
let currentGoLiveDispatch: GoLiveDispatch | undefined;
let currentGoLiveNotifyFriends = false;
let currentGoLiveSoundEnabled = true;
const handledGoLiveSourceDispatches = new WeakSet<GoLiveDispatch>();
const mediaEngineStore = findStoreLazy("MediaEngineStore") as MediaEngineStoreLike;
const goLiveSourceStore = findByPropsLazy("getGoLiveSource") as GoLiveSourceStoreLike;
const audioSettingsActionCreators = findByPropsLazy("setQoS") as AudioSettingsActionCreatorsLike;
const goLiveActionCreators = findByPropsLazy("setGoLiveSource") as GoLiveActionCreatorsLike;
const goLiveAnalyticsConstants = findByPropsLazy("BRT", "ThZ") as GoLiveAnalyticsConstants;

const getOpenGoLiveModal = (): OpenGoLiveModalExports | null => {
    try {
        return findByCode("allowOneClickGoLive") as OpenGoLiveModalExports;
    } catch {
        return null;
    }
};

const getResolutionValue = (config: StreamEnhancerConfig) => `${config.streamWidth} x ${config.streamHeight}`;
const compactMarker = (value: number) => value < 1000
    ? String(Math.round(value))
    : `${value % 1000 === 0 ? value / 1000 : (value / 1000).toFixed(1).replace(/\.0$/, "")}k`;
const goLiveCustomPreset: GoLivePreset = 3;

const toGoLiveResolution = (height: number): GoLiveResolution => {
    if (height <= 480) return 480;
    if (height <= 720) return 720;
    if (height <= 1080) return 1080;
    return 1440;
};

const toGoLiveFps = (fps: number): GoLiveFps => {
    if (fps <= 10) return 5;
    if (fps <= 22) return 15;
    if (fps <= 45) return 30;
    return 60;
};

const syncGoLiveQuality = (config: StreamEnhancerConfig) => {
    if (!shouldOverrideStreamResolution()) return;
    const qualityOptions = {
        frameRate: toGoLiveFps(config.streamMaxFps),
        preset: goLiveCustomPreset,
        resolution: toGoLiveResolution(config.streamHeight)
    } as const;

    if (!currentGoLiveDispatch) return;

    currentGoLiveDispatch({ type: "set_preset", preset: qualityOptions.preset });
    currentGoLiveDispatch({ type: "set_resolution", resolution: qualityOptions.resolution });
    currentGoLiveDispatch({ type: "set_fps", fps: qualityOptions.frameRate });

    const currentSource = goLiveSourceStore.getGoLiveSource?.();
    if (currentSource?.cameraSource?.videoDeviceGuid) {
        goLiveActionCreators.setGoLiveSource?.({
            cameraSettings: {
                audioDeviceGuid: currentSource.cameraSource.audioDeviceGuid,
                videoDeviceGuid: currentSource.cameraSource.videoDeviceGuid
            },
            context: "stream",
            qualityOptions
        });
        return;
    }

    const sourceId = currentSource?.desktopSource?.id;
    if (!sourceId) return;

    goLiveActionCreators.setGoLiveSource?.({
        context: "stream",
        desktopSettings: {
            sound: currentGoLiveSoundEnabled,
            sourceId
        },
        qualityOptions
    });
};

const setGoLiveNotifyFriends = (value: boolean) => {
    currentGoLiveNotifyFriends = value;
    currentGoLiveDispatch?.({ type: "set_notify_friends", value });
};

function SettingsCard({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode; }) {
    return (
        <section className={cl("go-live-card")}>
            <div className={cl("go-live-card-copy")}>
                <Heading tag="h3" className={cl("go-live-card-title")}>{title}</Heading>
                {subtitle && <div className={cl("go-live-card-subtitle")}>{subtitle}</div>}
            </div>
            {children}
        </section>
    );
}

function QuickPillButton({
    active,
    disabled,
    label,
    onClick
}: {
    active?: boolean;
    disabled?: boolean;
    label: string;
    onClick: () => void;
}) {
    return (
        <Button
            size="small"
            variant={active ? "primary" : "secondary"}
            className={cl("go-live-pill")}
            disabled={disabled}
            onClick={onClick}
        >
            {label}
        </Button>
    );
}

function SliderField({
    label,
    value,
    min,
    max,
    markers,
    onChange,
    formatter
}: {
    label: string;
    value: number;
    min: number;
    max: number;
    markers: readonly number[];
    onChange: (value: number) => void;
    formatter?: (value: number) => string;
}) {
    const choices = sliderChoices([...markers, value], min, max);
    const format = (position: number) => formatter?.(choiceAt(position, choices)) ?? String(choiceAt(position, choices));
    return (
        <div className={cl("go-live-field")}>
            <div className={cl("go-live-slider-label")}>
                <span>{label}</span>
                <span className={cl("go-live-slider-value")}>{formatter?.(value) ?? String(value)}</span>
            </div>
            <Slider
                key={`${label}-${value}`}
                minValue={0}
                maxValue={choices.length - 1}
                markers={choices.map((_, index) => index)}
                initialValue={nearestChoice(value, choices)}
                keyboardStep={1}
                stickToMarkers={true}
                onValueChange={next => onChange(choiceAt(next, choices))}
                onMarkerRender={next => <span className="vc-stream-enhancer-slider-marker">{showChoiceLabel(next, choices.length) ? format(next) : ""}</span>}
                onValueRender={format}
            />
        </div>
    );
}

function GoLiveQuickPanel({ selectedAudioSourceId }: { selectedAudioSourceId?: string | null; }) {
    const { config } = streamEnhancerSettings.use(["config"]);
    const normalized = normalizeConfig(config);
    const [availableCodecs, setAvailableCodecs] = useState<Record<StreamCodec, boolean>>({
        auto: true,
        av1: false,
        vp9: false,
        h264: true
    });
    const qosEnabled = useStateFromStores([mediaEngineStore], () => mediaEngineStore.getQoS?.() ?? false);
    const [audioSources, setAudioSources] = useState<GoLiveAudioSource[]>([]);
    const [customPreviewUrl, setCustomPreviewUrl] = useState(normalized.customPreviewUrl);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const selectedResolution = getResolutionValue(normalized);
    const resolutionOptions = streamResolutionOptions.some(option => option.value === selectedResolution)
        ? streamResolutionOptions
        : [{ label: selectedResolution, value: selectedResolution }, ...streamResolutionOptions];
    const applyConfig = (next: StreamEnhancerConfig) => {
        streamEnhancerSettings.store.config = next;
        syncGoLiveQuality(next);
    };
    const setConfig = (next: Partial<StreamEnhancerConfig>) => {
        const updated = normalizeConfig({
            ...normalized,
            ...next
        });
        applyConfig(updated);
        for (const key of Object.keys(next)) syncCustomPreviewForKey(key);

        if ("streamCodec" in next) {
            syncCurrentGoLiveSource(updated);
        }
    };

    useEffect(() => {
        void refreshAvailableVideoCodecs().then(() => {
            setAvailableCodecs({
                auto: true,
                av1: isStreamCodecAvailable("av1"),
                vp9: isStreamCodecAvailable("vp9"),
                h264: true
            });
        });
    }, []);

    useEffect(() => {
        setCustomPreviewUrl(normalized.customPreviewUrl);
    }, [normalized.customPreviewUrl]);

    useEffect(() => {
        if (typeof navigator === "undefined" || navigator.mediaDevices?.enumerateDevices == null) return;

        void navigator.mediaDevices.enumerateDevices()
            .then(devices => {
                setAudioSources(
                    devices
                        .filter(device => device.kind === "audioinput")
                        .map((device, index) => ({
                            deviceId: device.deviceId,
                            label: device.label || `Audio source ${index + 1}`
                        }))
                );
            })
            .catch(() => {
                Toasts.show({
                    id: Toasts.genId(),
                    type: Toasts.Type.FAILURE,
                    message: "StreamEnhancer: Could not load audio input devices."
                });
            });
    }, []);

    const audioSourceOptions: SelectOption[] = audioSources.map(source => ({
        label: source.label,
        value: source.deviceId
    }));

    return (
        <div className={cl("go-live-panel")}>
            <div className={cl("go-live-hero")}>
                <div className={cl("go-live-hero-copy")}>
                    <Heading tag="h2" className={cl("go-live-hero-title")}>Go Live Setup</Heading>
                    <div className={cl("go-live-hero-subtitle")}>Use the quick controls below to pick your audio source, resolution and frame rate before you start streaming.</div>
                </div>
            </div>

            <div className={cl("go-live-grid")}>
                <SettingsCard title="Resolution" subtitle="Set the main stream size and frame rate first.">
                    <div className={cl("go-live-toggle-grid")}>
                        <FormSwitch value={normalized.streamTweaksEnabled} onChange={value => setConfig({ streamTweaksEnabled: value })} title="Override FPS and resolution" />
                    </div>
                    <Divider />
                    <div className={cl("go-live-pill-row")}>
                        {streamPresetButtons.map(([preset, label]) => (
                            <QuickPillButton
                                key={preset}
                                label={label}
                                onClick={() => applyConfig(applyStreamPreset(normalized, preset))}
                            />
                        ))}
                    </div>
                    <Divider />
                    <div className={cl("go-live-field")}>
                        <div className={cl("go-live-field-label")}>Resolution</div>
                        <Select
                            options={resolutionOptions}
                            isSelected={value => value === selectedResolution}
                            select={value => {
                                const [width, height] = value.split(" x ").map(Number);
                                if (!Number.isFinite(width) || !Number.isFinite(height)) return;
                                setConfig({ streamWidth: width, streamHeight: height });
                            }}
                            serialize={value => value}
                        />
                    </div>
                    <div className={cl("go-live-field-grid")}>
                        <div className={cl("go-live-stat")}>
                            <div className={cl("go-live-stat-label")}>FPS</div>
                            <div className={cl("go-live-stat-value")}>{normalized.streamMaxFps}</div>
                        </div>
                        <div className={cl("go-live-stat")}>
                            <div className={cl("go-live-stat-label")}>Video bitrate</div>
                            <div className={cl("go-live-stat-value")}>{normalized.streamVideoBitrateKbps} kbps</div>
                        </div>
                    </div>
                    <div className={cl("go-live-pill-row")}>
                        {fpsOptions.map(fps => (
                            <QuickPillButton
                                key={fps}
                                active={normalized.streamMaxFps === fps}
                                label={`${fps} FPS`}
                                onClick={() => setConfig({ streamMaxFps: fps })}
                            />
                        ))}
                    </div>
                </SettingsCard>

                <SettingsCard title="Audio Source" subtitle="Choose which Discord input the current Go Live session should use.">
                    {audioSourceOptions.length > 0 ? (
                        <Select
                            options={audioSourceOptions}
                            isSelected={value => value === selectedAudioSourceId}
                            select={value => currentGoLiveDispatch?.({ type: "set_audio_source", audioSourceId: String(value) })}
                            serialize={value => value}
                        />
                    ) : (
                        <div className={cl("go-live-empty-state")}>No audio inputs were available when the modal opened.</div>
                    )}
                    <Divider />
                    <div className={cl("go-live-toggle-grid")}>
                        <FormSwitch value={currentGoLiveNotifyFriends} onChange={setGoLiveNotifyFriends} title="Notify friends" />
                    </div>
                </SettingsCard>

                <SettingsCard title="Stream Engine" subtitle="Control the parts that most affect clarity and stability.">
                    <div className={cl("go-live-field")}>
                        <div className={cl("go-live-field-label")}>Codec</div>
                        <div className={cl("go-live-pill-row")}>
                            {codecOptions.map(codec => (
                                <QuickPillButton
                                    key={codec}
                                    active={normalized.streamCodec === codec}
                                    disabled={!availableCodecs[codec]}
                                    label={codec.toUpperCase()}
                                    onClick={() => setConfig({ streamCodec: getSupportedStreamCodec(codec) })}
                                />
                            ))}
                        </div>
                    </div>
                    <Divider />
                    <div className={cl("go-live-field")}>
                        <div className={cl("go-live-field-label")}>Video bitrate</div>
                        <div className={cl("go-live-pill-row")}>
                            {streamBitrateOptions.map(value => (
                                <QuickPillButton
                                    key={value}
                                    active={normalized.streamVideoBitrateKbps === value}
                                    label={`${value / 1000} Mbps`}
                                    onClick={() => setConfig({ streamVideoBitrateKbps: value })}
                                />
                            ))}
                        </div>
                    </div>
                    <div className={cl("go-live-toggle-grid")}>
                        <FormSwitch value={normalized.streamHdrExperimentEnabled} onChange={value => setConfig({ streamHdrExperimentEnabled: value })} title="HDR Go Live experiment" />
                        <FormSwitch value={normalized.streamHdrCaptureMode} onChange={value => setConfig({ streamHdrCaptureMode: value })} title="HDR capture mode" />
                    </div>
                </SettingsCard>

                <SettingsCard title="Launch Defaults" subtitle="Choose where the Go Live picker should open before you pick a source.">
                    <div className={cl("go-live-toggle-grid")}>
                        <FormSwitch
                            value={normalized.goLiveOpenStreamEnhancerByDefault}
                            onChange={value => setConfig({
                                goLiveOpenStreamEnhancerByDefault: value,
                                goLiveOpenEntireScreenByDefault: value ? false : normalized.goLiveOpenEntireScreenByDefault,
                                goLiveOpenCameraByDefault: value ? false : normalized.goLiveOpenCameraByDefault
                            })}
                            title="Open on Stream Enhancer"
                        />
                        <FormSwitch
                            value={normalized.goLiveOpenEntireScreenByDefault}
                            onChange={value => setConfig({
                                goLiveOpenEntireScreenByDefault: value,
                                goLiveOpenCameraByDefault: value ? false : normalized.goLiveOpenCameraByDefault,
                                goLiveOpenStreamEnhancerByDefault: false
                            })}
                            title="Open on Entire Screen"
                            disabled={normalized.goLiveOpenStreamEnhancerByDefault}
                        />
                        <FormSwitch
                            value={normalized.goLiveOpenCameraByDefault}
                            onChange={value => setConfig({
                                goLiveOpenCameraByDefault: value,
                                goLiveOpenEntireScreenByDefault: value ? false : normalized.goLiveOpenEntireScreenByDefault,
                                goLiveOpenStreamEnhancerByDefault: false
                            })}
                            title="Open on Camera Devices"
                            disabled={normalized.goLiveOpenEntireScreenByDefault || normalized.goLiveOpenStreamEnhancerByDefault}
                        />
                    </div>
                </SettingsCard>

                <SettingsCard title="Preview" subtitle="Keep preview behavior easy to understand and change.">
                    <div className={cl("go-live-field-grid")}>
                        <div className={cl("go-live-stat")}>
                            <div className={cl("go-live-stat-label")}>Refresh</div>
                            <div className={cl("go-live-stat-value")}>{normalized.previewRefreshIntervalSec}s</div>
                        </div>
                        <div className={cl("go-live-stat")}>
                            <div className={cl("go-live-stat-label")}>JPEG quality</div>
                            <div className={cl("go-live-stat-value")}>{normalized.previewJpegQualityPercent}%</div>
                        </div>
                    </div>
                    <Divider />
                    <div className={cl("go-live-toggle-grid")}>
                        <FormSwitch value={normalized.previewTweaksEnabled} onChange={value => setConfig({ previewTweaksEnabled: value })} title="Enable preview tweaks" />
                        <FormSwitch value={normalized.previewStretchFill} onChange={value => setConfig({ previewStretchFill: value })} title="Stretch preview to fill" />
                        <FormSwitch value={normalized.previewUploadFilterEnabled} onChange={value => setConfig({ previewUploadFilterEnabled: value })} title="Enhance preview upload" />
                    </div>
                    <Divider />
                    <div className={cl("go-live-field")}>
                        <div className={cl("go-live-field-label")}>Custom preview URL</div>
                        <TextInput
                            value={customPreviewUrl}
                            placeholder={defaultStreamEnhancerConfig.customPreviewUrl || "https://example.com/preview.png"}
                            onChange={setCustomPreviewUrl}
                            onBlur={() => setConfig({ customPreviewUrl })}
                        />
                    </div>
                </SettingsCard>

            </div>

            <section className={cl("go-live-advanced")}>
                <div className={cl("go-live-advanced-header")}>
                    <div className={cl("go-live-card-copy")}>
                        <Heading tag="h3" className={cl("go-live-card-title")}>Advanced</Heading>
                        <div className={cl("go-live-card-subtitle")}>Extra controls for bitrate, network and preview behavior.</div>
                    </div>
                    <Button
                        size="small"
                        variant={showAdvanced ? "secondary" : "primary"}
                        className={cl("go-live-advanced-button")}
                        onClick={() => setShowAdvanced(value => !value)}
                    >
                        {showAdvanced ? "Hide advanced" : "Show advanced"}
                    </Button>
                </div>

                {showAdvanced && (
                    <div className={cl("go-live-advanced-grid")}>
                        <SettingsCard title="Stream Fine Tuning" subtitle="Dial in video behavior once your preset and resolution are set.">
                            <SliderField label="Resolution scale" value={normalized.streamScalePercent} min={50} max={400} markers={[50, 75, 100, 125, 150, 200, 250, 300, 400]} onChange={value => setConfig({ streamScalePercent: value })} formatter={value => `${value}%`} />
                            <SliderField label="Minimum video bitrate" value={normalized.streamMinVideoBitrateKbps} min={250} max={120000} markers={streamBitrateOptions} onChange={value => setConfig({ streamMinVideoBitrateKbps: value })} formatter={value => `${compactMarker(value)} kbps`} />
                        </SettingsCard>

                        <SettingsCard title="Stream Network" subtitle="Discord's own network switches for streams.">
                            <div className={cl("go-live-toggle-grid")}>
                                <FormSwitch value={qosEnabled} onChange={value => audioSettingsActionCreators.setQoS?.(value)} title="QoS packets" />
                            </div>
                        </SettingsCard>

                        <SettingsCard title="Preview Pipeline And Viewer" subtitle="Keep preview tuning and viewer behavior in one place.">
                            <div className={cl("go-live-toggle-grid")}>
                                <FormSwitch value={normalized.viewerResizeSliderEnabled} onChange={value => setConfig({ viewerResizeSliderEnabled: value })} title="Show resize slider in stream menu" />
                            </div>
                            <Divider />
                            <SliderField label="Preview scale" value={normalized.previewScalePercent} min={80} max={160} markers={previewScaleMarkers} onChange={value => setConfig({ previewScalePercent: value })} formatter={value => `${value}%`} />
                            <SliderField label="Preview saturation" value={normalized.previewSaturationPercent} min={50} max={200} markers={previewColorMarkers} onChange={value => setConfig({ previewSaturationPercent: value })} formatter={value => `${value}%`} />
                            <SliderField label="Preview contrast" value={normalized.previewContrastPercent} min={50} max={200} markers={previewColorMarkers} onChange={value => setConfig({ previewContrastPercent: value })} formatter={value => `${value}%`} />
                            <SliderField label="Upload width" value={normalized.previewUploadWidth} min={320} max={3840} markers={previewWidthMarkers} onChange={value => setConfig({ previewUploadWidth: value })} />
                            <SliderField label="Upload height" value={normalized.previewUploadHeight} min={180} max={2160} markers={previewHeightMarkers} onChange={value => setConfig({ previewUploadHeight: value })} />
                            <SliderField label="Retry interval" value={normalized.previewRetryIntervalSec} min={3} max={120} markers={previewRetryMarkers} onChange={value => setConfig({ previewRetryIntervalSec: value })} formatter={value => `${value}s`} />
                            <SliderField label="Upload filter contrast" value={normalized.previewUploadFilterContrastPercent} min={50} max={200} markers={previewColorMarkers} onChange={value => setConfig({ previewUploadFilterContrastPercent: value })} formatter={value => `${value}%`} />
                        </SettingsCard>
                    </div>
                )}
            </section>
        </div>
    );
}

export const getGoLiveStreamEnhanceSourceType = () => goLiveStreamEnhanceSourceType;

export const getGoLiveStreamEnhanceSourceOption = () => ({
    name: "Stream Enhancer",
    value: goLiveStreamEnhanceSourceType,
    icon: StreamEnhancerSourceIcon
});

export const renderGoLiveStreamEnhancePanel = () => (
    <GoLiveQuickPanel
        selectedAudioSourceId={currentGoLiveAudioSourceId}
    />
);

export const syncGoLiveModalState = <T extends GoLiveModalBinding>(binding: T) => {
    currentGoLiveDispatch = binding.dispatch;
    currentGoLiveAudioSourceId = binding.state.audioSourceId ?? null;
    currentGoLiveNotifyFriends = !!binding.state.notifyFriends;
    currentGoLiveSoundEnabled = !binding.state.muteStreamAudio;

    const defaultSourceType = getDefaultGoLiveSourceTypeValue();
    if (
        defaultSourceType !== "window"
        && binding.state.sourceType !== defaultSourceType
        && !handledGoLiveSourceDispatches.has(binding.dispatch)
    ) {
        handledGoLiveSourceDispatches.add(binding.dispatch);
        binding.dispatch({
            type: "set_source_type",
            sourceType: defaultSourceType
        });
    }

    return binding;
};

export const openGoLivePickerWithoutAutoStart = async (pid: number | null) => {
    await getOpenGoLiveModal()?.H?.({
        analyticsLocation: goLiveAnalyticsConstants.ThZ.OVERLAY_NUDGE,
        allowOneClickGoLive: false,
        appContext: goLiveAnalyticsConstants.BRT.APP,
        pid
    });
};

export const openGoLiveButtonContextMenu = (event: MouseEvent, pid: number | null) => {
    ContextMenuApi.openContextMenu(event, () => (
        <Menu.Menu navId="stream-enhancer-go-live-button" onClose={ContextMenuApi.closeContextMenu} aria-label="Go Live button">
            <Menu.MenuItem
                id="stream-enhancer-open-screenshare-picker"
                label="Open Screenshare Picker"
                action={() => {
                    void openGoLivePickerWithoutAutoStart(pid);
                }}
            />
        </Menu.Menu>
    ));
};

// The web build starts a stream straight from the Share Screen button with no settings step
// (Discord only opens its Go Live window on the desktop app), so HaloCord asks here first.
function WebGoLiveModal({ modalProps, onStart }: { modalProps: RenderModalProps; onStart: (sound: boolean) => void; }) {
    const [sound, setSound] = useState(currentGoLiveSoundEnabled);
    return (
        <ModalRoot {...modalProps} size={ModalSize.LARGE}>
            <ModalHeader><Heading tag="h2">Screen Share</Heading></ModalHeader>
            <ModalContent>
                <GoLiveQuickPanel />
                <FormSwitch value={sound} onChange={setSound} title="Share sound" description="Window shares send that app's sound only. Screen shares send everything except HaloCord, so your own voice and the call stay out." />
            </ModalContent>
            <ModalFooter>
                <Button onClick={() => { currentGoLiveSoundEnabled = sound; modalProps.onClose(); onStart(sound); }}>Go Live</Button>
                <Button variant="secondary" onClick={modalProps.onClose}>Cancel</Button>
            </ModalFooter>
        </ModalRoot>
    );
}

export const openWebGoLive = (start: (size: { width: number; height: number; }, sound: boolean, fps: number) => void, size: { width: number; height: number; }, fps: number) => {
    openModal(props => <WebGoLiveModal modalProps={props} onStart={sound => {
        const c = normalizeConfig(streamEnhancerSettings.store.config);
        if (c.streamTweaksEnabled) start({ width: c.streamWidth, height: c.streamHeight }, sound, c.streamMaxFps);
        else start(size, sound, fps);
    }} />);
};
