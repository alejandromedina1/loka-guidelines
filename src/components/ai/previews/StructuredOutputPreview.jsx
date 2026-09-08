import { Body, Btn, Btns, Chip, Field, Frame, FrameBar, GhostLines, Label, Note, Say } from "./kit.jsx";

// Structured Output on a photographed receipt — the clearest non-chat case, and
// the one where the failure is invisible by construction: a guessed field and a
// read field look the same unless the interface makes them not.
const FIELDS = [
  { key: "Shop", value: "Sainsbury's Local", conf: "high" },
  { key: "Date", value: "14 Aug 2025", conf: "low" },
  { key: "Total", value: "£48.20", conf: "high" },
  { key: "Card", value: "•••• 4471", conf: "high" },
];

function FieldRow({ f, mark, open, edited }) {
  return (
    <div className="mk-xf" data-state={mark}>
      <span className="mk-xf-key">{f.key}</span>
      {/* A corrected value is one somebody typed, so it renders as the field
          they typed it into rather than as text with a chip claiming they did.
          This is also the pattern's only essential part it wasn't drawing:
          Structured Output lists Input Field in `composedOf`, and every state
          used to be read-only. */}
      {edited ? (
        <Field value={f.value} state="focus" />
      ) : (
        <span className="mk-xf-val" data-empty={f.value ? undefined : ""}>
          {f.value || "Not found"}
        </span>
      )}
      {mark === "low" && <Chip>Check</Chip>}
      {mark === "missing" && <Chip>Not found</Chip>}
      {edited && <Chip>You set this</Chip>}
      {open && <Chip>On the photo</Chip>}
    </div>
  );
}

export function StructuredOutputPreview({ state }) {
  return (
    <Frame width={540}>
      <FrameBar title="Receipt · 14 Aug" />
      <Body>
        <span className="mk-scope-head">
          <Label>Fields</Label>
          {/* Per field, never per receipt: a single score says something is
              wrong somewhere and leaves the reader to find it. */}
          <Chip>4 of 4 found</Chip>
        </span>

        <div className="mk-list">
          {FIELDS.map((f, i) => {
            // The shortcut renders every field identically — the date the model
            // worked out looks exactly like the total it read off the paper.
            const low = f.conf === "low";
            return (
              <FieldRow
                key={f.key}
                f={state === "missing" && i === 1 ? { ...f, value: "" } : f}
                mark={
                  state === "missing" && i === 1
                    ? "missing"
                    : low && state !== "edited"
                      ? "low"
                      : undefined
                }
                open={state === "source" && i === 0}
                edited={state === "edited" && i === 1}
              />
            );
          })}
        </div>

        {state === "source" && (
          <div className="mk-source">
            <Label>Sainsbury's Local</Label>
            <GhostLines widths={[100, 64]} tone="mute" />
          </div>
        )}

        {state === "lowconf" && (
          <Note tone="warn" title="One field needs a look">
            The date came from the folder this photo was in, not from the receipt.
          </Note>
        )}
        {state === "missing" && (
          <Note tone="plain" title="No date on this receipt">
            Left empty. Add it by hand if you have it.
          </Note>
        )}
        {state === "edited" && (
          <Note tone="ok" title="Your value is kept">
            Marked as yours. The next scan won't overwrite it.
          </Note>
        )}

        <span className="mk-foot">
          <Say tone="mute" size="sm">
            {state === "source" ? "Every field opens where it came from" : "Check, then save"}
          </Say>
          <Btns align="end">
            <Btn>Scan again</Btn>
            <Btn variant="primary">Save receipt</Btn>
          </Btns>
        </span>
      </Body>
    </Frame>
  );
}
