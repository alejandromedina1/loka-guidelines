import { Body, Btn, Btns, Chip, Frame, FrameBar, GhostLines, Label, Note, Say } from "./kit.jsx";

// Structured Output on invoice extraction — the clearest non-chat case, and the
// one where the failure is invisible by construction: a guessed field and a read
// field look the same unless the interface makes them not.
const FIELDS = [
  { key: "Supplier", value: "Northwind Logistics Ltd", conf: "high" },
  { key: "Invoice no.", value: "NW-2291-B", conf: "high" },
  { key: "Date", value: "14 Aug 2025", conf: "low" },
  { key: "Total", value: "£18,420.00", conf: "high" },
];

function FieldRow({ f, mark, open, edited }) {
  return (
    <div className="mk-xf" data-state={mark}>
      <span className="mk-xf-key">{f.key}</span>
      <span className="mk-xf-val" data-empty={f.value ? undefined : ""}>
        {f.value || "Not found"}
      </span>
      {mark === "low" && <Chip>Check</Chip>}
      {mark === "missing" && <Chip>Not found</Chip>}
      {edited && <Chip>You set this</Chip>}
      {open && <Chip>Page 1</Chip>}
    </div>
  );
}

export function StructuredOutputPreview({ state }) {
  return (
    <Frame width={540}>
      <FrameBar title="invoice-NW-2291.pdf · Extracted" />
      <Body>
        <span className="mk-scope-head">
          <Label>Fields</Label>
          {/* Per field, never per document: a single score says something is
              wrong somewhere and leaves the reader to find it. */}
          <Chip>4 of 4 found</Chip>
        </span>

        <div className="mk-list">
          {FIELDS.map((f, i) => {
            // The shortcut renders every field identically — the date the model
            // inferred looks exactly like the total it read off the page.
            const low = f.conf === "low";
            return (
              <FieldRow
                key={f.key}
                f={state === "missing" && i === 2 ? { ...f, value: "" } : f}
                mark={state === "missing" && i === 2 ? "missing" : low && state !== "edited" ? "low" : undefined}
                open={state === "source" && i === 0}
                edited={state === "edited" && i === 2}
              />
            );
          })}
        </div>

        {state === "source" && (
          <div className="mk-source">
            <Label>Northwind Logistics Ltd</Label>
            <GhostLines widths={[100, 64]} tone="mute" />
          </div>
        )}

        {state === "lowconf" && (
          <Note tone="warn" title="One field needs a look">
            The date was inferred from the filing stamp, not read from the invoice body.
          </Note>
        )}
        {state === "missing" && (
          <Note tone="plain" title="No date on this document">
            Left empty. Add it by hand if you have it.
          </Note>
        )}
        {state === "edited" && (
          <Note tone="ok" title="Your value is kept">
            Marked as human-set. The next extraction run won't overwrite it.
          </Note>
        )}

        <span className="mk-foot">
          <Say tone="mute" size="sm">
            {state === "source" ? "Every field opens where it came from" : "Check, then post"}
          </Say>
          <Btns align="end">
            <Btn>Re-extract</Btn>
            <Btn variant="primary">Post to ledger</Btn>
          </Btns>
        </span>
      </Body>
    </Frame>
  );
}
