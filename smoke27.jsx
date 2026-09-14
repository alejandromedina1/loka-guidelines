// smoke27 — the flow model, built on slots. It is the only thing in the hub
// that still reasons about states as a list: everything about *being in* one is
// now derived from the surface's data, and smoke29 has that.
//
// A slot is a position in the run; the states inside one are the alternatives
// at that position. That is still the model, but what it has to make drawable
// has changed: the canvas no longer plays a route on a timer behind a segmented
// bar, it is operated. So the route, step-readout and unreached-segment checks
// are gone with the things they described, and what a slot now has to support
// is the tab strip — the variants at the position you are standing in, and
// nothing about the order of positions.
//
// The rest of the file is unchanged and still earns its keep: depth, parents,
// and the invariant that makes a slot well defined are what the tabs are
// computed from.
import { renderToString } from "react-dom/server";
import { AI_PATTERNS, AI_SURFACES, SURFACE_VERDICTS } from "./src/data/aiPatterns.js";
import { alternatives, depth, forks, isSet, path, slots } from "./src/data/flow.js";
import { PatternDetail } from "./src/components/ai/PatternDetail.jsx";

let fails = 0;
const ok = (n, c, d = "") => { if (!c) fails++; console.log(`${c ? "  ok  " : "FAIL  "}${n}${d ? ` — ${d}` : ""}`); };
const documented = AI_PATTERNS.filter((p) => p.status === "documented");
const byName = (n) => documented.find((p) => p.name === n);
// Renders a pattern through the real page shell — several checks below assert
// on the shipped markup rather than on the model alone.
const draw = (p) => renderToString(<PatternDetail pattern={p} onSelectComponent={() => {}} onSelectAiPattern={() => {}} />);

// ── The data is well formed ─────────────────────────────────────────────
console.log("\nEvery documented state carries a trigger and a resolvable parent");
let states = 0;
for (const p of documented) {
  const ids = new Set(p.states.map((s) => s.id));
  for (const st of p.states) {
    states++;
    if (!st.by) { fails++; console.log(`FAIL  ${p.name} · ${st.label}: no trigger`); }
    if (st.from && !ids.has(st.from)) { fails++; console.log(`FAIL  ${p.name} · ${st.label}: parent "${st.from}" doesn't exist`); }
    if (st.from === st.id) { fails++; console.log(`FAIL  ${p.name} · ${st.label}: is its own parent`); }
    if (st.by && st.by.split(/\s+/).length > 7)
      { fails++; console.log(`FAIL  ${p.name} · ${st.label}: trigger is ${st.by.split(/\s+/).length} words`); }
    // A trigger earns its line by saying something the label doesn't.
    const words = (s) => s.toLowerCase().replace(/[^a-z ]/g, "").split(/\s+/).filter((w) => w.length > 3);
    if (words(st.label).filter((w) => words(st.by).includes(w)).length >= 2)
      { fails++; console.log(`FAIL  ${p.name} · "${st.label}" ↳ "${st.by}": trigger restates the label`); }
    const r = path(p.states, st.id);
    if (r[r.length - 1] !== st.id || r.length > p.states.length)
      { fails++; console.log(`FAIL  ${p.name} · ${st.label}: broken route`); }
  }
  if (!p.states.some((s) => !s.from)) { fails++; console.log(`FAIL  ${p.name}: no starting state`); }
}
console.log(`       ${states} states across ${documented.length} patterns`);

// ── The invariant that makes a slot well defined ────────────────────────
// If two states at the same depth had different parents, they would land in
// one slot while being alternatives to different things — and the chooser
// would offer a menu that never existed.
console.log("\nEvery state at a given depth shares a parent, so a depth is a slot");
for (const p of documented)
  for (const [n, slot] of slots(p.states).entries()) {
    const parents = new Set(slot.map((s) => s.from ?? null));
    if (parents.size > 1)
      { fails++; console.log(`FAIL  ${p.name} slot ${n + 1}: ${slot.map((s) => s.label).join(", ")} don't share a parent`); }
  }
ok("all slots are single sibling groups", true);

// ── The array is in slot order ──────────────────────────────────────────
// slots() groups by depth and keeps array order inside a group, so a states
// array whose depth fell between neighbours would hand a position's tabs back
// in an order nobody authored.
console.log("\nThe array is in slot order, so a slot's tabs come out in order");
for (const p of documented) {
  const ds = p.states.map((s) => depth(p.states, s.id));
  const drops = ds.filter((d, i) => i > 0 && d < ds[i - 1]);
  if (drops.length)
    { fails++; console.log(`FAIL  ${p.name}: depth falls at ${ds.join(",")}`); }
}
ok("depth is non-decreasing across every states array", true);

// The system's own moves used to be asserted here, off an `auto` flag on the
// states. Both are gone: a system move is a move through the surface's working
// data rather than a jump between named states, so it lives on the preview as
// `work.tick` and is tested in smoke29 — which can walk it, because it has the
// data to walk.

// ── A pattern with no run is still a pattern with variants ─────────────
// This is the case the tab strip exists for, and the one the segmented track
// got most wrong: Clear Refusal's four states are four kinds of refusal that
// never follow each other. Numbered as steps they read as a sequence; as tabs
// they read as what they are.
console.log("\nA one-slot pattern is variants, not a run");
for (const name of ["Clear Refusal", "Confidence Levels"]) {
  const p = byName(name);
  const html = draw(p);
  ok(`${name} is one slot`, isSet(p.states), `${slots(p.states).length}`);
  ok(`  …so every state is a tab`,
    (html.match(/class="ai-state-tab"/g) || []).length === p.states.length);
  // Nothing to start over from: all four are ways the pattern begins.
  ok(`  …and there is nothing to start over from`, !html.includes("ai-restart"));
  ok(`  …and no Play`, !html.includes("ai-play"));
}
// And the opposite case: a position holding one state is a label, not a
// selector with one option in it. The appearance of tabs is the signal that
// this is where the pattern forks, so it has to be absent where it doesn't.
const srh = draw(byName("Streaming Response"));
ok("Streaming Response opens on a position that doesn't fork",
  !srh.includes("ai-state-tab") && srh.includes("ai-state-name"));
ok("…and nothing has happened yet, so there is nothing to start over from",
  !srh.includes("ai-restart"));

// ── The chooser offers exactly the slot it is in ────────────────────────
console.log("\nThe chooser offers the alternatives at the current position");
const sr = byName("Streaming Response").states;
ok("Streaming ends three ways, all in the last slot",
  alternatives(sr, "stopped").map((s) => s.id).join(",") === "complete,stopped,dropped");
ok("…and its first slot offers only Waiting", alternatives(sr, "waiting").length === 1);
const ag = byName("Approval Gate").states;
ok("Approval Gate: Modified sits beside Awaiting, not after it",
  alternatives(ag, "modified").map((s) => s.id).join(",") === "await,modified",
  alternatives(ag, "modified").map((s) => s.label).join(" / "));
ok("…and Running is a step of its own",
  depth(ag, "executing") === 2 && alternatives(ag, "executing").length === 1);
const pp = byName("Plan Preview").states;
ok("Plan Preview: Step removed sits beside Plan proposed",
  depth(pp, "edited") === 1 && depth(pp, "proposed") === 1);
ok("…and Paused sits beside Running", alternatives(pp, "paused").map((s) => s.id).join(",") === "running,paused");

// ── The tabs offer the position, and only the position ────────────────
// One tab per variant at the position the canvas is standing in, and none at
// all where there is only one way to be there. This is the whole of what
// survived the track: the part that named alternatives without also asserting
// an order between positions.
console.log("\nThe tab strip is exactly the current position's variants")
for (const p of documented) {
  const html = draw(p);
  const tabs = (html.match(/class="ai-state-tab"/g) || []).length;
  const want = alternatives(p.states, p.states[0].id).length;
  const expected = want > 1 ? want : 0;
  if (tabs !== expected)
    { fails++; console.log(`FAIL  ${p.name}: ${tabs} tabs, expected ${expected}`); }
  // A position that doesn't fork names itself instead.
  if ((want > 1) === html.includes("ai-state-name"))
    { fails++; console.log(`FAIL  ${p.name}: tabs and a bare name are not exclusive`); }
}
ok("a tab per variant where there is a choice, a name where there isn't", true);

// ── Every pattern says where else it lives ─────────────────────────────
// Surfaces are on the pattern rather than in the taxonomy, which only works if
// every pattern answers for every surface — a gap here is a designer building
// for voice finding nothing and concluding the hub is for screens.
console.log("\nEvery documented pattern answers for every surface");
{
  const tally = {};
  for (const p of documented) {
    const missing = AI_SURFACES.filter((sf) => !p.surfaces?.[sf.id]);
    if (missing.length) {
      fails++;
      console.log(`FAIL  ${p.name}: no answer for ${missing.map((s) => s.label).join(", ")}`);
      continue;
    }
    for (const sf of AI_SURFACES) {
      const e = p.surfaces[sf.id];
      const key = `${sf.id}:${e.verdict}`;
      tally[key] = (tally[key] ?? 0) + 1;
      if (!SURFACE_VERDICTS[e.verdict])
        { fails++; console.log(`FAIL  ${p.name} · ${sf.label}: "${e.verdict}" is not a verdict`); }
      // A verdict with no reason is the thing this field exists to avoid: the
      // useful half is what replaces the answer, not that it changed.
      if (!e.note || e.note.split(/\s+/).length < 8)
        { fails++; console.log(`FAIL  ${p.name} · ${sf.label}: no reason given`); }
      if (e.note && e.note.split(/\s+/).length > 34)
        { fails++; console.log(`FAIL  ${p.name} · ${sf.label}: ${e.note.split(/\s+/).length} words`); }
    }
  }
  ok(`${documented.length * AI_SURFACES.length} answers, every one graded and reasoned`, true);

  // The claim being tested is that the phases carry and the answers don't. If
  // every entry came back "Holds" the field would be decoration; if every one
  // came back "No form here" the hub really would be a screen library. Both
  // extremes are findings, so neither is allowed to pass silently.
  for (const sf of AI_SURFACES) {
    const counts = Object.entries(tally).filter(([k]) => k.startsWith(`${sf.id}:`));
    const top = Math.max(...counts.map(([, n]) => n));
    ok(`${sf.label} is not one answer repeated`, top < documented.length,
      counts.map(([k, n]) => `${k.split(":")[1]} ${n}`).join(" · "));
  }

  // And the split the field was written to record: the patterns whose decisions
  // were already surface-free are the ones that carry.
  const holds = (name, sf) => byName(name).surfaces[sf].verdict === "holds";
  ok("Approval Gate and Clear Refusal carry to voice", holds("Approval Gate", "voice") && holds("Clear Refusal", "voice"));
  ok("…and the three most screen-bound patterns do not",
    ["Sourced Answer", "Structured Output", "Prompt Box"].every(
      (n) => byName(n).surfaces.voice.verdict !== "holds"));
}

// ── Shapes still differ ─────────────────────────────────────────────────
console.log("\nThe patterns still do not all have the same shape");
const tally = {};
for (const p of documented) {
  const k = isSet(p.states) ? "no run" : forks(p.states) ? "run with choices" : "plain run";
  tally[k] = (tally[k] || 0) + 1;
}
ok("more than one shape is represented", Object.keys(tally).length > 1, JSON.stringify(tally));

console.log(fails ? `\n${fails} FAILED\n` : "\nall passed\n");
process.exit(fails ? 1 : 0);
