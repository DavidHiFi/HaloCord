/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import "./UIElements.css";

import { ChatBarButtonMap } from "@api/ChatButtons";
import { getHeaderButtonIds } from "@api/HeaderBar";
import { MessagePopoverButtonMap } from "@api/MessagePopover";
import { PluginHealth } from "@api/PluginHealth";
import { plugins } from "@api/PluginManager";
import { SettingsPluginUiElements, useSettings } from "@api/Settings";
import { Card } from "@components/Card";
import { HaloRow, HaloSection, HaloSwitch } from "@components/HaloUI";
import { PlaceholderIcon } from "@components/Icons";
import { Paragraph } from "@components/Paragraph";
import { classNameFactory } from "@utils/css";
import { RenderModalProps } from "@vencord/discord-types";
import { Clickable, Modal, openModal } from "@webpack/common";
import type { ComponentType } from "react";

const cl = classNameFactory("vc-plugin-ui-elements-");

export function UIElementsButton() {
    return (
        <Clickable onClick={() => openModal(modalProps => <UIElementsModal {...modalProps} />)}>
            <Card className={cl("button")} defaultPadding>
                <div className={cl("button-description")}>
                    <Paragraph size="md" weight="semibold">
                        Manage plugin UI elements
                    </Paragraph>
                    <Paragraph size="xs">
                        Allows you to hide buttons you don't like
                    </Paragraph>
                </div>
                <svg
                    className={cl("button-arrow")}
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                >
                    <path fill="currentColor" d="M9.3 5.3a1 1 0 0 0 0 1.4l5.29 5.3-5.3 5.3a1 1 0 1 0 1.42 1.4l6-6a1 1 0 0 0 0-1.4l-6-6a1 1 0 0 0-1.42 0Z" />
                </svg>
            </Card>
        </Clickable >
    );
}

function Section(props: {
    title: string;
    description: string;
    settings: SettingsPluginUiElements;
    buttonMap: Map<string, { icon?: ComponentType<{ height?: number; width?: number; }>; }>;
}) {
    const { buttonMap, description, title, settings } = props;

    const switches = Array.from(buttonMap, ([name, { icon }]) => {
        const Icon = icon ?? PlaceholderIcon;
        return (
            <HaloRow key={name} title={<span className={cl("row-title")}><Icon height={20} width={20} />{name}</span>}>
                <HaloSwitch
                    label={name}
                    checked={settings[name]?.enabled ?? true}
                    onChange={v => {
                        settings[name] ??= { enabled: v };
                        settings[name].enabled = v;
                        void PluginHealth.recordPluginChange(name, v);
                    }}
                />
            </HaloRow>
        );
    });

    return (
        <HaloSection title={title}>
            <p className={cl("description")}>{description}</p>
            {switches.length ? switches : <HaloRow title="Buttons of enabled plugins will appear here." disabled />}
        </HaloSection>
    );
}

function UIElementsModal(props: RenderModalProps) {
    const { uiElements } = useSettings(["uiElements.*"]);
    const headerButtons = new Map(getHeaderButtonIds().map(id => [id, { icon: plugins[id]?.headerBarButton?.icon }]));

    return (
        <Modal {...props} size="md" title="Manage plugin UI elements" className={cl("modal")}>
            <div className={cl("modal-content")}>
                <Section
                    title="Header buttons"
                    description="The buttons at the top right next to the inbox, and in the channel header"
                    buttonMap={headerButtons}
                    settings={uiElements.headerBarButtons}
                />
                <Section
                    title="Chatbar buttons"
                    description="The buttons on the right side of the chat input bar"
                    buttonMap={ChatBarButtonMap}
                    settings={uiElements.chatBarButtons}
                />
                <Section
                    title="Message popover buttons"
                    description="The floating buttons on the right when you hover over a message"
                    buttonMap={MessagePopoverButtonMap}
                    settings={uiElements.messagePopoverButtons}
                />
            </div>
        </Modal>
    );
}
