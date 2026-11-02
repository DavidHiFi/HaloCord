/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Logger } from "@utils/Logger";

export const LIMITER_PROCESSOR = "hc-voice-limiter";

// Brickwall limiter for everyone's voice, run as an AudioWorklet. Peaks are found on the 8x oversampled
// signal (true peak), the gain is the lowest one any sample in the next 2 ms needs, smoothed over that
// window so it is already down when the peak arrives, then released at the chosen speed. A final clamp
// keeps every sample at or below the ceiling. Buffers are made once; process() allocates nothing.
export const LIMITER_SOURCE = String.raw`
const TAPS = 16;
const MID = TAPS / 2 - 1;
const PAD = 4;
const PHASES = [0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875];

function phaseTaps(frac) {
    const taps = new Float32Array(TAPS);
    let sum = 0;
    for (let j = 0; j < TAPS; j++) {
        const x = frac - (j - MID);
        const sinc = x === 0 ? 1 : Math.sin(Math.PI * x) / (Math.PI * x);
        const w = 0.5 + 0.5 * Math.cos(Math.PI * x / (TAPS / 2 + 0.5));
        taps[j] = sinc * w;
        sum += taps[j];
    }
    for (let j = 0; j < TAPS; j++) taps[j] /= sum;
    return taps;
}

class HcVoiceLimiter extends AudioWorkletProcessor {
    static get parameterDescriptors() {
        return [
            { name: "ceiling", defaultValue: -1, minValue: -12, maxValue: 0, automationRate: "k-rate" },
            { name: "release", defaultValue: 100, minValue: 10, maxValue: 1000, automationRate: "k-rate" }
        ];
    }

    constructor() {
        super();
        const n = Math.max(1, Math.round(sampleRate * 0.002));
        this.n = n;
        this.win = n + 1 + 2 * PAD;
        this.size = n + MID + PAD;
        this.delay = [new Float32Array(this.size), new Float32Array(this.size)];
        this.at = 0;
        this.hist = [new Float32Array(TAPS * 2), new Float32Array(TAPS * 2)];
        this.hi = 0;
        this.phases = PHASES.map(phaseTaps);
        this.qv = new Float32Array(this.win + 1);
        this.qt = new Float64Array(this.win + 1);
        this.qHead = 0;
        this.qLen = 0;
        this.t = 0;
        this.env = 1;
        this.box = new Float32Array(n).fill(1);
        this.bi = 0;
        this.sum = n;
        this.releaseMs = -1;
        this.rel = 0;
        this.alive = true;
        this.port.onmessage = e => { if (e.data === "stop") this.alive = false; };
    }

    peak(c) {
        const h = this.hist[c], o = this.hi;
        let p = Math.abs(h[o + MID]);
        for (let k = 0; k < PHASES.length; k++) {
            const taps = this.phases[k];
            let v = 0;
            for (let j = 0; j < TAPS; j++) v += h[o + j] * taps[j];
            if (v < 0) v = -v;
            if (v > p) p = v;
        }
        return p;
    }

    process(inputs, outputs, parameters) {
        if (!this.alive) return false;
        const input = inputs[0], output = outputs[0];
        const outL = output[0], outR = output[1] || output[0];
        const inL = input && input.length ? input[0] : null;
        const inR = input && input.length > 1 ? input[1] : inL;
        const ceiling = Math.pow(10, parameters.ceiling[0] / 20);
        const releaseMs = parameters.release[0];
        if (releaseMs !== this.releaseMs) {
            this.releaseMs = releaseMs;
            this.rel = 1 - Math.exp(-1 / (releaseMs / 1000 * sampleRate));
        }
        const n = this.n, win = this.win, cap = win + 1;
        const qv = this.qv, qt = this.qt, box = this.box;
        const dL = this.delay[0], dR = this.delay[1], hL = this.hist[0], hR = this.hist[1];
        for (let i = 0; i < outL.length; i++) {
            const xl = inL ? inL[i] : 0, xr = inR ? inR[i] : 0;
            hL[this.hi] = hL[this.hi + TAPS] = xl;
            hR[this.hi] = hR[this.hi + TAPS] = xr;
            this.hi = (this.hi + 1) % TAPS;
            const p = Math.max(this.peak(0), this.peak(1));
            const need = p > ceiling ? ceiling / p : 1;

            const t = this.t++;
            while (this.qLen && qv[(this.qHead + this.qLen - 1) % cap] >= need) this.qLen--;
            const back = (this.qHead + this.qLen) % cap;
            qv[back] = need;
            qt[back] = t;
            this.qLen++;
            while (qt[this.qHead] <= t - win) { this.qHead = (this.qHead + 1) % cap; this.qLen--; }
            const hold = qv[this.qHead];

            let env = this.env + (1 - this.env) * this.rel;
            if (env > hold) env = hold;
            this.env = env;
            this.sum += env - box[this.bi];
            box[this.bi] = env;
            this.bi = (this.bi + 1) % n;
            const g = this.sum / n;

            const at = this.at;
            let yl = dL[at] * g, yr = dR[at] * g;
            dL[at] = xl;
            dR[at] = xr;
            this.at = (at + 1) % this.size;
            if (yl > ceiling) yl = ceiling; else if (yl < -ceiling) yl = -ceiling;
            if (yr > ceiling) yr = ceiling; else if (yr < -ceiling) yr = -ceiling;
            outL[i] = yl;
            if (outR !== outL) outR[i] = yr;
        }
        return true;
    }
}

registerProcessor("${LIMITER_PROCESSOR}", HcVoiceLimiter);
`;

// HaloCord's audio guard (desktop/base/userscript.js) asks window.__hcVoiceLimiter for a node to put between
// the voice bus and the output mix, and window.__hcVoiceRoute() makes it ask again. Go Live audio never
// passes the voice bus, so stream sound is untouched.
type LimiterWindow = Window & {
    __hcVoiceLimiter?: (ctx: BaseAudioContext) => AudioNode | null;
    __hcVoiceRoute?: () => void;
};

const logger = new Logger("MicSpamGuard");
const limiterWindow = window as LimiterWindow;
const loaded = new WeakMap<BaseAudioContext, boolean>();
let moduleUrl: string | undefined;
let node: AudioWorkletNode | null = null;
let wanted = false;
let ceilingDb = -1;
let releaseMs = 100;

function dropNode() {
    node?.port.postMessage("stop");
    node = null;
}

function provide(ctx: BaseAudioContext): AudioNode | null {
    if (!wanted) return null;
    if (node?.context === ctx) return node;
    const state = loaded.get(ctx);
    if (state === undefined) {
        loaded.set(ctx, false);
        moduleUrl ??= URL.createObjectURL(new Blob([LIMITER_SOURCE], { type: "application/javascript" }));
        ctx.audioWorklet.addModule(moduleUrl).then(() => {
            loaded.set(ctx, true);
            limiterWindow.__hcVoiceRoute?.();
        }, e => logger.error("failed to load the limiter", e));
    }
    if (!state) return null;
    dropNode();
    node = new AudioWorkletNode(ctx, LIMITER_PROCESSOR, {
        numberOfInputs: 1,
        numberOfOutputs: 1,
        outputChannelCount: [2],
        channelCount: 2,
        channelCountMode: "explicit",
        channelInterpretation: "speakers"
    });
    applyParams();
    return node;
}

function applyParams() {
    node?.parameters.get("ceiling")?.setValueAtTime(ceilingDb, 0);
    node?.parameters.get("release")?.setValueAtTime(releaseMs, 0);
}

export function isLimiterActive() {
    return node !== null;
}

export function hasVoiceRoute() {
    return typeof limiterWindow.__hcVoiceRoute === "function";
}

export function setLimiter(on: boolean, ceiling: number, release: number) {
    ceilingDb = ceiling;
    releaseMs = release;
    applyParams();
    if (on === wanted) return;
    wanted = on;
    if (on) limiterWindow.__hcVoiceLimiter = provide;
    limiterWindow.__hcVoiceRoute?.();
    if (!on) {
        dropNode();
        if (limiterWindow.__hcVoiceLimiter === provide) delete limiterWindow.__hcVoiceLimiter;
    }
}
