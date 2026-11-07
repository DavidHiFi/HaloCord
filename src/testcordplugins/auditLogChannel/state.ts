/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

// Holds Discord's audit log list component, captured by a patch.
let auditLogComponent: any;

export const setAuditLogComponent = (component: any) => { auditLogComponent = component; };
export const getAuditLogComponent = (): any => auditLogComponent;
