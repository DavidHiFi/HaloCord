/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { HeaderBarButton } from "@api/HeaderBar";
import { RestartIcon } from "@components/Icons";
import { TestcordDevs } from "@utils/constants";
import { relaunch } from "@utils/native";
import definePlugin from "@utils/types";

export default definePlugin({
    name: "RestartButton",
    description: "Adds a button at the top right, next to the inbox button, that relaunches HaloCord.",
    tags: ["Shortcuts"],
    authors: [TestcordDevs.DavidHiFi],
    dependencies: ["HeaderBarAPI"],
    headerBarButton: {
        icon: RestartIcon,
        render: () => <HeaderBarButton icon={RestartIcon} tooltip="Relaunch HaloCord" onClick={relaunch} />,
        priority: 1336
    }
});
