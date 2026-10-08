import { Body, Btn, Btns, Field, Frame, FrameBar, Label, Part, Say } from "./kit.jsx";
import { VoiceStage } from "./voice.jsx";
import { Board, Obj, OnObject } from "./canvas.jsx";

// Stop & Steer on a note being drafted to somebody's accountant — long enough
// to go wrong in public, and cheap enough to be worth salvaging rather than
// re-asking.
//
// The drawing is NOT the stop button. Word by Word already draws a stream with
// Stop on it, and the Interrupt axis is graded on every pattern in the hub, so
// a second wireframe of a stream with a stop teaches nothing new. What this
// pattern adds is what happens to the half — so the subject here is the CUT:
// where it fell, what is on each side of it, and the three things that can
// happen to what is above it.
const LINES = [
  "March came in £214 over February.",
  "Almost all of it is three subscriptions that went up in the same week.",
  "Disney+ moved from £7.99 to £10.99, and two others followed.",
  "The full category breakdown is below, with the year-on-year figures beside it",
];

function Written({ upto, cut }) {
  return (
    <span className="mk-draft">
      {LINES.slice(0, upto).map((l, i) => (
        <span key={l} className="mk-draft-line" data-last={cut && i === upto - 1 ? "" : undefined}>
          {l}
        </span>
      ))}
      {/* The cut, drawn. This is the whole pattern: a rule across the answer
          with a word on it, so what was kept and what never arrived are two
          sides of a line rather than a claim in a callout. */}
      {cut && <span className="mk-cut">Stopped here</span>}
    </span>
  );
}

export function StopSteerPreview({ work, set }) {
  const { at, cut, route } = work;
  const stopped = cut !== null;

  return (
    <Frame width={540}>
      <FrameBar title="Note to your accountant · draft" />
      <Body>
        <Label>
          {route === "drop" ? "Dropped" : route === "resume" ? "Carried on from the cut" : stopped ? "Stopped" : "Writing"}
        </Label>

        {route === "drop" ? (
          <>
            {/* Kept for a moment after it is thrown, because wanting it back is
                the commonest thing that happens next — and a silent permanent
                delete is what makes people stop pressing Stop at all. */}
            <span className="mk-draft" data-dropped="">
              {LINES.slice(0, cut).map((l) => (
                <span key={l} className="mk-draft-line">{l}</span>
              ))}
            </span>
            <span className="mk-foot">
              <Say tone="mute" size="sm">Recoverable for 30 seconds</Say>
              <Part name="Button" block>
                <Btns align="end">
                  <Btn variant="primary" onClick={() => set({ ...work, route: null })}>
                    Put it back
                  </Btn>
                </Btns>
              </Part>
            </span>
          </>
        ) : (
          <>
            <Written upto={route === "resume" ? LINES.length : at} cut={stopped && route !== "resume"} />

            {route === "steering" && (
              <span className="mk-steer">
                <Label>Carry on, but</Label>
                <Part name="Input Field" block>
                  <Field placeholder="…leave out the breakdown" state="focus" />
                </Part>
              </span>
            )}

            <span className="mk-foot">
              <Say tone="mute" size="sm">
                {route === "resume"
                  ? "Picked up at the cut, not from the top"
                  : stopped
                    ? `${at} of about 9 lines kept`
                    : "Stop keeps what's written"}
              </Say>
              {/* Resumed draws no button, so the marker would sit on an empty row. */}
              <Part name={route === "resume" ? null : "Button"} block>
                <Btns align="end">
                  {!stopped && (
                    <Btn variant="primary" onClick={() => set({ ...work, cut: at })}>
                      Stop
                    </Btn>
                  )}
                  {stopped && route === null && (
                    <>
                      <Btn onClick={() => set({ ...work, route: "drop" })}>Drop it</Btn>
                      <Btn onClick={() => set({ ...work, route: "steering" })}>Change something</Btn>
                      <Btn variant="primary" onClick={() => set({ ...work, route: "resume" })}>
                        Carry on
                      </Btn>
                    </>
                  )}
                  {route === "steering" && (
                    <Btn variant="primary" onClick={() => set({ ...work, route: "resume" })}>
                      Carry on like that
                    </Btn>
                  )}
                </Btns>
              </Part>
            </span>
          </>
        )}
      </Body>
    </Frame>
  );
}

StopSteerPreview.work = {
  for: (id) =>
    ({
      running: { at: 2, cut: null, route: null },
      stopped: { at: 3, cut: 3, route: null },
      steering: { at: 3, cut: 3, route: "steering" },
      resumed: { at: 3, cut: 3, route: "resume" },
      dropped: { at: 3, cut: 3, route: "drop" },
    })[id] ?? { at: 1, cut: null, route: null },

  state: (w) =>
    w.route === "steering"
      ? "steering"
      : w.route === "resume"
        ? "resumed"
        : w.route === "drop"
          ? "dropped"
          : w.cut !== null
            ? "stopped"
            : "running",

  // It writes while nobody stops it, and then waits. The run does not end on
  // its own here: this pattern is about the interruption, so the frame has to
  // still be going when somebody arrives, or there is nothing to interrupt.
  //
  // Carried on is the one exception: you let it finish, so it picks up at the
  // cut and keeps writing — it used to sit still, which drew the opposite of
  // "picks up at the cut".
  tick: (w) =>
    w.at >= LINES.length || (w.cut !== null && w.route !== "resume")
      ? null
      : { work: { ...w, at: w.at + 1 }, in: 1100 },
};

// ── Spoken ──────────────────────────────────────────────────────────────────
//
// Same `work`, and the surface gives the pattern away for free: talking over a
// device stops it, so there is no control to design and no cost to stopping.
// The entire design moves to the other half — what happens to what was already
// said, which on this surface has already been delivered and cannot be kept,
// marked or thrown away.
function SteerVoice({ work, set }) {
  const { cut, route } = work;

  if (route === "drop")
    return (
      <VoiceStage device="Car" mood="rest" caption="Dropped. Say “what was that again” and it comes back." />
    );

  if (route === "resume")
    return (
      <VoiceStage
        device="Car"
        mood="speaking"
        caption="Disney+ moved from £7.99 to £10.99, and two others followed."
      />
    );

  if (route === "steering")
    return (
      <VoiceStage
        device="Car"
        mood="listening"
        heard="…skip the breakdown"
        caption="Leaving the breakdown out."
      >
        <Btn variant="primary" onClick={() => set({ ...work, route: "resume" })}>Carry on</Btn>
      </VoiceStage>
    );

  if (cut !== null)
    return (
      <VoiceStage device="Car" mood="listening" heard="Hang on—" caption="Stopped.">
        <Btn onClick={() => set({ ...work, route: "drop" })}>Leave it</Btn>
        <Btn variant="primary" onClick={() => set({ ...work, route: "resume" })}>Carry on</Btn>
      </VoiceStage>
    );

  return (
    <VoiceStage
      device="Car"
      mood="speaking"
      caption="March came in £214 over February. Almost all of it is three subscriptions—"
    />
  );
}

StopSteerPreview.surfaces = { voice: SteerVoice };

// ── On a canvas ─────────────────────────────────────────────────────────────
//
// Same `work`. Stopping keeps the last version that FINISHED rather than a
// half-made object, which is the difference this surface makes: half a sentence
// is readable and half an object is a thing somebody will move, snap to and
// build on before noticing it was never finished.
function SteerCanvas({ work, set }) {
  const { at, cut, route } = work;
  const stopped = cut !== null;

  if (route === "drop")
    return (
      <Board title="Board · Note to your accountant">
        <Obj label="Draft" meta="Removed">
          <span className="cv-layer" data-provisional>Its place is held for 30 seconds</span>
          <OnObject>
            <Btns align="end">
              <Btn variant="primary" onClick={() => set({ ...work, route: null })}>Put it back</Btn>
            </Btns>
          </OnObject>
        </Obj>
      </Board>
    );

  return (
    <Board title="Board · Note to your accountant">
      <Obj
        label="Draft"
        meta={route === "resume" ? "Carried on" : stopped ? "Last finished version" : "Being written"}
        tone={route === "resume" ? "next" : undefined}
        selected={route === "steering"}
        wide
      >
        <span className="cv-layer" data-provisional={stopped && route === null ? "" : undefined}>
          {route === "resume"
            ? "Whole, and finished from where it stopped"
            : stopped
              ? `${at} paragraphs — nothing half-made`
              : `${at} paragraphs so far`}
        </span>
        {route === "steering" && (
          <OnObject>
            <Field placeholder="Leave out the breakdown" state="focus" />
            <Btns align="end">
              <Btn variant="primary" onClick={() => set({ ...work, route: "resume" })}>Carry on</Btn>
            </Btns>
          </OnObject>
        )}
        {stopped && route === null && (
          <OnObject>
            <Btns align="end">
              <Btn onClick={() => set({ ...work, route: "drop" })}>Drop it</Btn>
              <Btn onClick={() => set({ ...work, route: "steering" })}>Change something</Btn>
              <Btn variant="primary" onClick={() => set({ ...work, route: "resume" })}>Carry on</Btn>
            </Btns>
          </OnObject>
        )}
      </Obj>
      {!stopped && (
        <span className="cv-foot">
          <Say tone="mute" size="sm">Nothing half-made gets left on the board</Say>
          <Btns align="end">
            <Btn variant="primary" onClick={() => set({ ...work, cut: at })}>Stop</Btn>
          </Btns>
        </span>
      )}
    </Board>
  );
}

StopSteerPreview.surfaces.canvas = SteerCanvas;
