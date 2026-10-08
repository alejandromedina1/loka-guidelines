// smoke34 — the page under the playground, after CONTENT-AUDIT.md.
//
// The audit found the writing good and the frame around it wrong: five folded
// rows, two of which repeated the playground word for word (the surface notes
// are the Surface switch's caption, the parts are the anatomy's labels), and
// the three that mattered hidden behind a click each. This file pins the fixes
// — two open blocks, the surfaces and parts in the playground, Control & trust
// read as decisions — and the content rules the audit wrote templates for.
import { renderToString } from "react-dom/server";
import fs from "node:fs";
import { AI_PATTERNS, CONTROL_AXES, patternKeywords } from "./src/data/aiPatterns.js";
import { PATTERN_PREVIEWS } from "./src/components/ai/previews/index.js";
import { PartsContext } from "./src/components/ai/previews/kit.jsx";
import { PatternDetail } from "./src/components/ai/PatternDetail.jsx";

let fails = 0;
const bad = (m) => { fails++; console.log(`FAIL  ${m}`); };
const ok = (m, c, n) => (c ? console.log(`  ok  ${m}${n ? ` — ${n}` : ""}`) : bad(`${m}${n ? ` — ${n}` : ""}`));
const quiet = (fn) => { const e = console.error; console.error = () => {}; try { return fn(); } finally { console.error = e; } };
const doc = AI_PATTERNS.filter((p) => p.status === "documented");
const page = (p) => quiet(() => renderToString(<PatternDetail pattern={p} onSelectComponent={() => {}} onSelectAiPattern={() => {}} />));
const below = (h) => h.slice(h.indexOf('class="pt-more"'), h.indexOf('class="ai-pager"'));

// ── When to use it: real situations, and somewhere to go instead ───────
console.log("\nWhen to use it is three situations and two avoids, and an avoid points somewhere");
{
  for (const p of doc) {
    if (p.useWhen.length < 3) bad(`${p.name}: ${p.useWhen.length} Use when, the template is 3`);
    if (p.avoidWhen.length < 2) bad(`${p.name}: ${p.avoidWhen.length} Avoid when, the template is 2`);
    // "Always" was Clear Refusal's only Use when: true, and not a situation.
    for (const t of p.useWhen) if (/^always\b/i.test(t.lead)) bad(`${p.name}: "${t.lead}" is a statement, not a situation`);
    for (const t of p.avoidWhen)
      if (t.instead && (t.instead === p.id || !AI_PATTERNS.some((x) => x.id === t.instead)))
        bad(`${p.name} · ${t.lead}: instead "${t.instead}" is not another pattern`);
  }
  const n = doc.flatMap((p) => p.avoidWhen).filter((t) => t.instead).length;
  ok(`every pattern has 3 + 2, and ${n} avoids name the pattern to use instead`, true);
  const h = page(AI_PATTERNS.find((p) => p.id === "graceful-refusal"));
  ok("…rendered as a way there", h.includes(">Use Known Limits instead<"));
}

// ── Decisions, and the control axes read as decisions ──────────────────
console.log("\nDecisions are five at most, and every link lands on a real state");
{
  for (const p of doc) {
    const ids = new Set(p.states.map((s) => s.id));
    if (p.decisions.length > 5) bad(`${p.name}: ${p.decisions.length} decisions, the template is 5`);
    for (const d of p.decisions) if (d.shows && !ids.has(d.shows)) bad(`${p.name} · ${d.q}: shows "${d.shows}", no such state`);
    for (const a of CONTROL_AXES) {
      const c = p.controls?.[a.id];
      if (!c?.note) bad(`${p.name} · ${a.label}: no note — a grade without a reason reads as not done yet`);
      if (c?.shows && !ids.has(c.shows)) bad(`${p.name} · ${a.label}: shows "${c.shows}", no such state`);
      if (c?.shows && c.grade === "na") bad(`${p.name} · ${a.label}: a link on an axis that doesn't apply`);
    }
  }
  const links = doc.flatMap((p) => CONTROL_AXES.map((a) => p.controls[a.id])).filter((c) => c.shows).length;
  ok(`${links} control axes link to the state that meets them`, links > 0);
}

// ── The page: two open blocks, nothing folded, nothing said twice ──────
console.log("\nUnder the playground: When to use it and Decisions, open");
{
  for (const p of doc) {
    const b = below(page(p));
    if (b.includes("<details")) bad(`${p.name}: something under the playground is folded again`);
    const heads = [...b.matchAll(/<h3 class="group-title">([^<]*)<\/h3>/g)].map((m) => m[1]);
    if (heads.join("|") !== "When to use it|Decisions") bad(`${p.name}: blocks are ${heads.join(", ")}`);
    // The two blocks that repeated the playground stay gone.
    for (const gone of ["On other surfaces", "Composed from", "Control &amp; trust"])
      if (b.includes(`>${gone}<`)) bad(`${p.name}: "${gone}" is back under the playground`);
    // Control & trust: graded axes are rows with the grade in words, an axis
    // that doesn't apply is one line, and no row says N/A.
    const na = CONTROL_AXES.filter((a) => p.controls[a.id].grade === "na");
    const naLines = (b.match(/<ul class="ai-dec-na"[^]*?<\/ul>/) || [""])[0].match(/<li>/g)?.length ?? 0;
    if (naLines !== na.length) bad(`${p.name}: ${na.length} axes don't apply, ${naLines} lines say so`);
    if (/class="ai-dec-n">N\/A</.test(b)) bad(`${p.name}: a row graded N/A`);
    if (b.includes("ai-grade-chip")) bad(`${p.name}: a grade chip under the playground`);
  }
  ok(`${doc.length} pages checked`, true);
  const h = page(AI_PATTERNS.find((p) => p.id === "inline-suggestion"));
  ok("…an axis reads as a decision row with its grade in words",
    /<span class="ai-dec-n">Required<\/span><span class="ai-dec-q">Undo<\/span>/.test(h));
  ok("…and links to its state", h.includes(">See it on Accepted<"));
}

// ── Surfaces are the Surface switch, on every pattern ──────────────────
// The block printed the caption the switch already showed. A surface the
// pattern holds to used to get no switch at all, which is why the block was
// the only place those ten answers lived; now the switch offers it, keeps the
// screen drawing, and the caption says it holds.
console.log("\nEvery pattern offers its surfaces, holds included");
{
  for (const p of doc) {
    const h = page(p);
    const seg = (h.match(/<span class="pg-segment" role="group" aria-label="Surface"[^]*?<\/span>/) || [""])[0];
    for (const label of ["Screen", "Voice", "Canvas"])
      if (!seg.includes(`>${label}<`)) bad(`${p.name}: Surface offers no ${label}`);
  }
  ok("Screen, Voice and Canvas offered on every pattern", true);
  const src = fs.readFileSync("./src/components/ai/PatternDetail.jsx", "utf8");
  ok("…a held surface draws the screen drawing, not a second one",
    /const Drawn = onScreen \|\| holds \? Preview :/.test(src));
}

// ── Parts are beside the anatomy, and pointing at one finds it ─────────
console.log("\nThe parts list lives with Show parts, and points at the frame");
{
  const src = fs.readFileSync("./src/components/ai/PatternDetail.jsx", "utf8");
  ok("the parts list renders only with Show parts on", /\{anatomy && \(\s*<div className="ai-pparts">/.test(src));
  ok("…each name goes to the Product Hub", /className="ai-ppart"[^]*?onClick=\{\(\) => onSelectComponent\(name\)\}/.test(src));
  ok("…and a part this state doesn't draw says so in words", src.includes("Not in this state"));
  // The pointing: a Part named by `focus` is marked, the others are not.
  const p = AI_PATTERNS.find((x) => x.id === "graceful-refusal");
  const P = PATTERN_PREVIEWS[p.id];
  const h = quiet(() => renderToString(
    <PartsContext.Provider value={{ on: true, names: p.composedOf, optional: p.optionalParts, focus: "Input Field" }}>
      <P state="ready" work={P.work.for("ready")} set={() => {}} sim="normal" />
    </PartsContext.Provider>
  ));
  const marked = [...h.matchAll(/<[a-z]+ class="mk-part"[^>]*>/g)].map((m) => m[0]);
  ok("…pointing at a part marks it on the frame, and only it",
    marked.some((t) => /data-label="Input Field"[^>]*data-focus=""/.test(t)) &&
    marked.filter((t) => t.includes("data-focus")).length === 1);
}

// ── Decisions are findable ─────────────────────────────────────────────
console.log("\nSearch finds a pattern by its decisions");
{
  const hit = (q) => AI_PATTERNS.filter((p) => patternKeywords(p).toLowerCase().includes(q)).map((p) => p.name);
  ok('"only tab" finds Typing Ahead', hit("only tab").includes("Typing Ahead"), hit("only tab").join(", "));
  ok('"waits for a boundary" finds Heads-Up', hit("waits for a boundary").includes("Heads-Up"));
  ok("…and the search index uses it", /keywords: \[?patternKeywords\(p\)/.test(fs.readFileSync("./src/hooks/useSearch.js", "utf8")));
}

console.log(fails ? `\n${fails} FAILED\n` : "\nall passed\n");
process.exit(fails ? 1 : 0);
