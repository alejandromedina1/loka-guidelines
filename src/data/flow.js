// The shape of a pattern's states, derived from `from` and `by`.
//
// Nothing in aiPatterns.js declares whether a pattern is a sequence or a set.
// It can't: a declared shape is a second source of truth that drifts from the
// links. So the shape is computed from the links themselves, and a pattern that
// branches cannot claim otherwise.
//
// The unit is a SLOT, not a state. A slot is a position in the run; the states
// inside one are the alternatives at that position. Streaming Response has
// three slots — waiting, streaming, and how it ended — and the third holds
// Complete, Stopped and Connection lost.
//
// That is the correction. The bar used to draw one segment per state, so
// reaching a branch left the segments beside it dark: a lit–dark–lit bar on a
// third of all states, which reads as a skipped step rather than a road not
// taken. That bar is gone — the canvas is operated rather than played — but
// the slot survived it, because the tab strip that replaced the bar is exactly
// one slot's contents and nothing else.
//
// The invariant that makes a slot well defined: every state at a given depth
// shares a parent. smoke27 asserts it, because a bad `from` would silently
// merge two unrelated groups into one slot.

const byId = (states) => Object.fromEntries(states.map((s) => [s.id, s]));

// Root → the state itself. Cycles can't occur through authored data, but a bad
// edit shouldn't hang the page, so the walk is bounded by the state count.
export function path(states, id) {
  const map = byId(states);
  const out = [];
  let cur = map[id];
  for (let guard = 0; cur && guard <= states.length; guard++) {
    out.unshift(cur.id);
    cur = cur.from ? map[cur.from] : null;
  }
  return out;
}

// How far into the run a state sits. 1-based, so it reads as a step number.
export const depth = (states, id) => path(states, id).length;

// The run, as slots. The states array is authored in slot order, so each
// group comes out in the order it should be offered.
export function slots(states) {
  const out = [];
  for (const st of states) {
    const d = depth(states, st.id);
    (out[d - 1] ??= []).push(st);
  }
  return out.filter(Boolean);
}

// The alternatives at the position this state occupies — including itself.
// This is what the canvas offers as a chooser: at a given point in the run,
// these are the ways it can go.
export function alternatives(states, id) {
  return slots(states)[depth(states, id) - 1] ?? [];
}

// `route`, `continues` and `place` used to sit here, and all three went with
// the canvas that played itself. `route` was the road Play walked; `continues`
// marked the segments a route could never reach; `place` was the "Step 2 of 3"
// readout over the bar. There is no bar and no route: the run is told by
// operating it, so what the model has to answer is "what are the variants
// here" and "what does the system do next", which is the two functions above
// and the one below.

// `onward` used to sit here, reading an `auto` flag off the states to say what
// the system did next. It went with the flag: a system move is a move through
// the surface's working data, not a jump between named states, so it belongs to
// the preview that owns that data — `work.tick` in PatternDetail.jsx. What is
// left here is the shape of the run, which is all this file was ever for.

// True when the pattern has no run at all — one slot, several ways it can go.
export const isSet = (states) => slots(states).length < 2;

// True when any slot holds more than one alternative.
export const forks = (states) => slots(states).some((g) => g.length > 1);
