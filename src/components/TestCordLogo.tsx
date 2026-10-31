/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import halocordIconBase64 from "file://../../desktop/brand/icon.png?base64";
import React from "react";

export interface TestCordLogoProps extends React.SVGProps<SVGSVGElement> {
    size?: number | string;
}

// HaloCord app icon (desktop/brand/make_icon.py), shown wherever the TestCord logo was.
const HALOCORD_ICON = `data:image/png;base64,${halocordIconBase64}`;

export function TestCordIcon({ size = 24, width, height, className }: TestCordLogoProps) {
    return <img src={HALOCORD_ICON} width={width ?? size} height={height ?? size} className={className} alt="HaloCord" draggable={false} />;
}
