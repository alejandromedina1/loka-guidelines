import { Body, Btn, Btns, Chip, Frame, FrameBar, Label, Note, Part, Say, Steps } from "./kit.jsx";
import { VoiceStage } from "./voice.jsx";
import { Board, Obj, OnObject } from "./canvas.jsx";

// Background Work on a six-year statement import — the shape of job this
// pattern is for. It is minutes rather than seconds, the result is worth
// coming back for, and nobody is going to sit and watch it.
//
// The steps are what make the pattern legible. "47%" says nothing about what
// happens if somebody closes the tab at 47%; a named step says exactly what
// survives, which is what every one of this pattern's decisions turns on.
const STEPS = ["Fetch statements", "Match payments", "Categorise", "Build the report"];

// The attendance track, and the reason this preview exists in the shape it
// does. Every state of this pattern used to be a callout over a step meter,
// which is what five other patterns draw — and it meant the one thing this
// pattern is about was the one thing never on screen. "It finished while you
// were away" was a sentence; the hours nobody was there were nothing at all.
//
// So the drawing is the attendance, not the progress. The rail runs from the
// moment somebody left to the moment they came back, the run's own event sits
// where it actually happened, and the space after it is the gap the result had
// to survive. On Waiting on you that gap IS the failure — a decision asked for
// at 14:02 and answered at 16:40 is two and a half hours of a run sitting idle
// because nobody heard it, which no callout was ever going to convey.
const LEFT = 13 * 60 + 52;
const BACK = 16 * 60 + 40;
const clock = (m) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
const span = (m) => {
  const h = Math.floor(m / 60);
  return h ? `${h}h ${m % 60}m` : `${m}m`;
};
const at = (m) => `${(((m - LEFT) / (BACK - LEFT)) * 100).toFixed(1)}%`;

function Away({ event, when, back = true }) {
  return (
    <div
      className="mk-away"
      role="img"
      aria-label={
        back
          ? `Left at ${clock(LEFT)}. ${event} at ${clock(when)}. Came back at ${clock(BACK)}, ${span(BACK - when)} later.`
          : `Left at ${clock(LEFT)}. Still running.`
      }
    >
      <span className="mk-away-rail" />
      {/* The gap: from whatever the run did to the moment somebody was there to
          see it. Open-ended when they haven't come back yet, which is a
          different shape rather than a different colour. */}
      <span
        className="mk-away-gap"
        data-open={back ? undefined : ""}
        style={{ left: at(when), right: back ? "0%" : undefined }}
      />
      <span className="mk-away-mark" style={{ left: at(LEFT) }}>
        <span className="mk-away-label">{`Left ${clock(LEFT)}`}</span>
      </span>
      <span className="mk-away-mark" data-event="" style={{ left: at(when) }}>
        <span className="mk-away-label">{`${event} ${clock(when)}`}</span>
      </span>
      {back && (
        <span className="mk-away-mark" data-back="" style={{ left: "100%" }}>
          <span className="mk-away-label">{`Back ${clock(BACK)}`}</span>
        </span>
      )}
      <span className="mk-away-span">
        {back ? `${span(BACK - when)} with nobody here` : "Nobody here from now on"}
      </span>
    </div>
  );
}

export function BackgroundWorkPreview({ work, set }) {
  const { at, outcome } = work;

  if (outcome === "done") {
    return (
      <Frame width={540}>
        <FrameBar title="Statement import · 6 years" />
        <Body>
          <Part name="Banner" block>
            <Note
              kind="Done"
              title="Finished while you were away"
              actions={
                <Part name="Button">
                  <Btns align="end">
                    <Btn>Keep it for later</Btn>
                    <Btn variant="primary">Open the report</Btn>
                  </Btns>
                </Part>
              }
            >
              {/* No expiry on the result, and the frame says so. A delivery that
                  times out throws away exactly the work this pattern protects. */}
              1,204 payments across 6 years. This stays here until you open it.
            </Note>
          </Part>
          <Away event="Finished" when={14 * 60 + 7} />
        </Body>
      </Frame>
    );
  }

  if (outcome === "needs") {
    return (
      <Frame width={540}>
        <FrameBar title="Statement import · 6 years" />
        <Body>
          <Part name="Banner" block>
            <Note
              kind="Waiting on you"
              title="Two accounts are both called Northwind"
              actions={
                <Part name="Button">
                  <Btns align="end">
                    <Btn onClick={() => set({ ...work, outcome: null, at: 2 })}>Keep them apart</Btn>
                    <Btn variant="primary" onClick={() => set({ ...work, outcome: null, at: 2 })}>
                      Treat as one
                    </Btn>
                  </Btns>
                </Part>
              }
            >
              It stopped rather than guessed. 412 payments are waiting on this.
            </Note>
          </Part>
          <Away event="Stopped" when={14 * 60 + 2} />
          <Part name="Progress Bar" block>
            <Steps items={STEPS} at={1} paused notes={["", "Held since 14:02", "", ""]} />
          </Part>
        </Body>
      </Frame>
    );
  }

  if (outcome === "failed") {
    return (
      <Frame width={540}>
        <FrameBar title="Statement import · 6 years" />
        <Body>
          <Part name="Banner" block>
            <Note
              tone="warn"
              kind="Stopped"
              title="Matching payments stopped at 2021"
              actions={
                <Part name="Button">
                  <Btns align="end">
                    <Btn variant="primary" onClick={() => set({ ...work, outcome: null, at: 1 })}>
                      Carry on from 2021
                    </Btn>
                  </Btns>
                </Part>
              }
            >
              {/* Resume rather than restart: nobody was watching, so a second run
                  from the top is a duplicate nobody would catch. */}
              Four years are already in. Carrying on picks up where it stopped.
            </Note>
          </Part>
          <Away event="Stopped" when={14 * 60 + 11} />
          <Part name="Progress Bar" block>
            <Steps items={STEPS} at={1} failed={1} />
          </Part>
        </Body>
      </Frame>
    );
  }

  if (at > 0) {
    return (
      <Frame width={540}>
        <FrameBar title="Statement import · 6 years" />
        <Body>
          <span className="mk-scope-head">
            <Label>Still going</Label>
            <Chip>Step 2 of 4</Chip>
          </span>
          {/* Where it got to, not a bar that restarted with the page. The step
              is the thing that survived the tab closing. */}
          <Away event="Still going at" when={14 * 60 + 30} />
          <Part name="Progress Bar" block>
            <Steps items={STEPS} at={1} notes={["Done at 13:58", "782 of 1,204", "", ""]} />
          </Part>
          <span className="mk-foot">
            <Say tone="mute" size="sm">Carries on whether this is open or not</Say>
            <Part name="Button">
              <Btns align="end">
                <Btn>Stop it</Btn>
              </Btns>
            </Part>
          </span>
        </Body>
      </Frame>
    );
  }

  return (
    <Frame width={540}>
      <FrameBar title="Statement import · 6 years" />
      <Body>
        <Part name="Banner" block>
          <Note
            kind="Still running"
            title="This carries on after you close the tab"
            actions={
              <Part name="Button">
                <Btns align="end">
                  <Btn>Stop it instead</Btn>
                  <Btn variant="primary" onClick={() => set({ ...work, at: 1 })}>
                    Check on it
                  </Btn>
                </Btns>
              </Part>
            }
          >
            You&apos;ll get a message when it&apos;s done. Nothing else to do.
          </Note>
        </Part>
        <Away event="Leaving" when={LEFT} back={false} />
      </Body>
    </Frame>
  );
}

// The run is the working data: how far it got, and how it ended if it did.
// Coming back part-way is a real position rather than a rendering of one,
// which is why `progress` is reachable both by tab and by waiting.
BackgroundWorkPreview.work = {
  for: (id) =>
    ({
      handed: { at: 0, outcome: null },
      progress: { at: 1, outcome: null },
      finished: { at: 4, outcome: "done" },
      needs: { at: 2, outcome: "needs" },
      failed: { at: 2, outcome: "failed" },
    })[id] ?? { at: 0, outcome: null },

  state: (w) =>
    w.outcome === "done"
      ? "finished"
      : w.outcome === "needs"
        ? "needs"
        : w.outcome === "failed"
          ? "failed"
          : w.at > 0
            ? "progress"
            : "handed",

  // Leaving, then finishing — the two moves that are the system's. Neither
  // Waiting on you nor Failed is on here: both are reachable by tab, because a
  // wireframe that stops for a question or breaks on its own teaches that
  // stopping and breaking are the ordinary course of a background run.
  tick: (w) =>
    w.outcome
      ? null
      : w.at === 0
        ? { work: { ...w, at: 1 }, in: 2600 }
        : w.at === 1
          ? { work: { ...w, at: 4, outcome: "done" }, in: 3400 }
          : null,
};

// ── Spoken ──────────────────────────────────────────────────────────────────
//
// Same `work`, and the surface removes the thing the pattern is built around.
// There is no elsewhere to be: somebody is in the room or they are not, and a
// run that finishes to an empty room has simply not been delivered.
//
// So the finished state waits rather than announces, and the one case worth
// breaking the silence for is the question — a run stopped on a decision
// nobody hears about has quietly stopped being a background run at all.
function BackgroundVoice({ work, set }) {
  const { at, outcome } = work;

  if (outcome === "done") {
    return (
      <VoiceStage
        device="Watch"
        mood="speaking"
        heard="Anything finished?"
        caption="The six-year import is done — 1,204 payments. It'll keep until you want it."
      >
        <Btn variant="primary">Open it on the phone</Btn>
      </VoiceStage>
    );
  }

  if (outcome === "needs") {
    return (
      <VoiceStage
        device="Watch"
        mood="listening"
        caption="Stopped on one thing: there are two accounts called Northwind. One, or two?"
      >
        <Btn onClick={() => set({ ...work, outcome: null, at: 2 })}>Two</Btn>
        <Btn variant="primary" onClick={() => set({ ...work, outcome: null, at: 2 })}>
          One
        </Btn>
      </VoiceStage>
    );
  }

  if (outcome === "failed") {
    return (
      <VoiceStage
        device="Watch"
        mood="stopped"
        caption="It stopped at matching payments. Four years are in and the rest can carry on from there."
      >
        <Btn variant="primary" onClick={() => set({ ...work, outcome: null, at: 1 })}>
          Carry on
        </Btn>
      </VoiceStage>
    );
  }

  if (at > 0) {
    return (
      <VoiceStage
        device="Watch"
        mood="speaking"
        heard="How's the import getting on?"
        caption="Matching payments — about two thirds through."
      />
    );
  }

  return (
    <VoiceStage device="Watch" mood="rest" caption="It'll keep going. Ask any time how it's getting on.">
      <Btn variant="primary" onClick={() => set({ ...work, at: 1 })}>
        How's it getting on?
      </Btn>
    </VoiceStage>
  );
}

BackgroundWorkPreview.surfaces = { voice: BackgroundVoice };

// ── On a canvas ─────────────────────────────────────────────────────────────
//
// Same `work`. The run belongs to an object rather than to a page, which is
// what makes coming back cheap: the board is where the work was left, so
// returning to it is returning to the run.
//
// It also fixes the delivery problem. A message can be missed once and then it
// is gone; a mark on the object is still there whenever somebody next looks at
// the object, which is the only place they were ever going to look.
function BackgroundCanvas({ work, set }) {
  const { at, outcome } = work;

  const mark = () => {
    if (outcome === "done") return <span className="cv-layer" data-tone="next">Finished — not looked at yet</span>;
    if (outcome === "needs") return <span className="cv-layer" data-provisional>Stopped on a question</span>;
    if (outcome === "failed") return <span className="cv-layer" data-provisional>Stopped at 2021 — four years in</span>;
    if (at > 0) return <span className="cv-layer">Matching payments · 782 of 1,204</span>;
    return <span className="cv-layer">Running — carries on without you</span>;
  };

  return (
    <Board title="Board · 2019–2024">
      <Obj label="Statement import" meta="6 years" tone={outcome === "done" ? "next" : undefined} wide>
        {mark()}
        {outcome === "needs" && (
          <OnObject>
            <span className="cv-layer">Two accounts called Northwind</span>
            <Btns align="end">
              <Btn onClick={() => set({ ...work, outcome: null, at: 2 })}>Keep apart</Btn>
              <Btn variant="primary" onClick={() => set({ ...work, outcome: null, at: 2 })}>
                Treat as one
              </Btn>
            </Btns>
          </OnObject>
        )}
        {outcome === "failed" && (
          <OnObject>
            <Btns align="end">
              <Btn variant="primary" onClick={() => set({ ...work, outcome: null, at: 1 })}>
                Carry on from 2021
              </Btn>
            </Btns>
          </OnObject>
        )}
      </Obj>

      {/* The rest of the board, so "somebody is looking somewhere else" is a
          thing the drawing shows rather than a thing the note claims. */}
      <Obj label="Spending report" meta="March" />
      <Obj label="Subscriptions" meta="14 active" />

      <span className="cv-foot">
        <Say tone="mute" size="sm">
          {outcome === "done" ? "Stays marked until it's opened" : "Marked on the object, not on the board"}
        </Say>
        {!outcome && at === 0 && (
          <Btns align="end">
            <Btn onClick={() => set({ ...work, at: 1 })}>Check on it</Btn>
          </Btns>
        )}
      </span>
    </Board>
  );
}

BackgroundWorkPreview.surfaces.canvas = BackgroundCanvas;
