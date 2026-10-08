// smoke33 — the state system, after STATE-AUDIT.md.
//
// The audit found the state *model* sound and the *experience* of it weak:
// most failures reachable only by forcing them, forced moving states freezing
// with nothing to press, a jump throwing away what somebody typed, no way to
// tell how a state was reached. This file pins the fixes, so none of them can
// quietly come back.
import { renderToString } from "react-dom/server";
import fs from "node:fs";
import { AI_PATTERNS, STATE_KINDS } from "./src/data/aiPatterns.js";
import { PATTERN_PREVIEWS } from "./src/components/ai/previews/index.js";
import { PatternDetail, labMotion, workFor } from "./src/components/ai/PatternDetail.jsx";

let fails = 0;
const bad = (m) => { fails++; console.log(`FAIL  ${m}`); };
const ok = (m, c, n) => (c ? console.log(`  ok  ${m}${n ? ` — ${n}` : ""}`) : bad(`${m}${n ? ` — ${n}` : ""}`));
const quiet = (fn) => { const e = console.error; console.error = () => {}; try { return fn(); } finally { console.error = e; } };

// ── Reaching states by using the playground ────────────────────────────
// Every live control on a frame, fired by POSITION. The older walker matched
// handlers by their source text, so five example chips with identical code
// counted as one and the audit's first count of Clear Refusal was 4 of 8
// instead of 8 of 8. Response is part of "interacting": a reader choosing
// Fails and pressing Try it caused that failure, so every Response the
// pattern offers is walked.
function handlers(node, out = []) {
  if (Array.isArray(node)) { for (const n of node) handlers(n, out); return out; }
  if (!node || typeof node !== "object") return out;
  const props = node.props ?? {};
  if (typeof node.type === "function") { try { return handlers(node.type(props), out); } catch { /* the control */ } }
  if (!props.disabled) for (const k of ["onClick", "onChange", "onKeyDown", "onSubmit"]) if (typeof props[k] === "function") out.push(k);
  handlers(props.children, out);
  return out;
}
function handlerFns(node, out = []) {
  if (Array.isArray(node)) { for (const n of node) handlerFns(n, out); return out; }
  if (!node || typeof node !== "object") return out;
  const props = node.props ?? {};
  if (typeof node.type === "function") { try { return handlerFns(node.type(props), out); } catch { /* the control */ } }
  if (!props.disabled) for (const k of ["onClick", "onChange", "onKeyDown", "onSubmit"]) if (typeof props[k] === "function") out.push(props[k]);
  handlerFns(props.children, out);
  return out;
}
const EVENTS = {
  onClick: [{}], onSubmit: [{}],
  onChange: [{ target: { value: "send Sam £50 for the trip" } }, { target: { value: "" } }],
  onKeyDown: [{ key: "Tab", preventDefault() {} }, { key: "Enter", preventDefault() {} }],
};
function next(P, w, sim) {
  const out = [];
  quiet(() => {
    const kinds = handlers(P({ state: null, work: w, set: () => {}, sim }));
    kinds.forEach((k, i) => {
      for (const ev of EVENTS[k]) {
        let got;
        const fns = handlerFns(P({ state: null, work: w, set: (x) => { got = x; }, sim }));
        try { fns[i]?.(ev); } catch { /* a handler that needs a real event */ }
        if (got !== undefined) out.push(got);
      }
    });
  });
  return out;
}
function reachable(p) {
  const P = PATTERN_PREVIEWS[p.id], W = P.work;
  const got = new Set();
  for (const sim of P.simulate ?? ["normal"]) {
    const seen = new Set(), q = [W.for(p.states[0].id)];
    let n = 0;
    while (q.length && n++ < 600) {
      const w = q.shift(); const k = JSON.stringify(w);
      if (seen.has(k)) continue;
      seen.add(k);
      got.add(W.state(w));
      for (const x of next(P, w, sim)) q.push(x);
      const t = W.tick?.(w, sim);
      if (t) q.push(t.work);
    }
  }
  return got;
}

// What each pattern still reaches only from the State list — the gaps left
// for its redesign pass. A RATCHET, like smoke31's ceiling: it fails when a
// state is unreachable and not listed here, and it fails when a listed one has
// become reachable, so the list can only shrink. Measured after the audit
// pass: 29 → 28 of 174, from 38 of 164 before it.
const NOT_YET = {
  "Prompt Box": ["Over limit"],
  "Suggested Prompts": ["About this page", "Nothing worth suggesting"],
  "Guided Input": ["These can't both be true"],
  "Word by Word": ["Connection lost"],
  "Results in Pieces": ["One piece failed"],
  "Visible Working": ["Long run", "Stuck on a step"],
  "Sourced Answer": ["Partly sourced", "Nothing found"],
  "Confidence Levels": ["Shown as a range"],
  "Answer in Fields": ["Needs checking", "Not found"],
  "Typing Ahead": ["Nothing to suggest"],
  "Change Review": ["Nothing to change", "Stale"],
  "Retry & Compare": ["Two side by side"],
  "Action Log": ["Something's missing"],
  "Heads-Up": ["Badly timed"],
  "Background Work": ["Waiting on you", "Failed while away"],
  "Interruption Limit": ["Some spent", "Nothing left this week", "Broken on purpose"],
  "Back to You": ["Handed back stuck"],
  "After a Mistake": ["Can't be put back"],
  "Known Limits": ["Right where it bites", "Older than it looks"],
};
console.log("\nEvery state is reached by using the playground, or is a listed gap");
{
  let total = 0, reached = 0, full = 0;
  for (const p of AI_PATTERNS) {
    const got = reachable(p);
    const missing = p.states.filter((s) => !got.has(s.id)).map((s) => s.label);
    const listed = NOT_YET[p.name] ?? [];
    total += p.states.length;
    reached += p.states.length - missing.length;
    if (!missing.length) full++;
    for (const m of missing) if (!listed.includes(m)) bad(`${p.name} · ${m}: only reachable from the State list`);
    for (const l of listed) if (!missing.includes(l)) bad(`${p.name} · ${l}: reachable now — take it off NOT_YET`);
  }
  ok(`${reached} of ${total} states reachable by using the playground`, true, `${full} of ${AI_PATTERNS.length} patterns complete`);
}

// ── A forced moving state is paused, never frozen ──────────────────────
// The audit's worst friction: pick Streaming or Checking and it sat still
// forever, Skip gone, nothing to press. Every state that moves on its own has
// to read as paused when it is held, and the page has to draw that.
console.log("\nA picked state that would move is shown as paused, with Play");
{
  let held = 0;
  for (const p of AI_PATTERNS) {
    const W = PATTERN_PREVIEWS[p.id].work;
    for (const st of p.states) {
      const w = W.for(st.id);
      if (!W.tick?.(w, "normal")) continue;
      held++;
      const m = labMotion({ W, work: w, held: true, sim: "normal" });
      if (!m.paused || m.moving) bad(`${p.name} · ${st.label}: held but not paused`);
      const free = labMotion({ W, work: w, held: false, sim: "normal" });
      if (!free.moving) bad(`${p.name} · ${st.label}: released but not moving`);
    }
  }
  ok(`${held} moving states, every one paused when held`, true);
  const src = fs.readFileSync("./src/components/ai/PatternDetail.jsx", "utf8");
  ok("…the page draws Paused with a Play that releases it",
    /paused && !compare[^]*className="pt-paused"[^]*setHeld\(false\)/.test(src));
  ok("…and Skip is offered while paused, not only while moving", src.includes("(moving || paused) && ("));
}

// ── A jump keeps what somebody typed ───────────────────────────────────
// Picking a state replaced typed text with the canned version. `work.keep`
// carries typed fields across a jump — but only if the result still reads as
// the state asked for, so the round trip smoke29 rests on cannot break.
console.log("\nA jump keeps typed input, and never lands on the wrong state");
{
  let pairs = 0;
  for (const p of AI_PATTERNS) {
    const W = PATTERN_PREVIEWS[p.id].work;
    for (const to of p.states)
      for (const from of p.states) {
        pairs++;
        const cur = { ...W.for(from.id), ...(W.keep ?? []).reduce((a, k) => ({ ...a, [k]: "typed by somebody" }), {}) };
        if (W.state(workFor(W, to.id, cur)) !== to.id) bad(`${p.name}: jumping to ${to.label} from ${from.label} reads as another state`);
      }
  }
  ok(`${pairs} jumps, every one landing where it was asked`, true);
  const R = PATTERN_PREVIEWS["graceful-refusal"].work;
  const typed = { ...R.for("ready"), text: "send Sam £50" };
  ok("…and it really keeps the words — Clear Refusal's typed request survives a jump",
    workFor(R, "policy", typed).text === "send Sam £50");
  ok(`${AI_PATTERNS.filter((p) => PATTERN_PREVIEWS[p.id].work.keep).length} patterns keep typed fields`, true);
}

// ── Every state says what kind of moment it is ─────────────────────────
console.log("\nEvery state has a kind, and no run ends on a wait");
{
  for (const p of AI_PATTERNS)
    for (const st of p.states) if (!STATE_KINDS[st.kind]) bad(`${p.name} · ${st.label}: no kind`);
  // A run may end in a result, a refusal, a limit or a record to read — but
  // never on a wait: a state nothing follows that is still "working" is a
  // spinner with no end, which is the anti-pattern drawn by the pattern.
  for (const p of AI_PATTERNS) {
    const ends = p.states.filter((s) => !p.states.some((t) => t.from === s.id));
    const stuck = ends.filter((s) => s.kind === "working" && !PATTERN_PREVIEWS[p.id].work.tick?.(PATTERN_PREVIEWS[p.id].work.for(s.id), "normal"));
    if (stuck.length) bad(`${p.name}: the run ends on a wait — ${stuck.map((s) => s.label).join(", ")}`);
  }
  ok("no run ends on a wait", true);
  const noDone = AI_PATTERNS.filter((p) => !p.states.some((s) => s.kind === "done"));
  console.log(`  note  ${noDone.length} patterns have no Done, by nature or as a gap: ${noDone.map((p) => p.name).join(", ")}`);
  // Not failed yet, and written down rather than hidden: the core set says a
  // pattern that fetches or acts has a failure, and these still don't.
  const working = AI_PATTERNS.filter((p) => p.states.some((s) => s.kind === "working"));
  const noFail = working.filter((p) => !p.states.some((s) => s.kind === "failed"));
  console.log(`  note  ${noFail.length} patterns that wait still have no failure state: ${noFail.map((p) => p.name).join(", ")}`);
}

// ── How you got here is on screen ──────────────────────────────────────
console.log("\nThe trigger is visible, and the states are a map of what you found");
{
  const p = AI_PATTERNS.find((x) => x.id === "graceful-refusal");
  const h = renderToString(<PatternDetail pattern={p} onSelectComponent={() => {}} onSelectAiPattern={() => {}} />);
  ok("the opening state's trigger is drawn under the stage",
    h.includes(`class="pt-by">${p.states[0].by[0].toUpperCase()}${p.states[0].by.slice(1)}<`));
  // The map: the opening state found by opening the page, every other state
  // waiting to be found by using it, and a count that says how far you are.
  const map = (h.match(/<ol class="ai-pstates"[^]*?<\/ol>/) || [""])[0];
  ok("…the Found map marks the opening state found and the rest not yet",
    (map.match(/data-seen="found"/g) || []).length === 1 &&
    (map.match(/data-seen="unseen"/g) || []).length === p.states.length - 1);
  ok("…and says how many have been found, in words", h.includes(`1 of ${p.states.length} found`));
  // The playback machinery is gone: the states are a record, not a remote.
  ok("…with no route playback left on the page",
    !h.includes("Replay") && !h.includes('aria-label="Playback speed"') && !h.includes('aria-label="Step back"'));
}

console.log(fails ? `\n${fails} FAILED\n` : "\nall passed\n");
process.exit(fails ? 1 : 0);
