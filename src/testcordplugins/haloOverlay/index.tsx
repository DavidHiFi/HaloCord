/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import "@components/settings/tabs/themes/HaloThemes.css";
import "./styles.css";

import { definePluginSettings, SettingsStore } from "@api/Settings";
import { HaloPill, HaloRow, HaloSection, HaloSwitch, HaloSwitchRow } from "@components/HaloUI";
import { GameControllerIcon } from "@components/Icons";
import SettingsPlugin from "@plugins/_core/settings";
import { TestcordDevs } from "@utils/constants";
import { classes, removeFromArray } from "@utils/misc";
import definePlugin, { OptionType } from "@utils/types";
import { findByCodeLazy, findByPropsLazy, findStoreLazy } from "@webpack";
import {
    ApplicationStreamingStore, ChannelStore, FluxDispatcher, GuildMemberStore, GuildStore, MediaEngineStore, NavigationRouter, PresenceStore,
    RelationshipStore, SelectedChannelStore, useEffect, useReducer, UserStore, useState, VoiceActions, VoiceStateStore
} from "@webpack/common";

// Main-process bridge from desktop/shell/hc-overlay-main.js (missing outside the HaloCord shell).
interface Game { id: string; name: string; icon: string; on: boolean; seen: number; running: boolean; }
type OverlayEvent =
    | { type: "games"; data: Game[]; }
    | { type: "playing"; data: { id: string; name: string; }; }
    | { type: "action"; data: { kind: "mute" | "deaf" | "disconnect" | "open"; channelId: string; }; }
    | { type: "lock"; data: boolean; };
type NoticeKind = "message" | "welcome" | "golive" | "activity" | "nowplaying";
interface OverlayBridge {
    setConfig(c: object): Promise<{ keybind: boolean; }>;
    voice(v: object | null): void;
    notify(n: { kind: NoticeKind; title: string; body: string; icon?: string; channelId?: string; }): void;
    activity(list: Friend[]): void;
    games(): Promise<Game[]>;
    setGame(id: string, on: boolean): Promise<boolean>;
    reset(): Promise<boolean>;
    onEvent(cb: (type: OverlayEvent["type"], data: unknown) => void): boolean;
}
interface Member { id: string; name: string; avatar: string; speaking: boolean; mute: boolean; deaf: boolean; }
interface Friend { id: string; name: string; avatar: string; game: string; same: boolean; }

const bridge = () => window.HaloCordOverlay as OverlayBridge | undefined;
const SpeakingStore = findStoreLazy("SpeakingStore");
const StreamerModeStore = findStoreLazy("StreamerModeStore");
const ChannelActions = findByPropsLazy("selectVoiceChannel", "disconnect");
// Discord's own "would this message notify" check (mutes, DND, mention settings, suppressed pings).
const discordWouldNotify = findByCodeLazy(".SUPPRESS_NOTIFICATIONS))return!1");

const DEFAULT_KEY = "Shift+`";
const PAGE_KEY = "halocord_overlay";
const ISSUES = "https://github.com/DavidHiFi/HaloCord/issues";

// 2.11 renames: showOn (fullscreen | always) became showOver (games | fullscreen | always). "fullscreen" was the
// old default, so it moves to the new default, games only, like stable; "always" carries over. The notification
// position "disabled" became the Notifications widget switch.
{
    const old = SettingsStore.plain.plugins.HaloOverlay;
    if (old && Object.hasOwn(old, "showOn")) {
        if (old.showOn === "always" && !Object.hasOwn(old, "showOver")) old.showOver = "always";
        delete old.showOn;
        SettingsStore.markAsChanged();
    }
    if (old?.notifPos === "disabled") {
        old.notifPos = "bottomRight";
        old.widgetNotifications = false;
        SettingsStore.markAsChanged();
    }
}

const settings = definePluginSettings({
    // Not "enabled": that key is the plugin's own on/off flag, so the overlay was always on (2026-11-01).
    overlayOn: { type: OptionType.BOOLEAN, description: "Enable Overlay", default: false, onChange: sync },
    keybind: { type: OptionType.STRING, description: "Toggle Overlay Lock", default: DEFAULT_KEY },
    showOver: {
        type: OptionType.SELECT, description: "Show the overlay over", onChange: sync, options: [
            { label: "Detected games", value: "games", default: true },
            { label: "Any fullscreen app", value: "fullscreen" },
            { label: "Any app", value: "always" },
        ]
    },
    clickable: { type: OptionType.BOOLEAN, description: "Enable overlay clickable regions", default: false, onChange: sync },
    widgetVoice: { type: OptionType.BOOLEAN, description: "Voice widget", default: true, onChange: sync },
    widgetQuick: { type: OptionType.BOOLEAN, description: "Quick Actions widget", default: true, onChange: sync },
    widgetNotifications: { type: OptionType.BOOLEAN, description: "Notifications widget", default: true, onChange: sync },
    widgetActivity: { type: OptionType.BOOLEAN, description: "Activity widget", default: true, onChange: sync },
    avatarSize: {
        type: OptionType.SELECT, description: "Avatar Size", onChange: sync, options: [
            { label: "Large", value: "large", default: true },
            { label: "Small", value: "small" },
        ]
    },
    displayNames: {
        type: OptionType.SELECT, description: "Display Names", onChange: sync, options: [
            { label: "Always", value: "always", default: true },
            { label: "Only While Speaking", value: "speaking" },
            { label: "Never", value: "never" },
        ]
    },
    displayUsers: {
        type: OptionType.SELECT, description: "Display Users", onChange: sync, options: [
            { label: "Always", value: "always", default: true },
            { label: "Only While Speaking", value: "speaking" },
        ]
    },
    maxUsers: { type: OptionType.SLIDER, description: "Max Users Displayed", markers: [0, 5, 10, 15, 20, 25], default: 8, stickToMarkers: false, onChange: sync },
    textNotifs: { type: OptionType.BOOLEAN, description: "Messages", default: true, onChange: sync },
    showContent: { type: OptionType.BOOLEAN, description: "Show message text", default: true },
    noticeWelcome: { type: OptionType.BOOLEAN, description: "Welcome", default: true, onChange: sync },
    noticeGoLive: { type: OptionType.BOOLEAN, description: "Go Live", default: true, onChange: sync },
    noticeActivity: { type: OptionType.BOOLEAN, description: "Game Activity", default: true, onChange: sync },
    noticeNowPlaying: { type: OptionType.BOOLEAN, description: "Now Playing", default: true, onChange: sync },
    noticeNowPlayingOther: { type: OptionType.BOOLEAN, description: "Now Playing for other games you play", default: false, onChange: sync },
    notifPos: {
        type: OptionType.SELECT, description: "Notification position", onChange: sync, options: [
            { label: "Top left", value: "topLeft" },
            { label: "Top right", value: "topRight" },
            { label: "Bottom left", value: "bottomLeft" },
            { label: "Bottom right", value: "bottomRight", default: true },
        ]
    },
    opacity: { type: OptionType.SLIDER, description: "Overlay opacity", markers: [10, 25, 50, 75, 100], default: 100, stickToMarkers: false, onChange: sync },
});

let feeding = false, timer: ReturnType<typeof setTimeout> | undefined, lastVoice = "", lastActivity = "", accent = "";
let games: Game[] = [], presenceTimer: ReturnType<typeof setTimeout> | undefined, playing = new Map<string, string>(), watching = false;
let accentObserver: MutationObserver | undefined, accentProbe: HTMLSpanElement | undefined;
const gameListeners = new Set<() => void>();

function avatarUrl(id: string, hash?: string | null) {
    if (hash) return `https://cdn.discordapp.com/avatars/${id}/${hash}.webp?size=64`;
    return `https://cdn.discordapp.com/embed/avatars/${Number((BigInt(id) >> 22n) % 6n)}.png`;
}

const gameIcon = (g: Game) => /^[0-9a-f]{32}$/.test(g.icon) ? `https://cdn.discordapp.com/app-icons/${g.id}/${g.icon}.webp?size=64` : "";

function nameOf(id: string, guildId?: string | null, fallback?: { global_name?: string | null; username?: string; }) {
    const u = UserStore.getUser(id);
    return (guildId && GuildMemberStore.getNick(guildId, id)) || RelationshipStore.getNickname(id)
        || u?.globalName || fallback?.global_name || u?.username || fallback?.username || "Unknown";
}

function snapshot() {
    const chId = SelectedChannelStore.getVoiceChannelId();
    if (!chId) return null;
    const ch = ChannelStore.getChannel(chId), guildId = ch?.guild_id;
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
    return { channel: ch?.name || "Voice", self: { mute: MediaEngineStore.isSelfMute(), deaf: MediaEngineStore.isSelfDeaf() }, members };
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
    if (optimistic || !s.textNotifs || !s.widgetNotifications || !message?.author) return;
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
    const hidden = !s.showContent || StreamerModeStore.hidePersonalInformation;
    bridge()?.notify({
        kind: "message", title, body: hidden ? "New message" : readable(message),
        icon: avatarUrl(message.author.id, message.author.avatar), channelId: message.channel_id
    });
}

// Friends who are playing something, from their presence. Same game first.
function friendsPlaying(): Friend[] {
    const now = new Set(games.filter(g => g.running).flatMap(g => [g.id, g.name.toLowerCase()]));
    const out: Friend[] = [];
    for (const id of RelationshipStore.getFriendIDs()) {
        const a = PresenceStore.getActivities(id)?.find((x: { type: number; }) => x.type === 0);
        if (!a?.name) continue;
        const u = UserStore.getUser(id);
        out.push({ id, name: nameOf(id), avatar: avatarUrl(id, u?.avatar), game: String(a.name), same: now.has(a.application_id ?? "") || now.has(String(a.name).toLowerCase()) });
    }
    return out.sort((a, b) => Number(b.same) - Number(a.same) || a.name.localeCompare(b.name)).slice(0, 20);
}

function sendActivity(list: ReturnType<typeof friendsPlaying>) {
    const json = JSON.stringify(list);
    if (json === lastActivity) return;
    lastActivity = json;
    bridge()?.activity(list);
}

// Presence feeds the Activity widget and the Now Playing notices; at most once a second.
function onPresence() {
    presenceTimer ??= setTimeout(() => {
        presenceTimer = undefined;
        const s = settings.store, list = friendsPlaying(), api = bridge();
        // Any friend's presence change lands here, so only send the widget a list that changed.
        if (s.widgetActivity) sendActivity(list);
        const seen = new Set(games.flatMap(g => [g.id, g.name.toLowerCase()]));
        for (const f of list) {
            if (playing.get(f.id) === f.game) continue;
            const other = !f.same && seen.has(f.game.toLowerCase());
            if (f.same ? s.noticeNowPlaying : other && s.noticeNowPlayingOther)
                api?.notify({ kind: "nowplaying", title: f.name, body: `Started playing ${f.game}`, icon: f.avatar });
        }
        playing = new Map(list.map(f => [f.id, f.game]));
    }, 1000);
}

function watchPresence() {
    const s = settings.store;
    const on = feeding && (s.widgetActivity || ((s.noticeNowPlaying || s.noticeNowPlayingOther) && games.some(g => g.running && g.on)));
    if (on === watching) return;
    watching = on;
    if (on) {
        playing = new Map(friendsPlaying().map(f => [f.id, f.game]));
        PresenceStore.addChangeListener(onPresence);
        lastActivity = "";
        if (s.widgetActivity) sendActivity(friendsPlaying());
    } else {
        PresenceStore.removeChangeListener(onPresence);
        clearTimeout(presenceTimer);
        presenceTimer = undefined;
    }
}

function setGames(list: Game[]) {
    games = Array.isArray(list) ? list : [];
    gameListeners.forEach(f => f());
    watchPresence();
}

function onPlaying(game: { id: string; name: string; }) {
    const s = settings.store, api = bridge();
    if (!api) return;
    if (s.noticeWelcome) api.notify({ kind: "welcome", title: "Overlay is on", body: `Press ${s.keybind || DEFAULT_KEY} to unlock the overlay.` });
    const chId = SelectedChannelStore.getVoiceChannelId(), ch = chId ? ChannelStore.getChannel(chId) : null;
    if (s.noticeGoLive && ch?.guild_id && !ApplicationStreamingStore.getCurrentUserActiveStream())
        api.notify({ kind: "golive", title: "Go Live", body: `You can stream ${game.name} to ${ch.name}.` });
    if (s.noticeActivity) {
        const key = game.name.toLowerCase();
        const names = friendsPlaying().filter(f => f.game.toLowerCase() === key).map(f => f.name);
        if (names.length) {
            const who = names.length > 3 ? `${names.slice(0, 2).join(", ")} and ${names.length - 2} more` : names.join(", ").replace(/, ([^,]*)$/, " and $1");
            api.notify({ kind: "activity", title: game.name, body: `${who} ${names.length === 1 ? "is" : "are"} playing too.` });
        }
    }
}

function onAction({ kind, channelId }: { kind: string; channelId: string; }) {
    if (kind === "mute") VoiceActions.toggleSelfMute();
    else if (kind === "deaf") VoiceActions.toggleSelfDeaf();
    else if (kind === "disconnect") ChannelActions.disconnect();
    else if (kind === "open" && channelId) {
        const ch = ChannelStore.getChannel(channelId);
        if (ch) NavigationRouter.transitionTo(`/channels/${ch.guild_id ?? "@me"}/${channelId}`);
    }
}

function onEvent(type: OverlayEvent["type"], data: unknown) {
    if (type === "games") setGames(data as Game[]);
    else if (type === "playing") onPlaying(data as { id: string; name: string; });
    else if (type === "action") onAction(data as { kind: string; channelId: string; });
}

// The theme accent (HaloCord green, MochaCord blue, or Discord's brand colour without HaloCord theming), as #rrggbb.
function readAccent() {
    if (!accentProbe) {
        accentProbe = document.createElement("span");
        accentProbe.style.cssText = "display:none;color:var(--hc-accent)";
        document.body.appendChild(accentProbe);
    }
    const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(getComputedStyle(accentProbe).color);
    return m ? "#" + m.slice(1, 4).map(n => Number(n).toString(16).padStart(2, "0")).join("") : "";
}

function watchAccent(on: boolean) {
    accentObserver?.disconnect();
    accentObserver = undefined;
    if (!on) {
        accentProbe?.remove();
        accentProbe = undefined;
        return;
    }
    accent = readAccent();
    accentObserver = new MutationObserver(() => {
        const a = readAccent();
        if (a === accent) return;
        accent = a;
        sync();
    });
    accentObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-hc-theme", "style"] });
}

function feed(on: boolean) {
    if (on === feeding) return;
    feeding = on;
    const stores = [VoiceStateStore, SpeakingStore, SelectedChannelStore, MediaEngineStore] as any[];
    watchAccent(on);
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
    watchPresence();
}

function sync() {
    const s = settings.store, api = bridge();
    feed(!!api && s.overlayOn);
    watchPresence();
    return api?.setConfig({
        enabled: s.overlayOn, keybind: s.keybind || DEFAULT_KEY, showOn: s.showOver, avatarSize: s.avatarSize,
        displayNames: s.displayNames, displayUsers: s.displayUsers, maxUsers: s.maxUsers, notifPos: s.notifPos,
        opacity: s.opacity, clickable: s.clickable, accent,
        widgets: { voice: s.widgetVoice, quick: s.widgetQuick, notifications: s.widgetNotifications, activity: s.widgetActivity },
        notices: {
            message: s.textNotifs, welcome: s.noticeWelcome, golive: s.noticeGoLive, activity: s.noticeActivity,
            nowplaying: s.noticeNowPlaying || s.noticeNowPlayingOther
        },
    });
}

function useGames() {
    const [, force] = useReducer((n: number) => n + 1, 0);
    useEffect(() => {
        gameListeners.add(force);
        bridge()?.games().then(setGames);
        return () => void gameListeners.delete(force);
    }, []);
    return games;
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

type ChoiceKey = "showOver" | "avatarSize" | "displayNames" | "displayUsers" | "notifPos";

function Segments({ id }: { id: ChoiceKey; }) {
    const value = settings.use([id])[id];
    return (
        <div className="hc-mc-segmented" role="radiogroup">
            {settings.def[id].options.map(o => (
                <button
                    key={o.value}
                    type="button"
                    role="radio"
                    aria-checked={value === o.value}
                    className={classes("hc-mc-segment", value === o.value && "hc-mc-segment-on")}
                    onClick={() => { (settings.store[id] as string) = o.value; }}
                >
                    {o.label}
                </button>
            ))}
        </div>
    );
}

function ChoiceRow({ id, title, description }: { id: ChoiceKey; title: string; description?: string; }) {
    return <HaloRow title={title} description={description}><Segments id={id} /></HaloRow>;
}

function Toggle({ id, title, description }: { id: Exclude<keyof typeof settings.store, ChoiceKey | "keybind" | "maxUsers" | "opacity">; title: string; description?: string; }) {
    const value = settings.use([id])[id];
    return <HaloSwitchRow title={title} description={description} value={!!value} onChange={v => { settings.store[id] = v; }} />;
}

// A row that stable has and this overlay cannot do, with the reason.
function Unavailable({ title, reason }: { title: string; reason: string; }) {
    return <HaloRow title={title} description={reason} disabled><HaloSwitch checked={false} onChange={() => { }} label={title} disabled /></HaloRow>;
}

function Range({ id, title, description, min, max, render }: { id: "maxUsers" | "opacity"; title: string; description?: string; min: number; max: number; render(v: number): string; }) {
    const value = settings.use([id])[id];
    return (
        <HaloRow title={title} description={description}>
            <div className="hc-ov-range">
                <input type="range" min={min} max={max} value={value} aria-label={title} onChange={e => { settings.store[id] = Number(e.currentTarget.value); }} />
                <span>{render(value)}</span>
            </div>
        </HaloRow>
    );
}

function KeybindRow() {
    const { keybind } = settings.use(["keybind"]);
    const [recording, setRecording] = useState(false);
    const [failed, setFailed] = useState(false);

    function save(v: string) {
        settings.store.keybind = v;
        Promise.resolve(sync()).then(r => setFailed(r?.keybind === false));
    }

    return (
        <HaloRow
            title="Toggle Overlay Lock"
            description={failed
                ? "Another app already uses this shortcut, so HaloCord could not register it. Pick a different one."
                : "Unlock the overlay to move widgets and use its buttons; lock it to click through to your game."}
        >
            <button
                type="button"
                className={classes("hc-mc-button", "hc-ov-key", recording && "hc-ov-key-rec")}
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
                {recording ? "Press a key combination" : keybind || DEFAULT_KEY}
            </button>
            <button type="button" className="hc-mc-button" onClick={() => save(DEFAULT_KEY)}>Reset</button>
        </HaloRow>
    );
}

function GameRows() {
    const { overlayOn } = settings.use(["overlayOn"]);
    const list = useGames(), api = bridge();
    const current = list.filter(g => g.running);
    const status = (g: Game) => !overlayOn ? <HaloPill tone="muted">Overlay is disabled for all games.</HaloPill>
        : g.on ? <HaloPill tone="good">Currently running Overlay over the game.</HaloPill>
            : <HaloPill tone="muted">Overlay is disabled for this game.</HaloPill>;
    const icon = (g: Game) => gameIcon(g) ? <img className="hc-ov-game-icon" src={gameIcon(g)} alt="" /> : <span className="hc-ov-game-icon" />;
    return (
        <>
            {current.map(g => (
                <HaloRow key={"now" + g.id} accent title={<span className="hc-ov-game">{icon(g)}Currently Playing: {g.name}</span>} description={status(g)}>
                    <HaloSwitch checked={g.on} label={`Enable Overlay for ${g.name}`} onChange={v => api?.setGame(g.id, v)} />
                </HaloRow>
            ))}
            <div className="hc-ov-sub">Per-game Override</div>
            {list.length
                ? list.map(g => (
                    <HaloRow key={g.id} title={<span className="hc-ov-game">{icon(g)}Enable Overlay for {g.name}</span>} description={g.running ? "Running now" : `Last seen ${new Date(g.seen).toLocaleDateString()}`}>
                        <HaloSwitch checked={g.on} label={`Enable Overlay for ${g.name}`} onChange={v => api?.setGame(g.id, v)} />
                    </HaloRow>
                ))
                : <HaloRow title="No games yet" description={overlayOn ? "Games you play show here once HaloCord sees them running." : "Turn on the overlay and start a game to see it here."} />}
        </>
    );
}

const PREVIEW = [
    { name: "Acetaminophen", speaking: true, mute: false, avatar: 0 },
    { name: "Kovanth", speaking: false, mute: true, avatar: 2 },
    { name: "Scynder", speaking: false, mute: false, avatar: 4 },
];

function VoicePreview() {
    const s = settings.use(["avatarSize", "displayNames", "displayUsers", "maxUsers", "opacity"]);
    const visible = PREVIEW.filter(m => s.displayUsers !== "speaking" || m.speaking);
    const rows = s.maxUsers > 0 ? visible.slice(0, s.maxUsers) : visible, extra = visible.length - rows.length;
    return (
        <div className="hc-ov-preview" aria-hidden>
            <div className={classes("hc-ov-voice", s.avatarSize === "small" && "hc-ov-small")} style={{ opacity: s.opacity / 100 }}>
                {rows.map(m => (
                    <div key={m.name} className={classes("hc-ov-member", m.speaking && "hc-ov-speaking")}>
                        <img src={`https://cdn.discordapp.com/embed/avatars/${m.avatar}.png`} alt="" />
                        {(s.displayNames === "always" || (s.displayNames === "speaking" && m.speaking)) && <span>{m.name}</span>}
                    </div>
                ))}
                {extra > 0 && <div className="hc-ov-more">+{extra} more</div>}
            </div>
            <div className="hc-ov-preview-label">Voice Channel</div>
        </div>
    );
}

function GameOverlayPage() {
    const api = bridge();
    if (!api) return <HaloSection title="Game Overlay"><HaloRow title="The game overlay needs the HaloCord desktop app." /></HaloSection>;
    return (
        <div className="hc-ov-page">
            <HaloSection title="Overview">
                <GameRows />
                <Toggle id="overlayOn" title="Enable Overlay" description="Lighter, faster and more customisable. Requires Borderless display setting." />
                <Unavailable title="Enable Legacy Overlay" reason="Legacy Overlay is not available on this system." />
                <HaloRow title="Report a Problem" description="If Overlay isn’t working as expected, let us know so we can fix it.">
                    <button type="button" className="hc-mc-button" onClick={() => VencordNative.native.openExternal(ISSUES)}>Report</button>
                </HaloRow>
            </HaloSection>
            <HaloSection title="General">
                <KeybindRow />
                <ChoiceRow id="showOver" title="Show the overlay over" description="Detected games uses Discord's list of games; switch a game off above to hide the overlay there." />
                <Toggle id="clickable" title="Enable overlay clickable regions" description="Allows areas of the overlay (i.e. notifications) to be clickable while the overlay is locked." />
                <Unavailable title="Use Compatibility Mode" reason="Not needed here: HaloCord's overlay never takes focus from your game." />
            </HaloSection>
            <HaloSection title="Widgets">
                <div className="hc-ov-sub">Choose what shows up in your overlay.</div>
                <Toggle id="widgetVoice" title="Voice" description="Who’s talking in your call" />
                <Toggle id="widgetQuick" title="Quick Actions" description="Mute, deafen and disconnect" />
                <Toggle id="widgetNotifications" title="Notifications" description="Messages and game notices" />
                <Toggle id="widgetActivity" title="Activity" description="What friends are playing, while the overlay is unlocked" />
                <Unavailable title="Chat" reason="Typing in the overlay would take focus from your game, which this overlay never does." />
                <Unavailable title="Video" reason="Cameras play in the HaloCord window; the overlay cannot show them." />
                <Unavailable title="Streams" reason="Streams play in the HaloCord window; the overlay cannot show them." />
                <HaloRow title="Reset Default Layout" description="Moves every widget back to its starting place.">
                    <button type="button" className="hc-mc-button" onClick={() => api.reset()}>Reset</button>
                </HaloRow>
            </HaloSection>
            <HaloSection title="Voice Widget">
                <VoicePreview />
                <ChoiceRow id="avatarSize" title="Avatar Size" />
                <ChoiceRow id="displayNames" title="Display Names" />
                <ChoiceRow id="displayUsers" title="Display Users" />
                <Range id="maxUsers" title="Max Users Displayed" min={0} max={25} render={v => v === 0 ? "Off" : String(v)} />
            </HaloSection>
            <HaloSection title="Notifications">
                <Toggle id="textNotifs" title="Messages" description="For each text message notification, shows a notice that you can reply to in HaloCord." />
                <Toggle id="showContent" title="Show message text" description="Off shows only who sent the message. Streamer Mode always hides it." />
                <Toggle id="noticeWelcome" title="Welcome" description="Shows a notice every time the overlay opens to let you know that the overlay is now active." />
                <Toggle id="noticeGoLive" title="Go Live" description="Lets you know when you are able to stream a game when the overlay first opens." />
                <Toggle id="noticeActivity" title="Game Activity" description="Shows friends who are currently playing the game you’re currently playing." />
                <Toggle id="noticeNowPlaying" title="Now Playing" description="Notifies you when a friend starts playing the game that you are currently playing." />
                <Toggle id="noticeNowPlayingOther" title="Now Playing for other games you play" description="Shows notifications for friends playing other games from your play history." />
                <ChoiceRow id="notifPos" title="Notification position" />
                <Range id="opacity" title="Overlay opacity" description="How see-through the widgets are while the overlay is locked." min={10} max={100} render={v => `${v}%`} />
            </HaloSection>
        </div>
    );
}

export default definePlugin({
    name: "HaloOverlay",
    description: "In-game overlay: voice, quick actions, friends' activity and notices over windowed and borderless games. Settings live in Games & Apps > Game Overlay.",
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
        bridge()?.onEvent(onEvent);
        sync();
    },

    stop() {
        removeFromArray(SettingsPlugin.sectionEntries, e => e.entry.key === PAGE_KEY);
        feed(false);
        bridge()?.onEvent(() => { });
        bridge()?.setConfig({ enabled: false });
    },
});
