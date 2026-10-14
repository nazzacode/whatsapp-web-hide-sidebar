// WhatsApp Web: Hide Sidebar. Button in chat header (+ Alt+Shift+S) toggles chat list + nav rail.
const KEY = "whs-hidden";
const root = document.documentElement;

const load = () => { try { return localStorage.getItem(KEY) === "1"; } catch { return false; } };
const save = (v) => { try { localStorage.setItem(KEY, v ? "1" : "0"); } catch {} };

const ancestors = (el) => {
  const out = [];
  for (let n = el; n && n !== document.body; n = n.parentElement) out.push(n);
  return out;
};
const childOf = (parent, chain) => chain.find((n) => n.parentElement === parent);

// layout: fork = lowest common ancestor of #side/#main; hide only #side's column (+ rail), never drawers/modals
const findLayout = () => {
  const side = document.getElementById("side");
  const main = document.getElementById("main");
  if (!side || !main) return null; // no open chat → never blank the screen
  const sideUp = ancestors(side), mainUp = ancestors(main);
  const fork = sideUp.find((n) => mainUp.includes(n));
  if (!fork) return null;
  const sideCol = childOf(fork, sideUp), mainCol = childOf(fork, mainUp);
  // rail: narrow, tall sibling of #main's column or its ancestors (already hidden = 0px → keep its tag)
  const isRail = (s) => {
    if (s.hasAttribute("data-whs-hide")) return true;
    const r = s.getBoundingClientRect();
    return r.width > 0 && r.width < 100 && r.height > innerHeight * 0.8;
  };
  const rails = mainUp.slice(mainUp.indexOf(mainCol))
    .flatMap((n) => [...(n.parentElement?.children ?? [])].filter((s) => s !== n && isRail(s)));
  return { main, fork, mainCol, hide: [sideCol, ...rails] };
};

const sync = (attr, nodes) => {
  const set = new Set(nodes);
  document.querySelectorAll(`[${attr}]`).forEach((n) => set.has(n) || n.removeAttribute(attr));
  set.forEach((n) => n.setAttribute(attr, ""));
};

// --- button (fixed overlay outside #app: React never sees it) ---
const SVG = "http://www.w3.org/2000/svg";
const svgEl = (tag, attrs) => {
  const e = document.createElementNS(SVG, tag);
  Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
  return e;
};
const icon = svgEl("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" });
icon.append(svgEl("rect", { x: "3", y: "4", width: "18", height: "16", rx: "2" }), svgEl("path", { d: "M9 4v16" }));
const fill = svgEl("path", { d: "M6 8h0M6 11h0M6 14h0", "stroke-width": "2.5" }); // list dots in panel = sidebar shown
icon.append(fill);

const btn = document.createElement("button");
btn.id = "whs-btn";
btn.type = "button";
btn.append(icon);

let hidden = load();

const label = () => {
  const t = hidden ? "Show sidebar (Alt+Shift+S)" : "Hide sidebar (Alt+Shift+S)";
  btn.title = t;
  btn.setAttribute("aria-label", t);
  btn.setAttribute("aria-pressed", String(hidden));
  fill.style.display = hidden ? "none" : "";
};

const place = (layout) => {
  const header = layout?.main.querySelector("header");
  if (!header) return btn.classList.remove("whs-on");
  const r = header.getBoundingClientRect();
  if (!r.width) return btn.classList.remove("whs-on");
  btn.style.left = `${r.left + 8}px`;
  btn.style.top = `${r.top + (r.height - 40) / 2}px`;
  const ref = header.querySelector("[data-icon], span[aria-hidden] svg, svg");
  if (ref) btn.style.color = getComputedStyle(ref).color;
  btn.classList.add("whs-on");
};

// grid parents keep #main in its old track; detect and fall back to flex
const reflowCheck = (layout) => {
  if (!hidden || !layout || layout.fork.hasAttribute("data-whs-flex")) return;
  const f = layout.fork.getBoundingClientRect(), m = layout.mainCol.getBoundingClientRect();
  const others = [...layout.fork.children]
    .filter((c) => c !== layout.mainCol && !c.hasAttribute("data-whs-hide"))
    .reduce((w, c) => w + c.getBoundingClientRect().width, 0);
  if (getComputedStyle(layout.fork).display === "grid" && m.width + others < f.width - 4)
    layout.fork.setAttribute("data-whs-flex", "");
};

const update = () => {
  const layout = findLayout();
  sync("data-whs-hide", layout?.hide ?? []);
  sync("data-whs-main", layout ? [layout.mainCol] : []);
  if (!layout) sync("data-whs-flex", []);
  root.classList.toggle("whs-hidden", hidden && !!layout);
  reflowCheck(layout);
  place(layout);
  label();
};

let queued = false;
const schedule = () => {
  if (queued) return;
  queued = true;
  requestAnimationFrame(() => { queued = false; obs.disconnect(); update(); watch(); });
};
const obs = new MutationObserver(schedule);
const watch = () => obs.observe(document.body, { childList: true, subtree: true });

const toggle = () => { hidden = !hidden; save(hidden); update(); };

btn.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); toggle(); });
addEventListener("keydown", (e) => {
  if (e.altKey && e.shiftKey && !e.ctrlKey && !e.metaKey && e.code === "KeyS") {
    e.preventDefault(); e.stopPropagation(); toggle();
  }
}, true);
addEventListener("resize", schedule, { passive: true });

document.body.append(btn);
update();
watch();
