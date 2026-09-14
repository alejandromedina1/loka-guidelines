import { Body, Btn, Btns, Chip, Diff, Frame, FrameBar, Note, Say } from "./kit.jsx";
import { Board, Nothing, Obj, OnObject, Pair } from "./canvas.jsx";
import { Handoff, VoiceStage } from "./voice.jsx";

// Change Review on suggested categories for payments. Two changes is enough to
// make the point the pattern turns on: accept is per unit, and nothing is
// pre-selected.
//
// Each change is decided on its own, for real. Accept one and reject the other
// and the tally says so; change your mind and it changes back; Apply only ever
// applies what you accepted. "Partly accepted" is therefore something you did
// rather than a frame — which matters here more than anywhere, because the
// whole argument is that accept-all is a convenience rather than the shape of
// the control, and a wireframe where the only button is Accept all makes the
// opposite case.
//
// The proposal used to be a code diff, which asked the reader to parse a
// language before they could see the pattern. A category on a payment is the
// same shape of decision — a before and an after, accepted one at a time — and
// it costs nobody anything to read.
const CHANGES = [
  { id: "deliveroo", n: "Deliveroo · £34.10", from: "Shopping", to: "Eating out" },
  { id: "pret", n: "Pret · £4.60", from: "Eating out", to: "Coffee" },
];

function Hunk({ c, decided, onDecide }) {
  return (
    <div className="mk-hunk" data-decided={decided}>
      <span className="mk-hunk-head">
        <span className="mk-hunk-name">{c.n}</span>
        {/* The Tag has one paint, so the chip's word can't be the only
            signal — Accepted and Rejected drew identically. The outcome now
            shows on the change itself: see .mk-hunk[data-decided]. */}
        {decided && <Chip>{decided === "accepted" ? "Accepted" : "Rejected"}</Chip>}
      </span>
      <Diff from={c.from} to={c.to} />
      {/* Per change, and under the change they act on rather than beside its
          label — at the button's real 40px that row would have overflowed.
          Undecide is here because a review with no way back is an approval. */}
      <Btns>
        {decided ? (
          <Btn onClick={() => onDecide(null)}>Undecide</Btn>
        ) : (
          <>
            <Btn onClick={() => onDecide("rejected")}>Reject</Btn>
            <Btn>Edit</Btn>
            <Btn variant="primary" onClick={() => onDecide("accepted")}>
              Accept
            </Btn>
          </>
        )}
      </Btns>
    </div>
  );
}

export function DiffReviewPreview({ work, set }) {
  const { base, decided, applied } = work;
  const list = Object.values(decided);
  const accepted = list.filter((d) => d === "accepted").length;
  const rejected = list.filter((d) => d === "rejected").length;

  if (base === "empty") {
    return (
      <Frame width={570}>
        <FrameBar title="1,204 payments · checked" />
        <Body>
          <Note tone="ok" title="Nothing to change">
            Checked 1,204 payments. Every one is already in the right category.
          </Note>
        </Body>
      </Frame>
    );
  }

  if (base === "stale") {
    return (
      <Frame width={570}>
        <FrameBar title="2 payments · suggested categories" />
        <Body>
          <Note
            tone="warn"
            title="These payments changed while this was open"
            actions={
              <Btns align="end">
                <Btn onClick={() => set({ base: "empty", decided: {}, applied: false })}>
                  Discard
                </Btn>
                <Btn
                  variant="primary"
                  onClick={() => set({ base: "open", decided: {}, applied: false })}
                >
                  Check again
                </Btn>
              </Btns>
            }
          >
            You renamed one of them two minutes ago. These suggestions were worked out from the old
            names, so applying them now would undo that.
          </Note>
        </Body>
      </Frame>
    );
  }

  if (applied) {
    return (
      <Frame width={570}>
        <FrameBar title="2 payments · suggested categories" />
        <Body>
          <Note
            tone="ok"
            title={`${accepted} payment${accepted === 1 ? "" : "s"} recategorised`}
            actions={
              <Btns align="end">
                <Btn onClick={() => set({ base: "open", decided: {}, applied: false })}>
                  Undo all
                </Btn>
                <Btn variant="primary">View payments</Btn>
              </Btns>
            }
          >
            {rejected > 0
              ? `Reversible for the next 30 minutes. The ${rejected} you rejected are unchanged.`
              : "Reversible for the next 30 minutes."}
          </Note>
        </Body>
      </Frame>
    );
  }

  return (
    <Frame width={570}>
      <FrameBar title="2 payments · suggested categories" />
      <Body>
        {CHANGES.map((c) => (
          <Hunk
            key={c.id}
            c={c}
            decided={decided[c.id]}
            onDecide={(d) => {
              const next = { ...decided };
              if (d) next[c.id] = d;
              else delete next[c.id];
              set({ ...work, decided: next });
            }}
          />
        ))}
        <span className="mk-foot">
          <Say tone="mute" size="sm">
            {list.length === 0
              ? "Nothing applied yet"
              : `${accepted} accepted · ${rejected} rejected`}
          </Say>
          <Btns align="end">
            <Btn
              disabled={list.length === CHANGES.length}
              onClick={() =>
                set({
                  ...work,
                  decided: Object.fromEntries(CHANGES.map((c) => [c.id, "accepted"])),
                })
              }
            >
              Accept all
            </Btn>
            <Btn
              variant="primary"
              disabled={accepted === 0}
              onClick={() => set({ ...work, applied: true })}
            >
              {accepted > 1 ? `Apply ${accepted}` : "Apply"}
            </Btn>
          </Btns>
        </span>
      </Body>
    </Frame>
  );
}

DiffReviewPreview.work = {
  for: (id) =>
    ({
      proposed: { base: "open", decided: {}, applied: false },
      empty: { base: "empty", decided: {}, applied: false },
      partial: { base: "open", decided: { deliveroo: "accepted", pret: "rejected" }, applied: false },
      stale: { base: "stale", decided: {}, applied: false },
      applied: { base: "open", decided: { deliveroo: "accepted", pret: "rejected" }, applied: true },
    })[id] ?? { base: "open", decided: {}, applied: false },

  state: (w) => {
    if (w.base === "empty") return "empty";
    if (w.base === "stale") return "stale";
    if (w.applied) return "applied";
    return Object.keys(w.decided).length ? "partial" : "proposed";
  },
};

// ── The same pattern, on a canvas ───────────────────────────────────────────
//
// Same `work` again: `decided` is a verdict per change whether the change is a
// row in a list or an object on a board, so the state machine doesn't move.
//
// What moves is where the decision lives. On a screen the accept controls sit
// under each change because a footer bar would put them the same distance from
// both; on a canvas that argument gets stronger and more literal — the controls
// attach to the object, so accepting one is something you do *to a thing*. The
// before and after are the object itself rather than two lines of text, which
// is the one comparison this surface can make that a document can't.
function DiffCanvas({ work, set }) {
  const { base, decided, applied } = work;
  const list = Object.values(decided);
  const accepted = list.filter((d) => d === "accepted").length;

  if (base === "empty") {
    return (
      <Board title="Board · suggested tidy-up">
        {/* An empty result has no empty list to be, so it is empty space that
            says why — otherwise a board with nothing proposed on it looks
            identical to a board nobody has checked. */}
        <Nothing>Checked every object. Nothing needs changing.</Nothing>
      </Board>
    );
  }

  if (applied) {
    return (
      <Board title="Board · suggested tidy-up">
        <Nothing>
          {accepted} object{accepted === 1 ? "" : "s"} updated. Reversible for 30 minutes.
        </Nothing>
      </Board>
    );
  }

  return (
    <Board title="Board · suggested tidy-up">
      <Pair>
        {CHANGES.map((c) => {
          const verdict = decided[c.id];
          const decide = (d) => {
            const next = { ...decided };
            if (d) next[c.id] = d;
            else delete next[c.id];
            set({ ...work, decided: next });
          };
          return (
            <Obj
              key={c.id}
              label={c.n}
              /* What happened, not what it says — the value is in the object
                 below, and printing it in the head as well was the same word
                 twice, two lines apart. */
              meta={verdict === "accepted" ? "Used" : verdict === "rejected" ? "Kept" : "Suggested"}
              tone={verdict === "accepted" ? "next" : verdict === "rejected" ? "now" : undefined}
              /* Handles on the ones still to decide. Selection is how a canvas
                 says "this is the one you are acting on", so spending it on the
                 undecided objects is the drawing of "nothing is pre-selected". */
              selected={!verdict}
            >
              {/* Before and after as the object, not as two lines of text. The
                  proposed version sits over the current one, which is the
                  comparison a canvas can make and a document cannot. */}
              {!verdict && (
                <span className="cv-stack">
                  <span className="cv-layer" data-tone="now">
                    {c.from}
                  </span>
                  <span className="cv-layer" data-tone="next">
                    {c.to}
                  </span>
                </span>
              )}
              {verdict && <span className="cv-layer" data-tone={verdict === "accepted" ? "next" : "now"}>
                {verdict === "accepted" ? c.to : c.from}
              </span>}
              <OnObject>
                {verdict ? (
                  <Btn onClick={() => decide(null)}>Undecide</Btn>
                ) : (
                  <>
                    <Btn onClick={() => decide("rejected")}>Keep</Btn>
                    <Btn variant="primary" onClick={() => decide("accepted")}>
                      Use
                    </Btn>
                  </>
                )}
              </OnObject>
            </Obj>
          );
        })}
      </Pair>
      <span className="cv-foot">
        <Say tone="mute" size="sm">
          {list.length === 0 ? "Nothing applied yet" : `${accepted} of ${CHANGES.length} to apply`}
        </Say>
        <Btns align="end">
          <Btn variant="primary" disabled={accepted === 0} onClick={() => set({ ...work, applied: true })}>
            Apply
          </Btn>
        </Btns>
      </span>
    </Board>
  );
}

DiffReviewPreview.surfaces = { canvas: DiffCanvas };

// ── No voice form, drawn as what happens instead ────────────────────────────
//
// A before and an after is a comparison, and a comparison is something you hold
// two of at once. One change survives being read out; two is already past what
// anybody can weigh, and this pattern's entire argument is that they are decided
// separately. So it does not exist here.
//
// What does exist is the decision to *go and look*, and the summary that lets
// somebody make it. Voice can say how many and how risky and then get out of the
// way — which is Approval Gate's shape, not this one's, and naming that is more
// use than a spoken diff nobody could follow.
function DiffVoice({ work, set }) {
  const { base, decided, applied } = work;
  const accepted = Object.values(decided).filter((d) => d === "accepted").length;

  if (base === "empty") {
    return (
      <VoiceStage
        device="Kitchen speaker"
        mood="rest"
        heard="Anything to tidy up?"
        caption="No. Everything's in the right category."
      />
    );
  }

  if (applied) {
    return (
      <VoiceStage
        device="Kitchen speaker"
        mood="rest"
        heard="Did that go through?"
        caption={`${accepted} updated. You've got half an hour to undo it.`}
      />
    );
  }

  return (
    <VoiceStage
      device="Kitchen speaker"
      mood="speaking"
      heard="Anything to tidy up?"
      caption={
        base === "stale"
          ? "Two were suggested, but they've changed since. Worth a fresh look."
          : "Two payments look miscategorised. Neither is urgent."
      }
    >
      <Handoff to="Sent to your phone">
        Deciding them means holding two before-and-afters at once, which is a thing to look at
        rather than a thing to hear.
      </Handoff>
      <Btn onClick={() => set({ ...work, base: "open", decided: {}, applied: false })}>
        Leave it for now
      </Btn>
    </VoiceStage>
  );
}

DiffReviewPreview.surfaces.voice = DiffVoice;
