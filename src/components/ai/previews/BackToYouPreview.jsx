import { Body, Btn, Btns, Frame, FrameBar, Label, Note, Part, Say } from "./kit.jsx";
import { VoiceStage } from "./voice.jsx";
import { Board, Obj, OnObject } from "./canvas.jsx";

// Back to You on a set of invoices somebody handed over to be chased. The
// subject of the drawing is the BATON — who is holding it — because the
// pattern's first decision is that this has to be visible the whole time and
// not only at the moment it changes hands. A moment of ambiguity about who has
// control is how two parties edit the same thing, and the moment is always
// longer than anybody designs for.
//
// The summary has three lists, and the third is the one nobody writes: what it
// could not reach. Without it there is no way to tell "it decided not to" from
// "it never could", and those are opposite facts.
const CHANGED = ["Chased 4 invoices", "Marked 2 as disputed", "Filed 6 replies"];
const LEFT = ["Anything over £5,000", "The two on hold"];
const COULDNT = ["Northwind — no contact on file"];

function Baton({ who, note }) {
  return (
    <span className="mk-baton" data-who={who}>
      {/* The feature's name, not "Assistant": a product that isn't a chatbot has
          no persona to hand the work back from. */}
      <span className="mk-baton-side" data-on={who === "it" ? "" : undefined}>
        Auto-chase
      </span>
      <span className="mk-baton-arrow" aria-hidden />
      <span className="mk-baton-side" data-on={who === "you" ? "" : undefined}>
        You
      </span>
      {/* The word, because the position of a mark on a strip is exactly the
          kind of state that dies in a screenshot and in a screen reader. */}
      <span className="mk-baton-say">{note}</span>
    </span>
  );
}

function Lists({ short }) {
  return (
    <div className="mk-hand">
      <span className="mk-hand-col">
        <Label>Changed</Label>
        {CHANGED.map((c, i) => (
          <Part key={c} name={i === 0 ? "List Item" : null} block>
            <span className="mk-hand-item">{c}</span>
          </Part>
        ))}
      </span>
      <span className="mk-hand-col">
        <Label>Left alone</Label>
        {LEFT.map((c) => (
          <span key={c} className="mk-hand-item" data-quiet="">{c}</span>
        ))}
      </span>
      {!short && (
        <span className="mk-hand-col">
          {/* The list nobody writes. "Couldn't reach" is the only way to tell a
              decision from a limit, and they are opposite facts. */}
          <Label>Couldn&apos;t reach</Label>
          {COULDNT.map((c) => (
            <span key={c} className="mk-hand-item" data-blocked="">{c}</span>
          ))}
        </span>
      )}
    </div>
  );
}

export function BackToYouPreview({ work, set }) {
  const { who, summary, why } = work;

  return (
    <Frame width={570}>
      <FrameBar title="Chase 9 overdue invoices" />
      <Body>
        <Baton
          who={who}
          note={
            who === "it"
              ? why === "taken"
                ? "You're taking it back"
                : "It has it — you can take it back any time"
              : why === "stuck"
                ? "Yours, because it got stuck"
                : "Yours now"
          }
        />

        {why === "stuck" && (
          <Part name="Banner" block>
            <Note
              tone="warn"
              kind="Stuck"
              title="Northwind has no contact on file"
              actions={
                <Btns align="end">
                  <Btn variant="primary">Add a contact</Btn>
                </Btns>
              }
            >
              {/* What it tried, then what it needs. A handover arriving unasked
                  has to earn the interruption, and "here's where I got to" earns
                  it in a way "I couldn't do it" does not. */}
              Tried the invoice, the account and last year&apos;s thread. The other 8 are done.
            </Note>
          </Part>
        )}

        {why === "taken" && (
          <Part name="Banner" block>
            <Note kind="Half-done" title="One chaser was part written when you took over">
              Saved as a draft rather than sent.
            </Note>
          </Part>
        )}

        {(summary || who === "you") && <Lists short={why === "taken"} />}

        <span className="mk-foot">
          <Say tone="mute" size="sm">
            {who === "it" && !summary
              ? "Working — nothing has moved to you yet"
              : summary && who === "it"
                ? "Read this before it moves to you"
                : "Handed back 16:40"}
          </Say>
          <Part name="Button">
            <Btns align="end">
              {who === "it" && !summary && (
                <>
                  <Btn onClick={() => set({ who: "it", summary: false, why: "taken" })}>Take it back</Btn>
                  <Btn variant="primary" onClick={() => set({ who: "it", summary: true, why: null })}>
                    Let it finish
                  </Btn>
                </>
              )}
              {who === "it" && summary && (
                <Btn variant="primary" onClick={() => set({ who: "you", summary: true, why: null })}>
                  Take it
                </Btn>
              )}
              {who === "you" && <Btn>Undo everything it did</Btn>}
            </Btns>
          </Part>
        </span>
      </Body>
    </Frame>
  );
}

BackToYouPreview.work = {
  for: (id) =>
    ({
      holding: { who: "it", summary: false, why: null },
      handing: { who: "it", summary: true, why: null },
      yours: { who: "you", summary: true, why: null },
      stuck: { who: "you", summary: true, why: "stuck" },
      taken: { who: "it", summary: false, why: "taken" },
    })[id] ?? { who: "it", summary: false, why: null },

  state: (w) =>
    w.why === "taken" ? "taken" : w.why === "stuck" ? "stuck" : w.who === "you" ? "yours" : w.summary ? "handing" : "holding",

  // Finishing is the system's move, and it stops at the summary rather than at
  // the handover: control moves when somebody takes it, which is the pattern's
  // second decision drawn rather than asserted.
  tick: (w) =>
    w.who === "it" && !w.summary && !w.why
      ? { work: { ...w, summary: true }, in: 2600 }
      : null,
};

// ── Spoken ──────────────────────────────────────────────────────────────────
//
// Same `work`. Nothing shows who is holding it, so the handover has to be
// announced and acknowledged — which makes this the one surface where taking
// control back needs a word from both sides rather than a click from one.
function BackVoice({ work, set }) {
  const { who, summary, why } = work;

  if (why === "stuck")
    return (
      <VoiceStage
        device="Watch"
        mood="speaking"
        caption="Northwind has no contact on file — that's the only one left. The other eight are chased."
      >
        <Btn variant="primary">Add one</Btn>
      </VoiceStage>
    );

  if (why === "taken")
    return (
      <VoiceStage device="Watch" mood="stopped" heard="Stop, I'll do it" caption="Stopped. One chaser was half written — saved as a draft." />
    );

  if (who === "you")
    return (
      <VoiceStage
        device="Watch"
        mood="rest"
        caption="Yours. Four chased, two disputed, six filed — and one it couldn't reach."
      />
    );

  if (summary)
    return (
      <VoiceStage
        device="Watch"
        mood="speaking"
        caption="Done — four chased, two disputed, one it couldn't reach. Taking it back?"
      >
        <Btn variant="primary" onClick={() => set({ who: "you", summary: true, why: null })}>Yes</Btn>
      </VoiceStage>
    );

  return (
    <VoiceStage device="Watch" mood="thinking" caption="Still on it. Say “take it back” whenever.">
      <Btn onClick={() => set({ who: "it", summary: false, why: "taken" })}>Take it back</Btn>
    </VoiceStage>
  );
}

BackToYouPreview.surfaces = { voice: BackVoice };

// ── On a canvas ─────────────────────────────────────────────────────────────
//
// Same `work`. The board holds control per OBJECT rather than for the whole
// thing, which dissolves the pattern's central problem: "who has it" stops
// being one answer, control comes back piece by piece, and both parties can
// work at once without the ambiguity that makes two people edit the same thing.
function BackCanvas({ work, set }) {
  const { who, summary, why } = work;
  const mine = who === "you" || summary;

  return (
    <Board title="Board · 9 overdue invoices">
      <Obj label="4 chased" meta={mine ? "Yours" : "Auto-chase has it"} tone={mine ? "next" : undefined}>
        <span className="cv-layer" data-tone={mine ? "next" : undefined}>
          {mine ? "Released" : "Being worked on"}
        </span>
      </Obj>

      <Obj label="2 disputed" meta={mine ? "Yours" : "Auto-chase has it"} tone={mine ? "next" : undefined}>
        <span className="cv-layer" data-tone={mine ? "next" : undefined}>
          {mine ? "Released" : "Being worked on"}
        </span>
      </Obj>

      {/* Stuck stays marked while the rest come back — so the question is
          attached to the thing it is about, rather than to the whole board. */}
      <Obj label="Northwind" meta={why === "stuck" ? "Still held" : "Not started"} selected={why === "stuck"}>
        <span className="cv-layer" data-provisional>
          {why === "stuck" ? "No contact on file" : "Waiting"}
        </span>
        {why === "stuck" && (
          <OnObject>
            <Btns align="end">
              <Btn variant="primary" onClick={() => set({ who: "you", summary: true, why: null })}>
                Add a contact
              </Btn>
            </Btns>
          </OnObject>
        )}
      </Obj>

      <span className="cv-foot">
        <Say tone="mute" size="sm">
          {why === "taken"
            ? "Picked up mid-way — the half-made part is on the object"
            : "Each one comes back on its own"}
        </Say>
      </span>
    </Board>
  );
}

BackToYouPreview.surfaces.canvas = BackCanvas;
