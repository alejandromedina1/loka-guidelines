import { useCallback, useEffect, useState } from "react";
import { AI_PATTERNS, CONTROL_AXES, CONTROL_GRADES } from "../../data/aiPatterns.js";
import { PATTERN_PREVIEWS } from "./previews/index.js";
import { ArrowLeft, ArrowRight, PlayIcon, StopIcon } from "../common/Icon.jsx";

// One pattern, on the same lab shell every other hub uses: canvas on the left
// with prev/next in its nav and state pills in its foot, the 260px properties
// column on the right. A pattern isn't a component, but it is the same *kind*
// of page — one thing on stage, its spec beside it — so it gets the same
// furniture rather than a second layout meaning the same thing.
//
// The canvas does the explaining. Three things make it show rather than tell:
//
//   States      — pills switch between the pattern's real configurations,
//                 failures included, exactly as they switch a Button's.
//   Play        — walks them in order, because a pattern is a behaviour over
//                 time and a pill strip otherwise reads as a set of unrelated
//                 alternatives. This replaced a written Lifecycle block that
//                 said the same thing in prose.
// The track and Play are one control, not two. A pattern is one thing
// unfolding, so the canvas is built to be watched: Play runs the sequence,
// transitions carry each state into the next, and the track is there for
// stopping on the one you want to study.
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
  const Preview = PATTERN_PREVIEWS[pattern.id];
  const planned = pattern.status === "planned";
  const states = pattern.states ?? [];

  // Which state is on the canvas, and whether we're drawing our default or the
  // common shortcut. Local rather than lifted to App: nothing outside this page
  // selects either. AiPatternsSection keys this component on the pattern id, so
  // switching patterns remounts and lands on the new one's first state.
  const [stateId, setStateId] = useState(states[0]?.id);
  const [playing, setPlaying] = useState(false);

  const active = states.find((st) => st.id === stateId) ?? states[0];
  const index = states.findIndex((st) => st.id === active?.id);
  const atEnd = index >= states.length - 1;

  // A chain of timeouts rather than one interval, so each hop is driven by the
  // state it just landed on and the run stops cleanly at the last pill.
  useEffect(() => {
    if (!playing) return undefined;
    if (atEnd) {
      setPlaying(false);
      return undefined;
    }
    const t = setTimeout(() => setStateId(states[index + 1].id), 1700);
    return () => clearTimeout(t);
  }, [playing, atEnd, index, states]);

  const togglePlay = useCallback(() => {
    if (playing) {
      setPlaying(false);
      return;
    }
    // Pressing Play at the end replays from the top rather than doing nothing.
    if (atEnd) setStateId(states[0].id);
    setPlaying(true);
  }, [playing, atEnd, states]);

  const pickState = useCallback((id) => {
    setPlaying(false);
    setStateId(id);
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
      <div className="pg ai-lab">
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
              {/* Filled up to where you are, so the track reads as progress
                  rather than as a row of tabs. Only the current state is
                  named — which is what stops a five-state pattern with long
                  labels running out of room. */}
              {states.length > 0 ? (
                <div className="ai-track">
                  <div className="ai-track-bar">
                    {states.map((st, n) => (
                      <button
                        key={st.id}
                        className="ai-track-seg"
                        data-on={n <= index || undefined}
                        data-active={n === index || undefined}
                        aria-label={st.label}
                        aria-current={n === index ? "true" : undefined}
                        onClick={() => pickState(st.id)}
                      />
                    ))}
                  </div>
                  <span className="ai-track-label">
                    {active?.label}
                    <span className="ai-track-pos">
                      {index + 1}/{states.length}
                    </span>
                  </span>
                </div>
              ) : (
                <span />
              )}

              {/* Bottom right, in the slot the Product Hub gives its canvas
                  action — and the primary gesture on this page. */}
              {states.length > 1 ? (
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
          {active && (
            <div className="ai-now">
              <span className="ai-now-head">
                <span className="ai-now-label">{active.label}</span>
              </span>
              <p className="ai-now-text">{active.note}</p>
            </div>
          )}

          {!planned && (
            <div className="bp-panel">
              <span className="bp-panel-badge">Grades</span>
              {/* Graded, not described. Tone carries the obligation so the five
                  scan in one glance — which is the only reason to put a table
                  in a 260px column rather than a paragraph. The reasoning for
                  each grade is a block below. */}
              <dl className="ai-grades">
                {CONTROL_AXES.map((a) => {
                  const grade = CONTROL_GRADES[pattern.controls?.[a.id]?.grade ?? "na"];
                  return (
                    <div key={a.id} className="ai-grade">
                      <dt>{a.label}</dt>
                      <dd>
                        <span className="ai-grade-chip" data-tone={grade.tone}>
                          {grade.label}
                        </span>
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </div>
          )}
        </div>
      </div>

      {planned ? (
        <div className="ai-planned">
          <p>
            This pattern is in the taxonomy but hasn't been written up yet. It's listed so the shelf
            is honest about its own scope — the gap is visible rather than implied.
          </p>
          <p className="ai-planned-ask">
            Picking it up means the same three things the documented patterns carry: its states as
            previews on the canvas, when to use and avoid it, and the decisions it forces with our
            default for each.
          </p>
        </div>
      ) : (
        <>
          <Group
            title="When to use it"
            desc="The second column does the work — a pattern with no stated limits gets applied everywhere."
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
                    <span className="ai-when-count">{col.items.length}</span>
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
            desc="Every one is a real fork with no neutral answer. The right column is ours — argue with it in review, don't skip it."
          >
            {/* A two-column table, so the forks read straight down the left
                rail and you can see how many there are before reading any
                answer. Stacked, each question was separated from the next by a
                paragraph of ours, and five tinted callouts down a page turned
                the emphasis into wallpaper. Saying "our default" once in the
                header also retires five repeated tags. */}
            <dl className="ai-dec">
              <div className="ai-dec-head" aria-hidden>
                <span>The fork</span>
                <span>Our default</span>
              </div>
              {pattern.decisions.map((d, n) => (
                <div key={d.q} className="ai-dec-row">
                  <dt>
                    <span className="ai-dec-n">{String(n + 1).padStart(2, "0")}</span>
                    <span className="ai-dec-q">{d.q}</span>
                  </dt>
                  <dd>{d.loka}</dd>
                </div>
              ))}
            </dl>
          </Group>

          <Group
            title="Control & trust"
            desc="Five verbs, graded every time. N/A is a valid grade — an unstated one is an unfinished pattern."
          >
            <dl className="ai-ctl">
              {CONTROL_AXES.map((a) => {
                const entry = pattern.controls?.[a.id] ?? { grade: "na" };
                const grade = CONTROL_GRADES[entry.grade];
                return (
                  <div key={a.id} className="ai-ctl-row">
                    <dt>
                      <span className="ai-ctl-name">{a.label}</span>
                      <span className="ai-ctl-q">{a.desc}</span>
                    </dt>
                    <dd>
                      <span className="ai-grade-chip" data-tone={grade.tone}>
                        {grade.label}
                      </span>
                      {entry.note && <span className="ai-ctl-note">{entry.note}</span>}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </Group>

          <Group
            title="Composed from"
            desc="The seam back to Product Hub — these open on the playground canvas."
          >
            <div className="ai-chips">
              {pattern.composedOf.map((name) => (
                <button key={name} className="ai-chip" onClick={() => onSelectComponent(name)}>
                  {name}
                </button>
              ))}
            </div>
          </Group>

          {pattern.shippedIn && (
            <Group title="Shipped in" desc="Evidence we've run it, not just recommended it.">
              <p className="ai-shipped">{pattern.shippedIn}</p>
            </Group>
          )}
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
