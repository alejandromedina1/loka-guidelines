import { Body, Btn, Btns, Frame, FrameBar, Note, Say } from "./kit.jsx";
import { VoiceStage } from "./voice.jsx";
import { Board, Obj } from "./canvas.jsx";

const ANSWER =
  "You spent £412 on food in March, £96 more than February. Most of the rise came from eight takeaway orders in the last week of the month.";

// Streaming Response, on a spending report rather than a chat. This is text
// arriving into a product surface somebody opened on purpose — a question they
// asked about their own money, answered in place.
//
// The answer actually arrives. It used to be two constants — a fixed "partial"
// and a fixed "complete" — so pressing Stop always produced the same half
// sentence no matter when you pressed it, which is a picture of stopping rather
// than stopping. Now `at` is how many characters have landed, the system moves
// it on, and Stop keeps exactly what had arrived.
//
// That is also what makes the wait legible: nothing at all for a third of a
// second, then a grey outline in the shape of the answer, then words. A spinner
// says "working"; an outline says what you are going to get.
const WAIT = 420;
const RATE = 24;
const STEP = 2;

// Where a lost connection lands when somebody tabs to it. Mid-sentence on
// purpose: a drop that happened to fall on a full stop would look like an
// ending rather than an interruption.
const DROP_AT = 68;

export function StreamingPreview({ work, set }) {
  const { at, ended } = work;
  const text = ANSWER.slice(0, at);
  const streaming = !ended && at > 0 && at < ANSWER.length;
  const done = !ended && at >= ANSWER.length;
  const partial = !!ended;

  return (
    <Frame width={540}>
      <FrameBar title="Spending · March" />
      <Body>
        {at === 0 && !ended ? (
          <div className="ai-skel" aria-label="Preparing response">
            <span className="ai-skel-line" style={{ width: "94%" }} />
            <span className="ai-skel-line" style={{ width: "98%" }} />
            <span className="ai-skel-line" style={{ width: "61%" }} />
          </div>
        ) : (
          <p className="ai-answer" data-partial={partial ? "" : undefined}>
            {text}
            {/* The caret moves while the words are arriving and holds still
                everywhere else, which is the difference between "working" and
                "stuck" — and the reason a stalled stream needs a deadline
                rather than a spinner. */}
            {streaming && <span className="ai-caret" aria-hidden />}
          </p>
        )}

        {/* Three treatments, not one. Stopped is the user's own choice so it
            stays neutral; a lost connection is a real failure and reads as one. */}
        {ended === "stopped" && (
          <Note tone="plain" title="Stopped — partial answer">
            Saved. Copy what arrived, or run it again.
          </Note>
        )}
        {ended === "dropped" && (
          <Note tone="bad" title="Connection lost">
            The partial answer is kept. Continue from here, or retry.
          </Note>
        )}

        <span className="mk-foot">
          <span />
          <Btns align="end">
            {!ended && !done ? (
              /* Present from the first word, never only on hover — and it stops
                 the answer where it has actually got to. */
              <Btn
                variant="danger"
                disabled={at === 0}
                onClick={() => set({ ...work, ended: "stopped" })}
              >
                Stop
              </Btn>
            ) : ended === "dropped" ? (
              <>
                <Btn onClick={() => set({ at, ended: null })}>Continue</Btn>
                <Btn variant="primary" onClick={() => set({ at: 0, ended: null })}>
                  Retry
                </Btn>
              </>
            ) : (
              <>
                {/* Actions unlock when the answer is whole. Offering to act on a
                    partial answer is offering to act on a wrong one — so Copy
                    stays available on a stop, because the partial is the user's
                    to keep, and everything else waits. */}
                <Btn disabled={at === 0}>Copy</Btn>
                <Btn variant="primary" onClick={() => set({ at: 0, ended: null })}>
                  Run again
                </Btn>
              </>
            )}
          </Btns>
        </span>
      </Body>
    </Frame>
  );
}

StreamingPreview.work = {
  for: (id) =>
    ({
      waiting: { at: 0, ended: null },
      streaming: { at: 46, ended: null },
      complete: { at: ANSWER.length, ended: null },
      stopped: { at: 46, ended: "stopped" },
      dropped: { at: DROP_AT, ended: "dropped" },
    })[id] ?? { at: 0, ended: null },

  state: (w) => {
    if (w.ended) return w.ended === "stopped" ? "stopped" : "dropped";
    if (w.at === 0) return "waiting";
    return w.at >= ANSWER.length ? "complete" : "streaming";
  },

  // The wait, then the words. A steady pace rather than the model's own
  // stutter — the pattern's own decision, and the canvas has to hold to it or
  // it is arguing against itself.
  tick: (w) => {
    if (w.ended || w.at >= ANSWER.length) return null;
    return w.at === 0
      ? { work: { ...w, at: STEP }, in: WAIT }
      : { work: { ...w, at: Math.min(w.at + STEP, ANSWER.length) }, in: RATE };
  },
};

// ── The same pattern, spoken ────────────────────────────────────────────────
//
// Driven by the same `work` as the screen one, which is the point rather than a
// convenience: `at` is how far through the answer the system has got, and it
// means characters on a screen and words out loud without changing. One
// lifecycle, two drawings — the claim the surfaces field makes, made where
// somebody can see it.
//
// What changes is every answer. There is no grey outline to put up first,
// because speech is already one thing after another and there is nothing to
// reserve space for — the wait is the indicator thinking, and it is 420ms of
// actually sitting there rather than a segment labelled 420ms. Stop is not a
// button on a wall of buttons; it is the one thing you can do, so it is the one
// control on the stage. And the partial has nowhere to live here, so it leaves:
// what was said survives as text somewhere it can be read again, which is the
// thing a screen gets for free and this surface has to design.
const SPOKEN = ANSWER.split(" ");

function StreamingVoice({ work, set }) {
  const { at, ended } = work;
  // The same fraction of the answer, counted in words rather than characters.
  const said = SPOKEN.slice(0, Math.round((at / ANSWER.length) * SPOKEN.length)).join(" ");
  const speaking = !ended && at > 0 && at < ANSWER.length;
  const done = !ended && at >= ANSWER.length;
  const mood = ended === "dropped" ? "lost"
    : ended === "stopped" ? "stopped"
    : at === 0 ? "thinking"
    : done ? "rest"
    : "speaking";

  return (
    <VoiceStage
      device="Kitchen speaker"
      mood={mood}
      heard="Why is March higher?"
      caption={
        at === 0 && !ended
          ? null
          : ended === "dropped"
            ? "The part it got is on your phone."
            : ended === "stopped"
              ? `${said} — the rest is on your phone.`
              : said
      }
    >
      {/* Stop is the surface's own gesture, and the only control on the stage:
          on a screen it is a button somebody can see and ignore, here it is the
          only way out of an answer that is taking too long. Live only while
          there is speech to interrupt. */}
      {speaking && (
        <Btn variant="danger" onClick={() => set({ ...work, ended: "stopped" })}>
          Stop
        </Btn>
      )}
      {(done || ended === "stopped") && (
        <Btn onClick={() => set({ at: 0, ended: null })}>Ask again</Btn>
      )}
      {ended === "dropped" && (
        <Btn variant="primary" onClick={() => set({ at: 0, ended: null })}>
          Try again
        </Btn>
      )}
    </VoiceStage>
  );
}

StreamingPreview.surfaces = { voice: StreamingVoice };

// ── On a canvas ─────────────────────────────────────────────────────────────
//
// Same `work`, and `at` means the same thing a third time: how much has arrived.
// What changes is the shape of arrival. An object does not come a word at a
// time — it comes rough and sharpens — so the wait has nothing to reserve space
// for, because the object is already the right size and only its fidelity moves.
//
// That makes Stop mean something different. On a screen and out loud, stopping
// keeps a fragment: half a sentence, half an answer. Here it keeps a whole
// thing at a lower quality, which is usable in a way half a sentence is not —
// and so this is the one surface where stopping early is a reasonable default
// rather than a rescue.
const STEPS_TO = ["Rough", "Better", "Sharp"];

function StreamingCanvas({ work, set }) {
  const { at, ended } = work;
  const pass = Math.min(Math.floor((at / ANSWER.length) * STEPS_TO.length), STEPS_TO.length - 1);
  const arriving = !ended && at > 0 && at < ANSWER.length;
  const done = !ended && at >= ANSWER.length;

  return (
    <Board title="Board · new chart">
      <Obj
        label={at === 0 && !ended ? "Placed" : ended === "dropped" ? "Didn't finish" : STEPS_TO[pass]}
        meta={done ? "Final" : ended === "stopped" ? "Kept at this pass" : undefined}
        tone={done ? "next" : undefined}
        selected={arriving}
        wide
      >
        {/* The object is the right size from the first frame — what moves is
            how finished it looks, which is the one thing a placeholder on this
            surface never has to guess at. */}
        <span className="cv-fidelity" data-pass={at === 0 && !ended ? "none" : STEPS_TO[pass].toLowerCase()}>
          <span />
          <span />
          <span />
        </span>
      </Obj>

      <span className="cv-foot">
        <Say tone="mute" size="sm">
          {ended === "dropped"
            ? "Nothing placed. The board is unchanged."
            : ended === "stopped"
              ? "Stopped early — this pass is yours to keep or run on."
              : done
                ? "Finished"
                : "Sharpening"}
        </Say>
        <Btns align="end">
          {arriving && (
            <Btn variant="danger" onClick={() => set({ ...work, ended: "stopped" })}>
              Stop here
            </Btn>
          )}
          {ended === "stopped" && <Btn onClick={() => set({ ...work, ended: null })}>Carry on</Btn>}
          {(done || ended) && (
            <Btn variant="primary" onClick={() => set({ at: 0, ended: null })}>
              Make another
            </Btn>
          )}
        </Btns>
      </span>
    </Board>
  );
}

StreamingPreview.surfaces.canvas = StreamingCanvas;
