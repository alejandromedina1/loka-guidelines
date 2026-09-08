import { Body, Chip, Cite, Frame, FrameBar, GhostLines, Label, Note, Row, Say } from "./kit.jsx";

// Sourced Answer, on a question about your own money. The Partly sourced state
// is the one worth staring at: it's the only preview here where two sentences
// that look equally authoritative aren't — and the unsourced one is the kind of
// plausible general claim a reader has no reason to doubt.
export function GroundedAnswerPreview({ state }) {
  return (
    <Frame width={550}>
      <FrameBar title="Why is March higher?" />
      <Body>
        {state === "none" ? (
          <>
            <Note tone="plain" title="Nothing found">
              Searched 1,204 payments in <strong>March</strong> and found nothing from Vodafone.
            </Note>
          </>
        ) : (
          <p className="mk-answer">
            <span className="mk-grounded">
              Food went up £96, mostly takeaways
              <Cite n={1} open={state === "source"} />
            </span>{" "}
            {state === "mixed" ? (
              /* The shortcut drops the distinction entirely. Same two sentences,
                 same weight — and the second one now reads as sourced. */
              <span className="mk-ungrounded">
                and most households saw energy costs rise by about a third this winter.
              </span>
            ) : (
              <span className="mk-grounded">
                and your energy bill rose £34
                <Cite n={2} />
              </span>
            )}
          </p>
        )}

        {state === "mixed" && (
          <Note tone="warn" title="Not from your payments">
            Nothing in your accounts covers other households. The second sentence is general
            knowledge.
          </Note>
        )}

        {state === "source" && (
          <div className="mk-source">
            <span className="mk-source-head">
              <Label>Eating out · March</Label>
              <Chip>8 payments</Chip>
            </span>
            <GhostLines widths={[100, 72]} tone="mute" />
            <Say size="sm">Deliveroo · 28 Mar · £34.10</Say>
            <GhostLines widths={[96, 44]} tone="mute" />
          </div>
        )}

        {state === "locked" && (
          <div className="mk-source">
            <Row lead tone="mute">
              <Label>Sam's credit card · March</Label>
            </Row>
            <Note tone="plain" title="You don't have access to this account">
              Ask Sam to share it.
            </Note>
          </div>
        )}

        {(state === "cited" || state === "mixed") && (
          <span className="mk-chips">
            <Chip>2 sources</Chip>
            <Chip>1,204 payments read</Chip>
          </span>
        )}
      </Body>
    </Frame>
  );
}
