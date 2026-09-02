import { Body, Chip, Cite, Frame, FrameBar, GhostLines, Label, Note, Row, Say } from "./kit.jsx";

// Grounded Answer. The Mixed state is the one worth staring at: it's the only
// preview here where two sentences that look equally authoritative aren't.
export function GroundedAnswerPreview({ state }) {
  return (
    <Frame width={550}>
      <FrameBar title="Ask your documents" />
      <Body>
        {state === "none" ? (
          <>
            <Note tone="plain" title="Nothing found">
              Searched 12 documents in <strong>Contracts / 2025</strong> and found nothing covering
              renewal notice periods.
            </Note>
            <Say tone="mute" size="sm">
              No answer was generated from general knowledge. A silent fallback here, styled like a
              sourced answer, is the failure this pattern exists to prevent.
            </Say>
          </>
        ) : (
          <p className="mk-answer">
            <span className="mk-grounded">
              Renewal requires 60 days' written notice
              <Cite n={1} open={state === "source"} />
            </span>{" "}
            {state === "mixed" ? (
              /* The shortcut drops the distinction entirely. Same two sentences,
                 same weight — and the second one now reads as sourced. */
              <span className="mk-ungrounded">
                and most vendors in this category allow a 30-day grace period after that.
              </span>
            ) : (
              <span className="mk-grounded">
                and auto-renews for twelve months otherwise
                <Cite n={2} />
              </span>
            )}
          </p>
        )}

        {state === "mixed" && (
          <Note tone="warn" title="Not from your documents">
            The second sentence is the model's own. It carries no marker and is set apart, because
            blended into one uniform paragraph it would read exactly as sourced.
          </Note>
        )}

        {state === "source" && (
          <div className="mk-source">
            <span className="mk-source-head">
              <Label>Master Agreement · p.14</Label>
              <Chip>Updated Mar 2025</Chip>
            </span>
            <GhostLines widths={[100, 72]} tone="mute" />
            <Say size="sm">
              “…either party may terminate by providing sixty (60) days' written notice…”
            </Say>
            <GhostLines widths={[96, 44]} tone="mute" />
          </div>
        )}

        {state === "locked" && (
          <div className="mk-source">
            <Row lead tone="mute">
              <Label>Master Agreement · p.14</Label>
            </Row>
            <Note tone="plain" title="You don't have access to this source">
              It exists and it supports the claim. Ask the Legal team for access — hiding it entirely
              would make a sourced answer look invented.
            </Note>
          </div>
        )}

        {(state === "cited" || state === "mixed") && (
          <span className="mk-chips">
            <Chip>2 sources</Chip>
            <Chip>12 documents searched</Chip>
          </span>
        )}
      </Body>
    </Frame>
  );
}
