import { Body, Btn, Btns, Chip, Frame, FrameBar, Label, Note, Row, Say } from "./kit.jsx";

// Undo & History on one payment. The failure it guards against is quiet: once
// automatic changes are logged as "System", nobody knows which ones to check.
const TRAIL = [
  { who: "Auto-sort", ai: true, what: "Set category · Groceries", when: "16:04" },
  { who: "Sam", ai: false, what: "Renamed to Sainsbury's Local", when: "14:22" },
  { who: "Auto-sort", ai: true, what: "Read the shop name off the receipt", when: "09:15" },
];

export function VersionHistoryPreview({ state }) {
  // The shortcut flattens every automatic change to "System" — a log, not a
  // history, and unusable for deciding what to re-check.

  return (
    <Frame width={540}>
      <FrameBar title="Sainsbury's · £48.20" />
      <Body>
        {state === "trail" && (
          <>
            <span className="mk-scope-head">
              <Label>Last 30 days</Label>
              <Chip>2 automatic · 1 person</Chip>
            </span>
            <div className="mk-list">
              {TRAIL.map((e) => (
                <Row key={e.who + e.when} lead={e.ai} tone={e.ai ? undefined : "mute"}>
                  <span className="mk-hist">
                    <span className="mk-hist-who">{e.who}</span>
                    <span className="mk-hist-what">{e.what}</span>
                    <span className="mk-hist-when">{e.when}</span>
                  </span>
                </Row>
              ))}
            </div>
          </>
        )}

        {state === "diff" && (
          <>
            <Label>Auto-sort · 16:04</Label>
            <span className="mk-diff">
              <span className="mk-diff-line" data-kind="del">
                Category — Shopping
              </span>
              <span className="mk-diff-line" data-kind="add">
                Category — Groceries
              </span>
            </span>
          </>
        )}

        {state === "attributed" && (
          <div className="mk-source">
            <span className="mk-source-head">
              <Label>Auto-sort</Label>
              <Chip>Ran at 16:04</Chip>
            </span>
            <div className="mk-params">
              <Row>
                <span className="mk-param">
                  <span className="mk-param-key">Could see</span>
                  <span className="mk-param-val">The receipt photo, your last 6 payments here</span>
                </span>
              </Row>
              <Row>
                <span className="mk-param">
                  <span className="mk-param-key">Set off by</span>
                  <span className="mk-param-val">A new payment landing</span>
                </span>
              </Row>
            </div>
          </div>
        )}

        {state === "restore" && (
          <Note tone="plain" title="Going back to 14:22">
            This adds a new entry. The two changes above it stay in the record.
          </Note>
        )}

        <span className="mk-foot">
          <Say tone="mute" size="sm">
            {state === "restore" ? "Logged as a new entry" : "30 days, and it means 30 days"}
          </Say>
          <Btns align="end">
            <Btn>Compare</Btn>
            <Btn variant="primary">
              {state === "restore" ? "Confirm" : "Go back to a point"}
            </Btn>
          </Btns>
        </span>
      </Body>
    </Frame>
  );
}
