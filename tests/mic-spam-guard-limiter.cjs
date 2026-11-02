// Offline render of MicSpamGuard's hard limiter: runs the exact worklet source from limiter.ts
// in 128 frame blocks and checks sample peak and 16x true peak against the ceiling.
// Run: node tests/mic-spam-guard-limiter.cjs
const fs = require("fs");
const path = require("path");
const assert = require("assert");

const ts = fs.readFileSync(path.join(__dirname, "../src/testcordplugins/MicSpamGuard/limiter.ts"), "utf8");
const name = ts.match(/LIMITER_PROCESSOR = "([^"]+)"/)[1];
let source = ts.match(/String\.raw`([\s\S]*?)`;/)[1].replace("${LIMITER_PROCESSOR}", name);
if (process.env.TAPS) source = source.replace(/const TAPS = \d+;/, `const TAPS = ${process.env.TAPS};`);

function load(rate) {
    let registered;
    class AudioWorkletProcessor { constructor() { this.port = { onmessage: null }; } }
    new Function("AudioWorkletProcessor", "registerProcessor", "sampleRate", source)(
        AudioWorkletProcessor, (n, cls) => { assert.strictEqual(n, name); registered = cls; }, rate);
    return registered;
}

function render(Proc, rate, left, right, ceilingDb, releaseMs, mono) {
    const proc = new Proc();
    const len = left.length;
    const outL = new Float32Array(len), outR = new Float32Array(len);
    const params = { ceiling: new Float32Array([ceilingDb]), release: new Float32Array([releaseMs]) };
    for (let at = 0; at < len; at += 128) {
        const end = Math.min(len, at + 128);
        const input = mono ? [left.subarray(at, end)] : [left.subarray(at, end), right.subarray(at, end)];
        const output = [new Float32Array(end - at), new Float32Array(end - at)];
        assert.strictEqual(proc.process([input], [output], params), true);
        outL.set(output[0], at);
        outR.set(output[1], at);
    }
    return { outL, outR, delay: proc.size };
}

// Reference true peak: 16x oversampling with a long windowed sinc, much finer than the limiter's own detector.
const OVER = 16, HALF = 32;
const refTaps = Array.from({ length: OVER }, (_, k) => {
    const taps = new Float64Array(2 * HALF);
    for (let j = -HALF + 1; j <= HALF; j++) {
        const d = k / OVER - j;
        const sinc = d === 0 ? 1 : Math.sin(Math.PI * d) / (Math.PI * d);
        taps[j + HALF - 1] = sinc * (0.42 + 0.5 * Math.cos(Math.PI * d / HALF) + 0.08 * Math.cos(2 * Math.PI * d / HALF));
    }
    return taps;
});
function truePeak(x) {
    let peak = 0;
    for (let i = HALF; i < x.length - HALF; i++) {
        for (let k = 0; k < OVER; k++) {
            const taps = refTaps[k];
            let v = 0;
            for (let j = 0; j < 2 * HALF; j++) v += x[i - HALF + 1 + j] * taps[j];
            if (v < 0) v = -v;
            if (v > peak) peak = v;
        }
    }
    return peak;
}

// Windowed sinc low pass, to make test signals band limited like decoded Opus voice (20 kHz).
function lowpass(x, hz) {
    const len = 255, mid = 127, fc = hz / rate, h = new Float64Array(len);
    let sum = 0;
    for (let j = 0; j < len; j++) {
        const d = j - mid;
        const w = 0.42 - 0.5 * Math.cos(2 * Math.PI * j / (len - 1)) + 0.08 * Math.cos(4 * Math.PI * j / (len - 1));
        h[j] = (d === 0 ? 2 * fc : Math.sin(2 * Math.PI * fc * d) / (Math.PI * d)) * w;
        sum += h[j];
    }
    const y = new Float32Array(x.length);
    for (let i = mid; i < x.length - mid; i++) {
        let v = 0;
        for (let j = 0; j < len; j++) v += x[i - mid + j] * h[j];
        y[i] = v / sum;
    }
    return y;
}

const db = v => 20 * Math.log10(v);
const rate = 48000;
const Proc = load(rate);
const secs = n => Math.round(n * rate);

function sine(len, freq, amp, phase = 0) {
    const a = new Float32Array(len);
    for (let i = 0; i < len; i++) a[i] = amp * Math.sin(2 * Math.PI * freq * i / rate + phase);
    return a;
}

let seed = 12345;
const rand = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648) * 2 - 1;

const cases = [];
cases.push(["997 Hz sine at +6 dBFS", sine(secs(0.5), 997, 2), null]);
// fs/4 at 45 degrees: every sample is 0.707 of the true peak, so a sample peak detector misses it.
cases.push(["fs/4 sine, intersample peak +1.6 dBFS", sine(secs(0.5), rate / 4, 1.2, Math.PI / 4), null]);
cases.push(["11 kHz sine at +3 dBFS", sine(secs(0.5), 11025, 1.41, 0.3), null]);
{
    const a = new Float32Array(secs(0.5));
    for (let i = secs(0.25); i < a.length; i++) a[i] = 8 * Math.sin(2 * Math.PI * 440 * i / rate);
    cases.push(["silence then +18 dBFS burst", a, null]);
}
{
    const l = new Float32Array(secs(0.5)), r = new Float32Array(secs(0.5));
    for (let i = 0; i < l.length; i++) { l[i] = 4 * rand(); r[i] = 4 * rand(); }
    cases.push(["noise to 20 kHz at +12 dBFS, stereo", lowpass(l, 20000), lowpass(r, 20000)]);
}
{
    const a = new Float32Array(secs(0.5));
    for (let i = 0; i < a.length; i++) a[i] = (Math.floor(i / 60) % 2 ? 1 : -1) * 3;
    cases.push(["square wave to 20 kHz at +9.5 dBFS", lowpass(a, 20000), null]);
}
{
    const a = new Float32Array(secs(0.5));
    for (let i = 0; i < a.length; i += 2400) a[i] = 5;
    cases.push(["isolated +14 dBFS clicks", a, null]);
}
{
    // Voice-like: a 140 Hz buzz with harmonics to 8 kHz, syllables four times a second, peaking near +10 dBFS.
    const a = new Float32Array(secs(1));
    for (let i = 0; i < a.length; i++) {
        const t = i / rate, f0 = 140 * (1 + 0.03 * Math.sin(2 * Math.PI * 5 * t));
        let v = 0;
        for (let k = 1; k * 140 < 8000; k++) v += Math.sin(2 * Math.PI * f0 * k * t + k) / k;
        a[i] = v * Math.max(0, Math.sin(2 * Math.PI * 4 * t)) * 1.4;
    }
    cases.push(["voice-like syllables near +10 dBFS", a, null]);
}

let failed = 0;
for (const ceilingDb of [-12, -6, -1, 0]) {
    const ceiling = Math.pow(10, ceilingDb / 20);
    for (const [label, l, r] of cases) {
        for (const mono of r ? [false] : [true, false]) {
            const right = r ?? l;
            const { outL, outR } = render(Proc, rate, l, right, ceilingDb, 100, mono);
            let sample = 0;
            for (let i = 0; i < outL.length; i++) sample = Math.max(sample, Math.abs(outL[i]), Math.abs(outR[i]));
            const tp = Math.max(truePeak(outL), truePeak(outR));
            const over = db(tp) - ceilingDb;
            const ok = sample <= ceiling + 1e-7 && over <= 0.1;
            if (!ok) failed++;
            console.log(`${ok ? "ok  " : "FAIL"} ceiling ${ceilingDb} dB, ${label}${mono ? " (mono in)" : ""}: sample ${db(sample).toFixed(2)} dBFS, true peak ${db(tp).toFixed(2)} dBTP (${over >= 0 ? "+" : ""}${over.toFixed(2)} dB)`);
        }
    }
}

// Below the ceiling the limiter must pass audio unchanged, only delayed by the lookahead.
{
    const quiet = sine(secs(0.2), 1000, 0.5);
    const { outL, delay } = render(Proc, rate, quiet, quiet, -1, 100, false);
    let err = 0;
    for (let i = delay; i < quiet.length; i++) err = Math.max(err, Math.abs(outL[i] - quiet[i - delay]));
    const ok = err < 1e-6;
    if (!ok) failed++;
    console.log(`${ok ? "ok  " : "FAIL"} -6 dBFS sine passes untouched, delay ${delay} samples (${(delay / rate * 1000).toFixed(2)} ms), max error ${err.toExponential(1)}`);
}

// Release: after a burst, gain must climb back toward unity at the chosen speed.
{
    const a = new Float32Array(secs(2));
    for (let i = 0; i < a.length; i++) a[i] = (i < secs(0.2) ? 4 : 0.5) * Math.sin(2 * Math.PI * 300 * i / rate);
    for (const releaseMs of [25, 100, 500]) {
        const { outL } = render(Proc, rate, a, a, -1, releaseMs, true);
        const at = secs(0.2 + releaseMs * 3 / 1000) + 200;
        let peak = 0;
        for (let i = at; i < at + secs(0.01); i++) peak = Math.max(peak, Math.abs(outL[i]));
        const ok = peak > 0.5 * 0.9 && peak <= 0.5 + 1e-6;
        if (!ok) failed++;
        console.log(`${ok ? "ok  " : "FAIL"} release ${releaseMs} ms: quiet part back to ${(peak / 0.5 * 100).toFixed(1)}% three release times later`);
    }
}

{
    const proc = new Proc();
    proc.port.onmessage({ data: "stop" });
    const ok = proc.process([[]], [[new Float32Array(128), new Float32Array(128)]], { ceiling: new Float32Array([-1]), release: new Float32Array([100]) }) === false;
    if (!ok) failed++;
    console.log(`${ok ? "ok  " : "FAIL"} stop message ends processing`);
}

if (failed) {
    console.log(`${failed} check(s) failed`);
    process.exit(1);
}
console.log("all limiter checks passed");
