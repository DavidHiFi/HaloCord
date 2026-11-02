/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import "./HaloThemes.css";

import { facesFor, localFacesReady, nearestFace } from "@api/HaloAppearance";
import { type Settings, useSettings } from "@api/Settings";
import { HaloRow, HaloSection } from "@components/HaloUI";
import { classNameFactory } from "@utils/css";
import { React, Select, useEffect, useRef, useState } from "@webpack/common";

import { ThemeFileRows, ThemeOptionRows } from "./MochaCordOptions";

const cl = classNameFactory("hc-mc-");

const fonts = [
    "FiraCode Nerd Font", "FiraCode Nerd Font Mono", "Fira Code", "JetBrains Mono", "Cascadia Code", "Consolas",
    "Inter", "Segoe UI", "Roboto", "Noto Sans", "Open Sans", "Figtree", "Arial"
];

type FontKind = "uiFont" | "codeFont";

// A text input with a styled suggestion menu. Chromium draws <datalist> popups itself, light and unstyleable.
function FontRow({ setting, title, description }: { setting: FontKind; title: string; description: string; }) {
    const settings = useSettings([setting, `${setting}Weight`, `${setting}Italic`]);
    const value = settings[setting];
    const [draft, setDraft] = useState(value);
    const [query, setQuery] = useState<string | null>(null);
    const [active, setActive] = useState(-1);
    const input = useRef<HTMLInputElement>(null);
    const list = useRef<HTMLDivElement>(null);
    const listId = `hc-font-list-${setting}`;

    useEffect(() => setDraft(value), [value]);

    const matches = query == null ? [] : fonts.filter(f => f.toLowerCase().includes(query.trim().toLowerCase()));
    const open = matches.length > 0;

    useEffect(() => { list.current?.children[active]?.scrollIntoView({ block: "nearest" }); }, [active]);

    const close = () => { setQuery(null); setActive(-1); };
    const commit = (next: string) => {
        setDraft(next.trim());
        settings[setting] = next.trim();
        close();
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            if (!open) { setQuery(""); setActive(0); return; }
            setActive(i => (i + (e.key === "ArrowDown" ? 1 : -1) + matches.length) % matches.length);
        } else if (e.key === "Enter") {
            commit(open && active >= 0 ? matches[active] : draft);
        } else if (e.key === "Escape" && open) {
            e.preventDefault();
            e.stopPropagation();
            close();
        }
    };

    return (
        <HaloRow title={title} description={description}>
            <div className={cl("combo")}>
                <input
                    ref={input}
                    className={cl("input", "font")}
                    role="combobox"
                    aria-expanded={open}
                    aria-controls={listId}
                    aria-autocomplete="list"
                    aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined}
                    placeholder="Discord default"
                    spellCheck={false}
                    value={draft}
                    style={draft ? { fontFamily: `"${draft}"`, fontWeight: settings[`${setting}Weight`], fontStyle: settings[`${setting}Italic`] ? "italic" : undefined } : undefined}
                    onChange={e => { setDraft(e.currentTarget.value); setQuery(e.currentTarget.value); setActive(-1); }}
                    onBlur={() => commit(draft)}
                    onKeyDown={onKeyDown}
                />
                <button
                    type="button"
                    tabIndex={-1}
                    aria-label={`Show ${title.toLowerCase()} suggestions`}
                    className={cl("combo-arrow", open && "combo-arrow-open")}
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => { input.current?.focus(); open ? close() : setQuery(""); }}
                >
                    <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" /></svg>
                </button>
                {open && (
                    <div ref={list} id={listId} role="listbox" className={cl("combo-menu")} onMouseDown={e => e.preventDefault()}>
                        {matches.map((font, i) => (
                            <div
                                key={font}
                                id={`${listId}-${i}`}
                                role="option"
                                aria-selected={i === active}
                                className={cl("combo-option", i === active && "combo-option-active", font === value && "combo-option-current")}
                                style={{ fontFamily: `"${font}"` }}
                                onMouseEnter={() => setActive(i)}
                                onClick={() => commit(font)}
                            >
                                {font}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <button type="button" className={cl("button")} disabled={!value && !draft} onClick={() => commit("")}>Reset</button>
        </HaloRow>
    );
}

// The styles installed for the chosen font (Light, Regular, SemiBold, Bold...) and an italic toggle.
function FontStyleRow({ setting, title }: { setting: FontKind; title: string; }) {
    const weightKey = `${setting}Weight` as const, italicKey = `${setting}Italic` as const;
    const settings = useSettings([setting, weightKey, italicKey]);
    const [, setLoaded] = useState(false);
    useEffect(() => { localFacesReady.then(() => setLoaded(true)); }, []);

    const family = settings[setting].trim();
    if (!family || family.includes(",")) return null;

    const faces = facesFor(family) ?? [];
    const upright = faces.filter(f => !f.italic);
    const styles = [...new Map([...(upright.length ? upright : faces)].sort((a, b) => a.weight - b.weight).map(f => [f.weight, f])).values()];
    const active = styles.length ? nearestFace(styles, settings[weightKey]).weight : null;
    const hasItalic = faces.some(f => f.italic);
    const italic = settings[italicKey];

    const description = !faces.length
        ? `${family} isn't installed on this PC, so its styles can't be listed.`
        : `Styles installed for ${family}. Text Discord already shows heavier stays heavier.${hasItalic ? "" : " This font has no italic style, so Italic slants the regular one."}`;

    return (
        <HaloRow title={title} description={description}>
            <div className={cl("segmented", "font-styles")} role="radiogroup" aria-label={title}>
                {styles.map(f => (
                    <button
                        key={f.weight}
                        type="button"
                        role="radio"
                        aria-checked={active === f.weight}
                        className={cl("segment", active === f.weight && "segment-on")}
                        style={{ fontFamily: `"${family}"`, fontWeight: f.weight }}
                        onClick={() => settings[weightKey] = f.weight}
                    >
                        {f.style}
                    </button>
                ))}
                <button
                    type="button"
                    role="switch"
                    aria-checked={italic}
                    className={cl("segment", italic && "segment-on")}
                    style={{ fontFamily: `"${family}"`, fontStyle: "italic" }}
                    onClick={() => settings[italicKey] = !italic}
                >
                    Italic
                </button>
            </div>
        </HaloRow>
    );
}

type ThemeChoice = "disabled" | Settings["haloThemeVariant"];

const themeChoices: { label: string; value: ThemeChoice; }[] = [
    { label: "Disabled", value: "disabled" },
    { label: "HaloCord", value: "halocord" },
    { label: "MochaCord", value: "mochacord" }
];

export function HaloAppearanceSection() {
    const settings = useSettings(["haloTheming", "haloThemeVariant"]);
    const choice: ThemeChoice = settings.haloTheming ? settings.haloThemeVariant : "disabled";

    const choose = (next: ThemeChoice) => {
        if (next !== "disabled") settings.haloThemeVariant = next;
        settings.haloTheming = next !== "disabled";
    };

    return (
        <HaloSection title="HaloCord look">
            <HaloRow
                accent
                title="Theme"
                description="HaloCord has a green accent, MochaCord a Catppuccin Mocha blue one. Both style Discord, settings and HaloCord windows. Disabled shows stock Discord."
            >
                <div className={cl("theme-select")}>
                    <Select options={themeChoices} closeOnSelect isSelected={v => v === choice} serialize={String} select={choose} />
                </div>
            </HaloRow>
            {settings.haloTheming && <ThemeFileRows />}
            <FontRow setting="uiFont" title="UI font" description="The font for the whole app. Type the name of a font installed on this PC. Leave it empty for Discord's font." />
            <FontStyleRow setting="uiFont" title="UI font style" />
            <FontRow setting="codeFont" title="Code font" description="The font for code blocks and inline code. Leave it empty for Discord's font." />
            <FontStyleRow setting="codeFont" title="Code font style" />
            {settings.haloTheming && <ThemeOptionRows />}
        </HaloSection>
    );
}
