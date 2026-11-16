// drive headless chromium over CDP: node cdp.mjs <chromium> <layout...> → JSON lines
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const [bin, ...layouts] = process.argv.slice(2);
const dir = mkdtempSync(join(tmpdir(), "whs-"));
const here = dirname(fileURLToPath(import.meta.url));
const proc = spawn(bin, ["--headless", "--no-sandbox", "--remote-debugging-port=0", `--user-data-dir=${dir}`,
  "--window-size=1400,900", "about:blank"], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const portFile = join(dir, "DevToolsActivePort");
while (!existsSync(portFile) || !readFileSync(portFile, "utf8").includes("\n")) await sleep(100);
const port = readFileSync(portFile, "utf8").split("\n")[0];
const target = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((t) => t.type === "page");
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0; const pending = new Map();
ws.onmessage = (m) => { const d = JSON.parse(m.data); pending.get(d.id)?.(d); pending.delete(d.id); };
const send = (method, params = {}) => new Promise((r) => { pending.set(++id, r); ws.send(JSON.stringify({ id, method, params })); });

// PAGE=robust.html → pass/fail checks; layout "name@517" sets viewport width
const page = process.env.PAGE ?? "mock.html";
let failed = 0;
for (const spec of layouts) {
  const [l, width] = spec.split("@");
  await send("Emulation.setDeviceMetricsOverride", { width: +(width ?? 1400), height: 900, deviceScaleFactor: 1, mobile: false });
  await send("Page.navigate", { url: `file://${here}/${page}?l=${l}` });
  await sleep(500);
  const res = await send("Runtime.evaluate", { expression: "window.__result", awaitPromise: true, returnByValue: true });
  const val = res.result?.result?.value;
  if (val?.checks) {
    for (const [k, ok] of Object.entries(val.checks)) { console.log(ok ? "PASS" : "FAIL", spec, k); failed += !ok; }
    console.log("    ", spec, JSON.stringify(val.data));
    continue;
  }
  console.log(l, JSON.stringify(val ?? res.result?.exceptionDetails ?? res));
  if (process.env.SHOTS) { // shown + hidden screenshots of the header corner
    const { writeFileSync, mkdirSync } = await import("node:fs");
    mkdirSync(process.env.SHOTS, { recursive: true });
    const clip = { x: 0, y: 0, width: 700, height: 80, scale: 2 };
    for (const state of ["shown", "hidden"]) {
      if (state === "hidden") { await send("Runtime.evaluate", { expression: "document.getElementById('whs-btn').click()" }); await sleep(200); }
      const shot = await send("Page.captureScreenshot", { clip });
      writeFileSync(join(process.env.SHOTS, `${l}-${state}.png`), Buffer.from(shot.result.data, "base64"));
    }
  }
}
ws.close(); proc.kill();
process.exitCode = failed ? 1 : 0;
