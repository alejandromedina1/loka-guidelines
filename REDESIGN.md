# AI Patterns — redesign

October 2026 · Diagnosis approved, with the three simpler options. The template, the framework and the first pattern (Clear Refusal) are built. **Waiting for review before the next pattern.**

## How this was measured

Every pattern's preview was driven programmatically, starting from its opening state. The script pressed every live control, typed into every live field and let the timers run. It counted:

- **opens**: things you can do in the first frame
- **reached**: states you can get to by *interacting*, not by picking one from the list
- **dead**: buttons that look real and do nothing
- **dead fields**: text fields that look typeable but aren't
- **words**: the most visible words in any one frame

## Problems in every pattern

These are failures of the shared lab and kit, not of any one pattern. Fixing them is the template (step 2).

| # | Problem | Evidence |
|---|---|---|
| H1 | **No pattern takes your own input.** Every answer is canned, so typing something different changes nothing. | No preview reads what you type to build its output. Nothing varies between runs. |
| H2 | **No obvious first action.** Nothing marks where to start. There's no "Try it", and the first live control looks the same as the dead ones. | 7 patterns open with no control at all. |
| H3 | **Timed playback in place of actions.** Several patterns play out on a timer while you watch, and none can be skipped. | Word by Word, Results in Pieces, Visible Working and Heads-Up open on a timer with nothing to press. |
| H4 | **Most states can only be reached from the state list.** | Only 7 of 32 let you interact your way to every state. Failure states are deliberately never reached by interaction. |
| H5 | **Dead controls are still drawn.** They're marked inert now, but they still compete with the live ones. | 69 dead buttons across all states, plus 5 dead text fields. |
| H6 | **No product-screen view and no mobile width.** Every frame is an isolated wireframe at one fixed width. | Neither control exists. |
| H7 | **The state switcher is a list in the side panel, not a segmented control near the demo,** and it sits next to five grade rows. | Panel layout. |
| H8 | **Too many sizes inside a frame.** The kit uses four text sizes (title, body, meta, micro), plus uppercase micro-labels and mono timestamps. | `--pv-*` ramp. |
| H9 | **Too much on the page besides the playground.** The whole page shows open below the lab: When to use, Decisions, On other surfaces, Composed from. | About 450 words per page, none of it collapsed. |

## Problems in each pattern

Worst first. This is the order I'll redesign them in after the template is approved.

| Pattern | Why it isn't intuitive today |
|---|---|
| **Clear Refusal** | Nothing to do: four tabs, no input, 8 dead buttons. You can't ask for something and watch it be refused. |
| **Confidence Levels** | Nothing to do: tabs only, 6 dead buttons. You can't give it a case and see the confidence change. |
| **No Good Match** | Opens with no action. 3 of 4 states can only be reached from the list, so you never cause "nothing above the bar" yourself. |
| **Interruption Limit** | Only 2 of 5 states can be reached by interacting. It reads as a dashboard you study (85 words), not something you use. |
| **Answer in Fields** | 10 dead buttons. "Needs checking" and "Not found" only come from the list. Nothing can be extracted from a receipt you choose. |
| **Visible Working** | You only watch: no input, 5 dead buttons. "Long run" and "Stuck" can't be caused. |
| **Edit in Place** | The "say what to change" field is dead, so the pattern's key action is the one you can't do. |
| **Stop & Steer** | The steer field is dead. You can stop it but not actually redirect it in your own words. |
| **Background Work** | 3 of 5 states reached, 4 dead buttons. "Waiting on you" and "Failed while away" need the list, and leaving the tab is only implied. |
| **Change Review** | 3 dead buttons. "Nothing to change" and "Stale" come only from the list, and nothing changes the record underneath you. |
| **Sourced Answer** | Nothing to ask. "Partly sourced" and "Nothing found" come only from the list. |
| **Visible Sources** | "Nothing in scope" is reachable, but "Editing scope" isn't, and what to do first is unclear (tick a box? build?). |
| **Known Limits** | It reads like a settings page (63 words). Where a limit bites can't be triggered by trying it. |
| **Suggested Prompts** | The page-aware and "nothing worth suggesting" states can't be reached. Picking a suggestion runs nothing. |
| **Word by Word** | Plays itself on open. You can't ask, can't skip, and "Connection lost" comes only from the list. |
| **Results in Pieces** | Plays itself on open with nothing to ask or retry, and "One piece failed" comes only from the list. |
| **Heads-Up** | Opens on a 2.8-second wait with nothing to press, its fields are dead, and "Badly timed" comes only from the list. |
| **Spending Limits** | 4 dead buttons. Hitting the limit happens to you on a timer, and you can't set the ceiling yourself. |
| **After a Mistake** | Up to 89 words per frame, and "Can't be put back" comes only from the list. It needs reading to follow. |
| **Back to You** | 3 dead buttons, up to 70 words, and "Handed back stuck" comes only from the list. |
| **Action Log** | It's a record of a run you never made, so there's nothing to cause. "Something's missing" comes only from the list. |
| **Retry & Compare** | Its "Another, but…" field is dead. "Two side by side" can't be reached by interacting (Try again lands on "Barely different"). |
| **Answer Feedback** | Its optional comment field is dead, and "Reported" needs the Harmful reason, which is easy to miss. Otherwise clear. |
| **Plan Preview** | It works, but 59 words on open and "Step failed" comes only from the list. |
| **Approval Gate** | It works. "Failed midway" comes only from the list. One dead button (See the unpaid). |
| **Undo & History** | Every state can be reached, but 2 dead buttons (Compare) and a dense trail (63 words) slow the first read. |
| **Typing Ahead** | Clear and typeable. "Nothing to suggest" can't be caused, and the suggestion is canned, not based on what you typed. |
| **Guided Input** | Live fields, but 2 dead buttons, and the conflict state can't be caused by entering conflicting dates. |
| **Prompt Box** | Live and typeable. "Over limit" needs 240+ characters that you'd never type, and Send produces no answer. |
| **Saved Memories** | Every state can be reached, but it opens on a message you didn't send. Telling it something new doesn't save it. |
| **AI Label** | Every state can be reached, but the "edit" is a button press, not editing the text yourself. |
| **Edit & Resend** | Every state can be reached, but the edited question is fixed. Whatever you type, the answer is the groceries one. |

## Where the brief conflicts with decisions already in the codebase

These are noted so you can rule on them. I won't relitigate them silently.

1. **Failures reachable by interaction.** The hub's notes say a failure must never happen on its own timer, because that teaches that breaking is normal. The brief wants every state reached through interaction. **Simpler option:** a quiet "Simulate: fail / slow / empty" control in the playground. You cause the failure; it never just happens.
2. **Voice and Canvas surfaces vs a "product screen" view.** The brief's in-context toggle is a third axis. **Simpler option:** keep Screen / Voice / Canvas where they exist, and make "In context" a separate toggle that wraps the screen drawing in a realistic page.
3. **Grades panel.** The brief's template has no slot for the five Control & trust grades. **Simpler option:** move them into the collapsed section below the playground.

Ruling: all three simpler options approved.

## Step 2: the template and framework (built)

One page layout for all 32 patterns (`PatternDetail.jsx`). The patterns not redesigned yet render in it with their current previews.

| Piece | What it is |
|---|---|
| Title + line | Unchanged: the pattern's name and its one-sentence definition. |
| State strip | A quiet segmented control above the playground holding every state, grouped by position. It's a shortcut; the redesigned playgrounds reach each state by being used. |
| Playground | Centred and full width, with nothing beside it. The 260px side panel is gone. |
| One line | What the state on the playground is (or, on Voice / Canvas, what changes there). |
| Tools | Quiet, and each present only when it has something to do. Left: Surface · Isolated / In product · Desktop / Mobile. Right: Response (Normal / Slow / Fails) · Skip (while anything is moving) · Show anatomy · Reset. |
| Folded below | Native disclosures, all closed by default: When to use it · Decisions it forces · Control & trust · On other surfaces · Composed from. Then the Previous / Next pager. |

**Framework pieces:**
- `previews/mock.js` is the offline "model". It classifies what was typed, varies the wording by input, and waits 650ms (2.6s on Slow). Fails is the only way to get a failure.
- `Ask` in the kit is the starting action: the request already typed in, a primary **Try it**, one-tap examples, and Enter submits. It marks Input Field and Button for anatomy.
- `ProductScreen` is the In product view: side navigation and a page heading, with the frame's window chrome dropped. It folds to a top bar at mobile width.
- Anatomy now names each part on its outline instead of numbering it against a legend.

**Visual:**
- The page uses three sizes: the section title, 15, and 13.
- Inside the playground the frame ramp is pulled onto 15 / 13, and library controls are scaled so their labels land on 13.
- Chosen states are a ring, not a fill. Blue appears only on the playground's primary action and on focus.

**Revision: one control per kind of choice.** After review, the tool bar's pills were replaced, because a choice, a mode and an action had all looked identical:

| Kind | Tools | Control |
|---|---|---|
| Pick one of several | the state strip, Surface, Response | The library's **Tab** pill, at the strip's size. Arrow keys, Home and End move between tabs, and each strip is one Tab stop. |
| One thing or the other | Isolated ◯ In product, Desktop ◯ Mobile, Anatomy | The library's **Toggle Switch**, with both outcomes named either side. Clicking a name works too. |
| Something you do | Skip, Reset | The library's **Button** (Secondary). |

The Toggle Switch only existed inside its Product Hub preview, so it moved to `common/ToggleSwitch.jsx`, and that preview now renders it (still one implementation). Tab and switch get dark-theme values scoped to this page only; the Product Hub's own rendering is unchanged.

**Revision 2: fewer controls at once.** The bar under the playground held six groups (three switches, two tab strips, two buttons), plus the field, Try it and five examples inside the frame. Now:

- **Always visible:** the state tabs above the playground, and **Reset** below it, plus **Skip** while something is moving.
- **Behind one button:** View options opens a panel with Surface, Context, Width, Anatomy and Response. The button names any setting that isn't at its default ("View options · Mobile, Fails"), so nothing changes the demo silently. Escape or a click outside closes it.
- **Inside the playground:** the example pills appear before the first run only.
- **Check:** smoke28 fails if more than three controls show in the bar.

**Revision 3: a properties panel.** The playground is a `.pg` lab again, the Product Hub's own layout, with the stage on the left and a 260px panel on the right. It follows the reference panel's sections, label / control rows and full-width segmented tracks:

- **Header:** "Playground", with **Reset**, and **Skip** while something is moving.
- **State:** every state as a selectable row. A fork's alternatives share a rule down their left edge, so order and branching read together. The tab strip above the playground is gone.
- **View:** Surface and Context (Isolated | In product) as segmented tracks; Device (Desktop / Mobile) as the Product Hub's own icon toggle; Show anatomy as its toggle.
- **Response:** a dropdown (Normal / Slow / Fails).
- **The stage** holds only the pattern and its one line.

The panel's rows are the Product Hub's own controls (`PgIconToggle`, `PgToggle`, `PgSelect`). The library had no text segmented row, so `PgSegment` was added beside `PgIconToggle`, sharing its paint. The popover and the tool bar are removed (27 rules; all 1,444 surviving selectors unchanged). smoke28 now fails if a playground control appears on the stage.

**Checks:** smoke27, 28, 29 and 32 were updated for the template, and smoke28's dead-CSS check now covers the new `pt-` classes too. 40 rules from the old lab were removed. The winning declaration of all 1,427 surviving selectors is identical before and after.

## Step 3: patterns, worst first

### 1. Clear Refusal (done)

- **What changed:** it was four tabs of pictures with 8 dead buttons. Now you ask. A real request is pre-filled with **Try it**, and five one-tap examples lead to the four refusals and to one request that goes ahead. Anything typed is classified ("send Sam £50" is a rule, with Sam and £50 carried into the held payment).
- **Why:** you cause a refusal instead of being shown one, and every button does what it says. The way forward produces a real result, and "This looks wrong" files the report and says so.
- **Failure:** Response: Fails turns the same request red ("That didn't go through · Nothing was sent"), so a refusal and a failure can be compared side by side. That contrast is the pattern's point.
- **States:** 4 → 8 (Ready, Checking, Went ahead, the four refusals, Something broke). All 8 are reachable by using it.

**For your review:**
1. The examples stay visible under the field after a result, so the next kind of refusal is one tap away. The cost is five pills above the result.
2. The 15 / 13 frame ramp applies to every pattern, including the 31 not yet redesigned, so their wireframes look flatter until each gets its pass.
3. Next in order is **Confidence Levels**.
