import { useCallback, useEffect, useRef, useState } from "react";
import { AI_PATTERNS, CONTROL_AXES, CONTROL_GRADES } from "../../data/aiPatterns.js";
import { PATTERN_PREVIEWS } from "./previews/index.js";
import { alternatives, continues, depth, place, route, slots } from "../../data/flow.js";
import { ArrowLeft, ArrowRight, PlayIcon, StopIcon } from "../common/Icon.jsx";
import { NumberChip } from "../common/NumberChip.jsx";

// One pattern, on the same lab shell every other hub uses: canvas on the left
// with prev/next in its nav and state pills in its foot, the 260px properties
// column on the right. A pattern isn't a component, but it is the same *kind*
// of page — one thing on stage, its spec beside it — so it gets the same
// furniture rather than a second layout meaning the same thing.
//
// The canvas does the explaining. Three things make it show rather than tell:
//
//   States      — the track switches between the pattern's real configurations,
//                 failures included, exactly as pills switch a Button's.
//   Play        — walks one route through the run, because a pattern is a
//                 behaviour over time and a strip of alternatives can't show
//                 that. It replaced a written Lifecycle block that said the
//                 same thing in prose. It walks a *route* and not the states
//                 array because the array holds alternatives side by side: 31
//                 of Play's 52 hops used to swap one for another under an
//                 animation reading "and then this happened".
//   Shape       — the track draws the structure the states actually have,
//                 derived in flow.js from `from`/`by` rather than declared.
//
// That last one was the correction. The track filled every segment to the left
// of the cursor and named the position "3/5", which asserts a sequence — and
// only five of the fourteen patterns are one. Streaming Response forks three
// ways at the end; Clear Refusal's four states are four kinds of refusal that
// never follow each other. So Play read as five screenshots on a timer.
//
// Now: fill follows the *route* to the current state, a segment joins the one
// before it only when it really follows it, and the readout says "Step 3" or
// "2 of 3" — the word that tells you whether these happen in order or instead
// of each other. Under it sits the trigger: what moved the system here. The
// track was showing order and hiding cause, and cause is most of a behaviour.
//
// The track and Play are one control, not two. A pattern is one thing
// unfolding, so the canvas is built to be watched: Play runs the states,
// transitions carry each into the next, and the track is there for stopping
// on the one you want to study.
//
// It replaced a strip of pills. Pills model alternatives — a Button is Primary
// or Secondary — and they were saying the wrong thing about a lifecycle; they
// also collapsed under five labels the length of "Awaiting approval". Numbering
// them made the crowding worse and diverged from the other hubs for a reason
// nobody could see. A track never collapses, because only the state you're on
// is named.
//
// A "Compare with what usually ships" control used to sit in the foot too. It
// was cut: the Anti-patterns view carries that argument with nine wireframes
// built for it, and the playground is better for being about one thing.
//
// Below the lab, only what the canvas can't show: whether to use it at all,
// what it forces you to decide, and what it's built from. A written Lifecycle
// and a Failure modes table used to sit there too — both were duplicating the
// state pills by the time the previews existed.
export function PatternDetail({ pattern, onSelectComponent, onSelectAiPattern }) {
  // A decision names the state that demonstrates it, and clicking that puts the
  // state on the canvas — which is above and usually off-screen by the time
  // anyone is reading the decisions, so the lab has to come back into view or
  // the click appears to do nothing.
  const labRef = useRef(null);
  const Preview = PATTERN_PREVIEWS[pattern.id];
  const planned = pattern.status === "planned";
  const states = pattern.states ?? [];

  // Which state is on the canvas, and whether we're drawing our default or the
  // common shortcut. Local rather than lifted to App: nothing outside this page
  // selects either. AiPatternsSection keys this component on the pattern id, so
  // switching patterns remounts and lands on the new one's first state.
  const [stateId, setStateId] = useState(states[0]?.id);
  const [playing, setPlaying] = useState(false);
  // The route Play is walking, pinned when it starts. It has to be pinned:
  // Play's first move is back to the top of the run, and a route derived from
  // whatever is on the canvas would recompute there and lose the ending the
  // user had chosen to watch.
  const [run, setRun] = useState(null);

  const active = states.find((st) => st.id === stateId) ?? states[0];
  // The run as slots, and where in it the canvas currently sits — see flow.js.
  // One segment per slot rather than per state is what makes the fill a prefix,
  // so the bar can't draw a hole and Play can't run backwards.
  const runSlots = states.length ? slots(states) : [];
  const at = active ? depth(states, active.id) - 1 : 0;
  // Whether anything follows the state on the canvas. "Nothing to change" is a
  // correct place to stop, and the bar shouldn't keep offering it a step 3.
  const goesOn = active ? continues(states, active.id) : false;
  // The ways the run can go from this position, this one included.
  const alts = active ? alternatives(states, active.id) : [];

  // A chain of timeouts rather than one interval, so each hop is driven by the
  // state it just landed on and the run stops cleanly at the end of the route.
  useEffect(() => {
    if (!playing || !run) return undefined;
    const pos = run.indexOf(stateId);
    if (pos === -1 || pos >= run.length - 1) {
      setPlaying(false);
      setRun(null);
      return undefined;
    }
    const t = setTimeout(() => setStateId(run[pos + 1]), 1700);
    return () => clearTimeout(t);
  }, [playing, run, stateId]);

  const togglePlay = useCallback(() => {
    if (playing) {
      setPlaying(false);
      setRun(null);
      return;
    }
    // Always from the top of the road that reaches whatever is on the canvas.
    // Play and the chooser compose this way: pick the ending you want to
    // watch, press Play, see the full road to it. Play used to override the
    // choice and march through every alternative in turn.
    //
    // Some states are a road of one — a way the pattern can start that nothing
    // follows, like "Nothing to change". There is no run to them, so Play
    // falls back to the pattern's main road rather than sitting there dead.
    const own = route(states, active.id);
    const walk = own.length > 1 ? own : route(states, states[0].id);
    setRun(walk);
    setStateId(walk[0]);
    setPlaying(true);
  }, [playing, active, states]);

  const pickState = useCallback((id) => {
    setPlaying(false);
    setRun(null);
    setStateId(id);
  }, []);

  // Same, plus scroll — used by the decisions, which sit well below the canvas.
  const showState = useCallback((id) => {
    setPlaying(false);
    setRun(null);
    setStateId(id);
    labRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

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
            <div className="pg-canvas-nav">
              {active && <span className="pg-state-label">{active.label}</span>}
              {arrows}
            </div>

            <div className="pg-canvas-center ai-preview">
              {Preview && active ? (
                /* Keyed on the state, so React remounts and the wireframe
                   arrives rather than snapping. Watching a pattern move from
                   Waiting to Streaming to Complete is the thing this page is
                   for; a hard swap reads as five separate screenshots. */
                <div className="ai-swap" key={active.id}>
                  <Preview state={active.id} />
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

            <div className="pg-canvas-foot">
              {/* Three rows, one level of the hierarchy each, top to bottom:
                  where you are in the run, which way it goes from here, and
                  what moved it here. Play holds its own cell in the grid, so
                  none of them competes with it for the end of a line. */}
              {states.length > 0 ? (
                <div className="ai-track">
                  {/* One segment per slot, and only when there is more than
                      one. A pattern with a single slot has no run to report —
                      Clear Refusal's four states happen instead of each other,
                      not one after another — so it gets no bar at all. */}
                  {runSlots.length > 1 && (
                    <div className="ai-track-run">
                      <div
                        className="ai-track-bar"
                        role="group"
                        aria-label={`Steps in ${pattern.name}`}
                      >
                        {runSlots.map((slot, n) => (
                          <button
                            key={slot[0].id}
                            className="ai-track-seg"
                            data-on={n <= at || undefined}
                            data-active={n === at || undefined}
                            data-unreached={(n > at && !goesOn) || undefined}
                            aria-label={`Step ${n + 1} of ${runSlots.length}: ${slot.map((st) => st.label).join(" or ")}`}
                            aria-current={n === at ? "step" : undefined}
                            onClick={() => pickState(slot[0].id)}
                          />
                        ))}
                      </div>
                      <span className="ai-track-pos">{place(states, active.id)}</span>
                    </div>
                  )}

                  {/* Pills only where there is genuinely something to pick. A
                      slot holding one state shows its name as a label, so the
                      appearance of pills is itself the signal that this step
                      forks. */}
                  {alts.length > 1 ? (
                    <div
                      className="ai-track-alts"
                      role="group"
                      aria-label={`Which way ${pattern.name} goes at step ${at + 1}`}
                    >
                      {alts.map((st) => (
                        <button
                          key={st.id}
                          className="ai-track-alt"
                          aria-current={st.id === active.id ? "true" : undefined}
                          onClick={() => pickState(st.id)}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <span className="ai-track-only">{active?.label}</span>
                  )}

                  {/* What moved the system into this state. Without it the
                      track shows the order and hides the cause, which is most
                      of what a behaviour is. */}
                  {active?.by && <span className="ai-track-by">{active.by}</span>}
                </div>
              ) : (
                <span />
              )}

              {/* Bottom right, in the slot the Product Hub gives its canvas
                  action — and the primary gesture on this page. */}
              {/* Play appears exactly when the bar does. A one-slot pattern has
                  no run to walk: Clear Refusal's four states are four kinds of
                  refusal, and Play used to march through them as though one
                  caused the next — 3 of its 3 hops sideways. */}
              {runSlots.length > 1 ? (
                <button
                  className="ai-play"
                  data-on={playing || undefined}
                  onClick={togglePlay}
                >
                  {playing ? <StopIcon /> : <PlayIcon />}
                  <span>{playing ? "Stop" : "Play"}</span>
                </button>
              ) : (
                <span />
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
          {/* The caption for whatever is on the canvas, and the first thing
              under the title because it's what makes clicking a pill mean
              something. "2 of 5" is doing quiet work: it implies a sequence
              and implies there are more to click, without instructional copy
              telling anyone to click them. */}
          {/* What the state on the canvas means. Not its name — the canvas
              captions that and the foot's pills carry it, and three renderings
              of one string was the duplication that started all this. Not its
              trigger either: that sits under the pills it belongs to. */}
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
