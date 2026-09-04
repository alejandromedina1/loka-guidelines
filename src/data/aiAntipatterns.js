// AI Hub / Anti-patterns — the named failures.
//
// Here for two reasons. Teams learn faster from a named mistake than from a
// correct example, and a shared name turns a vague misgiving in a review into a
// thing somebody can point at: "that's confidence theatre" ends a conversation
// that "it feels untrustworthy" only prolongs.
//
// Written to be readable by anyone in the company, because these are the
// failures that get *agreed to* in rooms without a designer in them — in a
// pitch, a roadmap, a stakeholder demo. Each one carries why it happens, since
// none of them are stupid: every single one is the locally reasonable choice.
export const AI_ANTIPATTERNS = [
  {
    id: "confidence-theatre",
    name: "Confidence theatre",
    looks:
      "A percentage printed next to output that's styled exactly like verified data.",
    why: "It's the cheapest thing to ship that looks like responsibility, and it passes review because a number is there.",
    instead:
      "Let the number change something. If 62% and 99% look identical on screen, the number isn't a measure of anything — it's a disclaimer.",
  },
  {
    id: "blank-box",
    name: "The blank box",
    looks:
      "A prompt field added to a workflow that already knew what the user was doing.",
    why: "Chat is the most visible form of AI, so it's the form that gets asked for by name.",
    instead:
      "Put the intelligence in the step itself — the order of the queue, the pre-filled field. Keep the prompt for genuinely open-ended intent.",
  },
  {
    id: "rubber-stamp",
    name: "The rubber stamp",
    looks:
      "An approval step that fires on everything and gets clicked through without being read.",
    why: "Gating everything feels safer than deciding what's worth gating, and it's easier to defend.",
    instead:
      "Gate on consequence. A gate nobody reads is worse than no gate: it produces a consent record for a decision nobody made.",
  },
  {
    id: "feedback-void",
    name: "The feedback void",
    looks:
      "Thumbs up and down that collect signal nobody acts on and the user never sees again.",
    why: "It's a one-day build that looks like a feedback loop on a roadmap.",
    instead:
      "Decide where a correction lands — this record, this person's future results, or the model — and show that it landed.",
  },
  {
    id: "silent-fallback",
    name: "The silent fallback",
    looks:
      "It found nothing in your data, so it answers from general knowledge instead — in exactly the same styling.",
    why: "An empty state reads as a broken feature, and answering always feels more helpful.",
    instead:
      "Say what was searched and that it found nothing. \"Nothing in these 12 documents covers this\" is a trustworthy answer.",
  },
  {
    id: "eternal-spinner",
    name: "The eternal spinner",
    looks: "A running indicator with no deadline, no cancel, and no explanation.",
    why: "Nobody decided what counts as too long, so nothing happens when it is.",
    instead:
      "Pick the number, then design what happens at it. A spinner with no deadline isn't a loading state, it's an unhandled one.",
  },
  {
    id: "sparkle-washing",
    name: "Sparkle-washing",
    looks: "A glow, a gradient, or a sparkle icon standing in for an explanation.",
    why: "It's the visual shorthand everyone now recognises, and it ships in an afternoon.",
    instead:
      "Say what the system did and on what basis. A badge teaches people to look for a badge, which is the opposite of knowing when the AI is guessing.",
  },
  {
    id: "happy-path-demo",
    name: "The happy-path demo",
    looks: "A demo, pitch, or screenshot built entirely on the cases that work.",
    why: "The failure states are the last thing built, so they're never the thing shown.",
    instead:
      "Demo a wrong answer on purpose. A room's trust is set by how the failure is handled, and showing it is also the only honest way to scope the work.",
  },
  {
    id: "one-number",
    name: "The one-number promise",
    looks: "“94% accurate”, quoted with no mention of which 6%.",
    why: "One number is far easier to sell internally than a spread of outcomes, and it's usually true.",
    instead:
      "Say which mistake the remainder is and who absorbs it. Six percent of routing errors and six percent of payment errors are not the same commitment.",
  },
];
