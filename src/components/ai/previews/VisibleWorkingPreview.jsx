import { Body, Btn, Btns, Frame, FrameBar, Label, Note, Part, Say } from "./kit.jsx";
import { VoiceStage } from "./voice.jsx";
import { Board, Obj, OnObject } from "./canvas.jsx";

// Visible Working on a question that genuinely takes a while: what changed in
// somebody's spending and why. The route is worth showing because half of why
// the answer says what it says is what it read to get there.
//
// The trace is NOT a plan. Plan Preview draws a fixed list somebody can edit
// before anything runs; this draws a list that is being discovered, one line at
// a time, and nobody can edit it because it has already happened. Drawing them
// the same way would teach that a plan and a trace are the same object, which
// is the mistake that makes people try to edit a trace.
//
// Each line says what it LOOKED AT, never what it found. A finding stated
// mid-run is a claim with no answer attached, and people quote those.
const TRACE = [
  { label: "Read March statement", meta: "142 payments" },
  { label: "Matched against February", meta: "138 payments" },
  { label: "Checked subscription prices", meta: "3 sources" },
  { label: "Compared totals by category", meta: "9 categories" },
];

// A long run is a different shape, not the same shape with more in it. Older
// steps become a count so the live line stays where somebody can see it.
const EARLIER = 11;

function Step({ label, meta, at }) {
  return (
    <li className="mk-trace-step" data-at={at}>
      <span className="mk-trace-label">{label}</span>
      {meta && <span className="mk-trace-meta">{meta}</span>}
      <span className="vh">{at === "now" ? " — running" : at === "stuck" ? " — stopped" : " — done"}</span>
    </li>
  );
}

function Trace({ at, stuck, long }) {
  const steps = TRACE.slice(0, Math.min(at + 1, TRACE.length));
  return (
    <ol className="mk-trace">
      {/* The fold. Not an accordion somebody has to open to find the live step
          — the live step is always the last line, and what folds is the part
          already behind them. */}
      {long && (
        <Part name="Accordion" block>
          <li className="mk-trace-fold">
            <span className="mk-trace-label">{`${EARLIER} earlier steps`}</span>
            <span className="mk-trace-meta">Show</span>
          </li>
        </Part>
      )}
      {/* Only the first line is marked in anatomy; a null name marks nothing. */}
      {steps.map((s, i) => (
        <Part key={s.label} name={i === 0 ? "List Item" : null} block>
          <Step
            label={s.label}
            meta={s.meta}
            at={i < at ? "done" : stuck ? "stuck" : "now"}
          />
        </Part>
      ))}
    </ol>
  );
}

export function VisibleWorkingPreview({ work }) {
  const { at, outcome, long } = work;
  const stuck = outcome === "stuck";
  const done = outcome === "done";

  return (
    <Frame width={540}>
      <FrameBar title="Why is March higher than February?" />
      <Body>
        {done ? (
          <>
            {/* Folded once it finishes: open under a finished answer, the
                working competes with the thing somebody actually asked for. */}
            <Part name="Accordion" block>
              <span className="mk-trace-folded">
                <span className="mk-trace-label">{`${TRACE.length} steps · 4.2s`}</span>
                <span className="mk-trace-meta">Show working</span>
              </span>
            </Part>
            <Say>March is £214 higher, almost all of it three subscriptions that went up together.</Say>
          </>
        ) : (
          <>
            <Label>{long ? "Working · about a minute so far" : "Working"}</Label>
            <Trace at={at} stuck={stuck} long={long} />
            {stuck && (
              <Note
                tone="warn"
                kind="Stopped"
                title="The price source stopped answering"
                actions={
                  <Part name="Button">
                    <Btns align="end">
                      <Btn>Carry on without it</Btn>
                      <Btn variant="primary">Try that step again</Btn>
                    </Btns>
                  </Part>
                }
              >
                The two steps above it still hold.
              </Note>
            )}
            {!stuck && (
              <span className="mk-foot">
                <Say tone="mute" size="sm">Reading only what you allowed</Say>
                <Part name="Button">
                  <Btns align="end">
                    <Btn>Stop</Btn>
                  </Btns>
                </Part>
              </span>
            )}
          </>
        )}
      </Body>
    </Frame>
  );
}

VisibleWorkingPreview.work = {
  for: (id) =>
    ({
      starting: { at: 0, outcome: null, long: false },
      working: { at: 2, outcome: null, long: false },
      long: { at: 2, outcome: null, long: true },
      done: { at: TRACE.length - 1, outcome: "done", long: false },
      stuck: { at: 2, outcome: "stuck", long: false },
    })[id] ?? { at: 0, outcome: null, long: false },

  state: (w) =>
    w.outcome === "done" ? "done" : w.outcome === "stuck" ? "stuck" : w.long ? "long" : w.at > 0 ? "working" : "starting",

  // The steps arriving is the pattern. A stall is not on here: a trace that
  // breaks by itself teaches that running is what breaks.
  //
  // A long run is a lag, and a lag resolves: it finishes on its own a moment
  // later. It used to hold forever — the one state of this pattern that was a
  // spinner with no end.
  tick: (w) =>
    w.outcome
      ? null
      : w.long
        ? { work: { ...w, long: false, outcome: "done", at: TRACE.length - 1 }, in: 1800 }
        : w.at < TRACE.length - 1
        ? { work: { ...w, at: w.at + 1 }, in: w.at === 0 ? 700 : 1000 }
        : { work: { ...w, outcome: "done" }, in: 900 },
};

// ── Spoken ──────────────────────────────────────────────────────────────────
//
// Same `work`. The surface inverts the pattern: on a screen the working is free
// to show because somebody can ignore it, and out loud every step costs the
// channel. So silence is the default and it breaks once, for the step that ran
// long enough that silence would read as a dead device.
function WorkingVoice({ work }) {
  const { at, outcome, long } = work;

  if (outcome === "done")
    return (
      <VoiceStage
        device="Kitchen speaker"
        mood="speaking"
        heard="Why is March higher than February?"
        caption="£214 higher — almost all of it three subscriptions that went up together."
      />
    );

  if (outcome === "stuck")
    return (
      <VoiceStage
        device="Kitchen speaker"
        mood="stopped"
        caption="The price check stopped answering. The rest is done — want it without that part?"
      >
        <Btn variant="primary">Yes</Btn>
      </VoiceStage>
    );

  if (long)
    return (
      <VoiceStage
        device="Kitchen speaker"
        mood="thinking"
        caption="Still going — about a minute. Checking prices across three years."
      />
    );

  if (at > 0)
    return <VoiceStage device="Kitchen speaker" mood="thinking" caption="Checking subscription prices." />;

  return <VoiceStage device="Kitchen speaker" mood="thinking" heard="Why is March higher than February?" />;
}

VisibleWorkingPreview.surfaces = { voice: WorkingVoice };

// ── On a canvas ─────────────────────────────────────────────────────────────
//
// Same `work`. The working goes on the object being built rather than beside
// it, which removes the matching problem a panel creates: on a screen somebody
// reads a step and then finds the thing it is about; here they are one glance.
function WorkingCanvas({ work }) {
  const { at, outcome, long } = work;
  const stuck = outcome === "stuck";
  const done = outcome === "done";

  return (
    <Board title="Board · Spending">
      <Obj
        label="March vs February"
        meta={done ? "£214 higher" : long ? "About a minute so far" : "Being worked on"}
        tone={done ? "next" : undefined}
        wide
      >
        {done ? (
          <span className="cv-layer" data-tone="next">Three subscriptions went up together</span>
        ) : stuck ? (
          <>
            <span className="cv-layer" data-provisional>Stopped on the price check</span>
            <OnObject>
              <Btns align="end">
                <Btn>Carry on without it</Btn>
                <Btn variant="primary">Try again</Btn>
              </Btns>
            </OnObject>
          </>
        ) : (
          <span className="cv-layer">{TRACE[Math.min(at, TRACE.length - 1)].label}</span>
        )}
      </Obj>

      <Obj label="February" meta="138 payments" />
      <Obj label="March" meta="142 payments" />
    </Board>
  );
}

VisibleWorkingPreview.surfaces.canvas = WorkingCanvas;
