// Mocked AI, so every playground works offline and without a key.
//
// A playground has to answer what somebody actually typed, or typing teaches
// nothing — the old previews drew one canned answer whatever went into the
// box. These helpers are the whole of the "model": classify the request into
// the outcome the pattern is about, vary the wording off the request so two
// different questions get two different answers, and take a believable but
// short time doing it.
//
// Everything here is pure. A preview calls these when somebody presses a
// button and stores the RESULT in its working data — the outcome, how long the
// wait will be — so `work.state` and `work.tick` stay functions of the data
// and the render checks can still drive every playground without a clock.

// The playground's Response control. "fail" is how a reader reaches a failure
// by doing something rather than by picking it from a list — and it is a thing
// they chose, so the hub's rule that nothing breaks on its own still holds.
export const SIMS = [
  { id: "normal", label: "Normal" },
  { id: "slow", label: "Slow" },
  { id: "fail", label: "Fails" },
  // Nothing usable comes back — an empty result, reached by asking.
  { id: "empty", label: "Nothing back" },
  // Nobody answers in time. For patterns that wait on a person (a gate), the
  // wait runs out; it is the one Response that is about the reader, not the
  // model.
  { id: "timeout", label: "No reply" },
];

// The wait. Long enough to read as work, short enough that the key moment of
// any playground lands inside three seconds even on Slow.
export const thinkFor = (sim) => (sim === "slow" ? 2600 : 650);

// A stable small number from a string, so the same request always gets the
// same answer and a different one gets a different answer.
export function hash(text) {
  let h = 2166136261;
  for (const ch of String(text).trim().toLowerCase()) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return h >>> 0;
}

export const pick = (text, options) => options[hash(text) % options.length];

// The first rule whose words appear in the request, or the fallback. Rules are
// [outcome, [words]] in priority order.
export function classify(text, rules, fallback) {
  const t = ` ${String(text).toLowerCase()} `;
  for (const [outcome, words] of rules) if (words.some((w) => t.includes(w))) return outcome;
  return fallback;
}

// Money as people write it: "£300", "300 pounds", or nothing.
export function amountIn(text, fallback) {
  const m = String(text).match(/£\s?([\d,]+(?:\.\d{1,2})?)/) || String(text).match(/([\d,]+)\s*(?:pounds|gbp)/i);
  return m ? `£${Number(m[1].replace(/,/g, "")).toLocaleString("en-GB")}` : fallback;
}

// A wait in front of a pattern that used to open on its finished answer.
//
// Eight patterns drew the result straight away — the sources already cited,
// the fields already filled, the plan already written — so the most common
// moment in AI UI, waiting for it, was the one they never showed. This wraps a
// preview's `work` so it opens on that wait and settles into the result it
// used to open on:
//
//   for(id)    the wait is its own state (`loading: true` over the start's
//              data); every other state is the old one with `loading: false`
//   state(w)   the wait while loading, the old answer otherwise
//   tick(w)    the wait ends on its own after thinkFor(sim) — never on a
//              failure, because it settles into the start state
//
// `keep` and any other statics on the wrapped work pass straight through.
export function withLoading(work, { id, start }) {
  return {
    ...work,
    for: (sid) => (sid === id ? { ...work.for(start), loading: true } : { ...work.for(sid), loading: false }),
    state: (w) => (w.loading ? id : work.state(w)),
    tick: (w, sim) =>
      w.loading ? { work: { ...w, loading: false }, in: thinkFor(sim) } : work.tick ? work.tick(w, sim) : null,
  };
}
