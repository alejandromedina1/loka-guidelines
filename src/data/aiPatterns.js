// AI Hub / Patterns — the pattern library itself.
//
// WHY THIS IS A PATTERN LIBRARY AND NOT A COMPONENT LIBRARY
//
// In conventional UI the unit of reuse is a rendered element: a Button looks
// and behaves the same in every product that installs it, so it can ship as
// code. In AI UI the unit of reuse is a behaviour over time — intent, wait,
// partial output, result, verify, correct — and every decision worth
// documenting lives in that sequence rather than in any single frame of it. A
// sequence doesn't compile into a prop API.
//
// The second reason is ownership: each pattern below encodes a policy (do we
// gate this action? at what confidence do we hedge? do we show the tool calls?)
// and policy is product-specific. A component that hardcodes those answers is
// wrong for most products; one that exposes them as props is a config file
// wearing a component's clothes.
//
// So the split across the system is:
//   Product Hub — the parts. Rendered, tokenised, copy-pasteable.
//   AI Hub      — the choreography. How parts are sequenced and governed, and
//                 what happens when the model is slow, wrong, or refuses.
// `composedOf` on each pattern is the seam between the two: those names are
// real entries in COMPONENT_LIST, and the chips deep-link into the playground.

// Turns a pattern name into its nav id, e.g. "Streaming Response" ->
// "ai-pattern-streaming-response". Mirrors componentId() in navigation.js.
export const aiPatternId = (id) => `ai-pattern-${id}`;

// The five things a user must be able to do to an AI interaction. Every
// documented pattern is graded against all five, which is what makes this hub
// prescriptive rather than a gallery: a pattern that can't say what happens
// when the user wants to stop, check, or undo isn't finished being designed.
//
// `n/a` is a real answer and is used freely — a refusal has nothing to
// interrupt. What isn't allowed is leaving an axis unstated.
export const CONTROL_AXES = [
  { id: "interrupt", label: "Interrupt", desc: "Can the user stop it mid-flight?" },
  { id: "inspect", label: "Inspect", desc: "Can they see how it got there?" },
  { id: "verify", label: "Verify", desc: "Can they check it against a source?" },
  { id: "correct", label: "Correct", desc: "Can they fix it without starting over?" },
  { id: "undo", label: "Undo", desc: "Can they get back to before?" },
];

// Grades used on the axes above, in descending order of obligation.
export const CONTROL_GRADES = {
  required: { label: "Required", tone: "req" },
  recommended: { label: "Recommended", tone: "rec" },
  na: { label: "N/A", tone: "na" },
};

// Six categories, organised by the user's relationship to the AI rather than by
// widget. Widget-based grouping ("chat", "autocomplete") ages badly and hides
// the fact that the same decisions recur across surfaces; this way a designer
// arrives with a problem ("the wait feels broken") and finds the aisle.
export const AI_CATEGORIES = [
  {
    id: "intent",
    label: "Intent & Input",
    blurb: "How a user states what they want, and how a vague first attempt stays recoverable.",
  },
  {
    id: "latency",
    label: "Latency & Progress",
    blurb: "The wait — which is most of the interaction, and where most AI products are lost.",
  },
  {
    id: "output",
    label: "Output & Legibility",
    blurb: "Making an answer readable, checkable, and honest about how sure it is.",
  },
  {
    id: "control",
    label: "Control & Correction",
    blurb: "How the user steers, edits, and reverses without starting from scratch.",
  },
  {
    id: "agentic",
    label: "Agentic & Multi-step",
    blurb: "When the system plans and acts, and where the human gate belongs.",
  },
  {
    id: "boundaries",
    label: "Boundaries & Failure",
    blurb: "Refusal, no-answer, and error as designed states rather than accidents.",
  },
];

// One state per pattern used to carry a `shortcut` string, feeding a Compare
// control in the playground. Both are gone: that control failed usability
// twice, and the Anti-patterns view carries the same argument with nine
// wireframes built for it. The playground is about how a pattern behaves over
// time, and it reads better for being about one thing.
//
// `useWhen` / `avoidWhen` entries are a `lead` plus a `detail` rather than one
// sentence each. The lead is what makes the two lists scannable: six full
// sentences per pattern read as two paragraphs, and nobody scanning for "does
// this apply to me" reads paragraphs. The detail is there for whoever the lead
// stopped.
//
// `states` is what makes a pattern legible to somebody who doesn't design for a
// living: every documented pattern lists the configurations it actually has —
// waiting, cited, stale, refused — and each one renders on the canvas as a
// wireframe you can look at, switched by the pills in the canvas foot. Same
// mechanism the Product Hub uses for a Button's or an Input Field's states,
// pointed at a behaviour instead of a control. A pattern nobody can *see* isn't
// much use in a stakeholder review, however well it's written up.
//
// Each documented pattern carries the same nine blocks. The two that make this
// hub worth having over the public AI-UX pattern sites are `decisions[].loka`
// (an actual default, so a designer can move without convening a workshop) and
// `shippedIn` (evidence we've run it, the way Imagery cites project frames).
//
// `status: "planned"` entries are taxonomy-only on purpose — same precedent as
// the components without a built preview: the shelf is browsable end to end
// before every page exists, and a one-line definition on a stub is still more
// useful to someone scanning for a pattern than a blank.
export const AI_PATTERNS = [
  // ── Intent & Input ─────────────────────────────────────────────────────────
  {
    id: "prompt-composer",
    name: "Prompt Composer",
    category: "intent",
    status: "documented",
    definition:
      "The primary input surface where a user states intent in their own words, plus the affordances that keep a vague first attempt recoverable.",
    states: [
      { id: "empty", label: "Empty", note: "Placeholder teaches scope, not etiquette. Send is off — there's nothing to send yet." },
      { id: "composing", label: "Composing", note: "Send turns on the moment there's something to send. No validation message for an empty field." },
      { id: "context", label: "With context", note: "What the AI can see, shown before it's sent. Context the user can't see beforehand is context they'll be surprised by." },
      { id: "submitted", label: "Submitted", note: "Locked and echoed above the answer. An editable prompt that no longer matches the answer lies about what produced it." },
      { id: "over", label: "Over limit", note: "The ceiling shows as it's approached, not on rejection. Silent truncation produces a confidently wrong answer." },
    ],
    useWhen: [
      { lead: "Open-ended intent", detail: "The request can't be enumerated in a form." },
      { lead: "Their words beat your controls", detail: "The user's vocabulary for the task is richer than anything you could build." },
      { lead: "The shape varies", detail: "What's being asked changes materially between uses." },
    ],
    avoidWhen: [
      { lead: "The options are known", detail: "A prompt field for four choices is a regression from a dropdown." },
      { lead: "They don't know what to ask", detail: "Lead with suggested prompts and let the composer be the second move." },
      { lead: "A misread is unrecoverable", detail: "Structure the input instead of parsing it." },
    ],
    decisions: [
      {
        q: "Free text, structured fields, or both?",
        loka:
          "Free text with optional structured chips. The chips carry the parameters models read badly — date ranges, target file, output format — and the prose carries the intent.",
      },
      {
        q: "Where does context attachment live?",
        loka:
          "Inside the composer, above the send affordance, visible before submit. Context the user can't see before sending is context they'll be surprised by afterwards.",
      },
      {
        q: "Enter to submit, or explicit click?",
        loka:
          "Enter submits and Shift+Enter newlines when the composer is single-purpose. In a multi-line authoring surface, require the click — an accidental send of a half-written thought costs more than a saved keystroke.",
      },
      {
        q: "Does the composer stay editable after submit?",
        loka:
          "No. Lock it and echo the submitted text. An editable prompt that no longer matches the answer on screen is a lie about what produced that answer.",
      },
      {
        q:
          "What do you do with a request too vague to act on?",
        loka:
          "Answer with the best interpretation and name it — “Assuming you meant last quarter.” A clarifying question alone is only right when the ambiguity is genuinely blocking; otherwise it reads as stalling.",
      },
    ],
    controls: {
      interrupt: { grade: "na", note: "Nothing is running yet." },
      inspect: { grade: "recommended", note: "Echo the resolved prompt, including injected context." },
      verify: { grade: "na" },
      correct: { grade: "required", note: "Edit-and-resend the previous turn, not only a fresh turn." },
      undo: { grade: "recommended", note: "Restore a cleared draft; drafts are expensive to retype." },
    },
    composedOf: ["Input Field", "File Upload", "Tags", "Button", "Tooltip"],
  },
  {
    id: "suggested-prompts",
    name: "Suggested Prompts",
    category: "intent",
    status: "planned",
    definition:
      "Seeded example requests that teach capability and scope at the empty state, where a blank field teaches nothing.",
  },
  {
    id: "scoped-context",
    name: "Scoped Context",
    category: "intent",
    status: "documented",
    definition:
      "Explicit, visible control over what the system can see — which sources, which records, which window — settled before the request runs.",
    states: [
      { id: "default", label: "Default scope", note: "The scope the system picked, stated plainly and before anything runs. A default nobody can see is a default nobody can correct." },
      { id: "editing", label: "Editing scope", note: "Sources toggle at the point of use, not three screens away in preferences." },
      { id: "narrow", label: "Narrowed", note: "The count moves as you go, so “what will it read” is a number rather than a promise." },
      { id: "empty", label: "Nothing in scope", note: "Blocked, and said out loud. This is the state that stops a silent fall back to general knowledge." },
      { id: "stale", label: "Scope changed", note: "A result carries the scope it was produced under. Change the scope and the result is marked out of date rather than quietly kept." },
    ],
    useWhen: [
      { lead: "The answer depends on which data", detail: "Two scopes give two different right answers, and only one of them is yours." },
      { lead: "Access differs per person", detail: "What one colleague can see another can't, and the result moves with it." },
      { lead: "The wrong scope fails silently", detail: "A missing source produces a confident answer, not an error." },
    ],
    avoidWhen: [
      { lead: "There's only one source", detail: "Name it once as orientation. A picker with one option is furniture." },
      { lead: "Policy fixes the scope", detail: "Then state it plainly rather than offering a control that can't move." },
    ],
    decisions: [
      {
        q:
          "Where does scope live?",
        loka:
          "At the point of use, above the action, visible before it runs. Scope in a settings page is scope nobody knows they have.",
      },
      {
        q:
          "Do you show what's excluded, or only what's included?",
        loka:
          "Show the ratio. “Reading 3 of 12 sources” is the sentence that stops somebody trusting an answer built on a quarter of the data — “Reading 3 sources” isn't.",
      },
      {
        q:
          "What happens when the scope is empty?",
        loka:
          "Block, and say why. Answering from general knowledge with nothing in scope, in the same styling as a sourced answer, is the single failure this pattern exists to prevent.",
      },
      {
        q:
          "Does a result remember the scope it came from?",
        loka:
          "Yes, and it goes stale when that scope changes. A result that silently outlives its inputs is worse than no result, because it looks current.",
      },
    ],
    controls: {
      interrupt: { grade: "na" },
      inspect: { grade: "required", note: "Which sources are in, which are out, and why one is unavailable." },
      verify: { grade: "required", note: "Open any source in scope from the scope control itself." },
      correct: { grade: "required", note: "Change the scope and re-run without rebuilding the request." },
      undo: { grade: "recommended", note: "Return to the default scope in one action." },
    },
    composedOf: ["Checkbox", "Filter", "Tags", "Input Dropdown", "Button"],
  },
  {
    id: "structured-intent",
    name: "Structured Intent",
    category: "intent",
    status: "planned",
    definition:
      "Form-shaped input for the parameters prose carries badly, used instead of a prompt rather than alongside it.",
  },

  // ── Latency & Progress ─────────────────────────────────────────────────────
  {
    id: "streaming-response",
    name: "Streaming Response",
    category: "latency",
    status: "documented",
    definition:
      "Output rendered progressively as it's produced, so the user is reading while the system is still working.",
    states: [
      { id: "waiting", label: "Waiting", note: "Nothing at all for 300ms, then a shape-matched skeleton. A spinner says “working”; this says what you're getting." },
      { id: "streaming", label: "Streaming", note: "Steady cadence rather than raw token jitter, and Stop is present from the first token — never on hover." },
      { id: "complete", label: "Complete", note: "Actions unlock here and not before. Offering to act on a partial answer is offering to act on a wrong one." },
      { id: "stopped", label: "Stopped", note: "The user's own choice, so it stays neutral. The partial is kept, marked, and still copyable." },
      { id: "dropped", label: "Connection lost", note: "A genuine failure, so it reads as one. The partial survives and both Continue and Retry are offered." },
    ],
    useWhen: [
      { lead: "Slow and linear", detail: "Generation takes over a second and the output is prose, code, or a list." },
      { lead: "Partial output is useful", detail: "The first sentences stand on their own before the rest arrives." },
      { lead: "Perceived speed matters", detail: "You need felt latency far below actual latency." },
    ],
    avoidWhen: [
      { lead: "The output is a structure", detail: "A table or a payload is read whole — streaming renders it wrong for most of its life." },
      { lead: "It may rewrite itself", detail: "Watching output reorder mid-flight destroys confidence faster than waiting would." },
      { lead: "A half-answer misleads", detail: "A dosage, a legal clause, a financial total." },
    ],
    decisions: [
      {
        q: "What fills the gap before the first token?",
        loka:
          "A shape-matched skeleton, not a spinner. A spinner says “working”; a skeleton says “working, and here's what you're getting.” Wait 300ms before showing anything — faster than that and the placeholder is a flash of noise.",
      },
      {
        q: "Token-by-token or chunked?",
        loka:
          "Chunk to word or clause boundaries at a deliberately steady rate. Raw token cadence is jittery, and jitter reads as instability even when it's genuinely faster.",
      },
      {
        q: "Can the user scroll away mid-stream?",
        loka:
          "Yes — and autoscroll must yield on the first upward scroll, with a “jump to latest” affordance back. Autoscroll that fights the reader is the single most common streaming defect in shipped products.",
      },
      {
        q: "Are actions available mid-stream?",
        loka:
          "Stop, always. Copy, regenerate, and feedback only on Complete — offering to act on a partial answer is offering to act on a wrong one.",
      },
      {
        q:
          "How long may a stream go silent before you say something?",
        loka:
          "About five seconds, then say so in place and offer retry. A frozen cursor is an error state the user has to guess at, and they'll guess that the product is broken.",
      },
    ],
    controls: {
      interrupt: { grade: "required", note: "Stop must be present from the first token, not on hover." },
      inspect: { grade: "recommended", note: "Surface which step or tool is producing the current text." },
      verify: { grade: "recommended", note: "Citations resolve after Complete, not mid-stream." },
      correct: { grade: "required", note: "Regenerate and refine on the finished turn." },
      undo: { grade: "na", note: "Nothing outside the view has changed." },
    },
    composedOf: ["Spinner", "Progress Bar", "Button", "Card", "Toast"],
  },
  {
    id: "staged-reveal",
    name: "Staged Reveal",
    category: "latency",
    status: "documented",
    definition:
      "Structured output disclosed in finished units — a card, a row, a section at a time — for answers that can't be streamed as prose.",
    states: [
      { id: "skeletons", label: "All pending", note: "Shape-matched placeholders at the units' real dimensions, so nothing moves when the values land." },
      { id: "partial", label: "Partly resolved", note: "Each unit arrives complete. A half-rendered table is worse than an empty one — it invites reading." },
      { id: "slow", label: "One unit lagging", note: "The slow one says so in its own space rather than holding the other five hostage." },
      { id: "failed", label: "One unit failed", note: "A single failure doesn't discard the four that worked, and it retries on its own." },
      { id: "complete", label: "Complete", note: "Same layout as the skeletons. If the page reflowed on the way here, the placeholders were the wrong shape." },
    ],
    useWhen: [
      { lead: "Output is structured, not prose", detail: "Cards, rows, metrics — things read whole rather than left to right." },
      { lead: "Units resolve independently", detail: "One slow query has no business holding the other five." },
      { lead: "The layout is known in advance", detail: "You can hold the shape before you have the values." },
    ],
    avoidWhen: [
      { lead: "Units are meaningless alone", detail: "A total that lands before its rows invites a decision on half the data." },
      { lead: "They would reorder as they arrive", detail: "A view that reshuffles while it's being read is worse than one that waits." },
    ],
    decisions: [
      {
        q:
          "What holds the space before a unit resolves?",
        loka:
          "A skeleton at that unit's real dimensions. Anything that resizes on arrival makes the reader lose their place, which is the cost this pattern was meant to avoid.",
      },
      {
        q:
          "What counts as a unit?",
        loka:
          "The smallest thing somebody can act on by itself. A metric card yes; a single cell no. Too fine and the page flickers; too coarse and you've rebuilt the spinner.",
      },
      {
        q:
          "How long before a slow unit says something?",
        loka:
          "Around five seconds, in place, without blocking its neighbours. Each unit owns its own delay and its own failure.",
      },
      {
        q:
          "Do finished units get their actions before the rest arrive?",
        loka:
          "Yes, per unit. Gating export or drill-down on the whole view finishing spends the entire benefit of staging it.",
      },
    ],
    controls: {
      interrupt: { grade: "recommended", note: "Stop the run without losing the units already in." },
      inspect: { grade: "recommended", note: "Which unit is waiting on what." },
      verify: { grade: "recommended", note: "Each unit carries its own source and freshness." },
      correct: { grade: "na" },
      undo: { grade: "na" },
    },
    composedOf: ["Card", "Spinner", "Progress Bar", "Alert", "Empty State"],
  },
  {
    id: "reasoning-transparency",
    name: "Reasoning Transparency",
    category: "latency",
    status: "planned",
    definition:
      "Showing the work in progress — steps, searches, tool calls — as both a progress signal and a trust signal.",
  },
  {
    id: "interruptible-generation",
    name: "Interruptible Generation",
    category: "latency",
    status: "planned",
    definition:
      "Stop, pause, and redirect as first-class controls, including what happens to the partial result afterwards.",
  },

  // ── Output & Legibility ────────────────────────────────────────────────────
  {
    id: "grounded-answer",
    name: "Grounded Answer",
    category: "output",
    status: "documented",
    definition:
      "An answer bound to the sources it came from, at a granularity the user can actually check.",
    states: [
      { id: "cited", label: "Cited", note: "Markers sit on the claim, not on the answer. An answer-level source list proves sources were consulted, not that this sentence came from them." },
      { id: "source", label: "Source open", note: "Opens at the cited passage with its date. A link to page one of a forty-page PDF is a citation nobody checks twice." },
      { id: "mixed", label: "Mixed", note: "Ungrounded sentences look different. Grounded and generated prose blended into one uniform paragraph is the most dangerous output in AI UI." },
      { id: "none", label: "Nothing found", note: "“Searched 12 documents, found nothing” is a useful, trustworthy answer. Falling back to general knowledge in the same style is not." },
      { id: "locked", label: "Restricted", note: "A source exists and this user can't open it. Hiding it makes a grounded answer look invented; showing the content leaks it." },
    ],
    useWhen: [
      { lead: "It's a factual claim", detail: "About the user's own data, or about the world." },
      { lead: "Being wrong is expensive", detail: "A confident error costs real money or real credibility." },
      { lead: "Someone is accountable", detail: "The user will answer to somebody else for acting on it." },
    ],
    avoidWhen: [
      { lead: "The output is generative", detail: "A draft, a rewrite, a brainstorm. There's no source, and citation UI implies a factuality the task doesn't have." },
      { lead: "The source is already open", detail: "A marker pointing at the document on screen is ceremony." },
    ],
    decisions: [
      {
        q: "Citation granularity — answer, paragraph, or sentence?",
        loka:
          "Sentence or clause, attached to the specific claim. An answer-level source list is decoration: it proves sources were consulted, not that this sentence came from them.",
      },
      {
        q: "Inline markers or a source panel?",
        loka:
          "Both, and linked. Markers for scanning, panel for reading. The marker must open the source at the cited passage — a link to page one of a forty-page PDF is a citation the user won't check twice.",
      },
      {
        q: "What happens to the uncited sentences?",
        loka:
          "Make them visibly different. Grounded and generated prose blended into one uniform paragraph is the most dangerous composition in AI UI, and it's the default outcome of doing nothing.",
      },
      {
        q: "Do you show retrieval that found nothing?",
        loka:
          "Yes. “Searched 12 documents, found nothing on this” is a useful and trustworthy answer. Silently falling back to model knowledge, styled identically to a grounded answer, is not.",
      },
      {
        q:
          "What happens when a citation doesn't support the claim?",
        loka:
          "Assume it will happen — it's the pattern's defining failure. Put one-click reporting on the citation itself, and never render an unresolvable citation as though it resolved.",
      },
    ],
    controls: {
      interrupt: { grade: "na" },
      inspect: { grade: "required", note: "Which sources were searched, not only which were cited." },
      verify: { grade: "required", note: "The entire point of the pattern; one click to the passage." },
      correct: { grade: "recommended", note: "Dispute a citation without discarding the answer." },
      undo: { grade: "na" },
    },
    composedOf: ["Link", "Popover", "Tooltip", "Tags", "Accordion", "Card"],
  },
  {
    id: "confidence-hedging",
    name: "Confidence & Hedging",
    category: "output",
    status: "documented",
    definition:
      "Communicating how sure the system is in a way that changes what the reader does — without theatre, and without precision you don't have.",
    states: [
      { id: "high", label: "Above the bar", note: "Shown plainly, action open. Confidence that changes nothing is decoration." },
      { id: "banded", label: "Banded", note: "A band, labelled, rather than a decimal. Nobody can act on the difference between 73.42% and 71.08%." },
      { id: "low", label: "Below the bar", note: "Hedged, and the action gated behind a check. The interface changes, not just the label." },
      { id: "unavailable", label: "No score", note: "Not enough signal, said out loud. A number you'd tell somebody to ignore shouldn't be on screen at all." },
    ],
    useWhen: [
      { lead: "A number drives a decision", detail: "Somebody acts differently at 60 than at 80." },
      { lead: "Certainty varies a lot by record", detail: "Some have signal and some genuinely don't." },
      { lead: "Being wrong is costly but recoverable", detail: "Worth hedging; not worth blocking." },
    ],
    avoidWhen: [
      { lead: "Confidence changes no action", detail: "If every band leads to the same next step, the number is decoration." },
      { lead: "You can't explain the number", detail: "An unexplainable score erodes more trust than no score does." },
    ],
    decisions: [
      {
        q:
          "A number, a band, or a word?",
        loka:
          "A labelled band. Precision you don't have reads as precision you do, and the second decimal place is a claim about accuracy nobody can support.",
      },
      {
        q:
          "Does confidence change the interface or only annotate it?",
        loka:
          "Change it. Low confidence gates the action behind a check; high confidence doesn't. A score that leaves the screen identical is a score nobody uses.",
      },
      {
        q:
          "What happens below the floor?",
        loka:
          "No score, with the reason. Showing a number and telling people to disregard it spends trust for nothing.",
      },
      {
        q:
          "Who sees the score?",
        loka:
          "Whoever carries the consequence. A score visible to a manager and hidden from the person acting on it is an accountability gap wearing a design decision.",
      },
    ],
    controls: {
      interrupt: { grade: "na" },
      inspect: { grade: "required", note: "What the score is built from, in the reader's terms." },
      verify: { grade: "recommended", note: "Open the evidence behind a band." },
      correct: { grade: "recommended", note: "Flag a score as wrong, and have that go somewhere." },
      undo: { grade: "na" },
    },
    composedOf: ["Tags", "Progress Bar", "Tooltip", "Alert", "Card"],
  },
  {
    id: "structured-output",
    name: "Structured Output",
    category: "output",
    status: "documented",
    definition:
      "Answers rendered as fields, rows or cards rather than prose, when the reader's next action is checking or copying values rather than reading.",
    states: [
      { id: "extracted", label: "Extracted", note: "Every field carries its own confidence. One number for a whole document tells nobody which line to check." },
      { id: "lowconf", label: "Needs checking", note: "The uncertain field is marked and reachable, not averaged into a document-level score." },
      { id: "missing", label: "Not found", note: "Empty and labelled. A plausible guess in an empty field is the worst thing this pattern can produce, because it's indistinguishable from a read." },
      { id: "source", label: "Traced to source", note: "Click a value, see where on the page it came from. Extraction without provenance is transcription you have to redo to trust." },
      { id: "edited", label: "Corrected", note: "Human-set, marked, and never overwritten by a later run." },
    ],
    useWhen: [
      { lead: "The next action is entry or comparison", detail: "Somebody is about to copy these values into something else." },
      { lead: "The shape is known in advance", detail: "You know the fields before you know the answers." },
      { lead: "Values fail differently", detail: "A wrong total and a wrong date are not the same mistake." },
    ],
    avoidWhen: [
      { lead: "The answer is genuinely a narrative", detail: "Forcing prose into fields loses the part that mattered." },
      { lead: "The schema changes per document", detail: "A form that rebuilds itself every time is harder to check than a paragraph." },
    ],
    decisions: [
      {
        q:
          "Does confidence sit on the document or on each field?",
        loka:
          "Each field. A document-level score is unactionable — it says something is wrong somewhere and leaves the reader to find it, which is the work they came here to avoid.",
      },
      {
        q:
          "What does a value the model couldn't find look like?",
        loka:
          "Empty, and labelled “not found”. Never a plausible guess: an inferred value in a field that looks read is the one failure nobody catches.",
      },
      {
        q:
          "Can a field be traced back to the document?",
        loka:
          "Yes — click the value, see the region it came from. Extraction you can't trace is transcription you have to redo before you can trust it.",
      },
      {
        q:
          "What happens to a value a person corrected?",
        loka:
          "It's marked human-set and survives the next run untouched. Losing a correction to a re-extraction is how you teach people to stop correcting.",
      },
    ],
    controls: {
      interrupt: { grade: "na" },
      inspect: { grade: "required", note: "Per-field confidence, and which pass produced the value." },
      verify: { grade: "required", note: "Every field opens the place in the source it came from." },
      correct: { grade: "required", note: "Edit in place, and the edit sticks." },
      undo: { grade: "recommended", note: "Revert a field to the extracted value." },
    },
    composedOf: ["Input Field", "Tags", "Tooltip", "Card", "Button"],
  },
  {
    id: "inline-suggestion",
    name: "Inline Suggestion",
    category: "output",
    status: "documented",
    definition:
      "Ghost-text completion inside the user's own work, where accepting is one keystroke and rejecting is silence.",
    states: [
      { id: "typing", label: "Typing", note: "Nothing offered yet. A suggestion on the first character is a guess about an intent nobody has formed." },
      { id: "offered", label: "Suggestion offered", note: "Visibly not theirs. If a writer can't see where their sentence ends and the model's begins, they'll ship yours without deciding to." },
      { id: "accepted", label: "Accepted", note: "One keystroke and it becomes their text — plain, no residue, no badge." },
      { id: "dismissed", label: "Dismissed", note: "Rejection is silence. Keep typing and it's gone: no dialog, nothing to undo." },
      { id: "unavailable", label: "Nothing to suggest", note: "Absence is a correct state. Padding with a low-confidence guess to look responsive is how the good suggestions get ignored too." },
    ],
    useWhen: [
      { lead: "They're already writing", detail: "The work exists and you're finishing it, not starting it." },
      { lead: "Rejection must cost nothing", detail: "Ignoring the suggestion has to be the cheapest thing on screen." },
      { lead: "The next few words are predictable", detail: "There's enough context to be right more often than not." },
    ],
    avoidWhen: [
      { lead: "Being wrong is expensive", detail: "A silent accept on a clinical, legal, or financial field is a mistake nobody chose to make." },
      { lead: "They don't know what they want yet", detail: "Completion assumes a formed intent. Offer options instead of finishing a sentence they haven't thought of." },
    ],
    decisions: [
      {
        q:
          "How is the suggestion told apart from what they typed?",
        loka:
          "Visibly lighter, never the same weight, and never the same colour. This is the whole pattern — get it wrong and people publish words they never read.",
      },
      {
        q:
          "What accepts it?",
        loka:
          "Tab, and only Tab. Enter belongs to the form; binding both means accepting by accident on every submit.",
      },
      {
        q:
          "When do you offer nothing at all?",
        loka:
          "Below your confidence bar, and at the very start of a field. A suggestion that's usually wrong trains people to type straight through it, and then the good ones go past too.",
      },
      {
        q:
          "Does a suggestion survive the next keystroke?",
        loka:
          "No. Anything that isn't accept clears it. A stale suggestion sitting beside changed text is a wrong suggestion that still looks live.",
      },
    ],
    controls: {
      interrupt: { grade: "na" },
      inspect: { grade: "recommended", note: "Say what the suggestion was drawn from when it isn't obvious." },
      verify: { grade: "na" },
      correct: { grade: "required", note: "Accepted text is ordinary text — editable immediately, with no special state." },
      undo: { grade: "required", note: "One undo returns to exactly what they had typed, not to an intermediate." },
    },
    composedOf: ["Input Field", "Tooltip", "Tags", "Button"],
  },

  // ── Control & Correction ───────────────────────────────────────────────────
  {
    id: "diff-review",
    name: "Diff Review",
    category: "control",
    status: "documented",
    definition:
      "AI-proposed changes shown against current state, accepted or rejected per unit by the user.",
    states: [
      { id: "proposed", label: "Proposed", note: "Nothing applied and nothing pre-selected. Accept-all exists but is never the default." },
      { id: "partial", label: "Partly accepted", note: "Per hunk, because per-line is precision nobody uses and all-or-nothing is a gamble on the weakest change in the set." },
      { id: "applied", label: "Applied", note: "What landed, in the user's terms, with a stated window to take it back out." },
      { id: "stale", label: "Stale", note: "The file moved under the proposal. Re-propose — applying a stale diff silently corrupts work in progress." },
      { id: "empty", label: "Nothing to change", note: "A success state, rendered as one. An empty diff reads as a broken feature." },
    ],
    useWhen: [
      { lead: "They already own it", detail: "Code, a document, a config, a record they've invested in." },
      { lead: "It decomposes", detail: "The change splits into units a person can judge independently." },
      { lead: "Late discovery is costly", detail: "Cheap to reject now, expensive to find out about later." },
    ],
    avoidWhen: [
      { lead: "It's one atomic value", detail: "A diff is more ceremony than the change is worth." },
      { lead: "There's nothing to diff against", detail: "The artifact is being created rather than edited." },
      { lead: "The volume guarantees rubber-stamping", detail: "Past a certain size the review is theatre. Gate the operation instead." },
    ],
    decisions: [
      {
        q: "Accept granularity — all, per file, per hunk, per line?",
        loka:
          "Per hunk, with accept-all available but never pre-selected. Per-line is precision nobody uses; all-or-nothing turns a review into a gamble on the weakest change in the set.",
      },
      {
        q: "Inline or side-by-side?",
        loka:
          "Side-by-side for structural rewrites, inline for small edits in long context. Choose per change size, not once per product.",
      },
      {
        q: "Is the proposal editable before accepting?",
        loka:
          "Yes. Forcing reject-and-reprompt to fix a near-miss is the most expensive interaction in the pattern, and near-misses are the common case.",
      },
      {
        q: "Does anything apply automatically?",
        loka:
          "No. Auto-apply plus undo is not equivalent to review plus apply — the user has to notice a change before they can undo it, and the changes they don't notice are precisely the ones that hurt.",
      },
      {
        q:
          "What if the file changed while the proposal was open?",
        loka:
          "Detect it and re-propose. Applying a stale diff silently overwrites work somebody else was in the middle of, and nobody finds out until later.",
      },
    ],
    controls: {
      interrupt: { grade: "required", note: "Abandon a review without applying anything." },
      inspect: { grade: "required", note: "Before and after, plus why this change was proposed." },
      verify: { grade: "required", note: "Full surrounding context, not just the changed lines." },
      correct: { grade: "required", note: "Edit the proposal in place." },
      undo: { grade: "required", note: "One reversal of the whole apply, not per-hunk archaeology." },
    },
    composedOf: ["Card", "Button", "Checkbox", "Tabs", "Alert", "Banner"],
  },
  {
    id: "regenerate-variants",
    name: "Regenerate & Variants",
    category: "control",
    status: "planned",
    definition:
      "Re-rolling an answer, and showing alternatives side by side, without losing the one already on screen.",
  },
  {
    id: "refine-in-place",
    name: "Refine In Place",
    category: "control",
    status: "planned",
    definition:
      "Adjusting a result by acting on it directly — select and instruct — rather than by rewriting the original prompt.",
  },
  {
    id: "version-history",
    name: "Undo & Version History",
    category: "control",
    status: "documented",
    definition:
      "A legible trail of what the AI changed, when, and on what basis — and a way back to any point on it.",
    states: [
      { id: "trail", label: "Change trail", note: "AI runs named, human edits named. Telling the two apart at a glance is the whole value of a trail." },
      { id: "diff", label: "One change", note: "What a single run altered, in the record's own terms rather than as a payload." },
      { id: "attributed", label: "Attribution", note: "The run, the scope it could see, and what triggered it. A diff with no context says what happened and nothing about why." },
      { id: "restore", label: "Restoring", note: "Restoring writes a new entry rather than erasing. History that can be rewritten isn't history." },
    ],
    useWhen: [
      { lead: "The AI writes to something durable", detail: "A record, a document, a configuration people rely on." },
      { lead: "Changes accumulate", detail: "The tenth edit is the one nobody noticed." },
      { lead: "Somebody will ask who changed this", detail: "And “the system” is not an answer." },
    ],
    avoidWhen: [
      { lead: "The output is disposable", detail: "A draft nobody keeps needs no trail." },
      { lead: "The trail would outweigh the work", detail: "Logging every keystroke of an assisted edit buries the changes that matter." },
    ],
    decisions: [
      {
        q:
          "Are AI changes marked differently from human ones?",
        loka:
          "Always, and named by the run rather than by “System”. A trail that flattens the two is a log, not a history.",
      },
      {
        q:
          "How far back does it go?",
        loka:
          "State the window and mean it. An “unlimited” history that silently truncates is worse than an honest thirty days.",
      },
      {
        q:
          "Does restoring erase what came after?",
        loka:
          "No — it appends. The restore is itself a change somebody may have to account for, and a history you can rewrite can't be used as evidence.",
      },
      {
        q:
          "What's recorded beside the change?",
        loka:
          "The run, the scope it saw, and the trigger. Without those, a reader can see what happened and still not know whether it should have.",
      },
    ],
    controls: {
      interrupt: { grade: "na" },
      inspect: { grade: "required", note: "What changed, by which run, on what basis." },
      verify: { grade: "required", note: "Compare any point against the current state." },
      correct: { grade: "recommended", note: "Restore a single field rather than the whole record." },
      undo: { grade: "required", note: "Return to any point, as a new entry." },
    },
    composedOf: ["List Item", "Avatar", "Tags", "Button", "Accordion"],
  },

  // ── Agentic & Multi-step ───────────────────────────────────────────────────
  {
    id: "approval-gate",
    name: "Approval Gate",
    category: "agentic",
    status: "documented",
    definition:
      "A deliberate stop before an action with consequences outside the interface, where the user authorises what the system is about to do.",
    states: [
      { id: "await", label: "Awaiting approval", note: "The effect in the user's language with the target named. If the copy is the function signature, they're approving something they haven't understood." },
      { id: "modified", label: "Modified", note: "Change a parameter, then approve. Approve-or-reject alone forces a full restart to fix one field — which is what trains people not to read." },
      { id: "executing", label: "Executing", note: "Step-level progress, because step-level failure is possible." },
      { id: "done", label: "Executed", note: "A receipt of what actually happened, not a toast that it was submitted." },
      { id: "failed", label: "Failed midway", note: "What did and didn't happen, per step. “Something went wrong” after an authorised multi-step write is the worst message the product can produce." },
    ],
    useWhen: [
      { lead: "The effect leaves the interface", detail: "It writes to a system of record, spends money, contacts a third party, or can't be undone." },
      { lead: "It's right 95% of the time", detail: "Which is exactly the number that makes unattended execution unacceptable." },
      { lead: "Someone else bears it", detail: "The consequence lands on a person who isn't in the room." },
    ],
    avoidWhen: [
      { lead: "It would fire constantly", detail: "Gates that fire dozens of times a session get dismissed reflexively, which manufactures consent." },
      { lead: "A scope genuinely covers the risk", detail: "Then ask once, explicitly, instead of asking always." },
    ],
    decisions: [
      {
        q: "What exactly is being approved?",
        loka:
          "The concrete effect, in the user's language, with the specific target named — “Email 1,240 subscribers”, never “Run send_campaign”. If the copy is the function signature, the user is approving something they haven't understood.",
      },
      {
        q: "Per-action, per-session, or per-scope?",
        loka:
          "Per-action by default. Offer scope escalation — “allow reads on this repo for this session” — as an explicit user choice, never as a default the system remembered on their behalf.",
      },
      {
        q: "Can the user modify before approving?",
        loka:
          "Yes, wherever the parameters are legible. Approve-or-reject alone forces a full restart to change one field, and that friction is what trains people to approve without reading.",
      },
      {
        q: "What does a timeout do?",
        loka:
          "Nothing. An unanswered gate expires unexecuted. Executing on timeout converts inattention into authorisation, which is the one thing a gate exists to prevent.",
      },
      {
        q:
          "How do you report a failure that happens after approval?",
        loka:
          "At step granularity: what did and didn't happen, in counts. “Something went wrong” after an authorised multi-step write is the worst message the product can produce.",
      },
    ],
    controls: {
      interrupt: { grade: "required", note: "Reject, and abort the whole run, not just this step." },
      inspect: { grade: "required", note: "Exact parameters and the plan step this came from." },
      verify: { grade: "required", note: "Enough of the target's current state to judge the effect." },
      correct: { grade: "recommended", note: "Modify parameters, then approve." },
      undo: { grade: "required", note: "Where the action permits it — and say plainly when it doesn't." },
    },
    composedOf: ["Dialog", "Modal", "Button", "Alert", "Tags", "List Item"],
  },
  {
    id: "plan-preview",
    name: "Plan Preview",
    category: "agentic",
    status: "documented",
    definition:
      "The sequence the system intends to run, shown and editable while changing it is still cheap.",
    states: [
      { id: "proposed", label: "Plan proposed", note: "Every step visible and removable. Nothing has run." },
      { id: "edited", label: "Step removed", note: "Cut a step and the plan re-costs itself. Editing beats rejecting and starting again." },
      { id: "running", label: "Running", note: "Step-level progress, because step-level failure is what happens." },
      { id: "paused", label: "Paused", note: "Stopped at a boundary, with what's done and what's left both stated." },
      { id: "done", label: "Complete", note: "A receipt of what actually ran, not a toast saying it was submitted." },
    ],
    useWhen: [
      { lead: "The work is genuinely multi-step", detail: "The outcome hides the steps that produce it." },
      { lead: "Steps carry different risk", detail: "One of them is the one that matters." },
      { lead: "Fixing beforehand is cheaper", detail: "Editing a plan beats undoing an execution." },
    ],
    avoidWhen: [
      { lead: "The plan is one step", detail: "Then it's an Approval Gate, and a list of one is ceremony." },
      { lead: "The steps aren't legible", detail: "A plan nobody can read is a progress bar with extra ceremony." },
    ],
    decisions: [
      {
        q:
          "Is the plan editable, or only approvable?",
        loka:
          "Editable per step. Approve-or-reject on a six-step plan forces a restart to remove one step, and that friction is exactly why people approve steps they'd have cut.",
      },
      {
        q:
          "What counts as a step?",
        loka:
          "The level at which somebody would say no. “Send 1,240 emails” is a step; “open connection” is noise, and noise is what makes a plan stop being read.",
      },
      {
        q:
          "Can it pause mid-run?",
        loka:
          "Yes, at step boundaries, stating what's done and what's left. A run you can only kill is a run people won't start.",
      },
      {
        q:
          "Does a failed run resume or restart?",
        loka:
          "Resume. Completed steps stay completed — re-running them is how a retry turns into a duplicate send.",
      },
    ],
    controls: {
      interrupt: { grade: "required", note: "Pause at a boundary, and abandon before anything runs." },
      inspect: { grade: "required", note: "Every step's real parameters, not its label alone." },
      verify: { grade: "required", note: "What each step will touch, before it touches it." },
      correct: { grade: "required", note: "Remove or edit a step and re-run the plan." },
      undo: { grade: "recommended", note: "Reverse the steps that can be reversed, and say which can't." },
    },
    composedOf: ["List Item", "Checkbox", "Button", "Progress Bar", "Modal"],
  },
  {
    id: "tool-call-trace",
    name: "Tool-Call Trace",
    category: "agentic",
    status: "planned",
    definition:
      "A readable record of what the system did on the user's behalf — collapsed by default, complete on demand.",
  },
  {
    id: "background-handoff",
    name: "Background Task Handoff",
    category: "agentic",
    status: "planned",
    definition:
      "Work that outlives the session: leaving, being notified, and returning to a result that still makes sense.",
  },

  // ── Boundaries & Failure ───────────────────────────────────────────────────
  {
    id: "graceful-refusal",
    name: "Graceful Refusal",
    category: "boundaries",
    status: "documented",
    definition:
      "The designed state for “I won't or can't do this” — a legitimate outcome of a working system, not an error.",
    states: [
      { id: "policy", label: "Policy limit", note: "Your product's voice, not the model's — and no red. A policy limit is the system working as intended." },
      { id: "capability", label: "Capability limit", note: "Specific enough to change the next move. “I can't help with that” just produces a retry of the same request." },
      { id: "noanswer", label: "No confident answer", note: "Low confidence is an outcome, not an error. Saying so beats a guess styled as fact." },
      { id: "partial", label: "Stopped partway", note: "Keep and label what was finished. Discarding completed work silently reads as a crash." },
    ],
    useWhen: [
      { lead: "Always", detail: "Every AI surface produces refusals. The only question is whether yours were designed or inherited from a raw model string." },
    ],
    avoidWhen: [
      { lead: "It's really a missing feature", detail: "Dressing an unbuilt capability as a boundary teaches people the limit is permanent, so they stop asking." },
    ],
    decisions: [
      {
        q: "Where does the refusal copy come from?",
        loka:
          "Your product, not the model. Raw model refusals are inconsistent in voice, frequently wrong about the actual reason, and sometimes apologise for things your product does support.",
      },
      {
        q: "How much reason to give?",
        loka:
          "Enough to change the next move. “I can't access private repositories” is actionable; “I can't help with that” produces a reflexive retry of the identical prompt and a second identical refusal.",
      },
      {
        q: "Does it look like an error?",
        loka:
          "No. No red, no error iconography for policy and capability limits — those are working as intended. Reserve error treatment for genuine failures, or you'll spend that signal and have none left when something actually breaks.",
      },
      {
        q: "Is there a path forward?",
        loka:
          "Always. Offer the nearest thing you can do, one click away. A refusal that dead-ends is the moment a user decides the feature doesn't work.",
      },
      {
        q:
          "What happens when you refuse something legitimate?",
        loka:
          "Assume over-refusal happens and give a low-friction way to report it. A rising over-refusal rate is a product metric, not a support queue.",
      },
    ],
    controls: {
      interrupt: { grade: "na" },
      inspect: { grade: "recommended", note: "Which limit — policy, capability, permission, or data." },
      verify: { grade: "na" },
      correct: { grade: "recommended", note: "Reframe the request without retyping it." },
      undo: { grade: "na" },
    },
    composedOf: ["Empty State", "Banner", "Link", "Button", "Alert"],
  },
  {
    id: "no-answer-fallback",
    name: "No-Answer Fallback",
    category: "boundaries",
    status: "documented",
    definition:
      "What takes an answer's place when nothing clears the confidence bar — and why that beats a guess dressed as a result.",
    states: [
      { id: "confident", label: "Confident results", note: "The ordinary case, here for contrast: matches above the bar, shown plainly with their scores." },
      { id: "none", label: "Nothing above the bar", note: "An empty result is a real answer. Say what was searched and where the bar sat." },
      { id: "weak", label: "Below the bar", note: "Weak matches shown as weak, behind a deliberate action, never mixed into the same list as strong ones." },
      { id: "insufficient", label: "Not enough data", note: "Cold start is not no-match. One says come back later, the other says change your criteria, and conflating them wastes the user's next hour." },
    ],
    useWhen: [
      { lead: "Anywhere you rank or match", detail: "Every ranked surface has a case where nothing qualifies, whether or not it was designed." },
      { lead: "A weak result invites a real decision", detail: "Somebody will act on whatever sits at the top of the list." },
      { lead: "The bar is a product choice", detail: "You set it, so you can say what it was." },
    ],
    avoidWhen: [
      { lead: "A best guess is genuinely useful", detail: "Completing a city name needs no confidence story." },
    ],
    decisions: [
      {
        q:
          "What does the empty state actually say?",
        loka:
          "What was searched, where the bar was, and what to change. “No results” with no numbers is indistinguishable from a broken query, and gets reported as one.",
      },
      {
        q:
          "Do you show what fell below the bar?",
        loka:
          "Behind an explicit action, labelled as below it. Never merged into the same list — that merge is the failure this pattern is named after.",
      },
      {
        q:
          "Is “no data” the same state as “no match”?",
        loka:
          "No, and treating them as one is the most common version of this mistake. Sparse data means wait; no match means change the criteria.",
      },
      {
        q:
          "Who can move the bar?",
        loka:
          "Say where it is, and let the user loosen it deliberately if the task allows. Never move it silently to fill the page.",
      },
    ],
    controls: {
      interrupt: { grade: "na" },
      inspect: { grade: "required", note: "What was searched, how many candidates, and where the bar sat." },
      verify: { grade: "recommended", note: "Open any near miss to judge it yourself." },
      correct: { grade: "required", note: "Widen the criteria without starting the search over." },
      undo: { grade: "na" },
    },
    composedOf: ["Empty State", "List Item", "Filter", "Banner", "Button"],
  },
  {
    id: "error-retry",
    name: "Error & Retry",
    category: "boundaries",
    status: "planned",
    definition:
      "Genuine failures — timeouts, rate limits, outages — expressed in the user's terms, with the right retry.",
  },
  {
    id: "capability-disclosure",
    name: "Capability Disclosure",
    category: "boundaries",
    status: "planned",
    definition:
      "Setting the boundary before it's hit: what this surface can do, on what data, with what freshness.",
  },
];

// Category id -> its patterns, in declaration order. Drives the sidebar and the
// hub's index, so a pattern added above can't be left out of either.
export const AI_PATTERNS_BY_CATEGORY = AI_CATEGORIES.map((cat) => ({
  ...cat,
  patterns: AI_PATTERNS.filter((p) => p.category === cat.id),
}));

export const AI_PATTERN_BY_ID = new Map(AI_PATTERNS.map((p) => [p.id, p]));

export const DOCUMENTED_COUNT = AI_PATTERNS.filter((p) => p.status === "documented").length;
