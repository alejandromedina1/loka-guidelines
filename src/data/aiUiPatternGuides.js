// What a designer needs to build each AI UI pattern, beyond whether to use it.
//
// aiUiPatterns.js is a port of reference/ai-ui-patterns.html and stays the
// source's own; this file is ours, keyed by the same ids. Each entry answers the
// four questions somebody has after watching the demo and deciding it fits:
//
//   what      — the pattern in one plain sentence, written to land cold. It is
//               the page's description, so it can't lean on the name.
//   anatomy   — the parts to draw, in the order the eye meets them. Every part
//               named here is a part the demo draws, so the list and the stage
//               can be read against each other.
//   states    — the frames to design beyond the happy one. AI output is slow,
//               partial and sometimes wrong, so this is where the work hides.
//   dos/donts — concrete enough to settle a design review.
//   a11y      — the one accessibility call this pattern is most likely to miss.
//   seenIn    — products that ship it, so there is something real to study.
//               Optional: left out where there isn't a clear, well-known one.
//
// House voice (src/components/ai/CLAUDE.md): plain words, no jargon, no
// first-person product voice, British spelling.

export const AI_UI_GUIDES = {
  stream: {
    what: "The answer appears word by word as it is written, so people can start reading straight away instead of watching a spinner.",
    anatomy: [
      { name: "Request", note: "What was asked, kept above the answer." },
      { name: "Answer as it arrives", note: "Text growing in place, in the AI tint." },
      { name: "Writing marker", note: "A caret or pulse that says it isn't finished." },
      { name: "Stop", note: "Visible for as long as it's writing." },
      { name: "Finished actions", note: "Copy, Regenerate. They replace Stop at the end." },
    ],
    states: [
      { name: "Waiting for the first word", note: "Under a second: a pulse. Longer: say what it's doing." },
      { name: "Writing", note: "Text grows, Stop is available." },
      { name: "Done", note: "Copy and Regenerate replace Stop." },
      { name: "Stopped", note: "Keep what was written and say it was cut short." },
      { name: "Connection lost", note: "Keep the partial answer and offer to continue." },
    ],
    dos: [
      "Hold the scroll position if the reader has scrolled up to read.",
      "Reserve the actions row so it doesn't jump in at the end.",
    ],
    donts: [
      "Stream data that has to be checked as a whole, like a table or a form.",
      "Animate each word in. The arrival is the motion.",
    ],
    a11y: "Announce the finished answer once. Don't put a live region on text that is still growing, or a screen reader reads every word as it lands.",
    seenIn: ["ChatGPT", "Claude", "Gemini"],
  },
  starters: {
    what: "A few ready-made requests on an empty input that show what the AI can do and give people a first thing to try.",
    anatomy: [
      { name: "Invitation", note: "A short question, not a persona's greeting." },
      { name: "Starter chips", note: "Three or four, each a real task." },
      { name: "Input", note: "Still there, for people who know what they want." },
    ],
    states: [
      { name: "Empty", note: "Starters showing, input empty." },
      { name: "Starter picked", note: "It fills the input for editing rather than sending at once." },
      { name: "Typing", note: "Starters step back once somebody types." },
    ],
    dos: [
      "Write starters from what people actually ask, and refresh them.",
      "Make them specific to the page somebody is on when you can.",
    ],
    donts: [
      "Offer starters the AI handles badly. The first try sets the expectation.",
      "Send on click when the request needs details only the person has.",
    ],
    a11y: "Starters are buttons in a labelled group, and picking one moves focus to the input with the text in it.",
    seenIn: ["ChatGPT", "Microsoft Copilot", "Notion AI"],
  },
  ghost: {
    what: "While somebody types, the likely next words appear in faded text after the cursor, and one key accepts them.",
    anatomy: [
      { name: "Typed text", note: "The person's own words, unchanged." },
      { name: "Suggestion", note: "Faded and in the AI colour, after the cursor." },
      { name: "Accept hint", note: "The key to press, shown the first few times." },
    ],
    states: [
      { name: "Typing", note: "No suggestion until there is enough to go on." },
      { name: "Suggesting", note: "Faded text after the cursor." },
      { name: "Accepted", note: "Becomes ordinary text, briefly tinted." },
      { name: "Ignored", note: "Keep typing and it disappears. No dismiss button." },
    ],
    dos: [
      "Keep suggestions to the end of the current sentence.",
      "Let a partial accept take one word at a time.",
    ],
    donts: [
      "Use Tab where Tab already moves focus, without a way to turn it off.",
      "Show a suggestion that pushes the person's own text around.",
    ],
    a11y: "Faded text is invisible to screen readers. Expose the suggestion in words and say which key accepts it.",
    seenIn: ["Gmail Smart Compose", "GitHub Copilot"],
  },
  selbar: {
    what: "Selecting part of the content brings up a small bar of AI actions that work on just that part.",
    anatomy: [
      { name: "Selection", note: "The person's highlight, unchanged." },
      { name: "Action bar", note: "Three to five verbs, beside the selection." },
      { name: "Result in place", note: "The rewritten text, tinted until accepted." },
    ],
    states: [
      { name: "Selected", note: "The bar appears after a short pause, not on every drag." },
      { name: "Working", note: "The selection holds still while it rewrites." },
      { name: "Rewritten", note: "Tinted, with Keep and Undo." },
      { name: "Too short or too long", note: "Say why an action isn't available." },
    ],
    dos: [
      "Put the most-used action first and keep the order fixed.",
      "Offer a free-text option for anything the verbs don't cover.",
    ],
    donts: [
      "Cover the selected text with the bar.",
      "Replace the text with no way back.",
    ],
    a11y: "Selecting by keyboard has to bring up the bar too, and the bar must be reachable without the mouse.",
    seenIn: ["Notion AI", "Grammarly"],
  },
  variants: {
    what: "The AI offers several takes side by side, and people pick the one that suits them instead of rewriting one draft.",
    anatomy: [
      { name: "Prompt or context", note: "What the options are for." },
      { name: "Options", note: "Two to four, equal weight, no ranking." },
      { name: "Selected mark", note: "Outline and a check, not colour alone." },
    ],
    states: [
      { name: "Generating", note: "Placeholders for each option, filled as they arrive." },
      { name: "Choosing", note: "All options equal." },
      { name: "Chosen", note: "One marked, the others still in reach." },
      { name: "None fit", note: "A way to ask for more or edit one." },
    ],
    dos: [
      "Make options differ in a way people can name (shorter, warmer, bolder).",
      "Keep the unchosen ones until the person moves on.",
    ],
    donts: [
      "Offer more than four. Choosing becomes the work.",
      "Show near-identical options. It makes the choice feel fake.",
    ],
    a11y: "Options are a radio group: one tab stop, arrow keys to move, and the chosen one announced.",
    seenIn: ["Midjourney", "Adobe Firefly"],
  },
  tldr: {
    what: "A short AI summary sits at the top of long content, so people can decide whether to read the whole thing.",
    anatomy: [
      { name: "Summary header", note: "Labelled as a summary, with Show/Hide." },
      { name: "Key points", note: "Three to five lines, in the AI tint." },
      { name: "Original content", note: "Untouched below it." },
    ],
    states: [
      { name: "Summarising", note: "Points arrive one at a time." },
      { name: "Open", note: "Points visible." },
      { name: "Collapsed", note: "Header only, remembered per person." },
      { name: "Too short to summarise", note: "Hide the card rather than restate the text." },
    ],
    dos: [
      "Link each point to the part of the original it came from.",
      "Lead with decisions and changes, not background.",
    ],
    donts: [
      "Summarise content where every detail matters, like contracts or dosages.",
      "Present the summary as if it were the original.",
    ],
    a11y: "The header is a real button with an expanded state, and the summary comes before the content in reading order.",
    seenIn: ["Slack AI recaps", "Gmail summary cards", "Zoom AI Companion"],
  },
  tags: {
    what: "The AI suggests labels for an item, shown as dashed chips that people confirm or remove before they count.",
    anatomy: [
      { name: "Item", note: "The thing being labelled." },
      { name: "Suggested tag", note: "Dashed, tinted, with accept and remove." },
      { name: "Confirmed tag", note: "Solid, the same as one a person added." },
      { name: "Suggested label", note: "A word saying these came from the AI." },
    ],
    states: [
      { name: "Suggested", note: "Dashed and tinted." },
      { name: "Accepted", note: "Turns solid." },
      { name: "Removed", note: "Gone, and not suggested again for this item." },
      { name: "No good guess", note: "No chips. Don't fill the space with weak ones." },
    ],
    dos: [
      "Make a suggested tag look different from a confirmed one in shape, not just colour.",
      "Learn from removals so the same wrong tag doesn't come back.",
    ],
    donts: [
      "Route or filter on a tag nobody confirmed when a wrong one is costly.",
      "Suggest from a list people can't see or edit.",
    ],
    a11y: "Each chip's buttons say which tag they act on (\"Accept Billing\"), not just a tick or a cross.",
    seenIn: ["Linear", "Zendesk"],
  },
  autofill: {
    what: "The AI reads a document or photo and fills in a form from it, marking every field it filled so people check before saving.",
    anatomy: [
      { name: "Source", note: "The receipt or document, kept in view." },
      { name: "Filled field", note: "Tinted until the person edits or confirms it." },
      { name: "Check note", note: "One line asking for a look before saving." },
    ],
    states: [
      { name: "Reading", note: "Fields fill one at a time." },
      { name: "Filled", note: "Tinted, all editable." },
      { name: "Couldn't read", note: "Leave the field empty and say why." },
      { name: "Edited", note: "Tint clears on the field that was changed." },
    ],
    dos: [
      "Show the source beside the form so checking is a glance.",
      "Leave a field empty rather than guess.",
    ],
    donts: [
      "Save automatically.",
      "Use this for two or three fields. Typing is faster than checking.",
    ],
    a11y: "Each filled field says so in its label or description, not only through the tint.",
    seenIn: ["Expensify SmartScan"],
  },
  answer: {
    what: "Above the search results, a short direct answer drawn from your own content, with the results still underneath.",
    anatomy: [
      { name: "Query", note: "As typed." },
      { name: "Answer", note: "One or two sentences, the key fact in bold." },
      { name: "Source line", note: "Where the answer came from." },
      { name: "Results", note: "Still listed, so the answer is a shortcut, not a wall." },
    ],
    states: [
      { name: "Searching", note: "Results can appear before the answer." },
      { name: "Answered", note: "Answer above, results below." },
      { name: "No confident answer", note: "Show results only. No apology box." },
    ],
    dos: [
      "Keep the answer short enough that the results stay above the fold.",
      "Name the source document, not just \"our docs\".",
    ],
    donts: [
      "Answer navigational searches, where people want a page.",
      "Push the results off the screen.",
    ],
    a11y: "Give the answer its own heading so people can skip straight to the results.",
    seenIn: ["Google AI Overviews"],
  },
  because: {
    what: "Recommendations come with the reason they were picked, taken from something the person did.",
    anatomy: [
      { name: "Reason heading", note: "\"Because you saved…\" naming the real item." },
      { name: "Recommended items", note: "A short row." },
    ],
    states: [
      { name: "Shown", note: "Heading and row." },
      { name: "Hidden", note: "\"Not interested\" removes the row and its reason." },
      { name: "Too little history", note: "Use popular items and drop the reason." },
    ],
    dos: [
      "Name the exact item or action the row is based on.",
      "Let people remove the signal, not just the row.",
    ],
    donts: [
      "Reveal something sensitive by showing it back, like a health search.",
      "Use a vague reason such as \"based on your activity\".",
    ],
    a11y: "The reason is the row's heading, so it is read before the items.",
    seenIn: ["Netflix", "Spotify"],
  },
  anomaly: {
    what: "The AI points at something unusual in a chart and says in one line what happened and what may have caused it.",
    anatomy: [
      { name: "Chart", note: "Unchanged." },
      { name: "Marker", note: "Ring on the point that's unusual." },
      { name: "Callout", note: "What changed, by how much, and a likely cause." },
    ],
    states: [
      { name: "Nothing unusual", note: "No callout. Silence is the default." },
      { name: "Spotted", note: "Marker and callout." },
      { name: "Dismissed", note: "Gone, and a similar change isn't flagged again soon." },
    ],
    dos: [
      "Lead with the number and the time, then the possible cause.",
      "Link the cause to where it can be checked.",
    ],
    donts: [
      "Fire on every wobble. People learn to ignore callouts.",
      "State a cause as fact when it is a correlation.",
    ],
    a11y: "The callout says the value in words, so the finding doesn't depend on seeing the marker.",
    seenIn: ["Google Analytics Insights"],
  },
  nudge: {
    what: "The AI notices something worth doing before anyone asks and offers it as one action people can take or dismiss.",
    anatomy: [
      { name: "What it noticed", note: "One line, the fact first." },
      { name: "Action", note: "One primary button that does it." },
      { name: "Dismiss", note: "Always, and it sticks." },
      { name: "Undo", note: "After the action, in the same place." },
    ],
    states: [
      { name: "Offered", note: "Attached to the items it's about." },
      { name: "Taken", note: "Done, with Undo." },
      { name: "Dismissed", note: "Gone, and not offered again for these items." },
    ],
    dos: [
      "Place it next to the thing it noticed, not in a corner.",
      "Cap how often it can appear.",
    ],
    donts: [
      "Interrupt somebody mid-task.",
      "Bring a dismissed offer back next session.",
    ],
    a11y: "Arriving offers are announced politely and never take focus.",
    seenIn: ["Gmail nudges", "Linear duplicate suggestions"],
  },
  plan: {
    what: "For a task with several steps, the AI shows its plan as a checklist and ticks each step off as it goes.",
    anatomy: [
      { name: "Task title", note: "What is being done, in the person's terms." },
      { name: "Steps", note: "Short verbs, in order." },
      { name: "Step status", note: "Waiting, working, done, failed. Icon and word." },
    ],
    states: [
      { name: "Planned", note: "Steps listed, nothing started. Editable if you ask first." },
      { name: "Running", note: "One step working at a time." },
      { name: "Done", note: "All ticked, with a link to the result." },
      { name: "Step failed", note: "Stop there, say why, offer to retry that step." },
    ],
    dos: [
      "Keep step names to what the person would recognise.",
      "Let people stop the run between steps.",
    ],
    donts: [
      "Show a plan for one quick action. Show the result.",
      "Mark a step done before it really is.",
    ],
    a11y: "Each step's status is text (\"Done\", \"Working\"), not only an icon or colour.",
    seenIn: ["ChatGPT agent", "Claude Code task lists"],
  },
  clarify: {
    what: "When a request could mean several things, the AI asks one short question with likely answers to tap, instead of guessing.",
    anatomy: [
      { name: "Request", note: "As asked." },
      { name: "Question", note: "One, short, about the missing detail." },
      { name: "Answer chips", note: "Two or three likely answers, plus a way to say something else." },
    ],
    states: [
      { name: "Asking", note: "Question and chips." },
      { name: "Answered", note: "The pick becomes a reply, and the task goes ahead." },
      { name: "Typed a different answer", note: "Accept free text as well as chips." },
    ],
    dos: [
      "Ask only what changes the result.",
      "Ask once, then act.",
    ],
    donts: [
      "Ask when a sensible default exists. Use it and say so.",
      "Ask several questions in a row.",
    ],
    a11y: "Move focus to the first answer chip when the question appears.",
    seenIn: ["ChatGPT Deep Research"],
  },
  copilot: {
    what: "A panel beside the work where people can ask about what's on screen without leaving it.",
    anatomy: [
      { name: "Work area", note: "Still visible and usable." },
      { name: "Context label", note: "What the panel can see (\"Using Q3 plan\")." },
      { name: "Conversation", note: "Questions and answers." },
      { name: "Input", note: "Placeholder names the context." },
    ],
    states: [
      { name: "Closed", note: "One entry point, same place on every page." },
      { name: "Open and empty", note: "Starters about this page." },
      { name: "Answering", note: "Work area stays usable." },
      { name: "Context changed", note: "Say when the page it can see has changed." },
    ],
    dos: [
      "Show exactly what the panel can see.",
      "Let answers act on the page (insert, highlight) not just describe it.",
    ],
    donts: [
      "Open it automatically.",
      "Use it when one inline action would do.",
    ],
    a11y: "The panel is a landmark with a name, and a shortcut moves focus between it and the work.",
    seenIn: ["Microsoft 365 Copilot", "Gemini in Google Workspace"],
  },
  voice: {
    what: "As somebody speaks, their words appear on screen, so they can see they were understood before anything happens.",
    anatomy: [
      { name: "Listening indicator", note: "Clearly on or off." },
      { name: "Transcript", note: "Settled words solid, guesses faded." },
      { name: "Status", note: "Listening, Done, or Didn't catch that." },
    ],
    states: [
      { name: "Listening", note: "Indicator live, transcript growing." },
      { name: "Done", note: "Indicator still, full text, time to correct it." },
      { name: "Didn't catch that", note: "Say so and keep listening or offer typing." },
      { name: "No microphone", note: "Explain and offer typing." },
    ],
    dos: [
      "Let people edit the transcript before it's acted on.",
      "Always offer typing as well.",
    ],
    donts: [
      "Act before the person has finished speaking.",
      "Rely on the pulse alone to say it's listening.",
    ],
    a11y: "Listening has a text status, and the transcript is announced when it settles, not word by word.",
    seenIn: ["Otter.ai", "Apple Dictation"],
  },
  detect: {
    what: "Boxes and labels drawn on an image show what the AI found and exactly where.",
    anatomy: [
      { name: "Image", note: "Unchanged underneath." },
      { name: "Box", note: "Outline around each find." },
      { name: "Label", note: "Name on the box, readable on any background." },
    ],
    states: [
      { name: "Looking", note: "Image first, boxes as they're found." },
      { name: "Found", note: "All boxes and labels." },
      { name: "Nothing found", note: "Say so in words." },
      { name: "Crowded", note: "List the finds beside the image instead." },
    ],
    dos: [
      "Let people tap a box to see or correct the label.",
      "Offer a list of finds as well as the boxes.",
    ],
    donts: [
      "Cover the thing found with its own label.",
      "Draw boxes on a thumbnail too small to read them.",
    ],
    a11y: "The image's text alternative lists what was found.",
    seenIn: ["Google Lens"],
  },
  translate: {
    what: "Content in another language gets a one-click translation, with the original one click away.",
    anatomy: [
      { name: "Content", note: "Original by default." },
      { name: "Toggle", note: "Show translation / Show original." },
      { name: "Source language", note: "Shown once translated." },
    ],
    states: [
      { name: "Original", note: "Toggle offered." },
      { name: "Translated", note: "Tinted, with the language it came from." },
      { name: "Already in your language", note: "No toggle." },
    ],
    dos: [
      "Say which language it was translated from.",
      "Remember the choice per person, not per item.",
    ],
    donts: [
      "Translate legal or contractual text without the original beside it.",
      "Replace the original for good.",
    ],
    a11y: "Mark the language of the text so screen readers pronounce it correctly in both views.",
    seenIn: ["X", "LinkedIn"],
  },

  regen: {
    what: "People can ask for another take and step between versions, so a better earlier answer is never lost.",
    anatomy: [
      { name: "Answer", note: "The version being viewed." },
      { name: "Version stepper", note: "Previous, \"2 / 3\", next." },
      { name: "Regenerate", note: "Adds a version, never replaces." },
    ],
    states: [
      { name: "One version", note: "Stepper hidden or disabled." },
      { name: "Regenerating", note: "Old answer stays until the new one starts." },
      { name: "Several versions", note: "Stepper live." },
      { name: "Failed", note: "Keep the versions you had." },
    ],
    dos: [
      "Keep every version for as long as the conversation exists.",
      "Let people say what to change (\"shorter\") as well as just retry.",
    ],
    donts: [
      "Use it for answers that should be the same every time, like totals.",
      "Overwrite the previous answer.",
    ],
    a11y: "The stepper announces the version number when it changes.",
    seenIn: ["ChatGPT", "Claude"],
  },
  cite: {
    what: "Numbered markers in an answer point to the exact source each claim came from, so people can check it.",
    anatomy: [
      { name: "Answer", note: "With markers after the claims they support." },
      { name: "Marker", note: "Small number, a real button." },
      { name: "Source preview", note: "Document, location, and the passage." },
    ],
    states: [
      { name: "Answer with sources", note: "Markers inline." },
      { name: "Source open", note: "Preview of that passage." },
      { name: "Partly sourced", note: "Say which part has no source." },
      { name: "Source unavailable", note: "Say it moved or you no longer have access." },
    ],
    dos: [
      "Link to the passage, not the top of a 40-page document.",
      "Put the marker after the claim it supports.",
    ],
    donts: [
      "Add markers that don't support the claim. One bad citation spoils the rest.",
      "Cite for creative output with nothing to point to.",
    ],
    a11y: "Markers say what they open (\"Source 1: Q3 financial report\"), not just \"1\".",
    seenIn: ["Perplexity", "NotebookLM"],
  },
  conf: {
    what: "Each AI value says, in plain words, whether it's sure or needs a check, so people know where to look.",
    anatomy: [
      { name: "Value", note: "Tinted as AI-produced." },
      { name: "Confidence word", note: "Sure / Check this, with an icon." },
      { name: "Reason", note: "One line on why it's unsure." },
    ],
    states: [
      { name: "All sure", note: "Quiet. The marks are small." },
      { name: "Some unsure", note: "Unsure ones stand out." },
      { name: "Checked", note: "Mark clears once a person confirms." },
    ],
    dos: [
      "Use two or three words people can act on.",
      "Say why when it's unsure.",
    ],
    donts: [
      "Show raw percentages to people who can't act on them.",
      "Mark everything unsure. Then nothing is.",
    ],
    a11y: "The confidence is a word, never colour alone.",
  },
  approve: {
    what: "Before the AI does something hard to undo, it shows exactly what will happen and waits for a person to say go.",
    anatomy: [
      { name: "Summary", note: "What, how many, to whom." },
      { name: "Preview", note: "A real sample of what will go out." },
      { name: "Edit", note: "Change it before it goes." },
      { name: "Confirm", note: "Names the action (\"Send emails\")." },
    ],
    states: [
      { name: "Waiting for you", note: "Nothing has happened yet." },
      { name: "Sending", note: "Progress per item." },
      { name: "Done", note: "Says what happened, with a link to it." },
      { name: "Partly failed", note: "Which went, which didn't, and what to do." },
    ],
    dos: [
      "Name the action on the button, not \"OK\".",
      "Show a real sample, not a description of one.",
    ],
    donts: [
      "Ask for approval on every small reversible step.",
      "Make Reject look like the safe default when it loses work.",
    ],
    a11y: "Focus lands on the summary, not the confirm button, so people read before they act.",
    seenIn: ["ChatGPT agent", "Claude Code permissions"],
  },
  feedback: {
    what: "Thumbs up or down on an answer, with one optional reason, so people can say something was off.",
    anatomy: [
      { name: "Answer", note: "What's being rated." },
      { name: "Thumbs", note: "Small, after the answer." },
      { name: "Reasons", note: "After thumbs down: three quick options." },
      { name: "Thanks", note: "Short, replaces the controls." },
    ],
    states: [
      { name: "Unrated", note: "Thumbs quiet." },
      { name: "Liked", note: "Thanks." },
      { name: "Disliked", note: "Optional reasons." },
      { name: "Reported", note: "Harmful content goes to a person, and says so." },
    ],
    dos: [
      "Make the reason optional and one tap.",
      "Say what happens with the feedback.",
    ],
    donts: [
      "Ask for feedback nobody reads.",
      "Interrupt to ask. Let people offer it.",
    ],
    a11y: "Thumbs have names (\"Good answer\"), and the chosen one shows as pressed.",
    seenIn: ["ChatGPT", "Gemini"],
  },
  diff: {
    what: "AI edits are shown as tracked changes, with removals struck through and additions highlighted, so people accept exactly what they agree with.",
    anatomy: [
      { name: "Removed text", note: "Struck through." },
      { name: "Added text", note: "Tinted." },
      { name: "Accept and reject", note: "For all, and per change when there are several." },
      { name: "Undo", note: "After accepting." },
    ],
    states: [
      { name: "Proposed", note: "Changes marked." },
      { name: "Accepted", note: "Clean text, Undo available." },
      { name: "Rejected", note: "Original kept, and says so." },
      { name: "Out of date", note: "The text changed underneath. Re-run, don't apply." },
    ],
    dos: [
      "Let people accept one change and reject another.",
      "Show the whole sentence around a change.",
    ],
    donts: [
      "Show a diff for a full rewrite. Use before and after.",
      "Mark changes with colour alone.",
    ],
    a11y: "Use real insert and delete markup so screen readers announce what changed.",
    seenIn: ["Cursor", "GitHub Copilot"],
  },
  why: {
    what: "A \"Why this?\" link on an AI pick explains the main reason in one line and lets people adjust it.",
    anatomy: [
      { name: "Pick", note: "The recommendation or decision." },
      { name: "Why this?", note: "A small link, always in the same place." },
      { name: "Reason", note: "One concrete line." },
      { name: "Adjust", note: "\"Show fewer like this\"." },
    ],
    states: [
      { name: "Closed", note: "Link only." },
      { name: "Explained", note: "Reason and adjust." },
      { name: "Adjusted", note: "Confirms the change took effect." },
    ],
    dos: [
      "Give the single biggest reason, with a number if there is one.",
      "Pair the reason with a way to change it.",
    ],
    donts: [
      "Give a vague reason that says nothing.",
      "Reveal something the person wouldn't want shown back.",
    ],
    a11y: "The link opens the reason directly after it in reading order, with its expanded state announced.",
    seenIn: ["Instagram and Facebook \"Why am I seeing this?\""],
  },
  undo: {
    what: "After the AI changes something, a message says what it did and offers Undo, so going back is one click.",
    anatomy: [
      { name: "Result", note: "The changed content." },
      { name: "Message", note: "What was done, with the count." },
      { name: "Undo", note: "One click, in the message." },
    ],
    states: [
      { name: "Done", note: "Message with Undo." },
      { name: "Undone", note: "Says what was put back." },
      { name: "Message gone", note: "Undo still reachable from history." },
    ],
    dos: [
      "Say exactly what changed and how many.",
      "Keep Undo reachable after the message fades.",
    ],
    donts: [
      "Offer Undo for something that can't be undone. Ask before, instead.",
      "Fade the message before people can read it.",
    ],
    a11y: "Announce the message politely and keep it until it loses focus or is dismissed, not on a short timer.",
  },
};
