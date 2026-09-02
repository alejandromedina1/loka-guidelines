import { Body, Frame, FrameBar, Ghost, GhostLines, Label, Note, Say, Spinner } from "./kit.jsx";

// Staged Reveal on an analytics view — the clearest non-chat case, and the one
// where the alternative (a single spinner over everything) is most obviously
// worse: five fast queries end up waiting on the sixth.
const CARDS = [
  { key: "revenue", label: "Revenue", value: "£1.24m" },
  { key: "churn", label: "Churn", value: "3.1%" },
  { key: "pipeline", label: "Pipeline", value: "£840k" },
  { key: "nps", label: "NPS", value: "47" },
];

// Which cards have landed at each state, so the layout is identical throughout
// and only the contents change.
const RESOLVED = { skeletons: 0, partial: 2, slow: 3, failed: 3, complete: 4 };

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
      <FrameBar title="Account health · Q3" />
      <Body>
        {/* The same four boxes at the same size in every state. If the grid
            moved between here and Complete, the placeholders were wrong. */}
        <div className="mk-metrics">
          {CARDS.map((c, i) => (
            <Card key={c.key} card={c} status={statusFor(i)} />
          ))}
        </div>

        <div className="mk-panel">
          <Label>Top movers</Label>
          {state === "complete" ? (
            <GhostLines widths={[92, 84, 70]} />
          ) : (
            <GhostLines widths={[92, 84, 70]} tone="mute" />
          )}
        </div>

        {state === "failed" && (
          <Note tone="plain" title="1 of 4 didn't load">
            The other three are current as of 14:02. Nothing here is waiting on the one that failed.
          </Note>
        )}
        {state === "slow" && (
          <Say tone="mute" size="sm">
            Pipeline is taking longer than the rest. It says so in its own card rather than holding
            the other three.
          </Say>
        )}
      </Body>
    </Frame>
  );
}
