# Content audit — the five sections under the playground

October 2026. Read-only: nothing in code or data was changed. Figures come from scripts run over
`aiPatterns.js` and from rendering every state of every preview with anatomy on. Pixel heights are
estimates taken from global.css, not from a browser.

## Summary

The writing is good: it is specific, argued, and rarely repeated. 0 of 160 control notes are
shared between patterns, only one lead is duplicated, and 134 of 152 decisions link to a state.
**The problem is the frame around the writing.** All five sections sit in identical closed
`<details>` rows under the playground. Two of them repeat what the playground already shows:

- **On other surfaces** prints, word for word, the note the playground shows when you switch
  surface. That is true for 54 of its 64 entries.
- **Composed from** lists the parts the anatomy view already labels.

The other three are the useful ones, and folding hides them without protecting anything — they
are already below the playground.

**Verdicts:**

| Section | Verdict |
| --- | --- |
| When to use it | Change layout |
| Decisions it forces | Keep, and unfold |
| Control & trust | Merge into Decisions |
| On other surfaces | Merge into the playground; delete the section |
| Composed from | Merge into anatomy; delete the section |

The result is a page of three things: the playground, When to use it, and Decisions.

## Verdict table

| Section | Verdict | One-line reason |
| --- | --- | --- |
| When to use it | **Change layout** (plus 2 content fixes) | It answers the first question anyone asks, "is this the one I need?", and is hidden behind a click at the bottom. |
| Decisions it forces | **Keep** content, **change layout** | It is the hub's real value. 134 of 152 decisions already link to a state ("show, don't tell"), but folded, nobody sees them. |
| Control & trust | **Merge** into Decisions | Each grade is a decision with its answer fixed in advance. As a five-chip spec grid it is the most "tell" block on the page, and 36 of its 160 rows say N/A. |
| On other surfaces | **Merge into the playground** — delete the section | 54 of 64 entries already appear verbatim under the stage when you switch surface. The other 10 are "holds", which the surface switch can say in one line. |
| Composed from | **Merge into anatomy** — delete the section | The anatomy view labels the same names on the frame. Its unique content is the links and the 61 optional parts no state draws, and both fit in a parts list beside the anatomy. |

Two of these exist mainly by convention. **Composed from** is the usual separate parts list,
next to an anatomy view that already does that job. **Control & trust** is a house-made spec
sheet laid out like a pattern-library rating grid. Neither is wrong, but neither earns a section
of its own.

## 1. What exists

The same for all 32 patterns. Each section is built once in `PatternDetail.jsx` from data, so
none is one-off per pattern.

| Section | Filled | Contains | Format | Built from |
| --- | --- | --- | --- | --- |
| When to use it | 32 / 32 | 3 Use + 2 Avoid as lead / detail pairs. Exceptions: Clear Refusal 1 + 1, No Good Match 3 + 1. 64–104 words. | Two bordered columns: blue top rule for Use, **red** for Avoid. NumberChip counts. | `.ai-when`, `NumberChip` |
| Decisions it forces | 32 / 32 | 4–6 questions × (verdict · why · "See it on"). 121–250 words. Median verdict 7 words, median why 24. | Numbered term/detail rail (190px). Blue left rule. Play-icon button. | `.ai-dec`, local markup |
| Control & trust | 32 / 32 | 5 fixed axes × grade chip + note. Median note 9 words. 0 missing. | Stacked rows with blue / green / grey grade chips. | `.ai-grades` / `.ai-grade*`, `CONTROL_AXES` |
| On other surfaces | 32 / 32 | Voice + Canvas × verdict (holds / changes / none) + note of 20–34 words. | Term/detail rail. | `.ai-defs` (shared with Principles) |
| Composed from | 32 / 32 | 4–7 Product Hub components, split Always / Optional (97 optional in total). | Pill chips that link to the Product Hub. Optional chips are dashed. | `.ai-parts`, `.ai-chip` |

**Placement and weight.** All five sit in `.pt-more`, 48px under the lab:

- **Closed** (the default): five identical 53px rows with a "+", about 265px against a lab of at
  least 560px. Only Decisions shows a count.
- **Open**: about 330 / 600 / 230 / 140 / 120px. Decisions alone is roughly the height of the
  lab, and all five together about 2.5× the lab.

`PatternDetail` is keyed on the pattern, so every open section closes when you go to the next one.

## 2. Assessment

| Criterion | When to use it | Decisions | Control & trust | On other surfaces | Composed from |
| --- | --- | --- | --- | --- | --- |
| Question answered | "Is this the pattern I need?" | "What do I have to decide, and what's our answer?" | "What must the user be able to do here?" | "Does this hold on voice or a canvas?" | "Which components do I build it from?" |
| How often it's asked | Every visit | Every build | Design review | Only teams shipping voice or canvas | Handoff |
| Changes a design? | Yes — the Avoid column stops misuse | **Most of all** | Yes, as a checklist | Rarely | Yes, at build time |
| Could the playground show it? | Partly. The Avoid items could link to the pattern to use instead. | Already does, through "See it on" | Yes: each axis maps to a state (Stopped, Undo…) | **Already does**: Surface switch plus caption | **Already does**: anatomy labels |
| Overlap | 2 patterns share 4-word runs with Decisions | — | 15 / 160 notes repeat a decision (12 patterns) | **84% verbatim** with the playground caption | Same names as the anatomy labels |
| Specific to the pattern | High. 1 duplicate lead ("Being wrong is expensive"). | High | High (0 shared notes), but the 5 axes are the same everywhere | High | Medium — Tooltip, Toast and Card recur as filler optionals |
| Consistent structure | Yes, except 2 patterns short | Yes | Yes | Yes | Yes |
| Scannable in seconds | Leads, yes. Count chips are noise (always 3 / 2). | Verdicts, yes — once it's open | Chips scan; notes are the content | Verdict, yes | Yes |
| Layout fits frequency | **No** — most asked, most hidden | **No** — the core content sits behind a click | Too heavy for what it adds | Too prominent for a niche question | Wrong place: far from the frame it describes |
| Interaction | Native `<details>`, accessible. Red is spent on "avoid", which isn't an error — against Clear Refusal's own "no red for rules". | "See it on" works: it jumps, scrolls, and marks the state *visited*. Fine. | Leftover dead CSS from the panel accordion (`.ai-grade-top[aria-expanded]`, `[data-open]`) | Nothing to interact with | Chips link out of the hub, with no tie to the frame |
| Implementation | Data-driven, shared | Data-driven. The `shows` links are hand-authored. | Data-driven | `.ai-defs` reused from Principles | `composedOf` is validated against `COMPONENT_LIST` |
| Hub fit | **Not searchable** (`useSearch` indexes none of these sections) | Not searchable | Grade colours add a third palette under the lab | Repeats the playground | Splits anatomy across two places |

**Documentation drift.** `src/components/ai/CLAUDE.md` still says *"There is no Control & trust
section below the lab"* and lists a four-block order. The template renders five.

## 3. Scorecard — pattern × section

**Rules** (P = Pass, N = Needs work, F = Fail):

| Section | Rule |
| --- | --- |
| When | P if 3 Use + 2 Avoid that are real situations. N if short. F if not a situation. |
| Decisions | N if more than 1 decision has no "See it on", or the section is over 215 words. |
| Control | N if a note repeats a decision, or 3 or more axes are N/A. |
| Surfaces | F if both surfaces are already in the playground (the section adds nothing). N if one is. P if it is the only home. |
| Parts | N if 1–2 optional parts are never drawn in any state. F if 3 or more are. |

| # | Pattern | When | Decisions | Control | Surfaces | Parts |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Prompt Box | P | N — 2 unlinked | P | F | N |
| 2 | Suggested Prompts | P | P | P | F | N |
| 3 | Visible Sources | P | P | P | N | N |
| 4 | Guided Input | P | P | P | F | N |
| 5 | Saved Memories | P | P | P | N | **P** |
| 6 | Word by Word | P | P | N | F | F — 4 undrawn |
| 7 | Results in Pieces | P | P | P | N | N |
| 8 | Visible Working | P | N — 217w | P | F | N |
| 9 | Stop & Steer | P | P | N | F | F |
| 10 | Sourced Answer | P | P | N | F | F |
| 11 | Confidence Levels | P | P | P | F | N |
| 12 | Answer in Fields | P | P | N | F | N |
| 13 | Typing Ahead | P | P | P | F | N |
| 14 | AI Label | P | P | N | F | N |
| 15 | Change Review | P | P | P | F | N |
| 16 | Retry & Compare | P | P | P | F | N |
| 17 | Edit in Place | P | P | P | F | N |
| 18 | Undo & History | P | P | P | N | N |
| 19 | Edit & Resend | P | P | N | F | N |
| 20 | Answer Feedback | P | P | P | F | N |
| 21 | Approval Gate | P | N — 6 decisions, 2 unlinked, 223w | P | **P** | N |
| 22 | Plan Preview | P | P | P | N | N |
| 23 | Action Log | P | P | P | F | N |
| 24 | Spending Limits | P | P | P | N | N |
| 25 | Heads-Up | P | N — 250w, longest | N | F | N |
| 26 | Background Work | P | P | P | F | N |
| 27 | Interruption Limit | P | P | N | F | N |
| 28 | Back to You | P | P | N | F | N |
| 29 | Clear Refusal | **F** — "Always" | P | N — 3 of 5 N/A | **P** | F |
| 30 | No Good Match | N — 1 Avoid | P | N | F | N |
| 31 | After a Mistake | P | P | N | F | N |
| 32 | Known Limits | P | P | N | F | F |

**Section verdicts across the hub:**

| Section | Pass / Needs work / Fail | Verdict |
| --- | --- | --- |
| When to use it | 30 / 1 / 1 | Pass on content, Needs work on layout |
| Decisions | 28 / 4 / 0 | Pass |
| Control & trust | 19 / 13 / 0 | Needs work |
| On other surfaces | 2 / 6 / 24 | Fail |
| Composed from | 1 / 26 / 5 | Needs work |

**Coverage behind the Parts column:** 61 of 97 optional parts are never drawn in any state. No
essential part is undrawn.

## Strongest and weakest

| Section | Strongest | Weakest |
| --- | --- | --- |
| When to use it | **Heads-Up** · *Late costs more than now — A price rise caught in March is worth more than one caught in December.* A real situation, with a concrete example. | **Clear Refusal** · *Always — Every AI feature refuses something.* That is a statement, not a situation, and it comes with only one Avoid. |
| Decisions | **Typing Ahead** · *What accepts it? — Tab, and only Tab. Enter belongs to the form; binding both means accepting by accident on every submit.* A verdict you can build, an argument you can repeat, and a state that shows it. | **Heads-Up** · *How often may it speak first? — Rarely enough that somebody notices when it does.* Vague, no state, and its own why says it should be a number. |
| Control & trust | **Typing Ahead · Undo (Required)** · *One undo returns to exactly what they had typed, not to an intermediate.* A testable spec. | **Clear Refusal** · 3 of 5 rows are N/A (*"Nothing happened, so there's nothing to take back"*). Most of the block says the block doesn't apply. |
| On other surfaces | **Heads-Up · Voice** · *Speaking first into a room is the loudest interruption there is, so the bar goes up…* Changes the design. | **Approval Gate · Voice** · *All five answers carry over and matter more.* Restates the page, and there is no drawing to check it against. |
| Composed from | **Saved Memories** · every listed part is drawn in some state, so the list and the anatomy agree. | **Word by Word** · 4 of its 4 optional parts (Spinner, Progress Bar, Card, Toast) are never drawn. A reader can't see where any of them would go. |

## How established libraries handle the same content

| Library | What it does well | Applies to |
| --- | --- | --- |
| **Carbon** | "When to use / When not to use" as short bullets, often naming the component to use instead | When to use — Avoid should point somewhere. Here only 2 of 65 do. |
| **Material 3** | Anatomy is a numbered diagram with its legend directly beside it, never a separate list lower down | Composed from → anatomy |
| **Apple HIG** | "Platform considerations" closes the page, one line per platform, and says "No additional considerations for…" when nothing changes | Surfaces: the "holds" case needs one line, not a row |
| **NN/g** | Guidelines numbered and argued, verdict first | Decisions already does this |
| **Shape of AI** | Short text, with the example doing the work | The playground as hero, which the hub already has |

## 4. Recommended page structure

```
Name + definition                       (unchanged — SectionHead)
┌──────────────────────────────┬──────────────┐
│ Playground                   │ Try          │
│  (caption carries the        │ View         │
│   surface verdict + note)    │  Surface ←── all surfaces, every pattern
│                              │  Show parts ←── parts list when on
│                              │ Found        │
└──────────────────────────────┴──────────────┘
When to use it                          visible, not folded
Decisions                               visible, not folded
   …then "What people can always do"    (was Control & trust)
Pager
```

**In the playground:**

- **Surfaces.** The Surface switch shows on all 32 patterns.
  - A *changes* or *none* surface works as it does today: a second drawing, with its note in the
    caption.
  - A *holds* surface keeps the screen drawing and changes only the caption to
    **"Holds on canvas."** plus its note. Nothing is drawn twice, so the settled rule ("a surface
    is drawn only where the drawing differs") is untouched.
- **Parts.** Rename "Show anatomy" to **Show parts**. When it's on, a parts list appears under
  the toggle:
  - grouped Always / Optional
  - each name links to its Product Hub page
  - hovering or focusing a name outlines that part on the frame
  - parts not in this state are listed under *Not in this state*. This is where the 61 undrawn
    optional parts live.

**Below the playground** — visible, with no `<details>`. The fold protected nothing: the
playground is already above it.

### Content templates

**When to use it**

- Use when: 3 bullets. Each is a real situation (lead ≤ 6 words + detail ≤ 20).
- Avoid when: 2 bullets. Each says **what to use instead**, linked when it's a pattern:
  *"→ Approval Gate"*.
- No count chips. No red: Avoid takes the neutral rule. Blue stays on Use, or the rules go.

**Decisions**

- ≤ 5 decisions. Each one:
  - question
  - verdict, ≤ 12 words, that someone could build from
  - why, ≤ 30 words
  - **See it on <state>**
- A decision no frame can show stays in, but only if its verdict is concrete. A number beats
  "rarely".
- Then **What people can always do** (was Control & trust). Rows on the same rail:
  - Required first, then Recommended. The grade word is the group heading, so there are no chips.
  - Each row: axis · note · See it on.
  - N/A collapses into one closing line: *"Doesn't apply: Interrupt — the check takes under a
    second."*
  - A note that repeats a decision is cut. The decision wins.

### Component approach

| Piece | Build |
| --- | --- |
| Section heads | The house `.group-head` / `.group-title` / `.group-desc`. Retire the local `Section` (`<details>`) and `.pt-sec*`. |
| Decisions + controls | One `DecisionRow` on the existing `.ai-dec` rail. A control row is a decision row whose question is the axis name. |
| "See it on" | One `ShowState` button, used by decisions and control rows. It needs `shows` added to each `controls[axis]`, the same hand-authored link decisions already have. |
| Surface | The existing `PgSegment`, listing every surface. `Drawn` falls back to the screen `Preview` when the verdict is `holds`. |
| Parts list | A panel list under the toggle. Names call `onSelectComponent`. Hover / focus sets a `focus` name on `PartsContext`, and `Part` adds `data-focus`. |
| Search | Index each decision's question and verdict in `useSearch`, so "Tab to accept" finds Typing Ahead. |

## 5. Plan, in small steps

1. **Content only**:
   - Rewrite Clear Refusal's When (situations, not "Always"; a second Avoid).
   - Add a second Avoid to No Good Match.
   - Make every Avoid name its alternative where one exists.
   - Trim the decisions on Heads-Up (and give its rate a number), Visible Working and Approval
     Gate.
   - Link Prompt Box's and Approval Gate's two unlinked decisions to states.
   - Cut the 15 control notes that repeat a decision.
2. **Surfaces into the playground**: the switch on all 32, the holds caption, delete the section.
   Update smoke27 / 29.
3. **Parts into anatomy**: rename the toggle, add the parts list with hover-to-highlight, delete
   the section. Update smoke28.
4. **Merge Control & trust into Decisions**: add `controls[axis].shows`, the shared `DecisionRow`
   and `ShowState`, the N/A line.
5. **Unfold**: `.group-head`, drop the count chips and the red rule, remove `.pt-sec*`.
6. **Clean up**:
   - Add search indexing.
   - Prune dead CSS (`.ai-grade*`, `.ai-surf-verdict`, `.ai-parts*`, `.pt-sec*`; check
     `.ai-chip` / `.ai-defs` against Principles first), with `cascade.py` before and after.
   - Fix the CLAUDE.md drift.
   - Run all smoke checks and the build, then restore `dist/`.

---

## Done — October 2026

All six steps were approved and made in one pass.

| Step | What changed |
| --- | --- |
| 1. Content | **Clear Refusal**: 3 real Use-when situations and 2 Avoids, replacing "Always". **No Good Match**: a second Avoid. **18 avoids** now name the pattern to use instead (`instead`). **Heads-Up**: the rate is a number (three a week, matching Interruption Limit), and two long whys were trimmed. **Approval Gate**: 6 decisions merged to 5, with the timeout folded into "saying no — or saying nothing". **Visible Working**: trimmed, and its last decision linked. **Prompt Box**: the vague-request decision now has a drawing — the submitted frame names its assumption ("Assuming last month means 1–31 March"). |
| — correction | The audit's "15 control notes repeat a decision" was a count of shared three-word runs, and 9 of those were coincidences ("the first word"). **6 real repeats** were rewritten: Answer in Fields · Verify, AI Label · Inspect, Edit & Resend · Correct, Heads-Up · Inspect, Back to You · Inspect, No Good Match · Inspect. |
| 2. Surfaces | The Surface switch is on all 32 patterns. A holds surface keeps the screen drawing, and the caption says "Holds." with its note. The section is deleted. |
| 3. Parts | "Show anatomy" is now **Show parts**, with a parts list under it: Always / Optional, each name linking to the Product Hub, pointing at a name outlines that part on the frame, and *Not in this state* where a part isn't drawn. The section is deleted. |
| 4. Control & trust | Now the last group of Decisions: *What it lets people do*. Graded axes are rows with the grade in words, N/A axes are one line each, and **54 axes link to a state**. |
| 5. Unfold | Two open blocks on `.group-head`. The NumberChip counts are gone, and so are the red and blue rules on Use / Avoid. |
| 6. Clean up | Decisions are searchable (`patternKeywords`). 29 dead rules were pruned, with 1,442 surviving selectors unchanged per `cascade.py`. `.ai-dec-shows` gained the focus style it never had. CLAUDE.md drift fixed. **smoke34** added; smoke25 / 28 / 29 updated. All 10 checks pass, the build passes, and `dist/` is restored. |

Not browser-tested: the parts-list hover, the holds caption and the open page rhythm have only
been checked as rendered markup.
