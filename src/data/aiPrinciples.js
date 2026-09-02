// AI Hub / Principles — the cross-cutting rules every pattern in the hub is an
// application of.
//
// Written from the seat of a product designer shipping AI inside a product,
// which is a deliberately different vantage point from the one most published
// AI-UX guidance is written from. Two things follow from it:
//
// 1. Chat is not assumed. Most of the AI a designer is asked to ship isn't a
//    conversation — it's a ranked queue, a pre-filled field, a risk score, a
//    flagged exception, an inline suggestion. Every rule below has to hold for
//    those surfaces first and for a chat box second, so none of them mention
//    prompts, turns, or responses. An earlier pass of this file did, and four
//    of the six quietly only worked if there was a text box on screen.
//
// 2. The decisions are product decisions, not rendering decisions. Where a
//    threshold sits, which error you'd rather make, where the human gate goes,
//    and what happens to a correction are all choices with owners and
//    consequences — and they get made in a config file by default if a designer
//    doesn't make them on purpose.
//
// Each one is meant to be arguable. A principle nobody could disagree with
// isn't guiding any decision.
//
// `applies` is what stops this page being six paragraphs to read and nothing to
// do. Each principle names the patterns that put it into practice, and those
// render as chips that open the pattern on its canvas — so the claim that "the
// patterns are applications of these" is something a reader can follow rather
// than something the page asserts. Documented patterns only: a chip that lands
// on an empty canvas teaches the opposite of the point.

export const AI_PRINCIPLES = [
  {
    id: "not-a-conversation",
    title: "Most AI isn't a conversation",
    body:
      "Chat asks people to describe what they want inside a system that already knows what they're doing. Put the intelligence where the decision happens: the order of a queue, a pre-filled field, a flagged exception. Save prompts for genuinely open-ended intent.",
    applies: ["scoped-context", "inline-suggestion", "staged-reveal", "prompt-composer"]
  },
  {
    id: "pick-your-error",
    title: "Start from the error you'd rather make",
    body:
      "A false positive and a false negative cost different people different amounts, and that asymmetry sets the threshold, the copy, and the review step. Draw the bands yourself — act, review, suppress — or the model's default decides for you.",
    applies: ["no-answer-fallback", "confidence-hedging", "structured-output"]
  },
  {
    id: "gate-to-cost",
    title: "Gate on consequence, not on confidence",
    body:
      "What the action costs sets where the gate goes, not how sure the model claims to be: a confident irreversible write needs one, an unsure reversible suggestion doesn't. And assume every gate gets clicked through — one that fires on everything manufactures consent.",
    applies: ["approval-gate", "plan-preview", "diff-review"]
  },
  {
    id: "correction-is-input",
    title: "Correction is an input, not a complaint",
    body:
      "With no prompt, correcting the system is the only way someone expresses intent — so a thumbs-down landing in a dashboard is a discard, not feedback. Decide where a fix lands, then say so: a correction that visibly changes nothing teaches people to stop making them.",
    applies: ["diff-review", "inline-suggestion", "version-history"]
  },
  {
    id: "presentation-vs-certainty",
    title: "Never let presentation imply certainty",
    body:
      "A prediction, a score, and a verified fact render identically unless someone decides otherwise. Visual weight, decisiveness of copy, and friction before the action all have to track how sure the system is — a confidence number beside output styled like fact is decoration.",
    applies: ["grounded-answer", "confidence-hedging", "structured-output"]
  },
  {
    id: "design-every-state",
    title: "Design every state the model can leave you in",
    body:
      "Cold start, below threshold, stale, partial, degraded, slow — all normal operating states, and failure is a state, not an error. Latency budgets come from the surface, not the model. Route them all to one spinner and one red toast and the product reads as broken while working as intended.",
    applies: ["streaming-response", "staged-reveal", "no-answer-fallback", "graceful-refusal"]
  },
];
