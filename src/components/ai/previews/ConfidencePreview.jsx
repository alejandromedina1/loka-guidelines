import { Body, Btn, Btns, Chip, Frame, FrameBar, GhostLines, Label, Note, Say } from "./kit.jsx";

// Confidence Levels on an account risk score — a number somebody acts on,
// where the temptation is to print it to two decimal places and call that rigour.
export function ConfidencePreview({ state }) {
  const banded = state === "banded";
  const low = state === "low";

  return (
    <Frame width={540}>
      <FrameBar title="Northwind Ltd · Renewal risk" />
      <Body>
        <span className="mk-scope-head">
          <Label>Renewal risk</Label>
          {state !== "unavailable" && (
            <Chip>{low ? "Low confidence" : "Based on 14 signals"}</Chip>
          )}
        </span>

        {state === "unavailable" ? (
          <Note tone="plain" title="Not enough signal to score this account">
            Six weeks of history and no support contact. A number here would be one you'd tell
            somebody to ignore.
          </Note>
        ) : (
          <div className="mk-band" data-tone={low ? "low" : "high"}>
            {/* The shortcut prints the raw output. Two decimals read as a
                measurement; it's a model estimate with a wide error bar. */}
            <span className="mk-band-value">
              {low ? "Uncertain" : "High risk"}
            </span>
            <span className="mk-band-scale" aria-hidden>
              <span className="mk-band-fill" style={{ width: low ? "48%" : "74%" }} />
            </span>
            <span className="mk-band-note">
              {low ? "Between low and high — not enough to separate them" : "Top of four ranges"}
            </span>
          </div>
        )}

        {state === "high" && <GhostLines widths={[100, 92, 58]} tone="mute" />}

        {low && (
          <Note tone="warn" title="Review before acting">
            Open the evidence before acting on this score.
          </Note>
        )}

        <span className="mk-foot">
          <Say tone="mute" size="sm">
            {state === "unavailable" ? "Score returns at 20 signals" : "High · Medium · Low · Unscored"}
          </Say>
          <Btns align="end">
            <Btn>Why this score</Btn>
            <Btn variant="primary" disabled={low || state === "unavailable"}>
              Flag for renewal
            </Btn>
          </Btns>
        </span>
      </Body>
    </Frame>
  );
}
