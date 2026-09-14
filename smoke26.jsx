// smoke26 — the copy sweep CLAUDE.md asks for after any copy change, run over
// the *previews* rather than the data. An audit of the data surfaces alone is
// what let a rationale caption survive on nine wireframes; these are the ~290
// strings only a rendered preview shows.
//
// Three checks, all derived from the rendered text so a wireframe that starts
// speaking in the model's voice fails here rather than in review:
//
//   1. no first-person model voice — a product that isn't a chatbot has no "I"
//   2. no jargon in a user-facing string
//   3. no canvas string that restates the panel note two inches to its right,
//      which is the automatable half of "no caption that explains the pattern"
import { renderToString } from "react-dom/server";
import { AI_PATTERNS } from "./src/data/aiPatterns.js";
import { PATTERN_PREVIEWS } from "./src/components/ai/previews/index.js";

// Rendering a preview means building the surface that reads as the state you
// want, because a state is no longer something a preview can be handed — it is
// what its data adds up to. `set` is a no-op: these are render checks, and the
// moves are smoke29's.
const draw1 = (C, id) =>
  renderToString(<C state={id} work={C.work ? C.work.for(id) : undefined} set={() => {}} />);

let fails = 0;
const bad = (msg) => { fails++; console.log(`FAIL  ${msg}`); };

// The visible text of one rendered state, tags stripped and entities undone.
const visible = (html) =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const words = (s) => s.toLowerCase().replace(/[^a-z0-9' ]/g, " ").split(/\s+/).filter(Boolean);
const shingles = (s, n) => {
  const w = words(s);
  const out = new Set();
  for (let i = 0; i + n <= w.length; i++) out.add(w.slice(i, i + n).join(" "));
  return out;
};

// Explain the term in the same sentence or don't use it.
const JARGON = [
  "skeleton", "token", "hunk", "threshold", "provenance", "latency",
  "payload", "false positive", "prompt injection", "inference", "endpoint",
];
// A product surface has no first person — but the *user's* does. A prompt they
// typed ("What did I spend on food?"), a note they wrote ("my half of the
// table") and a question used as a frame title are all first person and all
// correct. What's banned is the product claiming a self, so the test looks for
// first-person *agency* rather than for the pronoun.
const FIRST_PERSON =
  /\b(I'm|I'll|I've|I'd|I can|I cannot|I can't|I couldn't|I found|I think|I believe|I understand|I apologi|let me|my apologies)\b/i;

const documented = AI_PATTERNS.filter((p) => p.status === "documented");

// ── Definitions ─────────────────────────────────────────────────────────
// One sentence, 30 words, no terms of art. This is the section description —
// the first thing anybody reads — and a single wrong word in it teaches the
// whole pattern wrongly: "what the AI is *allowed* to look at" had readers
// taking Visible Sources for a consent screen, because "allowed" is permission
// vocabulary and the checkboxes then confirmed it.
console.log("\nDefinitions land cold: one sentence, <=30 words, no terms of art");
const LOADED = ["allowed", "permission", "authorise", "authorize", "consent", "grant access"];
for (const p of documented) {
  const d = p.definition ?? "";
  const n = d.split(/\s+/).filter(Boolean).length;
  if (n > 30) bad(`${p.name}: definition is ${n} words`);
  // Em dashes are house style and don't end a sentence; full stops do.
  if ((d.match(/\.\s+[A-Z]/g) || []).length)
    bad(`${p.name}: definition is more than one sentence`);
  for (const w of LOADED)
    if (new RegExp(`\\b${w}`, "i").test(d)) bad(`${p.name}: definition says "${w}"`);
}
console.log(`       ${documented.length} definitions, longest ${Math.max(...documented.map((p) => (p.definition ?? "").split(/\s+/).length))} words`);
// ── The surface answers ────────────────────────────────────────────────
// Twenty-eight strings that nothing else reads. They are held to the same rules
// as the rest of the hub's copy — plain words, no model voice — plus one of
// their own: an answer for another surface has to say something the pattern's
// own definition doesn't, or it is the page repeating itself under a heading.
console.log("\nSurface answers are plain, and say something new");
{
  let swept = 0;
  for (const p of documented)
    for (const [id, e] of Object.entries(p.surfaces ?? {})) {
      swept++;
      const note = e.note ?? "";
      for (const j of JARGON)
        if (new RegExp(`\\b${j}`, "i").test(note)) bad(`${p.name} · ${id}: jargon "${j}"`);
      if (FIRST_PERSON.test(note)) bad(`${p.name} · ${id}: first-person model voice`);
      // Terms of art a surface note is especially prone to. Every one of these
      // was reached for while writing them.
      for (const t of ["utterance", "barge-in", "earcon", "multimodal", "modality", "affordance"])
        if (new RegExp(`\\b${t}`, "i").test(note)) bad(`${p.name} · ${id}: term of art "${t}"`);
      // Five consecutive words shared with the definition is the page saying
      // the same thing twice under a different heading.
      const shared = [...shingles(note, 5)].filter((x) => shingles(p.definition ?? "", 5).has(x));
      if (shared.length) bad(`${p.name} · ${id}: restates the definition — "${shared[0]}…"`);
    }
  console.log(`       ${swept} surface answers swept`);
}

console.log(`\nSweeping ${documented.length} documented patterns\n`);

let states = 0, strings = 0, overlaps = 0;

for (const p of documented) {
  const Preview = PATTERN_PREVIEWS[p.id];
  if (!Preview) { bad(`${p.name}: documented but has no preview`); continue; }

  // What sits *beside* the canvas: the definition in the section head, the
  // state note in the properties column, the control notes under it. A canvas
  // string that repeats any of this is read twice, two inches apart, which is
  // the duplication worth failing a build over.
  //
  // Decisions are deliberately not in here. They sit well below the lab, and
  // `shows` exists precisely so a decision can point at the state that
  // demonstrates it — quoting the line the canvas draws is that link working,
  // not a leak. They get a longer window and a warning instead.
  const panel = [
    p.definition,
    ...p.states.map((s) => s.note),
    ...(p.controls ? Object.values(p.controls).map((c) => c?.note) : []),
  ].filter(Boolean).join(" ");
  const panelShingles = shingles(panel, 5);
  const decisionShingles = shingles(
    (p.decisions ?? []).flatMap((d) => [d.loka, d.why]).filter(Boolean).join(" "), 12);

  // Every drawing of this pattern, on every surface it has one for. A voice
  // wireframe is as capable of speaking in the model's voice as a screen one —
  // more so, since the words are all there is on it.
  const drawings = [Preview, ...Object.values(Preview.surfaces ?? {})];

  for (const st of p.states) {
    states++;
    // The work comes from the pattern, not from the drawing: a surface variant
    // runs off its pattern's states, which is the whole mechanism — so it has
    // no `work` of its own to read.
    const w = Preview.work ? Preview.work.for(st.id) : undefined;
    const text = drawings
      .map((C) => visible(renderToString(<C state={st.id} work={w} set={() => {}} />)))
      .join(" ");
    strings++;

    if (FIRST_PERSON.test(text))
      bad(`${p.name} · ${st.label}: first-person model voice — ${text.match(FIRST_PERSON)[0]}`);

    for (const j of JARGON)
      if (new RegExp(`\\b${j}`, "i").test(text))
        bad(`${p.name} · ${st.label}: jargon "${j}"`);

    // Five consecutive words shared with the properties column. Six was tried
    // and let two of the three known duplicates through — "…you'd tell
    // somebody to ignore" reappeared on the canvas at five. Product nouns
    // ("Northwind Ltd", "1,240 subscribers") never run that long against a
    // note; an argument copied onto the wireframe does.
    const shared = [...shingles(text, 5)].filter((s) => panelShingles.has(s));
    if (shared.length) {
      overlaps++;
      bad(`${p.name} · ${st.label}: restates the panel — "${shared[0]}…"`);
    }
    // Twelve words is a whole sentence carried across, which is longer than a
    // decision needs to quote the thing it points at.
    const long = [...shingles(text, 12)].filter((s) => decisionShingles.has(s));
    if (long.length) bad(`${p.name} · ${st.label}: a decision repeats a whole line — "${long[0]}…"`);
  }
}

console.log(`\n${states} states swept, ${overlaps} restating the panel`);
console.log(fails ? `\n${fails} FAILED\n` : "\nall passed\n");
process.exit(fails ? 1 : 0);
