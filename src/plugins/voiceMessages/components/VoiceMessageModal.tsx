/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Button } from "@components/Button";
import { HaloPill, HaloSection, HaloSwitchRow, type HaloTone } from "@components/HaloUI";
import { ClockIcon } from "@components/Icons";
import { useAwaiter } from "@utils/react";
import { chooseFile } from "@utils/web";
import { RenderModalProps } from "@vencord/discord-types";
import { lodash, Modal, showToast, useEffect, useMemo, useRef, useState } from "@webpack/common";

import { type AudioMetadata, cl, sendAudio, settings } from "..";
import { cleanMedia, listMics, type Mic } from "../mics";
import { webmOpusToOgg } from "../ogg";
import { formatTime, VoicePreview } from "./VoicePreview";

type Status = "idle" | "starting" | "recording" | "paused" | "processing";

const STATUS_PILL: Record<Status, [HaloTone, string]> = {
    idle: ["muted", "Not recording"],
    starting: ["info", "Opening microphone"],
    recording: ["bad", "Recording"],
    paused: ["warn", "Paused"],
    processing: ["info", "Finishing"],
};

const errorText = (e: unknown) => e instanceof Error ? e.message : String(e);

const EMPTY_META = { waveform: "AAAAAAAAAAAA", duration: 1, bins: new Uint8Array() };

function analyse(audioBuffer: AudioBuffer): AudioMetadata & { bins: Uint8Array; } {
    const channelData = audioBuffer.getChannelData(0);
    const binCount = lodash.clamp(Math.floor(audioBuffer.duration * 10), Math.min(32, channelData.length), 256);
    const bins = new Uint8Array(binCount);
    const samplesPerBin = Math.floor(channelData.length / binCount);

    for (let binIdx = 0; binIdx < binCount; binIdx++) {
        let sum = 0;
        for (let sampleIdx = 0; sampleIdx < samplesPerBin; sampleIdx++)
            sum += channelData[binIdx * samplesPerBin + sampleIdx] ** 2;
        bins[binIdx] = Math.floor(Math.sqrt(sum / samplesPerBin) * 0xFF);
    }

    const maxBin = Math.max(...bins);
    if (maxBin) {
        const easing = Math.min(1, 100 * (maxBin / 0xFF) ** 3);
        const ratio = 1 + (0xFF / maxBin - 1) * easing;
        for (let i = 0; i < binCount; i++) bins[i] = Math.min(0xFF, Math.floor(bins[i] * ratio));
    }

    return { waveform: window.btoa(String.fromCharCode(...bins)), duration: audioBuffer.duration, bins };
}

export function VoiceMessageModal({ modalProps }: { modalProps: RenderModalProps; }) {
    const { micId, noiseSuppression, echoCancellation } = settings.use(["micId", "noiseSuppression", "echoCancellation"]);
    const [mics, setMics] = useState<Mic[]>([]);
    const [status, setStatus] = useState<Status>("idle");
    const [elapsed, setElapsed] = useState(0);
    const [blob, setBlob] = useState<Blob>();
    const [error, setError] = useState<string>();
    const rec = useRef<{ recorder: MediaRecorder; recorded: number; since: number; } | null>(null);
    const open = useRef(true);

    useEffect(() => {
        listMics().then(setMics, e => setError(`Could not list microphones: ${errorText(e)}`));
        return () => {
            open.current = false;
            const r = rec.current?.recorder;
            if (!r) return;
            r.onstop = null;
            if (r.state !== "inactive") r.stop();
            r.stream.getTracks().forEach(t => t.stop());
        };
    }, []);

    useEffect(() => {
        if (status !== "recording") return;
        const id = setInterval(() => rec.current && setElapsed(rec.current.recorded + Date.now() - rec.current.since), 200);
        return () => clearInterval(id);
    }, [status]);

    const selectedMic = mics.find(m => m.id === micId) ?? mics[0];
    const busy = status !== "idle";

    async function start() {
        if (!selectedMic) return;
        setError(undefined);
        setBlob(undefined);
        setElapsed(0);
        setStatus("starting");
        try {
            const stream = await cleanMedia().getUserMedia({
                audio: {
                    deviceId: selectedMic.id === "default" ? undefined : { exact: selectedMic.id },
                    echoCancellation,
                    noiseSuppression,
                }
            });
            if (!open.current) {
                stream.getTracks().forEach(t => t.stop());
                return;
            }
            const recorder = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" });
            const chunks: Blob[] = [];
            recorder.ondataavailable = e => chunks.push(e.data);
            recorder.onstop = async () => {
                stream.getTracks().forEach(t => t.stop());
                setStatus("processing");
                try {
                    setBlob(webmOpusToOgg(await new Blob(chunks).arrayBuffer()));
                } catch (e) {
                    setError(`Could not finish the recording: ${errorText(e)}`);
                }
                setStatus("idle");
            };
            recorder.start();
            rec.current = { recorder, recorded: 0, since: Date.now() };
            setStatus("recording");
        } catch (e) {
            setError(`Could not open ${selectedMic.label}: ${errorText(e)}`);
            setStatus("idle");
        }
    }

    function pause() {
        if (!rec.current) return;
        rec.current.recorder.pause();
        rec.current.recorded += Date.now() - rec.current.since;
        setElapsed(rec.current.recorded);
        setStatus("paused");
    }

    function resume() {
        if (!rec.current) return;
        rec.current.recorder.resume();
        rec.current.since = Date.now();
        setStatus("recording");
    }

    function stop() {
        const r = rec.current;
        if (!r) return;
        if (r.recorder.state === "recording") r.recorded += Date.now() - r.since;
        setElapsed(r.recorded);
        r.recorder.stop();
    }

    const url = useMemo(() => blob && URL.createObjectURL(blob), [blob]);
    useEffect(() => () => {
        if (url) URL.revokeObjectURL(url);
    }, [url]);

    const [meta, metaError] = useAwaiter(async () => {
        if (!blob) return EMPTY_META;
        const ctx = new AudioContext();
        try {
            return analyse(await ctx.decodeAudioData(await blob.arrayBuffer()));
        } finally {
            void ctx.close();
        }
    }, { deps: [blob], fallbackValue: EMPTY_META });

    const takeFile = (file: File) => {
        setError(undefined);
        setElapsed(0);
        setBlob(file);
    };

    const unsupported = blob && (!blob.type.startsWith("audio/ogg") || blob.type.includes("codecs") && !blob.type.includes("opus"));
    const [pillTone, pillText] = blob && !busy ? ["good", "Ready to send"] as const : STATUS_PILL[status];

    return (
        <Modal {...modalProps} size="md" className={cl("modal")} title="Record voice message">
            <div
                className={cl("body")}
                onDrop={e => {
                    e.preventDefault();
                    const file = e.dataTransfer.files[0];
                    if (file && !busy) takeFile(file);
                }}
                onDragOver={e => e.preventDefault()}
            >
                <HaloSection title="Microphone">
                    <div className={cl("mics")} role="radiogroup" aria-label="Microphone">
                        {mics.map(mic => (
                            <button
                                key={mic.id}
                                type="button"
                                role="radio"
                                aria-checked={mic === selectedMic}
                                disabled={busy}
                                className={cl("mic", { "mic-selected": mic === selectedMic })}
                                onClick={() => settings.store.micId = mic.id}
                            >
                                <span className={cl("mic-dot")} />
                                <span className={cl("mic-text")}>
                                    <span className={cl("mic-title")}>{mic.title}</span>
                                    <span className={cl("mic-label")}>{mic.label}</span>
                                </span>
                            </button>
                        ))}
                    </div>
                    <div className={cl("switches")}>
                        <HaloSwitchRow title="Noise suppression" value={noiseSuppression} disabled={busy} onChange={v => settings.store.noiseSuppression = v} />
                        <HaloSwitchRow title="Echo cancellation" value={echoCancellation} disabled={busy} onChange={v => settings.store.echoCancellation = v} />
                    </div>
                </HaloSection>

                <HaloSection title="Recording">
                    <div className={cl("recorder")}>
                        <span className={cl("dot", { "dot-live": status === "recording" })} />
                        <span className={cl("timer")}>{formatTime((blob && !busy ? meta.duration * 1000 : elapsed) / 1000)}</span>
                        <HaloPill tone={pillTone}>{pillText}</HaloPill>
                        <div className={cl("controls")}>
                            {status === "idle" && !blob && <Button size="small" className="hc-ui-btn-accent" disabled={!selectedMic} onClick={start}>Start recording</Button>}
                            {status === "idle" && blob && <Button size="small" className="hc-ui-btn-quiet" onClick={start}>Redo</Button>}
                            {status === "recording" && <Button size="small" className="hc-ui-btn-quiet" onClick={pause}>Pause</Button>}
                            {status === "paused" && <Button size="small" className="hc-ui-btn-quiet" onClick={resume}>Resume</Button>}
                            {(status === "recording" || status === "paused") && <Button size="small" className="hc-ui-btn-accent" onClick={stop}>Stop</Button>}
                        </div>
                    </div>
                    {error && <div className={cl("error")}>{error}</div>}
                </HaloSection>

                <HaloSection title="Preview">
                    {metaError
                        ? <div className={cl("error")}>Could not read this audio: {metaError.message}</div>
                        : <VoicePreview src={busy ? undefined : url} bins={meta.bins} duration={blob ? meta.duration : 0} />}
                    {unsupported && (
                        <div className={cl("warning")}>
                            This file is {blob.type || "not Ogg Opus"}, so it may not play on iPhone. Voice messages should be Ogg Opus.
                        </div>
                    )}
                    <div className={cl("actions")}>
                        <Button
                            size="small"
                            className="hc-ui-btn-quiet"
                            disabled={busy}
                            onClick={async () => {
                                const file = await chooseFile("audio/*");
                                if (file) takeFile(file);
                            }}
                        >
                            Upload file
                        </Button>
                        <Button
                            size="small"
                            className="hc-ui-btn-accent"
                            disabled={!blob || busy || !!metaError}
                            onClick={() => {
                                if (!blob) return;
                                sendAudio(blob, meta);
                                modalProps.onClose();
                                showToast({ text: "Sending voice message...", icon: ClockIcon, iconColor: "var(--text-default)" });
                            }}
                        >
                            Send
                        </Button>
                    </div>
                </HaloSection>
            </div>
        </Modal>
    );
}
