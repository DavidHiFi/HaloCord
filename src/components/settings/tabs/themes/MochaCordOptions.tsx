/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import "./HaloThemes.css";

import { isHexColor, mochaColors } from "@api/HaloAppearance";
import { type MochaCordSettings, type ThemeActivationMode, useSettings } from "@api/Settings";
import { isMochaCordTheme, MOCHACORD_FILE, reapplyThemes } from "@api/Themes";
import { HaloPill, HaloRow, HaloSwitchRow } from "@components/HaloUI";
import { UserThemeHeader } from "@main/themes";
import { classNameFactory } from "@utils/css";
import { openModal, showToast, useEffect, useRef, useState } from "@webpack/common";

import { CodeViewerModal } from "./CodeViewerModal";

const cl = classNameFactory("hc-mc-");

const activationOptions: [ThemeActivationMode, string][] = [["always", "Always on"], ["light", "Light only"], ["dark", "Dark only"]];

const colorLabels: Record<typeof mochaColors[number][0], [string, string, string]> = {
    accent: ["Accent", "Links, buttons and switches.", "#89b4fa"],
    text: ["Text", "Messages, names and headings.", "#cdd6f4"],
    textMuted: ["Muted text", "Channels, icons and timestamps.", "#7f849c"],
    surface: ["Surfaces", "Buttons, cards and inputs.", "#313244"],
    background: ["Background", "Panels, chat and popups. The panels stay see-through.", "#1e1e2e"],
    hoverColor: ["Hover border", "The border colour of a panel under the mouse.", "#89b4fa"]
};

type Flag = { [K in keyof MochaCordSettings]: MochaCordSettings[K] extends boolean ? K : never }[keyof MochaCordSettings];

const features: [Flag, string, string][] = [
    ["animations", "Animations", "Smooth transitions on lists, borders and the home button."],
    ["windowControls", "Round window buttons", "Close, minimise and maximise as round dots in the title bar."],
    ["transparency", "Transparency", "Let the window background show through the panels."],
    ["panelBlur", "Panel blur", "Blur what sits behind the panels."],
    ["separatedChatBar", "Separate chat bar", "Line the message box up with the user panel."],
    ["smallUserPanel", "Small user panel", "A compact user panel at the bottom left."],
    ["whiteNames", "White names", "Show Nitro and ShowMeYourName name styles in plain white."],
    ["voiceButtonColors", "VoiceButtons colours", "Give VoiceButtons plugin buttons the accent colour."]
];

const locations: [Flag, string, string][] = [
    ["hideVoiceMenus", "Hide voice menu arrows", "Hide the small menu buttons next to mute and deafen."],
    ["reorderPicker", "GIF, sticker, emoji order", "Put the GIF button first in the message box."],
    ["hideBarTitle", "Hide title bar text", "Hide the server and channel name in Discord's top bar."]
];

const topBarButtons: [MochaCordSettings["topBarButtons"], string][] = [["off", "Default"], ["hide", "Hidden"], ["serverlist", "Server list"], ["titlebar", "Title bar"]];
const topBarTitle: [MochaCordSettings["topBarTitle"], string][] = [["off", "Default"], ["hide", "Hidden"], ["left", "Left"]];

function Segmented<T extends string>({ value, options, onChange, label }: { value: T; options: [T, string][]; onChange(value: T): void; label: string; }) {
    return (
        <div className={cl("segmented")} role="radiogroup" aria-label={label}>
            {options.map(([v, text]) => (
                <button key={v} type="button" role="radio" aria-checked={value === v} className={cl("segment", value === v && "segment-on")} onClick={() => onChange(v)}>
                    {text}
                </button>
            ))}
        </div>
    );
}

function ColorRow({ setting, value, fallback, onChange }: { setting: typeof mochaColors[number][0]; value: string; fallback: string; onChange(value: string): void; }) {
    const [title, description] = colorLabels[setting];
    const [draft, setDraft] = useState(value);
    const timer = useRef<number | undefined>(undefined);
    const valid = isHexColor(draft);

    useEffect(() => setDraft(value), [value]);
    useEffect(() => () => clearTimeout(timer.current), []);

    // The colour picker fires on every drag step, so wait until it rests before saving
    const commit = (next: string, delay = 0) => {
        setDraft(next);
        clearTimeout(timer.current);
        if (!next || isHexColor(next)) timer.current = window.setTimeout(() => onChange(next), delay);
    };

    return (
        <HaloRow title={title} description={description}>
            <input
                type="color"
                className={cl("swatch")}
                aria-label={`${title} colour`}
                value={isHexColor(draft) && draft.length === 7 ? draft : fallback}
                onChange={e => commit(e.currentTarget.value, 250)}
            />
            <input
                className={cl("input", "hex", draft && !valid && "input-bad")}
                placeholder="Theme default"
                spellCheck={false}
                value={draft}
                onChange={e => commit(e.currentTarget.value.trim())}
            />
            <button type="button" className={cl("button")} disabled={!value && !draft} onClick={() => commit("")}>Reset</button>
        </HaloRow>
    );
}

const findThemeFile = () => VencordNative.themes.getThemesList()
    .then(list => list.find(t => isMochaCordTheme(t.fileName)) ?? null)
    .catch(() => null);

/** Activation and file actions for the bundled MochaCord.css, shown under the Theme dropdown. */
export function ThemeFileRows() {
    const settings = useSettings(["themeActivationModes.*"]);
    const [file, setFile] = useState<UserThemeHeader | null | undefined>(undefined);
    const reload = () => findThemeFile().then(setFile);

    useEffect(() => { reload(); }, []);

    const activation = settings.themeActivationModes?.[MOCHACORD_FILE] ?? "always";
    const setActivation = (mode: ThemeActivationMode) => {
        const modes = { ...settings.themeActivationModes };
        if (mode === "always") delete modes[MOCHACORD_FILE];
        else modes[MOCHACORD_FILE] = mode;
        settings.themeActivationModes = modes;
    };

    const editCode = async () => {
        const code = await VencordNative.themes.getThemeData(MOCHACORD_FILE).catch(() => undefined);
        if (code == null) return showToast({ text: "Could not open the theme file", variant: "critical" });
        openModal(modalProps => (
            <CodeViewerModal
                modalProps={modalProps}
                title="MochaCord - Code"
                code={code}
                editable
                onSave={async next => {
                    await VencordNative.themes.uploadTheme(MOCHACORD_FILE, next);
                    reload();
                }}
            />
        ));
    };

    const refresh = () => {
        reapplyThemes();
        reload();
        showToast({ text: "Theme reloaded", variant: "success" });
    };

    const remove = async () => {
        await VencordNative.themes.deleteTheme(MOCHACORD_FILE).catch(() => { });
        reload();
        showToast({ text: "Theme file deleted. HaloCord downloads a fresh copy on the next start." });
    };

    return (
        <>
            <HaloRow title="Theme activation" description="Apply the theme always, or only with Discord's light or dark mode.">
                <Segmented label="Theme activation" value={activation} options={activationOptions} onChange={setActivation} />
            </HaloRow>
            {file === null ? (
                <p className={cl("empty")}>The theme file isn't downloaded yet. HaloCord fetches it by itself.</p>
            ) : file && (
                <div className={cl("actions")}>
                    {file.version && <HaloPill tone="muted">{file.fileName} v{file.version}</HaloPill>}
                    <button type="button" className={cl("button")} onClick={editCode}>Edit code</button>
                    {file.website && <button type="button" className={cl("button")} onClick={() => window.open(file.website, "_blank")}>Open website</button>}
                    <button type="button" className={cl("button")} onClick={refresh}>Refresh</button>
                    <button type="button" className={cl("button", "button-danger")} onClick={remove}>Delete</button>
                </div>
            )}
        </>
    );
}

function Group({ title }: { title: string; }) {
    return <h4 className={cl("group")}>{title}</h4>;
}

/** Every MochaCord.css option, shown in HaloCord look while a theme is on. */
export function ThemeOptionRows() {
    const settings = useSettings(["mochacord.*", "haloThemeVariant"]);
    const mc = settings.mochacord;
    const set = <K extends keyof MochaCordSettings>(key: K, value: MochaCordSettings[K]) => { mc[key] = value; };

    // In the HaloCord look the accent and hover border follow the HaloCord accent until the user picks one.
    const hcAccent = settings.haloThemeVariant === "halocord" ? getComputedStyle(document.documentElement).getPropertyValue("--hc-accent").trim() : "";
    const fallbackFor = (key: typeof mochaColors[number][0]) =>
        (key === "accent" || key === "hoverColor") && isHexColor(hcAccent) && hcAccent.length === 7 ? hcAccent : colorLabels[key][2];

    const resetAll = () => {
        for (const [key] of mochaColors) set(key, "");
        set("typing", "left");
        set("typingDots", false);
        set("hoverColors", true);
        for (const [key] of [...features, ...locations]) set(key, key !== "animations");
        set("topBarButtons", "off");
        set("topBarTitle", "off");
        showToast({ text: "Theme options reset", variant: "success" });
    };

    return (
        <>
            <Group title="Typing indicator" />
            <HaloRow title="Placement" description="Where the line that says who is typing sits above the message box.">
                <Segmented label="Typing indicator placement" value={mc.typing} options={[["left", "Left"], ["center", "Center"]]} onChange={v => set("typing", v)} />
            </HaloRow>
            <HaloSwitchRow title="Typing dots" description="Show the bouncing dots next to the typing text." value={mc.typingDots} onChange={v => set("typingDots", v)} />

            <Group title="Colours" />
            {mochaColors.map(([key]) => <ColorRow key={key} setting={key} value={mc[key]} fallback={fallbackFor(key)} onChange={v => set(key, v)} />)}
            <HaloSwitchRow title="Hover colours" description="Light up panel borders when the mouse is over them." value={mc.hoverColors} onChange={v => set("hoverColors", v)} />

            <Group title="Features" />
            {features.map(([key, title, description]) => <HaloSwitchRow key={key} title={title} description={description} value={mc[key]} onChange={v => set(key, v)} />)}

            <Group title="Layout" />
            {locations.map(([key, title, description]) => <HaloSwitchRow key={key} title={title} description={description} value={mc[key]} onChange={v => set(key, v)} />)}
            <HaloRow title="Top bar buttons" description="Where the inbox and help buttons from the top bar go.">
                <Segmented label="Top bar buttons" value={mc.topBarButtons} options={topBarButtons} onChange={v => set("topBarButtons", v)} />
            </HaloRow>
            <HaloRow title="Top bar title" description="Where the server and channel name sits in the top bar.">
                <Segmented label="Top bar title" value={mc.topBarTitle} options={topBarTitle} onChange={v => set("topBarTitle", v)} />
            </HaloRow>

            <div className={cl("actions")}>
                <button type="button" className={cl("button")} onClick={resetAll}>Reset theme options</button>
            </div>
        </>
    );
}
