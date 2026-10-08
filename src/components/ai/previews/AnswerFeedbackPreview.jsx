import { Body, Btn, Btns, Chip, Field, Frame, FrameBar, Hot, Label, Part, Say } from "./kit.jsx";
import { VoiceStage } from "./voice.jsx";
import { Board, Obj, OnObject } from "./canvas.jsx";

// Answer Feedback on a help-centre answer about refunds — the kind of answer a
// person can judge in a second and a metric can't judge at all.
//
// Two thumbs and nothing else at rest. The pattern's whole argument is about
// what each one asks for afterwards: up asks for nothing, down asks for one
// reason and lets you skip it, and "harmful" is not a worse thumbs-down but a
// different thing — a report, with a reference, and the answer taken down.
//
// The reasons are the product's, not a survey's: four, short, and the one
// that turns a rating into a report is the last of them.
const ANSWER =
  "Annual plans can be refunded within 60 days, monthly plans within 14. After that, unused time is credited to your next bill.";
const BETTER =
  "Yes, on an annual plan within 60 days of paying. Monthly plans get 14 days; after that it becomes credit instead.";
const REASONS = ["Wrong", "Out of date", "Not what was asked", "Harmful"];
const START = { vote: null, reason: null, sent: false, again: false };

function Thumb({ dir, on }) {
  return (
    <span className="mk-thumb" data-dir={dir} data-on={on ? "" : undefined}>
      <svg viewBox="0 0 16 16" width="100%" height="100%" aria-hidden>
        <path d="M2.5 7h2.5v6.5H2.5zM6.5 13.5h5.3a1.4 1.4 0 0 0 1.4-1.1l.8-3.9a1.4 1.4 0 0 0-1.4-1.7H9.8V4.2A1.6 1.6 0 0 0 8.2 2.6L6.5 7z" />
      </svg>
      {/* The word, because a filled thumb against an outlined one is a state
          carried by paint alone. */}
      <span className="vh">{on ? " (chosen)" : ""}</span>
    </span>
  );
}

export function AnswerFeedbackPreview({ work, set }) {
  const { vote, reason, sent, again } = work;
  const reported = sent && reason === "Harmful";
  const asking = vote === "down" && !sent;

  return (
    <Frame width={540}>
      <FrameBar title="Help centre · Refunds" />
      <Body>
        <Label>Can I get a refund after 30 days?</Label>

        {reported ? (
          <div className="mk-fb-hidden">
            <span className="mk-fb-hidden-title">Answer hidden while it&apos;s reviewed</span>
            <span className="mk-fb-ref">Reference R-2291 · sent to the help team</span>
          </div>
        ) : (
          <p className="mk-fb-answer">{again ? BETTER : ANSWER}</p>
        )}

        {!reported && (
          <span className="mk-fb">
            <Say tone="mute" size="sm">
              {vote === "up" ? "Thanks" : vote === "down" ? (sent ? "Sent to the help team" : "What was wrong?") : "Was this helpful?"}
            </Say>
            {/* Pressing a chosen thumb again takes the rating back — the Correct
                axis, met by the control that made the rating. */}
            <Part name="Button">
              <span className="mk-thumbs">
                <Hot
                  label="Helpful"
                  onClick={() => set({ ...START, again, vote: vote === "up" ? null : "up" })}
                >
                  <Thumb dir="up" on={vote === "up"} />
                </Hot>
                <Hot
                  label="Not helpful"
                  onClick={() => set({ ...START, again, vote: vote === "down" ? null : "down" })}
                >
                  <Thumb dir="down" on={vote === "down"} />
                </Hot>
              </span>
            </Part>
          </span>
        )}

        {asking && (
          <div className="mk-fb-why">
            <Part name="Tags">
              <span className="mk-fb-reasons">
                {REASONS.map((r) => (
                  <Hot key={r} label={r} onClick={() => set({ ...work, reason: r, sent: true })}>
                    <Chip>{r}</Chip>
                  </Hot>
                ))}
              </span>
            </Part>
            <Part name="Input Field" block>
              <Field placeholder="Anything else? (optional)" />
            </Part>
            <Part name="Button">
              <Btns align="end">
                <Btn onClick={() => set({ ...work, sent: true })}>Skip</Btn>
              </Btns>
            </Part>
          </div>
        )}

        {sent && !reported && (
          <span className="mk-foot">
            {reason ? (
              <Part name="Tags">
                <Chip>{reason}</Chip>
              </Part>
            ) : (
              <span />
            )}
            <Part name="Button">
              <Btns align="end">
                <Btn variant="primary" onClick={() => set({ ...START, again: true })}>
                  Get a better answer
                </Btn>
              </Btns>
            </Part>
          </span>
        )}

        {/* A report can't be unsent, so there is no undo here — only the way
            back to an answer. */}
        {reported && (
          <span className="mk-foot">
            <Say tone="mute" size="sm">You&apos;ll hear back by email</Say>
            <Part name="Button">
              <Btns align="end">
                <Btn onClick={() => set({ ...START, again: true })}>Ask again</Btn>
              </Btns>
            </Part>
          </span>
        )}
      </Body>
    </Frame>
  );
}

AnswerFeedbackPreview.work = {
  for: (id) =>
    ({
      answered: START,
      up: { ...START, vote: "up" },
      down: { ...START, vote: "down" },
      sent: { ...START, vote: "down", reason: "Out of date", sent: true },
      reported: { ...START, vote: "down", reason: "Harmful", sent: true },
    })[id] ?? START,

  state: (w) => {
    if (!w.vote) return "answered";
    if (w.vote === "up") return "up";
    if (!w.sent) return "down";
    return w.reason === "Harmful" ? "reported" : "sent";
  },

  // No tick. A rating is somebody's to give; nothing here happens on its own.
};

// ── Spoken ──────────────────────────────────────────────────────────────────
//
// Same `work`. There are no thumbs to tap, so the rating is a sentence — and
// the one rule is that the product never asks for it mid-answer. "That's
// wrong" works at any moment; a question about the answer comes only once it
// has finished, and only one.
function FeedbackVoice({ work, set }) {
  const { vote, reason, sent, again } = work;
  const reported = sent && reason === "Harmful";

  if (reported)
    return (
      <VoiceStage
        device="Speaker"
        mood="stopped"
        heard="That's not okay to say"
        caption="Reported. Someone will look at it, and that answer is off for now."
      >
        <Btn onClick={() => set({ ...START, again: true })}>Ask again</Btn>
      </VoiceStage>
    );

  if (sent)
    return (
      <VoiceStage device="Speaker" mood="rest" heard={reason ?? "Never mind"} caption="Noted. Want another go at it?">
        <Btn variant="primary" onClick={() => set({ ...START, again: true })}>Yes, try again</Btn>
      </VoiceStage>
    );

  if (vote === "down")
    return (
      <VoiceStage
        device="Speaker"
        mood="listening"
        heard="That's wrong"
        caption="What was wrong — out of date, or not what was asked?"
      >
        <Btn onClick={() => set({ ...work, reason: "Out of date", sent: true })}>Out of date</Btn>
        <Btn onClick={() => set({ ...work, reason: "Not what was asked", sent: true })}>Not what was asked</Btn>
        <Btn onClick={() => set({ ...work, reason: "Harmful", sent: true })}>Report it</Btn>
      </VoiceStage>
    );

  if (vote === "up")
    return <VoiceStage device="Speaker" mood="rest" heard="Perfect, thanks" caption="Good to hear." />;

  return (
    <VoiceStage
      device="Speaker"
      mood="speaking"
      heard="Can I get a refund after 30 days?"
      caption={again ? BETTER : ANSWER}
    >
      <Btn onClick={() => set({ ...START, again, vote: "down" })}>That&apos;s wrong</Btn>
      <Btn onClick={() => set({ ...START, again, vote: "up" })}>Thanks</Btn>
    </VoiceStage>
  );
}

AnswerFeedbackPreview.surfaces = { voice: FeedbackVoice };

// ── On a canvas ─────────────────────────────────────────────────────────────
//
// Same `work`. The rating lives on the object it judges, and a thumbs-down can
// point at the part that was wrong — on a board the answer is two sentences
// you can select separately, which no panel of thumbs could do.
function FeedbackCanvas({ work, set }) {
  const { vote, reason, sent, again } = work;
  const reported = sent && reason === "Harmful";
  const [first, second] = (again ? BETTER : ANSWER).split(/(?<=\.) /);

  return (
    <Board title="Board · Refund FAQ">
      <Obj
        label="Answer"
        meta={reported ? "Hidden for review" : sent ? `Flagged · ${reason ?? "no reason"}` : vote === "up" ? "Rated helpful" : undefined}
        selected={vote === "down" && !sent}
        tone={vote === "up" ? "next" : undefined}
        wide
      >
        {reported ? (
          <span className="cv-layer" data-provisional>Taken off the board until a person has looked</span>
        ) : (
          <>
            <span className="cv-layer">{first}</span>
            <span className="cv-layer" data-tone={vote === "down" ? "now" : undefined}>
              {second}
            </span>
          </>
        )}
        {!reported && (
          <OnObject>
            <Hot label="Helpful" onClick={() => set({ ...START, again, vote: vote === "up" ? null : "up" })}>
              <Thumb dir="up" on={vote === "up"} />
            </Hot>
            <Hot label="Not helpful" onClick={() => set({ ...START, again, vote: vote === "down" ? null : "down" })}>
              <Thumb dir="down" on={vote === "down"} />
            </Hot>
          </OnObject>
        )}
      </Obj>
      <span className="cv-foot">
        <Say tone="mute" size="sm">
          {vote === "down" && !sent ? "Second sentence picked as the wrong part" : "Ratings stay with the object"}
        </Say>
        {vote === "down" && !sent && (
          <Btns align="end">
            <Btn onClick={() => set({ ...work, reason: "Wrong", sent: true })}>Flag that part</Btn>
            <Btn onClick={() => set({ ...work, reason: "Harmful", sent: true })}>Report</Btn>
          </Btns>
        )}
        {(sent || reported) && (
          <Btns align="end">
            <Btn variant="primary" onClick={() => set({ ...START, again: true })}>Redo the answer</Btn>
          </Btns>
        )}
      </span>
    </Board>
  );
}

AnswerFeedbackPreview.surfaces.canvas = FeedbackCanvas;
