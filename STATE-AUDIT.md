# AI Patterns hub — state system audit

October 2026 · branch `ai-patterns` · audited, approved, and the plan carried out.

> **Status: plan steps 1–3 and 5–10 are done. Step 4 is in progress, by design: Response is added pattern by pattern as each is redesigned.**
>
> | | Before | After |
> |---|---|---|
> | States reachable by using the playground | 126 of 164 | **146 of 174** |
> | Patterns where every state is reachable | 9 | **13** |
> | Forced moving states that freeze | 12 patterns | **0** (25 states now show Paused · Play) |
> | Jumps that discard typed input | 7 patterns | **0** (7 patterns keep it) |
> | Missing states added | | **10** (8 loading states, Expired, Correcting one) |
> | Patterns with Response | 1 | **7** |
> | Patterns with no data model | 1 | **0** |
>
> New: route playback (picking a state plays the way there at 4×; Shift-click cuts straight to it), Replay, step back and forward, 1× / 4× speed, a Compare grid, kind labels on every state, and `#ai/<pattern>/<state>` deep links.
>
> **Revised after review:** the hub's focus is the live demo, so the State list stopped being a control. The panel now reads **Try → View → Found**. Found is a map that marks each state *found* when using the playground reaches it, *visited* when it was jumped to, or not yet, with an "N of M" count. Route playback, Replay, step, speed and kind labels were removed; Compare, Paused · Play and deep links stay.
>
> **smoke33** checks all of it. Its list of the 28 states still reachable only from the State list is a ratchet: it can only shrink. Two waits that never ended (Long run, Carried on) were found by the new "no run ends on a wait" rule and fixed.

## Summary and verdict

The state *model* is sound. A state is never set directly: each preview renders from data, and the page works out which state that data is in. So the State list always matches the screen, and a state can't show content left over from the previous one.

What's weak is the *experience* of states. Only **9 of 32 patterns** let you reach every state by using them; **38 of 164 states (23%) can only be reached through the State list**, and most of those are failure states. Forcing a state that normally moves on (Streaming, Checking, Running) **freezes it silently**, and the Skip button disappears. Forcing a state also **throws away what you typed**. A forced jump is an instant cut with nothing on screen saying how you got there, because the "what put you here" line now only reaches screen readers. And you can't **replay**, **step through** or **compare** states.

**Verdict:** a state switcher is good practice *as a shortcut and for comparing states*, not as the main way in. The hub should keep real interaction first and turn the switcher into a **flow rail**. Picking a state on the rail plays the route to it rather than cutting. Add a **Response control on every pattern** so failures can be caused, and an on-demand **Compare grid**. Details are in the recommended model below.

## How it works today

| Aspect | Today | Same across all 32 patterns? |
|---|---|---|
| Where state is stored | Local `useState` in `PatternDetail` holds `work` (the preview's data). There is no shared store and no URL. | ✅ |
| How the state is decided | Worked out from the data: `work.state(work)` | ✅ for 31 of 32. Confidence Levels has no data model; it is four fixed pictures. |
| Jumping from the State list | Replaces the data with a canned version from `work.for(id)`, and **holds** (pauses) the system | ✅ |
| The system's own moves | `work.tick` runs on a `setTimeout` in a single effect | 12 patterns move on their own; 20 wait for you |
| Failures | Never happen on a timer (the hub's own rule). The only way to cause one by interacting is Response: Fails. | ❌ Only Clear Refusal has Response. Elsewhere, failures need the State list. |
| Starting action | The `Ask` field with Try it and examples, answered by `mock.js` | ❌ Clear Refusal only |
| Showing the change | Animated only when the pattern moves on its own. A jump from the State list is an instant cut, with no fade and no caption. | ✅ (consistently weak) |

Measured by driving every control from each pattern's opening state, with and without Response.

## Pattern × states

✓ reachable by using it · **S** reachable from the State list only · **Missing** = a state a real product would hit that the pattern doesn't have.

| Pattern | ✓ | S (State list only) | Missing |
|---|---|---|---|
| Prompt Box | 4 | Over limit | Send fails; nothing answers after Submitted |
| Suggested Prompts | 3 | About this page · Nothing worth suggesting | — |
| Visible Sources | 5 | — | A source can't be read mid-run |
| Guided Input | 4 | These can't both be true | — |
| Saved Memories | 5 | — | Edit a memory (Correct is graded Required) · saving fails |
| Word by Word | 4 | Connection lost | Slow first word (a long wait before anything arrives) |
| Results in Pieces | 4 | One piece failed | — |
| Visible Working | 3 | Long run · Stuck on a step | — |
| Stop & Steer | 5 | — | — |
| Sourced Answer | 3 | Partly sourced · Nothing found | Answering (loading) · a source that moved |
| Confidence Levels | 0 | all 4 | Checking (loading) |
| Answer in Fields | 3 | Needs checking · Not found | Extracting (loading) · upload fails |
| Typing Ahead | 4 | Nothing to suggest | — |
| AI Label | 5 | — | — |
| Change Review | 3 | Nothing to change · Stale | Proposing (loading) · apply fails |
| Retry & Compare | 4 | Two side by side · Didn't come back | Generating the second |
| Edit in Place | 4 | It changed more than that | Rewriting (loading) |
| Undo & History | 5 | — | Restore fails (conflict) |
| Edit & Resend | 5 | — | The edited run fails |
| Answer Feedback | 5 | — | — |
| Approval Gate | 5 | Failed midway | **Expired** (its own decision says a gate expires unexecuted, but there is no state for it) |
| Plan Preview | 5 | Step failed | Drafting the plan (loading) |
| Action Log | 4 | Something's missing | — |
| Spending Limits | 5 | — | — |
| Heads-Up | 4 | Badly timed | — |
| Background Work | 3 | Waiting on you · Failed while away | Cancelled while you were away |
| Interruption Limit | 2 | Some spent · Nothing left this week · Broken on purpose | — |
| Back to You | 4 | Handed back stuck | — |
| Clear Refusal | 8 | — | — |
| No Good Match | 1 | Nothing above the bar · Not enough data · Below the bar | Searching (loading) |
| After a Mistake | 4 | Can't be put back | — |
| Known Limits | 3 | Right where it bites · Older than it looks | — |

**Loading is missing from 8 patterns** whose answer has to come from somewhere (Sourced Answer, Confidence, Answer in Fields, Change Review, Retry & Compare, Edit in Place, Plan Preview, No Good Match). They open with the answer already there.

## State scorecard

✅ Pass · 🟡 Needs work · ❌ Fail

**How each criterion was scored:**
- **Reachable:** ✅ means every state can be reached by interacting; 🟡 means one or two can't; ❌ means three or more, or at least half.
- **Coherent** is 🟡 where jumping to a state replaces what you typed with canned text.
- **Minimal** is ✅ everywhere, because the controls now sit in a side panel rather than on the playground.

| Pattern | Complete | Real | Reachable | Coherent | Transitions | Clear | Minimal |
|---|---|---|---|---|---|---|---|
| Prompt Box | 🟡 | ✅ | 🟡 | 🟡 | 🟡 | ✅ | ✅ |
| Suggested Prompts | ✅ | ✅ | 🟡 | 🟡 | 🟡 | ✅ | ✅ |
| Visible Sources | 🟡 | ✅ | ✅ | ✅ | 🟡 | 🟡 | ✅ |
| Guided Input | ✅ | ✅ | 🟡 | 🟡 | 🟡 | ✅ | ✅ |
| Saved Memories | 🟡 | ✅ | ✅ | ✅ | 🟡 | ✅ | ✅ |
| Word by Word | ✅ | ✅ | 🟡 | ✅ | ✅ | ✅ | ✅ |
| Results in Pieces | ✅ | ✅ | 🟡 | ✅ | ✅ | ✅ | ✅ |
| Visible Working | ✅ | ✅ | 🟡 | ✅ | ✅ | 🟡 | ✅ |
| Stop & Steer | ✅ | ✅ | ✅ | ✅ | ✅ | 🟡 | ✅ |
| Sourced Answer | 🟡 | ✅ | 🟡 | ✅ | 🟡 | ✅ | ✅ |
| Confidence Levels | 🟡 | 🟡 | ❌ | ✅ | ❌ | ✅ | ✅ |
| Answer in Fields | 🟡 | ✅ | 🟡 | ✅ | 🟡 | 🟡 | ✅ |
| Typing Ahead | ✅ | ✅ | 🟡 | 🟡 | ✅ | ✅ | ✅ |
| AI Label | ✅ | ✅ | ✅ | ✅ | 🟡 | ✅ | ✅ |
| Change Review | 🟡 | ✅ | 🟡 | ✅ | 🟡 | ✅ | ✅ |
| Retry & Compare | 🟡 | ✅ | 🟡 | ✅ | 🟡 | 🟡 | ✅ |
| Edit in Place | 🟡 | ✅ | 🟡 | ✅ | 🟡 | ✅ | ✅ |
| Undo & History | 🟡 | ✅ | ✅ | ✅ | 🟡 | 🟡 | ✅ |
| Edit & Resend | 🟡 | ✅ | ✅ | 🟡 | 🟡 | ✅ | ✅ |
| Answer Feedback | ✅ | ✅ | ✅ | ✅ | 🟡 | ✅ | ✅ |
| Approval Gate | 🟡 | ✅ | 🟡 | 🟡 | ✅ | ✅ | ✅ |
| Plan Preview | 🟡 | ✅ | 🟡 | ✅ | ✅ | 🟡 | ✅ |
| Action Log | ✅ | ✅ | 🟡 | ✅ | 🟡 | 🟡 | ✅ |
| Spending Limits | ✅ | 🟡 | ✅ | ✅ | ✅ | 🟡 | ✅ |
| Heads-Up | ✅ | ✅ | 🟡 | ✅ | ✅ | ✅ | ✅ |
| Background Work | 🟡 | ✅ | 🟡 | ✅ | ✅ | 🟡 | ✅ |
| Interruption Limit | ✅ | 🟡 | ❌ | ✅ | 🟡 | 🟡 | ✅ |
| Back to You | ✅ | ✅ | 🟡 | ✅ | ✅ | 🟡 | ✅ |
| Clear Refusal | ✅ | ✅ | ✅ | 🟡 | ✅ | ✅ | ✅ |
| No Good Match | 🟡 | ✅ | ❌ | ✅ | ❌ | ✅ | ✅ |
| After a Mistake | ✅ | 🟡 | 🟡 | ✅ | 🟡 | 🟡 | ✅ |
| Known Limits | ✅ | ✅ | 🟡 | ✅ | 🟡 | 🟡 | ✅ |

**Real examples behind the ✅s:**
- ChatGPT and Claude: streaming, stop and edit.
- Perplexity: partial sources.
- Cursor: per-change accept and reject.
- Claude Code: permission prompts.
- Gemini Deep Research: an editable plan.
- Gmail: nudges.

The 🟡s under **Real** carry over from the first audit: those patterns have weak precedent as visible UI.

## Interaction scorecard

**Scores that are the same for every pattern (left out of the table below):**
- **Discoverability:** 🟡 for all. The State section is in the panel, but nothing says that picking a state pauses the system, and nothing on the stage hints that more states exist.
- **Control:** ✅ for all. Labels in order, the current one marked, buttons reachable by keyboard.
- **Recovery:** ✅ for all. Reset returns to the opening state.
- **Comparison:** ❌ for all. There is no side-by-side view and no quick A/B.
- **Consistency:** 🟡 for all. 1 pattern has Ask and Response, 1 has no data model, 12 move on their own and 20 wait.

| Pattern | Mixing | Flow visibility | Feedback | Main friction |
|---|---|---|---|---|
| Prompt Box | 🟡 | 🟡 | ✅ | Picking a state replaces what you typed |
| Suggested Prompts | 🟡 | 🟡 | ✅ | Typed text replaced on a jump |
| Visible Sources | ✅ | 🟡 | ✅ | Jumps are instant cuts with no "how" line |
| Guided Input | 🟡 | 🟡 | 🟡 | Dates you entered are lost on a jump; 2 dead buttons |
| Saved Memories | ✅ | 🟡 | ✅ | — |
| Word by Word | 🟡 | 🟡 | 🟡 | Forced Streaming freezes half-written, with no Play or Skip |
| Results in Pieces | 🟡 | 🟡 | 🟡 | Forced "Some arrived" never finishes |
| Visible Working | 🟡 | 🟡 | 🟡 | Forced Working freezes; 5 dead buttons |
| Stop & Steer | 🟡 | 🟡 | ✅ | Forced Running freezes |
| Sourced Answer | ✅ | 🟡 | ✅ | "Nothing found" exists only as a jump |
| Confidence Levels | — | ❌ | 🟡 | Four pictures, nothing to do; 6 dead buttons |
| Answer in Fields | ✅ | 🟡 | 🟡 | 10 dead buttons |
| Typing Ahead | 🟡 | 🟡 | ✅ | Forced Typing freezes, so no suggestion ever arrives |
| AI Label | ✅ | 🟡 | ✅ | — |
| Change Review | ✅ | 🟡 | 🟡 | "Stale" can't be caused; 3 dead buttons |
| Retry & Compare | ✅ | 🟡 | ✅ | "Try again" always lands on "Barely different" |
| Edit in Place | ✅ | 🟡 | ✅ | — |
| Undo & History | ✅ | 🟡 | 🟡 | 2 dead Compare buttons |
| Edit & Resend | 🟡 | 🟡 | ✅ | Your edited question is replaced on a jump |
| Answer Feedback | ✅ | 🟡 | ✅ | — |
| Approval Gate | 🟡 | 🟡 | ✅ | Forced Running freezes; the edited time is lost on a jump |
| Plan Preview | 🟡 | 🟡 | ✅ | Forced Running freezes |
| Action Log | ✅ | 🟡 | ✅ | The record is of a run you never made |
| Spending Limits | 🟡 | 🟡 | 🟡 | Forced "Inside the limits" freezes; 4 dead buttons |
| Heads-Up | 🟡 | 🟡 | ✅ | Forced "Nothing to say" never makes its offer |
| Background Work | 🟡 | 🟡 | 🟡 | Forced "Left running" freezes; 4 dead buttons |
| Interruption Limit | ✅ | ❌ | ✅ | 3 of 5 states only as jumps |
| Back to You | 🟡 | 🟡 | 🟡 | Forced "It has it" freezes; 3 dead buttons |
| Clear Refusal | 🟡 | 🟡 | 🟡 | Jumping replaces your typed request; forced Checking spins forever |
| No Good Match | ✅ | ❌ | 🟡 | Opens with nothing to do; 4 dead buttons |
| After a Mistake | ✅ | 🟡 | ✅ | — |
| Known Limits | ✅ | 🟡 | ✅ | Where a limit bites can't be triggered |

**Flow visibility** is 🟡 at best everywhere. Reset re-runs the patterns that move on their own, and the rest can be redone by hand, but nothing can be replayed, stepped through or slowed down.

## Top 5 issues with the states

Ranked by impact on a designer's understanding.

| # | Issue | Evidence | Effect |
|---|---|---|---|
| 1 | **Failure states are mostly switcher-only.** | Response exists on 1 pattern, so failures elsewhere can only be forced. 13 of the 38 switcher-only states are failures. | The designer sees a failure as a picture, never as something that happens to a request they made. |
| 2 | **No loading state in 8 patterns that need one.** | Sourced Answer, Confidence, Answer in Fields, Change Review, Retry & Compare, Edit in Place, Plan Preview, No Good Match | They open on the finished answer, so the most common moment in AI UI (waiting) is missing. |
| 3 | **Jumps are cuts that don't explain themselves.** | The `by` line ("you press Try it") now only reaches screen readers, and there's no transition between frames. | You see the new state but not what caused it, which is half of the pattern's behaviour. |
| 4 | **Three patterns are effectively snapshots.** | Confidence Levels (0/4 reachable), No Good Match (1/4), Interruption Limit (2/5) | The pattern can't be tried, only looked at. |
| 5 | **Gaps between what a pattern decides and what it draws.** | Approval Gate has no Expired state despite its own "timeout does nothing" decision. Saved Memories has no "edit a memory" despite Correct being Required. | A decision is stated but never shown. |

## Top friction in using the State list

Ranked by impact.

| # | Friction | Where |
|---|---|---|
| 1 | **Forcing a moving state freezes it, and Skip disappears.** A forced Streaming, Checking or Running sits still forever with no control to continue. | 12 patterns |
| 2 | **Forcing a state throws away your input.** Typed requests, edited dates and drafts are replaced with canned text. | 7 patterns |
| 3 | **No replay or step-through.** You can't watch loading → streaming → done again at will, slow it down, or step through it. | All |
| 4 | **No comparison.** Two states can't be seen together, even where the difference *is* the lesson (Clear Refusal's refusal vs failure, Confidence's bands). | All |
| 5 | **Inconsistent between patterns.** Some patterns play on their own and some wait. Only one has Response. One is just pictures. | All |
| 6 | **It isn't clear that picking a state pauses the system.** Nothing says it's paused, and only Reset releases it. | All |
| 7 | **Dead buttons are still in the drawings.** About 60 across the 31 patterns not yet redesigned. | 15 patterns |

## Is a state switcher good practice?

| System | How it handles states | What it does well |
|---|---|---|
| **Storybook** (controls, stories, play functions) | One named story per state, controls to vary inputs, and play functions that script an interaction | States are isolated, can be linked to and are testable. Interaction is scripted, but it does exist. |
| **Material Design 3** | Each component has a static spec of its interaction states (enabled, hover, focus, pressed, disabled) | It's complete and comparable at a glance; it's built for visual states, not behaviour. |
| **Apple HIG** | Prose plus short videos of the behaviour in context, with no switcher | It shows how things change over time, in a real screen. |
| **Carbon** (including Carbon for AI) | Usage guidance with state examples, plus live Storybook | Guidance and a working component sit side by side, which helps handoff. |
| **Shape of AI** | A catalogue of real shipped products for each pattern | It's realistic and has precedent, but you can't interact with it. |

**Benefits for a product design team:**
- It's fast to jump straight to the state under discussion.
- It makes a design review complete, because nothing gets forgotten.
- Handoff is clearer, especially if a state can be linked.
- Edge states can be checked without staging the conditions behind them.

**Risks:**
- The switcher replaces trying the pattern; you look at frames instead of causing them.
- It hides transitions, which is where AI UX lives: the wait, the stop, the recovery.
- It shows states out of context: a failure with no request behind it.
- It nudges a team towards designing screens rather than flows.

**Which format fits when:**

| Format | Best for |
|---|---|
| Switcher (jump) | Getting straight to one state in review or handoff |
| Flow or timeline | Understanding behaviour: the order, the forks, how each state is reached |
| Side-by-side grid | Comparing variants whose difference is the point (refusal vs error, confidence bands) |
| Live interaction | Learning the pattern; this should be the default |

**Recommendation.** Keep live interaction as the way in, and turn the State list into a **flow rail**. It already shows the run's order and forks; clicking a state should *play* the route to it at speed (with a Replay and a step control) rather than cut to a frozen snapshot. Add a **Compare** view that lays every state out as stills on demand, using the same renderer as the shelf cards. Give every pattern a **Response** control (Normal / Slow / Fails / Empty) so failures and empty results can be caused. This keeps the speed of a switcher for reviews and handoff, and stops it standing in for behaviour, which is the hub's whole subject.

## Recommended state model for every pattern

1. **Core states every pattern has, each tagged with a `kind`:**
   - `idle`: the starting point, with a starting action.
   - `working`: loading, streaming or progress. Required wherever an answer has to be fetched.
   - `done`: the success.
   - `failed`: something broke.
   - `empty`: nothing came back. Required where a result can be nothing.
2. **Optional kinds, added per pattern:** `refused` · `stopped` · `low-confidence` · `partial` · `needs-you` · `stale`. A pattern adds a kind only when its decisions argue for it, and every decision that names a state must have that state.
3. **Reaching states:**
   - By interacting first: every state must be reachable from the opening state.
   - The Response control makes `failed`, `empty` and slow waits reachable on purpose. A failure still never happens on its own.
4. **Switching:**
   - The rail lists states in run order, forks grouped, each with a small kind label, so "which state am I on?" reads the same on every pattern.
   - Picking a state keeps the user's input wherever the state allows it (`work.for(id, current)`).
5. **Replaying:**
   - Choosing a state plays the route to it at 4× speed by default, and Shift-click cuts straight to it.
   - Next to the rail: ▶ Replay · step ◀ ▶ · 1× / 4×.
   - A paused moving state shows **Paused · Play**, never a silent freeze.
6. **Explaining:** the `by` line ("you press Try it") is visible under the stage again, alongside the state's one-line note.
7. **Comparing:** a Compare toggle replaces the stage with a grid of every state as a still.
8. **Linking:** the URL keeps the pattern and state (`#ai-pattern-graceful-refusal/policy`) for handoff.

## Plan of changes

Small steps, each reversible.

1. **Fix the freeze.** A forced moving state shows Paused · Play, and Skip stays available. *(PatternDetail only.)*
2. **Keep input on a jump.** `work.for(id, current)` keeps typed fields where it can (7 patterns).
3. **Show how you got there.** The `by` line goes back under the stage.
4. **Response on every pattern.** Pattern by pattern, as each is redesigned, which removes most switcher-only failures.
5. **Add the missing states:** loading in 8 patterns, Expired on Approval Gate, editing a memory on Saved Memories.
6. **Replay and step controls** on the State section of the panel.
7. **Compare view:** a grid of stills, using the shelf card renderer.
8. **Kind tags** on every state, with the rail grouping by run order and showing the kind.
9. **Deep links** to a pattern and state.
10. **Checks:** smoke29 fails a pattern whose states can't all be reached by interacting with Response available, a moving state that freezes when forced, or a missing core kind.
