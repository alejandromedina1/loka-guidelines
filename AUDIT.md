# AI Patterns hub — audit

October 2026 · branch `ai-patterns` · read-only review, no code changed.

> **Status:** plan steps 1–9 have been made, and shelf cards now open the pattern page directly. Step 10 is still open. What changed and why is recorded in `src/components/ai/CLAUDE.md` under *Audit pass — October 2026*.

## Summary

The hub is strong where it matters most: all 28 patterns are **live demos with real working data**, not
screenshots. Answers stream, cards land, Heads-Up offers itself after 2.8s, and every pattern runs on a
named product surface rather than a generic chatbot. Most patterns map to behaviour in products people
already use. Four things hold it back. **(1)** You can't jump straight to most states. Tabs only appear
where the flow forks, so up to 3 states per pattern can only be reached by waiting, clicking through or
pressing Start over. **(2)** There's a lot to read next to the demo: about 60–90 words in the right panel
and about 490 words per page. **(3)** The demo doesn't show the pattern's anatomy. **(4)** The canvas
arrows switch *patterns*, not states, so they're easy to misread. The biggest gaps are **feedback
(thumbs/report)**, **AI labels**, **edit & resend** and **memory controls**. None of them is on the shelf
yet, and all four are in nearly every shipped AI product.

---

## 1. Inventory

All 28 are **live and interactive**: each preview is a pure function of working data, the canvas works
out which state it's in, and `work.tick` plays the system's side. The two exceptions are switched by
tabs only (marked †). 26 of 28 also have a Voice and/or Canvas version.

Files: data in `src/data/aiPatterns.js`, previews in `src/components/ai/previews/<File>.jsx`.

| # | Pattern | Category | Preview file | Demonstrates | States |
|---|---|---|---|---|---|
| 01 | Prompt Box | Intent & Input | PromptComposerPreview | Typing box with context chips and a length limit | Empty · Composing · With context · Over limit · Submitted |
| 02 | Suggested Prompts | Intent & Input | SuggestedPromptsPreview | Starter examples that show what the feature can do | Nothing typed · About this page · They start typing · One picked · Nothing worth suggesting |
| 03 | Visible Sources | Intent & Input | ScopedContextPreview | Choosing which data the AI reads before it runs | Default · Editing · Narrowed · Nothing in scope · Scope changed |
| 04 | Guided Input | Intent & Input | GuidedInputPreview | Fields instead of a sentence for dates/amounts | Nothing filled · Part filled · Said in words · Ready · Conflict |
| 05 | Word by Word | Waiting & Progress | StreamingPreview | Streamed answer, Stop, connection loss | Waiting · Streaming · Complete · Stopped · Connection lost |
| 06 | Results in Pieces | Waiting & Progress | StagedRevealPreview | Cards arriving one by one, one late | All pending · Some arrived · Lagging · One failed · Complete |
| 07 | Visible Working | Waiting & Progress | VisibleWorkingPreview | Live trace of steps while it works | Starting · Working · Long run · Finished · Stuck |
| 08 | Stop & Steer | Waiting & Progress | StopSteerPreview | Interrupt/redirect and what happens to the partial result | Running · Stopped · Redirected · Carried on · Dropped |
| 09 | Sourced Answer | Output & Clarity | GroundedAnswerPreview | Inline citations that open the passage they came from | Sourced · Partly · Nothing found · Source open · Restricted |
| 10 | Confidence Levels † | Output & Clarity | ConfidencePreview | Confidence shown as bands that limit what you can do next | Above bar · Range · Below bar · No score |
| 11 | Answer in Fields | Output & Clarity | StructuredOutputPreview | Extracted values traced back to their source | Extracted · Needs checking · Not found · Traced · Corrected |
| 12 | Typing Ahead | Output & Clarity | InlineSuggestionPreview | Ghost text you accept with Tab | Typing · Nothing · Offered · Accepted · Dismissed |
| 13 | Change Review | Control & Correction | DiffReviewPreview | Accept or reject each proposed change | Proposed · Nothing to change · Partly accepted · Stale · Applied |
| 14 | Retry & Compare | Control & Correction | RetryComparePreview | Regenerate without losing the current answer | One · Two side by side · Different · One kept · Barely different |
| 15 | Edit in Place | Control & Correction | EditInPlacePreview | Select a part and say what to change | Nothing picked · Part picked · Changed · Changed too much · Again |
| 16 | Undo & History | Control & Correction | VersionHistoryPreview | Readable trail of AI changes, restoring any point | Trail · One change · Restoring · Why it changed |
| 17 | Approval Gate | Agentic & Multi-step | ApprovalGatePreview | Stop before a real-world action, shown as a payment ledger | Awaiting · Modified · Running · Done · Failed midway |
| 18 | Plan Preview | Agentic & Multi-step | PlanPreviewPreview | Plan you can edit before the run starts | Proposed · Step removed · Running · Paused · Complete |
| 19 | Action Log | Agentic & Multi-step | ActionLogPreview | Folded record of everything the agent did | Folded · Opened · Only changes · One opened · Something missing |
| 20 | Spending Limits | Agentic & Multi-step | SpendingLimitsPreview | Ceiling on steps/time/money per run | Before · Inside · Close · Stopped at limit · Raised |
| 21 | Heads-Up | Initiative & Attention | UnpromptedOfferPreview | Product raises something on its own, tied to the object | Nothing · Offered · Badly timed · Taken up · Waved off |
| 22 | Background Work | Initiative & Attention | BackgroundWorkPreview | Work that carries on after you leave the tab | Left running · Still going · Finished · Waiting on you · Failed |
| 23 | Interruption Limit | Initiative & Attention | InterruptionLimitPreview | Cap on how often the product speaks first | Nothing spent · Some · Holding back · None left · Broken on purpose |
| 24 | Back to You | Initiative & Attention | BackToYouPreview | Handing control back, with what changed | It has it · Handing back · Stuck · You took it · Yours now |
| 25 | Clear Refusal † | Boundaries & Failure | RefusalPreview | Refusal drawn on the thing it refused | Rule · Can't yet · Not confident · Stopped partway |
| 26 | No Good Match | Boundaries & Failure | NoAnswerPreview | Nothing clears the bar → show near misses, not a guess | Confident · Nothing above bar · Not enough data · Below bar |
| 27 | After a Mistake | Boundaries & Failure | AfterMistakePreview | Acting on a wrong answer: trace, undo, tell others | Found · What followed · Putting back · Others told · Can't be put back |
| 28 | Known Limits | Boundaries & Failure | KnownLimitsPreview | What it can see, can't do, and how old the data is | Where you'd look · Can see · Can't do · Where it bites · Older than it looks |

Also in the hub: **Principles** (6 principles, `aiPrinciples.js`) and **Anti-patterns** (9 wireframes,
`antipatterns/index.jsx`).

---

## 2. Scorecard

✅ Pass · 🟡 Needs work · ❌ Fail

**How each criterion was judged**
- **Real**: a shipped product does this visibly.
- **Shown**: understandable in about 10 seconds. Measured by words per frame, from rendering every state.
- **States**: covers the states the brief lists, *and* you can switch to them. 🟡 if a state is missing or 2+ states are in no tab.
- **Useful**: "when do I use it?" and "what are its parts?" are answered by the demo itself.
- **Minimal**: no extra controls, chrome or text.

**Useful scores 🟡 on every row**, because nothing in the demo shows the pattern's anatomy (see Issue 3).
It's kept in the table so the column is complete.

| # | Pattern | Real (precedent) | Shown | States | Useful | Minimal | Main finding |
|---|---|---|---|---|---|---|---|
| 01 | Prompt Box | ✅ ChatGPT, Claude composer | ✅ | 🟡 | 🟡 | ✅ | Empty and Submitted are in no tab; Over limit is 74 words |
| 02 | Suggested Prompts | ✅ ChatGPT, M365 Copilot starters | ✅ | ✅ | 🟡 | ✅ | — |
| 03 | Visible Sources | ✅ Perplexity sources, Copilot Work/Web, Notion AI | ✅ | 🟡 | 🟡 | ✅ | Default and Scope changed are in no tab |
| 04 | Guided Input | ✅ Jasper/Copy.ai templates, Canva Magic | ✅ | ✅ | 🟡 | ✅ | — |
| 05 | Word by Word | ✅ ChatGPT, Claude, Gemini | ✅ | 🟡 | 🟡 | ✅ | Best demo in the hub. Waiting and Streaming only pass by on the timer |
| 06 | Results in Pieces | ✅ Notion AI autofill, Perplexity | ✅ | 🟡 | 🟡 | ✅ | All pending and Complete are in no tab |
| 07 | Visible Working | ✅ ChatGPT/Claude thinking, Deep Research | ✅ | 🟡 | 🟡 | ✅ | No user controls (0 clicks); it's something you watch |
| 08 | Stop & Steer | ✅ ChatGPT Stop, Claude Code Esc-to-steer | 🟡 | ✅ | 🟡 | 🟡 | 51–62 words per frame; overlaps Word by Word's Stopped |
| 09 | Sourced Answer | ✅ Perplexity, NotebookLM, AI Overviews | ✅ | ✅ | 🟡 | ✅ | — |
| 10 | Confidence Levels | 🟡 Textract/Rossum field scores; rare in consumer UI | ✅ | ✅ | 🟡 | ✅ | "Show both payments" looks live but does nothing |
| 11 | Answer in Fields | ✅ Rossum, Ramp receipts, Notion autofill | 🟡 | ✅ | 🟡 | ✅ | 47–57 words per frame |
| 12 | Typing Ahead | ✅ Copilot ghost text, Gmail Smart Compose, Cursor Tab | ✅ | ✅ | 🟡 | ✅ | Clearest at a glance after Word by Word |
| 13 | Change Review | ✅ Cursor/Copilot diffs, Docs suggestions | ✅ | ✅ | 🟡 | ✅ | 8 buttons in Proposed, but each one is real per-row accept/reject |
| 14 | Retry & Compare | ✅ ChatGPT regenerate 1/2, side-by-side preference | 🟡 | 🟡 | 🟡 | 🟡 | Up to 85 words; no generating or failed state |
| 15 | Edit in Place | ✅ ChatGPT Canvas, Cursor Cmd-K, Notion AI | ✅ | 🟡 | 🟡 | 🟡 | 3 of 5 states are in no tab; 4–5 buttons per frame |
| 16 | Undo & History | ✅ Docs history, Cursor/Claude Code checkpoints | ✅ | 🟡 | 🟡 | ✅ | No "can't restore" state; 2 of 4 states are in no tab |
| 17 | Approval Gate | ✅ Claude Code permissions, ChatGPT Agent confirms | ✅ | 🟡 | 🟡 | ✅ | **Reject is a dead button and there's no Rejected state** |
| 18 | Plan Preview | ✅ Gemini Deep Research "Edit plan", Cursor/Claude Code plan mode | 🟡 | 🟡 | 🟡 | ✅ | No failed-step state; 69–76 words in the opening states |
| 19 | Action Log | ✅ ChatGPT Agent activity, Zapier run history | 🟡 | 🟡 | 🟡 | 🟡 | Up to 80 words and 6 buttons; name doesn't say how it differs from Visible Working |
| 20 | Spending Limits | 🟡 Devin ACU caps, API spend limits (account-level, rarely per run) | 🟡 | 🟡 | 🟡 | ✅ | 3 of 5 states are in no tab; your own notes call it the weak entry |
| 21 | Heads-Up | ✅ Gmail nudges, Outlook Copilot | ✅ | ✅ | 🟡 | ✅ | — |
| 22 | Background Work | ✅ Deep Research, Codex cloud tasks, Cursor background agents | 🟡 | ✅ | 🟡 | ✅ | Timeline is clever but needs its caption to read |
| 23 | Interruption Limit | 🟡 Shipped as notification-frequency settings; no product shows this budget | 🟡 | 🟡 | 🟡 | 🟡 | 97 words in Broken on purpose; the visible "budget" is UI that doesn't exist in shipped products |
| 24 | Back to You | ✅ ChatGPT Agent / Operator take-over | 🟡 | 🟡 | 🟡 | 🟡 | Up to 77 words |
| 25 | Clear Refusal | ✅ Copilot / Gemini policy refusals | ✅ | ✅ | 🟡 | ✅ | Only 1 use and 1 avoid line (others have 3/2) |
| 26 | No Good Match | ✅ Intercom Fin handoff, search "no results" | ✅ | ✅ | 🟡 | ✅ | — |
| 27 | After a Mistake | 🟡 Shipped as incident notices, rarely as product UI | 🟡 | 🟡 | 🟡 | 🟡 | **82–106 words per frame**, the densest in the hub |
| 28 | Known Limits | ✅ ChatGPT cutoff notes, Copilot "only searches your org" | 🟡 | 🟡 | 🟡 | ✅ | 77 words in Older than it looks |

**Totals:** Real 24 ✅ / 4 🟡 · Shown 17 ✅ / 11 🟡 · States 12 ✅ / 16 🟡 · Useful 0 ✅ / 28 🟡 ·
Minimal 21 ✅ / 7 🟡 · **No ❌ scores.**

---

## 3. Top 5 issues

Ranked by how much each one gets in the way of a designer understanding a pattern.

| # | Issue | Evidence | Fix |
|---|---|---|---|
| 1 | **You can't jump to a state.** Tabs only show where the flow forks; on a straight stretch there's just a label. | Of 136 states, 40 are in no tab. Edit in Place, Spending Limits and Interruption Limit each have 3 of 5 out of reach. To reach them you wait, click through, or use Start over / "See it on…" links far below the demo. | Turn the state label into a list of **every** state. A jump calls `work.for(id)`, which already round-trips (smoke29). The data stays the single source of truth. ⚠ This touches a settled decision ("the state is an output"); it adds a way in and keeps the derived model. |
| 2 | **The demo comes with a page of reading.** | Right panel: a state note, plus 5 grade rows each with a note (about 60–90 words). Pages average **~490 words**. Blue is used for the readout background *and* 70 "Required" chips, so half the panel signals "this matters". | Panel shows the state note only. Grades become one strip of 5 chips, with each note shown on hover or click. |
| 3 | **The demo doesn't show what the parts are.** | "What are the parts?" is only answered by the *Composed from* chips at the very bottom. "When to use it" sits below the demo as prose. | Add an **Anatomy** toggle in the canvas footer: numbered markers on the wireframe, keyed to `composedOf`. Add a one-line "Use when" under the title. |
| 4 | **The canvas arrows switch patterns, not states.** | `.pg-arrow` sits on the same band as the state label and tabs, which is exactly where a designer looks for "next state". Navigation is also stacked three deep: shelf card → lab inside the card → full page, plus the sidebar. | Move pattern prev/next out of the canvas (page header or footer). Keep canvas controls about the canvas. Consider dropping the in-card lab so a card opens the page directly. |
| 5 | **Dead controls look live.** | Approval Gate **Reject**, Confidence "Show both payments", Word by Word "Copy" and others look exactly like working buttons. They're `tabIndex=-1` but clicking them does nothing, so they read as broken. | Either wire the ones that matter (Reject → a Rejected state) or style inert buttons as flat outlines. |

Also: the **shelf footer is wrong**. `PatternShelf.jsx` prints "28 of 28 are written up. The rest are
on the shelf so the gaps are visible…". It's on the landing view, it contradicts itself, and it's a
one-line fix.

---

## 4. Missing patterns

Every pattern below has a clear real-world precedent. Names follow the house rules (plain noun, ≤18
characters).

| Priority | Pattern (proposed name) | Gap area | Precedent | Fits in |
|---|---|---|---|---|
| **Must** | **Answer Feedback** (thumbs, reason, report) | Feedback | ChatGPT, Claude, Gemini, Copilot. Effectively universal | Control & Correction |
| **Must** | **AI Label** (disclosure on generated content) | Trust | Gmail "Help me write", LinkedIn/Meta "AI info", Notion AI blocks | Output & Clarity |
| **Must** | **Edit & Resend** (edit a sent prompt, branch 1/2) | Output | ChatGPT and Claude message edit with branch arrows | Control & Correction |
| **Must** | **Memory Controls** (what it remembers, manage, forget) | Control | ChatGPT "Memory updated", Claude memory, Gemini saved info | Intent & Input |
| Should | **Mode Picker** (model or mode: Ask/Agent, Fast/Thinking) | Input | ChatGPT model menu, Cursor Ask/Agent, Perplexity focus | Intent & Input |
| Should | **Usage Limit** ("limit reached, resets at 15:00") | Failure | ChatGPT, Claude, Cursor plan limits | Boundaries & Failure |
| Should | **Selection Actions** (preset menu on selected text) | Inline | Apple Writing Tools, Notion "Ask AI", Docs "Help me write" | Output & Clarity |
| Should | **Attachments** (upload progress, wrong type, too big, being read) | Input | ChatGPT, Claude, Gemini file chips | Intent & Input |
| Later | First-run intro (what it can do, first prompt) | Failure/empty | Copilot and Notion AI first open | Intent & Input |
| Later | Conversation history (threads, rename, delete) | Control | Every chat product | Control & Correction |
| Later | Dictation input | Input | ChatGPT, Gemini mic | Intent & Input |

Already covered (no new pattern needed): streaming, stop, regenerate, citations, confidence, approval,
undo, progress/steps, tool trace, long-running work, ghost text, inline rewrite, refusals, no-answer and
empty prompt.

Adding the Musts **breaks the 4-per-category rule**. Your own notes already say to let a category hold a
genuine three or five, so the count shouldn't block these.

---

## 5. Hub UI review

| Area | Finding | Effect |
|---|---|---|
| Shelf | 28 cards, each with a full 15–28-word definition plus a thumbnail where the text is 6.5–10px (unreadable). | Feels busy; the drawings read as texture and the definitions do the work |
| Shelf | Footer copy is outdated (see above). | Looks unfinished on the first screen |
| Shelf | A card opens a full lab (with its 260px panel) inside the grid, plus a "Read the full pattern" link and a helper line. | Three ways in and two sizes of the same lab |
| Pattern page | "All patterns" button, plus arrows that cycle patterns inside the canvas band. | The canvas band mixes state and pattern navigation |
| Canvas | Bands are 72px top and bottom (`--ai-band`; the notes say 56px), with the state label and its "by" line above. | Fine, but 3 lines of text sit above every frame |
| Canvas footer | Screen/Voice/Canvas switcher on 26 of 28 patterns. | A second thing to explore that most screen designers don't need first. Could be quieter or tucked away |
| Panel | Blue-tinted readout, 5 coloured chips, 5 notes. | The loudest part of the lab, next to a grey wireframe |
| Colour | Blue is spent on the readout, Required chips, the "Use when" header, focus rings and link hovers. Red on the "Avoid when" header, green on Recommended. | More than one accent in the chrome; blue loses its "this matters" meaning |
| Group headers | Descriptions run 2–3 sentences and editorialise ("Argue with it in a review; don't skip it."). | Telling, not showing. One line would do |
| Blocks below | When / Decisions / On other surfaces / Composed from, about 400 words. | Good reference, but long; the decisions' "See it on…" links are the best part |
| Principles | `applies` links only to the **original 14** patterns. The 14 newer ones are never linked from Principles. | Half the shelf is unreachable from that view |

---

## 6. Proposed plan

Small steps in impact order. Each one can ship on its own.

1. **Quick fixes.** Fix the shelf footer copy. Wire Approval Gate's Reject and add a Rejected state. Style
   inert wireframe buttons as clearly inert.
2. **Free state access.** Make the state label a menu of every state, using `work.for`, and keep the
   forking tabs. Needs your sign-off, because it touches a settled decision.
3. **Separate the navigation.** Move pattern prev/next out of the canvas band. Decide whether shelf cards
   open the page directly instead of an in-card lab.
4. **Quieter panel.** State note plus a 5-chip grade strip; notes on hover or click. Take blue off the
   readout background.
5. **Anatomy toggle.** Numbered markers on the wireframe, keyed to `composedOf`. Start with Word by Word,
   Sourced Answer and Approval Gate, then roll out.
6. **Trim the copy.** One-line group descriptions. Cut the frames over 70 words (After a Mistake,
   Interruption Limit, Retry & Compare, Action Log, Back to You, Known Limits, Plan Preview).
7. **Fill the missing states.** Failed step in Plan Preview, failed retry in Retry & Compare, can't
   restore in Undo & History.
8. **Add the four Must patterns**: Answer Feedback, AI Label, Edit & Resend, Memory Controls.
9. **Update Principles links** so they cover all 28 patterns, plus the new ones.
10. **Later:** decide whether to keep Interruption Limit and Spending Limits as their own patterns or fold
    them into Heads-Up and Approval Gate; add the Should patterns.
