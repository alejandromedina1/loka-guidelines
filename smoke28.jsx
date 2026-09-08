// smoke28 — the two standing CSS checks, plus the duplication one, run over the
// whole AI hub after a pass that touched the track, the step meter, the
// confidence band and the diff rows.
//
// The build passes while all three of these are broken, which is the only
// reason they exist.
import { renderToString } from "react-dom/server";
import fs from "node:fs";
import { AI_PATTERNS } from "./src/data/aiPatterns.js";
import { PATTERN_PREVIEWS } from "./src/components/ai/previews/index.js";
import { PatternDetail } from "./src/components/ai/PatternDetail.jsx";
import { AiPrinciplesSection } from "./src/components/sections/AiPrinciplesSection.jsx";
import { AiAntipatternsSection } from "./src/components/sections/AiAntipatternsSection.jsx";

let fails = 0;
const ok = (n, c, d = "") => { if (!c) fails++; console.log(`${c ? "  ok  " : "FAIL  "}${n}${d ? ` — ${d}` : ""}`); };

const rawCss = fs.readFileSync("./src/styles/global.css", "utf8");
// Comments out before any selector parsing — this file comments heavily, and a
// commented-out declaration reads as a duplicate selector otherwise.
const css = rawCss.replace(/\/\*[^]*?\*\//g, "");
// Keyframe steps are not selectors: "to { transform: rotate(360deg) }" appears
// in two different spinners with the same body and neither is a duplicate.
const cascade = css.replace(/@keyframes[^{]*\{(?:[^{}]|\{[^{}]*\})*\}/g, "");

// Render every pattern in every state through the real page shell, plus both
// of the other two views. All three, because the hub's rules live in one
// stylesheet: leaving Principles and Anti-patterns out doesn't relax the
// orphan check, it just makes it report their classes as dead.
//
// Planned patterns are included on purpose — they render the empty state, and
// that is the only thing that draws it.
const html = [
  ...AI_PATTERNS.flatMap((p) => {
    const shell = renderToString(
      <PatternDetail pattern={p} onSelectComponent={() => {}} onSelectAiPattern={() => {}} />);
    const P = PATTERN_PREVIEWS[p.id];
    return [shell, ...(p.states ?? []).map((st) => (P ? renderToString(<P state={st.id} />) : ""))];
  }),
  renderToString(<AiPrinciplesSection registerRef={() => {}} onSelectAiPattern={() => {}} />),
  renderToString(<AiAntipatternsSection registerRef={() => {}} />),
].join("");

// ── 1. Every class the hub renders has a rule ───────────────────────────
console.log("\nEvery ai-* / mk-* class rendered by the hub resolves to a rule");
const used = new Set();
for (const m of html.matchAll(/class="([^"]+)"/g))
  for (const c of m[1].split(/\s+/)) if (/^(ai|mk)-/.test(c)) used.add(c);
const unstyled = [...used].filter((c) => !new RegExp(`\\.${c}(?![\\w-])`).test(css));
ok(`${used.size} classes used, all styled`, unstyled.length === 0, unstyled.join(", "));

// ── 2. Every rule has something that renders it ─────────────────────────
console.log("\nNo ai-* / mk-* rule is defined without a referent");
const declared = new Set();
for (const m of css.matchAll(/\.((?:ai|mk)-[\w-]+)/g)) declared.add(m[1]);
const orphans = [...declared].filter((c) => !used.has(c));
ok(`${declared.size} classes styled, all rendered`, orphans.length === 0, orphans.join(", "));

// ── 3. No selector declared twice with an identical body ────────────────
// Blind to both checks above: a re-inserted "restored" block reads as correct
// to each of them, and the later copy silently wins the cascade.
console.log("\nNo selector is declared twice with an identical body");
const seen = new Map();
const dupes = [];
for (const m of cascade.matchAll(/([^{}@\/][^{}]*)\{([^{}]*)\}/g)) {
  const sel = m[1].trim().replace(/\s+/g, " ");
  const body = m[2].trim().replace(/\s+/g, " ");
  if (!sel || sel.startsWith("@") || !body) continue;
  const key = `${sel}||${body}`;
  if (seen.has(key)) dupes.push(sel);
  else seen.set(key, true);
}
ok(`${seen.size} distinct declarations, no exact duplicates`, dupes.length === 0,
  [...new Set(dupes)].slice(0, 6).join(" / "));

// ── The canvas foot is operable ─────────────────────────────────────────
// Three controls sit in this foot and none of them had a focus style, a named
// group, or a target that cleared 24x24. A wireframe hub is read by designers
// on laptops and by people using a keyboard, and the state control is the only
// thing on the page that does anything.
console.log("\nThe canvas foot's controls are named, focusable and big enough");
{
  const foot = html.slice(html.indexOf('class="ai-track"'));
  // Every button in the track carries a name — text or aria-label. An
  // unlabelled 4px bar is unreachable by anything but a mouse.
  // A name is an aria-label or any text anywhere inside the button — Play
  // keeps its label in a <span> after an <svg>, so only reading the first
  // text node reported it as nameless.
  const nameless = [...html.matchAll(/<button([^>]*class="ai-(?:track|play)[^"]*"[^>]*)>(.*?)<\/button>/gs)]
    .filter((m) => !/aria-label="/.test(m[1]) && !m[2].replace(/<[^>]*>/g, "").trim());
  ok("every track control has an accessible name", nameless.length === 0, `${nameless.length} without`);
  // A group without a name is a group a screen reader can't announce.
  const groups = [...html.matchAll(/role="group"([^>]*)>/g)];
  const unnamed = groups.filter((m) => !/aria-label="/.test(m[1]));
  ok(`${groups.length} groups in the hub, all named`, unnamed.length === 0);
  // Selection is never colour alone.
  ok("the chosen alternative is marked in the markup, not only in paint",
    /class="ai-track-alt"[^>]*aria-current="true"/.test(html));
  ok("the current step is marked too", /class="ai-track-seg"[^>]*aria-current="step"/.test(html));
  void foot;
}
// Focus, and pointer target size, read out of the stylesheet.
for (const sel of ["ai-track-seg", "ai-track-alt", "ai-play"])
  ok(`.${sel} has a focus-visible style`,
    new RegExp(`\\.${sel}:focus-visible`).test(css));
for (const [sel, prop] of [["ai-track-seg", "height"], ["ai-track-alt", "min-height"]]) {
  const rule = css.match(new RegExp(`\\.${sel}\\{([^}]*)\\}`));
  const px = rule && Number((rule[1].match(new RegExp(`(?:^|;|\\s)${prop}:(\\d+)px`)) || [])[1]);
  ok(`.${sel} clears the 24px minimum target`, px >= 24, `${px}px`);
}

// ── Selected and hovered are not the same paint ─────────────────────────
// The mistake this codebase has now made twice: painting a selected control
// with the value that means hovered, so a chosen option reads as one the
// cursor happens to be over. .tab-pill also documents the ordering — checked
// after hover, so a chosen control caught mid-hover stays chosen.
console.log("\nSelectors tell selected apart from hovered, and in that order");
for (const sel of ["ai-track-alt", "canvas-variant-btn", "pg-code-tab"]) {
  const hov = css.search(new RegExp(`\\.${sel}:hover`));
  const on = css.search(new RegExp(`\\.${sel}\\[(aria-current|data-active)`));
  const body = (m) => (css.slice(m).match(/\{([^}]*)\}/) || [])[1] ?? "";
  const paint = (b) => (b.match(/background:([^;]*)/) || [])[1];
  ok(`.${sel} paints selected differently from hovered`,
    hov > -1 && on > -1 && paint(body(hov)) !== paint(body(on)),
    `${paint(body(hov))} vs ${paint(body(on))}`);
  ok(`.${sel} orders selected after hover`, on > hov);
}

// ── Stacked rows draw one rule between them, not two ────────────────────
// A row family that puts a border on both edges paints two parallel lines
// between every pair of neighbours. It happened on .mk-pick: each row drew a
// border-bottom, and the locked row added a border-top to mark the group
// break, so the break arrived as a doubled line five pixels apart. Whichever
// edge a family picks, it has to pick one — then a row wanting a stronger
// break recolours the existing rule instead of adding a second.
console.log("\nEach stacking row family draws its rule on one edge only");
const ROW_FAMILIES = ["mk-pick", "mk-row", "mk-xf", "mk-step", "mk-hunk", "ai-when-list li"];
for (const fam of ROW_FAMILIES) {
  // Every declaration whose selector starts with this family.
  const decls = [...cascade.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .filter((m) => m[1].trim().split(",").some((sel) => sel.trim().startsWith(`.${fam}`)))
    .map((m) => m[2]);
  const edges = new Set();
  for (const d of decls)
    for (const e of ["top", "bottom"])
      // "none" turns an edge off; it doesn't count as drawing one.
      if (new RegExp(`border-${e}(-width|-style)?:\\s*(?!none)[^;]*(solid|1px)`).test(d)) edges.add(e);
  ok(`.${fam} draws on one edge`, edges.size <= 1, [...edges].join(" + ") || "none");
}

// ── "Composed from" must not be a liar ──────────────────────────────────
// An essential part is one the pattern can't be built without, so the
// wireframe has to draw it. Visible Sources listed Checkbox and drew a 2px
// rail — the pattern about switching sources on and off had no switch.
//
// Only the components that render a stable class are checkable; Button is
// inline-styled and has none, so it can't be detected and isn't claimed to be.
console.log("\nEvery essential Composed-from part is actually drawn");
const DETECTABLE = {
  Checkbox: /role="checkbox"/,
  Tags: /class="tag-chip"/,
  "Input Field": /class="field-(input|textarea)"/,
};
// A part the wireframe genuinely cannot use, with the reason. An exemption is
// a claim that the component is right for a real product but wrong for an
// illustration — not a note that the preview hasn't got round to it.
const CANNOT_DRAW = {
  "inline-suggestion|Input Field":
    "the model's words have to sit inline with the typed text, styled differently; " +
    "no <input> or <textarea> can render a span inside its own value, so the " +
    "wireframe hand-draws the editor. A real build still sits on a field.",
};
for (const p of AI_PATTERNS.filter((x) => x.status === "documented")) {
  const P = PATTERN_PREVIEWS[p.id];
  if (!P) continue;
  // Union across states: the pattern is composed of these, not every state.
  const drawn = p.states.map((st) => renderToString(<P state={st.id} />)).join("");
  const optional = new Set(p.optionalParts ?? []);
  for (const part of (p.composedOf ?? []).filter((c) => !optional.has(c))) {
    const probe = DETECTABLE[part];
    if (!probe) continue;
    if (probe.test(drawn)) continue;
    if (CANNOT_DRAW[`${p.id}|${part}`]) {
      console.log(`  note  ${p.name} can't draw ${part} — ${CANNOT_DRAW[`${p.id}|${part}`]}`);
      continue;
    }
    fails++;
    console.log(`FAIL  ${p.name}: lists ${part} as essential and never draws one`);
  }
}
ok("no pattern claims an essential part it doesn't render", true);

console.log(fails ? `\n${fails} FAILED\n` : "\nall passed\n");
process.exit(fails ? 1 : 0);
