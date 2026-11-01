/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import "./HaloThemes.css";

import { facesFor, localFacesReady, nearestFace } from "@api/HaloAppearance";
import { useSettings } from "@api/Settings";
import { HaloRow, HaloSection, HaloSwitchRow } from "@components/HaloUI";
import { classNameFactory } from "@utils/css";
import { useEffect, useState } from "@webpack/common";

const cl = classNameFactory("hc-mc-");

const fonts = [
    "FiraCode Nerd Font", "FiraCode Nerd Font Mono", "Fira Code", "JetBrains Mono", "Cascadia Code", "Consolas",
    "Inter", "Segoe UI", "Roboto", "Noto Sans", "Open Sans", "Figtree", "Arial"
];

type FontKind = "uiFont" | "codeFont";

function FontRow({ setting, title, description }: { setting: FontKind; title: string; description: string; }) {
    const settings = useSettings([setting, `${setting}Weight`, `${setting}Italic`]);
    const value = settings[setting];
    const [draft, setDraft] = useState(value);

    useEffect(() => setDraft(value), [value]);

    const commit = (next: string) => {
        setDraft(next.trim());
        settings[setting] = next.trim();
    };

    return (
        <HaloRow title={title} description={description}>
            <input
                className={cl("input", "font")}
                list="hc-font-list"
                placeholder="Discord default"
                spellCheck={false}
                value={draft}
                style={draft ? { fontFamily: `"${draft}"`, fontWeight: settings[`${setting}Weight`], fontStyle: settings[`${setting}Italic`] ? "italic" : undefined } : undefined}
                onChange={e => setDraft(e.currentTarget.value)}
                onBlur={() => commit(draft)}
                onKeyDown={e => e.key === "Enter" && commit(draft)}
            />
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

export function HaloAppearanceSection() {
    const settings = useSettings(["haloTheming"]);

    return (
        <HaloSection title="HaloCord look">
            <HaloSwitchRow
                title="HaloCord theming"
                description="Style settings, plugin windows and HaloCord windows with the HaloCord look. Turn it off for stock Discord styling."
                value={settings.haloTheming}
                onChange={v => settings.haloTheming = v}
            />
            <FontRow setting="uiFont" title="UI font" description="The font for the whole app. Type the name of a font installed on this PC. Leave it empty for Discord's font." />
            <FontStyleRow setting="uiFont" title="UI font style" />
            <FontRow setting="codeFont" title="Code font" description="The font for code blocks and inline code. Leave it empty for Discord's font." />
            <FontStyleRow setting="codeFont" title="Code font style" />
            <datalist id="hc-font-list">
                {fonts.map(font => <option key={font} value={font} />)}
            </datalist>
        </HaloSection>
    );
}
