import { Body, Frame, FrameBar, Ghost, GhostLines, Label, Note, Say, Spinner } from "./kit.jsx";

// Results in Pieces on a month summary — the clearest non-chat case, and the one
// where the alternative (a single spinner over everything) is most obviously
// worse: three fast figures end up waiting on the fourth.
const CARDS = [
  { key: "spent", label: "Spent", value: "£1,840" },
  { key: "bills", label: "Bills", value: "£740" },
  { key: "savings", label: "Savings", value: "£320" },
  { key: "refunds", label: "Refunds", value: "£46" },
];

// Which cards have landed at each state, so the layout is identical throughout
// and only the contents change.
//
// `slow` stops at 2 so the lagging card is Savings — the one the caption
// underneath names. It was one further along, which put the spinner on a card
// the caption never mentioned and left the state contradicting its own readout.
const RESOLVED = { skeletons: 0, partial: 2, slow: 2, failed: 3, complete: 4 };

function Card({ card, status }) {
  return (
    <div className="mk-metric" data-status={status}>
      <Label>{card.label}</Label>
      {status === "done" && <span className="mk-metric-value">{card.value}</span>}
      {status === "pending" && <Ghost w={62} />}
      {status === "slow" && <Spinner label="Still running" />}
      {status === "failed" && (
        <span className="mk-metric-fail">
          Couldn't load
          <button className="mk-metric-retry" type="button" tabIndex={-1}>
            Retry
          </button>
        </span>
      )}
    </div>
  );
}

export function StagedRevealPreview({ state }) {
  const resolved = RESOLVED[state] ?? 0;
  const statusFor = (i) => {
    if (i < resolved) return "done";
    if (state === "slow" && i === resolved) return "slow";
    if (state === "failed" && i === resolved) return "failed";
    return "pending";
  };

  return (
    <Frame width={540}>
      <FrameBar title="This month at a glance" />
      <Body>
        {/* The same four boxes at the same size in every state. If the grid
            moved between here and Complete, the placeholders were wrong. */}
        <div className="mk-metrics">
          {CARDS.map((c, i) => (
            <Card key={c.key} card={c} status={statusFor(i)} />
          ))}
        </div>

        <div className="mk-panel">
          <Label>Biggest changes</Label>
          {state === "complete" ? (
            <GhostLines widths={[92, 84, 70]} />
          ) : (
            <GhostLines widths={[92, 84, 70]} tone="mute" />
          )}
        </div>

        {state === "failed" && (
          <Note tone="plain" title="1 of 4 didn't load">
            The other three are current as of 14:02. Retrying Refunds.
          </Note>
        )}
        {state === "slow" && (
          <Say tone="mute" size="sm">
            Savings is taking longer than the rest.
          </Say>
        )}
      </Body>
    </Frame>
  );
}
