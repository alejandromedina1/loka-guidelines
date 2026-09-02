import { Body, Btn, Btns, Chip, Frame, FrameBar, Label, Note, Row, Say } from "./kit.jsx";

// Version History on a CRM record. The failure it guards against is quiet: once
// automated edits are logged as "System", nobody knows which ones to check.
const TRAIL = [
  { who: "Enrichment run 41", ai: true, what: "Set industry, employee count", when: "16:04" },
  { who: "Priya Raman", ai: false, what: "Corrected billing contact", when: "14:22" },
  { who: "Enrichment run 40", ai: true, what: "Set renewal date", when: "09:15" },
];

export function VersionHistoryPreview({ state }) {
  // The shortcut flattens every automated change to "System" — a log, not a
  // history, and unusable for deciding what to re-check.

  return (
    <Frame width={540}>
      <FrameBar title="Northwind Ltd · History" />
      <Body>
        {state === "trail" && (
          <>
            <span className="mk-scope-head">
              <Label>Last 30 days</Label>
              <Chip>2 automated · 1 person</Chip>
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
            <Label>Enrichment run 41 · 16:04</Label>
            <span className="mk-diff">
              <span className="mk-diff-line" data-kind="del">Industry — Logistics</span>
              <span className="mk-diff-line" data-kind="add">Industry — Freight &amp; Logistics</span>
            </span>
            <Say tone="mute" size="sm">
              In the record's own terms, not as a payload.
            </Say>
          </>
        )}

        {state === "attributed" && (
          <div className="mk-source">
            <span className="mk-source-head">
              <Label>Enrichment run 41</Label>
              <Chip>Scheduled, 16:00</Chip>
            </span>
            <div className="mk-params">
              <Row>
                <span className="mk-param">
                  <span className="mk-param-key">Could see</span>
                  <span className="mk-param-val">Companies House, website, 2 support tickets</span>
                </span>
              </Row>
              <Row>
                <span className="mk-param">
                  <span className="mk-param-key">Triggered by</span>
                  <span className="mk-param-val">Weekly enrichment schedule</span>
                </span>
              </Row>
            </div>
          </div>
        )}

        {state === "restore" && (
          <Note tone="plain" title="Restoring to 14:22">
            This adds a new entry rather than removing the two above it. A history you can rewrite
            can't be used to explain anything.
          </Note>
        )}

        <span className="mk-foot">
          <Say tone="mute" size="sm">
            {state === "restore" ? "Restore is itself a change" : "30 days, and it means 30 days"}
          </Say>
          <Btns align="end">
            <Btn>Compare</Btn>
            <Btn variant="primary">{state === "restore" ? "Confirm restore" : "Restore a point"}</Btn>
          </Btns>
        </span>
      </Body>
    </Frame>
  );
}
