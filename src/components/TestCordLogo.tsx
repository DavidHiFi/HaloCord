/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { useSettings } from "@api/Settings";
import halocordIconBase64 from "file://../../desktop/brand/icon.png?base64";
import halocordMochaIconBase64 from "file://../../desktop/brand/icon-mocha.png?base64";
import React from "react";

export interface TestCordLogoProps extends React.SVGProps<SVGSVGElement> {
    size?: number | string;
}

// HaloCord app icon (desktop/brand/make_icon.py) in green and Mocha blue, shown wherever the TestCord logo was.
export const HALOCORD_ICONS = {
    green: `data:image/png;base64,${halocordIconBase64}`,
    mocha: `data:image/png;base64,${halocordMochaIconBase64}`
};

export function useHaloCordIcon() {
    const { haloInAppIcon } = useSettings(["haloInAppIcon"]);
    return HALOCORD_ICONS[haloInAppIcon] ?? HALOCORD_ICONS.green;
}

export function TestCordIcon({ size = 24, width, height, className }: TestCordLogoProps) {
    return <img src={useHaloCordIcon()} width={width ?? size} height={height ?? size} className={className} alt="HaloCord" draggable={false} />;
}
