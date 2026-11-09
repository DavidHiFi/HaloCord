/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import "./HaloColorPicker.css";

import { useEffect, useRef, useState } from "@webpack/common";

// "#abc" or "abc123", with or without the hash. Returns "#aabbcc", or null while the text is not a colour yet.
const parseHex = (text: string) => {
    const hex = text.trim().replace(/^#/, "").toLowerCase();
    if (/^[\da-f]{6}$/.test(hex)) return `#${hex}`;
    if (/^[\da-f]{3}$/.test(hex)) return `#${[...hex].map(c => c + c).join("")}`;
    return null;
};

export function HaloColorPicker({ value, label, onChange, disabled = false }: { value: string; label: string; onChange(value: string): void; disabled?: boolean; }) {
    const popup = useRef<HTMLDivElement>(null);
    const [hexDraft, setHexDraft] = useState(value.toUpperCase());
    useEffect(() => setHexDraft(value.toUpperCase()), [value]);
    const channels = [0, 1, 2].map(i => parseInt(value.slice(1 + i * 2, 3 + i * 2), 16));
    const update = (index: number, next: number) => onChange(`#${channels.map((v, i) => (i === index ? next : v).toString(16).padStart(2, "0")).join("")}`);
    return <>
        <button type="button" className="hc-colour-swatch" aria-label={label} aria-haspopup="dialog" disabled={disabled} style={{ backgroundColor: value }} onClick={e => {
            const box = e.currentTarget.getBoundingClientRect();
            const panel = popup.current!;
            panel.style.left = `${Math.max(8, Math.min(box.left, window.innerWidth - 276))}px`;
            panel.style.top = `${Math.max(8, Math.min(box.bottom + 8, window.innerHeight - 250))}px`;
            panel.showPopover();
        }} />
        <div ref={popup} popover="auto" role="dialog" aria-label={label} className="hc-colour-picker">
            <div className="hc-colour-heading"><strong>{label}</strong><button type="button" aria-label="Close colour picker" onClick={() => popup.current?.hidePopover()}>Close</button></div>
            <div className="hc-colour-preview" style={{ backgroundColor: value }} />
            {["Red", "Green", "Blue"].map((name, index) => <label key={name} className="hc-colour-channel">
                <span>{name}</span>
                <input type="range" min={0} max={255} value={channels[index]} aria-label={name} onChange={e => update(index, Number(e.currentTarget.value))} />
                <input type="number" min={0} max={255} value={channels[index]} aria-label={`${name} value`} onChange={e => {
                    if (e.currentTarget.value !== "") update(index, Math.max(0, Math.min(255, Number(e.currentTarget.value))));
                }} />
            </label>)}
            <label className="hc-colour-hex">
                <span>Hex</span>
                <input
                    type="text"
                    spellCheck={false}
                    maxLength={7}
                    value={hexDraft}
                    aria-label={`${label} hex value`}
                    aria-invalid={!parseHex(hexDraft)}
                    onChange={e => {
                        const text = e.currentTarget.value;
                        setHexDraft(text);
                        const hex = parseHex(text);
                        if (hex && hex !== value.toLowerCase()) onChange(hex);
                    }}
                    onBlur={() => setHexDraft(value.toUpperCase())}
                    onKeyDown={e => { if (e.key === "Enter") popup.current?.hidePopover(); }}
                />
            </label>
        </div>
    </>;
}
