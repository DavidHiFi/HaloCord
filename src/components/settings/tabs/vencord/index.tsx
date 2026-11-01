/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import "./VencordTab.css";

import { openNotificationLogModal } from "@api/Notifications/notificationLog";
import { useSettings } from "@api/Settings";
import { Button } from "@components/Button";
import { Divider } from "@components/Divider";
import { FormSwitch } from "@components/FormSwitch";
import { Heading } from "@components/Heading";
import { FolderIcon, GithubIcon, LogIcon, PaintbrushIcon, RestartIcon } from "@components/Icons";
import { Notice } from "@components/Notice";
import { Paragraph } from "@components/Paragraph";
import { openContributorModal, openPluginModal, SettingsTab, wrapTab } from "@components/settings";
import { QuickAction, QuickActionCard } from "@components/settings/QuickAction";
import { SpecialCard } from "@components/settings/SpecialCard";
import BadgeAPI from "@plugins/_api/badges";
import SettingsPlugin from "@plugins/_core/settings";
import { DONOR_ROLE_ID, EQUICORD_GUILD_ID, IS_WINDOWS, VC_DONOR_ROLE_ID, VC_GUILD_ID } from "@utils/constants";
import { classNameFactory } from "@utils/css";
import { Margins } from "@utils/margins";
import { isAnyPluginDev } from "@utils/misc";
import { relaunch } from "@utils/native";
import { promptToRestart } from "@utils/promptToRestart";
import { GuildMemberStore, React, UserStore } from "@webpack/common";

import { DonateButtonComponent } from "./DonateButton";
import { MacOSVibrancySettings } from "./MacVibrancySettings";
import { NotificationSection } from "./NotificationSettings";
import { syncShellWindowPrefs, WindowsMaterialSettings } from "./WindowsMaterialSettings";

const HALOCORD_IMAGE = "data:image/webp;base64,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";

const VENNIE_DONATOR_IMAGE = "https://cdn.discordapp.com/emojis/1238120638020063377.png";
const COZY_CONTRIB_IMAGE = "https://cdn.discordapp.com/emojis/1026533070955872337.png";

const DONOR_BACKGROUND_IMAGE = "https://media.discordapp.net/stickers/1311070116305436712.png?size=2048";
const CONTRIB_BACKGROUND_IMAGE = "https://media.discordapp.net/stickers/1311070166481895484.png?size=2048";

const cl = classNameFactory("vc-vencord-tab-");

// The HaloCord shell owns its window and exposes its own window and app controls.
const HAS_SHELL = !!window.HaloCordNative;

type KeysOfType<Object, Type> = {
    [K in keyof Object]: Object[K] extends Type ? K : never;
}[keyof Object];

function Switches() {
    const settings = useSettings(["useQuickCss", "enableReactDevtools", "mainWindowFrameless", "frameless", "nativeTitleBar", "transparent", "winCtrlQ", "disableMinSize", "useTestcordIcon"]);

    const Switches = [
        {
            key: "useTestcordIcon",
            title: "Use HaloCord Icon",
            description: "Replace the standard Discord logo icon with the custom HaloCord icon.",
        },
        {
            key: "useQuickCss",
            title: "Enable Custom CSS",
            description: "Apply your configured QuickCSS"
        },
        !HAS_SHELL && (!IS_WEB && !IS_DISCORD_DESKTOP || !IS_WINDOWS) && {
            key: "mainWindowFrameless",
            title: "Disable the Main Window Frame",
            description: "Remove the native window frame for a cleaner look. You can still move the window by dragging the title bar area.",
            restartRequired: true,
        },
        !IS_WEB && !HAS_SHELL && (!IS_DISCORD_DESKTOP || !IS_WINDOWS
            ? {
                key: "frameless",
                title: "Disable All Window Frames",
                description: "Remove the native window frame for a cleaner look. You can still move the window by dragging the title bar area.",
                restartRequired: true,
            }
            : {
                key: "nativeTitleBar",
                title: "Use Windows' native title bar instead of Discord's custom one",
                description: "Replace Discord's custom title bar with the standard Windows title bar. This may improve compatibility with some window management tools.",
                restartRequired: true,
            }
        ),
        (!IS_WEB || HAS_SHELL) && {
            key: "transparent",
            title: "Enable Window Transparency",
            description: "Make the HaloCord window transparent. A theme that supports transparency is required or this will do nothing.",
            restartRequired: true,
            warning: IS_WINDOWS
                ? "This will stop the window from being resizable and prevents you from snapping the window to screen edges."
                : "This will stop the window from being resizable.",
        },
        (IS_DISCORD_DESKTOP || HAS_SHELL) && {
            key: "disableMinSize",
            title: "Disable Minimum Window Size",
            description: "Allows you to resize the window to any size, even smaller than the usual minimum size",
            restartRequired: true
        },
        (!IS_WEB || HAS_SHELL) && IS_WINDOWS && {
            key: "winCtrlQ",
            title: "Register Ctrl+Q as shortcut to close HaloCord",
            description: "Add Ctrl+Q as a keyboard shortcut to close HaloCord. This provides an alternative to Alt+F4 for quickly closing the application.",
            restartRequired: true,
        },
        !IS_WEB && {
            key: "enableReactDevtools",
            title: "Enable React Developer Tools",
            description: "Mainly useful for plugin developers. Ignore this if you don't know what it is",
            restartRequired: true
        },
    ] satisfies Array<false | {
        key: KeysOfType<typeof settings, boolean>;
        title: string;
        description?: string;
        restartRequired?: boolean;
        warning?: string;
    }>;

    return Switches.map(setting => {
        if (!setting) {
            return null;
        }

        const { key, title, description, restartRequired, warning } = setting;

        return (
            <FormSwitch
                key={key}
                title={title}
                description={
                    warning ? (
                        <>
                            {description}
                            <Notice.Warning className={Margins.top8} style={{ width: "100%" }}>
                                {warning}
                            </Notice.Warning>
                        </>
                    ) : (
                        description
                    )
                }
                value={settings[key]}
                hideBorder
                onChange={v => {
                    settings[key] = v;
                    syncShellWindowPrefs();

                    if (restartRequired) {
                        promptToRestart("relaunch");
                    }
                }}
            />
        );
    });
}

function EquicordSettings() {

    const user = UserStore?.getCurrentUser();

    return (
        <SettingsTab>
            {(isEquicordDonor(user?.id) || isVencordDonor(user?.id)) ? (
                <SpecialCard
                    title="Donations"
                    subtitle="Thank you for donating!"
                    description={
                        isEquicordDonor(user?.id) && isVencordDonor(user?.id)
                            ? "All Vencord users can see your Vencord donor badge, and Equicord users can see your Equicord donor badge. To change your Vencord donor badge, contact @vending.machine. For your Equicord donor badge, make a ticket in Equicord's server."
                            : isVencordDonor(user?.id)
                                ? "All Vencord users can see your badge! You can manage your perks by messaging @vending.machine."
                                : "All Equicord users can see your badge! You can manage your perks by making a ticket in Equicord's server."
                    }
                    cardImage={VENNIE_DONATOR_IMAGE}
                    backgroundImage={DONOR_BACKGROUND_IMAGE}
                    backgroundColor="#ED87A9"
                >
                    <DonateButtonComponent donated={true} />
                </SpecialCard>
            ) : (
                <SpecialCard
                    title="Support the Project"
                    description="HaloCord is built and kept running by DavidHiFi. If it helps you, a Ko-fi tip keeps it going."
                    cardImage={HALOCORD_IMAGE}
                    backgroundImage={DONOR_BACKGROUND_IMAGE}
                    backgroundColor="#c3a3ce"
                >
                    <DonateButtonComponent />
                </SpecialCard>
            )}
            <SpecialCard
                title="Contributions"
                subtitle={isAnyPluginDev(user?.id) ? "Thank you for contributing!" : undefined}
                description="HaloCord takes pull requests on GitHub. Read the contributing guide, then open an issue or a pull request."
                cardImage={COZY_CONTRIB_IMAGE}
                backgroundImage={CONTRIB_BACKGROUND_IMAGE}
                backgroundColor="#EDCC87"
            >
                <Button
                    variant="none"
                    size="medium"
                    type="button"
                    onClick={() => VencordNative.native.openExternal("https://github.com/DavidHiFi/HaloCord/blob/main/CONTRIBUTING.md")}
                    className="vc-contrib-button"
                >
                    <GithubIcon aria-hidden fill={"#000000"} className={"vc-contrib-github"} />
                    Contribute on GitHub
                </Button>
                {isAnyPluginDev(user?.id) && (
                    <Button
                        variant="none"
                        size="medium"
                        type="button"
                        onClick={() => openContributorModal(user)}
                        className="vc-contrib-button"
                    >
                        See what you've contributed to
                    </Button>
                )}
            </SpecialCard>

            <Heading className={Margins.top16}>Quick Actions</Heading>
            <Paragraph className={Margins.bottom16}>
                Common actions you might want to perform. These shortcuts give you quick access to frequently used features without navigating through menus.
            </Paragraph>

            <QuickActionCard>
                <QuickAction
                    Icon={LogIcon}
                    text="Notification Log"
                    action={openNotificationLogModal}
                />
                <QuickAction
                    Icon={PaintbrushIcon}
                    text="Edit QuickCSS"
                    action={() => VencordNative.quickCss.openEditor()}
                />
                {(!IS_WEB || HAS_SHELL) && (
                    <QuickAction
                        Icon={RestartIcon}
                        text="Relaunch HaloCord"
                        action={relaunch}
                    />
                )}
                {(!IS_WEB || HAS_SHELL) && (
                    <QuickAction
                        Icon={FolderIcon}
                        text="Open Settings Folder"
                        action={() => VencordNative.settings.openFolder()}
                    />
                )}
                <QuickAction
                    Icon={GithubIcon}
                    text="View Source Code"
                    action={() =>
                        VencordNative.native.openExternal(
                            "https://github.com/DavidHiFi/HaloCord",
                        )
                    }
                />
            </QuickActionCard>

            <Divider className={Margins.top20} />

            <Heading className={Margins.top20}>Client Settings</Heading>
            <Paragraph className={Margins.bottom16}>
                Configure how HaloCord behaves and integrates with Discord. These settings affect the Discord client's appearance and behavior.
            </Paragraph>
            <Notice.Info className={Margins.bottom20} style={{ width: "100%" }}>
                You can customize where this settings section appears in Discord's settings menu by configuring the{" "}
                <a
                    role="button"
                    onClick={() => openPluginModal(SettingsPlugin)}
                    style={{ cursor: "pointer", color: "var(--text-link)" }}
                >
                    Settings Plugin
                </a>.
            </Notice.Info>

            <Switches />

            <MacOSVibrancySettings />
            <WindowsMaterialSettings />

            <NotificationSection />
        </SettingsTab >
    );
}

export default wrapTab(EquicordSettings, "Equicord Settings");

export function isEquicordDonor(userId: string): boolean {
    const donorBadges = BadgeAPI.getEquicordDonorBadges(userId);
    return GuildMemberStore.getMember(EQUICORD_GUILD_ID, userId)?.roles.includes(DONOR_ROLE_ID) || !!donorBadges;
}

export function isVencordDonor(userId: string): boolean {
    const donorBadges = BadgeAPI.getDonorBadges(userId);
    return GuildMemberStore.getMember(VC_GUILD_ID, userId)?.roles.includes(VC_DONOR_ROLE_ID) || !!donorBadges;
}
