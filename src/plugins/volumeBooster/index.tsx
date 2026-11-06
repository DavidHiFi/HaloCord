/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2022 Vendicated and contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import "./style.css";

import { findGroupChildrenByChildId, NavContextMenuPatchCallback } from "@api/ContextMenu";
import { ResetIcon } from "@components/Icons";
import { Devs, TestcordDevs } from "@utils/constants";
import definePlugin from "@utils/types";
import { Stream, User } from "@vencord/discord-types";
import { findByPropsLazy } from "@webpack";
import { Menu, React } from "@webpack/common";
import type { ComponentProps, ReactElement } from "react";

const DEFAULT_VOLUME = { default: 100, stream: 18 } as const;

// Not destructured: a destructured lazy export is cached on first call and goes stale if the module is swapped.
const VoiceActions = findByPropsLazy("setLocalVolume", "toggleLocalMute");

function addVolumeReset(children: Parameters<NavContextMenuPatchCallback>[0], userId: string, context: keyof typeof DEFAULT_VOLUME) {
    const group = findGroupChildrenByChildId("user-volume", children);
    if (!group) return;

    const index = group.findIndex(child => child?.props?.id === "user-volume");
    const item = group[index] as ReactElement<ComponentProps<typeof Menu.MenuControlItem>>;
    const reset = () => VoiceActions.setLocalVolume(userId, DEFAULT_VOLUME[context], context);

    group.splice(index, 1,
        React.cloneElement(item, {
            control: (props, ref) => (
                <div className="vc-volume-row">
                    {item.props.control(props, ref)}
                    <button
                        type="button"
                        className="vc-volume-reset"
                        aria-label="Reset volume"
                        onClick={e => { e.stopPropagation(); reset(); }}
                    >
                        <ResetIcon />
                    </button>
                </div>
            )
        }),
        <Menu.MenuItem id="vc-volume-reset" label="Reset volume" action={reset} />
    );
}

interface StreamData {
    audioContext: AudioContext,
    audioElement: HTMLAudioElement,
    emitter: any,
    // added by this plugin
    boostSource?: MediaStreamAudioSourceNode,
    gainNode?: GainNode,
    id: string,
    levelNode: AudioWorkletNode,
    sinkId: string | "default",
    stream: MediaStream,
    videoStreamId: string,
    _mute: boolean,
    _speakingFlags: number,
    _volume: number;
}

export default definePlugin({
    id: "VolumeBooster",
    name: "VolumeBooster",
    authors: [Devs.Nuckyz, Devs.sadan, TestcordDevs.DavidHiFi],
    description: "Lets you set user and stream volume up to 1000% and reset it from the context menu.",
    tags: ["Voice", "Utility"],
    required: true,
    hidden: true,

    contextMenus: {
        "user-context": (children, { user }: { user: User; }) => addVolumeReset(children, user.id, "default"),
        "stream-context": (children, { stream }: { stream: Stream; }) => addVolumeReset(children, stream.ownerId, "stream")
    },

    patches: [
        // Change the max volume for sliders to allow for values above 200
        {
            find: "#{intl::USER_VOLUME}",
            replacement: {
                // FIXME: Stable compat: (?:\i\.\i|200 or 100), keep only 200 or 100
                match: /(?<=maxValue:)\i\.isPlatformEmbedded\?(?:\i\.\i|200):(?:\i\.\i|100)(?=,)/,
                replace: "1000"
            }
        },
        // Change the max volume for sliders to allow for values above 200
        {
            find: "currentVolume:",
            replacement: {
                match: /(?<=maxValue:)\i\.\i\?\d+?:\d+?(?=,)/,
                replace: "1000"
            }
        },
        // Patches needed for web/vesktop
        {
            find: "streamSourceNode",
            predicate: () => !IS_DISCORD_DESKTOP,
            group: true,
            replacement: [
                // Remove rounding algorithm
                {
                    match: /Math\.max.{0,30}\)\)/,
                    replace: "arguments[0]"
                },
                // Fix streams not playing audio until you update them
                {
                    match: /\}return"video"/,
                    replace: "this.updateAudioElement();$&"
                },
                // Patch the volume
                {
                    match: /\.volume=this\._volume\/100;/,
                    replace: ".volume=0.00;$self.patchVolume(this);"
                },
                {
                    match: /destroy\(\)\{(?=this\.audioElement\?\.pause\(\))/,
                    replace: "$&this.boostSource?.disconnect();this.gainNode?.disconnect();"
                }
            ]
        },
        // Prevent Audio Context Settings sync from trying to sync with values above 200, changing them to 200 before we send to Discord
        {
            find: "AudioContextSettingsMigrated",
            replacement: [
                {
                    match: /(?<=isLocalMute\(\i,\i\),volume:(\i).+?\(0,\i\.\i\)\(\i,\i,\{volume:)\1(?=\}\))/,
                    replace: "$&>200?200:$&"
                },
                {
                    match: /(?<=Object\.entries\(\i\.localMutes\).+?volume:).+?(?=,)/,
                    replace: "$&>200?200:$&"
                },
                {
                    match: /(?<=Object\.entries\(\i\.localVolumes\).+?volume:).+?(?=})/,
                    replace: "$&>200?200:$&"
                }
            ]
        },
        // Prevent the MediaEngineStore from overwriting our LocalVolumes above 200 with the ones the Discord Audio Context Settings sync sends
        {
            find: '="MediaEngineStore",',
            replacement: [
                {
                    match: /(\.settings\.audioContextSettings.+?)(\i\[\i\])=(\i\.volume)(.+?setLocalVolume\(\i,).+?\)/,
                    replace: (_, rest1, localVolume, syncVolume, rest2) => rest1
                        + `(${localVolume}>200?void 0:${localVolume}=${syncVolume})`
                        + rest2
                        + `${localVolume}??${syncVolume})`
                }
            ]
        }
    ],

    patchVolume(data: StreamData) {
        if (data.stream.getAudioTracks().length === 0) return;

        if (!data.gainNode) {
            data.boostSource = data.audioContext.createMediaStreamSource(data.stream);
            data.gainNode = data.audioContext.createGain();
            data.boostSource.connect(data.gainNode).connect(data.audioContext.destination);
        }

        // @ts-expect-error
        if (data.sinkId != null && data.sinkId !== data.audioContext.sinkId && "setSinkId" in AudioContext.prototype) {
            // @ts-expect-error https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/setSinkId
            data.audioContext.setSinkId(data.sinkId === "default" ? "" : data.sinkId);
        }

        data.gainNode.gain.value = data._mute
            ? 0
            : data._volume / 100;
    }
});
