# Loka Guidelines — working notes

An interactive documentation site for Loka's brand and product interface. React 18 + Vite, no
test framework, no TypeScript. `npm run dev` / `npm run build`.

## Three hubs

The landing is a choice between three panels; entering one swaps the sidebar and mounts only that
hub's sections. The split is navigational, not decorative — nobody should scroll past another
audience's material to reach their own.

| Hub | Contains | Shape |
| --- | --- | --- |
| **Brand Hub** | Logo, Color, Typography, Spacing, Icons, Graphics, Patterns (background motifs), Imagery | A run of stacked sections |
| **Product Hub** | ~40 components | One section, one playground, sidebar swaps the canvas |
| **AI Patterns** | Pattern shelf + Principles + Anti-patterns | Three **exclusive views**, sidebar swaps which is mounted |

`src/data/navigation.js` is the single source for all of it — nav model, per-hub sidebar lists,
scroll-spy targets, and which hub owns a section. The search index (`useSearch.js`) is built from
the same model, so anything added to nav is findable.

## House vocabulary — reuse before inventing

Almost nothing in this project should need a new layout class. Check for an existing one first.

- **Sections**: `.section` > `SectionHead` (title + description, two columns)
- **Tiers**: `.sub-head`/`.sub-title` for nav sub-sections, `.group-head`/`.group-title`/`.group-desc`
  for groups inside one. `.section-eyebrow` for a small uppercase label.
- **Labs**: `.pg` = `minmax(0,1fr) 260px`. Left: `.pg-stage` > `.pg-canvas` > `.pg-canvas-nav`
  (state readout + `.pg-arrow` cycling) + `.pg-canvas-center` + `.pg-canvas-foot`
  (`.canvas-variants` pills + `.pg-viewcode`/`.pg-code-copy`). Right: `.pg-controls` >
  `.pg-ctrl-head` + control rows (`PgToggle`, `PgSelect`, `PgRange`) + `BestPracticesPanel`.
- **Empty state**: `.pg-empty` — the playground's own "not built yet", used by both hubs.
- `--radius: 0px` on containers; `999px` pills for chips.

Every hub's interactive surface is a `.pg` lab. If something new needs a layout, it probably wants
one of these.

## Component reuse

`src/components/common/` holds the real components: **Button**, **Field**, **Tag**, **Tab**,
**NumberChip**. A component owns its own box spec (`TAG_PAD_X`, `NUMBER_CHIP_BOX`) so the
redlines and the rendered thing can't disagree; `data/components.js` owns only the playground's
option *labels*. Don't give the two the same name — `TAG_SIZES` already means `[20,24,28]` in one
file and `["20px",…]` in the other, which is why the chip's are `NUMBER_CHIP_SIZES` and
`NUMBER_CHIP_SIZE_OPTIONS`. Both the
Product Hub playground and the AI Hub previews render them — there is exactly one implementation
each, and that is deliberate. `buttonStyles.js` still owns Button's styling because it also
generates the specs, rules and copyable snippets.

Anything that needs a control should import from `common/`, not draw its own. If the library
doesn't ship what's needed, say so rather than inventing it silently — that's how the
**Destructive** button variant came to exist (red-10/red-11 from the semantic ramp, AA-checked).

## AI Patterns hub

**Thesis: show more, tell less.** A pattern is a behaviour over time, not a rendered element, and
each one encodes a product-owned policy. That's why it's a pattern library and not a second
component library.

- `src/data/aiPatterns.js` — the taxonomy. 6 categories, 24 entries (14 documented), `status: documented | planned`.
  A documented entry carries: `definition`, `states[]` (each with a `note`),
  `useWhen`/`avoidWhen` as `{lead, detail}`, `decisions[]` as `{q, loka, why, shows?}` — `loka`
  is the verdict (≤16 words, median 8), `why` is the argument for it, and `shows` names the
  state that demonstrates it,
  `controls` graded on five axes, `composedOf` (must resolve against `COMPONENT_LIST` in
  `src/data/components.js`) and `optionalParts` (a subset of it).
- `src/components/ai/previews/` — one preview per pattern, pure `({ state, ideal })`. `kit.jsx`
  is the shared wireframe kit; `index.js` is the registry.
- `src/components/ai/antipatterns/` — one wireframe per anti-pattern, same kit and ramp.
- `aiPrinciples.js` entries carry `applies: [patternId]`, rendered as chips that open the
  pattern. Documented patterns only — a chip landing on an empty canvas teaches the opposite.
- **A preview is a product screen, and it has to look like one.** Three rules, each of which was
  being broken:
  - **No frame is titled "Assistant".** Every frame names a real surface — *Churn analysis · Q3*,
    *New analysis*, *Contract review · Northwind MSA*. Three previews were generic assistants while
    their content was already product-shaped, which made the patterns most associated with chatbots
    look like they needed one.
  - **No first-person model voice.** A product that isn't a chatbot has no "I". Clear Refusal used
    to say *"I can't draft this one"* — contradicting its own first decision, that refusal copy comes
    from the product and not the model. It now says *"Performance reviews go through People Ops"*.
  - **No caption that explains the pattern.** Thirteen wireframes carried the rationale painted onto
    the illustration, each duplicating the state note two inches away in the panel. The test: would
    a real product ever print this sentence? *"Tab to accept"* yes; *"Step-level progress, because
    step-level failure is possible"* no. Watch `Note` bodies especially — four of them had a good
    product-copy title over an argument.
- **The preview ramp** lives on `.mk-frame` in global.css: `--pv-title/body/meta/micro/gap/pad`
  plus `--pv-sys`, the one factor that scales Button/Field/Tag onto that ramp. A preview is an
  illustration of a screen, not a rendering of one. **Nothing inside a frame sets a literal size.**
- **The state is an output, not an input.** This is the third answer and the
  first one that is a playground. A pill strip, then a track with Play, then live
  controls that jumped between canned frames — all three made the lifecycle state
  the *input*: you chose "Nothing in scope" and the frame was fetched from it.
  Now a preview is handed the surface's real working data and renders only that,
  and the canvas **derives** which state the pattern is in. "Nothing in scope" is
  what it is called when you have switched the last account off, and there is no
  other way to be in it.
- **The `work` protocol**, a static on the preview component:
  `work.for(stateId)` — a surface that reads as this state, so tabs, the
  decisions' "See it on …" links and Start over aren't lying about where they put
  you. `work.state(w)` — which state this data is in; the caption, the panel and
  the tabs all read it, so the data is the single source. `work.tick(w)` —
  `{ work, in: ms }` or null, the system's own half: the wait passing, the words
  arriving, the four cards landing one at a time.
  **`for`/`state` must round-trip for every state** (smoke29), and `tick`
  replaced the `auto` flag the states carried — a flag could only say "and then
  this state happens", which is a jump cut.
- **A failure is never on the tick.** Connection lost, Failed midway, One piece
  failed and Stale are reachable, but only by tabbing to them: a wireframe that
  breaks on its own teaches that breaking is the ordinary course.
- **A lag is not a failure, and Results in Pieces lags on its opening run.** Two
  figures land, the third says it is still going, five seconds later the page
  finishes. It was briefly kept off the timer with the failures, which misread
  its own state note — *"the slow one says so in its own space rather than
  holding the other five hostage"* is the pattern working. A run where all four
  land smoothly demonstrates nothing: that is a fast page, and a fast page has no
  reason to reveal in pieces. The rule is the asymmetry — **a lag resolves, a
  failure waits for somebody**.
- **Two patterns carry no `work`, and that is the answer for them.** Confidence
  Levels and Clear Refusal are sets of outcomes, not behaviours — four kinds of
  refusal that never follow one another — so the tabs are the whole control.
  A "builder" was turned down for Confidence for the same reason ghost capability
  chips were: a preview that configures is not a preview.
- **The previews hold no state.** `work` lives in PatternDetail, which is what
  lets the frame survive its own data changing — and is why it is **not keyed on
  the state when there is a surface**: typing the first character moves Prompt Box
  from Empty to Composing, and a key would unmount the field mid-keystroke.
  Without a surface the key stays, because a tab really is a swap.
- **Tabs, at forks only.** The variants at the position you are standing in, and
  nothing about the order of positions. A position holding one state shows its
  **name**, so the appearance of tabs is itself the signal that the pattern forks.
  **Start over** resets the surface and releases the system — a tab holds it,
  because you asked to look at that one.
- **The caption sits at the top, centred; the wireframe is centred under it.** It
  reads before the frame because it names it, and shares its axis — left-anchored,
  the only element in the lab with a width of its own drifted sideways every time
  a state label changed length. The two chrome bands are held to one height
  (`--ai-band`, 56px) because that equality is what puts the wireframe on the
  canvas's *true* centre. The frame is centred by `.ai-swap`, not by `.mk-frame` —
  the anti-pattern figures use the same frame in a column where left is correct.
- **Colour is never the only signal, in the wireframes too.** Three kit
  components were breaking that and all three were shared, so they were one bug
  about to be copied into every pattern added next: a `Steps` dot carried
  done/running/held/failed as a fill, a diff row carried before/after as a fill,
  and Inline Suggestion drew its suggestion in a mirror that is hidden from
  assistive tech. Each now carries the word in a `.vh` span — hidden, because
  four "Done" labels down a wireframe is noise on screen and the only signal off
  it. `Diff` is a kit component now for the same reason; two previews were
  hand-rolling it.
- **A live region holds a sentence, never a control.** `aria-live` on the canvas
  caption wrapped the tab strip, so every change re-announced a group of buttons
  along with the state. It is its own hidden node now.
- **A control that does something is a real control; one that doesn't stays out of
  the tab order.** Live controls take the documented hover and press states, and
  everything reachable carries a name. That split is also the honest signal for
  which parts of a wireframe this playground implements. The caption is
  `aria-live`, because half the moves are the system's.

- **Surfaces go on the pattern; they are not categories.** `surfaces` carries an
  answer for **Voice** and **Canvas** on every documented pattern —
  `{verdict, note}`, where verdict is `holds` / `changes` / `none` and the note
  is what replaces the answer. Rendered as **On other surfaces**, after Decisions
  and before Composed from, on the Principles page's 190px rail so the verdict
  reads straight down the left margin.
  Voice and canvas were proposed as **categories** and turned down: the six
  categories are *phases* of an interaction and these are *surfaces*, so a
  seventh and eighth aisle would put the shelf on two axes — somebody whose voice
  product has a broken-feeling wait would have to choose between Waiting &
  Progress and Voice, and the answer is both. It also forks the library, since
  most decisions carry.
  The field is the hub's own claim being checked rather than assumed. Measured:
  **45% of the 62 decisions are worded for a screen** and 7 of 14 definitions name
  a visual thing, but the split is uneven — Approval Gate, Clear Refusal, Change
  Review, Undo & History and Plan Preview run 1 visual decision in 5, Prompt Box
  and Sourced Answer run 4 in 5. **The phases hold everywhere; the answers
  don't**, and saying which is the content. Current spread: voice 8 changes / 4
  none / 2 holds, canvas 8 changes / 6 holds. smoke27 fails if any surface
  collapses to one answer — all-`holds` would make the field decoration, all-
  `none` would mean the hub really is a screen library.
  The screen isn't listed: every preview draws it.
- **The surface strip offers only a second drawing.** A control appears exactly
  when it has something to do — the same rule the state tabs follow (forks only)
  and Start over follows (only with a road behind you). Two surfaces are never
  offered: one the pattern **holds** to, where the tab would re-render the
  identical frame, and one whose wireframe **isn't built yet**, where it would
  land on "not drawn". 25 of the 28 were one or the other, so that was most of
  the strip. All 20 are drawn now, so it appears on 12 of the 14 — Approval Gate
  and Clear Refusal carry to both surfaces unchanged and answer in words alone.
  **The block below the lab still
  answers for every surface** — the strip's absence means nothing to *draw*, not
  nothing to say.
- **A surface is drawn only where the drawing differs.** `Preview.surfaces =
  { voice, canvas }` — a static beside `work`, and the canvas foot carries a
  Screen / Voice / Canvas strip (`.canvas-variants`, the Product Hub's own
  control, because it does the same job). `holds` gets **no** variant: the screen
  drawing *is* the answer and a second would contradict the verdict, so the
  presence of a variant is itself the signal that something changed. smoke29
  fails a pattern drawn twice for one answer. `none` still gets a drawing — of
  the handoff that happens instead, because an absence drawn as an empty box
  teaches nothing. Built: **16 drawings + 4 absences**, not 28 and not the 132
  that drawing every state on every surface would be. The absences are Results
  in Pieces, Sourced Answer, Structured Output and Change Review on voice — each
  drawn as the handoff that happens instead.
- **A variant runs off the pattern's own `work`.** One lifecycle, several
  drawings — Streaming's `at` is characters on screen and words out loud without
  changing. That identity is the demonstration that the phases carry, so it is
  structural rather than claimed, and smoke29 renders every variant against every
  state of its pattern.
- **A voice drawing is ONE MOMENT on a stage, not a log.** Two attempts here and
  the first was wrong: a turn timeline — both parties on a rail, gaps labelled
  with their durations — avoided speech bubbles and was **still a transcript**,
  because it drew the record of an exchange rather than a picture of a product.
  Somebody talking to a speaker never sees their conversation listed; they see
  one thing that is alive and a line of words. It also broke the model every
  other preview follows — a screen preview draws **one state** and the lab walks
  between them, and the timeline drew all five at once, which is what Play was
  removed for.
  `voice.jsx` is a dark stage, an **orb** with a mood, what it heard, what it is
  saying, and the one control the device really draws. The wait doesn't need a
  segment labelled 420ms; it needs the orb to sit in `thinking` for 420ms, which
  the tick already does.
  Three rules, all enforced by smoke29: **the mood is also a word** (motion and
  colour die in a screenshot, under reduced-motion and in a screen reader, so the
  caption says it — which is what a device prints anyway); **every mood differs
  with motion off** (size, brightness or ring, never rate alone); **no persona** —
  the device is named for what it is, which is *"no frame is titled Assistant"*
  on the surface where a frame has no title.
  **It is on the theme.** The stage was a near-black slab for a pass, on the
  argument that an ambient device sits in a room — and it was an alien in the
  middle of a light page. A preview is a wireframe of *our* product, not a
  photograph of somebody's speaker, so it is `--bg` and the theme's rungs like
  every other frame; smoke25's check is inverted to guard that, and fails a hex
  in any of the stage's own text rules.
  **The orb is lit with the brand's own blue** — `var(--blue)` into blue-60, and
  the bloom is `rgba(25,87,244,…)`, the same glow `.ccard` blooms on hover, held
  rather than triggered. Only the orb's two ends are tuned per theme, because a
  bloom that reads as warm on white disappears on near-black. Not the purple
  every voice assistant ships: that is their signature, and borrowing it would
  make this a picture of their product.
  **The controls are the real Button.** A bespoke `.vc-say` sat on the stage for
  a pass and was a second button in a project whose whole argument is that there
  is one.
- **If a seventh category is ever added, it goes on the phase axis.** The one gap
  the six don't cover is *who started the interaction* — all six assume the user
  asked. That is where ambient belongs (Initiative & Attention), not a Voice
  aisle.

### Settled decisions — don't re-litigate

- Patterns are the core; Principles and Anti-patterns are supporting Reference views.
- The three AI views are exclusive. Stacked, anti-patterns read as *that pattern's* anti-patterns.
- The section heading is the pattern's name and its description is that pattern's definition —
  so neither appears in the properties panel.
- Lifecycle and Failure modes blocks were **cut**: the states on the canvas replaced the first,
  the failure states replaced the second, and the fork-shaped remainder became Decisions.
- Both hubs reveal the sidebar category holding whatever is on their canvas; that behaviour is
  shared, not AI-only.
- Two-column term/detail lists all run one rail: `190px 1fr`, `gap: 24px`.
- **Grade chips are three codes: blue Required, green Recommended, grey N/A.** Blue is what the
  system spends on "this matters". Green is the only semantic ramp meaning *good practice* —
  Amber is documented for caution and warnings, and it fails AA at every weight that still
  reads as amber (amber-11 on amber-02 is 4.36:1). Grey for N/A is deliberate: it's the absence
  of an obligation, so a hue would make it look like a third state rather than the empty one.
  Green lives in `--success`/`--success-soft` (green-11/green-02 light, green-07/green-12 dark),
  as Red's sibling. All six pairs are AA at 10px, and every chip states its grade in words, so
  colour is never the only signal.
- The panel holds only what changes the canvas or is a value the canvas can't draw — plus
  **the whole of Control & trust**, which is its badge. A row is three parts: the check, its
  grade, and what that grade means for *this* pattern. Two lines, no more.
- **Nothing in the panel is constant.** The generic axis question ("Can the user stop it
  mid-flight?") used to sit on every row and was cut: 34% of the column's text, identical on
  all fourteen pages, and so the one thing there that failed the panel's own test. It lives on
  the **Principles page**, which is its canonical home — check that page still teaches all five
  before touching it.
- **Every axis carries a note, all 70 of them.** This is what made cutting the question safe:
  seventeen were graded `na` with no reason, and "Undo — N/A" alone reads as *not done yet*
  rather than *doesn't apply*. A grade without a reason is an unstated axis.
- **There is no Control & trust section below the lab.** It was one, briefly. Once the panel
  rows carried their question the section was **55% duplication** — same name, question and
  grade, plus a note — and 17 of its 70 rows had no note at all, so those repeated the panel
  exactly. The notes are a median of **9 words**: a spec value, not prose, so they sit beside
  the grade they qualify. Short prose in that column has precedent — `bp-rules` does the same
  job there in the Product Hub. What does *not* belong there is a primary read; that's why the
  definition lives in the section head at 15px.
- **Block order below the lab is `When to use it, and when not` → `Decisions it forces` →
  `Composed from`.** Three blocks, ordered by descending scannability: contained columns, then
  prose, then the exit.
- A decision's answer is **verdict then reasoning**, on the same lead/detail rail as
  `When to use it`. That block was 44% of the page with nothing to scan; 94% of the answers
  already led with a verdict in prose, so the split was structural, not editorial.
- **`shows` puts the argument back on the canvas.** 51 of the 62 decisions name the state that
  demonstrates our answer, rendered as a "See it on <state>" button that sets the canvas and
  scrolls the lab back into view — the decisions sit well below it, so without the scroll the
  click looks broken. The mapping is **hand-authored**: word overlap can't be used for it now
  that most verdicts are one or two words, and it can't tell whether a wireframe actually draws
  the thing. The 11 without a link are decisions no wireframe can settle — a keybinding, a
  retention window, who may see a score, what a timeout does. `smoke21` pins that set, so a gap
  has to be argued for rather than forgotten.
- **The part chips are grey, not blue.** `.ai-chip` used to take the accent on
  hover — label, ring and fill at once — and a dozen of them stack in one block,
  so running a cursor down the list lit the page up in the colour reserved for
  *this matters*. They now use the neutral hover the rest of the app shares
  (`--line-2` behind `--ink`, ring stepping `--line-strong` → `--ink-4`), which
  carries the state by weight rather than hue: 10.63:1 → 17.78:1 light. **Blue
  stays on focus**, which is the job the palette gives it and the state these had
  no styling for at all. Optional chips move only their dashed stroke — the base
  `:hover` sets an inset ring, so the optional rule has to turn it off again or
  a hovered optional part draws two concentric strokes.
- **`Composed from` splits Always / Optional**, via `optionalParts` as a subset of `composedOf`
  rather than a reshape of it — so `composedOf` stays a flat list of component names and both
  the validation and the deep links are untouched. This is where "what could sit here" lives:
  that list was always the answer (the upload, the context chips, the dates), it just rendered
  flat so nothing said which parts were a choice. 23 essential, 49 optional across the 14.
  Every pattern must keep at least one essential part and mark at least one optional.
- **Optional capability never goes on the canvas.** It was proposed as ghost chips in the base
  state and turned down: the states are a run you walk in order, and a menu of capabilities is a
  second, orthogonal axis — dropping it into one state makes that state mean something different
  from its neighbours, which is exactly what the pill strip got wrong. Grey
  outlines already mean *content arriving*, and configurable chips would make a preview a
  builder. Rendering the forks as selectable options was measured and dropped too: only 13 of
  62 questions name real alternatives, 18 are yes/no, and **31 are open judgements with no
  option space at all** — building the widget would mean inventing ~50 forks, and half would be
  fake precision.
- **A decision must not name UI the canvas doesn't draw.** This is how the rule was found:
  Prompt Box's first decision named chips for *date range, target file and output format* and
  the wireframe drew only two of the three. If a verdict names an element, the linked state
  shows it.
- `group-desc` carries **why the block exists**, never commentary on its own layout. "The
  right-hand list does the work" and "The right column is ours" were both cut for that.
- **A refusal is drawn on the thing it refused.** Clear Refusal's four states are
  four *surfaces* — a payment, an account list, a question, a report — not four
  callouts. It was four callouts for a long time: same box, same two buttons,
  different words, which is the chatbot reply the pattern argues against, and the
  reader could not see what had been refused. smoke25 strips every word and
  asserts the four skeletons differ, because rewriting the sentences would never
  have fixed it.
- **`Note` carries `kind` and `actions`.** `kind` is a short status label — Rule,
  Not set up, Not sure, Partly done — because tone was otherwise the only thing
  separating a rule from a failure, which is colour as the only signal; it is also
  what Clear Refusal's Inspect axis asks for in words. `actions` is the way out,
  inside the box: eight callers drew a `<Btns>` directly under a Note and called
  it a composition, and the pattern whose fourth decision is *"a refusal that
  dead-ends is the moment a user decides the feature doesn't work"* assembled that
  pairing four separate times.
- Anti-patterns and Principles both lead with something to look at, not prose.
- Two categories were renamed for the same reason the copy was: *Latency & Progress* →
  **Waiting & Progress**, *Output & Legibility* → **Output & Clarity**. Ids are unchanged
  (`latency`, `output`), so nothing downstream moved.
- A "Compare with what usually ships" control was tried twice and cut both times. Anti-patterns
  carries that argument with nine wireframes built for it; the playground is about behaviour
  over time and reads better for being about one thing.

## Four pills that are not each other

Figma has three components the eye reads as "a chip", and they were being confused:

| | Figma | Box | Case | States |
| --- | --- | --- | --- | --- |
| **Tags** | `20 / tag` (`149:412`) | 24px · r8 · bordered | UPPERCASE | none — it's a label |
| **Tabs** | `Tabs` (`389:367`) | 40px · r80 pill | Sentence | default / hover / active |
| **Services Tabs** | the 70px marker item | 70px · r12 in a blurred bar | Sentence | hover / active |
| **Number Chip** | `Number Chip` (`391:384`) | **32x20 / 26x16 fixed** · r500 | digits | none — it's a count |

`search_design_system` confirms `20 / tag` is the **only** tag component in the Loka library, so
Tags is correctly sourced — don't "fix" it toward the pill. The pill was added as **Tabs** and
what used to hold that name is now **Services Tabs**; Change Review's `composedOf: ["Tabs"]` was
always meaning the pill and now resolves to it.

**Number Chip has two sizes, and the second is derived, not chosen.** The sourced chip is
32x20 at 14px, so width is exactly `1.6 x height` and type is exactly `0.7 x height`. Holding
both at height 16 gives 26 and 11. **Any new step must hold both ratios** — `smoke24` recomputes
them rather than restating the numbers, so a guessed size fails. Use **20** beside a title (the
Icon Gallery's category name is 16px/600) and **16** beside an 11px uppercase eyebrow, where
14px type is louder than the label it belongs to — which is what the AI hub's four counts were
doing when the sourced size went in everywhere.

**Number Chip is fixed on both axes** — `width:32px`, never `min-width`. A row of counts only
lines up if every box is identical, so a number past three characters gets capped (`99+`) rather
than the box allowed to grow. It also resets `letter-spacing`, because it sits inside 11px
uppercase eyebrow labels that would otherwise track its digits apart. Three hand-rolled counts
were replaced by it: `.ico-group-count`, `.ai-when-count`, `.ai-parts-count` — all three rules
deleted. It's the first component bound to the **semantic** rungs (`color-bg-muted`,
`color-text-secondary`) rather than the `colors/neutral/*` primitives the older ones use; same
values today, but a theme pass moves the semantic rung and leaves the primitive alone.

**Tabs is the base selector.** Four places drew it by hand before it existed — the playground's
variant strip, the code panel's format strip, the AI hub's chips, and the Filter's toggle (which
already used `border-radius:80px`). The strips now share its state language at their own sizes:
importing 40px/16px into a 260px properties column would break the layout, the same reason AI
previews scale system components onto the `--pv-*` ramp. `.tab-pill` outlines with an **inset
shadow, never a border** — Figma's default has a 1px line and its hover has a fill and no line,
so a real border would shift the label a pixel on hover.

## Verifying

There is no test runner. Render checks are written as JSX in the scratchpad and run through
esbuild + `react-dom/server`:

```
cp smokeN.jsx .smoke-tmp.jsx
./node_modules/.bin/esbuild .smoke-tmp.jsx --bundle --platform=node --format=cjs \
  --jsx=automatic --outfile=/tmp/out.cjs && node /tmp/out.cjs
rm -f .smoke-tmp.jsx
```

Two checks worth running after any CSS work, because the build passes while both are broken:

- every `className` used in the AI hub resolves to a rule in global.css
- no `ai-*` / `mk-*` rule is defined without a referent
- **any colour pair on text is AA at its rendered size.** Two of the three grade chips were
  under 4.5:1 before anyone looked — N/A at 2.89:1 in light, Required at 4.44:1 in dark. Neither
  is visible to the eye or to the build; parse the values out of global.css and compute the
  ratio rather than restating the numbers in the test, so editing a token is what fails.
- **no selector is declared twice with an identical body.** The two checks above are blind to
  duplication, which is how ~1,000 duplicated lines survived in global.css across several passes —
  a re-inserted "restored" block reads as correct to both of them, and the later copy silently wins
  the cascade. When removing a block, prove it by diffing the *winning* declaration per selector
  before and after; only then is a deletion safe against reordering.

Effects don't run under `renderToString`, so anything derived in a `useEffect` won't be visible to
a render test — and usually shouldn't be an effect anyway.

## House voice — who the copy is for

The hub is read by designers, PMs and non-technical colleagues who want to understand how the AI
behaves. So the copy has one job before it has any other: **be readable by someone who has never
shipped an AI feature.** The argument can be sharp — it should be — but never at the cost of the
first read.

Three rules:

- **A `definition` explains, it doesn't specify.** One sentence, ≤30 words, no terms of art. It's
  the page description — the first thing anyone reads, so it is the one string that must land cold.
- **No jargon in a user-facing string.** Explain the term in the same sentence or don't use it:
  *skeleton* → grey outline, *token* → word, *hunk* → block of changes, *threshold* → the bar,
  *latency* → the wait, *provenance* → where it came from, *false positive* → acting when you
  shouldn't. Comments are exempt — they're for whoever maintains this.
- **Leads and state labels carry the most weight**, because they're read in isolation and often
  first. "Their words beat your controls" and "It splits up" were both cut for being clever at the
  reader's expense.

**Pattern names are plain noun phrases, Title Case, ≤18 characters.** Same grammar as the Product
Hub's component names (Input Field, Empty State, Progress Bar), because both hubs render into the
identical sidebar list — a different grammar for AI would read as a different kind of thing. The
name is the only thing carrying a pattern in the sidebar, in search, and in someone saying it out
loud, so it does more work than any sentence on the page. `Scoped Context` → **Visible Sources**,
`Diff Review` → **Change Review**, `Tool-Call Trace` → **Action Log**, `Capability Disclosure` →
**Known Limits**. **Agentic** survives as a category label because the reader will meet it
everywhere else; its blurb does the explaining.

A pattern's `id` never follows its `name`. Ids are the stable key — `aiPrinciples.js` `applies`
arrays, the previews registry, search targets and nav ids all resolve off them — so `id:
"grounded-answer"` still backs the name **Sourced Answer**, on purpose.

Worth re-running after any copy change, as scratchpad JSX (see **Verifying**): walk every
definition, state note, use/avoid entry, decision, control note, category blurb, principle and
anti-pattern — about 300 strings — against the two limits above. A copy regression is invisible to
`npm run build`.

**And walk the previews too.** An audit of the data surfaces alone missed the wireframes entirely,
which is how *payload* survived a jargon sweep and nine rationale captions survived a
show-more audit. There are ~290 more visible strings in `previews/*.jsx`: check them for banned
terms, for a first-person voice, and for overlap against the pattern's own notes and decisions.

## Conventions

- **Selected text is `--select`: blue-100 (`#186BF3`) at 24% light / 42% dark, and
  the rule sets `color: var(--ink)` as well as the background.** The colour is the
  part that matters — a wash on its own lowers the contrast of whatever it covers,
  and `--ink-3` copy is close enough to the floor that any tint pushes it under.
  Pinning selected text to the strongest rung means selecting something *raises*
  its contrast (14:1 light, 11:1 dark, computed in smoke25 from the token). It has
  to stay translucent: `.mk-editor-input` is a transparent sheet over a mirror, so
  an opaque wash there covers the words it is selecting — which is how it was, and
  why this came up. That element is the one place `::selection` keeps
  `color: transparent`.
- **`dist/` is committed.** Building overwrites it. Restore it (`git checkout -- dist/`) unless
  publishing was asked for.
- Comments explain *why*, at the density of the surrounding file — this codebase comments heavily
  and the reasoning is the point.
- British-ish house voice in UI copy; em dashes are used freely.
