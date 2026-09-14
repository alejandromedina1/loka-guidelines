// smoke25 — the three §1 gaps: states that rendered identically, or drew
// something other than what the pattern claims.
//
// Each check derives its expectation from the markup rather than restating a
// number, so a preview that stops drawing the distinction fails here rather
// than passing quietly the way all three of these did.
import { renderToString } from "react-dom/server";
import { ConfidencePreview } from "./src/components/ai/previews/ConfidencePreview.jsx";
import { ApprovalGatePreview } from "./src/components/ai/previews/ApprovalGatePreview.jsx";
import { PlanPreviewPreview } from "./src/components/ai/previews/PlanPreviewPreview.jsx";
import { DiffReviewPreview } from "./src/components/ai/previews/DiffReviewPreview.jsx";
import { StagedRevealPreview } from "./src/components/ai/previews/StagedRevealPreview.jsx";
import { RefusalPreview } from "./src/components/ai/previews/RefusalPreview.jsx";
import fs from "node:fs";

let fails = 0;
const ok = (name, cond, detail = "") => {
  if (!cond) fails++;
  console.log(`${cond ? "  ok  " : "FAIL  "}${name}${detail ? ` — ${detail}` : ""}`);
};

// Rendering a preview means building the surface that reads as the state you
// want, because a state is no longer something a preview can be handed — it is
// what its data adds up to. `set` is a no-op: these are render checks, and the
// moves are smoke29's.
const draw1 = (C, id) =>
  renderToString(<C state={id} work={C.work ? C.work.for(id) : undefined} set={() => {}} />);
const r = (C, state) => draw1(C, state);
const count = (html, needle) => html.split(needle).length - 1;

// ── Confidence Levels ───────────────────────────────────────────────────
// The pattern's claim is that a score is a band, and that the width of the
// band is the honest signal. So certainty must fall monotonically as the
// states go high → banded → low, measured in lit segments.
console.log("\nConfidence Levels — bands are drawn, and their width means something");
const conf = { high: r(ConfidencePreview, "high"), banded: r(ConfidencePreview, "banded"), low: r(ConfidencePreview, "low") };
const lit = (html) => count(html, 'class="mk-bands-seg" data-on=');
const segs = (html) => count(html, 'class="mk-bands-seg"');

ok("every scored state draws the full set of bands",
  new Set(Object.values(conf).map(segs)).size === 1 && segs(conf.high) > 1,
  `${segs(conf.high)} bands`);
ok("lit width grows as confidence drops",
  lit(conf.high) < lit(conf.banded) && lit(conf.banded) < lit(conf.low),
  `high ${lit(conf.high)} < banded ${lit(conf.banded)} < low ${lit(conf.low)}`);
ok("'Shown as a range' no longer renders as 'Above the bar'",
  conf.high !== conf.banded);
ok("no continuous fill survives anywhere in the preview",
  !Object.values(conf).some((h) => h.includes("mk-band-fill")));

// ── Approval Gate ───────────────────────────────────────────────────────
console.log("\nApproval Gate — the meter localises the failure");
const exec = r(ApprovalGatePreview, "executing");
const fail = r(ApprovalGatePreview, "failed");
ok("Running and Failed no longer draw the same meter", exec !== fail);
ok("Failed marks exactly one step as the one that stopped",
  count(fail, 'data-state="fail"') === 1);
ok("Running marks none", count(exec, 'data-state="fail"') === 0);
// Read the readout out of the markup rather than restating it, so changing
// the example doesn't quietly turn this check off.
const stepNote = (fail.match(/class="mk-step-note">([^<]+)</) || [])[1];
ok("the count that matters sits on the step, not only in prose", !!stepNote, stepNote);
ok("and isn't also restated in the callout below it", stepNote && count(fail, stepNote) === 1);

// ── Plan Preview ────────────────────────────────────────────────────────
console.log("\nPlan Preview — paused reads as held, not as in flight");
const run = r(PlanPreviewPreview, "running");
const paused = r(PlanPreviewPreview, "paused");
ok("paused holds a step rather than running one",
  count(paused, 'data-state="held"') === 1 && count(paused, 'data-state="now"') === 0);
ok("running still runs one", count(run, 'data-state="now"') === 1);

// ── Change Review ───────────────────────────────────────────────────────
console.log("\nChange Review — the two verdicts are distinguishable");
const partial = r(DiffReviewPreview, "partial");
ok("both verdicts appear in the partly-accepted state",
  partial.includes('data-decided="accepted"') && partial.includes('data-decided="rejected"'));
ok("and they carry their verdict in words, not colour alone",
  partial.includes("Accepted") && partial.includes("Rejected"));

// ── Clear Refusal ───────────────────────────────────────────────────────
// The pattern's thesis is that refusal is something products do rather than
// something chatbots say — "four frames make the point". For a long time it
// drew four callouts instead: same box, same two buttons, different words. Four
// messages in a row is the chatbot reply it is arguing against, and it left the
// reader with no idea what had actually been refused.
console.log("\nClear Refusal — four surfaces, not four messages");
{
  const STATES = ["policy", "capability", "noanswer", "partial"];
  const frames = Object.fromEntries(STATES.map((id) => [id, r(RefusalPreview, id)]));

  // Strip every word and compare what is left. Two states with the same
  // skeleton are the same drawing with different copy, which is exactly what
  // this was — and no amount of rewriting the sentences would have fixed it.
  const skeleton = (h) => h.replace(/>[^<]*</g, "><");
  const shapes = new Map();
  for (const [id, h] of Object.entries(frames)) {
    const k = skeleton(h);
    shapes.set(k, [...(shapes.get(k) ?? []), id]);
  }
  ok(`${STATES.length} states, ${shapes.size} distinct drawings`, shapes.size === STATES.length,
    [...shapes.values()].filter((g) => g.length > 1).map((g) => g.join(" = ")).join(", "));

  for (const id of STATES) {
    const h = frames[id];
    // Something was refused, and it has to be on screen. A callout alone is a
    // message; a callout over the payment that didn't go is the pattern.
    const drew = ["mk-params", "mk-list", "mk-steps"].filter((c) => h.includes(c));
    ok(`  ${id}: draws what was refused`, drew.length > 0, drew.join(", ") || "callout only");
    // "Is there a path forward? Always." — carried inside the callout now, so
    // it cannot be shipped without one.
    ok(`  ${id}: the way out is inside the callout`, h.includes("mk-note-act"));
    // "Assume over-refusal happens and give a low-friction way to report it."
    ok(`  ${id}: over-refusal is reportable`, h.includes("This looks wrong"));
    // Inspect is graded Recommended: "which kind of limit it is". Tone was the
    // only thing saying it, and tone is colour.
    ok(`  ${id}: names its kind`, h.includes("mk-note-head") && h.includes("tag-chip"));
    // "Does it look like an error? No." No red on any of the four — a rule and
    // a missing connection are the system working as designed, and spending the
    // error treatment on them leaves nothing for what really breaks.
    ok(`  ${id}: is not styled as an error`, !h.includes('data-tone="bad"'));
  }
}

// ── Results in Pieces ───────────────────────────────────────────────────
// The caption names the card that's lagging, so the spinner has to be on that
// card. It wasn't: the caption said Pipeline and the spinner sat on NPS.
console.log("\nResults in Pieces — the caption names the card the spinner is on");
const slow = r(StagedRevealPreview, "slow");
const lagging = (slow.match(/data-status="slow"[^]*?mk-label">([^<]+)</) || [])[1];
const named = (slow.match(/mk-say[^>]*>([A-Z][a-z]+) is taking longer/) || [])[1];
ok("exactly one card is lagging", count(slow, 'data-status="slow"') === 1);
ok("and it is the one the caption names", lagging === named, `${lagging} vs ${named}`);

// ── CSS: every new class has a rule, every new rule has a referent ──────
console.log("\nglobal.css — new classes and rules resolve both ways");
const css = fs.readFileSync("./src/styles/global.css", "utf8");
const all = [conf.high, conf.banded, conf.low, exec, fail, run, paused, partial, slow].join("");
const NEW = ["mk-bands", "mk-bands-seg", "mk-bands-tick", "mk-bands-name", "mk-step-note"];
for (const c of NEW) ok(`.${c} is styled`, css.includes(`.${c}`));
for (const c of NEW) ok(`.${c} is used`, all.includes(c));
for (const st of ["fail", "held"])
  ok(`.mk-step[data-state="${st}"] has a referent`,
    css.includes(`.mk-step[data-state="${st}"]`) && all.includes(`data-state="${st}"`));
for (const d of ["accepted", "rejected"])
  ok(`.mk-hunk[data-decided="${d}"] has a referent`,
    css.includes(`[data-decided="${d}"]`) && all.includes(`data-decided="${d}"`));
ok("the retired .mk-band-fill / .mk-band-scale rules are gone from CSS",
  !css.includes(".mk-band-fill") && !css.includes(".mk-band-scale"));

// ── AA on every red the previews paint text with ────────────────────────
// Parsed out of global.css and computed, never restated: editing a token is
// what has to fail this. --danger is a fill (a border, a dot, a diff row's
// background); --danger-text is the rung that carries running copy, and every
// surface a red string lands on has to clear 4.5:1 at these sizes — the
// largest of them is 13px, so none of them is "large text".
console.log("\nglobal.css — red text clears AA on every surface it lands on");
const token = (theme, name) => {
  const block = css.slice(css.indexOf(theme));
  const m = block.match(new RegExp(`--${name}:\\s*(#[0-9A-Fa-f]{6})`));
  return m && m[1];
};
// --select is an rgba(), because a wash has to tint whatever it lands on. This
// reads it out rather than restating it, so moving the token is what fails.
const rgbaToken = (theme, name) => {
  const block = css.slice(css.indexOf(theme));
  const m = block.match(new RegExp(`--${name}:\\s*rgba\\(([\\d.,\\s]+)\\)`));
  if (!m) return null;
  const [r, g, b, a] = m[1].split(",").map((x) => Number(x.trim()));
  return { r, g, b, a };
};
// What the wash actually becomes over a given surface. A translucent highlight
// has no contrast of its own — only the pair it produces has.
const flatten = ({ r, g, b, a }, bg) => {
  const back = [1, 3, 5].map((i) => parseInt(bg.slice(i, i + 2), 16));
  const mix = [r, g, b].map((c, i) => Math.round(c * a + back[i] * (1 - a)));
  return `#${mix.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
};
const srgb = (h) =>
  [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
    .map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
const lum = (h) => { const [r, g, b] = srgb(h); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const contrast = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

for (const theme of [".app {", '.app[data-theme="dark"]']) {
  const label = theme.includes("dark") ? "dark" : "light";
  const red = token(theme, "danger-text");
  ok(`${label}: --danger-text is defined`, !!red, red || "missing");
  // Every background a red string sits on in these previews.
  for (const surface of ["bg", "bg-soft", "danger-soft"]) {
    const bg = token(theme, surface);
    const r = contrast(red, bg);
    ok(`${label}: --danger-text on --${surface}`, r >= 4.5, `${r.toFixed(2)}:1`);
  }
}
// And the fill rung stays a fill: it must still clear 3:1 as a graphical
// object, which is what the failed step's dot and the "avoid" rule are.
for (const theme of [".app {", '.app[data-theme="dark"]']) {
  const label = theme.includes("dark") ? "dark" : "light";
  const r = contrast(token(theme, "danger"), token(theme, "bg"));
  ok(`${label}: --danger clears 3:1 as a graphical object`, r >= 3, `${r.toFixed(2)}:1`);
}
// `border-top-color:var(--danger)` is a border and must not trip this, so the
// property has to start at a declaration boundary rather than merely end in
// "color".
// Any text the touched-row tint sits under has to clear AA on that tint too —
// adding a background is not a licence to make the text on it harder to read.
console.log("\nglobal.css — text on the touched-row tint clears AA");
for (const theme of [".app {", '.app[data-theme="dark"]']) {
  const label = theme.includes("dark") ? "dark" : "light";
  const tint = token(theme, "blue-soft");
  for (const ink of ["ink", "ink-3"]) {
    const v = contrast(token(theme, ink), tint);
    ok(`${label}: --${ink} on --blue-soft`, v >= 4.5, `${v.toFixed(2)}:1`);
  }
}
// The canvas foot's own text, in all three pill states and on the trigger
// line. Quietening a control is not a licence to drop it under AA.
console.log("\nglobal.css — the canvas chrome reads at AA in every state");
for (const theme of [".app {", '.app[data-theme="dark"]']) {
  const label = theme.includes("dark") ? "dark" : "light";
  for (const [what, fg, bg, floor] of [
    // .ai-state-tab, the variant strip above the frame. Three states, and the
    // pair was unchanged when the track it used to sit under was removed.
    ["tab, idle", "ink-3", "bg-soft", 4.5],
    ["tab, hovered", "ink", "line-2", 4.5],
    ["tab, selected", "ink", "bg", 4.5],
    // The selected tab's outline is a graphical object, so 3:1.
    ["tab outline", "ink-3", "bg", 3],
    ["the trigger line", "ink-2", "bg-soft", 4.5],
    // .ai-state-name — the label a position shows when it doesn't fork.
    ["the state's name", "ink", "bg", 4.5],
    ["what moved it here", "ink-2", "bg", 4.5],
    // .ai-restart, in the foot, on the tabs' idle rung.
    ["start over", "ink-3", "bg", 4.5],
    // .ai-now-text, in the properties column, on the blue-soft block it sits
    // in — not on the panel background. The pair was wrong here while the
    // readout had a fill: ink-2 is what is painted, blue-soft is what it is
    // painted on, and the test was checking neither combination.
    ["what that state means", "ink-2", "blue-soft", 4.5],
  ]) {
    const v = contrast(token(theme, fg), token(theme, bg));
    ok(`${label}: ${what}`, v >= floor, `${v.toFixed(2)}:1`);
  }
}

// ── The voice stage ────────────────────────────────────────────────────
// This check used to assert the opposite. The stage was a near-black slab with
// its own palette, on the argument that an ambient device sits in a room, and
// it was an alien in the middle of a light page — a preview here is a wireframe
// of our product, not a photograph of somebody's speaker. So the guard is
// inverted: it may not carry a ground of its own, and its text has to be the
// theme's rungs, which the pairs above already hold to AA in both themes.
console.log("\nglobal.css — the voice stage is on the theme, not on its own dark");
{
  const rule = (sel) =>
    (css.match(new RegExp(`(?:^|[}\\n])\\s*${sel}\\s*\\{([^}]*)\\}`, "m")) || [])[1] ?? "";
  const stage = rule("\\.vc-stage");
  ok(".vc-stage paints no ground of its own",
    !!stage && !/(^|;)\s*background:/.test(stage) && !/--vc-(bg|ink)/.test(stage),
    stage.slice(0, 60));
  // Every colour the stage's own parts use, and each one has to be a token
  // rather than a literal — a hex here is a value that won't follow the theme.
  const parts = ["\\.vc-device", "\\.vc-mood", "\\.vc-heard", "\\.vc-caption",
    "\\.vc-handoff-to", "\\.vc-handoff-note"];
  const literal = parts.filter((sel) => /color:#[0-9A-Fa-f]{3,8}/.test(rule(sel)));
  ok("…and its text runs on the theme's rungs", literal.length === 0, literal.join(", "));
  // The orb is the exception and is allowed two tuned ends per theme, because
  // a bloom that reads as warm on white disappears on near-black. Both have to
  // exist, or dark mode gets the light values.
  ok("the orb is tuned for both themes",
    /\.app\[data-theme="dark"\] \.vc-stage\{[^}]*--orb-glow/.test(css));
  // And it is lit with the brand's own blue rather than an invented one.
  ok("…with the brand's blue, not an invented one", /--orb-lit|var\(--blue\)/.test(css));
}

// ── The part chips are grey ────────────────────────────────────────────
// Composed from stacks up to a dozen of these in one block, so a hover that
// took the accent lit the page up in the colour the system reserves for "this
// matters" every time a cursor crossed the list. Blue is to be spent
// deliberately; a list of parts is not the place. Asserted because reaching for
// the accent is the instinct that put it there in the first place.
console.log("\nglobal.css — Composed-from chips carry their states in grey");
{
  // Anchored to the start of a rule, or `.ai-chip` also matches inside
  // `.ai-prin-applies .ai-chip` and reads the wrong body.
  const body = (sel) =>
    (css.match(new RegExp(`(?:^|[}\\n])\\s*${sel}\\s*\\{([^}]*)\\}`, "m")) || [])[1] ?? "";
  const rest = body("\\.ai-chip");
  const hover = body("\\.ai-chip:hover");
  const dashed = body("\\.ai-chip\\[data-optional\\]:hover");
  ok("the hover spends no blue", !!hover && !/--blue/.test(hover), hover);
  ok("…nor does the optional one", !!dashed && !/--blue/.test(dashed), dashed);
  // Focus is the one state blue is still for, and the one these had no styling
  // for at all — they are buttons that navigate.
  ok("focus is styled, and in the accent",
    /\.ai-chip:focus-visible\{[^}]*--blue/.test(css));

  // The state has to be legible without seeing colour, so the label carries it:
  // hover must be a real step darker than rest, on both themes.
  for (const theme of [".app {", '.app[data-theme="dark"]']) {
    const label = theme.includes("dark") ? "dark" : "light";
    // The last token named in the declaration — box-shadow puts its offsets
    // first, so anchoring on `prop:var(` finds nothing.
    const pick = (decls, prop) =>
      (decls.match(new RegExp(`${prop}:[^;]*var\\(--([\\w-]+)\\)`)) || [])[1];
    const bg = token(theme, "bg");
    const restC = contrast(token(theme, pick(rest, "color")), bg);
    const hoverC = contrast(token(theme, pick(hover, "color")), token(theme, pick(hover, "background")));
    ok(`${label}: the label darkens on hover`, hoverC > restC + 2,
      `${restC.toFixed(2)}:1 → ${hoverC.toFixed(2)}:1`);
    // And the ring darkens with it rather than staying put, or the chip's edge
    // contradicts its label.
    const ringRest = token(theme, pick(rest, "box-shadow"));
    const ringHover = token(theme, pick(hover, "box-shadow"));
    ok(`${label}: …and so does the ring`, contrast(ringRest, ringHover) >= 2,
      `${contrast(ringRest, ringHover).toFixed(2)}x`);
  }
}

// ── Selected text ──────────────────────────────────────────────────────
// A wash lowers the contrast of whatever it covers, so the rule pins selected
// text to --ink and the pair to check is that one — on every surface a
// selection can land on, which is every background the hub paints.
//
// The floor is 4.5 because this is running copy, and the second number is the
// one that says the highlight is visible at all: a wash the same luminance as
// its background is not a highlight. 1.3 is roughly where the platform
// defaults sit, and below it a selection stops reading as one.
console.log("\nglobal.css — selected text reads, and reads as selected");
for (const theme of [".app {", '.app[data-theme="dark"]']) {
  const label = theme.includes("dark") ? "dark" : "light";
  const wash = rgbaToken(theme, "select");
  ok(`${label}: --select is a wash, not a fill`, !!wash && wash.a > 0 && wash.a < 1,
    wash ? `alpha ${wash.a}` : "missing");
  const ink = token(theme, "ink");
  for (const surface of ["bg", "bg-soft", "blue-soft", "line-2"]) {
    const bg = token(theme, surface);
    const on = flatten(wash, bg);
    ok(`${label}: selected text on --${surface}`, contrast(ink, on) >= 4.5,
      `${contrast(ink, on).toFixed(2)}:1`);
    ok(`${label}: …and the selection is visible on --${surface}`,
      contrast(on, bg) >= 1.3, `${contrast(on, bg).toFixed(2)}:1`);
  }
}
// Every rung the hub paints running copy in, checked against the wash on the
// plainest background — the selection sets the colour, so the rung it started
// on must not matter. This is the assertion that would fail if the `color` were
// ever dropped from the rule and the wash left to sit on --ink-3.
console.log("\nSelected text is the same rung whatever it was painted in");
ok("the rule sets a colour, not only a background",
  /\.app ::selection\{[^}]*color:var\(--ink\)/.test(css));
ok("…and the editor overlay is the one exception, in writing",
  /\.mk-editor-input::selection\{[^}]*color:transparent/.test(css));

ok("the source list's meta line is not on the failing --ink-4 rung",
  /\.mk-src-meta\{[^}]*color:var\(--ink-3\)/.test(css));

ok("no --danger left painting text anywhere in the AI hub",
  !/\.(mk|ai)-[^{]*\{[^}]*[;{]\s*color:var\(--danger\)[;}]/.test(css));

console.log(fails ? `\n${fails} FAILED\n` : "\nall passed\n");
process.exit(fails ? 1 : 0);
