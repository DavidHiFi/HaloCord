import { writeFileSync } from "fs";
const [port, out] = process.argv.slice(2);
const page = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find(p => p.type === "page");
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise(r => ws.onopen = r);
ws.send(JSON.stringify({ id: 1, method: "Page.captureScreenshot", params: { format: "png" } }));
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id === 1) { writeFileSync(out, Buffer.from(m.result.data, "base64")); ws.close(); } };
