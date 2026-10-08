// smoke31 — can you tell the patterns apart with every word removed?
//
// smoke25 already asks this of Clear Refusal's four states, and it was written
// because that pattern had been four identical callouts with different
// sentences in them for a long time: rewriting the words would never have
// fixed it. This is the same test pointed at the whole shelf, and it found the
// same failure in five more places.
//
// The claim it defends is the hub's own thesis — **show more, tell less**. A
// pattern library whose drawings are interchangeable is a glossary with
// pictures, and the way that happens is never deliberate. It happens at the
// states where there is nothing obvious to draw: "nothing found", "finished",
// "restored". The kit has a callout, the callout takes a title and a body, and
// the argument quietly moves out of the drawing and into a sentence.
//
// Measured before the first pass: 6 states whose nearest wordless twin in
// ANOTHER pattern scored over 60%, the worst at 76% — Undo & History's
// *Restoring* was drawn the same way as No Good Match's *Nothing above the
// bar*, in different categories, on different subjects. Two passes later the
// worst is 41% and the whole shelf sits between 8% and 32%, so the ceiling has
// come down twice. Keep doing that.
import { renderToString } from "react-dom/server";
import { AI_PATTERNS } from "./src/data/aiPatterns.js";
import { PATTERN_PREVIEWS } from "./src/components/ai/previews/index.js";

let fails = 0;
const bad = (m) => { fails++; console.log(`FAIL  ${m}`); };
const ok = (m, cond, note) => (cond ? console.log(`  ok  ${m}${note ? ` — ${note}` : ""}`) : bad(`${m}${note ? ` — ${note}` : ""}`));

const doc = AI_PATTERNS.filter((p) => p.status === "documented");

// Tags and classes, no language of any kind — including the attributes that
// carry language (labels, titles, placeholders), or a wireframe could pass by
// having a differently-worded aria-label.
const skeleton = (html) =>
  html
    .replace(/>[^<]*</g, "><")
    .replace(/(aria-label|title|placeholder|alt)="[^"]*"/g, "")
    .replace(/<!--[^>]*-->/g, "");

// Structural shingles: the same boxes in the same ORDER. A looser measure
// counts two drawings alike for both containing a button.
const shingle = (s, n = 4) => {
  const t = s.match(/<[a-z]+[^>]*>/g) ?? [];
  const out = new Set();
  for (let i = 0; i + n <= t.length; i++) out.add(t.slice(i, i + n).join(""));
  return out;
};
const sim = (a, b) => {
  const A = shingle(a), B = shingle(b);
  if (!A.size || !B.size) return 0;
  return [...A].filter((x) => B.has(x)).length / new Set([...A, ...B]).size;
};

const rows = [];
for (const p of doc) {
  const C = PATTERN_PREVIEWS[p.id];
  if (!C) { bad(`${p.name}: documented with no preview`); continue; }
  for (const st of p.states)
    rows.push({
      pattern: p.name,
      state: st.label,
      s: skeleton(renderToString(<C state={st.id} work={C.work ? C.work.for(st.id) : undefined} set={() => {}} />)),
    });
}

console.log(`\nEvery state, against every state of every other pattern — ${rows.length} drawings`);

// The ceiling. Two patterns may legitimately share a shape — Approval Gate and
// Plan Preview are relatives, and Plan Preview's own "avoid when" says a
// one-step plan IS an Approval Gate — so this is not set at zero. It is set
// where a reader would stop being able to tell which pattern they are looking
// at, and it ratchets down rather than up: if a pass lowers the real maximum,
// lower this with it.
const CEILING = 0.45;

const near = rows.map((r) => {
  let best = { j: -1, o: null };
  for (const o of rows) {
    if (o.pattern === r.pattern) continue;
    const j = sim(r.s, o.s);
    if (j > best.j) best = { j, o };
  }
  return { ...r, ...best };
});
near.sort((a, b) => b.j - a.j);

for (const n of near.filter((x) => x.j > CEILING))
  bad(`${n.pattern} · ${n.state} is ${(n.j * 100).toFixed(0)}% the same drawing as ${n.o.pattern} · ${n.o.state}`);

const worst = near[0];
ok("no state is mistakable for one in another pattern", worst.j <= CEILING,
  `worst ${(worst.j * 100).toFixed(0)}% — ${worst.pattern} · ${worst.state} ≈ ${worst.o.pattern} · ${worst.o.state}`);

const med = near[Math.floor(near.length / 2)].j;
ok("…and the middle of the shelf is nowhere near it", med < 0.3, `median ${(med * 100).toFixed(0)}%`);

// A pattern that is distinct from its neighbours but identical to ITSELF has
// the opposite problem: the lab walks between states that draw the same thing.
console.log("\nA pattern's own states are drawings of different things");
// Two states drawing the same thing is usually a state that was never really
// designed. Once it is not — and there is exactly one — the exemption is a
// claim with a reason, the same shape smoke28 uses for a part a wireframe
// genuinely cannot draw. It is also checked rather than trusted: the two
// states still have to differ in what they SAY, or the lab really would be
// showing one frame under two names.
const SAME_ON_PURPOSE = {
  "Typing Ahead|Typing|Dismissed":
    "rejection is silence, so the product does the identical thing in both — the " +
    "difference is the user's own sentence getting longer past a suggestion that " +
    "is no longer there. Anything on the frame marking it as dismissed would be " +
    "the dialog this pattern exists to avoid, and its own state note says so.",
};
for (const p of doc) {
  const mine = rows.filter((r) => r.pattern === p.name);
  for (let i = 0; i < mine.length; i++)
    for (let j = i + 1; j < mine.length; j++) {
      if (mine[i].s !== mine[j].s) continue;
      const key = `${p.name}|${mine[i].state}|${mine[j].state}`;
      const why = SAME_ON_PURPOSE[key];
      if (!why) { bad(`${p.name}: two states render identically — ${mine[i].state} = ${mine[j].state}`); continue; }
      // An exemption for structure is not an exemption for saying nothing: the
      // two frames still have to read differently, or the lab is showing one
      // drawing under two names.
      const C = PATTERN_PREVIEWS[p.id];
      const words = (id) => {
        const st = p.states.find((x) => x.label === id);
        return renderToString(<C state={st.id} work={C.work ? C.work.for(st.id) : undefined} set={() => {}} />)
          .replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
      };
      if (words(mine[i].state) === words(mine[j].state))
        bad(`${p.name}: ${mine[i].state} and ${mine[j].state} are the same frame in every respect`);
      console.log(`  note  ${p.name}: ${mine[i].state} and ${mine[j].state} draw alike — ${why}`);
    }
}
ok(`${doc.length} patterns, no state drawn twice without a reason`, true);

console.log(fails ? `\n${fails} FAILED\n` : "\nall passed\n");
process.exit(fails ? 1 : 0);
