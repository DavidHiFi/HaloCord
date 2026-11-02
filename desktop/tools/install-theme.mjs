// usage: node install-theme.mjs <port> <theme.css>
// Uploads the owner's theme into MochaCord's web theme store and enables it. QuickCSS stays the user's own.
import { readFileSync } from "fs";
import { basename } from "path";
const [port, themePath] = process.argv.slice(2);
const name = basename(themePath);
const expr = `(async()=>{
  await VencordNative.themes.uploadTheme(${JSON.stringify(name)}, ${JSON.stringify(readFileSync(themePath, "utf8"))});
  Vencord.Settings.enabledThemes = [${JSON.stringify(name)}];
  const l = await VencordNative.themes.getThemesList();
  return JSON.stringify({ themes: l.map(t => t.fileName + " " + t.name + " " + t.version), enabled: Vencord.Settings.enabledThemes });
})()`;
const pages = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const ws = new WebSocket(pages.find(p => p.type === "page").webSocketDebuggerUrl);
await new Promise(r => ws.onopen = r);
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id === 1) { console.log(JSON.stringify(m.result.result.value ?? m.result)); ws.close(); } };
