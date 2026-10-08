import { Body, Btn, Btns, Field, Frame, FrameBar, Hot, Part, Say } from "./kit.jsx";
import { VoiceStage } from "./voice.jsx";
import { Board, Obj, Pair } from "./canvas.jsx";

// Edit & Resend on a question about spending, asked with the wrong word in it.
//
// NOT Retry & Compare. A retry asks the same question again and hopes; this
// changes the question. So the edit happens on the question itself, where it
// was asked, and what it produces is a second version of the whole exchange
// rather than a second answer under the first — 1 of 2, 2 of 2, beside the
// question it belongs to.
//
// The follow-up is what makes it a pattern rather than a text field. "And April
// so far?" was asked of the eating-out answer. Moved onto the groceries answer
// it would mean something different, so it stays with version 1 — and version
// 2 can grow follow-ups of its own.
const Q = ["What did I spend on eating out in March?", "What did I spend on groceries in March?"];
const A = ["£186 across 11 visits — most of it on two weekends.", "£264, about £66 a week — up £30 on February."];
const LATER = [
  { q: "And April so far?", a: "£71 so far, on course to come in lower." },
  { q: "Which shop was most of that?", a: "Sainsbury's, £148 of the £264." },
];
const START = { editing: false, draft: Q[0], edited: false, on: 1, more: false };

function Turn({ q, a, children }) {
  return (
    <div className="mk-turn">
      <span className="mk-turn-q">{q}</span>
      {children}
      <p className="mk-turn-a">{a}</p>
    </div>
  );
}

export function EditResendPreview({ work, set }) {
  const { editing, draft, edited, on, more } = work;
  const v = on - 1;
  const send = () => set({ ...work, editing: false, edited: true, on: 2, more: false });

  return (
    <Frame width={540}>
      <FrameBar title="Ask about your spending" />
      <Body>
        <div className="mk-thread">
          <div className="mk-turn" data-first="">
            {editing ? (
              <>
                <Part name="Input Field" block>
                  <Field
                    state="focus"
                    value={draft}
                    onChange={(e) => set({ ...work, draft: e.target.value })}
                  />
                </Part>
                <Part name="Button">
                  <Btns align="end">
                    <Btn onClick={() => set({ ...work, editing: false })}>Cancel</Btn>
                    <Btn variant="primary" disabled={!draft.trim()} onClick={send}>
                      Send
                    </Btn>
                  </Btns>
                </Part>
              </>
            ) : (
              <span className="mk-turn-head">
                <span className="mk-turn-q">{Q[v]}</span>
                {/* Where the versions are: on the question they belong to, small,
                    because they are rarely revisited — but never in a menu. */}
                {edited && (
                  <Part name="Pagination">
                    <span className="mk-vpager">
                      <Hot label="Previous version" onClick={on === 2 ? () => set({ ...work, on: 1 }) : undefined}>
                        <span className="mk-vpager-step" data-off={on === 1 ? "" : undefined} aria-hidden>‹</span>
                      </Hot>
                      <span className="mk-vpager-at">{`${on} / 2`}</span>
                      <Hot label="Next version" onClick={on === 1 ? () => set({ ...work, on: 2 }) : undefined}>
                        <span className="mk-vpager-step" data-off={on === 2 ? "" : undefined} aria-hidden>›</span>
                      </Hot>
                    </span>
                  </Part>
                )}
                <Hot label="Edit this question" onClick={() => set({ ...work, editing: true, draft: Q[1] })}>
                  <span className="mk-turn-edit">Edit</span>
                </Hot>
              </span>
            )}
            {/* While editing, the answer under the question is the one about to
                become version 1 — set back, still readable, not gone. */}
            <p className="mk-turn-a" data-held={editing ? "" : undefined}>{A[v]}</p>
            {editing && <Say tone="mute" size="sm">Kept as version 1</Say>}
          </div>

          {/* Later turns belong to the version they were asked of. */}
          {(on === 1 || more) && (
            <Part name="List Item" block>
              <Turn q={on === 1 ? LATER[0].q : LATER[1].q} a={on === 1 ? LATER[0].a : LATER[1].a} />
            </Part>
          )}
        </div>

        {!editing && (
          <span className="mk-foot">
            <Say tone="mute" size="sm">
              {!edited ? "March · all accounts" : on === 1 ? "Version 1 · as first asked" : "Version 2"}
            </Say>
            {edited && on === 2 && !more && (
              <Part name="Button">
                <Btns align="end">
                  <Btn onClick={() => set({ ...work, more: true })}>Ask which shop</Btn>
                </Btns>
              </Part>
            )}
          </span>
        )}
      </Body>
    </Frame>
  );
}

EditResendPreview.work = {
  // What the reader typed survives a jump to a state that allows it.
  keep: ["draft"],
  for: (id) =>
    ({
      asked: START,
      editing: { ...START, editing: true, draft: Q[1] },
      branched: { ...START, draft: Q[1], edited: true, on: 2 },
      earlier: { ...START, draft: Q[1], edited: true, on: 1 },
      continued: { ...START, draft: Q[1], edited: true, on: 2, more: true },
    })[id] ?? START,

  state: (w) => {
    if (w.editing) return "editing";
    if (!w.edited) return "asked";
    if (w.on === 1) return "earlier";
    return w.more ? "continued" : "branched";
  },

  // No tick. Nothing here runs until somebody presses Send — a correction
  // that sends itself half-typed spends a run on a question nobody finished.
};

// ── Spoken ──────────────────────────────────────────────────────────────────
//
// Same `work`. There is no question on screen to edit, so "no, I meant…" is
// the edit — said over the old question — and the first answer is set aside
// rather than thrown away, reachable by asking for it.
function EditVoice({ work, set }) {
  const { editing, edited, on, more } = work;

  if (editing)
    return (
      <VoiceStage device="Headphones" mood="listening" heard="No — groceries, not eating out">
        <Btn variant="primary" onClick={() => set({ ...work, editing: false, edited: true, on: 2, more: false })}>
          Go
        </Btn>
      </VoiceStage>
    );

  if (!edited)
    return (
      <VoiceStage device="Headphones" mood="speaking" heard={Q[0]} caption={A[0]}>
        <Btn onClick={() => set({ ...work, editing: true, draft: Q[1] })}>No, groceries</Btn>
      </VoiceStage>
    );

  if (on === 1)
    return (
      <VoiceStage device="Headphones" mood="speaking" heard="What was the first answer?" caption={`The eating-out one: ${A[0]}`}>
        <Btn onClick={() => set({ ...work, on: 2 })}>Back to groceries</Btn>
      </VoiceStage>
    );

  if (more)
    return <VoiceStage device="Headphones" mood="speaking" heard={LATER[1].q} caption={LATER[1].a} />;

  return (
    <VoiceStage device="Headphones" mood="speaking" heard={Q[1]} caption={`${A[1]} The eating-out answer is still there.`}>
      <Btn onClick={() => set({ ...work, on: 1 })}>What was the first one?</Btn>
      <Btn onClick={() => set({ ...work, more: true })}>Which shop?</Btn>
    </VoiceStage>
  );
}

EditResendPreview.surfaces = { voice: EditVoice };

// ── On a canvas ─────────────────────────────────────────────────────────────
//
// Same `work`. The prompt sits on the chart it made; editing it remakes that
// chart and keeps the earlier one stacked behind, one step back.
function EditCanvas({ work, set }) {
  const { editing, edited, on, more } = work;
  const v = on - 1;
  const topic = ["eating out", "groceries"];

  return (
    <Board title="Board · March spending">
      <Pair>
        <Obj
          label={`Chart · ${editing ? topic[0] : topic[v]}`}
          meta={edited ? `Version ${on} of 2` : undefined}
          selected={editing}
        >
          <span className="cv-layer">{editing ? A[0] : A[v]}</span>
          <span className="cv-layer" data-provisional>
            {editing ? `Prompt: ${topic[1]} in March` : `Prompt: ${topic[v]} in March`}
          </span>
          {edited && <span className="cv-stack-behind" aria-hidden />}
        </Obj>
        {more && on === 2 && (
          <Obj label="Chart · groceries by shop" meta="From version 2">
            <span className="cv-layer">{LATER[1].a}</span>
          </Obj>
        )}
      </Pair>
      <span className="cv-foot">
        <Say tone="mute" size="sm">
          {editing ? "Remaking the chart from the new prompt" : edited ? "The other version is stacked behind" : "Made from a prompt"}
        </Say>
        <Btns align="end">
          {!edited && !editing && (
            <Btn onClick={() => set({ ...work, editing: true, draft: Q[1] })}>Edit prompt</Btn>
          )}
          {editing && (
            <Btn variant="primary" onClick={() => set({ ...work, editing: false, edited: true, on: 2, more: false })}>
              Remake
            </Btn>
          )}
          {edited && !editing && (
            <Btn onClick={() => set({ ...work, on: on === 1 ? 2 : 1 })}>{on === 1 ? "Show version 2" : "Show version 1"}</Btn>
          )}
          {edited && on === 2 && !more && <Btn onClick={() => set({ ...work, more: true })}>Break down by shop</Btn>}
        </Btns>
      </span>
    </Board>
  );
}

EditResendPreview.surfaces.canvas = EditCanvas;
