import { Body, Btn, Btns, Chip, Frame, FrameBar, Note, Say } from "./kit.jsx";

// Change Review on suggested categories for payments. Two changes is enough to
// make the point the pattern turns on: accept is per unit, and nothing is
// pre-selected.
//
// The proposal used to be a code diff, which asked the reader to parse a
// language before they could see the pattern. A category on a payment is the
// same shape of decision — a before and an after, accepted one at a time — and
// it costs nobody anything to read.
function Hunk({ n, decided, from, to }) {
  return (
    <div className="mk-hunk" data-decided={decided}>
      <span className="mk-hunk-head">
        <span className="mk-hunk-name">{n}</span>
        {/* The Tag has one paint, so the chip's word can't be the only
            signal — Accepted and Rejected drew identically. The outcome now
            shows on the change itself: see .mk-hunk[data-decided]. */}
        {decided && <Chip>{decided === "accepted" ? "Accepted" : "Rejected"}</Chip>}
      </span>
      <span className="mk-diff">
        <span className="mk-diff-line" data-kind="del">
          {from}
        </span>
        <span className="mk-diff-line" data-kind="add">
          {to}
        </span>
      </span>
      {/* Per change, and under the change they act on rather than beside its
          label — at the button's real 40px that row would have overflowed. */}
      {!decided && (
        <Btns>
          <Btn>Reject</Btn>
          <Btn>Edit</Btn>
          <Btn variant="primary">Accept</Btn>
        </Btns>
      )}
    </div>
  );
}

export function DiffReviewPreview({ state }) {
  return (
    <Frame width={570}>
      <FrameBar title="2 payments · suggested categories" />
      <Body>
        {state === "empty" ? (
          <Note tone="ok" title="Nothing to change">
            Checked 1,204 payments. Every one is already in the right category.
          </Note>
        ) : state === "applied" ? (
          <>
            <Note tone="ok" title="2 payments recategorised">
              Reversible for the next 30 minutes.
            </Note>
            <Btns align="end">
              <Btn>Undo all</Btn>
              <Btn variant="primary">View payments</Btn>
            </Btns>
          </>
        ) : state === "stale" ? (
          <>
            <Note tone="warn" title="These payments changed while this was open">
              You renamed one of them two minutes ago. These suggestions were worked out from the
              old names, so applying them now would undo that.
            </Note>
            <Btns align="end">
              <Btn>Discard</Btn>
              <Btn variant="primary">Check again</Btn>
            </Btns>
          </>
        ) : (
          <>
            {/* Partly accepted carries opposite verdicts on the two changes
                rather than one decided and one untouched. Two changes that went
                different ways is the strongest available drawing of "accept is
                per unit" — and it's what a reader has to see to believe that
                accept-all is a convenience rather than the shape of the
                control. */}
            <Hunk
              n="Deliveroo · £34.10"
              decided={state === "partial" ? "accepted" : undefined}
              from="Shopping"
              to="Eating out"
            />
            <Hunk
              n="Pret · £4.60"
              decided={state === "partial" ? "rejected" : undefined}
              from="Eating out"
              to="Coffee"
            />
            <span className="mk-foot">
              <Say tone="mute" size="sm">
                {state === "partial" ? "1 accepted · 1 rejected" : "Nothing applied yet"}
              </Say>
              <Btns align="end">
                <Btn>Accept all</Btn>
                <Btn variant="primary" disabled={state !== "partial"}>
                  Apply
                </Btn>
              </Btns>
            </span>
          </>
        )}
      </Body>
    </Frame>
  );
}
