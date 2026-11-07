/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { isPluginEnabled } from "@api/PluginManager";
import { definePluginSettings } from "@api/Settings";
import { Button } from "@components/Button";
import { Divider } from "@components/Divider";
import ErrorBoundary from "@components/ErrorBoundary";
import { ErrorCard } from "@components/ErrorCard";
import { FormSwitch } from "@components/FormSwitch";
import { Heading } from "@components/Heading";
import { classNameFactory } from "@utils/css";
import { Logger } from "@utils/Logger";
import { OptionType } from "@utils/types";
import type { SelectOption } from "@vencord/discord-types";
import { findByPropsLazy, findStoreLazy } from "@webpack";
import { FluxDispatcher, Select, Slider, TextInput, Toasts, useLayoutEffect, useRef, UserStore } from "@webpack/common";
import type { ReactNode } from "react";

import { advertiseBadge, badgeFps, badgeFpsPresets, badgeResolution, badgeResolutionPresets, maxBadgeFps, maxBadgeHeight, normalizeBadgeConfig, sanitizeBadgeVisibility } from "./badge";
import { clearLocalPreview, getLocalPreviewUrl, requestLocalPreview, saveLocalPreview } from "./customPreviewImage";
import { previewCoverChanged } from "./previewSender";
import { badgeSize, choiceAt, nearestChoice, showChoiceLabel, sliderChoices } from "./slider";

export type StreamCodec = "auto" | "av1" | "vp9" | "h264";
type StreamQualityPreset = "efficient" | "balanced" | "maxDetail" | "extreme" | "adaptiveMax";
type GoLiveSourceTypeLike = {
    CAMERA: string;
    SCREEN: string;
    WINDOW: string;
};
type VideoCodecEnumLike = {
    AV1?: string;
    H264: string;
    H265?: string;
    VP8: string;
    VP9: string;
};
type GoLiveQualityShape = {
    bitrateTarget?: number;
    capture?: {
        framerate?: number;
        height?: number;
        width?: number;
    };
    encode?: {
        framerate?: number;
        height?: number;
        pixelCount?: number;
        width?: number;
    };
};
type GoLiveHdrExperimentConfig = {
    hdrCaptureMode?: unknown;
};
type DesktopBitrateShape = {
    max?: number;
    min?: number;
    target?: number;
};

interface StreamParticipant {
    user?: { id?: string | bigint; };
    stream?: boolean;
    streamId?: string | number | bigint;
}

interface ApplicationStreamingStoreLike {
    getAllActiveStreams?: () => Array<{
        guildId?: string | bigint | null;
        channelId?: string | bigint;
        ownerId?: string | bigint;
        streamId?: string | bigint;
    }>;
    getActiveStreamForApplicationStream?: (stream: unknown) => {
        guildId?: string | bigint | null;
        channelId?: string | bigint;
        ownerId?: string | bigint;
        state?: string;
    } | null;
}

interface ApplicationStreamPreviewStoreLike {
    getPreviewURL?: (guildId: unknown, channelId: unknown, ownerId: unknown) => string | null;
}

interface ChannelRTCStoreLike {
    getParticipants?: (channelId: string | bigint) => StreamParticipant[];
}

interface MediaEngineLike {
    eachConnection?: (callback: (connection: LiveMediaConnectionLike) => void) => void;
    getCodecCapabilities?: (callback: (capabilities: string) => void) => void;
    setAudioInputDevice?: (deviceId: string) => void;
}

interface MediaEngineInputDeviceLike {
    disabled?: boolean;
    id?: string;
}

interface VideoCodecCapability {
    codec?: string;
    encode?: boolean;
}

interface GoLiveSourceStoreLike {
    getGoLiveSource?: () => {
        cameraSource?: {
            audioDeviceGuid?: string | null;
            videoDeviceGuid?: string | null;
        };
        desktopSource?: {
            id?: string | null;
            sound?: boolean;
        };
    } | null;
}

interface GoLiveActionCreatorsLike {
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
            frameRate: 5 | 15 | 30 | 60;
            preset: 3;
            resolution: 480 | 720 | 1080 | 1440;
        };
    }) => void;
}

interface LiveMediaConnectionLike {
    setAutomaticGainControl?: (enabled: boolean) => void;
    setEchoCancellation?: (enabled: boolean) => void;
    setNoiseCancellation?: (enabled: boolean) => void;
    setNoiseSuppression?: (enabled: boolean) => void;
    setVoiceBitRate?: (bitrate: number) => void;
}

interface MediaEngineStoreLike {
    getInputDevices?: () => Record<string, MediaEngineInputDeviceLike>;
    getInputDeviceId?: () => string;
    getMediaEngine?: () => MediaEngineLike;
}

interface NumberEditorProps {
    label: string;
    value: number;
    min: number;
    max: number;
    markers: number[];
    onChange: (value: number) => void;
    markerFormatter?: (value: number) => string;
}

interface SettingsSectionProps {
    title: string;
    children: ReactNode;
}

export const defaultStreamEnhancerConfig = {
    streamTweaksEnabled: true,
    streamVideoBitrateKbps: 24000,
    streamMinVideoBitrateKbps: 12000,
    streamCodec: "auto",
    streamHdrExperimentEnabled: false,
    streamHdrCaptureMode: false,
    goLiveOpenStreamEnhancerByDefault: false,
    goLiveOpenEntireScreenByDefault: false,
    goLiveOpenCameraByDefault: false,
    streamMaxFps: 60,
    streamWidth: 1280,
    streamHeight: 720,
    streamScalePercent: 100,
    ...normalizeBadgeConfig({}),
    previewTweaksEnabled: true,
    previewScalePercent: 110,
    previewSaturationPercent: 110,
    previewContrastPercent: 108,
    previewUploadWidth: 1920,
    previewUploadHeight: 1080,
    previewJpegQualityPercent: 92,
    previewRefreshIntervalSec: 60,
    previewRetryIntervalSec: 15,
    previewUploadFilterEnabled: false,
    previewUploadFilterContrastPercent: 112,
    customPreviewUrl: "",
    customPreviewFileName: "",
    previewStretchFill: true,
    previewFlipX: false,
    previewFlipY: false,
    viewerResizeSliderEnabled: false,
};

export type StreamEnhancerConfig = typeof defaultStreamEnhancerConfig;
const applicationStreamingStore = findStoreLazy("ApplicationStreamingStore") as ApplicationStreamingStoreLike | undefined;
const applicationStreamPreviewStore = findStoreLazy("ApplicationStreamPreviewStore") as ApplicationStreamPreviewStoreLike | undefined;
const channelRtcStore = findStoreLazy("ChannelRTCStore") as ChannelRTCStoreLike | undefined;
const mediaEngineStore = findStoreLazy("MediaEngineStore") as MediaEngineStoreLike | undefined;
const goLiveSourceStore = findByPropsLazy("getGoLiveSource") as GoLiveSourceStoreLike;
const goLiveActionCreators = findByPropsLazy("setGoLiveSource") as GoLiveActionCreatorsLike;
const conflictingPlugins = ["BetterScreenshare", "LimitlessScreenshare", "CustomStreamQuality", "CustomStreamPreview"] as const;
const cl = classNameFactory("vc-stream-enhancer-settings-");
const coverCl = classNameFactory("vc-stream-enhancer-");
const logger = new Logger("StreamEnhancer");

const minStreamFps = 0;
const maxStreamFps = 420;
const minStreamWidth = 128;
const maxStreamWidth = 7680;
const minStreamHeight = 72;
const maxStreamHeight = 4320;
const availableVideoCodecNames = new Set<string>();

export const streamPresetButtons = [
    ["efficient", "Efficient"],
    ["balanced", "Balanced"],
    ["maxDetail", "Max Detail"],
    ["extreme", "Extreme"],
    ["adaptiveMax", "Adaptive Max"]
] as const satisfies ReadonlyArray<readonly [StreamQualityPreset, string]>;
export const badgeVisibilityOptions: SelectOption[] = [
    { label: "Show badge", value: "shown" },
    { label: "Hide for me", value: "local" },
    { label: "Hide for everyone", value: "all" }
] as const;
export const streamResolutionOptions = [
    "128 x 72",
    "320 x 180",
    "640 x 360",
    "960 x 540",
    "1280 x 720",
    "1600 x 900",
    "1920 x 1080",
    "2560 x 1440",
    "3200 x 1800",
    "3840 x 2160",
    "4480 x 2520",
    "5120 x 2880",
    "5760 x 3240",
    "7680 x 4320"
].map(value => ({
    label: value,
    value,
} satisfies SelectOption));

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const isObjectRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value != null;
const getNumericValue = (value: unknown) => typeof value === "number" && Number.isFinite(value) ? value : null;
const getPositiveNumericValue = (value: unknown) => {
    const number = getNumericValue(value);
    return number != null && number > 0 ? number : null;
};

export const refreshAvailableVideoCodecs = async () => {
    const mediaEngine = mediaEngineStore?.getMediaEngine?.();
    if (!mediaEngine?.getCodecCapabilities) return availableVideoCodecNames;

    const rawCapabilities = await new Promise<string>(resolve => mediaEngine.getCodecCapabilities?.(resolve));
    let nextCapabilities: VideoCodecCapability[] = [];

    try {
        const parsed = JSON.parse(rawCapabilities);
        if (Array.isArray(parsed)) {
            nextCapabilities = parsed.filter(isObjectRecord);
        }
    } catch {
        return availableVideoCodecNames;
    }

    availableVideoCodecNames.clear();
    for (const capability of nextCapabilities) {
        if (!capability.encode || !capability.codec) continue;
        availableVideoCodecNames.add(capability.codec);
    }

    return availableVideoCodecNames;
};

const hasAvailableVideoCodec = (codecName: string) => availableVideoCodecNames.has(codecName);
export const isStreamCodecAvailable = (codec: StreamCodec) => {
    if (codec === "auto" || codec === "h264") return true;
    if (codec === "av1") return hasAvailableVideoCodec("AV1");
    if (codec === "vp9") return hasAvailableVideoCodec("VP9");
    return false;
};
export const getSupportedStreamCodec = (codec: StreamCodec): StreamCodec => {
    if (isStreamCodecAvailable(codec)) return codec;
    return "h264";
};

function sanitizeCodec(value: unknown): StreamCodec {
    if (value === "av1" || value === "vp9" || value === "h264") return value;
    return "auto";
}

const toGoLiveResolution = (height: number): 480 | 720 | 1080 | 1440 => {
    if (height <= 480) return 480;
    if (height <= 720) return 720;
    if (height <= 1080) return 1080;
    return 1440;
};

const toGoLiveFps = (fps: number): 5 | 15 | 30 | 60 => {
    if (fps <= 10) return 5;
    if (fps <= 22) return 15;
    if (fps <= 45) return 30;
    return 60;
};

function sanitizePreviewUrl(value: string): string {
    const trimmed = value.trim();
    if (!trimmed) return "";
    if (trimmed.startsWith("data:image/")) return trimmed;

    try {
        const url = new URL(trimmed);
        if (url.protocol !== "https:" && url.protocol !== "http:") return "";
        return url.toString();
    } catch {
        return "";
    }
}

export function normalizeConfig(input: Partial<StreamEnhancerConfig> | undefined): StreamEnhancerConfig {
    const source = input ?? {};
    return {
        streamTweaksEnabled: source.streamTweaksEnabled ?? defaultStreamEnhancerConfig.streamTweaksEnabled,
        streamVideoBitrateKbps: clamp(Math.round(source.streamVideoBitrateKbps ?? defaultStreamEnhancerConfig.streamVideoBitrateKbps), 250, 120000),
        streamMinVideoBitrateKbps: clamp(Math.round(source.streamMinVideoBitrateKbps ?? defaultStreamEnhancerConfig.streamMinVideoBitrateKbps), 250, 120000),
        streamCodec: sanitizeCodec(source.streamCodec ?? defaultStreamEnhancerConfig.streamCodec),
        streamHdrExperimentEnabled: source.streamHdrExperimentEnabled ?? defaultStreamEnhancerConfig.streamHdrExperimentEnabled,
        streamHdrCaptureMode: source.streamHdrCaptureMode ?? defaultStreamEnhancerConfig.streamHdrCaptureMode,
        goLiveOpenStreamEnhancerByDefault: source.goLiveOpenStreamEnhancerByDefault ?? defaultStreamEnhancerConfig.goLiveOpenStreamEnhancerByDefault,
        goLiveOpenEntireScreenByDefault: (source.goLiveOpenStreamEnhancerByDefault ?? defaultStreamEnhancerConfig.goLiveOpenStreamEnhancerByDefault)
            ? false
            : source.goLiveOpenEntireScreenByDefault ?? defaultStreamEnhancerConfig.goLiveOpenEntireScreenByDefault,
        goLiveOpenCameraByDefault: (source.goLiveOpenStreamEnhancerByDefault ?? defaultStreamEnhancerConfig.goLiveOpenStreamEnhancerByDefault)
            ? false
            : (source.goLiveOpenEntireScreenByDefault ?? defaultStreamEnhancerConfig.goLiveOpenEntireScreenByDefault)
            ? false
            : source.goLiveOpenCameraByDefault ?? defaultStreamEnhancerConfig.goLiveOpenCameraByDefault,
        streamMaxFps: clamp(Math.round(source.streamMaxFps ?? defaultStreamEnhancerConfig.streamMaxFps), minStreamFps, maxStreamFps),
        streamWidth: clamp(Math.round(source.streamWidth ?? defaultStreamEnhancerConfig.streamWidth), minStreamWidth, maxStreamWidth),
        streamHeight: clamp(Math.round(source.streamHeight ?? defaultStreamEnhancerConfig.streamHeight), minStreamHeight, maxStreamHeight),
        streamScalePercent: clamp(Math.round(source.streamScalePercent ?? defaultStreamEnhancerConfig.streamScalePercent), 50, 400),
        ...normalizeBadgeConfig(source),
        previewTweaksEnabled: source.previewTweaksEnabled ?? defaultStreamEnhancerConfig.previewTweaksEnabled,
        previewScalePercent: clamp(Math.round(source.previewScalePercent ?? defaultStreamEnhancerConfig.previewScalePercent), 80, 160),
        previewSaturationPercent: clamp(Math.round(source.previewSaturationPercent ?? defaultStreamEnhancerConfig.previewSaturationPercent), 50, 200),
        previewContrastPercent: clamp(Math.round(source.previewContrastPercent ?? defaultStreamEnhancerConfig.previewContrastPercent), 50, 200),
        previewUploadWidth: clamp(Math.round(source.previewUploadWidth ?? defaultStreamEnhancerConfig.previewUploadWidth), 320, 3840),
        previewUploadHeight: clamp(Math.round(source.previewUploadHeight ?? defaultStreamEnhancerConfig.previewUploadHeight), 180, 2160),
        previewJpegQualityPercent: clamp(Math.round(source.previewJpegQualityPercent ?? defaultStreamEnhancerConfig.previewJpegQualityPercent), 10, 100),
        previewRefreshIntervalSec: clamp(Math.round(source.previewRefreshIntervalSec ?? defaultStreamEnhancerConfig.previewRefreshIntervalSec), 5, 300),
        previewRetryIntervalSec: clamp(Math.round(source.previewRetryIntervalSec ?? defaultStreamEnhancerConfig.previewRetryIntervalSec), 3, 120),
        previewUploadFilterEnabled: source.previewUploadFilterEnabled ?? defaultStreamEnhancerConfig.previewUploadFilterEnabled,
        previewUploadFilterContrastPercent: clamp(Math.round(source.previewUploadFilterContrastPercent ?? defaultStreamEnhancerConfig.previewUploadFilterContrastPercent), 50, 200),
        customPreviewUrl: sanitizePreviewUrl(source.customPreviewUrl ?? defaultStreamEnhancerConfig.customPreviewUrl),
        customPreviewFileName: typeof source.customPreviewFileName === "string" ? source.customPreviewFileName : "",
        previewStretchFill: source.previewStretchFill ?? defaultStreamEnhancerConfig.previewStretchFill,
        previewFlipX: source.previewFlipX ?? defaultStreamEnhancerConfig.previewFlipX,
        previewFlipY: source.previewFlipY ?? defaultStreamEnhancerConfig.previewFlipY,
        viewerResizeSliderEnabled: source.viewerResizeSliderEnabled ?? false
    };
}

export function applyStreamPreset(config: StreamEnhancerConfig, preset: StreamQualityPreset): StreamEnhancerConfig {
    switch (preset) {
        case "efficient":
            return normalizeConfig({
                ...config,
                streamCodec: "auto",
                streamVideoBitrateKbps: 24000,
                streamMinVideoBitrateKbps: 12000,
                streamMaxFps: 60,
                streamWidth: 1280,
                streamHeight: 720,
                streamScalePercent: 100,
            });
        case "balanced":
            return normalizeConfig({
                ...config,
                streamCodec: "auto",
                streamVideoBitrateKbps: 18000,
                streamMinVideoBitrateKbps: 9000,
                streamMaxFps: 60,
                streamWidth: 1920,
                streamHeight: 1080,
                streamScalePercent: 100,
            });
        case "maxDetail":
            return normalizeConfig({
                ...config,
                streamCodec: getSupportedStreamCodec("av1"),
                streamVideoBitrateKbps: 50000,
                streamMinVideoBitrateKbps: 26000,
                streamMaxFps: 120,
                streamWidth: 3840,
                streamHeight: 2160,
                streamScalePercent: 100,
            });
        case "extreme":
            return normalizeConfig({
                ...config,
                streamCodec: getSupportedStreamCodec("av1"),
                streamVideoBitrateKbps: 110000,
                streamMinVideoBitrateKbps: 70000,
                streamMaxFps: 240,
                streamWidth: 7680,
                streamHeight: 4320,
                streamScalePercent: 100,
            });
        case "adaptiveMax":
            return normalizeConfig({
                ...config,
                streamCodec: getSupportedStreamCodec("av1"),
                streamVideoBitrateKbps: 42000,
                streamMinVideoBitrateKbps: 12000,
                streamMaxFps: 120,
                streamWidth: 5120,
                streamHeight: 2880,
                streamScalePercent: 100,
            });
    }
}

export const syncCurrentGoLiveSource = (config: StreamEnhancerConfig) => {
    if (!shouldOverrideStreamResolution()) return;
    void refreshAvailableVideoCodecs();
    const currentSource = goLiveSourceStore.getGoLiveSource?.();
    const qualityOptions = {
        frameRate: toGoLiveFps(config.streamMaxFps),
        preset: 3 as const,
        resolution: toGoLiveResolution(config.streamHeight)
    };

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

    const desktopSource = currentSource?.desktopSource;
    const sourceId = desktopSource?.id;
    if (!sourceId) return;

    goLiveActionCreators.setGoLiveSource?.({
        context: "stream",
        desktopSettings: {
            sound: desktopSource.sound ?? true,
            sourceId
        },
        qualityOptions
    });
};

function getActiveConflicts(): string[] {
    return conflictingPlugins.filter(name => isPluginEnabled(name));
}

function forceRefreshStreamPreview() {
    const currentUser = UserStore.getCurrentUser();
    const currentUserId = currentUser?.id != null ? String(currentUser.id) : null;
    if (!currentUserId) return;

    const activeStreams = applicationStreamingStore?.getAllActiveStreams?.() ?? [];
    const ownStream = activeStreams.find(stream => stream.ownerId != null && String(stream.ownerId) === currentUserId);
    if (!ownStream || ownStream.channelId == null) {
        Toasts.show({
            id: Toasts.genId(),
            message: "Stream settings: No active stream found to refresh preview.",
            type: Toasts.Type.FAILURE
        });
        return;
    }

    const participants = channelRtcStore?.getParticipants?.(ownStream.channelId) ?? [];
    const ownStreamParticipant = participants.find(participant =>
        participant.stream
        && participant.streamId != null
        && participant.user?.id != null
        && String(participant.user.id) === currentUserId
    );

    const streamId = ownStreamParticipant?.streamId ?? ownStream.streamId ?? null;
    if (streamId == null) {
        Toasts.show({
            id: Toasts.genId(),
            message: "Stream settings: Preview refresh needs an active stream ID. Try again after the stream stabilizes.",
            type: Toasts.Type.FAILURE
        });
        return;
    }

    FluxDispatcher.dispatch({
        type: "RTC_CONNECTION_VIDEO",
        guildId: ownStream.guildId ?? null,
        channelId: ownStream.channelId,
        userId: currentUser.id,
        streamId: String(streamId),
        context: "stream"
    });

    Toasts.show({
        id: Toasts.genId(),
        message: "Stream settings: Requested immediate stream preview refresh.",
        type: Toasts.Type.SUCCESS
    });
}

function NumberEditor({
    label,
    value,
    min,
    max,
    markers,
    onChange,
    markerFormatter
}: NumberEditorProps) {
    const choices = sliderChoices(markers, min, max);
    const format = (position: number) => markerFormatter?.(choiceAt(position, choices)) ?? String(choiceAt(position, choices));
    return (
        <div className={cl("control")}>
            <div className={cl("label")}>
                {label}: <span className={cl("label-value")}>{value}</span>
            </div>
            <Slider
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

function SettingsSection({ title, children }: SettingsSectionProps) {
    return (
        <div className={cl("group")}>
            <Heading tag="h4" className={cl("section-title")}>{title}</Heading>
            {children}
        </div>
    );
}

export type PickerTab = "apps" | "screens" | "devices";
export const pickerTabs: Array<{ label: string; value: PickerTab; }> = [
    { label: "Applications", value: "apps" },
    { label: "Entire Screen", value: "screens" },
    { label: "Devices", value: "devices" }
];

export function StreamEnhancerControlPanel() {
    const { config } = streamEnhancerSettings.use(["config"]);
    const normalized = normalizeConfig(config);
    const conflicts = getActiveConflicts();
    const set = <K extends keyof StreamEnhancerConfig>(key: K, next: StreamEnhancerConfig[K]) => {
        const updated = normalizeConfig({ ...normalized, [key]: next });
        streamEnhancerSettings.store.config = updated;
        syncCustomPreviewForKey(key);

        if (key === "streamCodec") {
            syncCurrentGoLiveSource(updated);
        }
    };

    return (
        <div className={cl("card")}>
            <ErrorCard>
                HaloCord's stream settings replace Discord's normal stream pipeline. Keep other stream tuning plugins off and restart Discord after changing them.
                {conflicts.length > 0 ? ` Active conflicts: ${conflicts.join(", ")}.` : ""}
            </ErrorCard>

            <SettingsSection title="Spoofed stream badge">
                <div className={cl("label")}>Badge visibility</div>
                <Select
                    options={badgeVisibilityOptions}
                    select={option => set("badgeVisibility", sanitizeBadgeVisibility(option))}
                    isSelected={option => option === normalized.badgeVisibility}
                    serialize={option => option}
                />
                <FormSwitch value={normalized.spoofBadgeEnabled} onChange={value => set("spoofBadgeEnabled", value)} title="Show spoofed resolution and FPS" />
                <div>Changes the badge on this client. Viewers receive the actual stream resolution and FPS so cosmetic values cannot interfere with playback.</div>
                <NumberEditor label="Badge resolution" value={normalized.spoofBadgeHeight} min={144} max={maxBadgeHeight} markers={badgeResolutionPresets} markerFormatter={next => `${next}p`} onChange={next => { streamEnhancerSettings.store.config = normalizeConfig({ ...normalized, ...badgeSize(next) }); }} />
                <NumberEditor label="Badge FPS" value={normalized.spoofBadgeFps} min={1} max={maxBadgeFps} markers={badgeFpsPresets} onChange={next => set("spoofBadgeFps", next)} />
            </SettingsSection>

            <SettingsSection title="Preview Controls">
                <FormSwitch value={normalized.previewTweaksEnabled} onChange={value => set("previewTweaksEnabled", value)} title="Enable stream preview tweaks" />
                <FormSwitch value={normalized.previewStretchFill} onChange={value => set("previewStretchFill", value)} title="Stretch custom preview to fill" />
                <FormSwitch value={normalized.previewFlipX} onChange={value => set("previewFlipX", value)} title="Flip custom preview horizontally" />
                <FormSwitch value={normalized.previewFlipY} onChange={value => set("previewFlipY", value)} title="Flip custom preview vertically" />
                <NumberEditor label="Preview scale (%)" value={normalized.previewScalePercent} min={80} max={160} markers={[80, 90, 100, 110, 120, 140, 160]} onChange={next => set("previewScalePercent", next)} />
                <NumberEditor label="Preview saturation (%)" value={normalized.previewSaturationPercent} min={50} max={200} markers={[50, 75, 100, 125, 150, 175, 200]} onChange={next => set("previewSaturationPercent", next)} />
                <NumberEditor label="Preview contrast (%)" value={normalized.previewContrastPercent} min={50} max={200} markers={[50, 75, 100, 125, 150, 175, 200]} onChange={next => set("previewContrastPercent", next)} />
                <Divider />
                <Heading tag="h5" className={cl("section-subtitle")}>Upload pipeline</Heading>
                <NumberEditor label="Preview upload width" value={normalized.previewUploadWidth} min={320} max={3840} markers={[640, 960, 1280, 1600, 1920, 2560, 3840]} onChange={next => set("previewUploadWidth", next)} />
                <NumberEditor label="Preview upload height" value={normalized.previewUploadHeight} min={180} max={2160} markers={[360, 540, 720, 900, 1080, 1440, 2160]} onChange={next => set("previewUploadHeight", next)} />
                <NumberEditor label="Preview JPEG quality (%)" value={normalized.previewJpegQualityPercent} min={10} max={100} markers={[10, 25, 40, 55, 70, 85, 100]} onChange={next => set("previewJpegQualityPercent", next)} />
                <NumberEditor label="Preview refresh interval (sec)" value={normalized.previewRefreshIntervalSec} min={5} max={300} markers={[5, 15, 30, 60, 120, 300]} onChange={next => set("previewRefreshIntervalSec", next)} />
                <NumberEditor label="Preview retry interval (sec)" value={normalized.previewRetryIntervalSec} min={3} max={120} markers={[3, 5, 10, 15, 30, 60, 120]} onChange={next => set("previewRetryIntervalSec", next)} />
                <FormSwitch value={normalized.previewUploadFilterEnabled} onChange={value => set("previewUploadFilterEnabled", value)} title="Enable upload contrast and sharpness filter" />
                <NumberEditor label="Upload filter contrast (%)" value={normalized.previewUploadFilterContrastPercent} min={50} max={200} markers={[50, 75, 100, 125, 150, 175, 200]} onChange={next => set("previewUploadFilterContrastPercent", next)} />
                <Button size="small" variant="secondary" onClick={forceRefreshStreamPreview}>Force Refresh Preview</Button>
                <Divider />
                <Heading tag="h5" className={cl("section-subtitle")}>Custom stream preview image</Heading>
                <div className={cl("note")}>{normalized.customPreviewFileName ? `Using file: ${normalized.customPreviewFileName}` : "No file chosen. The URL below is used if set."}</div>
                <Button size="small" variant="secondary" onClick={() => chooseCustomPreviewFile(name => set("customPreviewFileName", name))}>Choose image file</Button>
                <Button size="small" variant="secondary" onClick={() => clearChosenPreviewFile(() => set("customPreviewFileName", ""))}>Clear image file</Button>
                <TextInput value={normalized.customPreviewUrl} placeholder="https://example.com/preview.png or data:image/..." onChange={value => set("customPreviewUrl", sanitizePreviewUrl(value))} />
                <Button size="small" variant="secondary" onClick={() => set("customPreviewUrl", "")}>Clear Preview URL</Button>
                <div className={cl("note")}>A chosen file takes priority over the URL. Some image hosts block the cross-origin load a URL needs, so a file always works. Changes apply live to outgoing media and stream previews.</div>
            </SettingsSection>

            <SettingsSection title="Viewer Controls">
                <FormSwitch
                    value={normalized.viewerResizeSliderEnabled}
                    onChange={value => set("viewerResizeSliderEnabled", value)}
                    title="Show resize slider in stream menu"
                    description="Adds a video size slider to the in-viewer stream menu."
                />
            </SettingsSection>
        </div>
    );
}

export const streamEnhancerSettings = definePluginSettings({
    showPanelButton: {
        type: OptionType.BOOLEAN,
        description: "Show a stream settings button in the user panel.",
        default: true
    },
    config: {
        type: OptionType.CUSTOM,
        description: "Saved stream tuning values.",
        default: defaultStreamEnhancerConfig,
    },
    // Screen share picker choices (components/SharePicker.tsx); 0 height means the screen's own size.
    shareHeight: { type: OptionType.NUMBER, description: "Screen share resolution", default: 1080, hidden: true },
    shareMute: { type: OptionType.BOOLEAN, description: "Mute stream audio", default: false, hidden: true },
    shareAudio: { type: OptionType.STRING, description: "Screen share audio source", default: "default", hidden: true },
    sharePan: { type: OptionType.NUMBER, description: "Screen share audio pan, -1 left to 1 right", default: 0, hidden: true },
    // On: clicking a window or screen in the picker starts the stream, like Discord desktop. Off: pick, then Go Live.
    shareInstant: { type: OptionType.BOOLEAN, description: "Start sharing on the first click", default: true, hidden: true },
    // Tab the share picker opens on: one of pickerTabs' values.
    pickerTab: { type: OptionType.STRING, description: "Share picker opens on", default: "apps", hidden: true },
    // Video Settings (components/CameraSettings.tsx).
    cameraPreview: { type: OptionType.BOOLEAN, description: "Camera preview in Video Settings", default: false, hidden: true },
    noMirroredCamera: { type: OptionType.BOOLEAN, description: "Show your own camera unmirrored", default: false, hidden: true },
    controlPanel: {
        type: OptionType.COMPONENT,
        component: StreamEnhancerControlPanel
    }
});

const getConfig = () => normalizeConfig(streamEnhancerSettings.store.config);

export const shouldOverrideStreamResolution = () => {
    return (
        getConfig().streamTweaksEnabled &&
        !isPluginEnabled("LimitlessScreenshare") &&
        !isPluginEnabled("CustomStreamQuality") &&
        !isPluginEnabled("BetterScreenshare")
    );
};

const getScaledStreamDimensions = (config: StreamEnhancerConfig) => {
    const scale = config.streamScalePercent / 100;
    const roundEven = (value: number, min: number, max: number) => clamp(Math.round(value / 2) * 2, min, max);

    return {
        width: roundEven(config.streamWidth * scale, minStreamWidth, maxStreamWidth),
        height: roundEven(config.streamHeight * scale, minStreamHeight, maxStreamHeight)
    };
};
const getStreamConfig = () => {
    const config = getConfig();
    const scaled = getScaledStreamDimensions(config);

    return {
        config,
        fps: config.streamTweaksEnabled ? config.streamMaxFps : defaultStreamEnhancerConfig.streamMaxFps,
        width: config.streamTweaksEnabled ? scaled.width : defaultStreamEnhancerConfig.streamWidth,
        height: config.streamTweaksEnabled ? scaled.height : defaultStreamEnhancerConfig.streamHeight,
    };
};
const getParticipantSize = (value: Record<string, unknown>, key: "width" | "height") => getNumericValue(value[key]) ?? 0;
const makeScaledCanvas = (source: HTMLCanvasElement, width: number, height: number) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d")?.drawImage(source, 0, 0, source.width, source.height, 0, 0, width, height);
    return canvas;
};

export const shouldShowViewerResizeSlider = () => getConfig().viewerResizeSliderEnabled;


export const getConfiguredStreamFps = (fallback?: number) => {
    if (!shouldOverrideStreamResolution()) {
        return fallback != null && fallback > 0 ? fallback : defaultStreamEnhancerConfig.streamMaxFps;
    }
    return getStreamConfig().fps;
};

export const getConfiguredStreamWidth = (fallback?: number) => {
    if (!shouldOverrideStreamResolution()) {
        return fallback != null && fallback > 0 ? fallback : defaultStreamEnhancerConfig.streamWidth;
    }
    return getStreamConfig().width;
};

export const getConfiguredStreamHeight = (fallback?: number) => {
    if (!shouldOverrideStreamResolution()) {
        return fallback != null && fallback > 0 ? fallback : defaultStreamEnhancerConfig.streamHeight;
    }
    return getStreamConfig().height;
};

export const getConfiguredStreamPixelCount = (fallback?: number) => {
    if (!shouldOverrideStreamResolution()) {
        return fallback != null && fallback > 0 ? fallback : defaultStreamEnhancerConfig.streamWidth * defaultStreamEnhancerConfig.streamHeight;
    }
    const { width, height } = getStreamConfig();
    return width * height;
};

export const getConfiguredStreamBitrateTarget = () => getConfig().streamVideoBitrateKbps * 1000;

const maxStreamBitrateFloorKbps = 2500;

export const getConfiguredStreamBitrateMin = () => Math.min(getConfig().streamMinVideoBitrateKbps, maxStreamBitrateFloorKbps) * 1000;

export const getConfiguredStreamBitrateMax = getConfiguredStreamBitrateTarget;

export const getGoLiveHdrExperimentConfig = <T extends GoLiveHdrExperimentConfig>(config: T) => {
    if (!getConfig().streamHdrExperimentEnabled) return config;

    return {
        ...config,
        hdrCaptureMode: "always"
    };
};

export const getHdrCaptureMode = (currentMode: unknown) => {
    const config = getConfig();
    if (!config.streamHdrCaptureMode && !config.streamHdrExperimentEnabled) return 0;
    if (config.streamHdrExperimentEnabled) return "always";
    return currentMode;
};

export const getHdrCaptureModeEnabled = () => {
    const config = getConfig();
    return config.streamHdrCaptureMode || config.streamHdrExperimentEnabled;
};

export const getDefaultGoLiveSourceType = (sourceTypes: GoLiveSourceTypeLike) => {
    const config = getConfig();
    if (config.goLiveOpenEntireScreenByDefault) return sourceTypes.SCREEN;
    if (config.goLiveOpenCameraByDefault) return sourceTypes.CAMERA;
    return sourceTypes.WINDOW;
};

export const getDefaultGoLiveSourceTypeValue = () => {
    const config = getConfig();
    if (config.goLiveOpenStreamEnhancerByDefault) return "stream_enhance";
    if (config.goLiveOpenEntireScreenByDefault) return "screen";
    if (config.goLiveOpenCameraByDefault) return "camera";
    return "window";
};

export const getPreferredVideoCodecOrder = (codecEnum: VideoCodecEnumLike, includeH265: boolean) => {
    const { streamCodec } = getConfig();
    const codecOrder = new Set<string>();

    if (includeH265 && codecEnum.H265) codecOrder.add(codecEnum.H265);

    if (streamCodec === "av1" && codecEnum.AV1 && hasAvailableVideoCodec("AV1")) codecOrder.add(codecEnum.AV1);
    if (streamCodec === "vp9" && hasAvailableVideoCodec("VP9")) codecOrder.add(codecEnum.VP9);
    if (streamCodec === "h264") codecOrder.add(codecEnum.H264);

    codecOrder.add(codecEnum.H264);
    codecOrder.add(codecEnum.VP8);
    codecOrder.add(codecEnum.VP9);
    if (codecEnum.AV1) codecOrder.add(codecEnum.AV1);

    return [...codecOrder];
};

export const getPreferredVideoCodecName = (fallbackCodec: string, includeH265: boolean) => {
    const { streamCodec } = getConfig();

    if (streamCodec === "auto") return fallbackCodec;
    if (streamCodec === "h264") return "H264";
    if (streamCodec === "av1") return hasAvailableVideoCodec("AV1") ? "AV1" : "H264";
    if (streamCodec === "vp9") return hasAvailableVideoCodec("VP9") ? "VP9" : "H264";
    if (includeH265) return "H265";

    return fallbackCodec;
};

export const normalizeGoLiveQualityOverride = (quality: GoLiveQualityShape) => {
    if (!shouldOverrideStreamResolution()) return quality;
    return {
        ...quality,
        bitrateTarget: getConfiguredStreamBitrateTarget(),
        capture: {
            ...quality?.capture,
            width: getConfiguredStreamWidth(quality?.capture?.width),
            height: getConfiguredStreamHeight(quality?.capture?.height),
            framerate: getConfiguredStreamFps(quality?.capture?.framerate)
        },
        encode: {
            ...quality?.encode,
            width: getConfiguredStreamWidth(quality?.encode?.width),
            height: getConfiguredStreamHeight(quality?.encode?.height),
            framerate: getConfiguredStreamFps(quality?.encode?.framerate),
            pixelCount: getConfiguredStreamPixelCount(quality?.encode?.pixelCount)
        }
    };
};

export const getDefaultGoLiveQualityOptions = (desktopBitrate: DesktopBitrateShape) => {
    if (!shouldOverrideStreamResolution()) {
        return {
            capture: {
                width: 1280,
                height: 720,
                framerate: 30
            },
            encode: {
                width: 1280,
                height: 720,
                framerate: 30,
                pixelCount: 921600
            },
            bitrateMin: desktopBitrate.min,
            bitrateMax: desktopBitrate.max,
            bitrateTarget: getConfiguredStreamBitrateTarget()
        };
    }
    return {
        capture: {
            width: getConfiguredStreamWidth(),
            height: getConfiguredStreamHeight(),
            framerate: getConfiguredStreamFps()
        },
        encode: {
            width: getConfiguredStreamWidth(),
            height: getConfiguredStreamHeight(),
            framerate: getConfiguredStreamFps(),
            pixelCount: getConfiguredStreamPixelCount()
        },
        bitrateMin: desktopBitrate.min,
        bitrateMax: desktopBitrate.max,
        bitrateTarget: getConfiguredStreamBitrateTarget()
    };
};

export const getPreviewUploadWidth = () => clamp(Math.round(getConfig().previewUploadWidth), 320, 3840);

export const getPreviewUploadHeight = () => clamp(Math.round(getConfig().previewUploadHeight), 180, 2160);

export const getPreviewJpegQuality = () => clamp(getConfig().previewJpegQualityPercent / 100, 0.1, 1);

// Floor of 30 s: Discord has not been shown to accept faster preview updates, and the stock
// uploader uses this value too.
export const getPreviewRefreshIntervalMs = () => clamp(Math.round(getConfig().previewRefreshIntervalSec), 30, 300) * 1000;

export const getPreviewRetryIntervalMs = () => clamp(Math.round(getConfig().previewRetryIntervalSec), 3, 120) * 1000;

export const applyPreviewUploadFilter = (ctx: CanvasRenderingContext2D | null) => {
    if (!ctx) return;

    const config = getConfig();
    if (!config.previewUploadFilterEnabled) {
        ctx.filter = "none";
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        return;
    }

    const contrast = clamp(Math.round(config.previewUploadFilterContrastPercent), 50, 200);
    ctx.filter = `contrast(${contrast}%) saturate(112%)`;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
};

const getDataUrlBytes = (value: string) => Math.ceil((value.length - value.indexOf(",") - 1) * 3 / 4);

const getCustomPreviewSource = (config: StreamEnhancerConfig) => {
    if (!config.customPreviewFileName) return config.customPreviewUrl;

    const localUrl = getLocalPreviewUrl();
    if (localUrl) return localUrl;

    requestLocalPreview();
    return config.customPreviewUrl;
};

export const shouldSpoofStreamPanelPreview = () => {
    const config = getConfig();
    return config.previewTweaksEnabled && !!getCustomPreviewSource(config);
};

const SpoofedStreamPanelPreview = ErrorBoundary.wrap(
    ({ url, stretch }: { url: string; stretch: boolean }) => {
        // The cover mounts inside Discord's measured aspect-ratio box, which letterboxes
        // the image and leaves bars around it. Stretch mode widens that box in place;
        // React diffs only style-prop keys it knows, so this override survives re-renders
        // and the cleanup restores Discord's own inline values on unmount.
        const ref = useRef<HTMLDivElement>(null);
        useLayoutEffect(() => {
            const parent = ref.current?.parentElement;
            if (!parent || !stretch) return;
            parent.style.setProperty("aspect-ratio", "auto", "important");
            parent.style.setProperty("width", "100%", "important");
            parent.style.setProperty("height", "100%", "important");
            return () => {
                parent.style.removeProperty("aspect-ratio");
                parent.style.removeProperty("width");
                parent.style.removeProperty("height");
            };
        }, [stretch]);
        return (
            <div ref={ref} className={coverCl("panel-preview", { "panel-preview-stretch": stretch })}>
                <img src={url} alt="" draggable={false} />
            </div>
        );
    },
    { noop: true }
);

const unwrapStreamArg = (value: unknown): unknown => {
    if (!isObjectRecord(value)) return value;
    if ("stream" in value && isObjectRecord(value.stream)) return value.stream;
    if ("participant" in value && isObjectRecord(value.participant)) {
        const participant = value.participant as Record<string, unknown>;
        if ("stream" in participant && isObjectRecord(participant.stream)) return participant.stream;
    }
    return value;
};

// The call view holds exactly one stream selected at a time (Watch Stream,
// the auto-watch focus, or a selected participant). While a stream is selected
// its tile must play the live video; a spoof cover over it froze the share to
// a still (user report 2026-10-09: "Watch Stream repainted the page with the
// static preview and the share never opened"). getSelectedParticipant keys the
// selection { type: "STREAM", id: <streamKey> }, so compare the key the same
// way the client builds it. Helpers authored by t3-screenshare-click-fix in
// the payload copy; ported here verbatim as the shared source of truth.
const buildStreamKeyFor = (stream: Record<string, unknown>): string => (
    typeof stream.streamKey === "string" && stream.streamKey
        ? stream.streamKey
        : (stream.guildId != null
            ? `guild:${stream.guildId}:${stream.channelId}:${stream.ownerId}`
            : `call:${stream.channelId}:${stream.ownerId}`)
);

export const isStreamSelectedInCallView = (value: unknown): boolean => {
    try {
        const streamObj = isObjectRecord(value) ? (unwrapStreamArg(value) as Record<string, unknown>) : null;
        if (!streamObj || streamObj.channelId == null) return false;

        const streamKey = buildStreamKeyFor(streamObj);
        const rtcStore = channelRtcStore as ChannelRTCStoreLike & {
            getSelectedParticipant?: (channelId: string | bigint) => { type?: unknown; id?: unknown } | null;
        } | undefined;
        const selected = rtcStore?.getSelectedParticipant?.(streamObj.channelId as string | bigint) ?? null;
        if (!selected) return false;

        const sel = selected as { type?: unknown; id?: unknown };
        const typeName = typeof sel.type === "string" ? sel.type : sel.type != null ? String(sel.type) : "";
        if (typeName !== "STREAM") return false;
        if (sel.id == null) return false;

        return String(sel.id) === streamKey || String(sel.id).endsWith(streamKey);
    } catch {
        return false;
    }
};

// Gate for the patch sites that choose between the live video branch and the
// static preview branch: gate only when that stream is NOT the one the client
// is watching right now, so unwatched tiles keep the custom preview while the
// watched stream plays for real.
export const shouldGateStreamPanelVideo = (value: unknown) => {
    const config = getConfig();
    if (!config.previewTweaksEnabled || !getCustomPreviewSource(config)) return false;
    return !isStreamSelectedInCallView(value);
};

// Guards run in this plain function, not inside the boundary component: it must
// return null when no preview URL is stored yet, so the patched site's `??`
// falls back to Discord's stock node whose hook performs the preview fetch.
// Keeping the element non-null starved that hook and left tiles empty.
export const renderSpoofedStreamPanelPreview = (stream: unknown) => {
    const config = getConfig();
    if (!config.previewTweaksEnabled || !getCustomPreviewSource(config)) return null;

    const streamObj = unwrapStreamArg(stream);
    const active = applicationStreamingStore?.getActiveStreamForApplicationStream?.(streamObj) ?? null;
    if (!active || active.state === "ENDED" || active.state === "FAILED") return null;

    // The client is watching this stream in the call view: stand down so the
    // live video branch paints (see isStreamSelectedInCallView above).
    if (isStreamSelectedInCallView(streamObj)) return null;

    const isOwnStream = active.ownerId === UserStore.getCurrentUser()?.id;
    const url = (isOwnStream ? customPreviewCache.coverUrl : null)
        ?? applicationStreamPreviewStore?.getPreviewURL?.(active.guildId, active.channelId, active.ownerId) ?? null;
    if (!url) return null;

    return <SpoofedStreamPanelPreview url={url} stretch={config.previewStretchFill} />;
};

const customPreviewCache: { url: string; key: string; canvas: HTMLCanvasElement | null; coverUrl: string | null; loading: boolean; } = { url: "", key: "", canvas: null, coverUrl: null, loading: false };
let warnedPreviewUrl = "";
let customPreviewUploadTrigger: unknown = null;
let customPreviewRetryTimer: ReturnType<typeof setTimeout> | null = null;

export const setPreviewUploadTrigger = (value: unknown) => {
    customPreviewUploadTrigger = typeof value === "function" ? value : null;
};

// The preview upload cycle only re-runs on Discord's refresh timer; firing the
// captured cycle callback pushes a fresh spoofed frame out within seconds of the
// image arriving or the URL changing instead of the next tick.
const triggerPreviewUpload = () => {
    if (!shouldSpoofStreamPanelPreview()) return;
    try {
        (customPreviewUploadTrigger as (() => unknown) | null)?.();
    } catch { }
    previewCoverChanged();
};

const previewFlipKey = (config: StreamEnhancerConfig) => `${config.previewFlipX ? "x" : ""}${config.previewFlipY ? "y" : ""}`;

const previewCacheKey = (config: StreamEnhancerConfig) =>
    `${previewFlipKey(config)}:${getPreviewUploadWidth()}x${getPreviewUploadHeight()}`;

const loadCustomPreviewImage = (url: string, key: string, config: StreamEnhancerConfig) => {
    customPreviewCache.loading = true;
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
        if (customPreviewCache.url !== url || customPreviewCache.key !== key) return;
        const canvas = document.createElement("canvas");
        canvas.width = getPreviewUploadWidth();
        canvas.height = getPreviewUploadHeight();
        const ctx = canvas.getContext("2d");
        if (ctx && previewFlipKey(config)) {
            ctx.translate(config.previewFlipX ? canvas.width : 0, config.previewFlipY ? canvas.height : 0);
            ctx.scale(config.previewFlipX ? -1 : 1, config.previewFlipY ? -1 : 1);
        }
        // Discord renders the uploaded preview through its own aspect-fit boxes on
        // every surface, including clients without this plugin, so the image is
        // stretched onto the configured upload canvas: a mismatched source aspect
        // would letterbox on stock viewers instead of filling.
        ctx?.drawImage(image, 0, 0, canvas.width, canvas.height);
        customPreviewCache.canvas = canvas;
        customPreviewCache.coverUrl = canvas.toDataURL("image/jpeg", 0.9);
        customPreviewCache.key = key;
        customPreviewCache.loading = false;
        triggerPreviewUpload();
    };
    image.onerror = () => {
        if (customPreviewCache.url !== url || customPreviewCache.key !== key) return;
        logger.warn("Custom stream preview image failed to load:", url);
        customPreviewCache.canvas = null;
        customPreviewCache.coverUrl = null;
        customPreviewCache.loading = false;
        // Most hosts that block cross-origin image loads do so silently. Say so once per URL.
        if (!url.startsWith("blob:") && !url.startsWith("data:") && warnedPreviewUrl !== url) {
            warnedPreviewUrl = url;
            Toasts.show({
                id: Toasts.genId(),
                message: "The preview image URL did not load. Its host may block cross-origin images; choose the image file instead.",
                type: Toasts.Type.FAILURE
            });
        }
        if (customPreviewRetryTimer) clearTimeout(customPreviewRetryTimer);
        customPreviewRetryTimer = setTimeout(() => {
            customPreviewRetryTimer = null;
            if (customPreviewCache.url === url && !customPreviewCache.canvas) loadCustomPreviewImage(url, key, config);
        }, 15_000);
    };
    image.src = url;
};

export const refreshCustomPreview = () => {
    const config = getConfig();
    const source = getCustomPreviewSource(config);
    if (!config.previewTweaksEnabled || !source) return;
    const key = previewCacheKey(config);
    if (customPreviewCache.url === source && customPreviewCache.key === key && (customPreviewCache.canvas || customPreviewCache.loading)) return;
    customPreviewCache.url = source;
    customPreviewCache.key = key;
    customPreviewCache.canvas = null;
    customPreviewCache.coverUrl = null;
    loadCustomPreviewImage(source, key, config);
};

export const stopCustomPreviewLoader = () => {
    if (customPreviewRetryTimer) {
        clearTimeout(customPreviewRetryTimer);
        customPreviewRetryTimer = null;
    }
    customPreviewCache.loading = false;
};

const previewReloadKeys = new Set(["customPreviewUrl", "customPreviewFileName", "previewTweaksEnabled", "previewStretchFill", "previewFlipX", "previewFlipY", "previewUploadWidth", "previewUploadHeight"]);

export const syncCustomPreviewForKey = (key: string) => {
    if (previewReloadKeys.has(key)) refreshCustomPreview();
};

const ensureCustomPreviewCanvas = () => {
    const config = getConfig();
    if (!config.previewTweaksEnabled || !getCustomPreviewSource(config)) return null;

    refreshCustomPreview();

    return customPreviewCache.canvas;
};

// Encoded thumbnail for the direct sender, or null while the cover is still loading.
export const getPreviewThumbnailDataUrl = () => {
    if (!shouldSpoofStreamPanelPreview()) return null;
    const canvas = ensureCustomPreviewCanvas();
    return canvas ? getPreviewUploadDataUrl(canvas) : null;
};

export const chooseCustomPreviewFile = (onChosen: (name: string) => void) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = () => {
        const file = input.files?.[0];
        if (!file) return;
        saveLocalPreview(file).then(() => onChosen(file.name), error => {
            logger.warn("Could not save the preview image:", error);
            Toasts.show({
                id: Toasts.genId(),
                message: error instanceof Error ? error.message : "Could not save the preview image.",
                type: Toasts.Type.FAILURE
            });
        });
    };
    input.click();
};

export const clearChosenPreviewFile = (onCleared: () => void) => {
    void clearLocalPreview().then(onCleared);
};

export const getPreviewUploadDataUrl = (canvas: HTMLCanvasElement) => {
    let quality = getPreviewJpegQuality();
    const source = ensureCustomPreviewCanvas() ?? canvas;
    let { width, height } = source;
    let current = source;

    while (width >= 160 && height >= 90) {
        for (let nextQuality = quality; nextQuality >= 0.35; nextQuality -= 0.1) {
            const dataUrl = current.toDataURL("image/jpeg", Number(nextQuality.toFixed(2)));
            if (getDataUrlBytes(dataUrl) <= 200 * 1024) {
                return dataUrl;
            }
        }

        width = Math.max(160, Math.round(width * 0.85));
        height = Math.max(90, Math.round(height * 0.85));
        if (width === current.width && height === current.height) {
            break;
        }

        current = makeScaledCanvas(source, width, height);
        quality = Math.min(quality, 0.7);
    }

    return current.toDataURL("image/jpeg", 0.35);
};

export const coerceParticipantResolution = (value: unknown) => {
    if (!shouldOverrideStreamResolution() || !isObjectRecord(value)) {
        return value;
    }

    const { width, height } = getStreamConfig();
    const next = { ...value };
    if (getParticipantSize(next, "width") <= 0 && "width" in next) next.width = width;
    if (getParticipantSize(next, "height") <= 0 && "height" in next) next.height = height;
    return next;
};

export const getDisplayResolutionForLabel = (value: unknown) => {
    if (!isObjectRecord(value)) return 0;

    const height = getParticipantSize(value, "height");
    const width = getParticipantSize(value, "width");
    if (height > 0 && width > 0) {
        return Math.max(height, Math.round(width * 9 / 16));
    }

    return height;
};

export const coerceParticipantFrameRate = (value: unknown) => {
    if (!shouldOverrideStreamResolution()) return value;
    const { fps } = getStreamConfig();
    return Math.max(getPositiveNumericValue(value) ?? 0, fps);
};

export const makeSelfResolutionFromSetting = (value: unknown) => {
    const numeric = getNumericValue(value) ?? 720;
    if (numeric === 0) return { height: 0, width: 0, type: 1 };

    if (!shouldOverrideStreamResolution()) {
        return { height: numeric, width: 0, type: 0 };
    }

    const { width, height: streamHeight } = getStreamConfig();
    return {
        height: clamp(Math.round(streamHeight), 0, maxStreamHeight),
        width: clamp(Math.round(width), 0, maxStreamWidth),
        type: 0
    };
};

export const streamEnhancerRuntime = {
    advertise(rtc: { context?: string; }, streams: unknown) {
        return advertiseBadge(rtc, streams, getConfig());
    },
    isBadgeVisible() {
        return getConfig().badgeVisibility === "shown";
    },
    badgeFps(fps: number) {
        return badgeFps(fps, getConfig());
    },
    badgeResolution(resolution: { width: number; height: number; type: unknown; }) {
        return badgeResolution(resolution, getConfig());
    },
    shouldOverrideStreamResolution,
    getConfiguredStreamFps,
    getConfiguredStreamWidth,
    getConfiguredStreamHeight,
    getConfiguredStreamPixelCount,
    getConfiguredStreamBitrateTarget,
    getConfiguredStreamBitrateMin,
    getConfiguredStreamBitrateMax,
    getGoLiveHdrExperimentConfig,
    getHdrCaptureMode,
    getHdrCaptureModeEnabled,
    getDefaultGoLiveSourceType,
    getDefaultGoLiveSourceTypeValue,
    getPreferredVideoCodecOrder,
    getPreferredVideoCodecName,
    normalizeGoLiveQualityOverride,
    getDefaultGoLiveQualityOptions,
    getPreviewUploadWidth,
    getPreviewUploadHeight,
    getPreviewJpegQuality,
    getPreviewRefreshIntervalMs,
    getPreviewRetryIntervalMs,
    getPreviewUploadDataUrl,
    setPreviewUploadTrigger,
    refreshCustomPreview,
    stopCustomPreviewLoader,
    shouldSpoofStreamPanelPreview,
    renderSpoofedStreamPanelPreview,
    isStreamSelectedInCallView,
    shouldGateStreamPanelVideo,
    applyPreviewUploadFilter,
    coerceParticipantResolution,
    getDisplayResolutionForLabel,
    coerceParticipantFrameRate,
    makeSelfResolutionFromSetting,
};
