import { Body, Btn, Btns, Chip, Frame, FrameBar, GhostLines, Label, Note, Row, Say } from "./kit.jsx";

// Visible Sources, drawn as a report builder rather than a chat: the thing being
// scoped is a set of data sources, and the question the pattern answers —
// "what will it actually read?" — is a number on screen before anything runs.
const SOURCES = [
  { name: "Salesforce · Opportunities", meta: "4,812 records", on: true },
  { name: "Zendesk · Tickets", meta: "Last 90 days", on: true },
  { name: "Finance · Invoices", meta: "No access", locked: true },
  { name: "Notion · Account notes", meta: "1,204 pages", on: false },
];

function Source({ s, on, locked }) {
  return (
    <Row lead={on} tone={on ? undefined : "mute"}>
      <span className="mk-src">
        <span className="mk-src-name" data-off={!on || undefined}>
          {s.name}
        </span>
        <span className="mk-src-meta">{locked ? "No access — ask Finance" : s.meta}</span>
      </span>
    </Row>
  );
}

export function ScopedContextPreview({ state }) {
  const on = state === "narrow" ? 1 : state === "empty" ? 0 : 2;
  return (
    <Frame width={540}>
      <FrameBar title="Quarterly account review" />
      <Body>
        <span className="mk-scope-head">
          <Label>Reading from</Label>
          {/* The ratio, not the count. "3 sources" reassures; "3 of 12" is the
              sentence that stops somebody trusting a quarter of the data. */}
          <Chip>
            {on} of {SOURCES.length} sources
          </Chip>
        </span>

        {state === "editing" || state === "narrow" || state === "empty" ? (
          <div className="mk-list">
            {SOURCES.map((s, i) => (
              <Source key={s.name} s={s} locked={s.locked} on={!s.locked && i < on} />
            ))}
          </div>
        ) : (
          <div className="mk-list">
            {SOURCES.filter((s) => s.on).map((s) => (
              <Source key={s.name} s={s} on />
            ))}
          </div>
        )}

        {state === "empty" && (
          <Note tone="warn" title="Nothing in scope">
            Choose at least one source. Nothing will be generated from general knowledge.
          </Note>
        )}

        {state === "stale" && (
          <Note tone="plain" title="Scope changed since this ran">
            This review was built from 2 sources. Zendesk was removed 4 minutes ago.
          </Note>
        )}

        <span className="mk-foot">
          <Say tone="mute" size="sm">
            {state === "stale" ? "Result is out of date" : "Nothing runs until you generate"}
          </Say>
          <Btns align="end">
            <Btn>Edit scope</Btn>
            <Btn variant="primary" disabled={state === "empty"}>
              {state === "stale" ? "Re-run" : "Generate"}
            </Btn>
          </Btns>
        </span>
      </Body>
    </Frame>
  );
}
