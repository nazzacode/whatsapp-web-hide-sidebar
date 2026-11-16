// drive headless firefox over WebDriver BiDi: node bidi.mjs <firefox> <layout[@width]...> → PASS/FAIL lines (PAGE=robust.html default)
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, existsSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const [bin, ...layouts] = process.argv.slice(2);
const dir = mkdtempSync(join(tmpdir(), "whs-fx-"));
const here = dirname(fileURLToPath(import.meta.url));
writeFileSync(join(dir, "user.js"), 'user_pref("browser.shell.checkDefaultBrowser", false);\n');
const { LD_LIBRARY_PATH, ...env } = process.env; // an inherited lib path (Electron parent) breaks nix firefox's NSS
const proc = spawn(bin, ["--headless", "--no-remote", "--remote-debugging-port=0", "--profile", dir, "about:blank"], { stdio: "ignore", env });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const portFile = join(dir, "WebDriverBiDiServer.json");
for (let i = 0; !existsSync(portFile); i++) { if (i > 300) { proc.kill(); throw new Error("firefox BiDi port never appeared"); } await sleep(100); }
const { ws_port } = JSON.parse(readFileSync(portFile, "utf8"));
const ws = new WebSocket(`ws://127.0.0.1:${ws_port}/session`);
await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
let id = 0; const pending = new Map();
ws.onmessage = (m) => { const d = JSON.parse(m.data); pending.get(d.id)?.(d); pending.delete(d.id); };
const send = (method, params = {}) => new Promise((r) => { pending.set(++id, r); ws.send(JSON.stringify({ id, method, params })); });

const ses = await send("session.new", { capabilities: {} });
console.log("firefox", ses.result?.capabilities?.browserVersion ?? JSON.stringify(ses));
const context = (await send("browsingContext.getTree")).result.contexts[0].context;
const page = process.env.PAGE ?? "robust.html";
let failed = 0;
for (const spec of layouts) {
  const [l, width] = spec.split("@");
  await send("browsingContext.setViewport", { context, viewport: { width: +(width ?? 1400), height: 900 } });
  await send("browsingContext.navigate", { context, url: `file://${here}/${page}?l=${l}`, wait: "complete" });
  await sleep(300);
  const res = await send("script.evaluate", { expression: "window.__result.then(JSON.stringify)", target: { context }, awaitPromise: true });
  const raw = res.result?.result?.value;
  const val = raw ? JSON.parse(raw) : null;
  if (!val?.checks) { console.log(spec, raw ?? JSON.stringify(res)); failed += !val; continue; }
  for (const [k, ok] of Object.entries(val.checks)) { console.log(ok ? "PASS" : "FAIL", spec, k); failed += !ok; }
  console.log("    ", spec, JSON.stringify(val.data));
}
send("browser.close"); await sleep(500); ws.close(); proc.kill();
process.exit(failed ? 1 : 0);
