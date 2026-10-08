import { Body, Btn, Btns, Field, Frame, FrameBar, GhostLines, Label, Note, Part, Say } from "./kit.jsx";
import { Handoff, VoiceStage, VoiceThinking } from "./voice.jsx";
import { thinkFor } from "./mock.js";
import { Board, BoardWaiting, Obj, OnObject, Pair } from "./canvas.jsx";

// Retry & Compare on the wording of a chaser to a late payer — the kind of
// thing with no single right answer, where taste decides and comparing beats
// judging in the abstract.
//
// NOT a diff. Change Review draws before-and-after, where one of the two is
// what is already there and the other is a proposal; here both are proposals
// and neither is incumbent. That symmetry is the pattern, and it has to be
// visible: two columns of equal weight, neither of them the original.
//
// A retry can also fail, and that is where the pattern's first decision is
// tested hardest: a retry that breaks must take nothing away. So the failed
// frame is the first answer, whole and still keepable, with the failure said
// above it — never an empty column, and never on the tick.
const A = {
  tag: "First",
  text: "Just a note that invoice 3041 was due on the 14th. Could you confirm when it's likely to be paid?",
  tone: "Softer, asks for a date",
};
const B = {
  tag: "Second",
  text: "Invoice 3041 was due on the 14th and is now 9 days late. Please confirm payment this week.",
  tone: "Firmer, names a deadline",
};
const NEAR = {
  tag: "Second",
  text: "Just a note that invoice 3041 was due on the 14th. Could you confirm when it will be paid?",
  tone: "Softer, asks for a date",
};

// `markButton` is anatomy only: it puts the Button marker on this card's Keep
// when the foot has no button of its own to carry it.
function Version({ v, kept, onKeep, markButton }) {
  return (
    <div className="mk-ver" data-kept={kept ? "" : undefined}>
      <span className="mk-ver-head">
        <Label>{v.tag}</Label>
        <span className="mk-ver-tone">{v.tone}</span>
      </span>
      <p className="mk-ver-text">{v.text}</p>
      {onKeep && (
        <Part name={markButton ? "Button" : null} block>
          <Btns align="end">
            <Btn onClick={onKeep}>Keep this</Btn>
          </Btns>
        </Part>
      )}
      {kept && <span className="mk-ver-mark">Kept</span>}
    </div>
  );
}

export function RetryComparePreview({ work, set, sim = "normal" }) {
  const { second, kept, guided, near, failed, writing } = work;
  const other = near ? NEAR : B;
  // Asking for another is a wait, not a swap: the first stays put while the
  // second is written beside it. Whether it comes back is decided now, from
  // the Response control, so "Didn't come back" is something you can cause.
  const ask = (extra) => set({ ...work, ...extra, failed: false, writing: true, willFail: sim === "fail", wait: thinkFor(sim) });

  if (failed)
    return (
      <Frame width={570}>
        <FrameBar title="Chase invoice 3041" />
        <Body>
          <Note
            tone="bad"
            title="Couldn't write another just now"
            actions={<Btn onClick={() => ask({ near: true })}>Try again</Btn>}
          >
            Yours is as it was.
          </Note>
          <Part name="Card" block>
            <Version v={A} />
          </Part>
          <span className="mk-foot">
            <Say tone="mute" size="sm">Ready to send</Say>
            <Part name="Button" block>
              <Btns align="end">
                <Btn variant="primary" onClick={() => set({ ...work, failed: false, second: true, kept: "a" })}>
                  Use this one
                </Btn>
              </Btns>
            </Part>
          </span>
        </Body>
      </Frame>
    );

  return (
    <Frame width={570}>
      <FrameBar title="Chase invoice 3041" />
      <Body>
        {kept ? (
          <>
            <Part name="Card" block>
              <Version v={kept === "a" ? A : other} kept />
            </Part>
            {/* The one not kept is not thrown away. It is the best evidence of
                what somebody wanted, and second-guessing an hour later is
                common enough to design for. */}
            <span className="mk-foot">
              <Say tone="mute" size="sm">The other one is kept for this session</Say>
              <Part name="Button" block>
                <Btns align="end">
                  <Btn onClick={() => set({ ...work, kept: null })}>Bring it back</Btn>
                </Btns>
              </Part>
            </span>
          </>
        ) : (
          <>
            {near && second && (
              // Two near-identical columns send somebody hunting for a
              // difference that isn't there — and they find one, and act on it.
              <Note
                title="This came back almost identical"
                actions={<Btn onClick={() => set({ ...work, guided: true, near: false })}>Say what to change</Btn>}
              >
                One clause differs.
              </Note>
            )}

            <div className="mk-vers" data-two={second || writing ? "" : undefined}>
              <Part name="Card" block>
                <Version
                  v={A}
                  onKeep={second ? () => set({ ...work, kept: "a" }) : undefined}
                  markButton={second}
                />
              </Part>
              {second && <Version v={other} onKeep={() => set({ ...work, kept: "b" })} />}
              {writing && (
                <div className="mk-ver" data-waiting="">
                  <GhostLines widths={[90, 100, 64]} tone="mute" />
                </div>
              )}
            </div>

            {guided && (
              <span className="mk-guided">
                <Label>Another, but</Label>
                <Part name="Input Field" block>
                  <Field placeholder="…firmer, and name a date" state="focus" />
                </Part>
              </span>
            )}

            <span className="mk-foot">
              <Say tone="mute" size="sm">
                {writing ? "Writing another…" : second ? "Both stay until you keep one" : "Trying again keeps this one"}
              </Say>
              <Part name={second ? null : "Button"} block>
                <Btns align="end">
                  {!second && !writing && (
                    <>
                      <Btn onClick={() => ask({ near: true })}>Try again</Btn>
                      {/* The direction is the nearer control on purpose: a plain
                          re-roll is the same question hoping for better luck. */}
                      <Btn variant="primary" onClick={() => ask({ guided: true })}>
                        Another, but different
                      </Btn>
                    </>
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

const ONE = { second: false, kept: null, guided: false, near: false, failed: false, writing: false, willFail: false, wait: 650 };

RetryComparePreview.work = {
  for: (id) =>
    ({
      one: { ...ONE },
      two: { ...ONE, second: true },
      guided: { ...ONE, second: true, guided: true },
      generating: { ...ONE, near: true, writing: true },
      failed: { ...ONE, failed: true },
      kept: { ...ONE, second: true, kept: "b" },
      same: { ...ONE, second: true, near: true },
    })[id] ?? { ...ONE },

  state: (w) =>
    w.writing ? "generating" : w.failed ? "failed"
      : w.kept ? "kept" : w.guided ? "guided" : w.near && w.second ? "same" : w.second ? "two" : "one",

  // The only move of its own: the second answer finishing — and only ever
  // because somebody asked for it. Nothing arrives unasked, which would be the
  // product spending a run nobody authorised.
  tick: (w) =>
    w.writing
      ? { work: w.willFail ? { ...w, writing: false, failed: true } : { ...w, writing: false, second: true }, in: w.wait ?? 650 }
      : null,
};

RetryComparePreview.simulate = ["normal", "slow", "fail"];

// ── Spoken ──────────────────────────────────────────────────────────────────
//
// Same `work`, and this is a `none`: two answers cannot be side by side when
// there is one channel. Said one after the other, the first is already fading
// as the second arrives — which is comparing by memory, the exact thing the
// pattern exists to stop somebody having to do.
//
// So it hands off. What survives here is the half that was always spoken: say
// what to change, and hear it again.
function RetryVoice({ work, set }) {
  const { second, kept, guided, near, failed } = work;
  if (work.writing) return <VoiceThinking device="Headphones" heard="Try that again" />;

  if (failed)
    return (
      <VoiceStage device="Headphones" mood="stopped" caption="Couldn't get another. Yours still stands.">
        <Btn onClick={() => set({ ...work, failed: false, writing: true, willFail: false, wait: 650 })}>Again</Btn>
      </VoiceStage>
    );

  if (kept)
    return <VoiceStage device="Headphones" mood="rest" caption="Keeping that one. Sending it now." />;

  if (guided)
    return (
      <VoiceStage
        device="Headphones"
        mood="speaking"
        heard="Firmer, and give them a date"
        caption={B.text}
      >
        <Btn variant="primary" onClick={() => set({ ...work, kept: "b" })}>Send that</Btn>
      </VoiceStage>
    );

  if (near && second)
    return (
      <VoiceStage
        device="Headphones"
        mood="speaking"
        caption="That came back almost the same. Tell it what to change instead?"
      >
        <Btn variant="primary" onClick={() => set({ ...work, guided: true })}>Firmer</Btn>
      </VoiceStage>
    );

  if (second)
    return (
      <VoiceStage device="Headphones" mood="speaking" caption="Second version, and the first is gone.">
        <Handoff to="the phone">
          Holding two versions in your head is the work this pattern removes on a screen. Both are
          on the phone, side by side.
        </Handoff>
      </VoiceStage>
    );

  return (
    <VoiceStage device="Headphones" mood="speaking" caption={A.text}>
      <Btn onClick={() => set({ ...work, second: true, near: true })}>Again</Btn>
      <Btn variant="primary" onClick={() => set({ ...work, guided: true, second: true })}>
        Firmer
      </Btn>
    </VoiceStage>
  );
}

RetryComparePreview.surfaces = { voice: RetryVoice };

// ── On a canvas ─────────────────────────────────────────────────────────────
//
// Same `work`. Versions are objects beside each other rather than columns, so a
// third costs no layout at all — and keeping one is moving it, which is a
// gesture rather than a decision taken on a dialog.
function RetryCanvas({ work, set }) {
  if (work.writing) return <BoardWaiting title="Board · Chase invoice 3041" label="Another version" />;
  const { second, kept, guided, near, failed } = work;
  const other = near ? NEAR : B;

  if (failed)
    return (
      <Board title="Board · Chase invoice 3041">
        <Obj label={A.tag} meta={A.tone} selected>
          <span className="cv-layer">{A.text.slice(0, 54)}…</span>
        </Obj>
        <span className="cv-foot">
          <Say tone="mute" size="sm">Nothing placed beside it</Say>
          <Btns align="end">
            <Btn onClick={() => set({ ...work, failed: false, writing: true, willFail: false, wait: 650 })}>Try again</Btn>
          </Btns>
        </span>
      </Board>
    );

  if (kept)
    return (
      <Board title="Board · Chase invoice 3041">
        <Obj label={kept === "a" ? A.tag : other.tag} meta="Kept" tone="next" wide>
          <span className="cv-layer" data-tone="next">{(kept === "a" ? A : other).tone}</span>
        </Obj>
        <Obj label={kept === "a" ? other.tag : A.tag} meta="In the margin">
          <span className="cv-layer" data-provisional>Still here for this session</span>
        </Obj>
      </Board>
    );

  return (
    <Board title="Board · Chase invoice 3041">
      <Pair>
        <Obj label={A.tag} meta={A.tone} selected={!second}>
          <span className="cv-layer">{A.text.slice(0, 54)}…</span>
        </Obj>
        {second && (
          <Obj label={other.tag} meta={other.tone}>
            <span className="cv-layer">{other.text.slice(0, 54)}…</span>
            {guided && <span className="cv-layer" data-provisional>From: firmer, name a date</span>}
          </Obj>
        )}
      </Pair>
      <span className="cv-foot">
        <Say tone="mute" size="sm">
          {second ? "Equal weight, neither one the original" : "Room beside it is the invitation"}
        </Say>
        {!second && (
          <Btns align="end">
            <Btn variant="primary" onClick={() => set({ ...work, guided: true, writing: true, willFail: false, wait: 650 })}>
              Another, but firmer
            </Btn>
          </Btns>
        )}
        {second && !guided && (
          <Btns align="end">
            <Btn onClick={() => set({ ...work, kept: "b" })}>Keep the second</Btn>
          </Btns>
        )}
      </span>
    </Board>
  );
}

RetryComparePreview.surfaces.canvas = RetryCanvas;
