// WA Focus: hide chat list + nav rail; Alt+Shift+S toggles, mouse at left edge peeks.
const KEY = "waf-hide";
const root = document.documentElement;
const EDGE = 6;

const load = () => { try { return localStorage.getItem(KEY) !== "0"; } catch { return true; } };
const save = (on) => { try { localStorage.setItem(KEY, on ? "1" : "0"); } catch {} };

const ancestors = (el) => {
  const out = [];
  for (let n = el; n && n !== document.body; n = n.parentElement) out.push(n);
  return out;
};

// tag: siblings of #main's column at the #side/#main fork, plus thin full-height rails above it
const tag = () => {
  const side = document.getElementById("side");
  const main = document.getElementById("main");
  const hide = new Set(), keep = new Set();
  const up = main ? ancestors(main) : [];
  const fork = side && ancestors(side).find((n) => up.includes(n));
  if (fork) { // no open chat → nothing tagged, never blank the screen
    const col = up[up.indexOf(fork) - 1];
    if (col) keep.add(col);
    [...fork.children].filter((c) => c !== col).forEach((c) => hide.add(c));
    // nav rail: narrow, tall sibling of fork or its parents (already-tagged = hidden = 0px, keep it)
    const rail = (s) => {
      if (s.hasAttribute("data-waf-hide")) return true;
      const r = s.getBoundingClientRect();
      return r.width > 0 && r.width < 100 && r.height > innerHeight * 0.8;
    };
    up.slice(up.indexOf(fork)).forEach((n) =>
      [...(n.parentElement?.children ?? [])].filter((s) => s !== n && rail(s)).forEach((s) => hide.add(s))
    );
  }
  const sync = (attr, set) => {
    document.querySelectorAll(`[${attr}]`).forEach((n) => set.has(n) || n.removeAttribute(attr));
    set.forEach((n) => n.setAttribute(attr, ""));
  };
  sync("data-waf-hide", hide);
  sync("data-waf-main", keep);
};

const render = (on) => root.classList.toggle("waf-hide", on);

let on = load();
let queued = false;
const retag = () => {
  if (queued) return;
  queued = true;
  requestAnimationFrame(() => { queued = false; obs.disconnect(); tag(); watch(); });
};
const obs = new MutationObserver(retag);
const watch = () => obs.observe(document.body, { childList: true, subtree: true });

addEventListener("keydown", (e) => {
  if (e.altKey && e.shiftKey && e.code === "KeyS") {
    e.preventDefault(); e.stopPropagation();
    on = !on; save(on); render(on);
  }
}, true);

// peek while mouse is at left edge or over the revealed sidebar
addEventListener("mousemove", (e) => {
  if (!on) return;
  const over = e.target instanceof Element && e.target.closest("[data-waf-hide]");
  const peek = e.clientX <= EDGE || (root.classList.contains("waf-peek") && over);
  root.classList.toggle("waf-peek", !!peek);
}, { passive: true });
document.addEventListener("mouseleave", () => root.classList.remove("waf-peek"));

render(on); tag(); watch();
