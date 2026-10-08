# AI Patterns hub — working notes

Loaded when working under `src/components/ai/`. The root `CLAUDE.md` points here for
`src/data/aiPatterns.js`, `src/data/aiPrinciples.js` and the `smoke*.jsx` render checks too,
since editing those alone does not load this file.

## AI Patterns hub

**Thesis: show more, tell less.** A pattern is a behaviour over time, not a rendered element, and
each one encodes a product-owned policy. That's why it's a pattern library and not a second
component library.

- `src/data/aiPatterns.js` — the taxonomy. 7 categories, 32 entries, **all documented**, `status: documented | planned`.
  A documented entry carries: `definition`, `states[]` (each with a `note`),
  `useWhen`/`avoidWhen` as `{lead, detail}` (an avoid may carry `instead: patternId`, rendered as
  "Use … instead"), `decisions[]` as `{q, loka, why, shows?}` — `loka`
  is the verdict (≤16 words, median 8), `why` is the argument for it, and `shows` names the
  state that demonstrates it,
  `controls` graded on five axes (`{grade, note, shows?}` — `shows` as on a decision), `composedOf` (must resolve against `COMPONENT_LIST` in
  `src/data/components.js`) and `optionalParts` (a subset of it).
- `src/components/ai/previews/` — one preview per pattern, pure `({ state, work, set })`. `kit.jsx`
  is the shared wireframe kit; `index.js` is the registry.
- `src/components/ai/antipatterns/` — one wireframe per anti-pattern, same kit and ramp.
- `aiPrinciples.js` entries carry `title`, `statement`, `why` and `applies: [patternId]`, rendered as chips that open the
  pattern — **every documented pattern under exactly one principle** (smoke35). `aiAntipatterns.js`
  entries carry `looks`, `example`, `why`, `breaks: principleId` and `fixedBy: {pattern, state}`. Documented patterns only — a chip landing on an empty canvas teaches the opposite.
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
  `work.for(stateId)` — a surface that reads as this state, so the state list,
  the decisions' "See it on …" links and Start over aren't lying about where
  they put you. `work.state(w)` — which state this data is in; the caption and
  the state list both read it, so the data is the single source. `work.tick(w)` —
  `{ work, in: ms }` or null, the system's own half: the wait passing, the words
  arriving, the four cards landing one at a time.
  **`for`/`state` must round-trip for every state** (smoke29), and `tick`
  replaced the `auto` flag the states carried — a flag could only say "and then
  this state happens", which is a jump cut.
- **A failure is never on the tick.** Connection lost, Failed midway, One piece
  failed, Stale, Step failed and Didn't come back are reachable, but only by
  picking them: a wireframe that breaks on its own teaches that breaking is the
  ordinary course.
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
  refusal that never follow one another — so the state list is the whole control.
  A "builder" was turned down for Confidence for the same reason ghost capability
  chips were: a preview that configures is not a preview.
- **The previews hold no state.** `work` lives in PatternDetail, which is what
  lets the frame survive its own data changing — and is why it is **not keyed on
  the state when there is a surface**: typing the first character moves Prompt Box
  from Empty to Composing, and a key would unmount the field mid-keystroke.
  Without a surface the key stays, because a tab really is a swap.
- **Every state is one click away — the state list, in the panel.** Fork-only
  tabs were the answer for a long pass, and an audit measured what they cost:
  **40 of 136 states had no way to them** but waiting, working the frame or
  Start over, so a designer scanning a pattern saw one state, not its states.
  The panel now lists every state in run order, one numbered row per position,
  a fork's siblings stacked under one number with a rule down their edge — the
  order and the forks in one drawing, which the tabs could each say only half
  of. The current state's note sits under it, and only that one's.
  **This does not undo "the state is an output".** A pick goes through
  `work.for`, exactly as a tab did, and the frame still renders only the data;
  `for`/`state` round-trip (smoke29) is what makes the list safe. The pill strip
  was cut for making the frame a *lookup*; the list is a way *in* to a frame
  that is still derived. **Start over** resets the surface and releases the
  system — a pick holds it, because you asked to look at that one.
- **The caption sits at the top, centred; the wireframe is centred under it.** It
  reads before the frame because it names it, and shares its axis — left-anchored,
  the only element in the lab with a width of its own drifted sideways every time
  a state label changed length. The two chrome bands are held to one height
  (`--ai-band`, 72px) because that equality is what puts the wireframe on the
  canvas's *true* centre. **The band carries the caption and nothing else.** The
  pattern prev/next arrows used to sit on it, beside the state name — exactly
  where a reader looks for "next state". Pattern-to-pattern is a named pager at
  the foot of the page (`.ai-pager`), where somebody who has finished one is.
  The frame is centred by `.ai-swap`, not by `.mk-frame` — the anti-pattern
  figures use the same frame in a column where left is correct.
- **Colour is never the only signal, in the wireframes too.** Three kit
  components were breaking that and all three were shared, so they were one bug
  about to be copied into every pattern added next: a `Steps` dot carried
  done/running/held/failed as a fill, a diff row carried before/after as a fill,
  and Typing Ahead drew its suggestion in a mirror that is hidden from
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
  don't**, and saying which is the content. Current spread across 28: voice 20 changes /
  6 none / 2 holds, canvas 21 changes / 7 holds. smoke27 fails if any surface
  collapses to one answer — all-`holds` would make the field decoration, all-
  `none` would mean the hub really is a screen library.
  The screen isn't listed: every preview draws it.
- **(Revised — every surface is offered now; a holds tab keeps the screen drawing and changes
  only the caption. See below.)** **The surface strip offers only a second drawing.** A control appears exactly
  when it has something to do — the same rule the state tabs follow (forks only)
  and Start over follows (only with a road behind you). Two surfaces are never
  offered: one the pattern **holds** to, where the tab would re-render the
  identical frame, and one whose wireframe **isn't built yet**, where it would
  land on "not drawn". 25 of the 28 were one or the other, so that was most of
  the strip. Every one is drawn now, so it appears on 26 of the 28 — Approval Gate
  and Clear Refusal carry to both surfaces unchanged and answer in words alone.
  **The block below the lab still
  answers for every surface** — the strip's absence means nothing to *draw*, not
  nothing to say.
- **The properties column reads for the surface, but the grade never moves.**
  `surfaces[sf]` carries two sparse maps beside `verdict`/`note` — `states` and
  `controls` — that replace the notes in the right-hand column while that
  surface is on the canvas. They were needed because the strip puts a voice or
  canvas frame on 26 of the 28 patterns and the column went on describing a
  screen: **17 of the 66 state notes and 7 of the 70 axis notes** name a click,
  a chip, a column or a grey outline. Sourced Answer was the sharpest —
  *"Verify: one click to the passage"* two inches from a drawing of a handoff
  to a phone, because there is no click.
  What does **not** move is the **grade**. An axis is the obligation a product
  takes on, and one that changed every time somebody pressed a tab would stop
  being a spec and start describing the picture. Sourced Answer's Verify is
  still Required on voice — **the handoff to a screen is how it is met**. So
  *the grade is the obligation, the note is how it is met*, which is also the
  answer to grading per **state**: on *Connection lost* four of five axes would
  fall to N/A, teaching that a broken pattern owes the user less, when a failure
  is exactly where Correct and Undo start mattering. It is also the same
  inversion the pill strip, the Play track and `auto` were all cut for.
  **Sparse, and it falls through by key** — a surface overrides the two or three
  notes that would be false and inherits the rest, because rewriting the ones
  already true everywhere only makes them vaguer and the screen is what most
  readers come for. 202 overrides after the cull, longest 32 words. `smoke30` fails a typo'd
  key, an override on a surface no tab can reach, an override identical to the
  note it replaces or to the sibling surface's, any screen vocabulary left
  standing on voice, any spoken vocabulary on canvas, and a `controls` entry
  that isn't a plain string — which is what stops a grade being put in there
  later. `smoke26`'s panel corpus includes the overrides, so a voice drawing
  that repeats its own state note fails the same duplication check a screen one
  does.
- **A surface is drawn only where the drawing differs.** `Preview.surfaces =
  { voice, canvas }` — a static beside `work`, and the canvas foot carries a
  Screen / Voice / Canvas strip (`.canvas-variants`, the Product Hub's own
  control, because it does the same job). `holds` gets **no** variant: the screen
  drawing *is* the answer and a second would contradict the verdict, so the
  presence of a variant is itself the signal that something changed. smoke29
  fails a pattern drawn twice for one answer. `none` still gets a drawing — of
  the handoff that happens instead, because an absence drawn as an empty box
  teaches nothing. Built: **41 drawings + 6 absences**, not 56 and not the 272
  that drawing every state on every surface would be. The absences are Results
  in Pieces, Sourced Answer, Answer in Fields, Change Review, Retry & Compare
  and Action Log on voice — each drawn as the handoff that happens instead.
- **A variant runs off the pattern's own `work`.** One lifecycle, several
  drawings — Word by Word's `at` is characters on screen and words out loud without
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
  `voice.jsx` is a stage on the theme, an **orb** with a mood, what it heard, what it is
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
- **The seventh category is Initiative & Attention, and it went on the phase
  axis.** The gap the six didn't cover is *who started the interaction* — all
  six assume the user asked. It was added after **six more surfaces** were
  proposed as categories and turned down: Floating Assistant, Fullscreen
  Conversational, Inline AI Inside Flows, Bottom Sheet AI, Multi-modal AI Layer
  and Agentic Overlay.
  Four of those are **containers, not surfaces** — they vary how much host
  product is around the AI and nothing else. Measured: **3 of the 62 decisions
  turn on placement, against 38 on the medium**, which is the bar voice and
  canvas cleared, and all three placement ones are already answered *inside* the
  pattern that raises them (*"Markers in the text, or a panel beside it?" —
  both, and linked*). A placement question belongs in a decision; promoting it
  to an axis takes a settled answer out of the pattern and re-asks it fourteen
  times. **Multi-modal is the seam between two surfaces**, and the hub already
  draws four of those seams — the `none` verdicts on Results in Pieces, Sourced
  Answer, Answer in Fields and Change Review are each drawn as the handoff that
  happens instead. **Agentic Overlay** was the one with real content, and it is
  a phase: 4 of 62 decisions turn on initiative and 9 on reach, numbers that are
  low precisely because nothing on the shelf was about it.
  A third *surface* was also weighed and held: **small screen / touch** is the
  only honest candidate hiding in those six, and only 4 of 14 patterns lean on a
  pointer or a keyboard, against voice's 38 of 62.
  **It sits after Agentic, not first.** The order is the reading order, and a
  product only has to answer "who started it" once it can act without being
  asked — which is what Agentic establishes. First would also make the most
  exotic aisle the hub's front door, and the front door is read by people who
  have never shipped an AI feature.
  **Background Work was already in the wrong aisle**, filed under Agentic
  because there was nowhere better, which is the evidence the category was
  needed rather than invented. Moving it left a slot, filled by **Spending Limits**
  — the agentic question it was crowding out. The four are Heads-Up,
  Background Work, Interruption Limit and Back to You, all documented; every
  category holds exactly four.
  **Heads-Up opens on the state nobody designs.** Its first frame is the
  ordinary product screen with no AI on it, and the offer arrives on the tick
  ~2.8s later. A preview that opened on the offer would be drawing a
  notification, which is what the pattern argues against. *Badly timed* is drawn
  on a **different screen** — the same sentence, word for word, over a
  half-finished payment — because the content is right and the moment is not;
  drawing it on the subscriptions list would have shown a tidier version of the
  same success. It is never on the tick, for the usual reason.

- **The shelf is finished: 28 of 28 written up.** The last twelve went in one
  pass — Visible Working, Stop & Steer, Suggested Prompts, Guided Input, Retry &
  Compare, Edit in Place, Action Log, Spending Limits, Interruption Limit, Back
  to You, After a Mistake, Known Limits. Every category holds four documented
  entries. **136 states, 132 decisions, 47 surface drawings, 9 holds, 0 missing.**
  `status: "planned"` is still in the schema and the code paths still work —
  the next pattern added starts as a stub. That is why `.ai-planned`,
  `.ai-planned-ask` and `.ai-card-todo` are now in smoke28's **`NO_DATA`** list
  rather than deleted: their path is live and their data is empty, which is a
  different claim from dead CSS and is written down as one.
  What made twelve at once survivable was that **smoke31 is the judge**. Every
  new pattern had to be unmistakable from all 27 others with its words removed,
  and the ceiling never moved: worst still **41%**, median down from 24% to
  **22%** with 136 drawings in the corpus instead of 76. The failures it caught
  were real — **After a Mistake** drew *Putting it back* and *Can't be put back*
  identically until the screen preview learned to read its own `hard` flag, and
  **Known Limits** drew *Where you'd look* the same as *What it can see* until
  the resting state became what it actually claims: the ordinary product screen
  with one quiet line on it, rather than the limits page itself.
  Three near-collisions were designed around rather than discovered, and the
  reasoning is in each file's header: a **trace is not a plan** (Visible Working
  vs Plan Preview — one is discovered a line at a time and cannot be edited, the
  other is fixed and must be), **two proposals are not a diff** (Retry & Compare
  vs Change Review — neither version is incumbent, which is the whole pattern),
  and **pointing at text is not writing into it** (Edit in Place vs Typing
  Ahead — opposite directions, so they must not look alike).
  Two patterns earned a `none` on voice and are drawn as the handoff instead:
  **Retry & Compare** (two answers cannot be side by side in one channel, and
  comparing by memory is the thing it exists to prevent) and **Action Log** (a
  record is something you scan).
- **`heard` is the user's own voice and is exempt from the first-person rule.**
  smoke26 strips `.vc-heard` before the model-voice check. Found when *"Stop,
  I'll do it"* — somebody talking over a device — failed as model voice. The
  rule is that the **product** has no "I"; the same exemption the data sweep
  already makes for a prompt somebody typed.

- **The shelf is the view you land on, and it took a competitor to notice it was
  missing.** The hub has been described as "a pattern shelf" in these notes from
  the start and there wasn't one: `AiPatternsSection` mounted a single pattern,
  and the only way to reach any other was to recognise its name in the sidebar.
  Twenty-eight nouns in a list is a **lookup**, not a browse — it only serves
  somebody who already knows the answer. `selectedAiPattern === null` is now the
  shelf and it is where the hub opens; **a card opens the pattern's page.** The way back is the sidebar's **AI Patterns** title — a button in this hub only (`Sidebar.jsx`); an "All patterns" button above the pattern's name did the same job and was removed. It
  used to expand in place into a compact lab with the page one more click on —
  three ways into one pattern and two sizes of the same lab — and was cut at
  the user's request after the audit. `compact` is gone from PatternDetail.
  **Stacking the pages was turned down again**, having been turned down once
  before. beautifului.dev does exactly that with 21 components and it reads
  beautifully, *because each of their sections is a demo and one line*. Ours
  carry states, decisions, surface answers and a parts list, so 28 stacked
  buries the half that makes this a pattern library rather than a gallery — and
  it would mean **28 `work.tick` timers running at once**, with Heads-Up making
  its offer at 2.8s and Results in Pieces lagging five seconds somewhere
  off-screen. What that site actually has that we didn't is the layer *before*
  the page.
  **The cards are still, and that is free.** A card renders `work.for(states[0])`
  and stops. A preview is a pure function of its working data, so there is no
  state for a card to own and nothing to unsubscribe — smoke32 asserts the
  shelf never reads `tick`, runs no clock of its own, **holds no state at all**,
  and that the name's one handler opens the page.
  **The frame is shrunk by the ramp, not by a transform.** `.mk-frame` is
  `width:100%` under a `maxWidth` and every size inside comes off `--pv-*`, so a
  card narrows the column and steps the ramp down. That knob exists for exactly
  this; a transform would have put a second idea of "how big is a preview" into
  the project.
  **A card is a `div`, not a `button`.** This one was caught by reading the
  rendered markup after the tests were green: a documented card mounts a preview
  and a preview contains real Buttons, so a `<button>` card put a button inside
  a button. `inert` does nothing about that — it is malformed markup whatever
  its descendants are marked as. The card is a div with exactly one control, the
  **name**, stretched over the whole card by `::after`, and the focus ring is
  drawn on that stretched box. smoke32 walks the render counting button depth.
  **The figure is `inert` and `aria-hidden`.** At card size the type inside a
  frame is texture rather than reading; everything a reader needs is the name and
  the definition beside it in real type. Without it a keyboard user would walk
  30 wireframe controls to cross the shelf. `pointer-events:none` is the belt for
  Safari before 15.5, where the worst case is a few extra tab stops.
  **Planned entries are dashed, text-only cards that say so.** An empty box reads
  as a preview that failed to load, and leaving them out would hide the one thing
  a browse is best placed to say: how much of the shelf is written up. The card carries
  the pattern's own `definition` rather than a shorter line written for a card —
  that is the one string written to land cold, and a card-sized copy would drift.
  **Numbered 01–28 across the whole shelf**, not restarted per category. The
  number is the sense of how many there are, which a list of names never gives
  you; per-aisle numbering would make it an index instead.

- **A pattern has to be recognisable with every word removed.** smoke25 had been
  asking this of Clear Refusal's four states since they were four identical
  callouts; `smoke31` asks it of the whole shelf, and found the same failure in
  five more places. **6 states had a nearest wordless twin in another pattern
  above 60%**, worst at **76%** — Undo & History's *Restoring* was drawn the
  same way as No Good Match's *Nothing above the bar*, different categories,
  different subjects.
  The failure has a shape worth knowing, because it was never deliberate: the
  previews are **well drawn at each pattern's moment of interest and collapse
  into a shared callout everywhere else**. Almost every offender was a
  "nothing found" / "finished" / "restored" state — the ones with no obvious
  content — where the kit's `Note` takes a title and a body and the argument
  quietly moves out of the drawing and into a sentence. That is "no caption that
  explains the pattern" reappearing in a disguise, so watch for it at the
  terminal and empty states specifically.
  The three that were redrawn:
  - **Undo & History · Restoring** said *"This adds a new entry. The 1 change
    above it stays in the record"* with the trail not even on screen. It now
    draws the trail as it will read afterwards — the new entry at the top, the
    changes it passes still in the list. Erasing would show a gap, and there
    isn't one, so nothing has to be claimed.
  - **No Good Match · Nothing above the bar** put every number in a sentence on
    the one pattern whose entire subject is a threshold. It now draws the bar,
    with the near misses pinned under a line nothing crosses.
  - **Approval Gate** lost its step meter altogether. It was the wrong unit as
    well as a shape shared with Plan Preview — *"Send £740"* is one step covering
    four payments, so a meter could say the batch was in flight and never say
    which of them had left, which is the only question anybody has when a bank
    declines half a batch. It is a **ledger, one row per payment**, and the
    pattern's own warning now appears where it has become TRUE: *"Sent money
    can't be pulled back"* used to be shown while nothing had been sent and
    dropped the moment money had gone.
  `smoke31` also fails **two states of one pattern drawing the same thing**,
  with one checked exemption: Typing Ahead's *Typing* and *Dismissed* are alike
  because rejection is silence and the product really does do the identical
  thing — but the exemption still asserts the two frames differ in what they
  say, or the lab would be showing one drawing under two names.
  A second pass took the 35–46% band, and it is where the most useful drawings
  in the hub came from — because a state only sits in that band when the thing
  it is about has no obvious shape, and finding the shape is the design work:
  - **Background Work** was in 5 of the top 13 pairs and every state was a
    callout over a step meter, so the one thing this pattern is about was the
    one thing never on screen. It now draws **attendance rather than progress**:
    a rail from the moment somebody left to the moment they came back, the run's
    own event where it actually happened, and the gap after it hatched rather
    than filled — a solid band reads as measuring something, and this measures
    absence. On *Waiting on you* that gap **is** the failure: a decision asked
    for at 14:02 and answered at 16:40 is two and a half hours of a run standing
    idle because nobody heard it, which no callout was going to convey. 36% → 29%.
  - **Heads-Up** floated its offer above the whole list while **its own canvas
    answer** said the offer "attaches to the object it noticed rather than
    sitting in a corner". The screen drawing was contradicting the pattern's own
    text. The offer now hangs off the line it is about, which also settles the
    pattern's second decision — *lead with what you noticed* — as a matter of
    position rather than wording. 35% → 30%.
  - **Change Review · Stale** asked the reader to hold three values in their
    head and take our word for the mismatch (*"worked out from the old names, so
    applying them now would undo that"*). It now draws the three-way — what the
    proposal read, what the record says now, what it would still set — so the
    mismatch is two lines not matching. 25% → 20%.
  `.mk-money` came out of this: Approval Gate's settlement and Heads-Up's
  subscription list want the same three parts (a named thing, the word for what
  has happened to it, an amount), so the class was renamed off its first caller
  rather than given a twin. That reuse is also why the current worst pair is
  **Approval Gate · Running ≈ Heads-Up · Taken up at 41%** — two lists of money
  rows, which is honest, and well under the ceiling.
  The ceiling **ratchets down and has twice**: 0.6 → 0.45, median gate 0.35 →
  0.30. It is not zero on purpose: Approval Gate and Plan Preview are relatives,
  and Plan Preview's own `avoidWhen` says a one-step plan *is* an Approval Gate.
  Worst **76% → 41%**, and the whole shelf now sits between **8% and 32%**.

- **A state note says what the FRAME shows; the argument belongs to the decision
  that `shows` it.** This was found by comparing every block on a page against
  every other — something nothing had ever done, because smoke26 compares the
  *wireframe* against the panel and the blocks had never been compared with each
  other. **52 places where one block repeated five words of another, 46 of them
  a state note and its own decision making the same case a screen apart.**
  Almost all were two sentences: the first describing the frame, the second
  arguing for it. The note keeps the concrete half. It is the same duplication
  that killed the Control & trust section, in a new place.
  What is still allowed, and must stay allowed: a **verdict** naming what the
  canvas draws. *"They stand down on the first character"* appears in both the
  note and the `loka`, and that is the `shows` link working. smoke26 compares
  only the **argument** (`why`), never the verdict.
- **The surface-override mechanism was built sparse and had drifted to
  near-total.** Designed as "a surface overrides the two or three notes that
  would be false and inherits the rest"; measured at **254 overrides — 26% of
  all page copy, behind a tab — of which only 24 were fixing a note that was
  actually false.** I built the mechanism for 24 cases and then wrote 230 more
  because the mechanism existed.
  Cut: **all 40 `controls` overrides that weren't load-bearing** — an axis note
  four rows down inside a spec block on a surface tab is the deepest copy in the
  hub and nobody has read it — plus **12 state overrides that paraphrased** the
  note they replaced (Plan Preview's voice *Paused* differed by "stated" →
  "said"). The ~190 state overrides that remain are kept on purpose and the
  "sparse" claim above is retired: when the drawing changes, the line explaining
  the drawing usually changes too, and that line is the most-read sentence on
  the page.
- **One cut was recommended and then withdrawn on the evidence.** The `avoidWhen`
  details looked like restatement of their leads (12 words against 5) and are
  not: *"A prompt field for four choices is a regression from a dropdown"*,
  *"A dosage, a legal clause, a financial total"*. Two of seventeen sampled
  shared a single word with their lead. **Don't cut them** — this is written
  down so the same proposal doesn't come back on the same bad hunch.
- **No pattern is redundant, measured.** Question-overlap across all 378 pairs
  peaks at **16%** (Word by Word ↔ Results in Pieces, same aisle, genuinely
  different). Killing an entry is not supportable on redundancy grounds. The one
  weak entry is **Spending Limits**, which was written to refill a slot — that is
  an argument about how it came to exist, not about duplication.
  One duplicated *decision* was cut: Visible Working and Action Log both asked
  "open or folded by default?" at 75%. Folding is Visible Working's argument —
  an open trace competes with the answer. For a record it is just a default.

### Settled decisions — don't re-litigate

- **Error & Retry was cut, and `wrong-answer` / After a Mistake took its slot.** It had been
  flagged as probably duplicating the per-pattern failure states, and once there were sixteen
  documented patterns that was measurable: **4 of the 16 already draw an infrastructure failure as
  a state** — Connection lost, One piece failed, Failed while away, Stale. A fifth drawing of the
  same thing teaches nothing, and the per-pattern state is the better home anyway, because a break
  means something different inside each pattern. What Boundaries & Failure was actually missing is
  the case nothing on the shelf covered: the AI being **confidently wrong and somebody acting on
  it** before anyone noticed. The category blurb lost "breaking" for "being wrong" at the same
  time — it had been promising something the aisle no longer contained.
- **Every category held exactly four, and that was a hazard as much as a shape.** It no longer
  does — the four added after the audit made it 5 / 4 / 5 / 6 / 4 / 4 / 4, because each went
  where it belongs rather than where a slot was open. Before that, 28 entries across 7. When Background Work moved into Initiative & Attention, Agentic dropped to three and
  **Spending Limits was written to refill the slot** — a real pattern, but chosen partly because a
  slot was open, which is the wrong order. A taxonomy constrained to stay symmetric will misfile
  things to stay symmetric. If a category ever has a genuine three, let it have three.
- **Stop & Steer is filed under Waiting & Progress and is arguably Control & Correction.** It
  overlaps Word by Word's *Stopped* state and the Interrupt axis every pattern already grades;
  what it adds over the axis is what happens to the half-finished result, which is real. Left
  where it is because moving it breaks 4/4 in both directions — noted so it isn't rediscovered.
- **Visible Working and Action Log are near-twins whose names don't say which is which** — the
  first is the working shown *during*, the second the record kept *after*. Both are
  documented now, and the one decision they shared was cut from Action Log.

- Patterns are the core; Principles is the supporting Reference view, with the anti-patterns inside it.
- The two AI views are exclusive. Stacked, anti-patterns read as *that pattern's* anti-patterns —
  which is why they sit under the principle each breaks, not under a pattern.
- The section heading is the pattern's name and its description is that pattern's definition —
  so neither appears in the properties panel.
- Lifecycle and Failure modes blocks were **cut**: the states on the canvas replaced the first,
  the failure states replaced the second, and the fork-shaped remainder became Decisions.
- Both hubs reveal the sidebar category holding whatever is on their canvas; that behaviour is
  shared, not AI-only.
- Two-column term/detail lists all run one rail: `190px 1fr`, `gap: 24px`.
- **(Superseded — the chips are gone; a grade is the word in the decision rail's tag slot, and N/A is a closing line. Kept for the colour reasoning, which still applies if a grade is ever coloured again.)** **Grade chips were three codes: blue Required, green Recommended, grey N/A.** Blue is what the
  system spends on "this matters". Green is the only semantic ramp meaning *good practice* —
  Amber is documented for caution and warnings, and it fails AA at every weight that still
  reads as amber (amber-11 on amber-02 is 4.36:1). Grey for N/A is deliberate: it's the absence
  of an obligation, so a hue would make it look like a third state rather than the empty one.
  Green lives in `--success`/`--success-soft` (green-11/green-02 light, green-07/green-12 dark),
  as Red's sibling. All six pairs are AA at 10px, and every chip states its grade in words, so
  colour is never the only signal.
- The panel holds only what changes the canvas or is a value the canvas can't draw: **the state
  list**, then **Control & trust**. A grade row is **one line** — the check and its grade — and
  what that grade means for *this* pattern opens under it on a click, one row at a time. Five
  notes standing open were 40–60 words of prose beside the demo, and the readout above them sat
  on a blue wash with a blue rule, so with 70 Required chips the column was the loudest thing in
  the lab. No blue in the panel now except the Required chips and focus.
- **Nothing in the panel is constant.** The generic axis question ("Can the user stop it
  mid-flight?") used to sit on every row and was cut: 34% of the column's text, identical on
  all fourteen pages, and so the one thing there that failed the panel's own test. It lives on
  the **Principles page**, which is its canonical home — check that page still teaches all five
  before touching it.
- **Every axis carries a note, all 70 of them.** This is what made cutting the question safe:
  seventeen were graded `na` with no reason, and "Undo — N/A" alone reads as *not done yet*
  rather than *doesn't apply*. A grade without a reason is an unstated axis.
- **(Superseded — see "The page under the playground" below: Control & trust is now the last
  group of Decisions.)** There was no Control & trust section below the lab. It was one, briefly. Once the panel
  rows carried their question the section was **55% duplication** — same name, question and
  grade, plus a note — and 17 of its 70 rows had no note at all, so those repeated the panel
  exactly. The notes are a median of **9 words**: a spec value, not prose, so they sit beside
  the grade they qualify. Short prose in that column has precedent — `bp-rules` does the same
  job there in the Product Hub. What does *not* belong there is a primary read; that's why the
  definition lives in the section head at 15px.
- **(Superseded — two blocks now: `When to use it` → `Decisions`, then the pager.)** Block order
  below the lab was `When to use it, and when not` → `Decisions it forces` →
  `On other surfaces` → `Composed from`, then the pager. Ordered by descending
  scannability: contained columns, then prose, then the exit. Every `group-desc` is one line.
- A decision's answer is **verdict then reasoning**, on the same lead/detail rail as
  `When to use it`. That block was 44% of the page with nothing to scan; 94% of the answers
  already led with a verdict in prose, so the split was structural, not editorial.
- **`shows` puts the argument back on the canvas.** 113 of the 131 decisions name the state that
  demonstrates our answer, rendered as a "See it on <state>" button that sets the canvas and
  scrolls the lab back into view — the decisions sit well below it, so without the scroll the
  click looks broken. The mapping is **hand-authored**: word overlap can't be used for it now
  that most verdicts are one or two words, and it can't tell whether a wireframe actually draws
  the thing. The 18 without a link are decisions no wireframe can settle — a keybinding, a
  retention window, who may see a score, what a timeout does. No test pins that set any more —
  `smoke21` did and is gone — so a gap has to be argued for in review.
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
- **Anatomy is not optional capability on the canvas.** The lab's Anatomy toggle outlines and
  numbers the parts a frame *already draws*, keyed to `composedOf` — it adds nothing to the
  drawing and changes no state. A part this state doesn't draw stays in the legend, hollow, so
  the numbers never move. See **Audit pass** below.
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

**A name has to name a thing the reader can picture, not the circumstance that produces it.** This
is the rule the first four renames were following without saying so, and a later pass of seven
found it by breaking it. Two ways a name fails:

- **It names a circumstance.** `Unprompted Offer` → **Heads-Up**, `Attention Budget` →
  **Interruption Limit**, `Run Limits` → **Spending Limits**, `Handing Back` → **Back to You**.
  All four were in the two newest aisles, which is where this always happens: new material gets
  named from the mechanism, because the mechanism is what you were just thinking about.
- **It carries a technical word in plain clothes.** `Structured Output` → **Answer in Fields**,
  `Inline Suggestion` → **Typing Ahead**, `Streaming Response` → **Word by Word**. *Inline* is
  typography, *Output* is engineering, *Streaming* and *Response* are borrowed. A designer reads
  all three fine; the PM and the non-technical colleague the hub is written for read
  "Structured Output" and picture nothing. **Prompt Box** and **Guided Input** keep their words on
  purpose — both have gone mainstream enough to be read cold, and Prompt Box is the literal name of
  the thing it draws.

A measurement was tried for this and **failed**: whether a definition ever reuses its own name's
words sounded like a legibility proxy and isn't — **Clear Refusal** scores 0/2 on it and is a
perfectly clear name. Don't rebuild it. What smoke26 does enforce is the half that is mechanical:
≤18 characters, unique, Title Case with small words left lowercase (`Results in Pieces`,
`Back to You`), and no word from the banned list above.

A pattern's `id` never follows its `name`. Ids are the stable key — `aiPrinciples.js` `applies`
arrays, the previews registry, search targets and nav ids all resolve off them — so `id:
"grounded-answer"` still backs the name **Sourced Answer**, on purpose.

Worth re-running after any copy change, as scratchpad JSX (see **Verifying** in the root `CLAUDE.md`): walk every
definition, state note, use/avoid entry, decision, control note, category blurb, principle and
anti-pattern — about 300 strings — against the two limits above. A copy regression is invisible to
`npm run build`.

**And walk the previews too.** An audit of the data surfaces alone missed the wireframes entirely,
which is how *payload* survived a jargon sweep and nine rationale captions survived a
show-more audit. There are ~290 more visible strings in `previews/*.jsx`: check them for banned
terms, for a first-person voice, and for overlap against the pattern's own notes and decisions.

## Audit pass — October 2026

An audit (`AUDIT.md` at the root) scored all 28 patterns and the shell; every change it proposed
was approved and made in one pass. What it changed, and the rules that came with it:

- **Anatomy.** `kit.jsx` exports `Part` and `PartsContext`. A preview wraps the element that *is*
  a part — `<Part name="Button">`, `block` for block content (it renders a `div` then, a `span`
  otherwise) — and the lab numbers it from `composedOf`. **Off, a Part renders nothing at all**,
  which is why every render check is unchanged by it and why smoke31's skeletons don't converge.
  One marker per part per state; a list marks its first row (`name={i === 0 ? "List Item" :
  null}` — a null name marks nothing). Screen previews only: voice stages and board objects are
  not built from Product Hub components. Two `composedOf` lists were wrong and the markup found
  them: Clear Refusal never draws an Empty State and Known Limits never draws an Accordion, so
  both are optional now. When adding a pattern, mark its parts.
- **An inert wireframe button says so.** `Btn` with no `onClick` gets `data-inert` and a title —
  no pointer, no hover, full paint (dimming is what `disabled` means, and Prompt Box's disabled
  Send is the pattern). Readers were pressing Approval Gate's **Reject**, which did nothing; it
  is wired now, to a **Rejected** state: nothing sent, request kept.
- **Three failure states that were missing.** Plan Preview · *Step failed* (resume from the
  step, the decision that had no state), Retry & Compare · *Didn't come back* (the retry takes
  nothing away), Undo & History · *Older than 30 days* (the window's edge, drawn where you reach
  it — the decision "state the window and mean it" had nothing to show).
- **Frames over ~70 words were trimmed** of sentences that explained the pattern rather than
  being product copy (Known Limits' *"Findable, and said again where it bites"* was the pattern
  describing itself). Back to You's control strip said **"Assistant"** — a persona — and is now
  **Auto-chase**, the feature's name. What is still over 70 is product data (a week of offers, a
  chain of consequences), not explanation.
- **Four patterns added**, each with real precedent: **Saved Memories** (Intent; ChatGPT/Claude/
  Gemini memory), **AI Label** (Output; Gmail, LinkedIn, Notion — the mark is the library's Tag),
  **Edit & Resend** (Control; message edit with 1 / 2 versions — *not* Retry & Compare, which
  asks the same question again), **Answer Feedback** (Control; thumbs, one optional reason, and
  *harmful* as a report rather than a worse thumbs-down). smoke31 over every drawing: worst
  still 41%, median 22% → 21%.
- **Principles link every pattern.** `applies` covered only the first fourteen; smoke28 now fails
  a documented pattern no principle names.
- **The shelf footer** printed "28 of 28 are written up. The rest are on the shelf…" — it only
  renders while something is unwritten (`.ai-shelf-foot` is in smoke28's `NO_DATA`).
- **smoke28 had a bug of its own**: string entries in `AFTER_INTERACTION` were destructured as
  `[regex, file]` and read the file `./h`. The loop skips non-array entries now.

Left for a decision rather than done: whether **Interruption Limit** and **Spending Limits** stay
patterns of their own or fold into Heads-Up and Approval Gate (both have weak shipped precedent as
visible UI), and the audit's *Should* list — Mode Picker, Usage Limit, Selection Actions,
Attachments.

## Redesign — the pattern page template (October 2026)

`REDESIGN.md` at the root is the running record. What supersedes the notes above:

- **The page is one template** (`PatternDetail.jsx`): a quiet state strip, then the playground
  centred with nothing beside it, one line, a quiet tool bar, and everything else folded in native
  `<details>` — including **Control & trust**, which left the side panel. There is no side panel;
  the "state list in the panel" and the "one-line grade rows" entries above describe the previous
  layout.
- **A redesigned playground opens on a request somebody can send** (`Ask` in the kit) and answers
  what was typed through `previews/mock.js`. The state strip is a shortcut, not the way in.
- **Failures are chosen, not timed.** `Preview.simulate` opts a playground into Response:
  Normal / Slow / Fails, passed down as `sim`; the outcome is decided when the button is pressed
  and stored in `work`, so the tick only finishes a check whose ending was already settled.
- **There is no In product view.** `Preview.context` fed one (`ProductScreen`: a side nav, a page
  heading, the frame set inside), and it was removed: the product it drew was too generic to judge
  a pattern against — a "Loka" nav with Home / Work / Reports isn't anybody's real screen, so it
  added chrome without adding context. Only Clear Refusal ever set one. Don't rebuild it as a
  generic shell; if context comes back it has to be the real product a pattern ships in. The
  Desktop / Mobile width and Skip are template-level and need nothing from a preview.
- **Anatomy labels the part with its name** (`data-label`), not a number against a legend.
- **Clear Refusal is no longer a set of outcomes** — it has `work`, and smoke27/29 no longer treat
  it as one. Confidence Levels is now the only pattern without `work`.

## The state system (after STATE-AUDIT.md)

- **The live demo is the way in; the states are a map, not a remote.** The panel reads **Try**
  (Response and any scenario inputs) → **View** → **States** (titled *Found* at first, which a
  newcomer couldn't read; the count says "1 of 8 found" instead). States lists every state and marks each
  one *found* (filled dot) when using the playground reached it, *visited* (ring) when it was
  jumped to, or not yet (faint), with an "N of M" count. A jump is still one click, for review
  and handoff. Route playback, Replay, step and speed were built and then removed on purpose:
  they made the list the way in and the playground something you watched. Don't bring them back
  — make the state reachable by using the pattern instead (smoke33's `NOT_YET`).
- A held state that would move shows **Paused · Play**, and Skip stays available while paused
  (`labMotion`, exported for smoke33).
- **`work.keep`** lists typed fields that survive a jump; `workFor` uses the kept version only if
  it still reads as the state asked for, so the `for`/`state` round trip can't break.
- **`work.tick(w, sim)`** — ticks now receive the Response choice, so outcomes a reader chose
  (No reply expiring a gate) can play out. A failure is still decided when a button is pressed.
- **`withLoading(work, { id, start })`** in `mock.js` puts a wait in front of a pattern that opened
  on its finished answer. Eight use it; Retry & Compare and Edit in Place have mid-run waits of
  their own (`writing`, `rewriting`).
- **Every state has a `kind`** from `STATE_KINDS` (Start, Working, Done, Failed, Empty, Refused,
  Stopped, Unsure, Partial, Needs you, Out of date, At a limit, Editing, Inspecting). It is data,
  not UI — the panel no longer prints it — and smoke33 uses it: no run may end on a wait.
- **Compare** (View → Compare states) lays every state out as stills on the shelf's ramp.
- **Deep links**: `#ai/<pattern>/<state>`, kept in step by `replaceState`, cleared on leaving.
- **smoke33's `NOT_YET`** is the list of states still reachable only from the State list. Take a
  state off it when a redesign makes it reachable — the check fails if you don't.


## The page under the playground (after CONTENT-AUDIT.md)

`CONTENT-AUDIT.md` at the root audited the five folded sections. The writing was good; the frame
was wrong. What is settled now:

- **Two open blocks, nothing folded:** **When to use it** and **Decisions**, on the house
  `.group-head` / `.group-title`. Folding protected nothing, since everything here is already
  below the demo, and it hid the part of the page that changes a design. smoke34 fails a
  `<details>` under the playground, or a third block.
- **On other surfaces is the Surface switch.** 54 of its 64 notes were already the caption the
  switch put under the stage, word for word. The switch now offers **every** surface on every
  pattern. A `holds` surface keeps the screen drawing (`Drawn = onScreen || holds ? Preview : …`)
  and only the caption changes, to "Holds. …". It is still never drawn twice, which is the rule
  smoke29 pins.
- **Composed from is the parts list under Show parts** (the toggle was "Show anatomy"):
  - grouped Always / Optional
  - each name opens the component in the Product Hub
  - pointing at a name outlines that part on the frame (`PartsContext.focus` → `data-focus`)
  - a part the current state doesn't draw says *Not in this state*. Which parts are drawn is read
    off the frame in an effect, because a preview decides per state — and **61 of the 97
    optional parts are drawn by no state at all**, which the old chips implied otherwise.
- **Control & trust is the last group of Decisions,** headed *What it lets people do*:
  - Each graded axis is a `DecisionRow`, with the grade in words in the number slot. Required
    comes first, and there are no coloured chips.
  - An axis that doesn't apply is one line at the end (`.ai-dec-na`), still with its reason.
  - 54 axes carry `shows`, hand-authored, only where a state plainly *is* that axis being met.
    Don't fill the rest by word overlap.
- **Content templates:**
  - When to use it: 3 Use + 2 Avoid; a Use is a situation, never "Always".
  - Decisions: at most 5, with verdicts concrete enough to build. Heads-Up's rate is a number now
    — three a week, the same budget Interruption Limit enforces.
  - An avoid names its alternative with `instead` where the shelf has one (18 do).
  - smoke34 enforces the counts and that every link resolves.
- **No red and no blue on Use / Avoid.** "Avoid" is advice, not a failure, and Clear Refusal's own
  decision says save the error styling for things that broke.
- **Decisions are searchable.** `patternKeywords` in `aiPatterns.js` feeds `useSearch`. It lives in
  the data file so a render check can call it without bundling the site's images.
- **A control note must not repeat a decision.** The audit counted 15 by shared three-word runs;
  9 were coincidences ("the first word"), and the 6 real ones were rewritten to say what the
  decision doesn't.

## Principles and anti-patterns (after PRINCIPLES-AUDIT.md)

`PRINCIPLES-AUDIT.md` at the root audited both pages. The writing was the hub's strongest; the
structure was two documents bolted on, with no links between them. What is settled now:

- **One view, Principles.** Anti-patterns is no longer a view: each one sits under the principle it
  `breaks`, as a **pair** — the mistake drawn (`antipatterns/index.jsx`) beside the pattern state
  that fixes it, drawn by **that pattern's own preview** at `work.for(state)`. That is why there is
  no `instead` sentence: the fixed drawing is the instead, and it cannot drift from the pattern.
  *Try it on <state>* opens the pattern held there, via the `#ai/<pattern>/<state>` address.
- **Seven principles.**
  - *Unasked is a higher bar* is new. The Initiative aisle was the only one with no principle of
    its own, and Action Log joined it.
  - *Design every state…* became *Unsure, partial and slow are normal*: the old one was half a UX
    truism.
- **Nine anti-patterns.**
  - Two were merged into principles: the happy-path demo into P6 and the one-number promise into
    P2. Both are process failures no screen can draw.
  - Two were added: the decorative citation (*Mata v. Avianca*) and the unannounced change.
  - Every one carries a real `example`.
- **Templates:**
  - Principle: title ≤ 7 words, statement ≤ 20, why ≤ 30.
  - Anti-pattern: looks ≤ 15, why ≤ 20, example ≤ 20.
  - smoke35 counts the words.
- **Links both ways.** A pattern page ends Decisions with *Puts into practice <principle>. Fixes
  <anti-pattern>.*, derived from `applies` and `fixedBy`. It goes through App's `openPrinciple`,
  which swaps in the view and scrolls to `principle-<id>` / `antipattern-<id>`. Search indexes both
  with the same anchors; principles weren't indexed before.
- **No counts in copy** ("six rules", "nine named failures" went stale). The figures are shrunk by
  the ramp, not `zoom`. The axes block is titled *What it lets people do*, the same as on pattern
  pages.

## By capability, and the demo look (October 2026)

A third view, ported from `reference/ai-ui-patterns.html` — 12 capabilities (what the AI
*does*) mapped to 26 patterns, each with a live demo. It sits **alongside** the shelf, not
instead of it: the shelf is organised by phase (what the person is doing) and goes deep;
this is organised by capability (what the feature is) and goes wide.

**Twelve are merged into the shelf** — they were the same pattern under a second name
(Streaming response = Word by Word, Approval step = Approval Gate…). One pattern, one page:
the shelf's. A merged entry (`merged: shelfId`) keeps only what the shelf has no field for —
surface, layer, capabilities, pairs, its demo and `was` — and no name, use or avoid of its
own (smoke36 fails one that grows them back). Views read it through `uiName` / `uiLine` /
`uiTarget`, so its card shows the shelf name and definition over the live demo and opens the
shelf page. The shelf page says where it sits in this view on its closing link line —
*Serves … , in chat and embedded in product. Pairs with …* — not in a block of its own,
because smoke34 holds that page to two. **Seven are related, not the same** (Selection
Actions ≠ Edit in Place, Smart Fill ≠ Answer in Fields…) and stay patterns of their own,
linked as *Related on the shelf*. Don't merge those: the shelf doesn't cover them.

- **Data** — `src/data/aiCapabilities.js`. Ids, surface, layer, caps and pairs are the
  source's exactly; smoke36 diffs them against the reference file, and every one of the 78
  capability × surface × layer counts. The **copy** follows the house voice: names renamed to
  the naming rules (source name kept as `was`, indexed by search), British spelling, jargon
  out. Four names had to step around shelf names (Live Writing ≠ Word by Word, Ghost Text ≠
  Typing Ahead, Tracked Changes ≠ Change Review, Confidence Signal ≠ Confidence Levels) —
  all four have since merged into those shelf entries, so only the source names survive, as `was`.
- **Demos are not React.** `demos/demos.js` is the source's `D` object, generated from it
  (classes `dm-` prefixed), and `DemoStage` builds each demo's root by hand in an effect and
  removes it in the cleanup — exactly the source's `mountDemo`. The demos rewrite their own
  DOM as they play, so a tree React owned would be reconciled back over them. **Cancellation
  is `isConnected`**: removing the root stops a run at its next wait, which is what makes
  Replay, unmount and StrictMode's double mount all safe. Don't "convert" a demo to state.
- **Replay plays.** The source's didn't (its `_started` flag survived the remount, so Replay
  reset to the first frame and stopped) — the one deliberate behaviour change.
- **Scope and prefix, both.** Every demo rule is `.ai-demo .dm-*`. The scope stops a demo rule
  getting out; the prefix stops a house rule getting in (global `.row` and `.field` would
  otherwise restyle two demos). Keyframes are `dm-*` because a keyframe name has no scope.
- **Verifying behaviour.** smoke36 is static (markup parity, AA, coverage). Behaviour was
  checked in jsdom against the source's own `D`: every demo's first frame, frame after
  auto-play and frame after interaction compared — identical for all 26 — plus StrictMode,
  Replay mid-run, start-on-scroll and the counts. jsdom isn't a dependency; that harness ran
  from a scratchpad install. Rebuild it the same way rather than adding jsdom to the project.
- **Known light-mode contrast gaps, kept on request.** Three source values are under 4.5:1 —
  `--muted` on `--ai-tint` (4.35), `--ok` on white (4.12), placeholder `--ph` (2.57) — and
  the Ghost Text demo draws its suggestion at 55% opacity (2.3). smoke36 lists the three as
  KNOWN and fails if one is fixed without being taken off. Dark mode is derived and all AA.

**The previews took on the demo look** — restyle only, no state or logic touched:
- `--ai` / `--ai-tint` / `--stage` are on `.app`, shared by demos and previews. **Violet means
  AI-produced content and nothing else**: citations, the AI's side of a diff, Typing Ahead's
  suggestion (now violet at full strength, AA), the relevance score, the confidence band, the
  AI Label glyph, proposed canvas layers, a running step, row leads.
- **Blue stays where it is UI, not provenance**: Anatomy outlines, field focus, canvas
  selection handles and Edit in Place's picked region, Retry links — and the **voice orb**.
  A preview's own focus ring is violet, as on the demos.
- **The orb is the demo's shape in the brand's colour.** Flat, like Live Transcript: a solid
  `--blue` dot with a light centre, on a tinted disc (`::after`), and a copy of the disc that
  swells out and fades (`.vc-orb-ring`, the demo's 1.4s pulse). The lit sphere — gradient,
  specular, radial bloom — is gone, and with it `--orb-lit`, `vc-bloom` and `vc-turn`; the
  "orb is lit with the brand's own blue" note above describes the old drawing. Blue, not
  violet, is still the decision: violet is every voice assistant's signature. The moods
  still differ frozen, by dot size, brightness and disc size (smoke29).
- Frames are the demos' panel (12px radius, hairline ring, soft lift) on the grey `--stage`;
  the window dots are gone (titles stay — every frame still names a surface). Callouts are
  10px boxes; `ok` callouts are green (`--success`), because every caller means *done*.
  Removed diff text is red and struck through.
- **The library's Button, Field, Tag and Checkbox are untouched.** They paint with literal
  values, so nothing here reaches them, and the "one implementation" rule wins over matching
  the demos' own pill buttons. If that ever changes it is a Product Hub change, not a preview
  one.
