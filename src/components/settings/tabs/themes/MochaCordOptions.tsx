/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import "./HaloThemes.css";

import { isHexColor, mochaColors } from "@api/HaloAppearance";
import { type MochaCordSettings, type Settings, type ThemeActivationMode, useSettings } from "@api/Settings";
import { reapplyThemes, THEME_FILES } from "@api/Themes";
import { HaloPill, HaloRow, HaloSwitchRow } from "@components/HaloUI";
import { UserThemeHeader } from "@main/themes";
import { classNameFactory } from "@utils/css";
import { openModal, Select, showToast, useEffect, useRef, useState } from "@webpack/common";

import { CodeViewerModal } from "./CodeViewerModal";

const cl = classNameFactory("hc-mc-");

type Variant = Settings["haloThemeVariant"];
type ColorKey = typeof mochaColors[number][0];

const activationOptions: [ThemeActivationMode, string][] = [["always", "Always on"], ["light", "Light only"], ["dark", "Dark only"]];

const colorLabels: Record<ColorKey, [string, string]> = {
    accent: ["Accent", "Links, buttons and switches."],
    text: ["Text", "Messages, names and headings."],
    textMuted: ["Muted text", "Channels, icons and timestamps."],
    surface: ["Surfaces", "Buttons, cards and inputs."],
    background: ["Background", "Panels, chat and popups."],
    hoverColor: ["Hover border", "The border colour of a panel under the mouse."]
};

// What the colour boxes show while a colour is left empty: the theme's own colour.
const colorDefaults: Record<Variant, Record<ColorKey, string>> = {
    halocord: { accent: "#afe37f", text: "#dbe8df", textMuted: "#7f9187", surface: "#232c27", background: "#151c18", hoverColor: "#afe37f" },
    mochacord: { accent: "#89b4fa", text: "#cdd6f4", textMuted: "#7f849c", surface: "#313244", background: "#1e1e2e", hoverColor: "#89b4fa" },
    custom: { accent: "#5865f2", text: "#dbdee1", textMuted: "#949ba4", surface: "#2b2d31", background: "#313338", hoverColor: "#5865f2" }
};

const customColors: ColorKey[] = ["accent", "text", "textMuted", "surface", "background"];

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

function ColorRow({ setting, value, fallback, onChange }: { setting: ColorKey; value: string; fallback: string; onChange(value: string): void; }) {
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

const fileChoices: { label: string; value: Variant; }[] = [
    { label: "MochaCord", value: "mochacord" },
    { label: "HaloCord", value: "halocord" },
    { label: "Custom", value: "custom" }
];

const findThemeFile = (fileName: string) => VencordNative.themes.getThemesList()
    .then(list => list.find(t => t.fileName.toLowerCase() === fileName.toLowerCase()) ?? null)
    .catch(() => null);

/** Activation of the active theme, and view, edit, reload or delete for any of the theme files. */
export function ThemeFileRows({ variant }: { variant: Variant; }) {
    const settings = useSettings(["themeActivationModes.*"]);
    const [chosen, setChosen] = useState(variant);
    const [file, setFile] = useState<UserThemeHeader | null | undefined>(undefined);
    const fileName = THEME_FILES[chosen];
    const { label } = (fileChoices.find(c => c.value === chosen)!);
    const reload = () => findThemeFile(fileName).then(setFile);

    useEffect(() => setChosen(variant), [variant]);
    useEffect(() => {
        setFile(undefined);
        reload();
    }, [fileName]);

    const activationFile = THEME_FILES[variant];
    const activation = settings.themeActivationModes?.[activationFile] ?? "always";
    const setActivation = (mode: ThemeActivationMode) => {
        const modes = { ...settings.themeActivationModes };
        if (mode === "always") delete modes[activationFile];
        else modes[activationFile] = mode;
        settings.themeActivationModes = modes;
    };

    const editCode = async () => {
        const code = await VencordNative.themes.getThemeData(fileName).catch(() => undefined);
        if (code == null) return showToast({ text: "Could not open the theme file", variant: "critical" });
        openModal(modalProps => (
            <CodeViewerModal
                modalProps={modalProps}
                title={`${label} - Code`}
                code={code}
                editable
                onSave={async next => {
                    await VencordNative.themes.uploadTheme(fileName, next);
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
        await VencordNative.themes.deleteTheme(fileName).catch(() => { });
        reload();
        showToast({ text: chosen === "mochacord" ? "Theme file deleted. HaloCord downloads a fresh copy on the next start." : "Theme file deleted. HaloCord recreates it on the next start." });
    };

    return (
        <>
            <HaloRow title="Theme activation" description="Apply the theme always, or only with Discord's light or dark mode.">
                <Segmented label="Theme activation" value={activation} options={activationOptions} onChange={setActivation} />
            </HaloRow>
            <div className={cl("actions")}>
                <div className={cl("file-select")}>
                    <Select options={fileChoices} closeOnSelect isSelected={v => v === chosen} serialize={String} select={setChosen} />
                </div>
                {file && file.version && <HaloPill tone="muted">{file.fileName} v{file.version}</HaloPill>}
                {file && <button type="button" className={cl("button")} onClick={editCode}>Edit code</button>}
                {file?.website && <button type="button" className={cl("button")} onClick={() => window.open(file.website, "_blank")}>Open website</button>}
                {file && <button type="button" className={cl("button")} onClick={refresh}>Refresh</button>}
                {file && <button type="button" className={cl("button", "button-danger")} onClick={remove}>Delete</button>}
            </div>
            {file === null && <p className={cl("empty")}>The {label} theme file isn't there yet. HaloCord creates it by itself.</p>}
        </>
    );
}

function Group({ title }: { title: string; }) {
    return <h4 className={cl("group")}>{title}</h4>;
}

/** The options of the active theme. HaloCord and MochaCord share one layout and differ only in colours; Custom has colours only. */
export function ThemeOptionRows({ variant }: { variant: Variant; }) {
    const settings = useSettings(["mochacord.*", "halocordTheme.*", "customTheme.*"]);
    const layout = settings.mochacord;
    const palette = variant === "mochacord" ? settings.mochacord : variant === "halocord" ? settings.halocordTheme : settings.customTheme;
    const set = <K extends keyof MochaCordSettings>(key: K, value: MochaCordSettings[K]) => { layout[key] = value; };
    const colours = mochaColors.filter(([key]) => variant !== "custom" || customColors.includes(key));

    const resetAll = () => {
        for (const [key] of colours) palette[key] = "";
        if (variant !== "custom") {
            set("typing", "left");
            set("typingDots", false);
            set("hoverColors", true);
            for (const [key] of [...features, ...locations]) set(key, key !== "animations" && key !== "panelBlur");
            set("topBarButtons", "off");
            set("topBarTitle", "off");
        }
        showToast({ text: "Theme options reset", variant: "success" });
    };

    return (
        <>
            {variant !== "custom" && (
                <>
                    <Group title="Typing indicator" />
                    <HaloRow title="Placement" description="Where the line that says who is typing sits above the message box.">
                        <Segmented label="Typing indicator placement" value={layout.typing} options={[["left", "Left"], ["center", "Center"]]} onChange={v => set("typing", v)} />
                    </HaloRow>
                    <HaloSwitchRow title="Typing dots" description="Show the bouncing dots next to the typing text." value={layout.typingDots} onChange={v => set("typingDots", v)} />
                </>
            )}

            <Group title="Colours" />
            {colours.map(([key]) => <ColorRow key={key} setting={key} value={palette[key]} fallback={colorDefaults[variant][key]} onChange={v => { palette[key] = v; }} />)}

            {variant !== "custom" && (
                <>
                    <HaloSwitchRow title="Hover colours" description="Light up panel borders when the mouse is over them." value={layout.hoverColors} onChange={v => set("hoverColors", v)} />

                    <Group title="Features" />
                    {features.map(([key, title, description]) => <HaloSwitchRow key={key} title={title} description={description} value={layout[key]} onChange={v => set(key, v)} />)}

                    <Group title="Layout" />
                    {locations.map(([key, title, description]) => <HaloSwitchRow key={key} title={title} description={description} value={layout[key]} onChange={v => set(key, v)} />)}
                    <HaloRow title="Top bar buttons" description="Where the inbox and help buttons from the top bar go.">
                        <Segmented label="Top bar buttons" value={layout.topBarButtons} options={topBarButtons} onChange={v => set("topBarButtons", v)} />
                    </HaloRow>
                    <HaloRow title="Top bar title" description="Where the server and channel name sits in the top bar.">
                        <Segmented label="Top bar title" value={layout.topBarTitle} options={topBarTitle} onChange={v => set("topBarTitle", v)} />
                    </HaloRow>
                </>
            )}

            <div className={cl("actions")}>
                <button type="button" className={cl("button")} onClick={resetAll}>Reset theme options</button>
            </div>
        </>
    );
}
