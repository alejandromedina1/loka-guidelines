// smoke36 — AI Patterns / By capability, and the demo look the previews took on.
//
// The capability view is a port of reference/ai-ui-patterns.html, and the
// promise made for it was narrow: the structure word for word, the demos
// exactly as they were, and only the copy moved to the house voice. Each of
// those can drift silently — a pair link retyped, a demo's markup "tidied", a
// class renamed in the CSS but not in the string that uses it — and none of it
// shows in the build. So this reads the source file itself and compares.
//
// It also holds the colour pairs the restyle introduced. smoke25 checks the
// pairs that existed before it; the violet, the stage and the demos' own tokens
// are new, and "any colour pair on text is AA at its rendered size" applies to
// them the same way. Values are parsed out of global.css, so editing a token is
// what fails, not restating a number here.
//
// What this can't see is behaviour over time — a demo's timing, a click, a
// replay. renderToString runs no effects and the demos are nothing but effects.
// That was checked in jsdom against the source's own D object, demo by demo;
// see the hub's CLAUDE.md for how to rerun it.
import fs from "node:fs";
import { AI_CAPABILITIES, AI_UI_PATTERNS, patternsFor } from "./src/data/aiCapabilities.js";
import { AI_PATTERNS } from "./src/data/aiPatterns.js";
import { DEMOS } from "./src/components/ai/demos/demos.js";
import { renderToString } from "react-dom/server";
import { PatternDetail } from "./src/components/ai/PatternDetail.jsx";
import { AI_CAPABILITY_BY_ID, uiName, AI_UI_PATTERN_BY_ID } from "./src/data/aiCapabilities.js";

let fails = 0;
const ok = (n, c, d = "") => { if (!c) fails++; console.log(`${c ? "  ok  " : "FAIL  "}${n}${d ? ` — ${d}` : ""}`); };

const src = fs.readFileSync("./reference/ai-ui-patterns.html", "utf8");
const css = fs.readFileSync("./src/styles/global.css", "utf8").replace(/\/\*[^]*?\*\//g, "");
const SRC_CAPS = new Function(src.slice(src.indexOf("const CAPS = ["), src.indexOf("/* ---------- Patterns")) + "; return CAPS;")();
const SRC_P = new Function(src.slice(src.indexOf("const P = ["), src.indexOf("const byId")) + "; return P;")();

// ── 1. The structure is the source's ────────────────────────────────────
console.log("\nStructure: ids, surfaces, layers, capabilities and pairs are the source's");
ok("12 capabilities, same ids, same order", AI_CAPABILITIES.map((c) => c.id).join() === SRC_CAPS.map((c) => c.id).join());
ok("26 patterns, same ids, same order", AI_UI_PATTERNS.map((p) => p.id).join() === SRC_P.map((p) => p.id).join());
const drift = SRC_P.filter((s) => {
  const p = AI_UI_PATTERNS.find((x) => x.id === s.id);
  return !p || p.s !== s.s || p.layer !== s.layer || p.caps.join() !== s.caps.join() || p.pairs.join() !== s.pairs.join();
});
ok("surface, layer, caps and pairs unchanged on every pattern", !drift.length, drift.map((p) => p.id).join(", "));
ok("every source name kept as `was`", SRC_P.every((s) => AI_UI_PATTERNS.find((p) => p.id === s.id)?.was === s.name));
// Every count the rail and the grid can show, against the source's own filter.
const fits = (p, s) => s === "all" || p.s === s || p.s === "both";
const bad = [];
for (const cap of ["all", ...SRC_CAPS.map((c) => c.id)])
  for (const s of ["all", "chat", "embedded"])
    for (const layer of ["core", "trust"]) {
      const want = SRC_P.filter((p) => (cap === "all" || p.caps.includes(cap)) && fits(p, s) && p.layer === layer).length;
      if (patternsFor(cap, s).filter((p) => p.layer === layer).length !== want) bad.push(`${cap}/${s}/${layer}`);
    }
ok("all 78 capability × surface × layer counts match the source", !bad.length, bad.join(", "));
const shelfIds = new Set(AI_PATTERNS.map((p) => p.id));
const deadShelf = AI_UI_PATTERNS.flatMap((p) =>
  [p.merged, ...(p.related ?? [])].filter((id) => id && !shelfIds.has(id)).map((id) => `${p.id}→${id}`));
ok("every merged / related shelf link resolves", !deadShelf.length, deadShelf.join(", "));

// ── 1b. The merge ───────────────────────────────────────────────────────
// Twelve are the same pattern as a shelf entry and were merged into it: one
// page, the shelf's. A merged entry keeps no copy of its own — a name, use or
// avoid beside the shelf's would be the two-sources drift the merge removed.
console.log("\nMerge: twelve entries are shelf patterns, and keep nothing that competes");
const merged = AI_UI_PATTERNS.filter((p) => p.merged);
ok("12 merged", merged.length === 12, merged.length);
ok("…each into a different shelf pattern", new Set(merged.map((p) => p.merged)).size === merged.length);
ok("…carrying no name, use or avoid of their own", merged.every((p) => !p.name && !p.use && !p.avoid),
  merged.filter((p) => p.name || p.use || p.avoid).map((p) => p.id).join(", "));
ok("…and never `related` to the pattern they are", merged.every((p) => !(p.related ?? []).includes(p.merged)));
const own = AI_UI_PATTERNS.filter((p) => !p.merged);
ok("the 14 unmerged keep a name, use and avoid", own.length === 14 && own.every((p) => p.name && p.use && p.avoid));
// Where the merged entry's place in this view went: one sentence on the shelf
// page's closing line, every capability and pair named in it.
const text = (h) => h.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&#x27;/g, "'");
const silent = merged.filter((m) => {
  const shelf = AI_PATTERNS.find((p) => p.id === m.merged);
  const t = text(renderToString(<PatternDetail pattern={shelf} onSelectComponent={() => {}} onSelectAiPattern={() => {}} />));
  return !/Serves /.test(t) || !m.caps.every((c) => t.includes(AI_CAPABILITY_BY_ID.get(c).name))
    || !m.pairs.every((id) => t.includes(uiName(AI_UI_PATTERN_BY_ID.get(id))));
});
ok("each merged shelf page says what it serves and pairs with", !silent.length, silent.map((p) => p.merged).join(", "));

// ── 2. The copy is the house's ──────────────────────────────────────────
// The same mechanical half smoke26 enforces on the shelf: ≤18 characters, Title
// Case with small words lowercase, no banned word — and here, no name the shelf
// already uses, since both lists render into one sidebar.
console.log("\nNames: house rules, and none shared with the Patterns shelf");
const SMALL = new Set(["a", "an", "and", "as", "at", "by", "for", "in", "of", "on", "or", "the", "to", "with"]);
const BANNED = /\b(streaming|response|inline|output|token|latency|payload)\b/i;
const shelfNames = new Set(AI_PATTERNS.map((p) => p.name));
const nameBad = own.filter((p) => {
  const words = p.name.split(/[\s-]+/);
  const titled = words.every((w, i) => (i > 0 && SMALL.has(w)) || /^[A-Z&"]/.test(w));
  return p.name.length > 18 || !titled || BANNED.test(p.name) || shelfNames.has(p.name);
});
ok("14 own names: ≤18 chars, Title Case, no banned word, not a shelf name", !nameBad.length, nameBad.map((p) => p.name).join(", "));
ok("names unique", new Set(own.map((p) => p.name)).size === own.length);
const US = /\b(summariz|recogniz|organiz|behavior|color|center)/i;
const usLeft = [...own.flatMap((p) => [p.name, p.use, p.avoid]), ...AI_CAPABILITIES.flatMap((c) => [c.name, c.desc, c.ex])].filter((t) => US.test(t));
ok("no US spelling in the data", !usLeft.length, usLeft.join(" | "));
const demoText = Object.values(DEMOS).map((d) => d.html).join(" ").replace(/<[^>]+>/g, " ");
ok("no US spelling in the demos", !US.test(demoText));
ok("no first-person product voice in the demos", !/\bI can\b|\bI'm\b|What can I\b/.test(demoText));
ok("no frame labelled Assistant", !/Assistant/.test(demoText));

// ── 3. The demos are the source's ───────────────────────────────────────
// Static half of the parity check: the same 26 entries, each marked up exactly
// as in the source once the deliberate edits — listed in demos.js's header —
// are undone. A demo restyled or "simplified" in place fails here.
console.log("\nDemos: markup identical to the source, edits aside");
const dText = src.slice(src.indexOf("const D = {"), src.indexOf("/* ---------- Rendering"));
const noop = () => {};
const SRC_D = new Function("$", "$$", "wait", "type", "RM", "document", dText + "; return D;")(noop, noop, noop, noop, false, {});
ok("26 demos, same ids, same order", Object.keys(DEMOS).join() === Object.keys(SRC_D).join());
const UNDO = [
  ["var(--surface)", "#fff"], ["var(--sk-2)", "#cfcfd6"], ["color:var(--on-ink)", "color:#fff"],
  ["color:var(--ai-on-ink)", "color:#b9a8ff"], ["background:#d6d0dc;color:#1d1d1f;", "background:#d6d0dc;"],
  ["Summarise this week", "Summarize this week"], ["4 Mar 2026", "Mar 4, 2026"], ["Using Q3 plan", "Assistant · using Q3 plan"],
  ["What would you like to do?", "What can I help with?"], [">3 Mar?<", ">Mar 3?<"], ["dm-pulse", "pulse"],
];
const undo = (h) => {
  h = h.replace(/class="([^"]*)"/g, (_, l) => `class="${l.replace(/\bdm-/g, "")}"`);
  for (const [a, b] of UNDO) h = h.split(a).join(b);
  return h;
};
const differs = Object.keys(SRC_D).filter((id) =>
  undo(DEMOS[id].html) !== SRC_D[id].html.replace(/\n\s*<style>@keyframes pulse[^<]*<\/style>/, ""));
ok("every demo's markup matches the source", !differs.length, differs.join(", "));
ok("every demo keeps its init / run / try", Object.keys(SRC_D).every((id) =>
  ["init", "run", "try"].every((k) => !!DEMOS[id][k] === !!SRC_D[id][k])));
// Every class token in the demos carries the prefix — one unprefixed class is
// one the house's global rules can reach.
const unprefixed = new Set();
for (const d of Object.values(DEMOS))
  for (const m of d.html.matchAll(/class="([^"]*)"/g))
    for (const t of m[1].split(/\s+/)) if (t && !t.startsWith("dm-") && !t.includes("${")) unprefixed.add(t);
ok("every demo class is dm- prefixed", !unprefixed.size, [...unprefixed].join(", "));
// Every class the source's demo vocabulary styled has its scoped twin.
const vocab = src.slice(src.indexOf("/* Demo vocabulary */"), src.indexOf("</style>"));
const styled = new Set([...vocab.matchAll(/\.([a-z][\w-]*)/g)].map((m) => m[1]));
const unported = [...styled].filter((c) => !new RegExp(`\\.ai-demo [^{]*\\.dm-${c}(?![\\w-])`).test(css));
ok(`all ${styled.size} classes the source styled are ported under .ai-demo`, !unported.length, unported.join(", "));

// ── 4. Colour: every new text pair is AA ────────────────────────────────
console.log("\nAA, both themes, parsed from global.css");
// A rule's custom properties, by its exact selector — `.app {` is written with
// a space and the scoped blocks without, so the brace is matched loosely.
const block = (sel) => {
  const m = new RegExp(`(?:^|\\})\\s*${sel.replace(/[.[\]"=]/g, "\\$&")}\\s*\\{([^}]*)\\}`, "m").exec(css);
  if (!m) throw new Error(`no rule for ${sel}`);
  const b = m[1];
  return Object.fromEntries([...b.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
};
const THEMES = {
  light: { ...block(".app"), ...block(".ai-demo") },
  dark: { ...block(".app"), ...block('.app[data-theme="dark"]'), ...block(".ai-demo"), ...block('.app[data-theme="dark"] .ai-demo') },
};
const rgb = (h) => { h = h.replace("#", ""); if (h.length === 3) h = [...h].map((c) => c + c).join(""); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); };
const lum = (c) => { const [r, g, b] = c.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
// The demos' pairs resolve inside .ai-demo; the previews' resolve on the page,
// where --ink, --line and --bg are the house's. Two scopes, so two lists.
const page = (th) => ({ ...THEMES[th], ...(th === "light" ? block(".app") : { ...block(".app"), ...block('.app[data-theme="dark"]') }) });
const DEMO_PAIRS = [
  ["ink", "stage"], ["ink", "surface"], ["ink", "ai-tint"], ["ink", "hl"], ["muted", "stage"], ["muted", "surface"],
  ["muted", "ai-tint"], ["on-ink", "ink"], ["ai-on-ink", "ink"], ["ok", "surface"], ["warn", "warn-tint"],
  ["bad", "surface"], ["ph", "surface"],
];
const PREVIEW_PAIRS = [
  ["ink", "ai-tint", "citation marker, AI diff line, proposed canvas layer"], ["bg", "ai", "open citation marker"],
  ["ai", "bg", "Typing Ahead's suggestion, relevance score"], ["success", "success-soft", "done callout title"],
  ["danger-text", "bg", "struck-through diff line"], ["ink-3", "stage", "labels on the grey stage"],
];
// The source's own light values, kept on request rather than fixed: the brief
// was its tokens unchanged unless a house token matched exactly. Listed, so a
// new failure still fails and one of these being fixed does too — then take it
// off. The demos' 55% ghost suggestion is drawn by opacity and isn't a token
// pair at all; it is faint on purpose and noted in the hub's CLAUDE.md.
const KNOWN = new Set(["light muted/ai-tint", "light ok/surface", "light ph/surface"]);
for (const th of ["light", "dark"]) {
  for (const [f, b] of DEMO_PAIRS) {
    const r = ratio(rgb(THEMES[th][f]), rgb(THEMES[th][b]));
    const key = `${th} ${f}/${b}`;
    if (KNOWN.has(key))
      ok(`${key} — source value, known under`, r < 4.5, r < 4.5 ? `${r.toFixed(2)}:1` : "passes now: take it off KNOWN");
    else ok(`demo ${key}`, r >= 4.5, `${r.toFixed(2)}:1`);
  }
  for (const [f, b, where] of PREVIEW_PAIRS) {
    const t = page(th);
    const r = ratio(rgb(t[f]), rgb(t[b]));
    ok(`preview ${th} --${f} on --${b} (${where})`, r >= 4.5, `${r.toFixed(2)}:1`);
  }
}

// ── 5. Nothing declared twice ───────────────────────────────────────────
// The CLAUDE.md check the others are blind to, over the rules this pass added.
const cascade = css.replace(/@keyframes[^{]*\{(?:[^{}]|\{[^{}]*\})*\}/g, "");
const seen = new Map();
const dup = [];
for (const m of cascade.matchAll(/([^{}@]+)\{([^{}]*)\}/g)) {
  const sel = m[1].trim(), body = m[2].replace(/\s+/g, "");
  if (!/\.(ai-demo|dm-|ai-cap-)|data-live/.test(sel)) continue;
  if (seen.get(sel) === body) dup.push(sel);
  seen.set(sel, body);
}
ok("no new selector declared twice with an identical body", !dup.length, dup.join(", "));

console.log(fails ? `\n${fails} failing` : "\nall passed");
process.exit(fails ? 1 : 0);
