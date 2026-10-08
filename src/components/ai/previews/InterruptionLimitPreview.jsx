import { Body, Btn, Btns, Frame, FrameBar, Label, Note, Part, Say } from "./kit.jsx";
import { VoiceStage } from "./voice.jsx";
import { Board, Obj, OnObject } from "./canvas.jsx";

// Interruption Limit, in the settings of the product that has Heads-Up. A
// ceiling is only interesting once something is being held against it, so the
// drawing's subject is the QUEUE — what it wanted to raise this week and
// didn't. That list is the only evidence anybody has that the number is right,
// and hiding it makes the whole budget unfalsifiable: with no queue, restraint
// and having nothing to say look identical.
//
// Deliberately not Spending Limits' meters. Three bars filling is a run being
// consumed; this is a week with a few marks on it and a list underneath, which
// is what a budget measured in somebody's patience actually looks like.
const CAP = 3;
const DAYS = ["M", "T", "W", "T", "F", "S", "S"];
const SPOKE = [
  { day: 1, what: "Disney+ went up to £10.99" },
  { day: 3, what: "Council tax due on Friday" },
  { day: 4, what: "Your gym went to annual billing" },
];
const HELD = [
  { what: "Spotify went up 40p", why: "Can wait for the summary" },
  { what: "Two new merchants this week", why: "Nothing to do about it" },
];

export function InterruptionLimitPreview({ work, set }) {
  const { used, queued, urgent, off } = work;
  const left = Math.max(0, CAP - used);
  const spoke = SPOKE.slice(0, used);

  return (
    <Frame width={540}>
      <FrameBar title="How often it speaks up" />
      <Body>
        {/* The week, with what it spent marked on the day it spent it. A bar
            would say how much is left; this says what it was spent ON, which is
            the only form anybody can judge. */}
        <span className="mk-week" role="img" aria-label={`${used} of ${CAP} used this week, ${left} left.`}>
          {DAYS.map((d, i) => (
            <span
              key={`${d}${i}`}
              className="mk-week-day"
              data-spoke={spoke.some((s) => s.day === i) ? "" : undefined}
            >
              {d}
            </span>
          ))}
        </span>

        <span className="mk-scope-head">
          <Label>{off ? "Turned off" : `${used} of ${CAP} used this week`}</Label>
          <span className="mk-cap-num">{off ? "Nothing at all" : left ? `${left} left` : "None left"}</span>
        </span>

        <div className="mk-list">
          {spoke.map((s, i) => (
            <Part key={s.what} name={i === 0 ? "List Item" : null} block>
              <span className="mk-week-row">
                <span className="mk-week-what">{s.what}</span>
                <span className="mk-week-kind">Said</span>
              </span>
            </Part>
          ))}
        </div>

        {/* The half that makes the ceiling checkable. Held back, with why. */}
        {queued > 0 && (
          <>
            <Label>Held back</Label>
            <div className="mk-list">
              {HELD.slice(0, queued).map((h) => (
                <span key={h.what} className="mk-week-row" data-held="">
                  <span className="mk-week-what">
                    {h.what}
                    <span className="mk-week-why">{h.why}</span>
                  </span>
                  <span className="mk-week-kind">Held</span>
                </span>
              ))}
            </div>
          </>
        )}

        {urgent && (
          <Part name="Banner" block>
            <Note tone="warn" kind="Broke the limit" title="A payment to an account you've never used">
              Logged as an override, with the reason.
            </Note>
          </Part>
        )}

        <span className="mk-foot">
          <Say tone="mute" size="sm">
            {left === 0 && !urgent ? "Nothing more until Monday" : "Resets Monday"}
          </Say>
          <Part name="Button">
            <Btns align="end">
              <Btn onClick={() => set({ ...work, off: !off, used: off ? 1 : 0, queued: off ? 2 : 0 })}>
                {off ? "Let it speak again" : "Never interrupt me"}
              </Btn>
            </Btns>
          </Part>
        </span>
      </Body>
    </Frame>
  );
}

InterruptionLimitPreview.work = {
  for: (id) =>
    ({
      quiet: { used: 0, queued: 0, urgent: false, off: false },
      spent: { used: 1, queued: 0, urgent: false, off: false },
      held: { used: 1, queued: 2, urgent: false, off: false },
      full: { used: CAP, queued: 2, urgent: false, off: false },
      override: { used: CAP, queued: 2, urgent: true, off: false },
    })[id] ?? { used: 0, queued: 0, urgent: false, off: false },

  state: (w) =>
    w.urgent ? "override" : w.used >= CAP ? "full" : w.queued > 0 ? "held" : w.used > 0 ? "spent" : "quiet",

  // No tick. A budget that spent itself while somebody watched the settings
  // page would be the product interrupting the screen about interrupting.
};

// ── Spoken ──────────────────────────────────────────────────────────────────
//
// Same `work`. Speaking into a room costs far more than a mark on a page, so
// the same ceiling buys fewer interruptions — and the held-back queue has
// nowhere to sit where anybody would find it, which is the strongest argument
// this pattern has for a smaller number on this surface.
function LimitVoice({ work, set }) {
  const { used, queued, urgent, off } = work;

  if (urgent)
    return (
      <VoiceStage
        device="Kitchen speaker"
        mood="speaking"
        caption="Breaking in for one thing: a payment to an account you've never used before."
      />
    );

  if (off) return <VoiceStage device="Kitchen speaker" mood="rest" />;

  if (used >= CAP)
    return (
      <VoiceStage
        device="Kitchen speaker"
        mood="rest"
        heard="Anything I should know?"
        caption="Nothing more until Monday — three this week already. Two things are waiting."
      >
        <Btn variant="primary" onClick={() => set({ ...work, used: 1 })}>Tell me anyway</Btn>
      </VoiceStage>
    );

  if (queued > 0)
    return (
      <VoiceStage
        device="Kitchen speaker"
        mood="rest"
        heard="Anything I should know?"
        caption="Two small things being held — a 40p rise and some new merchants. Neither needs you."
      />
    );

  return <VoiceStage device="Kitchen speaker" mood="rest" />;
}

InterruptionLimitPreview.surfaces = { voice: LimitVoice };

// ── On a canvas ─────────────────────────────────────────────────────────────
//
// Same `work`, and this is the surface where the pattern's hardest problem gets
// easier. A held-back queue on a screen lives behind a control nobody opens;
// on a board it can simply be placed, quietly, off to one side — which turns a
// suppressed list into something somebody finds on their own terms rather than
// something they have to be told about.
function LimitCanvas({ work, set }) {
  const { used, queued, urgent } = work;

  return (
    <Board title="Board · This week">
      {SPOKE.slice(0, used).map((s) => (
        <Obj key={s.what} label={s.what} meta="Raised" tone="next">
          <span className="cv-layer" data-tone="next">Spent one of three</span>
        </Obj>
      ))}

      {queued > 0 &&
        HELD.slice(0, queued).map((h) => (
          <Obj key={h.what} label={h.what} meta="Not raised">
            {/* Placed rather than announced. The board is the only surface
                where holding something back and still showing it are the same
                move. */}
            <span className="cv-layer" data-provisional>{h.why}</span>
          </Obj>
        ))}

      {urgent && (
        <Obj label="Payment to a new account" meta="Broke the limit" selected wide>
          <span className="cv-layer" data-tone="next">Override, with a reason on it</span>
          <OnObject>
            <Btns align="end">
              <Btn onClick={() => set({ ...work, urgent: false })}>That wasn&apos;t worth it</Btn>
            </Btns>
          </OnObject>
        </Obj>
      )}

      <span className="cv-foot">
        <Say tone="mute" size="sm">
          {used >= CAP ? "The board stops changing — quieter than any message" : "Placed, never announced"}
        </Say>
      </span>
    </Board>
  );
}

InterruptionLimitPreview.surfaces.canvas = LimitCanvas;
