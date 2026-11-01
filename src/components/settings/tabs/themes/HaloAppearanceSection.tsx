/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import "./HaloThemes.css";

import { useSettings } from "@api/Settings";
import { HaloRow, HaloSection, HaloSwitchRow } from "@components/HaloUI";
import { classNameFactory } from "@utils/css";
import { useEffect, useState } from "@webpack/common";

const cl = classNameFactory("hc-mc-");

const fonts = [
    "FiraCode Nerd Font", "FiraCode Nerd Font Mono", "Fira Code", "JetBrains Mono", "Cascadia Code", "Consolas",
    "Inter", "Segoe UI", "Roboto", "Noto Sans", "Open Sans", "Figtree", "Arial"
];

function FontRow({ setting, title, description }: { setting: "uiFont" | "codeFont"; title: string; description: string; }) {
    const settings = useSettings([setting]);
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
                style={draft ? { fontFamily: `"${draft}"` } : undefined}
                onChange={e => setDraft(e.currentTarget.value)}
                onBlur={() => commit(draft)}
                onKeyDown={e => e.key === "Enter" && commit(draft)}
            />
            <button type="button" className={cl("button")} disabled={!value && !draft} onClick={() => commit("")}>Reset</button>
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
            <FontRow setting="codeFont" title="Code font" description="The font for code blocks and inline code. Leave it empty for Discord's font." />
            <datalist id="hc-font-list">
                {fonts.map(font => <option key={font} value={font} />)}
            </datalist>
        </HaloSection>
    );
}
