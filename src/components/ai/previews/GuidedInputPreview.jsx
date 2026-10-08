import { Body, Btn, Btns, Field, Frame, FrameBar, Label, Note, Part, Say } from "./kit.jsx";
import { VoiceStage } from "./voice.jsx";
import { Board, Obj, OnObject } from "./canvas.jsx";

// Guided Input on a spending report — dates, a breakdown and a format, which
// are exactly the three things people describe badly in a sentence.
//
// Drawn as real fields somebody types in, not as the key/value rows Approval
// Gate uses. Those are values being read before a decision; these are values
// being SET, and the difference has to be visible or the two patterns teach the
// same thing. Every row here is an Input Field, which is also why the pattern
// can list one as essential and mean it.
const ROWS = [
  { key: "from", label: "From", hint: "01 Mar" },
  { key: "to", label: "To", hint: "31 Mar" },
  { key: "kind", label: "Broken down by", hint: "Category" },
];

export function GuidedInputPreview({ work, set }) {
  const { from, to, kind, said, bad } = work;
  const values = { from, to, kind };
  const missing = ROWS.filter((r) => !values[r.key]);
  const ready = missing.length === 0 && !bad;

  return (
    <Frame width={540}>
      <FrameBar title="New spending report" />
      <Body>
        {/* The sentence is the fast way in and the fields are the record. It
            sits above them rather than instead of them: what it understood has
            to be on screen before anything runs. */}
        <span className="mk-guide-say">
          <Part name="Input Field" block>
          <Field
            placeholder="Or just say it — “January to March, by category”"
            value={said ? "January to March, by category" : ""}
            state={said ? "focus" : "idle"}
            onChange={(e) =>
              set(
                e.target.value
                  ? { from: "01 Jan", to: "31 Mar", kind: "Category", said: true, bad: false }
                  : { from: "", to: "", kind: "", said: false, bad: false }
              )
            }
          />
          </Part>
        </span>

        <div className="mk-guide">
          {ROWS.map((r) => (
            <span className="mk-guide-row" key={r.key} data-filled={values[r.key] ? "" : undefined}>
              <span className="mk-guide-key">
                <Label>{r.label}</Label>
                {/* Filled from the sentence rather than typed, and it says so.
                    A field that quietly holds somebody else's answer is the
                    thing this pattern is supposed to prevent. */}
                {said && <span className="mk-guide-from">from what you said</span>}
              </span>
              <Field
                placeholder={r.hint}
                value={values[r.key]}
                state={bad && r.key !== "kind" ? "error" : "idle"}
                onChange={(e) => set({ ...work, [r.key]: e.target.value, said: false })}
              />
            </span>
          ))}
        </div>

        {/* Caught BETWEEN the fields. Neither date is wrong on its own, which
            is precisely why per-field checking never finds this one. */}
        {bad && (
          <Part name="Alert" block>
            <Note tone="bad" kind="Can't both be true" title="The end is before the start">
              31 March to 1 March is no days. Swap them, or change one.
            </Note>
          </Part>
        )}

        <span className="mk-foot">
          <Say tone="mute" size="sm">
            {bad
              ? "Nothing runs until these agree"
              : ready
                ? "Format: a table, because that's what you picked last time"
                : `Still need ${missing.map((m) => m.label.toLowerCase()).join(" and ")}`}
          </Say>
          <Part name="Button">
            <Btns align="end">
              <Btn onClick={() => set({ from: "", to: "", kind: "", said: false, bad: false })}>Clear</Btn>
              <Btn variant="primary" disabled={!ready}>
                Build it
              </Btn>
            </Btns>
          </Part>
        </span>
      </Body>
    </Frame>
  );
}

GuidedInputPreview.work = {
  // What the reader typed survives a jump to a state that allows it.
  keep: ["from", "to", "kind"],
  for: (id) =>
    ({
      blank: { from: "", to: "", kind: "", said: false, bad: false },
      partly: { from: "01 Mar", to: "", kind: "Category", said: false, bad: false },
      said: { from: "01 Jan", to: "31 Mar", kind: "Category", said: true, bad: false },
      ready: { from: "01 Mar", to: "31 Mar", kind: "Category", said: false, bad: false },
      impossible: { from: "31 Mar", to: "01 Mar", kind: "Category", said: false, bad: true },
    })[id] ?? { from: "", to: "", kind: "", said: false, bad: false },

  state: (w) => {
    if (w.said) return "said";
    if (w.bad) return "impossible";
    const filled = [w.from, w.to, w.kind].filter(Boolean).length;
    return filled === 3 ? "ready" : filled > 0 ? "partly" : "blank";
  },

  // No tick. Every move here is somebody filling a box, and a form that fills
  // itself in while you look at it is the one thing a form must never do.
};

// ── Spoken ──────────────────────────────────────────────────────────────────
//
// Same `work`. There is no form to look at, so each field becomes a question
// and each question costs a turn — which is the cap on how many fields this
// pattern can have on this surface, and the reason the sentence path matters
// more here than anywhere else.
function GuidedVoice({ work, set }) {
  const { from, to, kind, said, bad } = work;
  const values = { from, to, kind };
  const missing = ["from", "to", "kind"].filter((k) => !values[k]);

  if (bad)
    return (
      <VoiceStage
        device="Kitchen speaker"
        mood="speaking"
        heard="Thirty-first of March to the first of March"
        caption="That ends before it starts. Did you mean the first to the thirty-first?"
      >
        <Btn variant="primary" onClick={() => set({ ...work, from: "01 Mar", to: "31 Mar", bad: false })}>
          Yes
        </Btn>
      </VoiceStage>
    );

  if (said)
    return (
      <VoiceStage
        device="Kitchen speaker"
        mood="speaking"
        heard="January to March, by category"
        caption="January to March, by category, as a table. Build it?"
      >
        <Btn variant="primary">Yes</Btn>
      </VoiceStage>
    );

  if (missing.length === 0)
    return (
      <VoiceStage
        device="Kitchen speaker"
        mood="speaking"
        caption="March, by category, as a table — the table because that's what you had last time."
      >
        <Btn variant="primary">Build it</Btn>
      </VoiceStage>
    );

  if (missing.length < 3)
    return (
      <VoiceStage device="Kitchen speaker" mood="listening" caption="Up to what date?" />
    );

  return (
    <VoiceStage
      device="Kitchen speaker"
      mood="listening"
      caption="What dates, and how do you want it broken down?"
    />
  );
}

GuidedInputPreview.surfaces = { voice: GuidedVoice };

// ── On a canvas ─────────────────────────────────────────────────────────────
//
// Same `work`. The board answers half the form before anybody types: the object
// somebody picked carries its own dates and scope, so the empty fields are
// exactly the ones the board could not answer — which makes the remaining work
// visible without a word of instruction.
function GuidedCanvas({ work, set }) {
  const { from, to, kind, said, bad } = work;
  const values = { from, to, kind };

  return (
    <Board title="Board · Spending">
      <Obj label="March" meta="142 payments" selected>
        <span className="cv-layer">From the board: 01–31 Mar</span>
      </Obj>

      <Obj label="New report" meta={bad ? "Two fields disagree" : "Not made yet"} wide>
        <OnObject>
          {ROWS.map((r) => (
            <span className="mk-guide-row" key={r.key} data-filled={values[r.key] ? "" : undefined}>
              <Label>{r.label}</Label>
              <Field
                placeholder={r.hint}
                value={values[r.key]}
                state={bad && r.key !== "kind" ? "error" : "idle"}
                onChange={(e) => set({ ...work, [r.key]: e.target.value, said: false })}
              />
            </span>
          ))}
          <Btns align="end">
            <Btn variant="primary" disabled={bad || !from || !to || !kind}>
              Place it beside March
            </Btn>
          </Btns>
        </OnObject>
      </Obj>

      <span className="cv-foot">
        <Say tone="mute" size="sm">
          {said ? "Filled from a sentence, marked as such" : "Empty fields are what the board couldn't answer"}
        </Say>
      </span>
    </Board>
  );
}

GuidedInputPreview.surfaces.canvas = GuidedCanvas;
