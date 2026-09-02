import { Body, Btn, Btns, Chip, Frame, FrameBar, Label, Note, Row, Say } from "./kit.jsx";

// No-Answer Fallback on a matching surface — candidates against a role. A
// ranked list is where this failure does the most damage, because somebody
// will act on whatever sits at the top whether or not it deserves to be there.
const STRONG = [
  { name: "A. Okonkwo", score: 91 },
  { name: "R. Villanueva", score: 84 },
];
const WEAK = [
  { name: "J. Marsh", score: 31 },
  { name: "T. Bakker", score: 24 },
  { name: "S. Idris", score: 12 },
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
      <FrameBar title="Senior Platform Engineer · Matches" />
      <Body>
        {state === "confident" && (
          <>
            <span className="mk-scope-head">
              <Label>Matches above 70%</Label>
              <Chip>412 searched</Chip>
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
            <Note tone="plain" title="No candidate cleared 70%">
              Searched 412 profiles against this role. The closest was 31%.
            </Note>
            <span className="mk-foot">
              <Say tone="mute" size="sm">
                Nothing is shown rather than something ranked first by default.
              </Say>
              <Btns align="end">
                <Btn>Show near misses</Btn>
                <Btn variant="primary">Widen criteria</Btn>
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
            <Say tone="mute" size="sm">
              Set apart and scored, never merged into the list above. That merge is the failure this
              pattern is named after.
            </Say>
          </>
        )}

        {state === "insufficient" && (
          <>
            <Note tone="warn" title="Not enough data to rank yet">
              Only 6 profiles carry the skills this role scores on. That's a gap in the data, not an
              absence of candidates — the two need different actions.
            </Note>
            <Btns align="end">
              <Btn>Import more profiles</Btn>
              <Btn variant="primary">Score manually</Btn>
            </Btns>
          </>
        )}
      </Body>
    </Frame>
  );
}
