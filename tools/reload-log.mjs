// usage: node reload-log.mjs <port> <seconds>  — reloads the page and prints unique console errors/warnings
const [port, secs = "25"] = process.argv.slice(2);
const page = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find(p => p.type === "page");
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise(r => ws.onopen = r);
let id = 0; const logs = [];
const send = (method, params = {}) => ws.send(JSON.stringify({ id: ++id, method, params }));
ws.onmessage = e => { const m = JSON.parse(e.data);
  if (m.method === "Runtime.consoleAPICalled" && /error|warn/.test(m.params.type)) logs.push(`${m.params.type}: ${m.params.args.map(a => a.value ?? a.description ?? "").join(" ").slice(0, 1200)}`);
  if (m.method === "Runtime.exceptionThrown") logs.push(`exception: ${(m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text).slice(0, 1200)}`);
  if (m.method === "Log.entryAdded" && m.params.entry.level !== "verbose") logs.push(`log ${m.params.entry.level}: ${m.params.entry.text.slice(0, 1200)} ${m.params.entry.url ?? ""}`.slice(0, 300)); };
send("Runtime.enable"); send("Log.enable"); send("Page.reload");
await new Promise(r => setTimeout(r, Number(secs) * 1000));
const counts = {}; for (const l of logs) counts[l] = (counts[l] || 0) + 1;
for (const [l, n] of Object.entries(counts)) console.log(`${n}x ${l.replace(/\n/g, " ")}`);
ws.close(); process.exit(0);
