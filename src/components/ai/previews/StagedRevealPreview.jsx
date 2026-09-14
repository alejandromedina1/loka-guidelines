import { Body, Btn, Frame, FrameBar, Ghost, GhostLines, Label, Note, Say, Spinner } from "./kit.jsx";
import { Handoff, VoiceStage } from "./voice.jsx";

// Results in Pieces on a month summary — the clearest non-chat case, and the one
// where the alternative (a single spinner over everything) is most obviously
// worse: three fast figures end up waiting on the fourth.
//
// The four cards land one at a time, and the third one runs long. That is the
// whole pattern and it was the thing the canvas couldn't previously show: the
// frame cut from nothing to two to four, so "pieces arriving" was three
// screenshots of arrangements rather than arrival.
//
// THE LAG IS ON THE ORDINARY RUN, ON PURPOSE.
//
// It was briefly treated as a failure and kept off the default run with
// Connection lost and Failed midway, under the rule that a wireframe which
// breaks on a timer teaches that breaking is normal. That was a misreading of
// its own state note — "the slow one says so in its own space rather than
// holding the other five hostage" is the pattern working, not the pattern
// failing. A run where all four land smoothly demonstrates nothing at all: it
// is a fast page, and a fast page has no reason to reveal in pieces. The
// argument only exists because one piece is slow, so the default run is the one
// where a piece is slow — two figures land, the third says it is still going,
// and five seconds later the page finishes.
//
// One piece *failed* stays off the timer. That one really is a failure.
//
// It is also the one pattern here with almost no controls, and that is correct
// rather than unfinished — the behaviour being documented is the system's. A
// reader watches it, tabs to the two states it can end up in, and presses Start
// over to watch it again. The exception is Retry on the card that failed,
// because a failed piece a reader can't retry makes the pattern's own claim —
// the other three are still good — look like a consolation rather than a
// design.
const CARDS = [
  { key: "spent", label: "Spent", value: "£1,840" },
  { key: "bills", label: "Bills", value: "£740" },
  { key: "savings", label: "Savings", value: "£320" },
  { key: "refunds", label: "Refunds", value: "£46" },
];

// Per card, because they don't come back together — which is the argument.
const ARRIVE = [500, 260, 900, 340];

// The card that runs long, and how long it runs. Savings is the third, so two
// figures are already on screen when it starts saying so — which is the shape
// the pattern is about: a slow piece that isn't holding the fast ones.
const LAGS = 2;
const LAG = 5000;

function Card({ card, status, onRetry }) {
  return (
    <div className="mk-metric" data-status={status}>
      <Label>{card.label}</Label>
      {status === "done" && <span className="mk-metric-value">{card.value}</span>}
      {status === "pending" && <Ghost w={62} />}
      {status === "slow" && <Spinner label="Still running" />}
      {status === "failed" && (
        <span className="mk-metric-fail">
          Couldn't load
          <button
            className="mk-metric-retry"
            type="button"
            tabIndex={onRetry ? undefined : -1}
            onClick={onRetry}
          >
            Retry
          </button>
        </span>
      )}
    </div>
  );
}

export function StagedRevealPreview({ work, set }) {
  const { landed, stall } = work;
  const statusFor = (i) => {
    if (i < landed) return "done";
    if (i === landed && stall) return stall;
    return "pending";
  };
  const complete = landed === CARDS.length;

  return (
    <Frame width={540}>
      <FrameBar title="This month at a glance" />
      <Body>
        {/* The same four boxes at the same size in every state. If the grid
            moved between here and Complete, the placeholders were wrong. */}
        <div className="mk-metrics">
          {CARDS.map((c, i) => (
            <Card
              key={c.key}
              card={c}
              status={statusFor(i)}
              onRetry={
                statusFor(i) === "failed"
                  ? () => set({ landed: landed + 1, stall: null })
                  : undefined
              }
            />
          ))}
        </div>

        <div className="mk-panel">
          <Label>Biggest changes</Label>
          <GhostLines widths={[92, 84, 70]} tone={complete ? undefined : "mute"} />
        </div>

        {stall === "failed" && (
          <Note tone="plain" title={`${landed} of ${CARDS.length} loaded`}>
            {`The rest are current as of 14:02. ${CARDS[landed].label} can be retried on its own.`}
          </Note>
        )}
        {/* One text node: an expression next to text makes React emit a comment
            marker between them, which puts one inside the sentence. */}
        {stall === "slow" && (
          <Say tone="mute" size="sm">{`${CARDS[landed].label} is taking longer than the rest.`}</Say>
        )}
      </Body>
    </Frame>
  );
}

StagedRevealPreview.work = {
  for: (id) =>
    ({
      skeletons: { landed: 0, stall: null },
      partial: { landed: 2, stall: null },
      slow: { landed: LAGS, stall: "slow" },
      failed: { landed: 3, stall: "failed" },
      complete: { landed: CARDS.length, stall: null },
    })[id] ?? { landed: 0, stall: null },

  state: (w) => {
    if (w.stall) return w.stall;
    if (w.landed === 0) return "skeletons";
    return w.landed === CARDS.length ? "complete" : "partial";
  },

  // One card at a time, at the pace that card takes, with the third one taking
  // five seconds to say so and five more to arrive.
  //
  // A lag resolves; a failure doesn't. That asymmetry is the rule: the run
  // carries on through One piece lagging because that is what a slow piece
  // does, and stops at One piece failed because the only thing that clears a
  // failure is somebody retrying it. Tabbing to either holds the system, so a
  // reader who wants to sit and look at the spinner can.
  tick: (w) => {
    if (w.stall === "failed") return null;
    if (w.stall === "slow") return { work: { ...w, stall: null, landed: w.landed + 1 }, in: LAG };
    if (w.landed >= CARDS.length) return null;
    return w.landed === LAGS
      ? { work: { ...w, stall: "slow" }, in: ARRIVE[w.landed] }
      : { work: { ...w, landed: w.landed + 1 }, in: ARRIVE[w.landed] };
  },
};

// ── No voice form, drawn as what happens instead ────────────────────────────
//
// The verdict is "No form here" and it is the clearest case in the library.
// This pattern's whole argument is that three fast figures shouldn't wait on a
// slow fourth — which only means anything where they can be looked at side by
// side. Speech is one thing after another, so there is no arrangement to
// protect: the pieces cannot land beside each other because there is no
// beside.
//
// What happens instead is the same instinct on a surface that can carry it: say
// the part that is ready, name the one that isn't, and don't hold the first
// hostage to the second. The slow piece is still not allowed to block — it just
// blocks a sentence rather than a grid.
function StagedVoice({ work, set }) {
  const { landed, stall } = work;
  const ready = CARDS.slice(0, landed);
  const said = ready.map((c) => `${c.label.toLowerCase()} ${c.value}`).join(", ");

  if (landed === 0) {
    return <VoiceStage device="Kitchen speaker" mood="thinking" heard="How was this month?" />;
  }

  if (landed === CARDS.length) {
    return (
      <VoiceStage
        device="Kitchen speaker"
        mood="rest"
        heard="How was this month?"
        caption={`Spent £1,840, bills £740, savings £320, refunds £46.`}
      >
        <Handoff to="Sent to your phone">
          Four figures is the most anybody holds from one sentence. The comparison they are
          part of needs somewhere to sit still.
        </Handoff>
      </VoiceStage>
    );
  }

  return (
    <VoiceStage
      device="Kitchen speaker"
      mood="speaking"
      heard="How was this month?"
      caption={
        stall === "failed"
          ? `Got ${said}. ${CARDS[landed].label} didn't come back.`
          : stall === "slow"
            ? `${said.charAt(0).toUpperCase()}${said.slice(1)}. ${CARDS[landed].label} is taking a while.`
            : `${said.charAt(0).toUpperCase()}${said.slice(1)}, and the rest is coming.`
      }
    >
      {/* Not holding the ready part hostage to the slow one — the same
          instinct as the screen version, on a surface with no grid to keep it
          in. */}
      {stall === "failed" && (
        <Btn variant="primary" onClick={() => set({ landed: landed + 1, stall: null })}>
          Try that one again
        </Btn>
      )}
      {stall === "slow" && <Btn onClick={() => set({ landed: landed + 1, stall: null })}>Wait for it</Btn>}
    </VoiceStage>
  );
}

StagedRevealPreview.surfaces = { voice: StagedVoice };
