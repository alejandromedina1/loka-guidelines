import { Body, Btn, Btns, Chip, Frame, FrameBar, Note, Say } from "./kit.jsx";

// Change Review. Two hunks is enough to make the point the pattern turns on:
// accept is per unit, and nothing is pre-selected.
function Hunk({ n, decided, from, to }) {
  return (
    <div className="mk-hunk" data-decided={decided}>
      <span className="mk-hunk-head">
        <span className="mk-hunk-name">Change {n}</span>
        {decided && (
          <Chip tone={decided === "accepted" ? "ok" : "mute"}>
            {decided === "accepted" ? "Accepted" : "Rejected"}
          </Chip>
        )}
      </span>
      <span className="mk-diff">
        <span className="mk-diff-line" data-kind="del">
          {from}
        </span>
        <span className="mk-diff-line" data-kind="add">
          {to}
        </span>
      </span>
      {/* Per-hunk, and under the change they act on rather than beside its
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
      <FrameBar title="billing/renewals.ts — 2 proposed changes" />
      <Body>
        {state === "empty" ? (
          <Note tone="ok" title="Nothing to change">
            Checked 34 files. The renewal logic already handles the 60-day case. Rendered as a
            result, not as an empty diff.
          </Note>
        ) : state === "applied" ? (
          <>
            <Note tone="ok" title="2 changes applied to billing/renewals.ts">
              Reversible for the next 30 minutes.
            </Note>
            <Btns align="end">
              <Btn>Undo all</Btn>
              <Btn variant="primary">View file</Btn>
            </Btns>
          </>
        ) : state === "stale" ? (
          <>
            <Note tone="warn" title="The file changed while this was open">
              Somebody edited line 47 two minutes ago. These changes were written against the old
              version, so applying them now would overwrite that work.
            </Note>
            <Btns align="end">
              <Btn>Discard</Btn>
              <Btn variant="primary">Re-check the file</Btn>
            </Btns>
          </>
        ) : (
          <>
            {/* The shortcut arrives with both changes already accepted and
                Apply lit. Every per-hunk control is gone, so the only move left
                is the one nobody read. */}
            <Hunk
              n={1}
              decided={state === "partial" ? "accepted" : undefined}
              from="const NOTICE_DAYS = 30;"
              to="const NOTICE_DAYS = 60;"
            />
            <Hunk
              n={2}
              from="if (daysLeft < NOTICE) warn();"
              to="if (daysLeft <= NOTICE) warn();"
            />
            <span className="mk-foot">
              <Say tone="mute" size="sm">
                {state === "partial" ? "1 of 2 accepted" : "Nothing applied yet"}
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
