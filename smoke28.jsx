// smoke28 — the two standing CSS checks, plus the duplication one, run over the
// whole AI hub after the pass that made the wireframes surfaces you work: the
// previews now render their own data and the state the page names is derived
// from it, so a render here has to build that data rather than name a state.
//
// The build passes while all three of these are broken, which is the only
// reason they exist.
import { renderToString } from "react-dom/server";
import fs from "node:fs";
import { AI_PATTERNS } from "./src/data/aiPatterns.js";
import { alternatives } from "./src/data/flow.js";
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

// A preview in one state. A state is no longer something a preview can be
// handed — it is what its data adds up to — so putting one on screen means
// building the surface that reads as it.
const draw1 = (C, id) =>
  renderToString(<C state={id} work={C.work ? C.work.for(id) : undefined} set={() => {}} />);

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
    // With a live `set`, because that is how the hub renders them — the classes
    // a live control paints only exist when there is something for it to do,
    // and rendering the previews inert reports every one of them as dead CSS.
    // Every state on every surface the pattern draws. A voice rule is only
    // reachable through a voice preview, so leaving them out would report the
    // whole kit as dead CSS rather than as unguarded.
    const on = [P, ...Object.values(P?.surfaces ?? {})].filter(Boolean);
    return [
      shell,
      ...(p.states ?? []).flatMap((st) =>
        on.map((C) =>
          renderToString(
            <C state={st.id} work={P?.work ? P.work.for(st.id) : undefined} set={() => {}} />
          )
        )
      ),
    ];
  }),
  renderToString(<AiPrinciplesSection registerRef={() => {}} onSelectAiPattern={() => {}} />),
  renderToString(<AiAntipatternsSection registerRef={() => {}} />),
].join("");

// ── 1. Every class the hub renders has a rule ───────────────────────────
console.log("\nEvery ai/mk/vc/cv class rendered by the hub resolves to a rule");
const used = new Set();
for (const m of html.matchAll(/class="([^"]+)"/g))
  for (const c of m[1].split(/\s+/)) if (/^(ai|mk|vc|cv)-/.test(c)) used.add(c);
const unstyled = [...used].filter((c) => !new RegExp(`\\.${c}(?![\\w-])`).test(css));
ok(`${used.size} classes used, all styled`, unstyled.length === 0, unstyled.join(", "));

// ── 2. Every rule has something that renders it ─────────────────────────
console.log("\nNo ai/mk/vc/cv rule is defined without a referent");
const declared = new Set();
for (const m of css.matchAll(/\.((?:ai|mk|vc|cv)-[\w-]+)/g)) declared.add(m[1]);
// A class that only appears once the canvas has moved. renderToString gives
// every pattern its first state and there is no prop to start it elsewhere, so
// this one is unreachable by a render test rather than unused — the assertion
// below is that the component still renders it, which is the part that could
// actually rot.
const AFTER_INTERACTION = {
  "ai-restart": [/className="ai-restart"/, "src/components/ai/PatternDetail.jsx"],
  // Only drawn once somebody switches off the screen, which a render can't do.
  "ai-surf-say": [/className="ai-surf-say"/, "src/components/ai/PatternDetail.jsx"],
};
const orphans = [...declared].filter((c) => !used.has(c) && !AFTER_INTERACTION[c]);
ok(`${declared.size} classes styled, all rendered`, orphans.length === 0, orphans.join(", "));
for (const [c, [probe, file]] of Object.entries(AFTER_INTERACTION))
  ok(`  .${c} is rendered, just not before the first click`,
    probe.test(fs.readFileSync(`./${file}`, "utf8")), file);

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

// ── The canvas chrome is operable ──────────────────────────────────────
// The controls around the canvas had no focus style, no named group, and no
// target that cleared 24x24. A wireframe hub is read by designers on laptops
// and by people using a keyboard.
console.log("\nThe canvas chrome is named, focusable and big enough");
{
  const nameless = [...html.matchAll(/<button([^>]*class="ai-(?:state|restart)[^"]*"[^>]*)>(.*?)<\/button>/gs)]
    .filter((m) => !/aria-label="/.test(m[1]) && !m[2].replace(/<[^>]*>/g, "").trim());
  ok("every canvas control has an accessible name", nameless.length === 0, `${nameless.length} without`);
  const groups = [...html.matchAll(/role="group"([^>]*)>/g)];
  const unnamed = groups.filter((m) => !/aria-label="/.test(m[1]));
  ok(`${groups.length} groups in the hub, all named`, unnamed.length === 0);
  // Selection is never colour alone.
  ok("the chosen variant is marked in the markup, not only in paint",
    /class="ai-state-tab"[^>]*aria-current="true"/.test(html));
}
for (const sel of ["ai-state-tab", "ai-restart"])
  ok(`.${sel} has a focus-visible style`,
    new RegExp(`\\.${sel}:focus-visible`).test(css));
{
  const rule = css.match(/\.ai-state-tab\{([^}]*)\}/);
  const px = rule && Number((rule[1].match(/(?:^|;|\s)min-height:(\d+)px/) || [])[1]);
  ok(".ai-state-tab clears the 24px minimum target", px >= 24, `${px}px`);
}

// ── The canvas foot holds its ends ─────────────────────────────────────
// Two things live there and either can be absent — the surface strip only when
// the pattern has a second drawing, Start over only once there is a road behind
// you. `space-between` reads correctly with both and puts a lone strip on the
// right, which is where the opening state of every pattern that has one put it.
// One auto margin on the action is the arrangement that holds in all four
// combinations, so it is the thing to pin.
console.log("\nThe canvas foot keeps the selector left and the action right");
{
  const rule = (sel) =>
    (css.match(new RegExp(`(?:^|[}\\n])\\s*${sel}\\s*\\{([^}]*)\\}`, "m")) || [])[1] ?? "";
  const foot = rule("\\.ai-lab \\.pg-canvas-foot");
  ok("the foot doesn't space its children apart", !/space-between/.test(foot), foot.slice(0, 48));
  ok("…and Start over holds the right on its own",
    /margin-left:auto/.test(rule("\\.ai-lab \\.pg-canvas-foot \\.ai-restart")));
}

// ── No state is carried by paint alone ─────────────────────────────────
// The house rule, applied to the wireframes: colour is never the only signal.
// Three things were breaking it, and all three were in the shared kit — so they
// were not three bugs, they were one bug about to be copied into every pattern
// added next.
//
//   a step's state   done / running / held / failed, drawn as a dot's fill and
//                    ring. Read aloud, Approval Gate's Running and its Failed
//                    midway were the identical four lines, on the meter whose
//                    only job is to localise a failure.
//   a diff row       red behind one line, blue behind the other. "Shopping
//                    Eating out" — two categories with nothing saying which is
//                    the current one.
//   a suggestion     drawn in a mirror that is hidden from assistive tech, so
//                    the one thing Inline Suggestion is about never arrived.
console.log("\nEvery state drawn in paint is also available in words");
{
  const wordsFor = (sel, words) => {
    const rows = [...html.matchAll(new RegExp(`<[^>]*class="${sel}"[^>]*data-state="(\\w+)"[^>]*>(.*?)(?=<li|</ol)`, "gs"))];
    const bare = rows.filter((m) => !words.some((w) => m[2].includes(w)));
    ok(`${rows.length} ${sel} rows, every one naming its state`, rows.length > 0 && bare.length === 0,
      bare.slice(0, 2).map((m) => m[1]).join(", "));
  };
  wordsFor("mk-step", ["Done", "Running", "Held", "Failed", "Not started"]);

  const diffs = [...html.matchAll(/class="mk-diff-line"[^>]*data-kind="(\w+)"[^>]*>(.*?)<\/span>/gs)];
  const unmarked = diffs.filter((m) => !/From:|To:/.test(m[2]));
  ok(`${diffs.length} diff rows, every one saying which side it is`,
    diffs.length > 0 && unmarked.length === 0, unmarked.slice(0, 2).map((m) => m[1]).join(", "));

  // And the hidden text is genuinely hidden, or the wireframes grow labels.
  ok(".vh takes the element out of flow", /\.vh\{[^}]*position:absolute/.test(css));
}

// ── A live region carries words, not controls ──────────────────────────
// aria-live on the caption itself wrapped the tab strip, so every change
// re-announced a group of buttons along with the state — a live region full of
// controls talks over the thing somebody is trying to press.
console.log("\nLive regions hold a sentence and nothing focusable");
{
  const regions = [...html.matchAll(/<(\w+)([^>]*aria-live="[^"]*"[^>]*)>(.*?)<\/\1>/gs)];
  ok(`${regions.length} live regions in the hub`, regions.length >= 2, `${regions.length}`);
  const withControls = regions.filter((m) => /<button|<input|<textarea|tabindex="0"/.test(m[3]));
  ok("…none of them containing a control", withControls.length === 0,
    withControls.map((m) => m[1]).join(", "));
}

// ── Everything reachable is announced ────────────────────────────────
// The previews are full of buttons that illustrate a control rather than being
// one, and those stay out of the tab order — several dead buttons per state
// across ten patterns is a lot of nothing to tab through, and it is also the
// honest signal for which parts of a wireframe this playground implements. The
// ones that do something are the opposite: reachable, and therefore owed a
// name, because a screen reader on an unnamed control reads "button".
console.log("\nEvery control a keyboard can reach has a name");
{
  let reach = 0;
  const nameless = [];
  // Buttons, including the library's own — the Checkbox renders one, and the
  // wireframe's ticks were tab stops with nothing but a role for years.
  for (const m of html.matchAll(/<button([^>]*)>(.*?)<\/button>/gs)) {
    if (/tabindex="-1"/i.test(m[1])) continue;
    reach++;
    if (!/aria-label="/.test(m[1]) && !m[2].replace(/<[^>]*>/g, "").trim()) nameless.push(m[1]);
  }
  // And the things a preview makes clickable that aren't buttons: a citation
  // marker, a list row, a value in a table.
  const hots = [...html.matchAll(/class="mk-hot"([^>]*)>/g)];
  reach += hots.length;
  for (const m of hots) if (!/aria-label="/.test(m[1])) nameless.push(m[1]);
  ok(`${reach} reachable controls across the hub, every one named`,
    nameless.length === 0, nameless.slice(0, 3).join(" / "));
  ok("…and there are some, so this isn't passing on an empty set", reach > 40, `${reach}`);
}

// A control that does nothing is drawn, not reachable. Asserted on the
// wireframes alone, where the distinction lives — the page chrome around them
// is all real controls.
console.log("\nA control that does nothing stays out of the tab order");
{
  let dead = 0, live = 0;
  for (const p of AI_PATTERNS.filter((x) => x.status === "documented")) {
    const P = PATTERN_PREVIEWS[p.id];
    if (!P) continue;
    for (const st of p.states)
      for (const m of draw1(P, st.id).matchAll(/<button([^>]*)>/g))
        if (/tabindex="-1"/i.test(m[1])) dead++; else live++;
  }
  ok(`${dead} drawn controls and ${live} live ones`, dead > 0 && live > 0);
}

// Reachability — whether every documented state can be produced at all — is
// smoke29's. It drives the handlers with a recording `set` and explores the
// surface each wireframe actually has, which is a question about data rather
// than about markup and so has no business in a stylesheet check.

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
  const drawn = p.states.map((st) => draw1(P, st.id)).join("");
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
