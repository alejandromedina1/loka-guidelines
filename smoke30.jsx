// smoke30 — the properties column reads for whatever is on the canvas.
//
// The surface strip puts a voice or canvas frame on twelve of the fourteen
// patterns, and for a while the whole right-hand column went on describing a
// screen beside it: seventeen of the sixty-six state notes and seven of the
// seventy axis notes name a click, a chip, a column or a grey outline. Sourced
// Answer was the sharpest — "one click to the passage" two inches from a
// drawing of a handoff to a phone, because there is no click.
//
// `surfaces[sf].states` and `surfaces[sf].controls` are sparse maps that
// replace those notes while that surface is on the canvas. Sparse is the whole
// risk: a typo'd key is silent, an override on a surface nobody can reach is
// dead, and a note nobody noticed goes on lying. All three fail here.
//
// What is NOT overridable is the grade. An axis is the obligation a product
// takes on; an obligation that moved when somebody pressed a tab would be
// describing the picture rather than the product. Sourced Answer's Verify is
// still Required on voice — the handoff to a screen is HOW it is met.
import { AI_PATTERNS, AI_SURFACES, CONTROL_GRADES } from "./src/data/aiPatterns.js";
import { PATTERN_PREVIEWS } from "./src/components/ai/previews/index.js";

let fails = 0;
const bad = (m) => { fails++; console.log(`FAIL  ${m}`); };

const doc = AI_PATTERNS.filter((p) => p.status === "documented");
const AXES = ["interrupt", "inspect", "verify", "correct", "undo"];
const SURFACES = AI_SURFACES.map((s) => s.id);

// ── The maps resolve ────────────────────────────────────────────────────
// A key that matches nothing is the failure mode sparse overrides invite:
// nothing throws, nothing renders differently, and the stale note stays.
console.log("\nEvery override lands on something");
let overrides = 0;
for (const p of doc)
  for (const sf of SURFACES) {
    const e = p.surfaces?.[sf];
    if (!e) { bad(`${p.name}: no answer for ${sf}`); continue; }
    for (const k of Object.keys(e)) {
      if (!["verdict", "note", "states", "controls"].includes(k))
        bad(`${p.name} · ${sf}: unknown key "${k}"`);
    }
    // The grade is the obligation and does not move. A string map can't carry
    // one, so this is the guard that nobody turns it into an object map later.
    for (const [a, v] of Object.entries(e.controls ?? {})) {
      overrides++;
      if (typeof v !== "string")
        bad(`${p.name} · ${sf} · ${a}: override is not a plain note — a grade cannot move per surface`);
      if (!AXES.includes(a)) bad(`${p.name} · ${sf}: no axis "${a}"`);
      else if (!p.controls?.[a]) bad(`${p.name} · ${sf}: overrides "${a}", which the pattern doesn't grade`);
      else if (v === p.controls[a].note) bad(`${p.name} · ${sf} · ${a}: override is identical to the note it replaces`);
    }
    for (const [s, v] of Object.entries(e.states ?? {})) {
      overrides++;
      if (typeof v !== "string") bad(`${p.name} · ${sf} · ${s}: override is not a note`);
      const st = p.states.find((x) => x.id === s);
      if (!st) bad(`${p.name} · ${sf}: no state "${s}"`);
      else if (v === st.note) bad(`${p.name} · ${sf} · ${s}: override is identical to the note it replaces`);
    }
    // An override on a surface with no drawing can never be read: the strip
    // only offers a second drawing, so there is no tab that reaches it.
    const reachable = e.verdict !== "holds" && Boolean(PATTERN_PREVIEWS[p.id]?.surfaces?.[sf]);
    if (!reachable && (e.states || e.controls))
      bad(`${p.name} · ${sf}: overrides a column no tab can reach`);
  }
console.log(`       ${overrides} overrides across ${doc.length} patterns`);

// ── Nothing screen-bound survives on voice ──────────────────────────────
// The point of the mechanism. These run over the RESOLVED text, so a note
// nobody thought to override fails here rather than in somebody's screenshot.
console.log("\nThe column reads for the surface it is standing on");
const VISUAL = [
  "on screen", "hover", "click", "chip", "grey outline", "outline", "layout",
  "column", "inline", "badge", "marker", "highlight", "underline", "tab",
  "scroll", "keystroke", "placeholder", "at a glance", "look different",
  "three screens", "half-drawn", "shifted", "grey", "blank", "dashed",
];
// Canvas is still something you look at, so almost nothing visual is wrong
// there. What IS wrong is a note that arrived from the voice column.
const SPOKEN = ["out loud", "read aloud", "spoken", "by ear", "one syllable", "said back", "talking over"];

const resolve = (p, sf) => {
  const e = sf === "screen" ? null : p.surfaces?.[sf];
  return [
    ...p.states.map((s) => [s.label, e?.states?.[s.id] ?? s.note]),
    ...AXES.filter((a) => p.controls?.[a]?.note).map((a) => [a, e?.controls?.[a] ?? p.controls[a].note]),
  ];
};

let read = 0;
for (const p of doc)
  for (const sf of SURFACES) {
    const e = p.surfaces[sf];
    if (e.verdict === "holds" || !PATTERN_PREVIEWS[p.id]?.surfaces?.[sf]) continue;
    const banned = sf === "voice" ? VISUAL : SPOKEN;
    for (const [where, text] of resolve(p, sf)) {
      read++;
      for (const t of banned)
        if (new RegExp(`\\b${t}`, "i").test(text))
          bad(`${p.name} · ${sf} · ${where}: "${t}" — ${text.slice(0, 72)}…`);
    }
  }
console.log(`       ${read} notes read on a surface that has a drawing`);

// ── The screen is untouched ─────────────────────────────────────────────
// Falling through by key means the screen column must still be exactly the
// pattern's own notes — an override leaking onto it would be the reverse bug.
console.log("\nThe screen still reads the pattern's own notes");
for (const p of doc)
  for (const [where, text] of resolve(p, "screen")) {
    const own = p.states.find((s) => s.label === where)?.note ?? p.controls?.[where]?.note;
    if (text !== own) bad(`${p.name} · ${where}: the screen column is not the pattern's own note`);
  }

// ── The new strings hold the house line ─────────────────────────────────
// ~100 sentences went in at once, which is the largest single lump of copy
// this hub has taken. They are read in the same column as the originals, so
// they answer to the same rules.
console.log("\nThe overrides hold the house line");
const JARGON = ["skeleton", "token", "hunk", "threshold", "provenance", "latency", "payload", "inference", "endpoint"];
const FIRST_PERSON = /\b(I'm|I'll|I've|I'd|I can|I cannot|I can't|I found|I think|let me|my apologies)\b/i;
let strings = 0, longest = 0;
for (const p of doc)
  for (const sf of SURFACES) {
    const e = p.surfaces[sf];
    for (const [k, v] of [...Object.entries(e.states ?? {}), ...Object.entries(e.controls ?? {})]) {
      strings++;
      longest = Math.max(longest, v.split(/\s+/).length);
      for (const j of JARGON)
        if (new RegExp(`\\b${j}`, "i").test(v)) bad(`${p.name} · ${sf} · ${k}: jargon "${j}"`);
      if (FIRST_PERSON.test(v)) bad(`${p.name} · ${sf} · ${k}: first-person model voice`);
      // The surface's own answer sits below the lab in "On other surfaces".
      // An override repeating it is the page saying one thing twice.
      if (v === e.note) bad(`${p.name} · ${sf} · ${k}: repeats the surface answer verbatim`);
      // Same for the sibling surface: a copied override is a real slip, and
      // it would be invisible because both columns would read plausibly.
      for (const other of SURFACES)
        if (other !== sf && Object.values({ ...(p.surfaces[other].states ?? {}), ...(p.surfaces[other].controls ?? {}) }).includes(v))
          bad(`${p.name} · ${sf} · ${k}: identical to the ${other} override`);
    }
  }
console.log(`       ${strings} new strings, longest ${longest} words`);

// ── The grades never moved ──────────────────────────────────────────────
console.log("\nThe grade is the obligation, on every surface");
for (const p of doc)
  for (const a of AXES) {
    const g = p.controls?.[a]?.grade;
    if (!g) bad(`${p.name}: no grade for ${a}`);
    else if (!CONTROL_GRADES[g]) bad(`${p.name} · ${a}: unknown grade "${g}"`);
  }
console.log(`       ${doc.length * AXES.length} grades, none per-surface`);

console.log(fails ? `\n${fails} FAILED\n` : "\nall passed\n");
process.exit(fails ? 1 : 0);
