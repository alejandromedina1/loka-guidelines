# Principles & Anti-patterns audit

October 2026. Read-only: nothing in code or data was changed. Sources:

- `src/data/aiPrinciples.js`
- `src/data/aiAntipatterns.js`
- `src/components/ai/antipatterns/index.jsx`
- `src/components/sections/AiPrinciplesSection.jsx`
- `src/components/sections/AiAntipatternsSection.jsx`

Word counts are measured.

## Summary

The writing is the strongest in the hub: arguable, specific to AI, and it names the failures
that get agreed to in rooms with no designer in them. **The problem is that it's two documents
bolted onto a playground.**

- **Principles** are six prose cards with no visual at all, on a hub whose principle is "show me".
- **Anti-patterns** show only the broken half. Each fix is a sentence, even though the hub already
  draws every one of those fixes as a pattern state.
- **The two pages never link to each other.** Anti-patterns link to nothing. Pattern pages link to
  neither page.
- **Principles aren't in search.**

**Headline verdicts:**

| Item | Verdict |
| --- | --- |
| 6 principles | Keep 3, rewrite 3 |
| 7 anti-patterns | Keep, and redesign as broken → fixed pairs, where the fixed half is an existing pattern state |
| Happy-path demo, One-number promise | Merge into the principles they illustrate. Both are process failures that no playground can show. |
| Principles + Anti-patterns views | Merge into one **Principles** view: each principle followed by the ways it breaks and the patterns that fix them |
| Missing anti-patterns | Add 2 with strong precedent: *The unannounced change* and *The decorative citation* |
| Missing principle | Add 1: Initiative is the only aisle with no principle of its own |

## Verdict table

| # | Item | Verdict | One-line reason |
| --- | --- | --- | --- |
| P1 | Most AI isn't a conversation | **Keep** | The hub's most distinctive claim. Specific, arguable, and its inverse is Blank box. |
| P2 | Start from the error you'd rather make | **Change content** | Right idea, but abstract ("three bands — act, review, ignore"). Lead with the One-number example it absorbs. |
| P3 | Gate on consequence, not on confidence | **Keep** | One read, testable, and paired with Rubber stamp → Approval Gate. |
| P4 | Correction is an input, not a complaint | **Change content** | Opens on "When there's no text box…", which confuses on first read. Lead with the verdict. |
| P5 | Never let presentation imply certainty | **Keep** | Three anti-patterns break it, which shows it's load-bearing. |
| P6 | Design every state the model can leave you in | **Change content** | Half generic UX ("design empty and error states"). 9 links make it a catch-all. Narrow it to the AI-specific states. |
| — | The five things a person has to be able to do | **Keep, rename** | The canonical definition of the axes, but pattern pages now call it *What it lets people do*. Use one name. |
| A1 | Confidence theatre | **Change design** | Strong. Show it as broken → fixed (Confidence Levels · Below the bar). |
| A2 | The blank box | **Change design** | Strong. Fixed by Suggested Prompts · Nothing typed. |
| A3 | The rubber stamp | **Change design** | Strong. Fixed by Approval Gate · Awaiting approval. |
| A4 | The feedback void | **Change design** | Strong. Fixed by Answer Feedback · Reason given. |
| A5 | The silent fallback | **Change design** | Strong and very current (search-backed assistants). Fixed by Sourced Answer · Nothing found. |
| A6 | The eternal spinner | **Change content + design** | Generic as written, since spinners aren't AI-specific. Make it about a run with no deadline. Fixed by Visible Working · Stuck on a step. |
| A7 | Sparkle-washing | **Change design** | Real and recognisable. Fixed by AI Label · Label opened. |
| A8 | The happy-path demo | **Merge → P6** | A process failure, true of all software demos, that no UI can show and no pattern fixes. It works as P6's "in the room" line. |
| A9 | The one-number promise | **Merge → P2** | A stakeholder metric, not a screen. It is P2's best example ("94% — which 6%?"). |

**Neither page exists by convention alone.** Both earn their place. But the anti-patterns
page is shaped like the "Don't" column of a style guide, separated from the "Do" it belongs next
to.

## Content scorecard

P = Pass, N = Needs work, F = Fail.

| Item | Clarity | AI-specific | Actionable | Real | Shown | Overlap | Paired |
| --- | --- | --- | --- | --- | --- | --- | --- |
| P1 Not a conversation | P | P | P | P | N — chips only | P | P (A2) |
| P2 Error you'd rather make | N — abstract | P | P | P | F | N — with P5 | N (only A9) |
| P3 Gate on consequence | P | P | P | P | N | P | P (A3) |
| P4 Correction is input | N — opener | P | P | P | N | P | P (A4) |
| P5 Presentation vs certainty | P | P | P | P | N | N — with P2 | P (A1, A5, A7) |
| P6 Design every state | P | N — half truism | N — 9 links | P | N | N — the whole state system | P (A6, A8) |
| Five axes | P | P | P | P | N | N — naming | P |
| A1 Confidence theatre | P | P | P | P | N — broken only | P | N — no links |
| A2 Blank box | P | P | P | P | N | P | N |
| A3 Rubber stamp | P | P | P | P | N | P | N |
| A4 Feedback void | P | P | P | P | N | P | N |
| A5 Silent fallback | P | P | P | P | N | P | N |
| A6 Eternal spinner | P | N — generic | P | P | N | N — with P6 | N |
| A7 Sparkle-washing | P | P | P | P | N | P | N |
| A8 Happy-path demo | P | N — all software | N — a practice, not a screen | P | F — can't be shown | N — with P6 | F — no fixing pattern |
| A9 One-number promise | P | P | N — a pitch, not a screen | P | F | N — with P2 | F — no fixing pattern |

**Real-world grounding.** Every item has precedent, but none says so on the page. Examples worth
citing, where they're public:

- **Decorative citation** — *Mata v. Avianca* (2023): briefs citing cases a chatbot invented.
- **Silent fallback** — retrieval-backed assistants answering from general knowledge when the
  search came back empty.
- **Rubber stamp** — per-step permission prompts in agent tools, approved out of habit.
- **Sparkle-washing** — the ✨ "AI" icon used across most major suites since 2023.

## UX/UI scorecard

| Criterion | Score | Note |
| --- | --- | --- |
| Discoverability | **N** | Both are sidebar views. Nothing on a pattern page points to either, and search indexes anti-patterns but **not principles**. |
| Scannability | **N** | 323 words of principles plus 473 of anti-patterns. The titles scan in a minute; the cards don't. P6 carries 9 chips. |
| Layout | **N** | Principles is a 3-column wall of prose cards, the only page in the AI hub with nothing to look at. Anti-patterns is a 2-column card grid. Neither resembles a pattern page. |
| Interaction | **N** | Principle chips work and open the pattern. Anti-pattern figures are static stills of the mistake with no fixed half. Nothing to press, on a hub where everything else is pressable. |
| Connection | **F** | One-way: principle → pattern. No anti-pattern → principle, no anti-pattern → fix, no pattern → principle. The pairs exist only in a reader's head. |
| Implementation | **N** | Data-driven and shared, which is good. But: the figures shrink with `zoom:.82` while the shelf shrinks via the ramp, giving two ideas of how big a preview is. Counts are hard-coded in copy ("six rules", "Nine named failures"). Stale comments mention "Composed from" and the properties column. `.ai-prin-num` spends blue on a decoration. |
| Hub fit | **N** | It reads as an essay attached to a playground. The vocabulary also drifts: "The five things a person has to be able to do" here, "What it lets people do" on every pattern page. |

## Map: principle → anti-patterns → patterns

| Principle | Breaks as | Fixed by (pattern · state) | Gap |
| --- | --- | --- | --- |
| P1 Not a conversation | A2 Blank box | Suggested Prompts · Nothing typed; Guided Input; Typing Ahead | — |
| P2 Error you'd rather make | A9 One-number *(merge in)* | No Good Match · Nothing above the bar; Confidence Levels | No anti-pattern you can draw |
| P3 Gate on consequence | A3 Rubber stamp | Approval Gate · Awaiting approval; Plan Preview | — |
| P4 Correction is input | A4 Feedback void | Answer Feedback · Reason given; Saved Memories · Correcting one | — |
| P5 Presentation vs certainty | A1 Confidence theatre, A5 Silent fallback, A7 Sparkle-washing | Confidence Levels · Below the bar; Sourced Answer · Nothing found; AI Label · Label opened | **Decorative citation** missing |
| P6 Design every state | A6 Eternal spinner, A8 Happy-path *(merge in)* | Visible Working · Stuck on a step; Stop & Steer | — |
| **— none —** | **Unannounced change** missing | Action Log; Undo & History; After a Mistake | **No principle for acting on your own** |
| **— none —** | (Heads-Up's *Badly timed* state is the anti-pattern) | Heads-Up; Interruption Limit; Background Work; Back to You | **Initiative aisle has no principle** — its 4 patterns are scattered across P1, P2, P3 and P6 |

Coverage check: every documented pattern is under at least one principle (smoke28 enforces
this). Six are under two.

## Missing items, ranked

Only items with clear precedent are listed.

| Rank | Item | Kind | Precedent | Pairs with |
| --- | --- | --- | --- | --- |
| 1 | **The unannounced change** — it edited, sent or filed something, and you found out later | Anti-pattern | Agent tools acting without a visible record; HAX G16 "convey consequences" | Breaks the new P7. Fixed by Action Log, Undo & History. |
| 2 | **Speak first only when it's worth the interruption** | Principle | HAX G3 "time services based on context"; notification fatigue | Heads-Up, Interruption Limit, Background Work, Back to You |
| 3 | **The decorative citation** — sources that look like evidence and don't support the claim | Anti-pattern | *Mata v. Avianca* (2023); citation links that 404 or don't contain the quote | P5. Fixed by Sourced Answer · Source open. |
| 4 | **The apologising persona** — "I'm so sorry, as an AI…" | Anti-pattern | Chatbot apology boilerplate; the hub already bans first-person voice in its own previews | P4 / Clear Refusal |
| 5 | **Over-refusal** — refusing the legitimate request | Anti-pattern | A widely reported complaint about assistants | Clear Refusal (decision 5 already argues it) |

I recommend ranks 1–3 now. Ranks 4–5 are covered by Clear Refusal's own decisions and can wait.

## How established references do it

| Reference | What it does well | Take |
| --- | --- | --- |
| **Microsoft HAX Guidelines** | 18 guidelines grouped by *when* (initially, during interaction, when wrong, over time), each with real product examples | Ground each item in one real example. Grouping by moment matches our aisles. |
| **Google PAIR Guidebook** | Chapters pair a principle with patterns and worksheets | Principle → pattern is the unit. We have the chips; we lack the reverse link. |
| **Apple HIG — Machine learning** | Short topics (Mistakes, Corrections, Confidence, Attribution), each a few lines next to the UI it governs | Brevity. A principle is a statement plus its places, not a paragraph. |
| **Shape of AI** | Patterns first, shown with real screenshots | Lead with the picture. |
| **NN/g** | Named failure modes with a before / after | The pair is the lesson. A "Don't" alone is half of it. |

## Recommended structure

**One view, "Principles"**, replacing Principles + Anti-patterns. The AI hub goes from three views
to two: Patterns and Principles.

```
Principles                                  (SectionHead: one line, no counts)
──────────────────────────────────────────────────────────────
01  Most AI isn't a conversation            statement — 1 line
    Why for AI — 1–2 lines
    When it breaks:
    ┌ Blank box (broken) ┐  →  ┌ Suggested Prompts · Nothing typed ┐   Open it ▸
    └────────────────────┘     └───────────────────────────────────┘
    Applied in: Suggested Prompts · Guided Input · Typing Ahead      (≤ 4)
──────────────────────────────────────────────────────────────
… 02–07
──────────────────────────────────────────────────────────────
What it lets people do                      (the five axes, renamed to match pattern pages)
```

**Final set:**

| Set | Items |
| --- | --- |
| Principles (7) | P1, P2 (rewritten, absorbs One-number), P3, P4 (rewritten), P5, P6 (narrowed, absorbs Happy-path), **P7 Speak first only when it's worth it** (new) |
| Anti-patterns (9) | Confidence theatre, Blank box, Rubber stamp, Feedback void, Silent fallback, Eternal spinner (reworded as "the run with no deadline"), Sparkle-washing, **Unannounced change**, **Decorative citation** |

Each anti-pattern sits under the principle it breaks.

**On pattern pages:** one quiet line at the foot of Decisions — *Puts into practice:
\<principle\>. Avoids: \<anti-pattern\>.* — each a link to that principle on the Principles view.
This is the reverse link that's missing today.

### Content templates

**Principle**

- Title: an imperative, ≤ 7 words.
- Statement: ≤ 20 words, the rule itself.
- Why for AI: ≤ 30 words, what is different from ordinary software.
- When it breaks: its anti-patterns, 1–3.
- Applied in: ≤ 4 patterns, the most direct ones.
- Data: `{ id, title, statement, why, applies[] }`.

**Anti-pattern**

- Name.
- Looks like: ≤ 15 words.
- Real example: one public case or a product category.
- Why it happens: ≤ 20 words.
- Broken figure → fixed state.
- Data: `{ id, name, looks, example, why, breaks: principleId, fixedBy: { pattern, state } }`.
- The "Instead" sentence goes: **the fixed drawing is the instead.**

### Components

| Piece | Build |
| --- | --- |
| Principle row | `.group-head` / `.group-title` plus the statement as `.group-desc`, the same tier the pattern page's blocks use |
| Broken → fixed pair | The broken half is the existing anti-pattern figure. The fixed half is the pattern's own preview at `work.for(state)`, inert and `aria-hidden`, shrunk by the ramp exactly like a shelf card. **No new drawings.** It's two cells like Compare states (`.ai-cmp-cell`). |
| "Open it ▸" | The shared `ShowState`-style button, going to `#ai/<pattern>/<state>`, which already deep-links. |
| Applied in | The existing `.ai-chip`, capped at 4. |
| Pattern-page back-links | A derived lookup (principle `applies` + anti-pattern `fixedBy`), so there is no second list to keep in step. |
| Search | Index principles, the same way decisions now are. |

## Plan, in small steps

1. **Content:**
   - Rewrite P2 (lead with "94% — which 6%?"), P4 (verdict first) and P6 (AI-specific states; ≤ 4
     links; absorb the Happy-path line).
   - Reword Eternal spinner.
   - Add one real example to each item.
   - Remove the hard-coded counts.
2. **Data:** add `breaks` and `fixedBy` to every anti-pattern; split each principle `body` into
   `statement` + `why`. Add a smoke check that every anti-pattern breaks a principle and is fixed
   by a real pattern state, and that every principle has ≥ 1 anti-pattern.
3. **Merge the views:**
   - Principles renders each anti-pattern under the principle it breaks, as broken → fixed.
   - Remove the Anti-patterns view and its nav entry.
   - Search results for an anti-pattern land on its principle.
4. **Back-links** from pattern pages (one line under Decisions), plus principles in search.
5. **New items:** P7 Speak first only when it's worth it; *Unannounced change* (Action Log ·
   Folded away, or Undo & History · Change trail); *Decorative citation* (Sourced Answer · Source
   open). Each needs a broken figure.
6. **Clean up:**
   - Drop the figures' `zoom`, rename the axes block, drop blue from `.ai-prin-num`, fix stale
     comments.
   - Prune dead CSS with `cascade.py` and update smoke28 / 32.
   - Fix the CLAUDE.md notes (the "three exclusive views" decision becomes two).
   - Run the build and restore `dist/`.

---

## Done — October 2026

All six steps were approved and made in one pass.

| Step | What changed |
| --- | --- |
| 1. Content | **P2** leads with "94% — which 6%?". **P4** leads with the verdict. **P6** is now *Unsure, partial and slow are normal*, and absorbs the happy-path line. Eternal spinner is reworded as a run with no deadline. Every anti-pattern has a real `example`. The counts are gone from the copy. |
| 2. Data | Principles are `title / statement / why / applies`, and **every pattern sits under exactly one** (32 across 7). Anti-patterns are `looks / example / why / breaks / fixedBy`, with no `instead`. |
| 3. One view | The Anti-patterns view, its nav entry and `AiAntipatternsSection.jsx` are removed. Principles renders each anti-pattern as a pair: broken drawing next to the fixing pattern's own preview, plus *Try it on <state>*. |
| 4. Links | Each pattern page ends Decisions with *Puts into practice … Fixes …*, and those links land on the anchor. Search indexes principles and anti-patterns by anchor. |
| 5. New items | **P7 Unasked is a higher bar**. **The decorative citation** (fixed by Sourced Answer · Source open). **The unannounced change** (fixed by Action Log · Only what changed things). |
| 6. Clean up | Dropped `zoom`; dropped blue from the sequence number; renamed the axes block. 19 old rules pruned, with 1,424 surviving selectors unchanged per `cascade.py`. **smoke35** added and smoke28 updated. All 11 checks pass, the build passes, and `dist/` is restored. |

**Deviation from the audit:** the template said ≤ 4 patterns per principle. With 32 patterns and
the rule that every pattern sits under a principle, 7 × 4 can't cover them, so the cap is ≤ 6 and
each pattern sits under exactly one principle instead.

Not browser-tested. The pairs' layout and the scroll to an anchor have only been checked as
rendered markup.
