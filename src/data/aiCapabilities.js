// AI Patterns / By capability — the second way into the hub.
//
// The Patterns shelf is organised by PHASE: what a person is doing when the
// pattern happens (asking, waiting, reading, correcting…). This is organised by
// CAPABILITY: what the AI is doing (generating, summarising, acting…). The two
// are different questions — "what do I show while it thinks?" against "my
// feature summarises, what does that need?" — and a product team usually
// arrives with the second one. Ported from reference/ai-ui-patterns.html (the
// `CAPS` and `P` arrays), alongside the shelf rather than instead of it.
//
// WHAT WAS KEPT EXACTLY: every id, surface (`s`), layer, capability list and
// pairs list — the structure, and so every count, filter and link.
//
// WHAT WAS CHANGED: the copy, to the house voice in src/components/ai/CLAUDE.md.
//   - Names are plain noun phrases, Title Case, ≤18 characters, with no banned
//     word. The source's name is kept as `was`, so search still finds a pattern
//     by it — somebody who read "Streaming response" elsewhere should land here.
//   - British spelling, and jargon explained or removed (deterministic,
//     navigational, structured data, anomaly, alt text).
//
// TWELVE ARE MERGED INTO THE SHELF. They were the same pattern under a second
// name — Streaming response is Word by Word, Approval step is Approval Gate —
// and one pattern with two pages is two pages that will disagree. The shelf's
// entry wins because it is the deep one (states, decisions, failure modes).
// A merged entry keeps only what the shelf has no field for: where it sits in
// this view (surface, layer, capabilities), its pairs, its demo, and `was`. Its
// name, its line and its page are the shelf pattern's, read through `uiName`,
// `uiLine` and `uiTarget` below so no view has to know the difference. Its own
// use / avoid copy was dropped rather than kept beside the shelf's; the
// original is in reference/.
//
// Seven more are RELATED, not the same — Selection Actions is not Edit in
// Place, Smart Fill is not Answer in Fields — so they stay patterns of their
// own and `related` links them across.

import { AI_PATTERN_BY_ID } from "./aiPatterns.js";

export const AI_CAPABILITIES = [
  { id: "gen", name: "Generate", desc: "Create new text, images or code from a prompt.", ex: "Draft an email, write product copy, produce a first version of a design." },
  { id: "sum", name: "Summarise", desc: "Condense long content into what matters.", ex: "Meeting recaps, thread digests, document overviews." },
  { id: "rew", name: "Rewrite & Translate", desc: "Change the tone, length, language or format of existing content.", ex: "Shorten a paragraph, make a message friendlier, translate a comment." },
  { id: "cls", name: "Classify & Tag", desc: "Sort, label and route items automatically.", ex: "Inbox triage, ticket routing, content moderation." },
  { id: "ext", name: "Extract", desc: "Pull the details out of documents, images and messages and into fields.", ex: "Receipt scanning, contract fields, lead details from an email." },
  { id: "srch", name: "Search & Answer", desc: "Find information by what it means and answer questions about it.", ex: "Help centres, internal knowledge bases, product search." },
  { id: "rec", name: "Recommend", desc: "Suggest the next best item or action for each person.", ex: "Content feeds, related items, next steps in a workflow." },
  { id: "pred", name: "Predict & Detect", desc: "Forecast trends and flag what looks unusual.", ex: "Churn risk, alerts when a number looks off, demand forecasts." },
  { id: "conv", name: "Converse", desc: "Hold a back-and-forth conversation to help someone get something done.", ex: "Support chats, onboarding guides, in-app helpers." },
  { id: "act", name: "Act on Your Behalf", desc: "Plan and carry out multi-step tasks across tools.", ex: "Send follow-ups, book meetings, update records in bulk." },
  { id: "see", name: "See", desc: "Recognise objects, text and scenes in images and video.", ex: "Visual search, damage inspection, image descriptions, document scanning." },
  { id: "hear", name: "Hear & Speak", desc: "Turn speech into text and text into speech.", ex: "Dictation, call transcripts, voice commands, read-aloud." },
];

// `merged`: the shelf pattern this one IS. `related`: shelf patterns that
// cover neighbouring ground, rendered on a page as "Related on the shelf" (and,
// for a merged entry, the shelf's second near-twin — Undo AI Action was both
// Undo & History and After a Mistake; it merged into the first).
export const AI_UI_PATTERNS = [
  { id: "stream", was: "Streaming response", s: "both", layer: "core", caps: ["gen", "sum", "conv"],
    pairs: ["regen", "feedback"], merged: "streaming-response" },
  { id: "starters", was: "Starter prompts", s: "chat", layer: "core", caps: ["gen", "conv", "srch"],
    pairs: ["clarify", "copilot"], merged: "suggested-prompts" },
  { id: "ghost", was: "Inline suggestion", s: "embedded", layer: "core", caps: ["gen", "rew"],
    pairs: ["undo", "selbar"], merged: "inline-suggestion" },
  { id: "selbar", name: "Selection Actions", was: "Selection actions", s: "embedded", layer: "core", caps: ["rew", "sum", "gen"],
    use: "People want to act on one specific part of existing content.",
    avoid: "Content isn't editable, or most use happens on touch where selecting text is awkward.",
    pairs: ["diff", "variants"], related: ["refine-in-place"] },
  { id: "variants", name: "Several Options", was: "Multiple options", s: "both", layer: "core", caps: ["gen", "rew", "rec"],
    use: "Taste matters and there is no single right answer.",
    avoid: "Comparing options costs more effort than editing one good draft.",
    pairs: ["feedback", "regen"], related: ["regenerate-variants"] },
  { id: "tldr", name: "Summary Card", was: "Summary card", s: "embedded", layer: "core", caps: ["sum"],
    use: "Long content that people skim before deciding whether to read it.",
    avoid: "The content is already short, or every detail matters (legal, medical).",
    pairs: ["cite", "feedback"] },
  { id: "tags", name: "Suggested Tags", was: "Suggested tags", s: "embedded", layer: "core", caps: ["cls", "see"],
    use: "Items need consistent labels for sorting, filtering or routing.",
    avoid: "A wrong label is costly and hard to spot. Use a review queue instead.",
    pairs: ["conf", "why", "undo"] },
  { id: "autofill", name: "Smart Fill", was: "Smart fill", s: "embedded", layer: "core", caps: ["ext", "see"],
    use: "Data lives in a document or image and needs to land in a form.",
    avoid: "Fields are few and faster to type than to review.",
    pairs: ["conf", "approve"], related: ["structured-output"] },
  { id: "answer", name: "Answer on Top", was: "Answer above results", s: "embedded", layer: "core", caps: ["srch"],
    use: "Questions have a clear answer somewhere in your content.",
    avoid: "People are looking for a specific page, not an answer.",
    pairs: ["cite", "clarify"], related: ["grounded-answer"] },
  { id: "because", name: "Picks for a Reason", was: "\"Because you…\" row", s: "embedded", layer: "core", caps: ["rec"],
    use: "Recommendations need a reason people recognise from their own behaviour.",
    avoid: "The signal is sensitive or would feel invasive when shown back.",
    pairs: ["why", "feedback"] },
  { id: "anomaly", name: "Insight Callout", was: "Insight callout", s: "embedded", layer: "core", caps: ["pred"],
    use: "A chart or dashboard hides something worth acting on.",
    avoid: "Callouts fire often. People learn to ignore them.",
    pairs: ["why", "nudge"], related: ["unprompted-offer"] },
  { id: "nudge", was: "Proactive suggestion", s: "embedded", layer: "core", caps: ["rec", "pred", "cls"],
    pairs: ["why", "undo"], merged: "unprompted-offer", related: ["attention-budget"] },
  { id: "plan", was: "Plan & progress", s: "both", layer: "core", caps: ["act"],
    pairs: ["approve", "undo"], merged: "plan-preview", related: ["reasoning-transparency"] },
  { id: "clarify", name: "Follow-Up Question", was: "Clarifying question", s: "chat", layer: "core", caps: ["conv", "srch", "act"],
    use: "A request is ambiguous and guessing wrong would waste time.",
    avoid: "A sensible default exists. Act on it and let people change it.",
    pairs: ["starters", "plan"] },
  { id: "copilot", name: "Side Panel", was: "Side-panel assistant", s: "chat", layer: "core", caps: ["conv", "gen", "srch"],
    use: "People need help with what's on screen without leaving it.",
    avoid: "Screen space is tight, or a single action in place would do.",
    pairs: ["cite", "starters"], related: ["scoped-context"] },
  { id: "voice", name: "Live Transcript", was: "Live transcript", s: "both", layer: "core", caps: ["hear"],
    use: "People speak instead of type and need to see they were understood.",
    avoid: "The environment is noisy or private, with no typing fallback.",
    pairs: ["translate", "stream"] },
  { id: "detect", name: "Object Highlights", was: "Object highlights", s: "embedded", layer: "core", caps: ["see"],
    use: "People need to see what the AI found and where in an image.",
    avoid: "The image is small or crowded and boxes would hide what matters.",
    pairs: ["conf", "tags"] },
  { id: "translate", name: "Translation Toggle", was: "Translation toggle", s: "embedded", layer: "core", caps: ["rew", "hear"],
    use: "Content arrives in another language and people may want the original.",
    avoid: "Nuance or legal meaning depends on exact wording.",
    pairs: ["feedback", "conf"], related: ["ai-label"] },

  { id: "regen", was: "Regenerate & versions", s: "both", layer: "trust", caps: ["gen", "conv", "sum"],
    pairs: ["feedback", "variants"], merged: "regenerate-variants", related: ["edit-resend"] },
  { id: "cite", was: "Citations", s: "both", layer: "trust", caps: ["sum", "srch", "ext", "conv"],
    pairs: ["answer", "conf"], merged: "grounded-answer" },
  { id: "conf", was: "Confidence signal", s: "both", layer: "trust", caps: ["cls", "ext", "pred", "see"],
    pairs: ["cite", "approve"], merged: "confidence-hedging" },
  { id: "approve", was: "Approval step", s: "both", layer: "trust", caps: ["act", "ext"],
    pairs: ["diff", "undo"], merged: "approval-gate" },
  { id: "feedback", was: "Rate the result", s: "both", layer: "trust", caps: ["gen", "sum", "rec", "conv", "srch"],
    pairs: ["regen", "why"], merged: "answer-feedback" },
  { id: "diff", was: "Review changes", s: "embedded", layer: "trust", caps: ["rew", "act"],
    pairs: ["undo", "approve"], merged: "diff-review" },
  { id: "why", name: "Why This?", was: "\"Why this?\" explanation", s: "both", layer: "trust", caps: ["rec", "cls", "pred"],
    use: "A decision affects people and they deserve to know the main reason.",
    avoid: "The explanation would be vague (\"based on your activity\") and add nothing.",
    pairs: ["feedback", "conf"] },
  { id: "undo", was: "Undo AI action", s: "both", layer: "trust", caps: ["act", "rew", "cls"],
    pairs: ["approve", "diff"], merged: "version-history", related: ["wrong-answer"] },
];

export const AI_UI_PATTERN_BY_ID = new Map(AI_UI_PATTERNS.map((p) => [p.id, p]));
export const AI_CAPABILITY_BY_ID = new Map(AI_CAPABILITIES.map((c) => [c.id, c]));

export const SURFACE_LABEL = { chat: "Chat", embedded: "Embedded", both: "Chat & embedded" };

// The filter's three options, in the source's order and with its labels.
export const SURFACE_FILTERS = [
  { id: "all", label: "All surfaces" },
  { id: "chat", label: "Chat" },
  { id: "embedded", label: "Embedded in product" },
];

export const LAYERS = [
  { id: "core", label: "Core interaction", desc: "How people trigger the AI and receive what it produces." },
  { id: "trust", label: "Trust and control", desc: "How people check, steer and recover from what the AI did." },
];

// "All patterns" is a capability-shaped entry rather than a special case, the
// same as the source's fallback object, so the page head renders one shape.
export const ALL_CAPABILITY = {
  id: "all",
  name: "All patterns",
  desc: "Every pattern in the hub, across all capabilities.",
  ex: "Use the list on the left to see only the patterns for one capability.",
};

// The source's `fits` and `patternsFor`, unchanged. A "both" pattern passes
// either filter — it is a chat pattern AND an embedded one, not a third kind.
export const fitsSurface = (p, surface) => surface === "all" || p.s === surface || p.s === "both";
export const patternsFor = (cap, surface) =>
  AI_UI_PATTERNS.filter((p) => (cap === "all" || p.caps.includes(cap)) && fitsSurface(p, surface));

// What a view needs, without knowing whether an entry is merged. A merged
// entry is named and described by its shelf pattern — its definition, the one
// string the shelf writes to land cold — and opens the shelf page.
export const uiName = (p) => (p.merged ? AI_PATTERN_BY_ID.get(p.merged).name : p.name);
export const uiLine = (p) => (p.merged ? AI_PATTERN_BY_ID.get(p.merged).definition : p.use);
export const uiTarget = (p) => (p.merged ? { shelf: p.merged } : { capability: p.id });

// The other direction: the capability entry merged into a shelf pattern, so
// the shelf page can say which capabilities it serves.
export const MERGED_BY_SHELF = new Map(AI_UI_PATTERNS.filter((p) => p.merged).map((p) => [p.merged, p]));
