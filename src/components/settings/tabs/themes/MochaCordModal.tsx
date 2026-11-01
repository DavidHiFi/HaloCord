/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import "./HaloThemes.css";

import { isHexColor, mochaColors } from "@api/HaloAppearance";
import { type MochaCordSettings, type ThemeActivationMode, useSettings } from "@api/Settings";
import ErrorBoundary from "@components/ErrorBoundary";
import { HaloPill, HaloRow, HaloSection, HaloSwitchRow } from "@components/HaloUI";
import { UserThemeHeader } from "@main/themes";
import { classNameFactory } from "@utils/css";
import { openInviteModal } from "@utils/discord";
import { ModalRoot, ModalSize, openModal, type RenderModalProps } from "@utils/modal";
import { showToast, useEffect, useRef, useState } from "@webpack/common";

const cl = classNameFactory("hc-mc-");

export interface ThemeWindowActions {
    onChange(enabled: boolean): void;
    onActivationModeChange?(mode: ThemeActivationMode): void;
    onPin?(): void;
    onViewCode?(): void;
    onRefresh?(): void;
    onDelete?(): void;
    onOpenFolder?(): void;
    onCopyUrl?(): void;
    onDownload?(): void;
}

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

function ColorRow({ setting, value, onChange }: { setting: typeof mochaColors[number][0]; value: string; onChange(value: string): void; }) {
    const [title, description, fallback] = colorLabels[setting];
    const [draft, setDraft] = useState(value);
    const timer = useRef<number>();
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

interface WindowProps {
    modalProps: RenderModalProps;
    theme: UserThemeHeader;
    link?: string;
    actions: ThemeWindowActions;
}

const MochaCordWindow = ErrorBoundary.wrap(function MochaCordWindow({ modalProps, theme, link, actions }: WindowProps) {
    const settings = useSettings(["mochacord.*", "enabledThemes", "enabledThemeLinks", "pinnedThemes", "themeActivationModes.*"]);
    const mc = settings.mochacord;
    const id = theme.id ?? "mochacord";
    const enabled = link ? settings.enabledThemeLinks.includes(link) : settings.enabledThemes.includes(id) || settings.enabledThemes.includes(theme.fileName);
    const pinned = settings.pinnedThemes.includes(link ?? theme.fileName);
    const activation = settings.themeActivationModes?.[link ?? theme.fileName] ?? settings.themeActivationModes?.[id] ?? "always";
    const set = <K extends keyof MochaCordSettings>(key: K, value: MochaCordSettings[K]) => { mc[key] = value; };

    const resetAll = () => {
        for (const [key] of mochaColors) set(key, "");
        set("typing", "center");
        set("typingDots", false);
        set("hoverColors", true);
        for (const [key] of [...features, ...locations]) set(key, key !== "animations");
        set("topBarButtons", "off");
        set("topBarTitle", "off");
        showToast({ text: "MochaCord options reset", variant: "success" });
    };

    const run = (action: () => void, close?: boolean) => () => {
        action();
        if (close) modalProps.onClose();
    };

    return (
        <ModalRoot {...modalProps} size={ModalSize.LARGE} className={cl("root")}>
            <div className={cl("head")}>
                <h2 className={cl("title")}>{theme.customName || theme.name || "MochaCord"}</h2>
                {theme.version && <HaloPill tone="muted">v{theme.version}</HaloPill>}
                <HaloPill tone={enabled ? "good" : "muted"}>{enabled ? "On" : "Off"}</HaloPill>
                <button className={cl("close")} aria-label="Close" onClick={modalProps.onClose}>✕</button>
            </div>
            <div className={cl("body")}>
                <HaloSection title="Theme">
                    <HaloSwitchRow title="Use MochaCord" description={theme.description} value={enabled} onChange={actions.onChange} />
                    {actions.onActivationModeChange && (
                        <HaloRow title="Theme activation" description="Apply the theme always, or only with Discord's light or dark mode.">
                            <Segmented label="Theme activation" value={activation} options={activationOptions} onChange={actions.onActivationModeChange} />
                        </HaloRow>
                    )}
                    <div className={cl("actions")}>
                        {actions.onPin && <button type="button" className={cl("button")} onClick={actions.onPin}>{pinned ? "Unpin" : "Pin"}</button>}
                        {actions.onViewCode && <button type="button" className={cl("button")} onClick={run(actions.onViewCode)}>{link ? "View code" : "Edit code"}</button>}
                        {theme.website && <button type="button" className={cl("button")} onClick={() => window.open(theme.website, "_blank")}>Open website</button>}
                        {theme.invite && (
                            <button type="button" className={cl("button")} onClick={run(() => openInviteModal(theme.invite!).catch(() => showToast({ text: "Invalid or expired invite" })), true)}>
                                Join Discord
                            </button>
                        )}
                        {actions.onCopyUrl && <button type="button" className={cl("button")} onClick={actions.onCopyUrl}>Copy URL</button>}
                        {actions.onDownload && <button type="button" className={cl("button")} onClick={actions.onDownload}>Download</button>}
                        {actions.onOpenFolder && <button type="button" className={cl("button")} onClick={actions.onOpenFolder}>Open folder</button>}
                        {actions.onRefresh && <button type="button" className={cl("button")} onClick={actions.onRefresh}>Refresh</button>}
                        {actions.onDelete && <button type="button" className={cl("button", "button-danger")} onClick={run(actions.onDelete, true)}>Delete</button>}
                    </div>
                </HaloSection>

                <HaloSection title="Typing indicator">
                    <HaloRow title="Placement" description="Where the line that says who is typing sits above the message box.">
                        <Segmented label="Typing indicator placement" value={mc.typing} options={[["center", "Center"], ["left", "Left"]]} onChange={v => set("typing", v)} />
                    </HaloRow>
                    <HaloSwitchRow title="Typing dots" description="Show the bouncing dots next to the typing text." value={mc.typingDots} onChange={v => set("typingDots", v)} />
                </HaloSection>

                <HaloSection title="Colours">
                    {mochaColors.map(([key]) => <ColorRow key={key} setting={key} value={mc[key]} onChange={v => set(key, v)} />)}
                    <HaloSwitchRow title="Hover colours" description="Light up panel borders when the mouse is over them." value={mc.hoverColors} onChange={v => set("hoverColors", v)} />
                </HaloSection>

                <HaloSection title="Features">
                    {features.map(([key, title, description]) => <HaloSwitchRow key={key} title={title} description={description} value={mc[key]} onChange={v => set(key, v)} />)}
                </HaloSection>

                <HaloSection title="Layout">
                    {locations.map(([key, title, description]) => <HaloSwitchRow key={key} title={title} description={description} value={mc[key]} onChange={v => set(key, v)} />)}
                    <HaloRow title="Top bar buttons" description="Where the inbox and help buttons from the top bar go.">
                        <Segmented label="Top bar buttons" value={mc.topBarButtons} options={topBarButtons} onChange={v => set("topBarButtons", v)} />
                    </HaloRow>
                    <HaloRow title="Top bar title" description="Where the server and channel name sits in the top bar.">
                        <Segmented label="Top bar title" value={mc.topBarTitle} options={topBarTitle} onChange={v => set("topBarTitle", v)} />
                    </HaloRow>
                </HaloSection>
            </div>
            <div className={cl("foot")}>
                <button type="button" className={cl("button")} onClick={resetAll}>Reset options</button>
                <div className={cl("spacer")} />
                <button type="button" className={cl("go")} onClick={modalProps.onClose}>Done</button>
            </div>
        </ModalRoot>
    );
});

export const openMochaCordWindow = (theme: UserThemeHeader, actions: ThemeWindowActions, link?: string) =>
    openModal(props => <MochaCordWindow modalProps={props} theme={theme} link={link} actions={actions} />);
