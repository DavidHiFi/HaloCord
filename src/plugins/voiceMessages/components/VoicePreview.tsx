/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2023 Vendicated and contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { lodash, useEffect, useRef, useState } from "@webpack/common";
import type { PointerEvent } from "react";

import { cl } from "..";

const BAR_COUNT = 72;

export const formatTime = (seconds: number) => {
    const s = Math.floor(seconds);
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
};

export function VoicePreview({ src, bins, duration }: { src?: string; bins: Uint8Array; duration: number; }) {
    const audio = useRef<HTMLAudioElement>(null);
    const [playing, setPlaying] = useState(false);
    const [time, setTime] = useState(0);

    useEffect(() => {
        setPlaying(false);
        setTime(0);
    }, [src]);

    useEffect(() => {
        if (!playing) return;
        let frame = requestAnimationFrame(function tick() {
            if (audio.current) setTime(audio.current.currentTime);
            frame = requestAnimationFrame(tick);
        });
        return () => cancelAnimationFrame(frame);
    }, [playing]);

    const seek = (to: number) => {
        const t = lodash.clamp(to, 0, duration);
        if (audio.current) audio.current.currentTime = t;
        setTime(t);
    };
    const seekToPointer = (e: PointerEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        seek((e.clientX - rect.left) / rect.width * duration);
    };

    const progress = duration ? time / duration : 0;
    const bars = Array.from({ length: BAR_COUNT }, (_, i) => bins.length ? bins[Math.floor(i * bins.length / BAR_COUNT)] : 0);

    return (
        <div className={cl("player", { "player-empty": !src })}>
            <audio
                ref={audio}
                src={src}
                preload="auto"
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onEnded={() => setTime(duration)}
            />
            <button
                type="button"
                className={cl("play")}
                disabled={!src}
                aria-label={playing ? "Pause" : "Play"}
                onClick={() => {
                    if (!audio.current) return;
                    if (playing) audio.current.pause();
                    else {
                        if (audio.current.ended) audio.current.currentTime = 0;
                        void audio.current.play();
                    }
                }}
            >
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                    <path fill="currentColor" d={playing ? "M7 4h4v16H7zM13 4h4v16h-4z" : "M8 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 8 4.5z"} />
                </svg>
            </button>
            <div
                className={cl("wave")}
                role="slider"
                tabIndex={src ? 0 : -1}
                aria-label="Seek"
                aria-disabled={!src}
                aria-valuemin={0}
                aria-valuemax={Math.round(duration)}
                aria-valuenow={Math.round(time)}
                aria-valuetext={formatTime(time)}
                onPointerDown={e => {
                    if (!src) return;
                    e.currentTarget.setPointerCapture(e.pointerId);
                    seekToPointer(e);
                }}
                onPointerMove={e => {
                    if (e.currentTarget.hasPointerCapture(e.pointerId)) seekToPointer(e);
                }}
                onKeyDown={e => {
                    if (e.key === "ArrowLeft") seek(time - 2);
                    else if (e.key === "ArrowRight") seek(time + 2);
                }}
            >
                {bars.map((v, i) => (
                    <span
                        key={i}
                        className={cl("bar", { "bar-played": (i + 0.5) / BAR_COUNT <= progress })}
                        style={{ height: `${Math.max(10, v / 2.55)}%` }}
                    />
                ))}
            </div>
            <span className={cl("time")}>{formatTime(time)} / {formatTime(duration)}</span>
        </div>
    );
}
