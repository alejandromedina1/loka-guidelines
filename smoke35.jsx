// smoke35 — Principles and anti-patterns, after PRINCIPLES-AUDIT.md.
//
// The audit found the writing strong and the structure two documents bolted
// onto a playground: principles as prose with nothing to look at, anti-patterns
// as drawings of the mistake with the fix as a sentence, and no link between
// the two or from a pattern page to either. This pins the fixes — one view,
// every anti-pattern under the principle it breaks and beside the pattern
// state that fixes it, links both ways — and the content templates.
import { renderToString } from "react-dom/server";
import fs from "node:fs";
import { AI_PATTERNS } from "./src/data/aiPatterns.js";
import { AI_PRINCIPLES, principleFor } from "./src/data/aiPrinciples.js";
import { AI_ANTIPATTERNS } from "./src/data/aiAntipatterns.js";
import { ANTIPATTERN_FIGURES } from "./src/components/ai/antipatterns/index.jsx";
import { PATTERN_PREVIEWS } from "./src/components/ai/previews/index.js";
import { AiPrinciplesSection } from "./src/components/sections/AiPrinciplesSection.jsx";
import { PatternDetail } from "./src/components/ai/PatternDetail.jsx";

let fails = 0;
const bad = (m) => { fails++; console.log(`FAIL  ${m}`); };
const ok = (m, c, n) => (c ? console.log(`  ok  ${m}${n ? ` — ${n}` : ""}`) : bad(`${m}${n ? ` — ${n}` : ""}`));
const quiet = (fn) => { const e = console.error; console.error = () => {}; try { return fn(); } finally { console.error = e; } };
// Words as a reader counts them: a dash is punctuation, not a word.
const words = (s) => String(s).split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
const doc = AI_PATTERNS.filter((p) => p.status === "documented");

// ── The templates ──────────────────────────────────────────────────────
console.log("\nPrinciples and anti-patterns keep to their templates");
{
  const LIMITS = { title: 7, statement: 20, why: 30 };
  for (const p of AI_PRINCIPLES) {
    for (const [k, n] of Object.entries(LIMITS))
      if (!p[k] || words(p[k]) > n) bad(`${p.title}: ${k} is ${words(p[k] ?? "")} words, the template is ≤${n}`);
    // One paragraph was the old shape, and the reason the page was a wall.
    if ("body" in p) bad(`${p.title}: still carries a body paragraph`);
  }
  const ALIMITS = { looks: 15, why: 20, example: 20 };
  for (const a of AI_ANTIPATTERNS) {
    for (const [k, n] of Object.entries(ALIMITS))
      if (!a[k] || words(a[k]) > n) bad(`${a.name}: ${k} is ${words(a[k] ?? "")} words, the template is ≤${n}`);
    // The fixed drawing is the instead; a sentence beside it says it twice.
    if ("instead" in a) bad(`${a.name}: still carries an "instead" sentence beside its drawn fix`);
  }
  ok(`${AI_PRINCIPLES.length} principles and ${AI_ANTIPATTERNS.length} anti-patterns checked`, true);
  // The house voice, on the strings the audit rewrote.
  const JARGON = ["skeleton", "token", "hunk", "threshold", "provenance", "latency", "payload", "inference", "endpoint"];
  const FIRST = /\b(I'm|I'll|I've|I can|I think|let me)\b/;
  for (const s of [...AI_PRINCIPLES.flatMap((p) => [p.title, p.statement, p.why]),
                   ...AI_ANTIPATTERNS.flatMap((a) => [a.name, a.looks, a.why, a.example])]) {
    for (const j of JARGON) if (new RegExp(`\\b${j}`, "i").test(s)) bad(`jargon "${j}": ${s}`);
    if (FIRST.test(s)) bad(`first-person voice: ${s}`);
  }
  ok("…in the house voice", true);
}

// ── Every pattern under exactly one principle ──────────────────────────
// So a pattern page can say which principle it puts into practice without a
// list to choose from. Some sat under two before.
console.log("\nEvery documented pattern sits under exactly one principle");
{
  for (const p of doc) {
    const under = AI_PRINCIPLES.filter((x) => x.applies.includes(p.id));
    if (under.length !== 1) bad(`${p.name}: under ${under.length} principles (${under.map((x) => x.title).join(", ")})`);
    else if (principleFor(p.id) !== under[0]) bad(`${p.name}: principleFor disagrees`);
  }
  for (const x of AI_PRINCIPLES)
    for (const id of x.applies) if (!doc.some((p) => p.id === id)) bad(`${x.title}: applies "${id}", not a documented pattern`);
  ok(`${doc.length} patterns, one principle each`, true);
}

// ── Every anti-pattern is paired both ways ─────────────────────────────
console.log("\nEvery anti-pattern breaks a principle and is fixed by a real pattern state");
{
  for (const a of AI_ANTIPATTERNS) {
    if (!AI_PRINCIPLES.some((p) => p.id === a.breaks)) bad(`${a.name}: breaks "${a.breaks}", no such principle`);
    const pat = AI_PATTERNS.find((p) => p.id === a.fixedBy?.pattern);
    const st = pat?.states.find((s) => s.id === a.fixedBy?.state);
    if (!pat || !st) { bad(`${a.name}: fixedBy ${JSON.stringify(a.fixedBy)} is not a real pattern state`); continue; }
    // The fixed drawing goes through work.for, so it must read as that state.
    const W = PATTERN_PREVIEWS[pat.id]?.work;
    if (W && W.state(W.for(st.id)) !== st.id) bad(`${a.name}: ${pat.name} · ${st.label} doesn't draw as itself`);
    if (!ANTIPATTERN_FIGURES[a.id]) bad(`${a.name}: no broken figure`);
  }
  for (const id of Object.keys(ANTIPATTERN_FIGURES))
    if (!AI_ANTIPATTERNS.some((a) => a.id === id)) bad(`figure "${id}" has no anti-pattern`);
  // Every principle can be seen failing; a rule with no failure is a rule no
  // review can catch being broken.
  for (const p of AI_PRINCIPLES)
    if (!AI_ANTIPATTERNS.some((a) => a.breaks === p.id)) bad(`${p.title}: no anti-pattern breaks it`);
  ok("every pair resolves, and every principle has a way to break", true);
}

// ── One view, drawn as pairs ───────────────────────────────────────────
console.log("\nPrinciples is one view: each rule, the ways it breaks, drawn broken beside fixed");
{
  const h = quiet(() => renderToString(<AiPrinciplesSection registerRef={() => {}} onSelectAiPattern={() => {}} />));
  const pairs = [...h.matchAll(/<article class="ai-pair">[^]*?<\/article>/g)].map((m) => m[0]);
  ok(`${pairs.length} pairs drawn, one per anti-pattern`, pairs.length === AI_ANTIPATTERNS.length);
  for (const [n, pr] of pairs.entries()) {
    const a = AI_ANTIPATTERNS.find((x) => pr.includes(`>${x.name}<`));
    const cells = pr.match(/<figure class="ai-pair-cell">/g)?.length ?? 0;
    if (!a) { bad(`pair ${n + 1}: no anti-pattern name`); continue; }
    if (cells !== 2) bad(`${a.name}: ${cells} drawings, a pair is 2`);
    if (!pr.includes(">Broken<")) bad(`${a.name}: the broken drawing isn't labelled in words`);
    const pat = AI_PATTERNS.find((p) => p.id === a.fixedBy.pattern);
    const st = pat.states.find((s) => s.id === a.fixedBy.state);
    if (!pr.includes(`>Fixed · ${pat.name}<`)) bad(`${a.name}: the fix isn't labelled with its pattern`);
    if (!pr.includes(`>Try it on ${st.label}<`)) bad(`${a.name}: no way to try the fix`);
    // Both drawings are pictures: out of the tab order and the tree.
    const figs = pr.match(/<div class="ai-pair-fig"[^>]*>/g) ?? [];
    if (!figs.every((f) => /aria-hidden="true"/.test(f) && /inert=""/.test(f))) bad(`${a.name}: a drawing is reachable`);
  }
  ok("…each one labelled Broken and Fixed, inert, with a way to try the fix", true);
  // The counts lived in the copy and went stale the moment one was added.
  const head = h.slice(0, h.indexOf('class="ai-prins"'));
  ok("no count is written into the page's own description", !/\b(six|seven|nine|ten)\b/i.test(head));
  ok("the five axes share the pattern pages' name for them", h.includes(">What it lets people do<"));
  const css = fs.readFileSync("./src/styles/global.css", "utf8");
  ok("no figure is shrunk with zoom", !/\.ai-(anti|pair)-fig \.mk-frame\{[^}]*zoom/.test(css) && !/ai-anti-fig/.test(css));
  ok("…and the sequence number spends no blue", !/\.ai-prin-num\{[^}]*--blue/.test(css));
  const nav = fs.readFileSync("./src/data/navigation.js", "utf8");
  const app = fs.readFileSync("./src/App.jsx", "utf8");
  ok("there is no separate Anti-patterns view", !nav.includes('"ai-antipatterns"') && !app.includes("AiAntipatternsSection"));
}

// ── Links both ways ────────────────────────────────────────────────────
console.log("\nA pattern page says which principle it puts into practice, and what it fixes");
{
  const p = AI_PATTERNS.find((x) => x.id === "approval-gate");
  const h = quiet(() => renderToString(<PatternDetail pattern={p} onSelectComponent={() => {}} onSelectAiPattern={() => {}} />));
  const line = (h.match(/<p class="ai-dec-why-line">[^]*?<\/p>/) || [""])[0].replace(/<[^>]+>/g, "");
  // The line can go on — a pattern merged from the By capability view adds
  // what it serves and pairs with (smoke36) — so this pins how it opens.
  ok("Approval Gate names its principle and the anti-pattern it fixes",
    line.startsWith("Puts into practice Gate on consequence, not on confidence. Fixes the rubber stamp."), line);
  const two = AI_PATTERNS.find((x) => x.id === "grounded-answer");
  const h2 = quiet(() => renderToString(<PatternDetail pattern={two} onSelectComponent={() => {}} onSelectAiPattern={() => {}} />));
  const line2 = (h2.match(/<p class="ai-dec-why-line">[^]*?<\/p>/) || [""])[0].replace(/<[^>]+>/g, "");
  ok("…and a pattern that fixes two lists both", /Fixes the silent fallback and the decorative citation\.( Serves |$)/.test(line2), line2);
  let missing = 0;
  for (const q of doc) {
    const hq = quiet(() => renderToString(<PatternDetail pattern={q} onSelectComponent={() => {}} onSelectAiPattern={() => {}} />));
    if (!hq.includes('class="ai-dec-why-line"')) missing++;
  }
  ok("every pattern page links to its principle", missing === 0, `${missing} without`);
  const search = fs.readFileSync("./src/hooks/useSearch.js", "utf8");
  ok("search indexes principles and anti-patterns, each landing on its own anchor",
    /AI_PRINCIPLES\.forEach[^]*anchor: `principle-\$\{p\.id\}`/.test(search) &&
    /AI_ANTIPATTERNS\.forEach[^]*anchor: `antipattern-\$\{a\.id\}`/.test(search));
}

console.log(fails ? `\n${fails} FAILED\n` : "\nall passed\n");
process.exit(fails ? 1 : 0);
