import { Body, Btn, Btns, Chip, Frame, FrameBar, GhostLines, Label, Note, Say } from "./kit.jsx";

// Confidence Levels on a duplicate-charge check — something somebody acts on
// with their bank, where the temptation is to print a percentage to two decimal
// places and call that rigour.

// The three bands a check can land in. Drawn rather than named in prose,
// because how many of them are lit is the entire read: one band is an
// estimate, three is an estimate that couldn't separate them. What used to sit
// here was a single continuous fill — the false precision this pattern exists
// to argue against, drawn by the pattern arguing against it.
const BANDS = ["Low", "Medium", "High"];

// from/to are inclusive indices into BANDS, so every check is a span and a
// confident one is just a span of one. This is also what finally separates
// "Above the bar" from "Shown as a range": the second is wider, visibly.
const SPAN = {
  high: { from: 2, to: 2, value: "Likely a duplicate", note: "Highest of three bands" },
  banded: { from: 1, to: 2, value: "Possibly a duplicate", note: "Spans two bands" },
  low: { from: 0, to: 2, value: "Can't tell", note: "Spans all three bands" },
};

export function ConfidencePreview({ state }) {
  const low = state === "low";
  const span = SPAN[state];

  return (
    <Frame width={540}>
      <FrameBar title="Sainsbury's · £48.20" />
      <Body>
        <span className="mk-scope-head">
          <Label>Charged twice?</Label>
          {state !== "unavailable" && <Chip>{low ? "Low confidence" : "Based on 6 checks"}</Chip>}
        </span>

        {state === "unavailable" ? (
          <Note tone="plain" title="Not enough history to check this">
            Three weeks of payments, and none of them from this shop.
          </Note>
        ) : (
          <div className="mk-band" data-tone={low ? "low" : "high"}>
            <span className="mk-band-value">{span.value}</span>
            <span className="mk-bands">
              {BANDS.map((b, i) => (
                <span
                  key={b}
                  className="mk-bands-seg"
                  data-on={(i >= span.from && i <= span.to) || undefined}
                >
                  <span className="mk-bands-tick" aria-hidden />
                  <span className="mk-bands-name">{b}</span>
                </span>
              ))}
            </span>
            <span className="mk-band-note">{span.note}</span>
          </div>
        )}

        {(state === "high" || state === "banded") && (
          <GhostLines widths={[100, 92, 58]} tone="mute" />
        )}

        {low && (
          <Note tone="warn" title="Check before reporting">
            Open both payments before reporting this to your bank.
          </Note>
        )}

        <span className="mk-foot">
          <Say tone="mute" size="sm">
            {state === "unavailable" ? "Checks return at 3 months" : "Last checked 14:02"}
          </Say>
          <Btns align="end">
            <Btn>Show both payments</Btn>
            <Btn variant="primary" disabled={low || state === "unavailable"}>
              Report to your bank
            </Btn>
          </Btns>
        </span>
      </Body>
    </Frame>
  );
}
