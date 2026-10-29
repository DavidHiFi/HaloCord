// usage: node voice-probe.mjs <port> <voiceChannelId> <seconds>
// Joins the channel, records RTC states and console errors/warnings, then leaves.
const [port, channelId, secs = "20"] = process.argv.slice(2);
const page = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find(p => p.type === "page");
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise(r => ws.onopen = r);
let id = 0;
const send = (method, params = {}) => ws.send(JSON.stringify({ id: ++id, method, params }));
const logs = [];
ws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (m.method === "Runtime.consoleAPICalled" && /error|warn/.test(m.params.type))
        logs.push(`${m.params.type}: ${m.params.args.map(a => a.value ?? a.description ?? "").join(" ").slice(0, 300)}`);
    if (m.method === "Runtime.exceptionThrown") logs.push(`exception: ${m.params.exceptionDetails.exception?.description?.slice(0, 300)}`);
    if (m.method === "Log.entryAdded" && m.params.entry.level !== "verbose") logs.push(`log ${m.params.entry.level}: ${m.params.entry.text.slice(0, 300)}`);
    if (m.id === 99) console.log(JSON.stringify(m.result.result.value, null, 1));
};
send("Runtime.enable"); send("Log.enable");
const expr = `(async()=>{const r=Vencord.Webpack.findStore("RTCConnectionStore");const states=[];let last;
const t=setInterval(()=>{const s=r.getState();if(s!==last){states.push((performance.now()|0)+" "+s);last=s}},100);
Vencord.Webpack.findByProps("selectVoiceChannel").selectVoiceChannel("${channelId}");
await new Promise(x=>setTimeout(x,${Number(secs) * 1000}));clearInterval(t);
const info={states,host:r.getHostname?.(),ping:r.getAveragePing?.()};
Vencord.Webpack.findByProps("selectVoiceChannel").selectVoiceChannel(null);return info})()`;
send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true });
ws.addEventListener("message", e => {
    const m = JSON.parse(e.data);
    if (m.id === 3) { console.log(JSON.stringify(m.result.result.value, null, 1)); console.log([...new Set(logs)].slice(0, 60).join("\n")); ws.close(); }
});
