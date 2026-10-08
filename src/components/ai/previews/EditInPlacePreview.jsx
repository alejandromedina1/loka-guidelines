import { Fragment } from "react";
import { Body, Btn, Btns, Field, Frame, FrameBar, Label, Note, Part, Say } from "./kit.jsx";
import { VoiceStage, VoiceThinking } from "./voice.jsx";
import { thinkFor } from "./mock.js";
import { Board, BoardWaiting, Obj, OnObject } from "./canvas.jsx";

// Edit in Place on a summary somebody is about to send. The pattern is drawn as
// a selection INSIDE running text with the instruction anchored to it, which is
// the one thing that makes it itself: a box at the bottom of the page would be
// Prompt Box again, and the whole argument is that the box has to be where the
// selection is.
//
// Deliberately not Typing Ahead's editor: that draws the model writing into
// somebody's own text before they have asked. This draws somebody pointing at
// text that already exists and saying what to do about it — the opposite
// direction, and the two must not look alike.
const PARTS = [
  { id: 0, text: "March came in £214 over February. " },
  { id: 1, text: "Three subscriptions went up in the same week, which accounts for most of it. " },
  { id: 2, text: "Nothing else looks unusual, and the rest of the categories held steady. " },
];

// What the selected clause becomes, and — on the failure — what else moved
// without being asked.
const EDITED = "Three subscriptions went up in the same week: Disney+, Spotify and the gym. ";
const LEAKED = "Nothing else moved much, though the grocery spend crept up a little too. ";

export function EditInPlacePreview({ work, set, sim = "normal" }) {
  const { sel, applied, leaked, twice, rewriting } = work;
  // "Change it" is a wait on the picked part only — the rest of the text stays
  // readable. With Response: Fails the rewrite reaches past the part, which is
  // this pattern's own failure, now something you can cause.
  const change = () => set({ ...work, rewriting: true, willSpread: sim === "fail", wait: thinkFor(sim) });

  const textOf = (p) => {
    if (p.id === 1 && applied) return EDITED;
    if (p.id === 2 && leaked) return LEAKED;
    if (p.id === 2 && twice) return "Nothing else looks unusual. ";
    return p.text;
  };

  return (
    <Frame width={540}>
      <FrameBar title="Summary for your accountant" />
      <Body>
        <p className="mk-inplace">
          {PARTS.map((p) => (
            <Fragment key={p.id}>
              {/* Every part is selectable, not just the interesting one: the
                  clauses that cannot be pointed at are exactly the ones people
                  end up asking about in a fresh request. */}
              <button
                type="button"
                className="mk-sel"
                data-on={sel === p.id ? "" : undefined}
                data-moved={
                  (p.id === 1 && applied) || (p.id === 2 && (leaked || twice)) ? "" : undefined
                }
                data-waiting={rewriting && p.id === sel ? "" : undefined}
                onClick={() => set({ ...work, sel: p.id })}
              >
                {textOf(p)}
                {p.id === 2 && leaked && <span className="vh"> — changed without being asked</span>}
              </button>
            </Fragment>
          ))}
        </p>

        {/* Anchored to the selection. A box at the bottom breaks the link
            between what somebody picked and what they typed, and they end up
            describing the part in words instead of just pointing at it. */}
        {/* The anchored box is the Popover; the field and buttons inside it are
            marked as parts of their own. */}
        {rewriting && <Say tone="mute" size="sm">Rewriting this part…</Say>}

        {sel !== null && !applied && !rewriting && (
          <Part name="Popover" block>
            <span className="mk-inplace-box">
              <Label>Change this part</Label>
              <Part name="Input Field" block>
                <Field placeholder="…name the three" state="focus" />
              </Part>
              <Part name="Button">
                <Btns align="end">
                  <Btn onClick={() => set({ ...work, sel: null })}>Cancel</Btn>
                  <Btn variant="primary" onClick={change}>
                    Change it
                  </Btn>
                </Btns>
              </Part>
            </span>
          </Part>
        )}

        {/* The pattern's real failure, and it is silent by default. */}
        {leaked && (
          <Note
            tone="warn"
            kind="Reached further"
            title="One other sentence changed too"
            actions={
              <Part name="Button">
                <Btns align="end">
                  <Btn variant="primary" onClick={() => set({ ...work, leaked: false })}>
                    Keep only the part I picked
                  </Btn>
                </Btns>
              </Part>
            }
          >
            The last sentence was rewritten as well.
          </Note>
        )}

        {applied && !leaked && (
          <span className="mk-foot">
            <Say tone="mute" size="sm">
              {twice ? "2 changes, each reversible on its own" : "1 change · nothing else moved"}
            </Say>
            <Part name="Button">
              <Btns align="end">
                <Btn onClick={() => set({ ...work, applied: false, twice: false, sel: null })}>
                  Undo this one
                </Btn>
                {!twice && (
                  <Btn variant="primary" onClick={() => set({ ...work, sel: 2, twice: true })}>
                    Change another
                  </Btn>
                )}
              </Btns>
            </Part>
          </span>
        )}
      </Body>
    </Frame>
  );
}

const WHOLE = { sel: null, applied: false, leaked: false, twice: false, rewriting: false, willSpread: false, wait: 650 };

EditInPlacePreview.work = {
  for: (id) =>
    ({
      whole: { ...WHOLE },
      picked: { ...WHOLE, sel: 1 },
      rewriting: { ...WHOLE, sel: 1, rewriting: true },
      changed: { ...WHOLE, sel: 1, applied: true },
      spread: { ...WHOLE, sel: 1, applied: true, leaked: true },
      again: { ...WHOLE, sel: 2, applied: true, twice: true },
    })[id] ?? { ...WHOLE },

  state: (w) =>
    w.rewriting ? "rewriting"
      : w.twice ? "again" : w.leaked ? "spread" : w.applied ? "changed" : w.sel !== null ? "picked" : "whole",

  // The only move of its own: a rewrite somebody asked for, finishing. Nothing
  // applies itself — that would be the leak this pattern's fourth state is
  // about — and whether it leaked was decided when Change it was pressed.
  tick: (w) =>
    w.rewriting
      ? { work: { ...w, rewriting: false, applied: true, leaked: !!w.willSpread }, in: w.wait ?? 650 }
      : null,
};

EditInPlacePreview.simulate = ["normal", "slow", "fail"];

// ── Spoken ──────────────────────────────────────────────────────────────────
//
// Same `work`. Pointing needs something to point at, so the part has to be
// NAMED — and how well somebody can name it is the cap on how precise this can
// get. It works beautifully for one edit and falls over on the second, because
// "the bit I changed" stops being unique.
function EditVoice({ work, set }) {
  if (work.rewriting) return <VoiceThinking device="Headphones" heard="Name the three subscriptions" />;
  const { sel, applied, leaked, twice } = work;

  if (leaked)
    return (
      <VoiceStage
        device="Headphones"
        mood="speaking"
        caption="That changed the last line as well. Keep only the part about the subscriptions?"
      >
        <Btn variant="primary" onClick={() => set({ ...work, leaked: false })}>Yes</Btn>
      </VoiceStage>
    );

  if (twice)
    return (
      <VoiceStage
        device="Headphones"
        mood="speaking"
        caption="Two edits now. Which one do you mean — the subscriptions, or the last line?"
      />
    );

  if (applied)
    return (
      <VoiceStage
        device="Headphones"
        mood="speaking"
        heard="Name the three"
        caption="Disney+, Spotify and the gym. Nothing else moved."
      >
        <Btn onClick={() => set({ ...work, applied: false, sel: null })}>Put it back</Btn>
      </VoiceStage>
    );

  if (sel !== null)
    return (
      <VoiceStage
        device="Headphones"
        mood="listening"
        heard="The bit about the subscriptions — name them"
        caption="Changing that sentence only."
      >
        <Btn variant="primary" onClick={() => set({ ...work, applied: true })}>Go on</Btn>
      </VoiceStage>
    );

  return (
    <VoiceStage
      device="Headphones"
      mood="speaking"
      caption="Three parts: the total, the subscriptions, and what else moved. Which one?"
    >
      <Btn variant="primary" onClick={() => set({ ...work, sel: 1 })}>The subscriptions</Btn>
    </VoiceStage>
  );
}

EditInPlacePreview.surfaces = { voice: EditVoice };

// ── On a canvas ─────────────────────────────────────────────────────────────
//
// Same `work`. The part is already an object, so pointing is just selecting —
// the pattern's hardest problem does not exist here. And the failure it
// struggles to surface anywhere else is obvious: an edit that reaches other
// objects makes them MOVE, and a board is where movement is impossible to miss.
function EditCanvas({ work, set }) {
  if (work.rewriting) return <BoardWaiting title="Board · summary" label="Subscriptions sentence" />;
  const { sel, applied, leaked, twice } = work;

  return (
    <Board title="Board · Summary">
      <Obj label="The total" meta="£214 over" />

      <Obj label="The subscriptions" meta={applied ? "Changed" : "3 of them"} selected={sel === 1}
        tone={applied && !leaked ? "next" : undefined}>
        {applied ? (
          <span className="cv-layer" data-tone="next">Disney+, Spotify, the gym</span>
        ) : (
          <span className="cv-layer">Went up in the same week</span>
        )}
        {sel === 1 && !applied && (
          <OnObject>
            <Field placeholder="Name the three" state="focus" />
            <Btns align="end">
              <Btn variant="primary" onClick={() => set({ ...work, applied: true })}>Change it</Btn>
            </Btns>
          </OnObject>
        )}
      </Obj>

      <Obj label="Everything else" meta={leaked ? "Moved, unasked" : twice ? "Changed" : "Held steady"}>
        <span className="cv-layer" data-provisional={leaked ? "" : undefined}>
          {leaked ? "This one moved too" : "Nothing unusual"}
        </span>
        {leaked && (
          <OnObject>
            <Btns align="end">
              <Btn variant="primary" onClick={() => set({ ...work, leaked: false })}>
                Put this one back
              </Btn>
            </Btns>
          </OnObject>
        )}
      </Obj>

      <span className="cv-foot">
        <Say tone="mute" size="sm">
          {leaked ? "An edit that reaches further is a thing you watch happen" : "Pointing is selecting"}
        </Say>
      </span>
    </Board>
  );
}

EditInPlacePreview.surfaces.canvas = EditCanvas;
