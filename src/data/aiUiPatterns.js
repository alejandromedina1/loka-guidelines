// AI Patterns Hub — the UI patterns for building AI features, in chat and in
// products that aren't a chat. Ported from reference/ai-ui-patterns.html (its
// `CAPS` and `P` arrays); ids, surfaces, layers, capabilities, pairs and copy
// are the source's own.
//
// Two axes, deliberately:
//   - CAPABILITY is what the AI does (generates, summarizes, acts…). It's the
//     question a product team arrives with — "my feature summarizes, what does
//     that need?" — so it's the Overview's filter.
//   - LAYER is what the pattern is for: the core interaction that delivers the
//     AI's output, or the trust and control that let people check, steer and
//     undo it. It's the sidebar's grouping, because a pattern has exactly one
//     layer but serves several capabilities — grouping the nav by capability
//     would list most patterns two or three times.
//
// Every pattern has a live demo in components/ai/demos/demos.js under the same id.

export const AI_CAPABILITIES = [
  { id: "gen", name: "Generate", desc: "Create new text, images or code from a prompt.", ex: "Draft an email, write product copy, produce a first version of a design." },
  { id: "sum", name: "Summarize", desc: "Condense long content into what matters.", ex: "Meeting recaps, thread digests, document overviews." },
  { id: "rew", name: "Rewrite & translate", desc: "Change the tone, length, language or format of existing content.", ex: "Shorten a paragraph, make a message friendlier, translate a comment." },
  { id: "cls", name: "Classify & tag", desc: "Sort, label and route items automatically.", ex: "Inbox triage, ticket routing, content moderation." },
  { id: "ext", name: "Extract", desc: "Pull structured data out of documents, images and messages.", ex: "Receipt scanning, contract fields, lead details from an email." },
  { id: "srch", name: "Search & answer", desc: "Find information by meaning and answer questions about it.", ex: "Help centers, internal knowledge bases, product search." },
  { id: "rec", name: "Recommend", desc: "Suggest the next best item or action for each person.", ex: "Content feeds, related items, next steps in a workflow." },
  { id: "pred", name: "Predict & detect", desc: "Forecast trends and flag what looks unusual.", ex: "Churn risk, anomaly alerts, demand forecasts." },
  { id: "conv", name: "Converse", desc: "Hold a back-and-forth dialogue to help someone get something done.", ex: "Support assistants, onboarding guides, in-app copilots." },
  { id: "act", name: "Act on your behalf", desc: "Plan and carry out multi-step tasks across tools.", ex: "Send follow-ups, book meetings, update records in bulk." },
  { id: "see", name: "See", desc: "Recognize objects, text and scenes in images and video.", ex: "Visual search, damage inspection, alt text, document scanning." },
  { id: "hear", name: "Hear & speak", desc: "Turn speech into text and text into speech.", ex: "Dictation, call transcripts, voice commands, read-aloud." },
];

// The pseudo-capability the Overview opens on.
export const ALL_CAPABILITY = {
  id: "all",
  name: "All patterns",
  desc: "Every pattern in the hub, across all capabilities.",
  ex: "Pick what the AI does to see only the patterns that bring it to the interface.",
};

export const AI_LAYERS = [
  { id: "core", label: "Core interaction", desc: "How people trigger the AI and receive what it produces." },
  { id: "trust", label: "Trust and control", desc: "How people check, steer and recover from what the AI did." },
];

// `s` is where the pattern lives: "chat", "embedded" in the product, or "both".
export const AI_UI_PATTERNS = [
  { id: "stream", name: "Streaming response", s: "both", layer: "core", caps: ["gen", "sum", "conv"],
    use: "Output takes more than a second to finish, so people see progress right away.",
    avoid: "The output is short, or it has to be validated as a whole before anyone sees it (like structured data).",
    pairs: ["regen", "feedback"] },
  { id: "starters", name: "Starter prompts", s: "chat", layer: "core", caps: ["gen", "conv", "srch"],
    use: "An open-ended input is empty and people don't know what to ask.",
    avoid: "The task is narrow and the input already explains itself.",
    pairs: ["clarify", "copilot"] },
  { id: "ghost", name: "Inline suggestion", s: "embedded", layer: "core", caps: ["gen", "rew"],
    use: "People write in context and the next words are predictable.",
    avoid: "Suggestions are long or often wrong. They break the writer's flow.",
    pairs: ["undo", "selbar"] },
  { id: "selbar", name: "Selection actions", s: "embedded", layer: "core", caps: ["rew", "sum", "gen"],
    use: "People want to act on one specific part of existing content.",
    avoid: "Content isn't editable, or most use happens on touch where selecting text is awkward.",
    pairs: ["diff", "variants"] },
  { id: "variants", name: "Multiple options", s: "both", layer: "core", caps: ["gen", "rew", "rec"],
    use: "Taste matters and there is no single right answer.",
    avoid: "Comparing options costs more effort than editing one good draft.",
    pairs: ["feedback", "regen"] },
  { id: "tldr", name: "Summary card", s: "embedded", layer: "core", caps: ["sum"],
    use: "Long content that people skim before deciding whether to read it.",
    avoid: "The content is already short, or every detail matters (legal, medical).",
    pairs: ["cite", "feedback"] },
  { id: "tags", name: "Suggested tags", s: "embedded", layer: "core", caps: ["cls", "see"],
    use: "Items need consistent labels for sorting, filtering or routing.",
    avoid: "A wrong label is costly and hard to spot. Use a review queue instead.",
    pairs: ["conf", "why", "undo"] },
  { id: "autofill", name: "Smart fill", s: "embedded", layer: "core", caps: ["ext", "see"],
    use: "Data lives in a document or image and needs to land in a form.",
    avoid: "Fields are few and faster to type than to review.",
    pairs: ["conf", "approve"] },
  { id: "answer", name: "Answer above results", s: "embedded", layer: "core", caps: ["srch"],
    use: "Questions have a clear answer somewhere in your content.",
    avoid: "Queries are navigational and people want a specific page, not an answer.",
    pairs: ["cite", "clarify"] },
  { id: "because", name: "“Because you…” row", s: "embedded", layer: "core", caps: ["rec"],
    use: "Recommendations need a reason people recognize from their own behavior.",
    avoid: "The signal is sensitive or would feel invasive when shown back.",
    pairs: ["why", "feedback"] },
  { id: "anomaly", name: "Insight callout", s: "embedded", layer: "core", caps: ["pred"],
    use: "A chart or dashboard hides something worth acting on.",
    avoid: "Callouts fire often. People learn to ignore them.",
    pairs: ["why", "nudge"] },
  { id: "nudge", name: "Proactive suggestion", s: "embedded", layer: "core", caps: ["rec", "pred", "cls"],
    use: "The AI notices something useful before people ask, and acting on it is one click.",
    avoid: "It interrupts focused work or can't be dismissed for good.",
    pairs: ["why", "undo"] },
  { id: "plan", name: "Plan & progress", s: "both", layer: "core", caps: ["act"],
    use: "A task has several steps and people need to see what is happening.",
    avoid: "The task is a single fast action. Just show the result.",
    pairs: ["approve", "undo"] },
  { id: "clarify", name: "Clarifying question", s: "chat", layer: "core", caps: ["conv", "srch", "act"],
    use: "A request is ambiguous and guessing wrong would waste time.",
    avoid: "A sensible default exists. Act on it and let people change it.",
    pairs: ["starters", "plan"] },
  { id: "copilot", name: "Side-panel assistant", s: "chat", layer: "core", caps: ["conv", "gen", "srch"],
    use: "People need help with what's on screen without leaving it.",
    avoid: "Screen space is tight, or a single inline action would do.",
    pairs: ["cite", "starters"] },
  { id: "voice", name: "Live transcript", s: "both", layer: "core", caps: ["hear"],
    use: "People speak instead of type and need to see they were understood.",
    avoid: "The environment is noisy or private, with no typing fallback.",
    pairs: ["translate", "stream"] },
  { id: "detect", name: "Object highlights", s: "embedded", layer: "core", caps: ["see"],
    use: "People need to see what the AI found and where in an image.",
    avoid: "The image is small or crowded and boxes would hide what matters.",
    pairs: ["conf", "tags"] },
  { id: "translate", name: "Translation toggle", s: "embedded", layer: "core", caps: ["rew", "hear"],
    use: "Content arrives in another language and people may want the original.",
    avoid: "Nuance or legal meaning depends on exact wording.",
    pairs: ["feedback", "conf"] },

  { id: "regen", name: "Regenerate & versions", s: "both", layer: "trust", caps: ["gen", "conv", "sum"],
    use: "Output varies run to run and people may prefer an earlier take.",
    avoid: "Results should be deterministic, like calculations or extracted data.",
    pairs: ["feedback", "variants"] },
  { id: "cite", name: "Citations", s: "both", layer: "trust", caps: ["sum", "srch", "ext", "conv"],
    use: "Answers come from sources that people may need to verify.",
    avoid: "The output is creative and has no source to point to.",
    pairs: ["answer", "conf"] },
  { id: "conf", name: "Confidence signal", s: "both", layer: "trust", caps: ["cls", "ext", "pred", "see"],
    use: "Accuracy varies and people should know when to double-check.",
    avoid: "Showing raw percentages to people who can't act on them. Use plain words.",
    pairs: ["cite", "approve"] },
  { id: "approve", name: "Approval step", s: "both", layer: "trust", caps: ["act", "ext"],
    use: "The AI is about to do something hard to undo: send, pay, delete, publish.",
    avoid: "The action is low risk and reversible. Confirming every step adds friction.",
    pairs: ["diff", "undo"] },
  { id: "feedback", name: "Rate the result", s: "both", layer: "trust", caps: ["gen", "sum", "rec", "conv", "srch"],
    use: "You need signal to improve quality, and people want to say something was off.",
    avoid: "Nobody reads the feedback. Then it's decoration.",
    pairs: ["regen", "why"] },
  { id: "diff", name: "Review changes", s: "embedded", layer: "trust", caps: ["rew", "act"],
    use: "The AI edits existing content and people must see exactly what changed.",
    avoid: "The rewrite is total. A before and after view works better.",
    pairs: ["undo", "approve"] },
  { id: "why", name: "“Why this?” explanation", s: "both", layer: "trust", caps: ["rec", "cls", "pred"],
    use: "A decision affects people and they deserve to know the main reason.",
    avoid: "The explanation would be vague (“based on your activity”) and add nothing.",
    pairs: ["feedback", "conf"] },
  { id: "undo", name: "Undo AI action", s: "both", layer: "trust", caps: ["act", "rew", "cls"],
    use: "The AI changed something for people and they need a fast way back.",
    avoid: "The action can't be reversed. Ask for approval before, instead.",
    pairs: ["approve", "diff"] },
];

export const AI_UI_PATTERN_BY_ID = new Map(AI_UI_PATTERNS.map((p) => [p.id, p]));
export const AI_CAPABILITY_BY_ID = new Map(AI_CAPABILITIES.map((c) => [c.id, c]));
export const AI_LAYER_BY_ID = new Map(AI_LAYERS.map((l) => [l.id, l]));

export const SURFACE_LABEL = { chat: "Chat", embedded: "Embedded", both: "Chat & embedded" };

export const SURFACE_FILTERS = [
  { id: "all", label: "All surfaces" },
  { id: "chat", label: "Chat" },
  { id: "embedded", label: "Embedded in product" },
];

// A "both" pattern fits either surface filter.
export const fitsSurface = (p, surface) => surface === "all" || p.s === surface || p.s === "both";

export const patternsFor = (cap, surface) =>
  AI_UI_PATTERNS.filter((p) => (cap === "all" || p.caps.includes(cap)) && fitsSurface(p, surface));
