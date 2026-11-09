/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import "./settings.css";

import { HaloRow, HaloSection, HaloSwitchRow } from "@components/HaloUI";
import { classNameFactory } from "@utils/css";
import { Select, Slider, useEffect, useRef, useState } from "@webpack/common";

import { HEX_COLOR, RejoinSkip, settings, SpeakingIndicator } from "./settings";
import { applyTileGlow, syncTiles } from "./tiles";

const cl = classNameFactory("hc-calls-");

const SKIP_OPTIONS: { label: string; value: RejoinSkip; }[] = [
    { label: "DMs and servers", value: "both" },
    { label: "DMs only", value: "dms" },
    { label: "Servers only", value: "servers" },
    { label: "Never", value: "none" }
];

const INDICATOR_OPTIONS: { label: string; value: SpeakingIndicator; }[] = [
    { label: "Tile border", value: "box" },
    { label: "Profile picture", value: "picture" }
];

function Choice<T extends string>({ options, value, onChange, disabled }: { options: { label: string; value: T; }[]; value: T; onChange(value: T): void; disabled?: boolean; }) {
    return (
        <div className={cl("select")}>
            <Select
                options={options}
                closeOnSelect
                isDisabled={disabled}
                isSelected={v => v === value}
                serialize={String}
                select={onChange}
            />
        </div>
    );
}

interface SliderRowProps {
    title: string;
    description: string;
    value: number;
    min: number;
    max: number;
    step: number;
    unit: string;
    disabled?: boolean;
    onChange(value: number): void;
}

function SliderRow({ title, description, value, min, max, step, unit, disabled, onChange }: SliderRowProps) {
    const snap = (v: number) => Math.round(v / step) * step;
    return (
        <HaloRow title={title} description={description} disabled={disabled}>
            <div className={cl("slider")}>
                <Slider
                    markers={[min, max]}
                    minValue={min}
                    maxValue={max}
                    initialValue={value}
                    stickToMarkers={false}
                    disabled={disabled}
                    onValueChange={(v: number) => onChange(snap(v))}
                    onValueRender={(v: number) => `${snap(v)}${unit}`}
                    onMarkerRender={(v: number) => `${v}${unit}`}
                />
            </div>
        </HaloRow>
    );
}

interface ColorRowProps {
    title: string;
    description: string;
    value: string;
    fallback: string;
    optional?: boolean;
    disabled?: boolean;
    onChange(value: string): void;
}

function ColorRow({ title, description, value, fallback, optional, disabled, onChange }: ColorRowProps) {
    const [draft, setDraft] = useState(value);
    const timer = useRef<number | undefined>(undefined);
    const accepts = (next: string) => HEX_COLOR.test(next) || (optional === true && next === "");

    useEffect(() => setDraft(value), [value]);
    useEffect(() => () => clearTimeout(timer.current), []);

    // The colour picker fires on every drag step, so wait until it rests before saving.
    const commit = (next: string, delay = 0) => {
        setDraft(next);
        clearTimeout(timer.current);
        if (accepts(next)) timer.current = window.setTimeout(() => onChange(next), delay);
    };

    return (
        <HaloRow title={title} description={description} disabled={disabled}>
            <input
                type="color"
                className={cl("swatch")}
                aria-label={`${title} picker`}
                disabled={disabled}
                value={HEX_COLOR.test(draft) && draft.length === 7 ? draft : fallback}
                onChange={e => commit(e.currentTarget.value, 250)}
            />
            <input
                className={cl("hex", !accepts(draft) && "hex-bad")}
                aria-label={`${title} hex value`}
                placeholder={optional ? "None" : fallback}
                spellCheck={false}
                disabled={disabled}
                value={draft}
                onChange={e => commit(e.currentTarget.value.trim())}
            />
        </HaloRow>
    );
}

export function RejoinSettings() {
    const s = settings.use();
    const off = !s.rejoin;
    return (
        <>
            <HaloSwitchRow
                title="Rejoin calls after a restart"
                description="Puts you back in the DM or server call you were in when HaloCord restarts."
                value={s.rejoin}
                onChange={v => settings.store.rejoin = v}
            />
            <SliderRow title="Rejoin delay" description="How long to wait after starting before joining again." value={s.rejoinDelay} min={1} max={10} step={1} unit="s" disabled={off} onChange={v => settings.store.rejoinDelay = v} />
            <SliderRow title="Give up after" description="Skips the rejoin if you left the call longer ago than this." value={s.rejoinTimeout} min={5} max={120} step={5} unit="s" disabled={off} onChange={v => settings.store.rejoinTimeout = v} />
            <HaloRow title="Skip empty calls" description="Stays out when nobody else is left in the call." disabled={off}>
                <Choice options={SKIP_OPTIONS} value={s.rejoinSkip} disabled={off} onChange={v => settings.store.rejoinSkip = v} />
            </HaloRow>
            <HaloSwitchRow title="Only DM calls" description="Rejoins DM and group calls, never server voice channels." value={s.rejoinDmsOnly} disabled={off} onChange={v => settings.store.rejoinDmsOnly = v} />
        </>
    );
}

type GlowKey = "overrideGlow" | "hoverGlow" | "glowColor" | "glowColor2";

export function TileSettings() {
    const s = settings.use();
    const off = !s.tiles;
    const glowOff = off || !s.overrideGlow;
    const setGlow = <K extends GlowKey>(key: K, value: typeof settings.store[K]) => {
        settings.store[key] = value;
        applyTileGlow();
    };
    return (
        <HaloSection title="Call tiles">
            <HaloSwitchRow
                title="Full profile pictures"
                description="Fills each voice tile with the person's full-size picture, with rounded corners."
                value={s.tiles}
                onChange={v => { settings.store.tiles = v; syncTiles(); }}
            />
            <SliderRow title="Picture rounding" description="0 is a square, 50 and up is a circle." value={s.avatarRadius} min={0} max={52} step={2} unit="%" disabled={off} onChange={v => settings.store.avatarRadius = v} />
            <SliderRow title="Tile rounding" description="Corner rounding of the tile itself." value={s.cornerRadius} min={0} max={52} step={2} unit="px" disabled={off} onChange={v => settings.store.cornerRadius = v} />
            <SliderRow title="Picture size" description="Lower values shrink the picture inside the tile." value={s.zoom} min={25} max={100} step={5} unit="%" disabled={off} onChange={v => settings.store.zoom = v} />
            <HaloSwitchRow title="Profile banners" description="Uses the person's profile banner as the tile background when they have no USRBG background." value={s.showUserBanners} disabled={off} onChange={v => settings.store.showUserBanners = v} />
            <HaloSwitchRow title="Banners over USRBG" description="Shows the profile banner even when the person has a USRBG background." value={s.preferBanners} disabled={off || !s.showUserBanners} onChange={v => settings.store.preferBanners = v} />
            <HaloSwitchRow title="Hide tile background" description="Turns off Discord's background box behind the picture." value={s.hideTileBackground} disabled={off} onChange={v => settings.store.hideTileBackground = v} />
            <HaloSwitchRow title="Hide user backgrounds" description="Also hides backgrounds people set themselves, like USRBG banners." value={s.hideUserBackgrounds} disabled={off} onChange={v => settings.store.hideUserBackgrounds = v} />
            <HaloRow title="Speaking glow" description="Where the glow shows while someone talks. Camera tiles keep the tile border." disabled={off}>
                <Choice options={INDICATOR_OPTIONS} value={s.speakingIndicator} disabled={off} onChange={v => settings.store.speakingIndicator = v} />
            </HaloRow>
            <HaloSwitchRow title="Custom glow colour" description="Replaces Discord's green speaking ring with your own colour." value={s.overrideGlow} disabled={off} onChange={v => setGlow("overrideGlow", v)} />
            <ColorRow title="Glow colour" description="Main colour of the speaking glow." value={s.glowColor} fallback="#89b4fa" disabled={glowOff} onChange={v => setGlow("glowColor", v)} />
            <ColorRow title="Second glow colour" description="Turns the glow into a gradient. Leave it empty for one colour." value={s.glowColor2} fallback="#cba6f7" optional disabled={glowOff} onChange={v => setGlow("glowColor2", v)} />
            <HaloSwitchRow title="Glow on hover" description="Lights a tile's glow while your pointer is over it." value={s.hoverGlow} disabled={off} onChange={v => setGlow("hoverGlow", v)} />
        </HaloSection>
    );
}
