// smoke27 — the flow model, now built on slots.
//
// A slot is a position in the run; the states inside one are the alternatives
// at that position. The properties below are what make the bar drawable, and
// each of them corresponds to something that was visibly broken when the bar
// drew one segment per state instead.
import { renderToString } from "react-dom/server";
import { AI_PATTERNS } from "./src/data/aiPatterns.js";
import { alternatives, continues, depth, forks, isSet, path, place, route, slots } from "./src/data/flow.js";
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

// ── Play can only move forward ──────────────────────────────────────────
// Play walks the array. If depth ever fell between neighbours, the bar would
// un-fill mid-playback, which is exactly what it used to do.
console.log("\nThe array is in slot order, so Play never runs backwards");
for (const p of documented) {
  const ds = p.states.map((s) => depth(p.states, s.id));
  const drops = ds.filter((d, i) => i > 0 && d < ds[i - 1]);
  if (drops.length)
    { fails++; console.log(`FAIL  ${p.name}: depth falls at ${ds.join(",")}`); }
}
ok("depth is non-decreasing across every states array", true);

// ── Play walks a run, not a menu ────────────────────────────────────────
// Every hop Play makes has to advance the run. It used to walk the states
// array, so 31 of its 52 hops swapped one alternative for another under an
// animation that says "and then this happened" — Complete → Stopped →
// Connection lost, Accepted → Dismissed, Done → Failed midway.
console.log("\nEvery hop Play makes advances the run");
let hops = 0;
for (const p of documented) {
  const all = slots(p.states);
  if (all.length < 2) {
    // No run: Play has nothing to walk and shouldn't be offered at all.
    ok(`${p.name} has no run, so no Play`, !draw(p).includes("ai-play"));
    continue;
  }
  const byIdIn = Object.fromEntries(p.states.map((x) => [x.id, x]));
  const lbl = (id) => byIdIn[id].label;
  for (const st of p.states) {
    const r = route(p.states, st.id);
    if (!r.includes(st.id))
      { fails++; console.log(`FAIL  ${p.name} · ${st.label}: route doesn't pass through it`); }
    // Starts at a way the pattern can start.
    if (byIdIn[r[0]].from)
      { fails++; console.log(`FAIL  ${p.name} · ${st.label}: route starts mid-run at ${lbl(r[0])}`); }
    // And carries on as far as the run goes, so it never stops early.
    if (p.states.some((o) => o.from === r[r.length - 1]))
      { fails++; console.log(`FAIL  ${p.name} · ${st.label}: route stops at ${lbl(r[r.length - 1])} with more to come`); }
    for (let i = 1; i < r.length; i++) {
      hops++;
      // THE check. Depth advancing by one is not enough — a route made of one
      // state per slot satisfies that while walking links that don't exist,
      // which is how "Nothing in scope → Scope changed" shipped.
      if (byIdIn[r[i]].from !== r[i - 1]) {
        fails++;
        console.log(`FAIL  ${p.name}: ${lbl(r[i - 1])} → ${lbl(r[i])} is not a link the pattern has`);
      }
    }
  }
}
ok(`${hops} hops across every route, every one a real link`, true);
// The ending you picked is the ending Play walks to — the full road to it.
const srp = byName("Streaming Response").states;
ok("choosing Connection lost makes Play walk the road to it",
  route(srp, "dropped").join(" → ") === "waiting → streaming → dropped",
  route(srp, "dropped").join(" → "));
ok("and choosing nothing walks the ordinary road",
  route(srp, "waiting").join(" → ") === "waiting → streaming → complete",
  route(srp, "waiting").join(" → "));
// A branch in the middle of a run stops where it stops, rather than being
// carried on to a state nothing led to.
const vs = byName("Visible Sources").states;
ok("Visible Sources stops at Nothing in scope instead of walking past it",
  route(vs, "empty").join(" → ") === "default → empty", route(vs, "empty").join(" → "));
ok("…and still walks the whole road when there is one",
  route(vs, "stale").join(" → ") === "default → editing → stale", route(vs, "stale").join(" → "));

// ── The bar can't draw a hole ───────────────────────────────────────────
// One segment per slot makes the fill a prefix by construction. Asserted from
// the rendered markup rather than from the model, so a regression in the
// component fails here too.
console.log("\nThe rendered bar is always a filled prefix");
let holes = 0, bars = 0;
for (const p of documented) {
  const segs = [...draw(p).matchAll(/class="ai-track-seg"([^>]*)>/g)].map((m) => m[1].includes("data-on"));
  if (!segs.length) continue;
  bars++;
  if (segs.some((on, i) => !on && segs.slice(i + 1).includes(true))) holes++;
}
ok(`${bars} bars drawn, none with a gap`, holes === 0, `${holes} holed`);

// ── A route that stops says so ──────────────────────────────────────────
// A dead end is a correct place to be — "Nothing to change", "Nothing in
// scope" — but the segments past it must not read as steps still to come.
//
// PatternDetail owns which state is on the canvas, so the only way to render
// one is to put it first in the array it's handed. Depth comes from the `from`
// links, not from array position, so reordering doesn't disturb what's tested.
console.log("\nSegments a route can't reach are drawn as unreached, not as ahead");
const withFirst = (p, id) => ({ ...p, states: [p.states.find((s) => s.id === id), ...p.states.filter((s) => s.id !== id)] });
let ends = 0;
for (const p of documented) {
  const total = slots(p.states).length;
  if (total < 2) continue;
  for (const st of p.states) {
    const d = depth(p.states, st.id);
    const html = draw(withFirst(p, st.id));
    const marked = (html.match(/data-unreached=/g) || []).length;
    // One bar segment per slot, so a route that stops marks one per slot ahead.
    const expected = continues(p.states, st.id) ? 0 : total - d;
    if (marked !== expected) {
      fails++;
      console.log(`FAIL  ${p.name} · ${st.label}: ${marked} segments marked unreached, expected ${expected}`);
    }
    if (expected > 0) ends++;
  }
}
ok(`${ends} dead-end states, each marking exactly the steps it can't reach`, true);
// And the ordinary case is untouched: a state that carries on marks nothing.
ok("Streaming · Waiting marks nothing unreached",
  !draw(withFirst(byName("Streaming Response"), "waiting")).includes("data-unreached"));
// Change Review from "Nothing to change": slot 2 holds two alternatives and
// slot 3 holds one, none of them reachable from there.
ok("Change Review · Nothing to change marks the two steps it never gets to",
  (draw(withFirst(byName("Change Review"), "empty")).match(/data-unreached=/g) || []).length === 2);

// ── A pattern with no run gets no bar ───────────────────────────────────
console.log("\nA one-slot pattern is not numbered like a run");
for (const name of ["Clear Refusal", "Confidence Levels"]) {
  const p = byName(name);
  const html = draw(p);
  ok(`${name} is one slot`, isSet(p.states), `${slots(p.states).length}`);
  // No step numbers: numbering four kinds of refusal 1..4 would say they
  // happen in order, which is the whole thing this model exists to stop.
  ok(`  …so it renders no bar`, !html.includes("ai-track-bar"));
  ok(`  …and no step readout`, place(p.states, p.states[0].id) === null);
  ok(`  …and offers no Play`, !html.includes("ai-play"));
}
const srh = draw(byName("Streaming Response"));
ok("Streaming Response draws one segment per slot",
  (srh.match(/class="ai-track-seg"/g) || []).length === 3);
ok("…and marks the step the canvas is in",
  /class="ai-track-seg"[^>]*aria-current="step"/.test(srh));

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

// ── One row per state, one number per step ──────────────────────────────
// The run list is the whole model on screen, so it has to render every state
// exactly once and number each step exactly once. The horizontal readout it
// replaced could only name the step you were standing on.
// ── The readout means one thing ─────────────────────────────────────────
// Two states may share a readout only when they really are at the same
// position — and then the pills tell them apart.
console.log("\nStates sharing a readout are states at the same position");
for (const p of documented)
  for (const st of p.states) {
    const same = p.states.filter((o) => place(p.states, o.id) === place(p.states, st.id));
    const alt = alternatives(p.states, st.id);
    if (same.length !== alt.length)
      { fails++; console.log(`FAIL  ${p.name} · ${st.label}: ${same.length} share its readout but its slot holds ${alt.length}`); }
  }
ok("every shared readout is a shared slot", true);
// One pill per alternative at the current position, and a bar segment per slot.
for (const p of documented) {
  const html = draw(p);
  const pills = (html.match(/class="ai-track-alt"/g) || []).length;
  const want = alternatives(p.states, p.states[0].id).length;
  if (pills !== (want > 1 ? want : 0))
    { fails++; console.log(`FAIL  ${p.name}: ${pills} pills, expected ${want > 1 ? want : 0}`); }
  const segs = (html.match(/class="ai-track-seg"/g) || []).length;
  const wantSegs = slots(p.states).length > 1 ? slots(p.states).length : 0;
  if (segs !== wantSegs)
    { fails++; console.log(`FAIL  ${p.name}: ${segs} segments, expected ${wantSegs}`); }
}
ok("a segment per slot, a pill per alternative where there is a choice", true);

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
