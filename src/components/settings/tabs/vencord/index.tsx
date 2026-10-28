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

const MOCHACORD_IMAGE = "data:image/webp;base64,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";

const VENNIE_DONATOR_IMAGE = "https://cdn.discordapp.com/emojis/1238120638020063377.png";
const COZY_CONTRIB_IMAGE = "https://cdn.discordapp.com/emojis/1026533070955872337.png";

const DONOR_BACKGROUND_IMAGE = "https://media.discordapp.net/stickers/1311070116305436712.png?size=2048";
const CONTRIB_BACKGROUND_IMAGE = "https://media.discordapp.net/stickers/1311070166481895484.png?size=2048";

const cl = classNameFactory("vc-vencord-tab-");

// The MochaCord desktop shell exposes its own window and app controls to the web build.
const HAS_SHELL = IS_WEB && !!window.MochaCordNative;

type KeysOfType<Object, Type> = {
    [K in keyof Object]: Object[K] extends Type ? K : never;
}[keyof Object];

function Switches() {
    const settings = useSettings(["useQuickCss", "enableReactDevtools", "mainWindowFrameless", "frameless", "nativeTitleBar", "transparent", "winCtrlQ", "disableMinSize", "useTestcordIcon"]);

    const Switches = [
        {
            key: "useTestcordIcon",
            title: "Use MochaCord Icon",
            description: "Replace the standard Discord logo icon with the custom MochaCord icon.",
        },
        {
            key: "useQuickCss",
            title: "Enable Custom CSS",
            description: "Apply your configured QuickCSS"
        },
        (!IS_WEB && !IS_DISCORD_DESKTOP || !IS_WINDOWS) && {
            key: "mainWindowFrameless",
            title: "Disable the Main Window Frame",
            description: "Remove the native window frame for a cleaner look. You can still move the window by dragging the title bar area.",
            restartRequired: true,
        },
        !IS_WEB && (!IS_DISCORD_DESKTOP || !IS_WINDOWS
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
            description: "Make the MochaCord window transparent. A theme that supports transparency is required or this will do nothing.",
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
            title: "Register Ctrl+Q as shortcut to close MochaCord",
            description: "Add Ctrl+Q as a keyboard shortcut to close MochaCord. This provides an alternative to Alt+F4 for quickly closing the application.",
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
                    description="MochaCord is built and kept running by DavidHiFi. If it helps you, a Ko-fi tip keeps it going."
                    cardImage={MOCHACORD_IMAGE}
                    backgroundImage={DONOR_BACKGROUND_IMAGE}
                    backgroundColor="#c3a3ce"
                >
                    <DonateButtonComponent />
                </SpecialCard>
            )}
            <SpecialCard
                title="Contributions"
                subtitle={isAnyPluginDev(user?.id) ? "Thank you for contributing!" : undefined}
                description="MochaCord takes pull requests on GitHub. Read the contributing guide, then open an issue or a pull request."
                cardImage={COZY_CONTRIB_IMAGE}
                backgroundImage={CONTRIB_BACKGROUND_IMAGE}
                backgroundColor="#EDCC87"
            >
                <Button
                    variant="none"
                    size="medium"
                    type="button"
                    onClick={() => VencordNative.native.openExternal("https://github.com/DavidHiFi/MochaCord-Client/blob/main/CONTRIBUTING.md")}
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
                        text="Relaunch MochaCord"
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
                            "https://github.com/DavidHiFi/MochaCord-Client",
                        )
                    }
                />
            </QuickActionCard>

            <Divider className={Margins.top20} />

            <Heading className={Margins.top20}>Client Settings</Heading>
            <Paragraph className={Margins.bottom16}>
                Configure how MochaCord behaves and integrates with Discord. These settings affect the Discord client's appearance and behavior.
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
