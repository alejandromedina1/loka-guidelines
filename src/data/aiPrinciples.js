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
      "A chat box asks people to describe what they want inside a product that already knows what they're doing. Put the intelligence where the decision happens instead: the order of a list, a field filled in for them, an item flagged for review. Save the text box for questions that are genuinely open-ended.",
    applies: ["scoped-context", "inline-suggestion", "staged-reveal", "prompt-composer"]
  },
  {
    id: "pick-your-error",
    title: "Start from the error you'd rather make",
    body:
      "Acting when you shouldn't and doing nothing when you should are two different mistakes, and they cost different people different amounts. That gap is what sets the cut-off, the wording, and whether a human checks first. Decide the three bands yourself — act, review, ignore — or a default decides them for you.",
    applies: ["no-answer-fallback", "confidence-hedging", "structured-output"]
  },
  {
    id: "gate-to-cost",
    title: "Gate on consequence, not on confidence",
    body:
      "A stop-and-ask belongs where the action is expensive, not where the AI sounds unsure. Something confident but permanent needs one; a shaky suggestion you can ignore doesn't. And assume every one of them gets clicked through — a stop that appears for everything turns approval into a formality.",
    applies: ["approval-gate", "plan-preview", "diff-review"]
  },
  {
    id: "correction-is-input",
    title: "Correction is an input, not a complaint",
    body:
      "When there's no text box, correcting the AI is the only way someone can tell it anything — so a thumbs-down that ends up in a dashboard is a bin, not feedback. Decide where a fix actually goes, then say so. A correction that visibly changes nothing teaches people to stop bothering.",
    applies: ["diff-review", "inline-suggestion", "version-history"]
  },
  {
    id: "presentation-vs-certainty",
    title: "Never let presentation imply certainty",
    body:
      "A guess, a score and a checked fact all look identical unless somebody decides otherwise. How heavy it looks, how certain it sounds, and how much friction sits before the action all have to move with how sure the system is. A percentage printed next to something styled like a fact is decoration.",
    applies: ["grounded-answer", "confidence-hedging", "structured-output"]
  },
  {
    id: "design-every-state",
    title: "Design every state the model can leave you in",
    body:
      "No data yet, not sure enough, out of date, half-finished, running slow — all of these are normal, and failure is a state you design rather than an error you catch. How long is too long comes from the screen, not the model. Send them all to one spinner and one red message and the product reads as broken while working exactly as intended.",
    applies: ["streaming-response", "staged-reveal", "no-answer-fallback", "graceful-refusal"]
  },
];
