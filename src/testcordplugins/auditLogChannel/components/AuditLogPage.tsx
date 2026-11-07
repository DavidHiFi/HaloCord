/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { LogIcon } from "@components/Icons";
import { findByCodeLazy, findComponentByCodeLazy, findCssClassesLazy, findLazy, findStoreLazy } from "@webpack";
import { GuildStore, UserStore, useStateFromStores } from "@webpack/common";
import React from "react";

import { getAuditLogComponent } from "../state";

const PageWrapper = findComponentByCodeLazy("isAuthenticated:", ".HEADER_BAR");
const mainClasses = findCssClassesLazy("chat", "threadSidebarOpen");
const headerClasses = findCssClassesLazy("header", "innerHeader", "tabBar");

const GuildSettingsAuditLogStore = findStoreLazy("GuildSettingsAuditLogStore");
const ThemeStore = findStoreLazy("ThemeStore");
const StreamerModeStore = findStoreLazy("StreamerModeStore");

const logsParser = findByCodeLazy("AUTO_MODERATION_ADD_KEYWORDS:case");

const { Title, Icon } = findLazy(m => ["Icon", "Title", "Divider", "Caret"].every(i => Object.prototype.hasOwnProperty.call(m, i)));

export default function AuditLogPage({ guildId }: { guildId: string; }) {
    const guild = useStateFromStores([GuildStore], () => GuildStore.getGuild(guildId));

    const theme = useStateFromStores([ThemeStore], () => ThemeStore.theme);
    const streamerMode = useStateFromStores([StreamerModeStore], () => StreamerModeStore.enabled);
    const auditLogState = useStateFromStores([GuildSettingsAuditLogStore, UserStore], () => ({
        actionFilter: GuildSettingsAuditLogStore.actionFilter,
        groupedFetchCount: GuildSettingsAuditLogStore.groupedFetchCount,
        hasError: GuildSettingsAuditLogStore.hasError,
        hasOlderLogs: GuildSettingsAuditLogStore.hasOlderLogs,
        isInitialLoading: GuildSettingsAuditLogStore.isInitialLoading,
        isLoading: GuildSettingsAuditLogStore.isLoading,
        isLoadingNextPage: GuildSettingsAuditLogStore.isLoadingNextPage,
        logs: GuildSettingsAuditLogStore.logs,
        moderators: GuildSettingsAuditLogStore.userIds.map(e => UserStore.getUser(e)).filter(i => i !== null),
        userIdFilter: GuildSettingsAuditLogStore.userIdFilter,
    }));
    const AuditLogComponent = getAuditLogComponent();

    if (!AuditLogComponent) return null;

    return <div className={mainClasses.chat}>
        <PageWrapper
            className={headerClasses.header}
            innerClassname={headerClasses.innerHeader}
            hideSearch={true}
            channelId="audit-log"
            guildId={guildId}
            toolbar={[
            ]}
        >
            <Icon icon={LogIcon} />
            <Title>Audit Log</Title>
        </PageWrapper>
        <AuditLogComponent
            guildId={guildId}
            guild={guild}
            moderators={auditLogState.moderators}
            isInitialLoading={auditLogState.isInitialLoading}
            isLoading={auditLogState.isLoading}
            isLoadingNextPage={auditLogState.isLoadingNextPage}
            showLoadMore={auditLogState.groupedFetchCount > 2}
            hasError={auditLogState.hasError}
            hasOlderLogs={auditLogState.hasOlderLogs}
            logs={auditLogState.logs !== null && guild !== null ? logsParser(auditLogState.logs, guild) : []}
            actionFilter={auditLogState.actionFilter}
            userIdFilter={auditLogState.userIdFilter}
            theme={theme}
            hide={streamerMode}
        />
    </div>;
}
