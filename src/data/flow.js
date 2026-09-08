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
// taken. With one segment per slot the fill is a prefix by construction —
// holes are impossible — and Play, which walks the array, can only move
// forward. Both of those were the bug, and neither is fixable by styling.
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

// One route through the run — the road that actually reaches a state, then
// however far the run carries on from it. This is what Play walks.
//
// It lives here rather than in the component because effects don't run under
// renderToString, so a route computed inside the play timer could not be
// tested at all. Two earlier versions were wrong in ways only a test caught:
// one walked the states array, so 31 of Play's 52 hops swapped one alternative
// for another under an animation reading "and then this happened"; the next
// took one state per slot, which filled the slots *after* the chosen state
// whether or not anything led there — 20 of 66 routes contained a hop along a
// link that doesn't exist. Every hop here is a real `from`.
export function route(states, endId) {
  const walk = path(states, endId);
  let cur = endId;
  for (let guard = 0; guard <= states.length; guard++) {
    const next = states.find((s) => s.from === cur);
    if (!next) break;
    walk.push(next.id);
    cur = next.id;
  }
  return walk;
}

// Whether the run carries on past this state. A dead end isn't a failure —
// "Nothing to change" and "Nothing in scope" are correct places to stop — but
// the run list has to stop offering a step this route can't reach. Nineteen of
// the sixty-six states end where they are.
export const continues = (states, id) => states.some((s) => s.from === id);

// "Step 2 of 3", or null when there is no run to report. A pattern with one
// slot — Clear Refusal, Confidence Levels — has no progression, so it gets no
// readout and no bar. The absence is the honest signal: those states happen
// instead of each other, not one after another.
export function place(states, id) {
  const all = slots(states);
  if (all.length < 2) return null;
  return `Step ${depth(states, id)} of ${all.length}`;
}

// True when the pattern has no run at all — one slot, several ways it can go.
export const isSet = (states) => slots(states).length < 2;

// True when any slot holds more than one alternative.
export const forks = (states) => slots(states).some((g) => g.length > 1);
