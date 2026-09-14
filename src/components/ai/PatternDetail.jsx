import { useCallback, useEffect, useRef, useState } from "react";
import {
  AI_PATTERNS,
  AI_SURFACES,
  CONTROL_AXES,
  CONTROL_GRADES,
  SURFACE_VERDICTS,
} from "../../data/aiPatterns.js";
import { PATTERN_PREVIEWS } from "./previews/index.js";
import { alternatives, path } from "../../data/flow.js";
import { ArrowLeft, ArrowRight, PlayIcon, RestartIcon } from "../common/Icon.jsx";
import { NumberChip } from "../common/NumberChip.jsx";

// One pattern, on the same lab shell every other hub uses: canvas on the left,
// the 260px properties column on the right. A pattern isn't a component, but it
// is the same *kind* of page — one thing on stage, its spec beside it — so it
// gets the same furniture rather than a second layout meaning the same thing.
//
// THE STATE IS AN OUTPUT, NOT AN INPUT
//
// This is the third answer and the first one that is actually a playground.
//
// The first was a strip of pills: every state of the pattern laid out as a
// menu, click one to see it. The second was a segmented track and a Play
// button, which walked a route on a timer. The third made the wireframe's
// controls live, and it was still the second one wearing a different hat —
// pressing Approve looked up the canned "Running" frame exactly as clicking a
// pill had. You could cause the jump, but there was nothing behind it.
//
// What all three share is the mistake: the lifecycle state was the *input*. You
// chose "Nothing in scope" and the frame was fetched from it.
//
// Now the state is the output. A preview is handed the surface's real working
// data — the text in the box, which sources are ticked, which changes you
// decided, how many characters of the answer have arrived — and it renders that
// and nothing else. The canvas derives which state the pattern is in *from* the
// data. So "Nothing in scope" is what it is called when you have switched the
// last account off, and it cannot be reached any other way, because there is no
// other way to be in it.
//
// THE PROTOCOL
//
// A preview that has a surface to work carries a `work` static:
//
//   work.for(stateId)   a working state that reads as this lifecycle state.
//                       Tabs, the decisions' "See it on …" links and Start over
//                       all name a state, so every state has to be expressible
//                       as data or those three would be lying about where they
//                       put you.
//   work.state(w)       which lifecycle state this data is in. The canvas names
//                       this, the properties panel describes it, and the tabs
//                       are computed from it. One source of truth: the data.
//   work.tick(w)        what the system does next on its own, as
//                       `{ work, in: ms }` or null. This is the wait passing,
//                       the words arriving, the steps running — the half of a
//                       behaviour that isn't the user's, which a canvas about
//                       behaviour cannot leave out.
//
// `work.tick` replaced the `auto` flag the states used to carry. A flag could
// only say "and then this state happens"; a tick moves the data, so four cards
// land one at a time instead of the frame cutting from two to four, and Stop
// keeps the characters that had actually arrived when you pressed it.
//
// Two patterns carry no `work` at all, and that is the right answer for them:
// Confidence Levels and Clear Refusal are sets of outcomes rather than
// behaviours — four kinds of refusal that never follow one another — so there
// is nothing to work and the tabs are the whole control.
//
// WHAT'S LEFT AROUND THE CANVAS
//
//   Tabs, at forks only.  The variants at the position you are standing in, and
//                 nothing about the order of positions. A position holding one
//                 state shows its name instead, so the appearance of tabs is
//                 itself the signal that the pattern forks here.
//   Start over.   Resets the surface to the top of the road it is on, and lets
//                 the system start moving again. It is also how you get out of
//                 a state you tabbed to, because tabbing holds the system still
//                 — you asked to look at that one.
//
// Below the lab, only what the canvas can't show: whether to use it at all,
// what it forces you to decide, and what it's built from.

export function PatternDetail({ pattern, onSelectComponent, onSelectAiPattern }) {
  // A decision names the state that demonstrates it, and clicking that puts the
  // state on the canvas — which is above and usually off-screen by the time
  // anyone is reading the decisions, so the lab has to come back into view or
  // the click appears to do nothing.
  const labRef = useRef(null);
  const Preview = PATTERN_PREVIEWS[pattern.id];
  const planned = pattern.status === "planned";
  const states = pattern.states ?? [];
  // The surface's protocol, or null for the two patterns that are a set of
  // outcomes rather than a behaviour.
  const W = Preview?.work ?? null;

  // The working data the frame renders, and — for a pattern with no surface to
  // work — the state somebody picked. Exactly one of these is live, which is
  // what keeps the canvas and the frame from ever disagreeing: with `work`, the
  // state is computed from the data, so there is no second copy of it to drift.
  //
  // Local rather than lifted to App: nothing outside this page reads either.
  // AiPatternsSection keys this component on the pattern id, so switching
  // patterns remounts and lands on the new one's opening state.
  const [work, setWork] = useState(() => (W ? W.for(states[0]?.id) : null));
  const [picked, setPicked] = useState(states[0]?.id);
  const stateId = W ? W.state(work) : picked;

  // Whether to hold the system still. Its own moves run unprompted — that is
  // the point — but not when somebody has asked for one state by name. A tab,
  // or a decision's "See it on Stopped", is a request to look at that one, and
  // a canvas that walks off it a second later is a canvas that ignored the
  // click. Working the frame clears the hold, because pressing Approve is a
  // request to see what happens next.
  const [held, setHeld] = useState(false);
  // Which surface the canvas is drawing. The pattern, its states and its working
  // data are all the same across the three — that identity is the demonstration,
  // so it is the *drawing* that switches and nothing else. Reset on the pattern
  // itself changing, which the key on this component already does.
  const [surface, setSurface] = useState("screen");

  const active = states.find((st) => st.id === stateId) ?? states[0];
  // The ways the run can go from this position, this one included. More than
  // one and this position is a fork, which is the only thing that puts tabs on
  // the canvas.
  const alts = active ? alternatives(states, active.id) : [];
  // Where "Start over" goes — the first state of the road this one is on, not
  // the pattern's first state. Sourced Answer starts three different ways, and
  // a restart that ignored which one you were on would be a fourth thing
  // happening rather than the same thing again.
  const first = active ? path(states, active.id)[0] : null;

  // The system, doing its half: the wait passing, the words arriving, the four
  // cards landing one at a time. One timeout per move rather than a schedule
  // walked from the top, so every move is decided by the data actually on the
  // canvas — press Stop mid-stream and the chain ends with it, leaving nothing
  // running that still believes in the answer it was part-way through.
  // Keyed on the data's *value* rather than its identity. A fresh object every
  // render would rebuild the timer every render, and the renders this component
  // gets are not all its own — the page's scroll spy re-renders it while you
  // are looking at it, which on a 24ms stream would reset the clock before it
  // ever struck and leave the answer frozen a word in.
  const workKey = W ? JSON.stringify(work) : null;
  useEffect(() => {
    if (!W?.tick || held) return undefined;
    const t = W.tick(work);
    if (!t) return undefined;
    const timer = setTimeout(() => setWork(t.work), t.in);
    return () => clearTimeout(timer);
    // `work` is read here and covered by `workKey`, which is what makes it
    // safe to leave out: two equal surfaces are the same surface.
  }, [W, workKey, held]); // eslint-disable-line react-hooks/exhaustive-deps

  // The frame worked its own surface. Nothing here decides which state that
  // is — `W.state` does, off the data — so a control can't put the canvas
  // somewhere the wireframe isn't.
  const set = useCallback((next) => {
    setHeld(false);
    setWork(next);
  }, []);

  // Naming a state, which is the tabs' and the decision links' way in. With a
  // surface this has to go through `for`, or the frame would keep rendering the
  // data it had while the caption claimed something else.
  const goTo = useCallback((id) => {
    if (W) setWork(W.for(id));
    else setPicked(id);
  }, [W]);

  // A tab. An explicit pick of one variant, so the system stays put on it.
  const pickState = useCallback((id) => {
    setHeld(true);
    goTo(id);
  }, [goTo]);

  // Same, plus scroll — used by the decisions, which sit well below the canvas.
  const showState = useCallback((id) => {
    setHeld(true);
    goTo(id);
    labRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [goTo]);

  // Back to the top of this road, with the system free to move again. This is
  // also the way out of a state you tabbed to: that hold has to be releasable
  // by something, and on a pattern like Results in Pieces — which has no
  // controls at all, because the whole behaviour is the system's — it is the
  // only control there is.
  const restart = useCallback(() => {
    setHeld(false);
    goTo(first);
  }, [goTo, first]);

  // The surfaces this pattern has a drawing of its own for, and so the only
  // ones the strip offers. A control appears exactly when it has something to
  // do — the same rule the state tabs follow (forks only) and Start over
  // follows (only with a road behind you).
  //
  // Two kinds of surface are deliberately not offered, and neither is a gap:
  //
  //   holds    the screen drawing *is* the voice answer, so a tab that
  //            re-rendered the identical frame would be a control that does
  //            nothing. Approval Gate carries verbatim to both surfaces, and
  //            the way to say that is the block below the lab, in words.
  //   undrawn  a surface whose answer differs but whose wireframe isn't built
  //            yet. Offering it would land the reader on "not drawn yet", which
  //            is worse than not offering it: the prose below still carries the
  //            whole answer, and an empty tab implies the prose is incomplete.
  //
  // So the strip is absent on most patterns today and that is honest — it
  // appears when there is a second drawing to see, and the count grows as the
  // remaining seventeen get built.
  const drawnSurfaces = AI_SURFACES.filter(
    (sf) => pattern.surfaces?.[sf.id]?.verdict !== "holds" && Preview?.surfaces?.[sf.id]
  );
  const surfaceEntry = surface === "screen" ? null : pattern.surfaces?.[surface];
  const Drawn = surface === "screen" ? Preview : Preview?.surfaces?.[surface];

  // Prev/next walks the whole shelf in declaration order rather than staying
  // inside the category: browsing a library end to end is a real way people use
  // one. Same cycling the component playground puts in this exact position.
  const i = AI_PATTERNS.findIndex((p) => p.id === pattern.id);
  const cycle = (step) =>
    onSelectAiPattern(AI_PATTERNS[(i + step + AI_PATTERNS.length) % AI_PATTERNS.length].id);

  const arrows = (
    <>
      <button className="pg-arrow" aria-label="Previous pattern" onClick={() => cycle(-1)}>
        <ArrowLeft />
      </button>
      <button className="pg-arrow" aria-label="Next pattern" onClick={() => cycle(1)}>
        <ArrowRight />
      </button>
    </>
  );


  return (
    <>
      <div className="pg ai-lab" ref={labRef}>
        <div className="pg-stage">
          <div className="pg-canvas grey">
            {/* Which state is on the canvas, centred, with prev/next holding
                the right rail.

                It reads before the frame because it names what the frame is,
                and it shares the frame's axis: this band was the only element
                in the lab with a width of its own, and anchored to the left
                edge it pulled the eye off the frame's centre every time a
                state label changed length. */}
            <div className="pg-canvas-nav">
              {states.length > 0 && (
                <div className="ai-state">
                  {/* Tabs only where the pattern genuinely branches. A position
                      holding one state shows its name as a label instead, so
                      the appearance of tabs is itself the signal that this is
                      the point where the pattern forks — which is the one thing
                      the segmented track it replaced could not say without also
                      asserting an order. */}
                  {alts.length > 1 ? (
                    <div
                      className="ai-state-tabs"
                      role="group"
                      aria-label={`Which way ${pattern.name} goes here`}
                    >
                      {alts.map((st) => (
                        <button
                          key={st.id}
                          className="ai-state-tab"
                          aria-current={st.id === active.id ? "true" : undefined}
                          onClick={() => pickState(st.id)}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <span className="ai-state-name">{active?.label}</span>
                  )}

                  {/* What moved the system into this state, on its own row
                      under the tabs. On a canvas you operate it's the other
                      half of the caption: the tabs say where you are, this says
                      what put you there — and half of the time the answer is
                      something you just did. Beside them it read as one more
                      tab; under them it reads as the caption it is. */}
                  {active?.by && <span className="ai-state-by">{active.by}</span>}
                </div>
              )}

              <div className="ai-canvas-arrows">{arrows}</div>

              {/* The spoken half of the caption. Half the moves on this canvas
                  are the system's — the wait passing, the cards landing — and
                  nothing else announces them.

                  Its own node, hidden, rather than aria-live on the caption
                  itself: that version wrapped the tab strip, so every change
                  re-announced a group of buttons along with the state, and a
                  live region full of controls is a live region that talks over
                  the thing somebody is trying to press. This carries one
                  sentence and nothing that can be focused. */}
              <span className="vh" aria-live="polite">
                {active ? `${active.label}${active.by ? `. ${active.by}` : ""}` : ""}
              </span>
            </div>

            <div className="pg-canvas-center ai-preview">
              {Drawn && active ? (
                /* Keyed on the state only where there is no surface to work.
                   With one, the frame has to survive its own data changing:
                   typing the first character moves Prompt Box from Empty to
                   Composing, and a key would unmount the field mid-keystroke
                   and take the focus with it. Without one — Confidence Levels'
                   four bands, Clear Refusal's four kinds — a tab really is a
                   swap between unrelated frames, so it gets the transition that
                   stops four of them reading as four screenshots. */
                <div className="ai-swap" key={W && surface === "screen" ? undefined : `${surface}-${active.id}`}>
                  <Drawn state={active.id} work={work} set={set} />
                  {/* Said on the canvas rather than only in the block below,
                      because a reader who switched surfaces is asking a
                      question and this is the answer to it. Under the frame, so
                      the frame is still the first thing read. */}
                  {surfaceEntry && (
                    <span className="ai-surf-say" data-verdict={surfaceEntry.verdict}>
                      <strong>{SURFACE_VERDICTS[surfaceEntry.verdict]}.</strong> {surfaceEntry.note}
                    </span>
                  )}
                </div>
              ) : (
                <div className="pg-empty">
                  <span className="pg-empty-name">{pattern.name}</span>
                  <span className="pg-empty-note">
                    {planned ? "Not documented yet" : "Preview coming soon"}
                  </span>
                </div>
              )}
            </div>

            {/* The foot holds one control, bottom right, in the slot the
                Product Hub gives its canvas action — and it is kept the height
                of the band above it so the wireframe sits on the canvas's true
                centre rather than the centre of whatever the caption left over.

                Start over, and only once there is something to start over from.
                The tabs reach across one position, so a finished run has no way
                back to its own beginning; on a pattern whose states all start
                the run — Clear Refusal's four kinds of refusal — there is
                nothing to restart and the foot stays empty — until a tab holds
                the system, which is the other thing this releases. */}
            <div className="pg-canvas-foot">
              {/* The surface strip, in the foot the Product Hub gives its
                  variant pills and using the same control, because it does the
                  same job: it switches what the canvas is showing at the top
                  level. Deliberately not the state tabs' language — those sit
                  above the frame and pick a variant *within* one surface, and
                  two look-alike strips picking different things is the
                  confusion worth a second treatment to avoid.

                  Only where there is a second drawing to see. See
                  `drawnSurfaces`: a pattern that carries to voice unchanged, or
                  whose voice wireframe isn't built yet, gets no strip at all
                  and answers in the block below instead. */}
              {drawnSurfaces.length > 0 && (
                <div className="canvas-variants" role="group" aria-label="Surface">
                  {[{ id: "screen", label: "Screen" }, ...drawnSurfaces].map((sf) => (
                    <button
                      key={sf.id}
                      className="canvas-variant-btn"
                      data-active={sf.id === surface}
                      onClick={() => setSurface(sf.id)}
                    >
                      {sf.label}
                    </button>
                  ))}
                </div>
              )}
              {(active?.from || held) && (
                <button className="ai-restart" onClick={restart}>
                  <RestartIcon />
                  <span>Start over</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* The properties column, after an audit against the one test that
            matters for a panel: does an item change the canvas, or is it a
            value the canvas can't draw? Anything that's neither is prose, and
            prose belongs in the scrolling blocks below.

            What that removed: the five control-axis sentences, which were 41%
            of the column's text and are now a block of their own; and the
            "Documented" chip, which said the same word on every page anybody
            would actually read. What it kept: the definition, the one control
            that changes the canvas, the readout for what's on it, and the five
            grades as a scannable spec. */}
        <div className="pg-controls">
          {/* No head at all. The name and the definition are both in the
              section heading above the canvas, the category is the sidebar
              group this entry already sits in, and a planned pattern says
              "Not documented yet" on the canvas rather than in a chip. What's
              left is the readout, the one control, and the spec — everything
              here either changes the canvas or is a value the canvas can't
              draw. */}
          {/* What the state on the canvas means. Not its name — the canvas
              captions that above the frame, and three renderings of one string
              was the duplication that started all this. Not its trigger
              either: that sits beside the name it belongs to. This is the one
              line that says why the state is drawn the way it is, so it moves
              every time the frame does. */}
          {active && (
            <div className="ai-now">
              <p className="ai-now-text">{active.note}</p>
            </div>
          )}

          {!planned && (
            <div className="bp-panel">
              <span className="bp-panel-badge">Control &amp; trust</span>
              {/* The whole of Control & trust, in the panel. It used to be a
                  section below the lab as well; once these rows carried the
                  same content that section was 55% duplication. The notes are a
                  median of nine words — a spec value rather than prose, so they
                  belong beside the canvas next to the grade they qualify, the
                  same job `bp-rules` does in this column in the Product Hub.

                  Each row is the check, its grade, and what that grade means
                  for *this* pattern. The generic axis question used to sit here
                  too, and it was cut: it was 34% of the panel's text and the
                  only thing in the column that varied with nothing — the same
                  five sentences on all fourteen pages, when the panel's whole
                  test is "does it change the canvas, or is it a value the
                  canvas can't draw". The five are defined once on the
                  Principles page, which is their canonical home.

                  Dropping it was only safe once every axis had a note. Seventeen
                  were graded n/a with no reason, and "Undo — N/A" on its own
                  reads as "not done yet" rather than "doesn't apply" — the
                  question was carrying those rows. Now the note does, in the
                  pattern's own terms, which is more use than a sentence
                  identical on every other page.

                  A list rather than a `dl`: a row is three parts, which is no
                  longer a term and its definition. */}
              <ul className="ai-grades">
                {CONTROL_AXES.map((a) => {
                  const entry = pattern.controls?.[a.id] ?? { grade: "na" };
                  const grade = CONTROL_GRADES[entry.grade];
                  return (
                    <li key={a.id} className="ai-grade">
                      <span className="ai-grade-top">
                        <span className="ai-grade-name">{a.label}</span>
                        <span className="ai-grade-chip" data-tone={grade.tone}>
                          {grade.label}
                        </span>
                      </span>
                      {entry.note && <span className="ai-grade-note">{entry.note}</span>}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>

      {planned ? (
        <div className="ai-planned">
          <p>
            This pattern is on our list but hasn't been written up yet. It's here so the library is honest
            about its own scope — the gap is visible rather than hidden.
          </p>
          <p className="ai-planned-ask">
            Finishing it means the same three things every written-up pattern carries: each of its states
            drawn on the canvas above, when to use it and when not to, and the decisions it forces
            with our answer to each.
          </p>
        </div>
      ) : (
        <>

          <Group
            title="When to use it, and when not"
            desc="Both halves matter. A pattern with no stated limits is a pattern that ends up used everywhere, including the places it makes things worse."
          >
            {/* Two contained lists rather than two bare columns: without an
                edge, the only thing telling Use from Avoid was an 11px label,
                and the two blocks of prose looked identical at a glance. Each
                item now leads with its condition, so the pair can be scanned
                in the left margin and only the ones that apply get read. */}
            <div className="ai-when">
              {[
                { tone: "yes", label: "Use when", items: pattern.useWhen },
                { tone: "no", label: "Avoid when", items: pattern.avoidWhen },
              ].map((col) => (
                <div key={col.tone} className="ai-when-col" data-tone={col.tone}>
                  <span className="ai-when-label">
                    {col.label}
                    <NumberChip size={16}>{col.items.length}</NumberChip>
                  </span>
                  <ul className="ai-when-list">
                    {col.items.map((t) => (
                      <li key={t.lead}>
                        <span className="ai-when-lead">{t.lead}</span>
                        <span className="ai-when-detail">{t.detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Group>

          <Group
            title="Decisions it forces"
            desc="None of these has a neutral answer — either somebody decides, or a default decides for them. Ours is in bold, with the reasoning under it. Argue with it in a review; don't skip it."
          >
            {/* A two-column table, so the forks read straight down the left
                rail and you can see how many there are before reading any
                answer. Stacked, each question was separated from the next by a
                paragraph of ours, and five tinted callouts down a page turned
                the emphasis into wallpaper. Saying "our default" once in the
                header also retires five repeated tags.

                Where the canvas can demonstrate our answer, the row names the
                state that does it and clicking it puts that state on the
                canvas. This is the block's other half of the show-more
                argument: a default asserted in prose is a claim, and the same
                default with "see it on Streaming" beside it is an invitation to
                check. It also uses a mapping that already existed — the
                decisions and the states were found restating each other in
                thirty-six places, which was the evidence they describe the same
                thing from two directions.

                Eleven of the sixty-two have no such state, and they say
                nothing: a keybinding, a retention window, who may see a score
                and what a timeout does are all real decisions that no wireframe
                can settle. A chip pointing at a state that doesn't make the
                case would be worse than the gap.

                The answer is split into the verdict and the reasoning behind
                it. This block was 44% of the page and the only part of it with
                nothing to scan — five stacked paragraphs at a median of 27
                words. The split was already there in the prose: 94% of the
                answers led with a verdict, median eight words, then defended
                it. Structuring that means the column can be read as five short
                answers, with the argument still there for whoever the answer
                stopped. It also puts this block on the same lead/detail
                grammar as "When to use it" above, which removes a format from
                the page rather than adding one. */}
            <dl className="ai-dec">
              <div className="ai-dec-head" aria-hidden>
                <span>The decision</span>
                <span>Our default</span>
              </div>
              {pattern.decisions.map((d, n) => (
                <div key={d.q} className="ai-dec-row">
                  <dt>
                    <span className="ai-dec-n">{String(n + 1).padStart(2, "0")}</span>
                    <span className="ai-dec-q">{d.q}</span>
                  </dt>
                  <dd>
                    <span className="ai-dec-loka">{d.loka}</span>
                    {d.why && <span className="ai-dec-why">{d.why}</span>}
                    {(() => {
                      const st = states.find((x) => x.id === d.shows);
                      if (!st) return null;
                      return (
                        <button
                          className="ai-dec-shows"
                          onClick={() => showState(st.id)}
                          title={`Put "${st.label}" on the canvas`}
                        >
                          <PlayIcon size={9} />
                          {/* one text node: adjacent text and expression
                              make React emit a comment marker between them */}
                          <span>{`See it on ${st.label}`}</span>
                        </button>
                      );
                    })()}
                  </dd>
                </div>
              ))}
            </dl>
          </Group>

          {/* Where this lands off the screen it is drawn on. It sits after the
              decisions rather than before them because the decisions are the
              pattern's substance and most of them carry: the answer to "does
              this work on voice" is usually "the same questions, different
              answers", which only means something once you have read the
              questions.

              Not a category, and the difference matters. The six categories are
              phases of an interaction; voice and canvas are surfaces, and a
              shelf on two axes at once stops being a way in — see the note on
              AI_SURFACES. This is also the hub's own claim about itself being
              checked instead of assumed: it says the same decisions recur
              across surfaces, and 45% of its decisions are worded for a screen.

              On the 190px rail the Principles page uses for the control axes,
              so the verdict reads straight down the left margin: somebody
              building for voice can answer "is there anything here for me"
              without reading a single note. */}
          <Group
            title="On other surfaces"
            desc="The same pattern away from the screen it is drawn on. Where the answers change, what replaces them — and where there is no form at all, what takes its place."
          >
            <dl className="ai-defs">
              {AI_SURFACES.map((sf) => {
                const entry = pattern.surfaces?.[sf.id];
                if (!entry) return null;
                return (
                  <div key={sf.id} className="ai-defs-row">
                    <dt>
                      {sf.label}
                      <span className="ai-surf-verdict">{SURFACE_VERDICTS[entry.verdict]}</span>
                    </dt>
                    <dd>{entry.note}</dd>
                  </div>
                );
              })}
            </dl>
          </Group>

          <Group
            title="Composed from"
            desc="The Product Hub components this pattern is built from — each one opens on its playground. Split by what the pattern can't exist without and what a product chooses to include."
          >
            {/* This list was already the answer to "what could sit here" — the
                upload, the context chips, the dates — but it rendered flat, so
                nothing said which parts were a choice. Splitting it shows the
                pattern as a kit rather than a fixed picture, which is the whole
                argument for it being a pattern and not a component.

                It lives here rather than on the canvas because optional parts
                are not a point in time. The states are a lifecycle — Empty,
                Composing, Submitted — and the track walks them in order;
                dropping a menu of capabilities into one of them would make that
                state mean something different from its neighbours, which is the
                mistake the pills made before the track replaced them. */}
            <div className="ai-parts">
              {[
                { key: "always", label: "Always", items: pattern.composedOf.filter((n) => !(pattern.optionalParts ?? []).includes(n)) },
                { key: "optional", label: "Optional", items: pattern.optionalParts ?? [] },
              ]
                .filter((g) => g.items.length > 0)
                .map((g) => (
                  <div key={g.key} className="ai-parts-group" data-kind={g.key}>
                    <span className="ai-parts-label">
                      {g.label}
                      <NumberChip size={16}>{g.items.length}</NumberChip>
                    </span>
                    <div className="ai-chips">
                      {g.items.map((name) => (
                        <button
                          key={name}
                          className="ai-chip"
                          data-optional={g.key === "optional" || undefined}
                          onClick={() => onSelectComponent(name)}
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </Group>
        </>
      )}
    </>
  );
}

// A documented block, on the system's existing `group-head` tier — title left,
// rationale right, the same two-column head as Section and Sub above it.
function Group({ title, desc, children }) {
  return (
    <div className="ai-group">
      <div className="group-head">
        <h4 className="group-title">{title}</h4>
        <p className="group-desc">{desc}</p>
      </div>
      {children}
    </div>
  );
}
