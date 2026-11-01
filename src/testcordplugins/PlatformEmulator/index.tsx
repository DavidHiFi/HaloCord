/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { sendBotMessage } from "@api/Commands/commandHelpers";
import { definePluginSettings } from "@api/Settings";
import { Notice } from "@components/Notice";
import { TestcordDevs } from "@utils/constants";
import definePlugin, { OptionType } from "@utils/types";
import { findByProps } from "@webpack";
import { PresenceStore, SelectedChannelStore, SessionsStore, UserStore, VoiceStateStore } from "@webpack/common";

const infos: Record<string, { os: string; browser: string; }> = {
    windows: { os: "Windows", browser: "Discord Client" },
    linux: { os: "Linux", browser: "Discord Client" },
    macos: { os: "Mac OS X", browser: "Discord Client" },
    android: { os: "Android", browser: "Discord Android" },
    mobile: { os: "iOS", browser: "Discord iOS" },
    xbox: { os: "Xbox", browser: "Discord Embedded" },
    playstation: { os: "PlayStation", browser: "Discord Embedded" },
    vr: { os: "VR", browser: "Discord VR" },
    web: { os: "Web", browser: "Discord Web" },
};

// Desktop OS profiles used for aggressive (deep) IDENTIFY spoofing.
const desktopProfiles: Record<string, { os: string; osVersion: string; userAgent: string; }> = {
    windows: {
        os: "Windows",
        osVersion: "10.0.22631",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    },
    macos: {
        os: "Mac OS X",
        osVersion: "13.6.1",
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_6_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    },
    linux: {
        os: "Linux",
        osVersion: "6.6.0",
        userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
};

// VoiceStateStore platform enum: DESKTOP 0, MOBILE 1, XBOX 2, PLAYSTATION 3, QUEST 4.
const voicePlatforms: Record<string, number> = { android: 1, mobile: 1, xbox: 2, playstation: 3, vr: 4 };
const statusRank: Record<string, number> = { online: 3, dnd: 2, idle: 1 };

let cachedSessions: unknown;
let cachedClientStatus: Record<string, string> = {};

// Discord never fills its own client status for you, so build it from your sessions the way others receive it.
function getOwnClientStatus() {
    const sessions = SessionsStore.getSessions();
    if (sessions === cachedSessions) return cachedClientStatus;

    const result: Record<string, string> = {};
    for (const { clientInfo, status } of Object.values(sessions)) {
        const client = clientInfo?.client;
        if (!client || client === "unknown" || !statusRank[status]) continue;
        if (!result[client] || statusRank[status] > statusRank[result[client]]) result[client] = status;
    }

    cachedSessions = sessions;
    return cachedClientStatus = result;
}

function refreshOwnPlatform() {
    PresenceStore.emitChange();
    VoiceStateStore.emitChange();
}

// Maps the selected platform onto a coherent desktop profile for deep spoofing.
// Non-desktop platforms fall back to Linux since desktop UA strings only make
// sense for desktop operating systems.
function resolveDesktopProfile(platform: string) {
    switch (platform) {
        case "windows":
            return desktopProfiles.windows;
        case "macos":
            return desktopProfiles.macos;
        case "linux":
            return desktopProfiles.linux;
        default:
            return desktopProfiles.linux;
    }
}

const settings = definePluginSettings({
    plateforme: {
        type: OptionType.SELECT,
        description: "The platform to spoof",
        restartNeeded: true,
        default: "windows",
        options: [
            { label: "Windows", value: "windows", default: true },
            { label: "Linux", value: "linux" },
            { label: "macOS", value: "macos" },
            { label: "Android", value: "android" },
            { label: "iOS (iPhone)", value: "mobile" },
            { label: "Xbox", value: "xbox" },
            { label: "PlayStation", value: "playstation" },
            { label: "VR Headset", value: "vr" },
            { label: "Web", value: "web" }
        ],
    },
    aggressiveSpoofing: {
        type: OptionType.BOOLEAN,
        description: "Enable aggressive OS spoofing (injects extra IDENTIFY / client metadata). Choose the depth with the level selector below.",
        restartNeeded: true,
        default: false
    },
    aggressiveLevel: {
        type: OptionType.SELECT,
        description: "How much extra metadata to spoof when aggressive spoofing is enabled",
        restartNeeded: true,
        default: "medium",
        options: [
            { label: "Low (device + locale)", value: "low" },
            { label: "Medium (+ versions + release channel)", value: "medium", default: true },
            { label: "High (+ user agent + client build)", value: "high" }
        ]
    },
    showOwnSpoofed: {
        type: OptionType.BOOLEAN,
        description: "Show your own spoofed platform icons (member list, profiles, voice) the way others see them. Only changes your view.",
        default: false,
        onChange: refreshOwnPlatform
    }
});

export default definePlugin({
    id: "PlatformEmulator",
    name: "PlatformEmulator",
    description: "PlatformEmulator allows you to spoof your Discord platform (Windows, Linux, Android, iOS, etc.), with optional aggressive OS/client metadata spoofing. (dx maintains it, dont ask x2b for support with this)",
    tags: ["Privacy", "Utility"],
    authors: [TestcordDevs.sirphantom89, TestcordDevs.x2b, TestcordDevs.DavidHiFi],
    settings,
    settingsAboutComponent: () => (
        <Notice.Warning>
            Aggressive spoofing modifies IDENTIFY and client metadata. Risk is non-zero and may get you warned or banned.
        </Notice.Warning>
    ),
    patches: [
        {
            find: "_doIdentify(){",
            replacement: [
                {
                    match: /window._ws=null,null!=\i/,
                    replace: "false"
                },
                {
                    match: /(?<="GatewaySocket"\)\}\),properties:)(\i)/,
                    replace: "{...$1,...$self.getData()}"
                },
                {
                    match: /(\[IDENTIFY\].*?let.{0,5}=\{)/,
                    replace: "$1...$self.getIdentifyOverrides(),"
                },
            ]
        },
        {
            find: 'displayName="PresenceStore"',
            replacement: [
                {
                    match: /(?<=getClientStatus\((\i)\)\{)/,
                    replace: "if($self.isOwnSpoofed($1))return $self.getOwnClientStatus();"
                },
                {
                    match: /(?<=(?:isMobileOnline|isVROnline)\((\i)\)\{let \i=)\i\[\1\]/g,
                    replace: "$self.isOwnSpoofed($1)?$self.getOwnClientStatus():$&"
                }
            ]
        },
        {
            find: "}getVoicePlatformForChannel(",
            replacement: {
                match: /(?<=getVoicePlatformForChannel\((\i),(\i)\)\{)/,
                replace: "const vcOwn=$self.getOwnVoicePlatform($1,$2);if(vcOwn!=null)return vcOwn;"
            }
        }
    ],
    flux: {
        SESSIONS_REPLACE() {
            if (settings.store.showOwnSpoofed) PresenceStore.emitChange();
        }
    },
    getOwnClientStatus,
    isOwnSpoofed(userId: string) {
        return settings.store.showOwnSpoofed && userId === UserStore.getCurrentUser()?.id;
    },
    getOwnVoicePlatform(channelId: string, userId: string) {
        if (!this.isOwnSpoofed(userId) || channelId !== SelectedChannelStore.getVoiceChannelId()) return null;
        return voicePlatforms[settings.store.plateforme ?? "windows"] ?? null;
    },
    getData() {
        const selected = settings.store.plateforme ?? "windows";
        const info = infos[selected] ?? infos.windows;

        return {
            os: info.os,
            browser: info.browser
        };
    },
    getIdentifyOverrides() {
        // No-op unless aggressive spoofing is explicitly enabled.
        if (!settings.store.aggressiveSpoofing) return {};

        const platform = settings.store.plateforme ?? "windows";
        const level = settings.store.aggressiveLevel ?? "medium";
        const profile = resolveDesktopProfile(platform);

        // Low: minimal extra fields.
        const overrides: Record<string, any> = {
            properties: {
                os: profile.os,
                browser: "Chrome",
                device: "",
                system_locale: "en-US"
            },
            device: "",
            system_locale: "en-US"
        };

        if (level === "medium" || level === "high") {
            overrides.os_version = profile.osVersion;
            overrides.browser_version = "120.0.0.0";
            overrides.release_channel = "stable";
            overrides.referrer = "";
            overrides.referring_domain = "";
        }

        if (level === "high") {
            overrides.browser = "Chrome";
            overrides.browser_user_agent = profile.userAgent;
            overrides.client_version = "1.0.9000";
            overrides.client_build_number = 999999;
        }

        return overrides;
    },
    commands: [
        {
            name: "verify-platform",
            description: "Verify the spoofed platform by triggering a reconnect and displaying the current spoof.",
            execute: (args, ctx) => {
                const platform = settings.store.plateforme ?? "windows";
                const info = infos[platform] ?? infos.windows;
                const aggressive = settings.store.aggressiveSpoofing
                    ? ` | Aggressive: ${settings.store.aggressiveLevel ?? "medium"}`
                    : "";
                sendBotMessage(ctx.channel.id, {
                    content: `Current spoofed platform: ${info.os} (${info.browser})${aggressive}. Triggering reconnect to send IDENTIFY payload.`,
                    author: {
                        username: "PlatformEmulator"
                    }
                });
                // Trigger reconnect
                const gateway = findByProps("connect", "destroy");
                if (gateway) {
                    gateway.destroy();
                    setTimeout(() => gateway.connect(), 1000);
                }
            }
        }
    ]
});
