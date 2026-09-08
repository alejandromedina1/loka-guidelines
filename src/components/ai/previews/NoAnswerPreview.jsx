import { Body, Btn, Btns, Chip, Frame, FrameBar, Label, Note, Row, Say } from "./kit.jsx";

// No Good Match on finding a payment from a description. A ranked list is where
// this failure does the most damage, because somebody will act on whatever sits
// at the top whether or not it deserves to be there — and here that means
// querying the wrong charge with their bank.
const STRONG = [
  { name: "Sainsbury's Local · 14 Aug", score: 91 },
  { name: "Homebase · 12 Aug", score: 84 },
];
const WEAK = [
  { name: "Boots · 9 Aug", score: 31 },
  { name: "Co-op · 2 Aug", score: 24 },
  { name: "Shell · 28 Jul", score: 12 },
];

function Candidate({ c, weak }) {
  return (
    <Row lead={!weak} tone={weak ? "mute" : undefined}>
      <span className="mk-cand">
        <span className="mk-cand-name" data-weak={weak || undefined}>
          {c.name}
        </span>
        <span className="mk-score" data-weak={weak || undefined}>
          {c.score}% match
        </span>
      </span>
    </Row>
  );
}

export function NoAnswerPreview({ state }) {
  return (
    <Frame width={540}>
      <FrameBar title="Find a payment · about £48, garden centre" />
      <Body>
        {state === "confident" && (
          <>
            <span className="mk-scope-head">
              <Label>Matches above 70%</Label>
              <Chip>1,204 searched</Chip>
            </span>
            <div className="mk-list">
              {STRONG.map((c) => (
                <Candidate key={c.name} c={c} />
              ))}
            </div>
          </>
        )}

        {state === "none" && (
          <>
            <Note tone="plain" title="No payment cleared 70%">
              Searched 1,204 payments. The closest was 31%.
            </Note>
            <span className="mk-foot">
              <Say tone="mute" size="sm">
                1,204 searched · 0 above the bar
              </Say>
              <Btns align="end">
                <Btn>Show near misses</Btn>
                <Btn variant="primary">Search more widely</Btn>
              </Btns>
            </span>
          </>
        )}

        {state === "weak" && (
          <>
            <span className="mk-scope-head">
              <Label>Below the 70% bar</Label>
              <Chip>Opened deliberately</Chip>
            </span>
            <div className="mk-list">
              {WEAK.map((c) => (
                <Candidate key={c.name} c={c} weak />
              ))}
            </div>
          </>
        )}

        {state === "insufficient" && (
          <>
            <Note tone="warn" title="Not enough loaded to search yet">
              Only 3 weeks of payments are here. Anything older hasn't been brought in.
            </Note>
            <Btns align="end">
              <Btn>Bring in older payments</Btn>
              <Btn variant="primary">Search by hand</Btn>
            </Btns>
          </>
        )}
      </Body>
    </Frame>
  );
}
