/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { BaseText } from "@components/BaseText";
import { HaloRestartButton } from "@components/HaloRestart";
import { classNameFactory } from "@utils/css";
import { classes } from "@utils/misc";
import { wordsFromCamel, wordsToTitle } from "@utils/text";
import { DefinedSettings, PluginSettingDefCommon } from "@utils/types";
import { PropsWithChildren } from "react";

export const cl = classNameFactory("vc-plugins-setting-");

interface SettingBaseProps<T> {
    setting: T;
    onChange(newValue: any): void;
    pluginSettings: {
        [setting: string]: any;
        enabled: boolean;
    };
    id: string;
    definedSettings: DefinedSettings;
    closePluginSettings(): void;
}

export type SettingProps<T extends PluginSettingDefCommon> = SettingBaseProps<T>;
export type ComponentSettingProps<T extends Omit<PluginSettingDefCommon, "description" | "placeholder">> = SettingBaseProps<T>;

/** The pending restart key for a plugin option that only applies after a restart. */
export function restartKeyOf(definedSettings: DefinedSettings, setting: Pick<PluginSettingDefCommon, "restartNeeded">, id: string) {
    return setting.restartNeeded ? `plugins.${definedSettings.pluginName}.${id}` : undefined;
}

export const settingTitle = (name: string | undefined, id: string) => name ?? wordsToTitle(wordsFromCamel(id));

export function resolveError(isValidResult: boolean | string) {
    if (typeof isValidResult === "string") return isValidResult;

    return isValidResult ? null : "Invalid input provided";
}

interface SettingsSectionProps extends PropsWithChildren {
    name?: string;
    id: string;
    description: string;
    error?: string | null;
    inlineSetting?: boolean;
    tag?: "label" | "div";
    restartKey?: string;
}

export function SettingsSection({ tag: Tag = "div", name, id, description, error, inlineSetting, restartKey, children }: SettingsSectionProps) {
    const title = settingTitle(name, id);
    return (
        <Tag className={cl("section")}>
            <div className={classes(cl("content"), inlineSetting && cl("inline"))}>
                <div className={cl("label")}>
                    <BaseText className={cl("title")} size="md" weight="medium">
                        {title}
                        {restartKey && <HaloRestartButton label={title} pendingKey={restartKey} />}
                    </BaseText>
                    {description && <BaseText className={cl("description")} size="sm">{description}</BaseText>}
                </div>
                {children}
            </div>
            {error && <BaseText className={cl("error")} size="sm">{error}</BaseText>}
        </Tag>
    );
}
