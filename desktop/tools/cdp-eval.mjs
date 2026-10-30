// usage: node cdp-eval.mjs <port> <js-expression>
const [port, expr] = process.argv.slice(2);
const pages = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const page = pages.find(p => p.type === "page");
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise(r => ws.onopen = r);
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id === 1) { console.log(JSON.stringify(m.result.result.value ?? m.result, null, 1)); ws.close(); } };
