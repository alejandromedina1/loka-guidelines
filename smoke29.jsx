// smoke29 — the work protocol. The canvas is operated, and the lifecycle state
// the page names is *derived* from the surface's data rather than picked, so
// what has to be tested is the derivation: that every state is expressible as
// data, that the data always names a state the pattern has, and that the moves
// the system makes on its own settle.
//
// None of this is visible to a render test. `renderToString` never runs an
// effect, and a handler is not in the markup — so this file calls the previews
// as functions (they hold no state, which is the point of the protocol) and
// walks the element trees they return, calling the handlers it finds with a
// recording `set`. That gives the reachable surface of each wireframe: not
// "which states are listed" but "which states can somebody actually produce".
import { AI_PATTERNS, AI_SURFACES } from "./src/data/aiPatterns.js";
import { PATTERN_PREVIEWS } from "./src/components/ai/previews/index.js";
import { MOODS } from "./src/components/ai/previews/voice.jsx";
import fs from "node:fs";
import { renderToString } from "react-dom/server";
import { alternatives, depth, path, slots } from "./src/data/flow.js";

const css = fs.readFileSync("./src/styles/global.css", "utf8");
let fails = 0;
const ok = (n, c, d = "") => { if (!c) fails++; console.log(`${c ? "  ok  " : "FAIL  "}${n}${d ? ` — ${d}` : ""}`); };
const documented = AI_PATTERNS.filter((p) => p.status === "documented");
const byName = (n) => documented.find((p) => p.name === n);
const workOf = (p) => PATTERN_PREVIEWS[p.id]?.work ?? null;
// The two that are a set of outcomes rather than a behaviour. Asserted below
// rather than assumed, because "this preview has no surface" and "somebody
// forgot to give this preview a surface" look identical from here.
const NO_SURFACE = ["Confidence Levels", "Clear Refusal"];

// React logs before it throws on a hook outside a renderer, and that throw is
// an expected signal here — a hundred warnings would bury the results.
const quiet = (fn) => {
  const err = console.error;
  console.error = () => {};
  try { return fn(); } finally { console.error = err; }
};

// Every handler a frame offers, as [label, fn]. Local helpers are expanded,
// because a preview that hands a handler to its own <Hunk> puts the control
// inside it — and a Hunk that has already been decided draws a different one.
// The kit's components call hooks and throw without a renderer, which is the
// signal to stop: that element is the control, and its props are the handler.
function handlersOf(node, out = [], seen = new Set()) {
  if (Array.isArray(node)) { for (const n of node) handlersOf(n, out, seen); return out; }
  if (!node || typeof node !== "object") return out;
  const props = node.props ?? {};
  if (typeof node.type === "function") {
    try { return handlersOf(node.type(props), out, seen); } catch { /* the control */ }
  }
  // A disabled control is not a move: Prompt Box draws Send in every state and
  // enables it in some, which is the pattern rather than an oversight.
  if (!props.disabled) {
    for (const key of ["onClick", "onChange", "onKeyDown"])
      if (typeof props[key] === "function" && !seen.has(props[key])) {
        seen.add(props[key]);
        out.push([key, props[key]]);
      }
  }
  handlersOf(props.children, out, seen);
  return out;
}

// Every working state one click away from this one. Change and keystroke
// handlers are driven with plausible events rather than skipped — typing is a
// move on three of these surfaces and the only one on one of them.
const EVENTS = {
  onClick: [{}],
  onChange: [{ target: { value: "A note about this payment" } }, { target: { value: "" } }],
  onKeyDown: [{ key: "Tab", preventDefault() {} }],
};
function nextWorks(P, work) {
  const out = [];
  quiet(() => {
    for (const [kind, fn] of handlersOf(P({ state: null, work, set: () => {} }))) {
      for (const ev of EVENTS[kind]) {
        let got;
        try { P({ state: null, work, set: (w) => { got = w; } }); } catch { continue; }
        // Re-walk with a live `set`, then fire this one handler.
        for (const [k2, f2] of handlersOf(P({ state: null, work, set: (w) => { got = w; } }))) {
          if (k2 !== kind || f2.toString() !== fn.toString()) continue;
          got = undefined;
          try { f2(ev); } catch { /* a handler that needs a real event */ }
          if (got !== undefined) out.push(got);
          break;
        }
      }
    }
  });
  return out;
}

// ── Every state is expressible as data ─────────────────────────────────
// The round trip. Tabs, the decisions' "See it on …" links and Start over all
// name a state; `for` is what turns that name into a surface, and if the
// surface it builds reads as a different state then all three are lying about
// where they put you. This is the single property the protocol rests on.
console.log("\nEvery state survives the round trip through the surface");
for (const p of documented) {
  const W = workOf(p);
  if (!W) { ok(`${p.name} is a set of outcomes, not a surface`, NO_SURFACE.includes(p.name)); continue; }
  const bad = p.states.filter((st) => W.state(W.for(st.id)) !== st.id);
  ok(`${p.name}: ${p.states.length} states`, bad.length === 0,
    bad.map((st) => `${st.id} reads as ${W.state(W.for(st.id))}`).join(", "));
}
// And nothing carries a surface it doesn't need, which would be a pattern
// claiming a behaviour it hasn't got.
for (const name of NO_SURFACE)
  ok(`${name} carries no surface`, !workOf(byName(name)));

// ── The data always names a state the pattern has ──────────────────────
// `state` is what the caption reads, what the panel describes and what the tabs
// are computed from. A surface it can't name would blank all three.
console.log("\nEvery surface a control can produce names a real state");
for (const p of documented) {
  const W = workOf(p);
  const P = PATTERN_PREVIEWS[p.id];
  if (!W) continue;
  const ids = new Set(p.states.map((s) => s.id));
  const seen = new Map();
  const queue = p.states.map((st) => W.for(st.id));
  let steps = 0;
  const unnamed = [];
  while (queue.length && steps++ < 400) {
    const w = queue.shift();
    const id = W.state(w);
    if (!ids.has(id)) { unnamed.push(JSON.stringify(w).slice(0, 70)); continue; }
    const key = JSON.stringify(w);
    if (seen.has(key)) continue;
    seen.set(key, id);
    for (const nx of nextWorks(P, w)) queue.push(nx);
    const t = W.tick?.(w);
    if (t) queue.push(t.work);
  }
  ok(`${p.name}: ${seen.size} reachable surfaces, all named`, unnamed.length === 0,
    unnamed.slice(0, 2).join(" / "));
  // And the states somebody can actually produce cover the ones documented.
  const produced = new Set(seen.values());
  const never = p.states.filter((st) => !produced.has(st.id));
  ok(`  …and all ${p.states.length} documented states are among them`, never.length === 0,
    never.map((s) => s.label).join(", "));
}

// ── No surface is a dead end part-way through a run ────────────────────
// Somewhere to go from everywhere the run hasn't finished: a control, a move of
// the system's own, or tabs across the position. Reached by exploring rather
// than by listing, so it covers the surfaces nobody wrote down.
//
// The end of a run is exempt, and only the end: Complete on Results in Pieces
// is a dashboard that has finished loading and a real product offers nothing
// more there. Start over is not counted as an escape anywhere — it is in the
// foot on every state that has a road behind it, so counting it would excuse
// exactly the states this is looking for.
console.log("\nNo surface is stuck part-way through a run");
for (const p of documented) {
  const W = workOf(p);
  const P = PATTERN_PREVIEWS[p.id];
  if (!W) continue;
  const seen = new Set();
  const queue = p.states.map((st) => W.for(st.id));
  const stuck = [];
  let steps = 0;
  while (queue.length && steps++ < 400) {
    const w = queue.shift();
    const key = JSON.stringify(w);
    if (seen.has(key)) continue;
    seen.add(key);
    const outs = nextWorks(P, w);
    const ticks = !!W.tick?.(w);
    const id = W.state(w);
    const tabs = alternatives(p.states, id).length;
    const ends = !p.states.some((st) => st.from === id);
    if (!outs.length && !ticks && tabs < 2 && !ends) stuck.push(id);
    for (const nx of outs) queue.push(nx);
    const t = W.tick?.(w);
    if (t) queue.push(t.work);
  }
  ok(`${p.name}: ${seen.size} surfaces`, stuck.length === 0,
    [...new Set(stuck)].join(", "));
}

// ── The system's half settles ──────────────────────────────────────────
// A tick runs on a page nobody is touching, so a chain that never ends is a
// canvas that flickers in an empty room. Walked from every state, because a tab
// can start one anywhere.
console.log("\nEvery tick chain ends");
for (const p of documented) {
  const W = workOf(p);
  if (!W?.tick) continue;
  let longest = 0;
  for (const st of p.states) {
    let w = W.for(st.id), n = 0;
    while (n < 500) {
      const t = W.tick(w);
      if (!t) break;
      if (!(t.in > 0)) { fails++; console.log(`FAIL  ${p.name}: a tick with no delay`); break; }
      w = t.work;
      n++;
    }
    longest = Math.max(longest, n);
    if (n >= 500) { fails++; console.log(`FAIL  ${p.name} · ${st.label}: tick chain never settles`); }
  }
  ok(`${p.name} settles`, true, `${longest} moves at most`);
}

// ── A failure is never on the timetable ────────────────────────────────
// The one rule the tick has to keep. Play walked through Connection lost and
// Failed midway as though they were the ordinary course; a wireframe that
// breaks on its own teaches that breaking is what usually happens. These states
// stay reachable — from the tabs, which is a reader choosing to look at a
// failure rather than the product performing one.
console.log("\nNothing breaks on its own");
const FAILURES = {
  "Streaming Response": ["dropped"],
  // Not "slow". One piece lagging is this pattern's subject rather than its
  // failure — "the slow one says so in its own space rather than holding the
  // other five hostage" is the thing working — and a run where all four land
  // smoothly demonstrates nothing, because a fast page has no reason to reveal
  // in pieces. So the lag is on the ordinary run and the check below asserts
  // the other half of that: it has to resolve, or the wireframe hangs.
  "Results in Pieces": ["failed"],
  "Approval Gate": ["failed"],
  "Change Review": ["stale"],
};
for (const [name, bad] of Object.entries(FAILURES)) {
  const p = byName(name);
  const W = workOf(p);
  const hit = new Set();
  for (const st of p.states) {
    let w = W.for(st.id), n = 0;
    // From a state that isn't already the failure, ticking must never land on
    // one. Starting *in* one is a tab, which is allowed.
    const from = W.state(w);
    while (n++ < 200) {
      const t = W.tick?.(w);
      if (!t) break;
      w = t.work;
      const id = W.state(w);
      if (bad.includes(id) && !bad.includes(from)) hit.add(`${from} → ${id}`);
    }
  }
  ok(`${name}: ${bad.join(", ")} never arrive on a timer`, hit.size === 0, [...hit].join(", "));
}

// The lag is the ordinary run, so it has to behave like one: reached without
// anybody asking, and left again without anybody asking. A spinner that arrives
// on a timer and never clears is the anti-pattern this pattern is arguing
// against, drawn by the pattern arguing against it.
console.log("\nResults in Pieces runs long, then finishes");
{
  const p = byName("Results in Pieces");
  const W = workOf(p);
  const seen = [];
  let w = W.for(p.states[0].id), wait = 0, n = 0;
  while (n++ < 20) {
    seen.push(W.state(w));
    const t = W.tick(w);
    if (!t) break;
    if (W.state(t.work) === "slow") wait = W.tick(t.work)?.in ?? 0;
    w = t.work;
  }
  ok("the opening run passes through One piece lagging", seen.includes("slow"), seen.join(" → "));
  ok("…and comes out the other side finished", seen[seen.length - 1] === "complete");
  ok("…after a wait long enough to be a wait", wait >= 3000, `${wait}ms`);
  // Two figures on screen before the third says it is slow, or the frame is a
  // spinner over an empty page, which is the shortcut this pattern loses to.
  ok("…with pieces already on screen when it says so",
    W.for("slow").landed >= 2, `${W.for("slow").landed} landed`);
  // And a failure still doesn't clear itself.
  ok("a failed piece waits for somebody to retry it", !W.tick(W.for("failed")));
}

// ── Every pattern is worth touching ────────────────────────────────────
// The check the whole rework rests on. A pattern that opens with no control, no
// move of its own and no tabs is a still image with a properties panel beside
// it describing states nobody can put on screen.
console.log("\nEvery pattern offers something to do the moment it opens");
for (const p of documented) {
  const W = workOf(p);
  const P = PATTERN_PREVIEWS[p.id];
  const first = p.states[0];
  const w = W ? W.for(first.id) : null;
  const controls = W ? nextWorks(P, w).length : 0;
  const ticks = !!W?.tick?.(w);
  const tabs = alternatives(p.states, first.id).length;
  const how = [controls && `${controls} moves`, ticks && "it moves on its own", tabs > 1 && `${tabs} tabs`]
    .filter(Boolean).join(", ");
  ok(`${p.name}`, controls > 0 || ticks || tabs > 1, how || "nothing to do");
}

// ── The named cases, end to end ────────────────────────────────────────
// Each of these is a sentence the pattern makes about itself, checked by doing
// the thing rather than by looking at a frame.
console.log("\nThe pattern's own claim, performed");
{
  const step = (p, w, pick) => {
    const P = PATTERN_PREVIEWS[p.id];
    const outs = nextWorks(P, w);
    const hit = outs.find(pick);
    return hit;
  };

  const sr = byName("Streaming Response");
  const SW = workOf(sr);
  {
    // Stop keeps what had actually arrived, wherever it had got to.
    let w = SW.for("waiting");
    for (let i = 0; i < 12; i++) w = SW.tick(w)?.work ?? w;
    const at = w.at;
    const stopped = step(sr, w, (x) => x.ended === "stopped");
    ok("Stop keeps the characters that had arrived", stopped?.at === at, `${stopped?.at} vs ${at}`);
    ok("…and the answer is not yet whole there", at > 0 && SW.state(w) === "streaming");
  }

  const vs = byName("Visible Sources");
  const VW = workOf(vs);
  {
    // Switching the last account off is what Nothing in scope *is*.
    let w = VW.for("default");
    for (const id of [...w.on]) w = { ...w, on: w.on.filter((x) => x !== id) };
    ok("switching every source off produces Nothing in scope", VW.state(w) === "empty", VW.state(w));
    // And a built report goes out of date because the scope moved under it.
    let b = VW.for("default");
    b = step(vs, b, (x) => x.built);
    ok("building a report is a move somebody makes", !!b);
    const after = { ...b, on: b.on.slice(1) };
    ok("…and changing a tick after it marks the result out of date",
      VW.state(after) === "stale", VW.state(after));
  }

  const cr = byName("Change Review");
  const CW = workOf(cr);
  {
    // Accept is per unit: one decision does not decide the other.
    let w = CW.for("proposed");
    const one = step(cr, w, (x) => Object.keys(x.decided).length === 1);
    ok("one change can be decided on its own", !!one, one && JSON.stringify(one.decided));
    ok("…and that is what Partly accepted means", one && CW.state(one) === "partial");
    ok("…and the other is still undecided", one && Object.keys(one.decided).length === 1);
  }

  const pp = byName("Plan Preview");
  const PW = workOf(pp);
  {
    // A plan you can read but not change is a progress bar with extra words.
    const cut = step(pp, PW.for("proposed"), (x) => x.cut?.length === 1);
    ok("a step can be taken out of the plan", !!cut);
    ok("…and that is what Step removed means", cut && PW.state(cut) === "edited");
    // Pause holds the next step rather than the run ending.
    let run = PW.for("running");
    const paused = step(pp, run, (x) => x.paused);
    ok("a run can be paused part-way", !!paused && PW.state(paused) === "paused");
    ok("…and a paused run makes no further moves on its own", paused && !PW.tick(paused));
  }

  const is = byName("Inline Suggestion");
  const IW = workOf(is);
  {
    // The suggestion arrives because you stopped, and Tab is the accept.
    const typed = { typed: "Dinner with Sam —", offered: false, took: null, mute: false };
    ok("a pause is what offers a suggestion", IW.tick(typed)?.work.offered === true);
    const offered = IW.tick(typed).work;
    const took = step(is, offered, (x) => x.took === "accepted");
    ok("…Tab takes it, and the words become yours", !!took && took.typed.length > offered.typed.length);
    const kept = step(is, offered, (x) => x.took === "dismissed");
    ok("…and carrying on typing is the dismissal", !!kept);
    // The cycle has to close. Holding the last outcome left the pause unable to
    // offer a second time, so after one suggestion the editor was a textarea
    // that did nothing — on the one pattern whose entire subject is typing.
    // Typing again clears the last outcome, which is what lets the pause fire a
    // second time. `EVENTS` types an empty string as well as a sentence, so the
    // surface wanted here is the one that still has words in it.
    const again = kept && step(is, kept, (x) => x.took === null && x.typed.trim().length > 3);
    ok("…and a second pause offers again", !!again && !!IW.tick(again));
    const undone = took && step(is, took, (x) => x.took !== "accepted");
    ok("…and a taken suggestion can be undone", !!undone);
  }

  const ag = byName("Approval Gate");
  const AW = workOf(ag);
  {
    // A gate that displays a value nobody can correct is a confirmation dialog.
    const open = step(ag, AW.for("await"), (x) => x.editing);
    ok("the one parameter that can move, opens", !!open);
    const typedIn = open && step(ag, open, (x) => x.when !== "Now");
    ok("…and it takes what you type", !!typedIn, typedIn?.when);
    ok("…and the approval then carries it", typedIn && AW.state(typedIn) === "modified");
  }
}

// ── The strip offers what it can show ──────────────────────────────────
// A control appears exactly when it has something to do — the rule the state
// tabs follow (forks only) and Start over follows (only with a road behind
// you). For the surface strip that means a second *drawing*, which rules out
// two things that both used to be offered and both went nowhere: a surface the
// pattern carries to unchanged, where the tab re-rendered the identical frame,
// and one whose wireframe isn't built yet, where it landed on "not drawn".
//
// 25 of the 28 were one or the other, so this was most of the control.
console.log("\nThe surface strip offers only a second drawing");
{
  let offered = 0, silent = 0;
  for (const p of documented) {
    const P = PATTERN_PREVIEWS[p.id];
    for (const sf of AI_SURFACES) {
      const verdict = p.surfaces[sf.id].verdict;
      const drawn = !!P?.surfaces?.[sf.id];
      const shows = verdict !== "holds" && drawn;
      if (shows) offered++; else silent++;
      // The two that must never be offered.
      if (verdict === "holds" && drawn) {
        fails++;
        console.log(`FAIL  ${p.name} · ${sf.label}: drawn although it holds — the tab would do nothing`);
      }
    }
  }
  ok(`${offered} surfaces offered, ${silent} answered in words only`, offered > 0);
  // And every one of the silent ones still answers, or the strip's absence
  // would be the page having nothing to say rather than nothing to draw.
  const mute = documented.flatMap((p) =>
    AI_SURFACES.filter((sf) => !p.surfaces?.[sf.id]?.note).map((sf) => `${p.name}/${sf.id}`));
  ok("…and every surface answers in the block regardless", mute.length === 0, mute.join(", "));
}

// ── Surface variants ───────────────────────────────────────────────────
// A drawing for another surface exists only where the drawing differs. "Holds"
// means the screen one *is* the answer, so a second drawing there would say the
// opposite of the verdict — the presence of a variant is itself the signal that
// something changed, and that only works if it is never present otherwise.
console.log("\nA surface is drawn only where it differs");
for (const p of documented) {
  const P = PATTERN_PREVIEWS[p.id];
  for (const sf of AI_SURFACES) {
    const verdict = p.surfaces[sf.id].verdict;
    const drawn = !!P?.surfaces?.[sf.id];
    if (verdict === "holds" && drawn) {
      fails++;
      console.log(`FAIL  ${p.name} · ${sf.label}: drawn twice, but the verdict says it holds`);
    }
  }
}
ok("no pattern is drawn twice for one answer", true);

// A variant runs off the pattern's own `work`. That is the whole mechanism: one
// lifecycle, several drawings, so the identity across surfaces is structural
// rather than claimed. A variant that needed its own states would be a second
// pattern wearing the first one's name.
console.log("\nEvery variant runs off the pattern's own states");
{
  let drawn = 0;
  for (const p of documented) {
    const P = PATTERN_PREVIEWS[p.id];
    for (const [id, C] of Object.entries(P?.surfaces ?? {})) {
      drawn++;
      for (const st of p.states) {
        try {
          renderToString(<C state={st.id} work={P.work ? P.work.for(st.id) : undefined} set={() => {}} />);
        } catch (e) {
          fails++;
          console.log(`FAIL  ${p.name} · ${id} · ${st.label}: ${e.message}`);
        }
      }
    }
  }
  ok(`${drawn} variants, each rendering every state of its pattern`, true);
}

// ── A voice drawing is a product screen, not a log ─────────────────────
// The trap this kit exists to avoid, and the second version of it. The first
// drawing was a turn timeline — both parties on a rail, the gaps labelled with
// how long they were — and it was still a transcript, because it was a record
// of an exchange rather than a picture of a product. Somebody talking to a
// speaker never sees a log of their conversation; they see one thing that is
// alive and a line of words.
//
// It also broke the model every other preview follows: a screen preview draws
// ONE state and the lab walks between them, and the timeline drew all five at
// once — which is what Play was removed for. So the rule is the same rule, and
// it is checkable. One moment on the stage. One indicator. And the state has to
// be readable when nothing is moving.
console.log("\nVoice drawings are one moment, not a log");
for (const p of documented) {
  const C = PATTERN_PREVIEWS[p.id]?.surfaces?.voice;
  if (!C) continue;
  const W = PATTERN_PREVIEWS[p.id].work;
  const frames = p.states.map((st) =>
    renderToString(<C state={st.id} work={W ? W.for(st.id) : undefined} set={() => {}} />));
  const all = frames.join("");

  // One moment. A log has many turns; a stage has one of each part.
  const many = frames.filter((h) =>
    (h.match(/class="vc-orb"/g) || []).length !== 1 ||
    (h.match(/class="vc-heard"/g) || []).length > 1 ||
    (h.match(/class="vc-caption"/g) || []).length > 1);
  ok(`  ${p.name}: every state is one moment`, many.length === 0, `${many.length} stacked`);

  // The indicator reflects the state rather than sitting in one pose, or it is
  // decoration with a caption doing all the work.
  const moods = frames.map((h) => (h.match(/data-mood="(\w+)"/) || [])[1]);
  ok(`  ${p.name}: the indicator moves with the state`,
    new Set(moods).size > 1, moods.join(" · "));
  for (const m of moods)
    if (!MOODS[m]) { fails++; console.log(`FAIL  ${p.name}: "${m}" is not a mood`); }

  // Motion and colour are never the only signal — the caption says the word, so
  // the state survives a screenshot, a reduced-motion setting and a screen
  // reader. Checked against the same map the orb reads.
  const bare = frames.filter((h, i) => !h.includes(MOODS[moods[i]]));
  ok(`  ${p.name}: the state is in words as well as in motion`, bare.length === 0);

  // No persona. "No frame is titled Assistant", on the surface where a frame has
  // no title at all.
  const named = [...all.matchAll(/class="vc-device">([^<]*)</g)].map((m) => m[1]);
  ok(`  ${p.name}: the device is a device, not a character`,
    named.length > 0 && !named.some((n) => /assistant|\bai\b|bot|agent|chat|siri|alexa/i.test(n)),
    named.join(", "));
}
// And motion is never load-bearing: every mood has to differ with animation off.
{
  const body = (sel) =>
    (css.match(new RegExp(`(?:^|[}\\n])\\s*${sel}\\s*\\{([^}]*)\\}`, "m")) || [])[1] ?? "";
  const still = Object.keys(MOODS).filter((m) => {
    const b = body(`\\.vc-orb\\[data-mood="${m}"\\] \\.vc-orb-core`)
      + body(`\\.vc-orb\\[data-mood="${m}"\\] \\.vc-orb-ring`);
    // "listening" is the resting shape the base rule already draws, so it is
    // the one mood allowed to be animation-only.
    return m !== "listening" && b && !/width|box-shadow|background/.test(b);
  });
  ok("every mood differs with motion turned off", still.length === 0, still.join(", "));
  ok("…and the reduced-motion block stops the orb",
    /@media \(prefers-reduced-motion: reduce\)[^}]*\}[^@]*\.vc-orb-core/.test(css)
      || /\.vc-orb-core,\.vc-orb-ring\{animation:none/.test(css));
}

// ── Tabs still mean what they meant ────────────────────────────────────
console.log("\nTabs appear where a position forks, and only there");
let forks = 0, plain = 0;
for (const p of documented)
  for (const [n, slot] of slots(p.states).entries()) {
    if (slot.length > 1) forks++; else plain++;
    const seen = slot.map((st) => alternatives(p.states, st.id).map((o) => o.id).join(","));
    if (new Set(seen).size !== 1)
      { fails++; console.log(`FAIL  ${p.name} slot ${n + 1}: alternatives differ within one position`); }
    if (slot.some((st) => depth(p.states, st.id) !== n + 1))
      { fails++; console.log(`FAIL  ${p.name} slot ${n + 1}: a state at the wrong depth`); }
  }
ok(`${forks} positions fork and get tabs, ${plain} don't and get a name`, true);
void path;

console.log(fails ? `\n${fails} FAILED\n` : "\nall passed\n");
process.exit(fails ? 1 : 0);
