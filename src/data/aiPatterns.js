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
export // Every state carries `by` — what moves the system into it — and `from`, the
// state it follows. A state with no `from` is a way the pattern can *start*.
//
// That pair is what lets the canvas draw the shape a pattern actually has
// instead of assuming all of them are sequences. Only five of the fourteen
// are: Streaming Response forks three ways at the end, Clear Refusal's four
// states are four kinds of refusal that never follow one another, Confidence
// Levels is a set of outcomes ordered by descending certainty. Drawing those
// as a filled progress bar taught that they happen in order, which is the
// opposite of true — and it is why Play read as five screenshots on a timer
// rather than as a behaviour.
//
// Nothing declares a shape. It is derived in flow.js from these two fields,
// so a pattern can't claim to be a sequence while branching.
//
// What is NOT here is anything about which states the system reaches on its
// own. A state carried an `auto: true` for one pass, and it was the wrong place
// for it: a flag on a state can only say "and then this one happens", which is
// a jump cut. The system's half of a behaviour is the four cards landing one at
// a time and the answer arriving a word at a time, and that is a move through
// the surface's data rather than through this list. It lives on the preview as
// `work.tick` — see PatternDetail.jsx.

const CONTROL_AXES = [
  { id: "interrupt", label: "Interrupt", desc: "Can the user stop it mid-flight?" },
  { id: "inspect", label: "Inspect", desc: "Can they see how it got there?" },
  { id: "verify", label: "Verify", desc: "Can they check it against a source?" },
  { id: "correct", label: "Correct", desc: "Can they fix it without starting over?" },
  { id: "undo", label: "Undo", desc: "Can they get back to before?" },
];

// The surfaces a pattern has to survive besides the one it is drawn on.
//
// These are NOT categories, and the distinction is the whole reason the field
// exists. The six categories are phases of an interaction — where you are in it
// — and they were built that way on purpose: "widget-based grouping ages badly
// and hides the fact that the same decisions recur across surfaces". Voice and
// canvas are surfaces. Giving them aisles of their own would put the shelf on
// two axes at once, so a designer whose voice product has a broken-feeling wait
// would have to choose between Waiting & Progress and Voice — and the answer is
// both, which is the moment a taxonomy stops being a way in.
//
// So the surface goes on the pattern instead, and it is the claim the hub makes
// about itself finally being checked rather than assumed. Measured before this
// was written: 45% of the 62 decisions are worded for a screen, and seven of
// the fourteen definitions name a visual thing outright. The split is not even —
// Approval Gate, Clear Refusal, Change Review, Undo & History and Plan Preview
// are almost surface-free at one visual decision in five, while Prompt Box and
// Sourced Answer are four in five. The phases hold everywhere. The answers
// don't, and saying which is the useful part.
//
// The screen isn't listed: it is what every preview draws, so an entry for it
// would say "as shown above" fourteen times.
export const AI_SURFACES = [
  {
    id: "voice",
    label: "Voice",
    blurb: "Spoken, with nothing on screen to point at and no way to skim back.",
  },
  {
    id: "canvas",
    label: "Canvas",
    blurb: "A spatial surface where the output is an object somebody places, moves and edits.",
  },
];

// Three answers, and only three. "Different answers" is the interesting one and
// the commonest: the pattern applies, the decisions it forces are the same, and
// what you decide is not.
export const SURFACE_VERDICTS = {
  holds: "Holds",
  changes: "Different answers",
  none: "No form here",
};

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
    blurb: "How people tell the AI what they want, and how a vague first try stays fixable.",
  },
  {
    id: "latency",
    label: "Waiting & Progress",
    blurb: "The wait. It is most of the experience, and it is where most AI products are lost.",
  },
  {
    id: "output",
    label: "Output & Clarity",
    blurb: "Making an answer readable, checkable, and honest about how sure it is.",
  },
  {
    id: "control",
    label: "Control & Correction",
    blurb: "How people steer, edit and undo without starting from scratch.",
  },
  {
    id: "agentic",
    label: "Agentic & Multi-step",
    blurb: "When the AI plans and acts on its own, and where a person has to say yes.",
  },
  {
    id: "boundaries",
    label: "Boundaries & Failure",
    blurb: "Saying no, finding nothing, and breaking — designed on purpose rather than left to chance.",
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
// wireframe you can look at — and, where the move is a user's, operate. Same
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
    name: "Prompt Box",
    category: "intent",
    status: "documented",
    definition:
      "The box where someone types what they want in their own words — plus the small things around it that make a vague first try easy to fix.",
    states: [
      { id: "empty", label: "Empty", note: "Placeholder teaches scope, not etiquette. Send is off — there's nothing to send yet.", by: "you open a new request" },
      { id: "composing", label: "Composing", note: "Send turns on the moment there's something to send. No validation message for an empty field.", from: "empty", by: "you start typing" },
      { id: "context", label: "With context", note: "The file, the dates, the output format — on chips, before anything is sent. Context nobody can see beforehand is context they'll be surprised by.", from: "empty", by: "you add context" },
      { id: "over", label: "Over limit", note: "The limit shows as you approach it, not once you're refused. Quietly cutting the text off produces a confident answer to half a question.", from: "empty", by: "you pass the limit" },
      { id: "submitted", label: "Submitted", note: "Locked and echoed above the answer. An editable prompt that no longer matches the answer lies about what produced it.", from: "composing", by: "you press Send" },
    ],
    useWhen: [
      { lead: "The request is open-ended", detail: "The request can't be enumerated in a form." },
      { lead: "Their words beat your menus", detail: "The user's vocabulary for the task is richer than anything you could build." },
      { lead: "Every request is different", detail: "What's being asked changes materially between uses." },
    ],
    avoidWhen: [
      { lead: "The options are known", detail: "A prompt field for four choices is a regression from a dropdown." },
      { lead: "They don't know what to ask", detail: "Lead with suggested prompts and let the composer be the second move." },
      { lead: "Misreading it can't be undone", detail: "Structure the input instead of parsing it." },
    ],
    decisions: [
      {
        q: "Free text, structured fields, or both?",
        loka: "Free text with optional structured chips.",
        why: "The chips carry the parameters models read badly — date ranges, target file, output format — and the prose carries the intent.",
        shows: "context",
      },
      {
        q: "Where does context attachment live?",
        loka: "Inside the input box, above the send button, visible before anything is sent.",
        why: "Context the user can't see before sending is context they'll be surprised by afterwards.",
        shows: "context",
      },
      {
        q: "Enter to submit, or explicit click?",
        loka: "Enter submits and Shift+Enter newlines when the composer is single-purpose.",
        why: "In a multi-line authoring surface, require the click — an accidental send of a half-written thought costs more than a saved keystroke.",
      },
      {
        q: "Does the composer stay editable after submit?",
        loka: "No.",
        why: "Lock it and echo the submitted text. An editable prompt that no longer matches the answer on screen is a lie about what produced that answer.",
        shows: "submitted",
      },
      {
        q:
          "What do you do with a request too vague to act on?",
        loka: "Answer with the best interpretation and name it — “Assuming you meant last quarter.”",
        why: "A clarifying question alone is only right when the ambiguity is genuinely blocking; otherwise it reads as stalling.",
      },
    ],
    controls: {
      interrupt: { grade: "na", note: "Nothing is running yet." },
      inspect: { grade: "recommended", note: "Echo the resolved prompt, including injected context." },
      verify: { grade: "na", note: "Nothing has been produced yet to check." },
      correct: { grade: "required", note: "Edit-and-resend the previous turn, not only a fresh turn." },
      undo: { grade: "recommended", note: "Restore a cleared draft; drafts are expensive to retype." },
    },
    surfaces: {
      voice: { verdict: "changes", note: "What someone says is the box. Nothing to edit before it goes, so a vague first try gets fixed by the product asking one question back." },
      canvas: { verdict: "changes", note: "What is selected is the context, so the box opens at the object rather than in a panel and carries that selection as its scope." },
    },
    composedOf: ["Input Field", "File Upload", "Tags", "Button", "Tooltip"],
    optionalParts: ["File Upload", "Tags", "Tooltip"],
  },
  {
    id: "suggested-prompts",
    name: "Suggested Prompts",
    category: "intent",
    status: "planned",
    definition:
      "Ready-made examples sitting in an empty input, because a blank box tells nobody what the thing can do.",
  },
  {
    id: "scoped-context",
    name: "Visible Sources",
    category: "intent",
    status: "documented",
    definition:
      // "Allowed" was doing real damage here. It is permission vocabulary, and
      // this is the page description — the one string that has to land cold —
      // so it taught readers that ticking a box grants the AI access. It
      // doesn't: you already have access to everything you can tick, and the
      // one row you can't tick is the permission decision, made elsewhere by
      // somebody else. "For this piece of work" carries what the checkboxes
      // actually decide, which is relevance.
      "Showing which data the AI will read for this piece of work — which sources, which records, which dates — and letting people change it before it runs.",
    states: [
      { id: "default", label: "Default scope", note: "The scope the system picked, stated plainly and before anything runs. A default nobody can see is a default nobody can correct.", by: "you open a new request" },
      { id: "editing", label: "Editing scope", note: "Sources switch on and off right where they're used, not three screens away in settings.", from: "default", by: "you switch another one on" },
      { id: "narrow", label: "Narrowed", note: "The count moves as you go, so “what will it read” is a number rather than a promise.", from: "default", by: "you switch sources off" },
      { id: "empty", label: "Nothing in scope", note: "Blocked, and said out loud. This is the state that stops a silent fall back to general knowledge.", from: "default", by: "you switch them all off" },
      { id: "stale", label: "Scope changed", note: "A result carries the scope it was produced under. Change the scope and the result is marked out of date rather than quietly kept.", from: "editing", by: "a source changes after it ran" },
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
        loka: "At the point of use, above the action, visible before it runs.",
        why: "Scope in a settings page is scope nobody knows they have.",
        shows: "default",
      },
      {
        q:
          "Do you show what's excluded, or only what's included?",
        loka: "Show both numbers.",
        why: "“Reading 3 of 12 sources” is what stops somebody trusting an answer built on a quarter of the data — “Reading 3 sources” doesn't.",
        shows: "narrow",
      },
      {
        q:
          "What happens when the scope is empty?",
        loka: "Block, and say why.",
        why: "Answering from general knowledge with nothing in scope, in the same styling as a sourced answer, is the single failure this pattern exists to prevent.",
        shows: "empty",
      },
      {
        q:
          "Does a result remember the scope it came from?",
        loka: "Yes, and it goes stale when that scope changes.",
        why: "A result that silently outlives its inputs is worse than no result, because it looks current.",
        shows: "stale",
      },
    ],
    controls: {
      interrupt: { grade: "na", note: "Choosing what it can see doesn't start anything running." },
      inspect: { grade: "required", note: "Which sources are in, which are out, and why any one of them isn't available." },
      verify: { grade: "required", note: "Open any of the sources straight from the control that lists them." },
      correct: { grade: "required", note: "Change what it can see and run it again without rebuilding the request." },
      undo: { grade: "recommended", note: "Get back to the starting selection in one action." },
    },
    surfaces: {
      voice: { verdict: "changes", note: "Say the scope, don't list it — “reading your current and joint accounts” before the answer. Four items read aloud is a list nobody holds." },
      canvas: { verdict: "holds", note: "The surface this is easiest on: a selection already is scope at the point of use, visible before anything runs." },
    },
    composedOf: ["Checkbox", "Filter", "Tags", "Input Dropdown", "Button"],
    // Checkbox moved out of optional: it was listed as a part you could do
    // without, in the one pattern whose whole argument is that sources switch
    // on and off where they're used. Filter and Input Dropdown stay optional —
    // they are ways to cope with a long list, not the thing the pattern is.
    optionalParts: ["Filter", "Input Dropdown"],
  },
  {
    id: "structured-intent",
    name: "Guided Input",
    category: "intent",
    status: "planned",
    definition:
      "Asking with fields instead of a sentence, for the details people describe badly in words — dates, amounts, formats.",
  },

  // ── Latency & Progress ─────────────────────────────────────────────────────
  {
    id: "streaming-response",
    name: "Streaming Response",
    category: "latency",
    status: "documented",
    definition:
      "The answer appears as it's being written, so people can start reading before it's finished.",
    states: [
      { id: "waiting", label: "Waiting", note: "Nothing at all for a third of a second, then a grey outline in the shape of the answer. A spinner says “working”; an outline says what you're going to get.", by: "you send a request" },
      { id: "streaming", label: "Streaming", note: "A steady pace rather than the model's own stutter, and Stop is there from the first word — never only on hover.", from: "waiting", by: "the first words arrive" },
      { id: "complete", label: "Complete", note: "Actions unlock here and not before. Offering to act on a partial answer is offering to act on a wrong one.", from: "streaming", by: "it finishes on its own" },
      { id: "stopped", label: "Stopped", note: "The user's own choice, so it stays neutral. The partial is kept, marked, and still copyable.", from: "streaming", by: "you press Stop" },
      { id: "dropped", label: "Connection lost", note: "A genuine failure, so it reads as one. The partial survives and both Continue and Retry are offered.", from: "streaming", by: "the connection drops" },
    ],
    useWhen: [
      { lead: "Slow and linear", detail: "It takes more than a second and the answer is text, code or a list." },
      { lead: "Half an answer still helps", detail: "The first sentences stand on their own before the rest arrives." },
      { lead: "It has to feel fast", detail: "The wait has to feel far shorter than it actually is." },
    ],
    avoidWhen: [
      { lead: "The answer is a table or a form", detail: "A table or a form is read all at once — while it streams in, it's simply wrong." },
      { lead: "It may rewrite itself", detail: "Watching output reorder mid-flight destroys confidence faster than waiting would." },
      { lead: "A half-answer misleads", detail: "A dosage, a legal clause, a financial total." },
    ],
    decisions: [
      {
        q: "What fills the gap before the first word arrives?",
        loka: "A grey outline in the shape of what's coming, not a spinner.",
        why: "A spinner says “working”; an outline says “working, and here's what you're going to get.” Wait a third of a second before showing anything — sooner than that and the placeholder is just a flash.",
        shows: "waiting",
      },
      {
        q: "Word by word, or in small groups?",
        loka: "In small groups, landing on whole words and phrases, at a deliberately even pace.",
        why: "The model's own rhythm stutters, and stutter reads as something going wrong even when it's genuinely faster.",
        shows: "streaming",
      },
      {
        q: "Can the user scroll away mid-stream?",
        loka: "Yes, and the auto-scroll must yield the moment they scroll up.",
        why: "Give them a “jump to latest” button back. Auto-scrolling that fights the reader is the most common streaming mistake in shipped products.",
      },
      {
        q: "Are actions available mid-stream?",
        loka: "Stop, always.",
        why: "Copy, regenerate, and feedback only on Complete — offering to act on a partial answer is offering to act on a wrong one.",
        shows: "streaming",
      },
      {
        q:
          "How long can it go quiet before you say something?",
        loka: "About five seconds, then say so where it stopped and offer a retry.",
        why: "A frozen cursor is an error the reader has to guess at, and they will guess the product is broken.",
        shows: "dropped",
      },
    ],
    controls: {
      interrupt: { grade: "required", note: "Stop is there from the first word, not only on hover." },
      inspect: { grade: "recommended", note: "Show which step is producing the text on screen." },
      verify: { grade: "recommended", note: "Citations resolve after Complete, not mid-stream." },
      correct: { grade: "required", note: "Regenerate and refine on the finished turn." },
      undo: { grade: "na", note: "Nothing outside the view has changed." },
    },
    surfaces: {
      voice: { verdict: "changes", note: "Speech already arrives a bit at a time, so there is nothing to put up first. Stop means talking over it, and whatever was said has to survive as text." },
      canvas: { verdict: "changes", note: "An object doesn't arrive a word at a time. It arrives rough and sharpens, and Stop keeps the last version that finished." },
    },
    composedOf: ["Spinner", "Progress Bar", "Button", "Card", "Toast"],
    optionalParts: ["Spinner", "Progress Bar", "Card", "Toast"],
  },
  {
    id: "staged-reveal",
    name: "Results in Pieces",
    category: "latency",
    status: "documented",
    definition:
      "Results that arrive one finished piece at a time — a card, a row, a section — for answers that can't sensibly appear word by word.",
    states: [
      { id: "skeletons", label: "All pending", note: "Grey outlines at the real size of each piece, so nothing jumps when the values arrive.", by: "you open the page" },
      { id: "partial", label: "Some arrived", note: "Each piece arrives finished. A half-drawn table is worse than an empty one, because it invites reading.", from: "skeletons", by: "the first pieces land" },
      { id: "slow", label: "One piece lagging", note: "The slow one says so in its own space rather than holding the other five hostage.", from: "skeletons", by: "one piece runs long" },
      { id: "failed", label: "One piece failed", note: "A single failure doesn't discard the four that worked, and it retries on its own.", from: "skeletons", by: "one piece errors" },
      { id: "complete", label: "Complete", note: "The same layout as the outlines. If the page shifted on the way here, the placeholders were the wrong size.", from: "partial", by: "the last piece lands" },
    ],
    useWhen: [
      { lead: "The answer is cards or rows, not paragraphs", detail: "Cards, rows, metrics — things read whole rather than left to right." },
      { lead: "Each piece finishes on its own", detail: "One slow piece has no business holding up the other five." },
      { lead: "You know the layout before the values", detail: "You can hold the shape before you have the values." },
    ],
    avoidWhen: [
      { lead: "One piece means nothing on its own", detail: "A total that lands before its rows invites a decision on half the data." },
      { lead: "They would reorder as they arrive", detail: "A view that reshuffles while it's being read is worse than one that waits." },
    ],
    decisions: [
      {
        q:
          "What holds the space before a piece arrives?",
        loka: "A grey outline at that piece's real size.",
        why: "Anything that changes size on arrival makes the reader lose their place, which is the whole thing this pattern exists to avoid.",
        shows: "skeletons",
      },
      {
        q:
          "How big is one piece?",
        loka: "The smallest thing somebody can act on by itself.",
        why: "A whole metric card, yes; one cell in a table, no. Any smaller and the page flickers; any bigger and you have rebuilt the spinner.",
        shows: "partial",
      },
      {
        q:
          "How long before a slow piece says something?",
        loka: "Around five seconds, in place, without blocking its neighbours.",
        why: "Each unit owns its own delay and its own failure.",
        shows: "slow",
      },
      {
        q:
          "Can people act on a finished piece before the rest arrive?",
        loka: "Yes, per unit.",
        why: "Gating export or drill-down on the whole view finishing spends the entire benefit of staging it.",
        shows: "partial",
      },
    ],
    controls: {
      interrupt: { grade: "recommended", note: "Stop the run without losing the units already in." },
      inspect: { grade: "recommended", note: "Which piece is waiting, and on what." },
      verify: { grade: "recommended", note: "Each unit carries its own source and freshness." },
      correct: { grade: "na", note: "Nothing to correct yet — this is how the answer arrives, not what it says." },
      undo: { grade: "na", note: "Nothing has been written anywhere, so there's nothing to reverse." },
    },
    surfaces: {
      voice: { verdict: "none", note: "Speech is one thing after another, so there are no pieces to land beside each other. Say the fast part, then offer the slow one." },
      canvas: { verdict: "holds", note: "A board whose parts finish at different times is this pattern. Placeholders at the true size matter more, because here the layout is the work." },
    },
    composedOf: ["Card", "Spinner", "Progress Bar", "Alert", "Empty State"],
    optionalParts: ["Spinner", "Progress Bar", "Alert", "Empty State"],
  },
  {
    id: "reasoning-transparency",
    name: "Visible Working",
    category: "latency",
    status: "planned",
    definition:
      "Showing the AI's working as it goes — what it's looking up, what it's doing next — so the wait proves something is happening.",
  },
  {
    id: "interruptible-generation",
    name: "Stop & Steer",
    category: "latency",
    status: "planned",
    definition:
      "Letting people stop, pause or redirect the AI mid-answer — and deciding what happens to the half-finished result.",
  },

  // ── Output & Legibility ────────────────────────────────────────────────────
  {
    id: "grounded-answer",
    name: "Sourced Answer",
    category: "output",
    status: "documented",
    definition:
      "An answer that shows which source each part came from, precisely enough that someone can actually check it.",
    states: [
      { id: "cited", label: "Sourced", note: "Markers sit on the claim, not on the answer. An answer-level source list proves sources were consulted, not that this sentence came from them.", by: "every claim has a source" },
      { id: "mixed", label: "Partly sourced", note: "Sentences with no source look different from sentences with one. Sourced and invented text blended into a single even paragraph is the most dangerous thing in AI UI.", by: "part of it has no source" },
      { id: "none", label: "Nothing found", note: "“Searched 12 documents, found nothing” is a useful, trustworthy answer. Falling back to general knowledge in the same style is not.", by: "the search finds nothing" },
      { id: "source", label: "Source open", note: "Opens at the cited passage with its date. A link to page one of a forty-page PDF is a citation nobody checks twice.", from: "cited", by: "you open a marker" },
      { id: "locked", label: "Restricted", note: "A source exists and this user can't open it. Hiding it makes a sourced answer look invented; showing what's in it leaks it.", from: "cited", by: "you open one you can't see" },
    ],
    useWhen: [
      { lead: "It's a factual claim", detail: "About the user's own data, or about the world." },
      { lead: "Being wrong is expensive", detail: "A confident error costs real money or real credibility." },
      { lead: "Someone is accountable", detail: "The user will answer to somebody else for acting on it." },
    ],
    avoidWhen: [
      { lead: "The AI is writing, not looking things up", detail: "A draft, a rewrite, a brainstorm. There's no source, and citation UI implies a factuality the task doesn't have." },
      { lead: "The source is already open", detail: "A marker pointing at the document already on screen is just clutter." },
    ],
    decisions: [
      {
        q: "Do sources attach to the whole answer, each paragraph, or each sentence?",
        loka: "To each sentence, attached to the specific claim.",
        why: "A source list at the bottom of the answer is decoration: it proves sources were read, not that this sentence came from them.",
        shows: "cited",
      },
      {
        q: "Small markers in the text, or a panel beside it?",
        loka: "Both, and linked.",
        why: "Markers for scanning, panel for reading. The marker must open the source at the cited passage — a link to page one of a forty-page PDF is a citation the user won't check twice.",
        shows: "source",
      },
      {
        q: "What happens to the uncited sentences?",
        loka: "Make them look different.",
        why: "Sourced and invented text blended into a single even paragraph is the most dangerous thing in AI UI, and it is what you get by doing nothing.",
        shows: "mixed",
      },
      {
        q: "Do you admit when the search found nothing?",
        loka: "Yes.",
        why: "“Searched 12 documents, found nothing on this” is a useful and trustworthy answer. Quietly answering from general knowledge instead, in the same styling as a sourced answer, is not.",
        shows: "none",
      },
      {
        q:
          "What happens when a citation doesn't support the claim?",
        loka: "Assume it will happen — it's the pattern's defining failure.",
        why: "Put one-click reporting on the citation itself, and never render an unresolvable citation as though it resolved.",
      },
    ],
    controls: {
      interrupt: { grade: "na", note: "The answer is already finished by the time it carries sources." },
      inspect: { grade: "required", note: "Which sources were searched, not only the ones quoted." },
      verify: { grade: "required", note: "The entire point of the pattern; one click to the passage." },
      correct: { grade: "recommended", note: "Dispute a citation without discarding the answer." },
      undo: { grade: "na", note: "Reading an answer changes nothing, so there's nothing to take back." },
    },
    surfaces: {
      voice: { verdict: "none", note: "Reading a source after every claim destroys the answer. Sources move to a follow-up question, or to a screen the voice hands off to." },
      canvas: { verdict: "changes", note: "The marker sits on the region that came from a source rather than after a clause, so checking it means looking at the thing instead of the sentence." },
    },
    composedOf: ["Link", "Popover", "Tooltip", "Tags", "Accordion", "Card"],
    optionalParts: ["Popover", "Tooltip", "Tags", "Accordion", "Card"],
  },
  {
    id: "confidence-hedging",
    name: "Confidence Levels",
    category: "output",
    status: "documented",
    definition:
      "Saying how sure the AI is, in a way that changes what the reader does next — without theatre, and without pretending to a precision you don't have.",
    states: [
      { id: "high", label: "Above the bar", note: "Shown plainly, action open. Confidence that changes nothing is decoration.", by: "the estimate lands in one band" },
      { id: "banded", label: "Shown as a range", note: "A labelled range rather than a decimal. Nobody does anything differently at 73.42% than at 71.08%.", by: "the estimate spans two bands" },
      { id: "low", label: "Below the bar", note: "Hedged, and the action gated behind a check. The interface changes, not just the label.", by: "the estimate spans all three" },
      { id: "unavailable", label: "No score", note: "Too little to go on, said out loud. A number you'd tell somebody to ignore shouldn't be on screen at all.", by: "too little to go on" },
    ],
    useWhen: [
      { lead: "A number drives a decision", detail: "Somebody acts differently at 60 than at 80." },
      { lead: "Some cases are much clearer than others", detail: "Some have plenty to go on and some genuinely don't." },
      { lead: "Being wrong is costly but recoverable", detail: "Worth hedging; not worth blocking." },
    ],
    avoidWhen: [
      { lead: "It changes nothing anyone does", detail: "If every level leads to the same next step, the number is decoration." },
      { lead: "You can't explain the number", detail: "An unexplainable score erodes more trust than no score does." },
    ],
    decisions: [
      {
        q:
          "A number, a range, or a word?",
        loka: "A labelled range — high, medium, low.",
        why: "Precision you don't have reads as precision you do, and a decimal place is a claim about accuracy nobody can stand behind.",
        shows: "banded",
      },
      {
        q:
          "Does confidence change the interface or only annotate it?",
        loka: "Change it.",
        why: "Low confidence gates the action behind a check; high confidence doesn't. A score that leaves the screen identical is a score nobody uses.",
        shows: "low",
      },
      {
        q:
          "What happens when it's too unsure to score at all?",
        loka: "No score, with the reason.",
        why: "Showing a number and telling people to disregard it spends trust for nothing.",
        shows: "unavailable",
      },
      {
        q:
          "Who sees the score?",
        loka: "Whoever carries the consequence.",
        why: "A score visible to a manager and hidden from the person acting on it is an accountability gap wearing a design decision.",
      },
    ],
    controls: {
      interrupt: { grade: "na", note: "The score is already there; there's no run to stop." },
      inspect: { grade: "required", note: "What the score is built from, in words the reader uses." },
      verify: { grade: "recommended", note: "Open the evidence behind a level." },
      correct: { grade: "recommended", note: "Flag a score as wrong, and have that go somewhere." },
      undo: { grade: "na", note: "Showing a score changes nothing that needs reversing." },
    },
    surfaces: {
      voice: { verdict: "changes", note: "The wording is the whole design — “probably”, “it looks like”, “can't tell”. Never a number: a spoken percentage sounds more exact than a printed one." },
      canvas: { verdict: "changes", note: "Per object rather than per answer, and drawn on it, so a shaky one reads as provisional instead of placed." },
    },
    composedOf: ["Tags", "Progress Bar", "Tooltip", "Alert", "Card"],
    optionalParts: ["Progress Bar", "Tooltip", "Alert", "Card"],
  },
  {
    id: "structured-output",
    name: "Structured Output",
    category: "output",
    status: "documented",
    definition:
      "Answers laid out as fields, rows or cards instead of paragraphs — for when the next thing someone does is check or copy a value, not read.",
    states: [
      { id: "extracted", label: "Extracted", note: "Every field carries its own confidence. One number for a whole document tells nobody which line to check.", by: "the document is read" },
      { id: "lowconf", label: "Needs checking", note: "The uncertain field is marked and reachable, not averaged into a document-level score.", by: "one field is uncertain" },
      { id: "missing", label: "Not found", note: "Empty and labelled. A plausible guess in an empty field is the worst thing this pattern can produce, because it's indistinguishable from a read.", by: "one field isn't there" },
      { id: "source", label: "Traced to source", note: "Click a value, see where on the page it came from. A value you can't trace is one you would have to re-type before you trusted it.", from: "extracted", by: "you open a value" },
      { id: "edited", label: "Corrected", note: "Human-set, marked, and never overwritten by a later run.", from: "extracted", by: "you correct a value" },
    ],
    useWhen: [
      { lead: "They are about to copy or compare", detail: "Somebody is about to copy these values into something else." },
      { lead: "You know the fields already", detail: "You know the fields before you know the answers." },
      { lead: "Some values matter more than others", detail: "A wrong total and a wrong date are not the same mistake." },
    ],
    avoidWhen: [
      { lead: "The answer is genuinely a narrative", detail: "Forcing a paragraph into fields loses the part that mattered." },
      { lead: "The fields change with every document", detail: "A form that rebuilds itself every time is harder to check than a paragraph would be." },
    ],
    decisions: [
      {
        q:
          "Does confidence sit on the document or on each field?",
        loka: "Each field.",
        why: "One score for a whole document tells nobody which line to look at — it says something is wrong somewhere and leaves the reader to hunt for it, which is the work they came here to avoid.",
        shows: "extracted",
      },
      {
        q:
          "What does a value the model couldn't find look like?",
        loka: "Empty, and labelled “not found”.",
        why: "Never a plausible guess: an inferred value in a field that looks read is the one failure nobody catches.",
        shows: "missing",
      },
      {
        q:
          "Can a field be traced back to the document?",
        loka: "Yes — click the value, see the region it came from.",
        why: "A value you can't trace is one you would have to re-type before you trusted it.",
        shows: "source",
      },
      {
        q:
          "What happens to a value a person corrected?",
        loka: "It's marked human-set and survives the next run untouched.",
        why: "Losing a correction to a re-extraction is how you teach people to stop correcting.",
        shows: "edited",
      },
    ],
    controls: {
      interrupt: { grade: "na", note: "The fields are already filled by the time you read them." },
      inspect: { grade: "required", note: "How sure it is about each field, and which run produced the value." },
      verify: { grade: "required", note: "Every field opens the place in the source it came from." },
      correct: { grade: "required", note: "Edit in place, and the edit sticks." },
      undo: { grade: "recommended", note: "Revert a field to the extracted value." },
    },
    surfaces: {
      voice: { verdict: "none", note: "Fields and rows are a layout. Read out they are a list nobody can hold, so say the value that was asked for and put the rest on a screen." },
      canvas: { verdict: "changes", note: "Fields on the object's own panel, each one tracing back to the part of the source it was read from." },
    },
    composedOf: ["Input Field", "Tags", "Tooltip", "Card", "Button"],
    optionalParts: ["Tooltip", "Card", "Button"],
  },
  {
    id: "inline-suggestion",
    name: "Inline Suggestion",
    category: "output",
    status: "documented",
    definition:
      "A greyed-out suggestion inside someone's own writing: one key accepts it, and ignoring it makes it go away.",
    states: [
      { id: "typing", label: "Typing", note: "Nothing offered yet. A suggestion on the first character is a guess about an intent nobody has formed.", by: "you start writing" },
      { id: "unavailable", label: "Nothing to suggest", note: "Absence is a correct state. Padding with a low-confidence guess to look responsive is how the good suggestions get ignored too.", by: "nothing clears the bar" },
      { id: "offered", label: "Suggestion offered", note: "Visibly not theirs. If a writer can't see where their sentence ends and the model's begins, they'll ship yours without deciding to.", from: "typing", by: "you pause mid-sentence" },
      { id: "accepted", label: "Accepted", note: "One keystroke and it becomes their text — plain, no residue, no badge.", from: "offered", by: "you press Tab" },
      { id: "dismissed", label: "Dismissed", note: "Rejection is silence. Keep typing and it's gone: no dialog, nothing to undo.", from: "offered", by: "you keep typing" },
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
        loka: "Visibly lighter, never the same weight, and never the same colour.",
        why: "This is the whole pattern — get it wrong and people publish words they never read.",
        shows: "offered",
      },
      {
        q:
          "What accepts it?",
        loka: "Tab, and only Tab.",
        why: "Enter belongs to the form; binding both means accepting by accident on every submit.",
        shows: "offered",
      },
      {
        q:
          "When do you offer nothing at all?",
        loka: "When the AI isn't sure enough, and at the very start of a field.",
        why: "A suggestion that is usually wrong teaches people to type straight through it, and then the good ones get missed too.",
        shows: "unavailable",
      },
      {
        q:
          "Does a suggestion survive the next keystroke?",
        loka: "No.",
        why: "Anything that isn't accept clears it. A stale suggestion sitting beside changed text is a wrong suggestion that still looks live.",
        shows: "dismissed",
      },
    ],
    controls: {
      interrupt: { grade: "na", note: "Ignoring it is the stop — keep typing and it's gone." },
      inspect: { grade: "recommended", note: "Say where the suggestion came from when it isn't obvious." },
      verify: { grade: "na", note: "A few predicted words have no source to check them against." },
      correct: { grade: "required", note: "Accepted text is ordinary text — editable immediately, with no special state." },
      undo: { grade: "required", note: "One undo returns to exactly what they had typed, not to an intermediate." },
    },
    surfaces: {
      voice: { verdict: "changes", note: "No grey words to ignore, so every suggestion has to be listened to. Offer far fewer, and make yes the short answer." },
      canvas: { verdict: "changes", note: "A faint object rather than faint words, and carrying on drawing is what dismisses it." },
    },
    composedOf: ["Input Field", "Tooltip", "Tags", "Button"],
    optionalParts: ["Tooltip", "Tags", "Button"],
  },

  // ── Control & Correction ───────────────────────────────────────────────────
  {
    id: "diff-review",
    name: "Change Review",
    category: "control",
    status: "documented",
    definition:
      "Showing what the AI wants to change beside what's there now, so a person can accept or reject each change.",
    states: [
      { id: "proposed", label: "Proposed", note: "Nothing applied and nothing pre-selected. Accept-all exists but is never the default.", by: "the changes are ready" },
      { id: "empty", label: "Nothing to change", note: "A success, and it should look like one. “Nothing to change” shown as an empty screen reads as a broken feature.", by: "the check comes back clean" },
      { id: "partial", label: "Partly accepted", note: "One block of changes at a time. Line by line is a precision nobody uses, and all-or-nothing is a bet on the weakest change in the set.", from: "proposed", by: "you decide them one at a time" },
      { id: "stale", label: "Stale", note: "The file moved under the proposal. Re-propose — applying a stale diff silently corrupts work in progress.", from: "proposed", by: "the original changes underneath" },
      { id: "applied", label: "Applied", note: "What landed, in the user's terms, with a stated window to take it back out.", from: "partial", by: "you press Apply" },
    ],
    useWhen: [
      { lead: "They already own it", detail: "Code, a document, a setting, a record they've put work into." },
      { lead: "It breaks into separate changes", detail: "It splits into pieces a person can judge one at a time." },
      { lead: "Finding out later is expensive", detail: "Cheap to reject now, expensive to find out about later." },
    ],
    avoidWhen: [
      { lead: "It's a single value", detail: "A side-by-side review is more process than the change is worth." },
      { lead: "There's nothing to compare against", detail: "The thing is being created from scratch, not edited." },
      { lead: "There's too much to review properly", detail: "Past a certain size the review is theatre. Gate the operation instead." },
    ],
    decisions: [
      {
        q: "What can somebody accept at once — everything, one file, one block, one line?",
        loka: "One block at a time, with accept-all available but never chosen for them.",
        why: "Line by line is a precision nobody uses; all-or-nothing turns a review into a bet on the weakest change in the set.",
        shows: "partial",
      },
      {
        q: "Inline or side-by-side?",
        loka: "Side-by-side for structural rewrites, inline for small edits in long context.",
        why: "Choose per change size, not once per product.",
      },
      {
        q: "Is the proposal editable before accepting?",
        loka: "Yes.",
        why: "Forcing reject-and-reprompt to fix a near-miss is the most expensive interaction in the pattern, and near-misses are the common case.",
        shows: "proposed",
      },
      {
        q: "Does anything apply automatically?",
        loka: "No.",
        why: "Auto-apply plus undo is not equivalent to review plus apply — the user has to notice a change before they can undo it, and the changes they don't notice are precisely the ones that hurt.",
        shows: "proposed",
      },
      {
        q:
          "What if the file changed while the proposal was open?",
        loka: "Detect it and re-propose.",
        why: "Applying a stale diff silently overwrites work somebody else was in the middle of, and nobody finds out until later.",
        shows: "stale",
      },
    ],
    controls: {
      interrupt: { grade: "required", note: "Abandon a review without applying anything." },
      inspect: { grade: "required", note: "Before and after, plus why this change was proposed." },
      verify: { grade: "required", note: "Full surrounding context, not just the changed lines." },
      correct: { grade: "required", note: "Edit the proposal in place." },
      undo: { grade: "required", note: "One action puts everything back, rather than a dig through it block by block." },
    },
    surfaces: {
      voice: { verdict: "none", note: "A before and after is something you scan. Past one change it can't be followed out loud, so the review needs a screen — voice can only approve the summary." },
      canvas: { verdict: "changes", note: "Before and after as the object itself, toggled or side by side, and accept stays per object rather than per batch." },
    },
    composedOf: ["Card", "Button", "Checkbox", "Tabs", "Alert", "Banner"],
    optionalParts: ["Checkbox", "Tabs", "Alert", "Banner"],
  },
  {
    id: "regenerate-variants",
    name: "Retry & Compare",
    category: "control",
    status: "planned",
    definition:
      "Asking for another answer, or a few side by side, without losing the one already on screen.",
  },
  {
    id: "refine-in-place",
    name: "Edit in Place",
    category: "control",
    status: "planned",
    definition:
      "Changing a result by pointing at the part you mean and saying what to do, instead of rewriting the whole request.",
  },
  {
    id: "version-history",
    name: "Undo & History",
    category: "control",
    status: "documented",
    definition:
      "A readable list of what the AI changed, when, and on what basis — and a way back to any point on it.",
    states: [
      { id: "trail", label: "Change trail", note: "AI changes are named and so are people's. Telling the two apart at a glance is the whole value of a history.", by: "you open the history" },
      { id: "diff", label: "One change", note: "What one AI run changed, described in the record's own words rather than as raw data.", from: "trail", by: "you open one change" },
      { id: "restore", label: "Restoring", note: "Restoring writes a new entry rather than erasing. History that can be rewritten isn't history.", from: "trail", by: "you pick an earlier point" },
      { id: "attributed", label: "Why it changed", note: "Which run it was, what it could see, and what set it off. A change with no context tells you what happened and nothing about why.", from: "diff", by: "you ask what it could see" },
    ],
    useWhen: [
      { lead: "The AI changes something that lasts", detail: "A record, a document, a setting people rely on." },
      { lead: "Changes accumulate", detail: "The tenth edit is the one nobody noticed." },
      { lead: "Somebody will ask who changed this", detail: "And “the system” is not an answer." },
    ],
    avoidWhen: [
      { lead: "The output is disposable", detail: "A draft nobody keeps needs no trail." },
      { lead: "The trail would outweigh the work", detail: "Recording every keystroke buries the changes that actually matter." },
    ],
    decisions: [
      {
        q:
          "Are AI changes marked differently from people's?",
        loka: "Always, and named after what ran rather than just “System”.",
        why: "A history that treats them the same is a log, not a history.",
        shows: "trail",
      },
      {
        q:
          "How far back does it go?",
        loka: "State the window and mean it.",
        why: "An “unlimited” history that silently truncates is worse than an honest thirty days.",
      },
      {
        q:
          "Does restoring erase what came after?",
        loka: "No — it appends.",
        why: "The restore is itself a change somebody may have to account for, and a history you can rewrite can't be used as evidence.",
        shows: "restore",
      },
      {
        q:
          "What's recorded beside the change?",
        loka: "Which run it was, what it could see, and what set it off.",
        why: "Without those, a reader can see what happened and still not know whether it should have.",
        shows: "attributed",
      },
    ],
    controls: {
      interrupt: { grade: "na", note: "Reading the history doesn't run anything." },
      inspect: { grade: "required", note: "What changed, which run did it, and on what basis." },
      verify: { grade: "required", note: "Compare any point against the current state." },
      correct: { grade: "recommended", note: "Restore a single field rather than the whole record." },
      undo: { grade: "required", note: "Return to any point, as a new entry." },
    },
    surfaces: {
      voice: { verdict: "changes", note: "“Undo that” reaches the last change and no further; anything older needs a screen. What has to stay sayable is who made each change." },
      canvas: { verdict: "holds", note: "Canvases already keep every version, and all four answers apply — including the one that says an automatic change is named rather than logged as “System”." },
    },
    composedOf: ["List Item", "Avatar", "Tags", "Button", "Accordion"],
    optionalParts: ["Avatar", "Tags", "Accordion"],
  },

  // ── Agentic & Multi-step ───────────────────────────────────────────────────
  {
    id: "approval-gate",
    name: "Approval Gate",
    category: "agentic",
    status: "documented",
    definition:
      "A deliberate stop before the AI does something that reaches the real world, so a person says yes to it first.",
    states: [
      { id: "await", label: "Awaiting approval", note: "What will happen, in the reader's own words, naming exactly what it happens to. If the button reads like the name of the code, they're approving something they haven't understood.", by: "it needs a yes before it acts" },
      { id: "modified", label: "Modified", note: "Change one detail, then approve. Approve-or-reject alone forces a full restart to fix one field — which is what trains people not to read.", by: "you change a detail first" },
      { id: "executing", label: "Running", note: "Step-level progress, because step-level failure is possible.", from: "await", by: "you approve" },
      { id: "done", label: "Done", note: "A receipt of what actually happened, not a toast that it was submitted.", from: "executing", by: "every step finishes" },
      { id: "failed", label: "Failed midway", note: "What did and didn't happen, per step. “Something went wrong” after somebody approved a multi-step action is the worst message the product can produce.", from: "executing", by: "a step fails partway" },
    ],
    useWhen: [
      { lead: "It reaches outside the screen", detail: "It writes to a system people rely on, spends money, contacts someone outside, or can't be undone." },
      { lead: "It's right 95% of the time", detail: "Which is exactly the number that makes letting it run unwatched unacceptable." },
      { lead: "Someone else carries the cost", detail: "The consequence lands on a person who isn't in the room." },
    ],
    avoidWhen: [
      { lead: "It would appear constantly", detail: "A stop that appears dozens of times a session gets clicked through without being read, which turns approval into a formality." },
      { lead: "One broad yes genuinely covers it", detail: "Then ask once, explicitly, instead of asking always." },
    ],
    decisions: [
      {
        q: "What exactly is being approved?",
        loka: "The concrete effect, in the user's words, with the target named.",
        why: "“Pay 4 bills, £740 in total”, never “Run batch_transfer”. If the wording is the name of the code, the user is approving something they haven't understood.",
        shows: "await",
      },
      {
        q: "Ask every time, once per session, or once for a whole area?",
        loka: "Every time, by default.",
        why: "Offer to widen it — “allow reads here for this session” — as something the person chooses out loud, never as something the system decided to remember for them.",
      },
      {
        q: "Can the user modify before approving?",
        loka: "Yes, wherever the parameters are legible.",
        why: "Approve-or-reject alone forces a full restart to change one field, and that friction is what trains people to approve without reading.",
        shows: "modified",
      },
      {
        q: "What does a timeout do?",
        loka: "Nothing.",
        why: "An unanswered gate expires unexecuted. Executing on timeout converts inattention into authorisation, which is the one thing a gate exists to prevent.",
      },
      {
        q:
          "How do you report a failure that happens after approval?",
        loka: "Step by step: what did and didn't happen, in numbers.",
        why: "“Something went wrong” after somebody approved a multi-step action is the worst message the product can produce.",
        shows: "failed",
      },
    ],
    controls: {
      interrupt: { grade: "required", note: "Reject, and abort the whole run, not just this step." },
      inspect: { grade: "required", note: "The exact details, and which step of the plan this came from." },
      verify: { grade: "required", note: "Enough of what it's about to change to judge the effect." },
      correct: { grade: "recommended", note: "Modify parameters, then approve." },
      undo: { grade: "required", note: "Where the action permits it — and say plainly when it doesn't." },
    },
    surfaces: {
      voice: { verdict: "holds", note: "All five answers carry over and matter more: there is nothing to re-read, so the effect has to be one sentence somebody can hold to the end." },
      canvas: { verdict: "holds", note: "Unchanged. The effect still says what will happen in the user's words, and nothing reaches outside the file until somebody says yes." },
    },
    composedOf: ["Dialog", "Modal", "Button", "Alert", "Tags", "List Item"],
    optionalParts: ["Modal", "Alert", "Tags", "List Item"],
  },
  {
    id: "plan-preview",
    name: "Plan Preview",
    category: "agentic",
    status: "documented",
    definition:
      "The steps the AI intends to take, shown and editable while changing them is still cheap.",
    states: [
      { id: "proposed", label: "Plan proposed", note: "Every step visible and removable. Nothing has run.", by: "it drafts a plan" },
      { id: "edited", label: "Step removed", note: "Cut a step and the plan re-costs itself. Editing beats rejecting and starting again.", by: "you remove a step" },
      { id: "running", label: "Running", note: "Step-level progress, because step-level failure is what happens.", from: "proposed", by: "you press Run" },
      { id: "paused", label: "Paused", note: "Stopped at a boundary, with what's done and what's left both stated.", from: "proposed", by: "you press Pause mid-run" },
      { id: "done", label: "Complete", note: "A receipt of what actually ran, not a toast saying it was submitted.", from: "running", by: "every step finishes" },
    ],
    useWhen: [
      { lead: "The work is genuinely multi-step", detail: "The outcome hides the steps that produce it." },
      { lead: "Steps carry different risk", detail: "One of them is the one that matters." },
      { lead: "Fixing beforehand is cheaper", detail: "Editing a plan beats undoing an execution." },
    ],
    avoidWhen: [
      { lead: "The plan is one step", detail: "Then it's an Approval Gate, and a list of one is just decoration." },
      { lead: "The steps can't be read", detail: "A plan nobody can read is a progress bar with extra steps." },
    ],
    decisions: [
      {
        q:
          "Can the plan be edited, or only accepted or rejected?",
        loka: "Editable per step.",
        why: "Approve-or-reject on a six-step plan forces a restart to remove one step, and that friction is exactly why people approve steps they'd have cut.",
        shows: "edited",
      },
      {
        q:
          "What counts as a step?",
        loka: "The level at which somebody would say no.",
        why: "“Send 1,240 emails” is a step; “open connection” is noise, and noise is what stops a plan being read at all.",
        shows: "proposed",
      },
      {
        q:
          "Can it pause mid-run?",
        loka: "Yes, at step boundaries, stating what's done and what's left.",
        why: "A run you can only kill is a run people won't start.",
        shows: "paused",
      },
      {
        q:
          "Does a failed run resume or restart?",
        loka: "Resume.",
        why: "Completed steps stay completed — re-running them is how a retry turns into a duplicate send.",
      },
    ],
    controls: {
      interrupt: { grade: "required", note: "Pause at a boundary, and abandon before anything runs." },
      inspect: { grade: "required", note: "Every step's real details, not just its label." },
      verify: { grade: "required", note: "What each step will touch, before it touches it." },
      correct: { grade: "required", note: "Remove or edit a step and re-run the plan." },
      undo: { grade: "recommended", note: "Undo the steps that can be undone, and say plainly which can't." },
    },
    surfaces: {
      voice: { verdict: "changes", note: "Four steps can't be shown and edited at once. Say how many there are, name only the ones that can't be undone, then ask." },
      canvas: { verdict: "holds", note: "A plan drawn as steps you can cut before running is native here — the pattern with the least translating to do." },
    },
    composedOf: ["List Item", "Checkbox", "Button", "Progress Bar", "Modal"],
    optionalParts: ["Checkbox", "Progress Bar", "Modal"],
  },
  {
    id: "tool-call-trace",
    name: "Action Log",
    category: "agentic",
    status: "planned",
    definition:
      "A plain record of everything the AI did on someone's behalf — folded away by default, complete when asked for.",
  },
  {
    id: "background-handoff",
    name: "Background Work",
    category: "agentic",
    status: "planned",
    definition:
      "Work that carries on after someone closes the tab: leaving, being told it's done, and coming back to something that still makes sense.",
  },

  // ── Boundaries & Failure ───────────────────────────────────────────────────
  {
    id: "graceful-refusal",
    name: "Clear Refusal",
    category: "boundaries",
    status: "documented",
    definition:
      "How the product says “I can't do this” — a normal outcome of a working system, not a bug.",
    states: [
      { id: "policy", label: "A rule says no", note: "Your product's voice, not the model's — and no red. A policy limit is the system working as intended.", by: "the payee was added today" },
      { id: "capability", label: "It can't do this yet", note: "Specific enough to change the next move. “I can't help with that” just produces a retry of the same request.", by: "the connection isn't there" },
      { id: "noanswer", label: "No confident answer", note: "Low confidence is an outcome, not an error. Saying so beats a guess styled as fact.", by: "the sources disagree" },
      { id: "partial", label: "Stopped partway", note: "Keep and label what was finished. Discarding completed work silently reads as a crash.", by: "a rule blocks part of it" },
    ],
    useWhen: [
      { lead: "Always", detail: "Every AI feature refuses something. The only question is whether you wrote those words or inherited whatever the model happened to say." },
    ],
    avoidWhen: [
      { lead: "It's really a missing feature", detail: "Dressing something you haven't built yet as a rule teaches people the limit is permanent, so they stop asking for it." },
    ],
    decisions: [
      {
        q: "Where does the refusal copy come from?",
        loka: "Your product, not the model.",
        why: "Refusals written by the model wander in tone, are often wrong about the real reason, and sometimes apologise for things your product does perfectly well.",
        shows: "policy",
      },
      {
        q: "How much reason to give?",
        loka: "Enough to change the next move.",
        why: "“Your credit card isn't connected” is actionable; “Sorry, I can't help with that” produces a reflexive retry of the identical request and a second identical refusal.",
        shows: "capability",
      },
      {
        q: "Does it look like an error?",
        loka: "No.",
        why: "No red, no warning icons for rules and limits — those are the system working as intended. Save the error styling for things that genuinely broke, or you spend it and have nothing left when something really does.",
        shows: "noanswer",
      },
      {
        q: "Is there a path forward?",
        loka: "Always.",
        why: "Offer the nearest thing you can do, one click away. A refusal that dead-ends is the moment a user decides the feature doesn't work.",
        shows: "capability",
      },
      {
        q:
          "What happens when you refuse something legitimate?",
        loka: "Assume over-refusal happens and give a low-friction way to report it.",
        why: "A rising over-refusal rate is a product metric, not a support queue.",
        shows: "policy",
      },
    ],
    controls: {
      interrupt: { grade: "na", note: "A refusal is the end of the run, not the middle of one." },
      inspect: { grade: "recommended", note: "Which kind of limit it is — a rule, a missing ability, a permission, or missing data." },
      verify: { grade: "na", note: "There's no answer here to check against a source." },
      correct: { grade: "recommended", note: "Reframe the request without retyping it." },
      undo: { grade: "na", note: "Nothing happened, so there's nothing to take back." },
    },
    surfaces: {
      voice: { verdict: "holds", note: "The strongest carry-over in the library. Your words not the model's, a reason that changes the next move, no alarm, and a way on — all unchanged." },
      canvas: { verdict: "holds", note: "Unchanged, except that the refusal has somewhere to sit: on the object or region it is about, rather than in a message of its own." },
    },
    composedOf: ["Empty State", "Banner", "Link", "Button", "Alert"],
    optionalParts: ["Banner", "Link", "Alert"],
  },
  {
    id: "no-answer-fallback",
    name: "No Good Match",
    category: "boundaries",
    status: "documented",
    definition:
      "What to show when nothing is a good enough match — and why that beats a guess dressed up as an answer.",
    states: [
      { id: "confident", label: "Confident results", note: "The ordinary case, here for contrast: matches above the bar, shown plainly with their scores.", by: "results clear the bar" },
      { id: "none", label: "Nothing above the bar", note: "An empty result is a real answer. Say what was searched and where the bar sat.", by: "the best match is 31%" },
      { id: "insufficient", label: "Not enough data", note: "“No data yet” is not “no match”. One means come back later, the other means change what you asked for — and mixing them up wastes somebody's next hour.", by: "too little data to rank" },
      { id: "weak", label: "Below the bar", note: "Weak matches shown as weak, behind a deliberate action, never mixed into the same list as strong ones.", from: "none", by: "you open the near misses" },
    ],
    useWhen: [
      { lead: "Anywhere you rank or match", detail: "Anything that ranks or matches has a case where nothing qualifies, whether or not anyone designed for it." },
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
        loka: "What was searched, where the bar was, and what to change.",
        why: "“No results” with no numbers is indistinguishable from a broken query, and gets reported as one.",
        shows: "none",
      },
      {
        q:
          "Do you show what fell below the bar?",
        loka: "Behind an explicit action, labelled as below it.",
        why: "Never merged into the same list — that merge is the failure this pattern is named after.",
        shows: "weak",
      },
      {
        q:
          "Is “no data yet” the same as “no match”?",
        loka: "No, and treating them as one is the most common version of this mistake.",
        why: "Too little data means wait; no match means change what you asked for.",
        shows: "insufficient",
      },
      {
        q:
          "Who gets to lower the bar?",
        loka: "Say where the bar is, and let the user loosen it deliberately.",
        why: "Never move it silently to fill the page.",
      },
    ],
    controls: {
      interrupt: { grade: "na", note: "The search has already finished by the time you see this." },
      inspect: { grade: "required", note: "What was searched, how many things it looked at, and where the bar sat." },
      verify: { grade: "recommended", note: "Open any near miss and judge it yourself." },
      correct: { grade: "required", note: "Broaden the search without starting it over." },
      undo: { grade: "na", note: "Nothing was applied, so there's nothing to reverse." },
    },
    surfaces: {
      voice: { verdict: "changes", note: "No list to rank, so nothing gets promoted by being read first. Say nothing cleared the bar and offer one nearest thing, never three." },
      canvas: { verdict: "changes", note: "Nothing to place, so the space stays empty and says why. The emptiness is the answer rather than a list of weak ones." },
    },
    composedOf: ["Empty State", "List Item", "Filter", "Banner", "Button"],
    optionalParts: ["List Item", "Filter", "Banner"],
  },
  {
    id: "error-retry",
    name: "Error & Retry",
    category: "boundaries",
    status: "planned",
    definition:
      "Real breakages — too slow, too busy, offline — explained in plain words, with a retry that suits the cause.",
  },
  {
    id: "capability-disclosure",
    name: "Known Limits",
    category: "boundaries",
    status: "planned",
    definition:
      "Saying what the AI can do, what data it can see and how current that data is — before someone hits the limit.",
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
