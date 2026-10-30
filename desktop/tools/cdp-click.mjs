// usage: node cdp-click.mjs <port> <css-selector> [hover]
// Page-level mouse events through CDP; the real cursor and desktop are untouched.
const [port, sel, hoverOnly] = process.argv.slice(2);
const page = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find(p => p.type === "page");
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise(r => ws.onopen = r);
let id = 0;
const call = (method, params) => new Promise(res => {
    const my = ++id;
    ws.addEventListener("message", function h(e) { const m = JSON.parse(e.data); if (m.id === my) { ws.removeEventListener("message", h); res(m.result); } });
    ws.send(JSON.stringify({ id: my, method, params }));
});
const r = await call("Runtime.evaluate", { expression: `(()=>{const b=document.querySelector(${JSON.stringify(sel)})?.getBoundingClientRect();return b&&[b.x+b.width/2,b.y+b.height/2]})()`, returnByValue: true });
const xy = r.result.value;
if (!xy) { console.log("not found"); process.exit(1); }
const [x, y] = xy;
await call("Input.dispatchMouseEvent", { type: "mouseMoved", x, y });
if (!hoverOnly) {
    await call("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1 });
    await call("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1 });
}
console.log("ok", Math.round(x), Math.round(y));
ws.close();
