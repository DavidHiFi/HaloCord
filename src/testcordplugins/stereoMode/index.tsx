/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 SirPhantom89 and DavidHiFi
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { definePluginSettings } from "@api/Settings";
import { UserAreaButton, type UserAreaRenderProps } from "@api/UserArea";
import { HeadphonesIcon } from "@components/Icons";
import { TestcordDevs } from "@utils/constants";
import definePlugin, { OptionType } from "@utils/types";
import { findByPropsLazy } from "@webpack";
import { FluxDispatcher, showToast, Toasts } from "@webpack/common";

// Web port of StereoLoader's user-area button. The HaloCord shell's voice engine
// already sends stereo Opus, so the button flips that engine switch (exposed by the
// shell as window.HaloCordStereo) and moves the mic to the Custom input profile with
// echo cancellation, noise suppression and gain control off, since those fold the signal back to mono.
const AudioActions = findByPropsLazy("setActiveInputProfile", "setNoiseSuppression");
const VoiceState = findByPropsLazy("getActiveInputProfile", "getNoiseSuppression");

const STEREO_PROFILE = "CUSTOM";
const NORMAL_PROFILE = "VOICE_ISOLATION";

const settings = definePluginSettings({
    stereoMode: {
        type: OptionType.BOOLEAN,
        description: "Stereo Mode",
        default: false,
        hidden: true
    },
    savedInputProfile: {
        type: OptionType.STRING,
        description: "Your input profile before Stereo Mode was turned on.",
        default: NORMAL_PROFILE,
        hidden: true
    }
});

function applyInputProfile(profile: string) {
    try {
        AudioActions.setActiveInputProfile(profile);
    } catch {
        FluxDispatcher.dispatch({ type: "AUDIO_SET_ACTIVE_INPUT_PROFILE", inputProfile: profile });
    }
}

function setStereoMode(on: boolean) {
    if (on) {
        const current = String(VoiceState.getActiveInputProfile?.() ?? NORMAL_PROFILE);
        if (current !== STEREO_PROFILE) settings.store.savedInputProfile = current;
        applyInputProfile(STEREO_PROFILE);
        try {
            AudioActions.setEchoCancellation(false);
            AudioActions.setNoiseSuppression(false);
            AudioActions.setNoiseCancellation(false);
            AudioActions.setAutomaticGainControl(false);
        } catch { }
    } else {
        applyInputProfile(settings.store.savedInputProfile || NORMAL_PROFILE);
    }
    window.HaloCordStereo?.set(on);
    settings.store.stereoMode = on;
}

function StereoModeButton({ iconForeground, hideTooltips, nameplate }: UserAreaRenderProps) {
    const { stereoMode } = settings.use(["stereoMode"]);

    return (
        <UserAreaButton
            className="button__201d5 wrapper__201d5"
            tooltipText={hideTooltips ? void 0 : stereoMode ? "Disable Stereo Mode" : "Enable Stereo Mode"}
            aria-label="Stereo Mode"
            icon={<HeadphonesIcon className={iconForeground} />}
            role="switch"
            aria-checked={stereoMode}
            redGlow={!stereoMode}
            plated={nameplate != null}
            onClick={() => {
                setStereoMode(!stereoMode);
                showToast(!stereoMode
                    ? "Stereo Mode on: stereo mic, voice processing off"
                    : "Stereo Mode off: your normal voice settings are back", Toasts.Type.SUCCESS);
            }}
        />
    );
}

export default definePlugin({
    id: "StereoMode",
    name: "StereoMode",
    description: "A user-area button that switches your mic between stereo with no processing and your normal voice settings.",
    tags: ["Voice", "Shortcuts"],
    authors: [TestcordDevs.sirphantom89],
    dependencies: ["UserAreaAPI"],
    settings,

    userAreaButton: {
        icon: (props: { className?: string; }) => <HeadphonesIcon {...props} />,
        render: StereoModeButton
    },

    start() {
        // The engine's saved switch wins, so the button never flips the engine on its own.
        if (window.HaloCordStereo) settings.store.stereoMode = window.HaloCordStereo.get();
    }
});
