import { readFileSync } from "fs";
const s = readFileSync(process.argv[2], "utf8");
JSON.parse(s);
const expr = `(async()=>{await VencordNative.settings.set(JSON.parse(${JSON.stringify(s)}));const back=await VencordNative.settings.get();return Object.values(back.plugins).filter(p=>p&&p.enabled).length})()`;
process.argv = [process.argv[0], "x", "9335", expr];
await import("./cdp-eval.mjs");
