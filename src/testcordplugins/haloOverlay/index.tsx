/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { definePluginSettings } from "@api/Settings";
import { Button } from "@components/Button";
import { FormSwitch } from "@components/FormSwitch";
import { Heading } from "@components/Heading";
import { GameControllerIcon } from "@components/Icons";
import { Paragraph } from "@components/Paragraph";
import SettingsPlugin from "@plugins/_core/settings";
import { TestcordDevs } from "@utils/constants";
import { Margins } from "@utils/margins";
import { removeFromArray } from "@utils/misc";
import definePlugin, { OptionType } from "@utils/types";
import { findByCodeLazy, findStoreLazy } from "@webpack";
import { ChannelStore, FluxDispatcher, GuildMemberStore, GuildStore, MediaEngineStore, React, RelationshipStore, SelectedChannelStore, Select, Slider, UserStore, useState, VoiceStateStore } from "@webpack/common";

// Main-process bridge from desktop/shell/hc-overlay-main.js (missing outside the HaloCord shell).
interface OverlayBridge {
    setConfig(c: object): Promise<{ keybind: boolean; }>;
    voice(v: { members: Member[]; } | null): void;
    notify(n: { title: string; body: string; icon: string; }): void;
}
interface Member { id: string; name: string; avatar: string; speaking: boolean; mute: boolean; deaf: boolean; }

const bridge = () => (window as any).HaloCordOverlay as OverlayBridge | undefined;
const SpeakingStore = findStoreLazy("SpeakingStore");
// Discord's own "would this message notify" check (mutes, DND, mention settings, suppressed pings).
const discordWouldNotify = findByCodeLazy(".SUPPRESS_NOTIFICATIONS))return!1");

const DEFAULT_KEY = "Shift+`";
const PAGE_KEY = "halocord_overlay";

const settings = definePluginSettings({
    // Not "enabled": that key is the plugin's own on/off flag, so the overlay was always on (2026-11-01).
    overlayOn: { type: OptionType.BOOLEAN, description: "Enable in-game overlay", default: false, onChange: sync },
    keybind: { type: OptionType.STRING, description: "Toggle overlay lock", default: DEFAULT_KEY },
    showOn: {
        type: OptionType.SELECT, description: "Show the overlay over", onChange: sync, options: [
            { label: "Fullscreen and borderless apps", value: "fullscreen", default: true },
            { label: "Any app except HaloCord", value: "always" },
        ]
    },
    avatarSize: {
        type: OptionType.SELECT, description: "Avatar size", onChange: sync, options: [
            { label: "Large avatars", value: "large", default: true },
            { label: "Small avatars", value: "small" },
        ]
    },
    displayNames: {
        type: OptionType.SELECT, description: "Display names", onChange: sync, options: [
            { label: "Always", value: "always", default: true },
            { label: "Only while speaking", value: "speaking" },
            { label: "Never", value: "never" },
        ]
    },
    displayUsers: {
        type: OptionType.SELECT, description: "Display users", onChange: sync, options: [
            { label: "Always", value: "always", default: true },
            { label: "Only while speaking", value: "speaking" },
        ]
    },
    notifPos: {
        type: OptionType.SELECT, description: "Notification position", onChange: sync, options: [
            { label: "Top left", value: "topLeft" },
            { label: "Top right", value: "topRight" },
            { label: "Bottom left", value: "bottomLeft" },
            { label: "Bottom right", value: "bottomRight", default: true },
            { label: "Disabled", value: "disabled" },
        ]
    },
    textNotifs: { type: OptionType.BOOLEAN, description: "Show text chat notifications", default: true, onChange: sync },
    showContent: { type: OptionType.BOOLEAN, description: "Show message text in notifications", default: true },
    opacity: { type: OptionType.SLIDER, description: "Overlay opacity", markers: [10, 25, 50, 75, 100], default: 100, stickToMarkers: false, onChange: sync },
});

let feeding = false, timer: ReturnType<typeof setTimeout> | undefined, lastVoice = "";

function avatarUrl(id: string, hash?: string | null) {
    if (hash) return `https://cdn.discordapp.com/avatars/${id}/${hash}.webp?size=64`;
    return `https://cdn.discordapp.com/embed/avatars/${Number((BigInt(id) >> 22n) % 6n)}.png`;
}

function nameOf(id: string, guildId?: string | null, fallback?: { global_name?: string | null; username?: string; }) {
    const u = UserStore.getUser(id);
    return (guildId && GuildMemberStore.getNick(guildId, id)) || RelationshipStore.getNickname(id)
        || u?.globalName || fallback?.global_name || u?.username || fallback?.username || "Unknown";
}

function snapshot() {
    const chId = SelectedChannelStore.getVoiceChannelId();
    if (!chId) return null;
    const guildId = ChannelStore.getChannel(chId)?.guild_id;
    const me = UserStore.getCurrentUser()?.id;
    const members: Member[] = Object.values(VoiceStateStore.getVoiceStatesForChannel(chId) ?? {}).map((s: any) => {
        const self = s.userId === me;
        return {
            id: s.userId,
            name: nameOf(s.userId, guildId),
            avatar: avatarUrl(s.userId, UserStore.getUser(s.userId)?.avatar),
            speaking: !!SpeakingStore.isSpeaking(s.userId),
            mute: !!(s.mute || s.suppress || (self ? MediaEngineStore.isSelfMute() : s.selfMute)),
            deaf: !!(s.deaf || (self ? MediaEngineStore.isSelfDeaf() : s.selfDeaf)),
        };
    });
    members.sort((a, b) => a.name.localeCompare(b.name));
    return { members };
}

// Store changes come in bursts (every SPEAKING flip); send at most every 50 ms and only on change.
function queueVoice() {
    timer ??= setTimeout(() => {
        timer = undefined;
        const v = snapshot(), json = JSON.stringify(v);
        if (json === lastVoice) return;
        lastVoice = json;
        bridge()?.voice(v);
    }, 50);
}

function readable(message: any) {
    let text = String(message.content ?? "")
        .replace(/<@!?(\d+)>/g, (_, id) => "@" + nameOf(id))
        .replace(/<@&\d+>/g, "@role")
        .replace(/<#(\d+)>/g, (_, id) => "#" + (ChannelStore.getChannel(id)?.name ?? "channel"))
        .replace(/<a?:(\w+):\d+>/g, ":$1:")
        .replace(/\s+/g, " ").trim();
    if (!text && message.attachments?.length) text = "Sent an attachment";
    if (!text && message.sticker_items?.length) text = "Sent a sticker";
    if (!text && message.embeds?.length) text = "Sent an embed";
    return text.slice(0, 200) || "New message";
}

function onMessage({ message, optimistic }: { message: any; optimistic?: boolean; }) {
    const s = settings.store;
    if (optimistic || !s.textNotifs || s.notifPos === "disabled" || !message?.author) return;
    // HaloCord is in front, so the message is on screen already.
    if (document.hasFocus()) return;
    if (message.author.id === UserStore.getCurrentUser()?.id) return;
    try {
        if (!discordWouldNotify(message, message.channel_id)) return;
    } catch {
        return;
    }
    const ch = ChannelStore.getChannel(message.channel_id);
    let title = nameOf(message.author.id, ch?.guild_id, message.author);
    if (ch?.guild_id) title += ` (#${ch.name}, ${GuildStore.getGuild(ch.guild_id)?.name ?? "server"})`;
    else if (ch?.isGroupDM?.()) title += ` (${ch.name || "Group DM"})`;
    bridge()?.notify({ title, body: s.showContent ? readable(message) : "New message", icon: avatarUrl(message.author.id, message.author.avatar) });
}

function feed(on: boolean) {
    if (on === feeding) return;
    feeding = on;
    const stores = [VoiceStateStore, SpeakingStore, SelectedChannelStore, MediaEngineStore] as any[];
    if (on) {
        stores.forEach(st => st.addChangeListener(queueVoice));
        FluxDispatcher.subscribe("MESSAGE_CREATE", onMessage);
        lastVoice = "";
        queueVoice();
    } else {
        stores.forEach(st => st.removeChangeListener(queueVoice));
        FluxDispatcher.unsubscribe("MESSAGE_CREATE", onMessage);
        clearTimeout(timer);
        timer = undefined;
    }
}

function sync() {
    const s = settings.store, api = bridge();
    feed(!!api && s.overlayOn);
    return api?.setConfig({
        enabled: s.overlayOn, keybind: s.keybind || DEFAULT_KEY, showOn: s.showOn, avatarSize: s.avatarSize,
        displayNames: s.displayNames, displayUsers: s.displayUsers, notifPos: s.notifPos, textNotifs: s.textNotifs, opacity: s.opacity,
    });
}

// KeyboardEvent.code -> Electron accelerator key name.
function accelKey(code: string) {
    const named: Record<string, string> = {
        Backquote: "`", Minus: "-", Equal: "=", BracketLeft: "[", BracketRight: "]", Backslash: "\\", Semicolon: ";", Quote: "'",
        Comma: ",", Period: ".", Slash: "/", Space: "Space", Tab: "Tab", Enter: "Enter", Backspace: "Backspace", Delete: "Delete",
        Insert: "Insert", Home: "Home", End: "End", PageUp: "PageUp", PageDown: "PageDown",
        ArrowUp: "Up", ArrowDown: "Down", ArrowLeft: "Left", ArrowRight: "Right",
    };
    if (named[code]) return named[code];
    let m = /^(?:Key|Digit)([A-Z0-9])$/.exec(code);
    if (m) return m[1];
    if ((m = /^Numpad(\d)$/.exec(code))) return "num" + m[1];
    if (/^F\d{1,2}$/.test(code)) return code;
    return null;
}

function KeybindRecorder() {
    const { keybind } = settings.use(["keybind"]);
    const [recording, setRecording] = useState(false);
    const [failed, setFailed] = useState(false);

    function save(v: string) {
        settings.store.keybind = v;
        Promise.resolve(sync()).then(r => setFailed(r?.keybind === false));
    }

    return (
        <div className={Margins.bottom20}>
            <Heading tag="h5" className={Margins.bottom8}>Toggle overlay lock</Heading>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button
                    type="button"
                    className="vc-halo-overlay-keybind"
                    style={{
                        minWidth: 180, padding: "8px 12px", borderRadius: 8, textAlign: "left", cursor: "pointer", font: "inherit",
                        color: "var(--text-default)", background: "var(--input-background, var(--background-secondary))",
                        border: `1px solid ${recording ? "var(--brand-500)" : "var(--border-subtle, transparent)"}`,
                    }}
                    onClick={() => setRecording(true)}
                    onBlur={() => setRecording(false)}
                    onKeyDown={e => {
                        if (!recording) return;
                        e.preventDefault();
                        e.stopPropagation();
                        if (e.key === "Escape") return setRecording(false);
                        const k = accelKey(e.nativeEvent.code);
                        if (!k) return;
                        const mods = [e.ctrlKey && "Ctrl", e.altKey && "Alt", e.shiftKey && "Shift", e.metaKey && "Super"].filter(Boolean);
                        save([...mods, k].join("+"));
                        setRecording(false);
                    }}
                >
                    {recording ? "Press a key combination..." : keybind || DEFAULT_KEY}
                </button>
                <Button size="small" variant="secondary" onClick={() => save(DEFAULT_KEY)}>Reset</Button>
            </div>
            <Paragraph className={Margins.top8}>
                {failed
                    ? "Another app already uses this shortcut, so HaloCord could not register it. Pick a different one."
                    : "Unlock the overlay to drag the voice widget; lock it again to click through to your game. The shortcut works only while the overlay is on."}
            </Paragraph>
        </div>
    );
}

function Choice({ id, title }: { id: "showOn" | "avatarSize" | "displayNames" | "displayUsers" | "notifPos"; title: string; }) {
    const value = settings.use([id])[id];
    const def = settings.def[id];
    return (
        <div className={Margins.bottom20}>
            <Heading tag="h5" className={Margins.bottom8}>{title}</Heading>
            <Select
                options={def.options as any}
                isSelected={v => v === value}
                select={v => { settings.store[id] = v; }}
                serialize={v => String(v)}
                closeOnSelect
            />
        </div>
    );
}

function GameOverlayPage() {
    const s = settings.use(["overlayOn", "textNotifs", "showContent", "opacity"]);
    if (!bridge()) return <Paragraph>The game overlay needs the HaloCord desktop app.</Paragraph>;
    return (
        <>
            <Paragraph className={Margins.bottom20}>
                HaloCord draws the overlay as a click-through window on top of your game. It shows over games in windowed or
                borderless fullscreen mode, not over exclusive fullscreen; switch those games to borderless.
            </Paragraph>
            <FormSwitch title="Enable in-game overlay" value={s.overlayOn} onChange={v => { settings.store.overlayOn = v; }} />
            <div className={Margins.top20} />
            <KeybindRecorder />
            <Choice id="showOn" title="Show the overlay over" />
            <Heading tag="h3" className={Margins.bottom16}>Voice</Heading>
            <Choice id="avatarSize" title="Avatar size" />
            <Choice id="displayNames" title="Display names" />
            <Choice id="displayUsers" title="Display users" />
            <Heading tag="h3" className={Margins.bottom16}>Notifications</Heading>
            <Choice id="notifPos" title="Notification position" />
            <FormSwitch
                title="Show text chat notifications"
                description="Messages that Discord would notify you about, such as DMs and mentions."
                value={s.textNotifs}
                onChange={v => { settings.store.textNotifs = v; }}
            />
            <FormSwitch
                title="Show message text"
                description="Off shows only who sent the message."
                value={s.showContent}
                onChange={v => { settings.store.showContent = v; }}
            />
            <Heading tag="h5" className={Margins.top20}>Overlay opacity</Heading>
            <Slider
                markers={[10, 25, 50, 75, 100]}
                minValue={10}
                maxValue={100}
                initialValue={s.opacity}
                stickToMarkers={false}
                onValueRender={(v: number) => `${Math.round(v)}%`}
                onMarkerRender={(v: number) => `${v}%`}
                onValueChange={(v: number) => { settings.store.opacity = Math.round(v); }}
            />
        </>
    );
}

export default definePlugin({
    name: "HaloOverlay",
    description: "In-game overlay: voice channel members and message notifications over windowed and borderless games. Settings live in Games & Apps > Game Overlay.",
    authors: [TestcordDevs.DavidHiFi],
    required: true,
    hidden: true,
    dependencies: ["Settings"],
    settings,

    start() {
        SettingsPlugin.sectionEntries.push({
            section: "games_and_apps_section",
            after: "overlay_sidebar_item",
            entry: { key: PAGE_KEY, title: "Game Overlay", Component: GameOverlayPage, Icon: GameControllerIcon },
        });
        sync();
    },

    stop() {
        removeFromArray(SettingsPlugin.sectionEntries, e => e.entry.key === PAGE_KEY);
        feed(false);
        bridge()?.setConfig({ enabled: false });
    },
});
