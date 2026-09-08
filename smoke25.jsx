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
import fs from "node:fs";

let fails = 0;
const ok = (name, cond, detail = "") => {
  if (!cond) fails++;
  console.log(`${cond ? "  ok  " : "FAIL  "}${name}${detail ? ` — ${detail}` : ""}`);
};

const r = (C, state) => renderToString(<C state={state} />);
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
console.log("\nglobal.css — the canvas foot reads at AA in every state");
for (const theme of [".app {", '.app[data-theme="dark"]']) {
  const label = theme.includes("dark") ? "dark" : "light";
  for (const [what, fg, bg, floor] of [
    ["pill, idle", "ink-3", "bg-soft", 4.5],
    ["pill, hovered", "ink", "line-2", 4.5],
    ["pill, selected", "ink", "bg", 4.5],
    // The selected pill's outline is a graphical object, so 3:1.
    ["pill outline", "ink-3", "bg", 3],
    ["the trigger line", "ink-2", "bg-soft", 4.5],
    // The state block sits on the panel background with no fill of its own.
    ["the run's caption", "ink-3", "bg", 4.5],
    ["a step number", "ink-3", "bg", 4.5],
    ["a reachable state", "ink-2", "bg", 4.5],
    ["a state this route can't reach", "ink-3", "bg", 4.5],
    ["the state on the canvas", "ink", "blue-soft", 4.5],
    ["what moved it here", "ink", "bg", 4.5],
    ["what that state means", "ink-2", "bg", 4.5],
  ]) {
    const v = contrast(token(theme, fg), token(theme, bg));
    ok(`${label}: ${what}`, v >= floor, `${v.toFixed(2)}:1`);
  }
}

ok("the source list's meta line is not on the failing --ink-4 rung",
  /\.mk-src-meta\{[^}]*color:var\(--ink-3\)/.test(css));

ok("no --danger left painting text anywhere in the AI hub",
  !/\.(mk|ai)-[^{]*\{[^}]*[;{]\s*color:var\(--danger\)[;}]/.test(css));

console.log(fails ? `\n${fails} FAILED\n` : "\nall passed\n");
process.exit(fails ? 1 : 0);
