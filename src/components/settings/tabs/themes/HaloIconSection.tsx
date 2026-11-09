/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import "./HaloThemes.css";
import "./HaloIconSection.css";

import { useSettings } from "@api/Settings";
import { HaloRow, HaloSection } from "@components/HaloUI";
import { HALOCORD_ICONS } from "@components/TestCordLogo";
import { classNameFactory } from "@utils/css";
import { useEffect, useState } from "@webpack/common";

const cl = classNameFactory("hc-mc-");

type IconVariant = keyof typeof HALOCORD_ICONS;

const CHOICES: { value: IconVariant; label: string; }[] = [
    { value: "stock", label: "Stock" },
    { value: "green", label: "Green" },
    { value: "mocha", label: "Mocha blue" }
];

// Shell side: desktop/shell/hc-desktop.js and hc-icon.js, exposed by the preload as window.HaloCordDesktop.
interface AppIconResult {
    variant: IconVariant;
    shortcuts?: number;
    exe?: string;
    error?: string;
}

const native = () => window.HaloCordDesktop as undefined | {
    get(): Promise<{ appIcon?: IconVariant; canSetAppIcon?: boolean; }>;
    set(key: "appIcon", value: IconVariant): Promise<AppIconResult | false>;
};

function IconChoice({ title, value, onChange, disabled }: { title: string; value: IconVariant; onChange(v: IconVariant): void; disabled?: boolean; }) {
    return (
        <div className={cl("segmented")} role="radiogroup" aria-label={title}>
            {CHOICES.map(c => (
                <button
                    key={c.value}
                    type="button"
                    role="radio"
                    aria-checked={value === c.value}
                    disabled={disabled}
                    className={cl("segment", "icon-choice", value === c.value && "segment-on")}
                    onClick={() => value !== c.value && onChange(c.value)}
                >
                    <img src={HALOCORD_ICONS[c.value]} alt="" draggable={false} />
                    {c.label}
                </button>
            ))}
        </div>
    );
}

function describe(r: AppIconResult | false) {
    if (!r) return "This version of HaloCord can't change its app icon.";
    if (r.error) return `The icon could not be changed: ${r.error}`;
    const links = r.shortcuts ? `${r.shortcuts} shortcut${r.shortcuts === 1 ? "" : "s"}, ` : "";
    if (r.exe?.startsWith("failed")) return `Changed the windows, tray and ${links}but HaloCord.exe kept its icon (${r.exe.slice(8)}).`;
    if (r.exe === "at restart") return `Changed the windows, tray${r.shortcuts ? ` and ${links.slice(0, -2)}` : ""}. HaloCord.exe gets the new icon the next time HaloCord restarts.`;
    return `Changed the windows, tray, ${links}and HaloCord.exe.`;
}

function AppIconRow() {
    const [value, setValue] = useState<IconVariant | null>(null);
    const [supported, setSupported] = useState(false);
    const [busy, setBusy] = useState(false);
    const [status, setStatus] = useState("");

    useEffect(() => {
        native()?.get().then(p => {
            if (typeof p.appIcon !== "string") return;
            setValue(p.appIcon);
            setSupported(!!p.canSetAppIcon);
        }).catch(() => { });
    }, []);

    const choose = async (v: IconVariant) => {
        const previous = value;
        setValue(v);
        setBusy(true);
        setStatus("Changing the icon...");
        try {
            const result = await native()!.set("appIcon", v);
            // Nothing changed, so the picker goes back to the icon HaloCord still has.
            if (!result || result.error) setValue(previous);
            setStatus(describe(result));
        } catch (e) {
            setValue(previous);
            setStatus(`The icon could not be changed: ${String((e as Error)?.message ?? e)}`);
        } finally {
            setBusy(false);
        }
    };

    const description = !supported
        ? "Available in the installed HaloCord desktop app."
        : status || "The icon for HaloCord.exe, its Start menu, desktop and taskbar shortcuts, the window and the tray.";

    return (
        <HaloRow title="App icon" description={description} disabled={!supported}>
            <IconChoice title="App icon" value={value ?? "green"} onChange={choose} disabled={!supported || busy} />
        </HaloRow>
    );
}

export function HaloIconSection() {
    const settings = useSettings(["haloInAppIcon"]);

    return (
        <HaloSection title="HaloCord icon">
            <AppIconRow />
            <HaloRow title="Icon inside Discord" description="The icon in the settings sidebar, on plugin cards, on the support card and, with Use HaloCord Icon on, the home button. Stock shows Discord's own.">
                <IconChoice title="Icon inside Discord" value={settings.haloInAppIcon} onChange={v => settings.haloInAppIcon = v} />
            </HaloRow>
        </HaloSection>
    );
}
