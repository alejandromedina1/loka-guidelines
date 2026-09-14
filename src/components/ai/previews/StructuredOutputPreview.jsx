import { Body, Btn, Btns, Chip, Field, Frame, FrameBar, GhostLines, Hot, Label, Note, Say } from "./kit.jsx";
import { Handoff, VoiceStage } from "./voice.jsx";
import { Board, Obj, OnObject } from "./canvas.jsx";

// Structured Output on a photographed receipt — the clearest non-chat case, and
// the one where the failure is invisible by construction: a guessed field and a
// read field look the same unless the interface makes them not.
//
// Both of the things this pattern promises are done here rather than shown.
// Every value opens where it came from, and every value can be corrected — you
// click into it and type, and what you typed is then marked as yours and stops
// carrying the model's uncertainty. A wireframe that only *displays* a
// corrected value is claiming the correction is possible without offering it,
// which is the same shape of failure the pattern's own anti-pattern makes.
const FIELDS = ["Shop", "Date", "Total", "Card"];

// What came back from the read. Three ways it can go, and they are three
// outcomes rather than three steps — the same receipt scans clean, or scans
// with one field the model worked out instead of read, or scans with one field
// that isn't on the paper at all.
const READ = {
  clean: { Date: { value: "14 Aug 2025", from: "Printed under the till number", sure: true } },
  uncertain: { Date: { value: "14 Aug 2025", from: "The folder this photo was in", sure: false } },
  missing: { Date: { value: "", from: "Nothing on the receipt gives a date", sure: true } },
};
const FIXED = {
  Shop: { value: "Sainsbury's Local", from: "Top line of the receipt", sure: true },
  Total: { value: "£48.20", from: "Line marked TOTAL", sure: true },
  Card: { value: "•••• 4471", from: "Card line at the foot", sure: true },
};

export function StructuredOutputPreview({ work, set }) {
  const { base, values, edited, open } = work;
  const scan = { ...FIXED, ...READ[base] };
  const valueOf = (k) => values[k] ?? scan[k].value;
  const found = FIELDS.filter((k) => valueOf(k)).length;
  // A field the model worked out rather than read stays flagged until somebody
  // settles it, and the only thing that settles it is correcting it.
  const flagged = FIELDS.filter((k) => !scan[k].sure && !edited.includes(k) && valueOf(k));
  const absent = FIELDS.filter((k) => !valueOf(k) && !edited.includes(k));

  return (
    <Frame width={540}>
      <FrameBar title="Receipt · 14 Aug" />
      <Body>
        <span className="mk-scope-head">
          <Label>Fields</Label>
          {/* Per field, never per receipt: a single score says something is
              wrong somewhere and leaves the reader to find it. */}
          <Chip>
            {found} of {FIELDS.length} found
          </Chip>
        </span>

        <div className="mk-list">
          {FIELDS.map((k) => {
            const value = valueOf(k);
            const mine = edited.includes(k);
            const low = flagged.includes(k);
            const gone = absent.includes(k);
            // A value somebody typed renders as the field they typed it into,
            // and stays one — it is theirs now, and a value you can correct
            // once but not twice is a correction the product took away from
            // you. This is also the pattern's only essential part the wireframe
            // wasn't drawing: Structured Output lists Input Field in
            // `composedOf`, and every state used to be read-only.
            const editing = open === `edit:${k}` || mine;
            return (
              <div className="mk-xf" key={k} data-state={low ? "low" : gone ? "missing" : undefined}>
                <span className="mk-xf-key">{k}</span>
                {editing ? (
                  <Field
                    value={value}
                    state="focus"
                    autoFocus={open === `edit:${k}`}
                    onChange={(e) => set({ ...work, values: { ...values, [k]: e.target.value } })}
                  />
                ) : (
                  <Hot
                    label={open === k ? `Close where ${k} came from` : `Show where ${k} came from`}
                    onClick={() => set({ ...work, open: open === k ? null : k })}
                  >
                    <span className="mk-xf-val" data-empty={value ? undefined : ""}>
                      {value || "Not found"}
                    </span>
                  </Hot>
                )}
                {low && <Chip>Check</Chip>}
                {gone && <Chip>Not found</Chip>}
                {mine && <Chip>You set this</Chip>}
                {/* Done is what settles a guessed field: the flag comes off
                    because a person has now said what the value is. */}
                {open === `edit:${k}` ? (
                  <Hot
                    label={`Finish ${k}`}
                    onClick={() => set({ ...work, open: null, edited: mine ? edited : [...edited, k] })}
                  >
                    <Chip>Done</Chip>
                  </Hot>
                ) : mine ? null : (
                  <Hot label={`Correct ${k}`} onClick={() => set({ ...work, open: `edit:${k}` })}>
                    <Chip>Edit</Chip>
                  </Hot>
                )}
              </div>
            );
          })}
        </div>

        {/* Where the open value came from. The point of the pattern: every
            field traces back, including the one that turned out not to have
            come off the receipt at all. */}
        {open && !open.startsWith("edit:") && (
          <div className="mk-source">
            <span className="mk-source-head">
              <Label>{open}</Label>
              <Chip>{scan[open].sure ? "Read off the photo" : "Worked out"}</Chip>
            </span>
            <Say size="sm">{scan[open].from}</Say>
            <GhostLines widths={[100, 64]} tone="mute" />
          </div>
        )}

        {flagged.length > 0 && (
          <Note tone="warn" title="One field needs a look">
            The date came from the folder this photo was in, not from the receipt.
          </Note>
        )}
        {absent.length > 0 && (
          <Note tone="plain" title="No date on this receipt">
            Left empty. Add it by hand if you have it.
          </Note>
        )}
        {edited.length > 0 && (
          <Note tone="ok" title="Your value is kept">
            Marked as yours. The next scan won't overwrite it.
          </Note>
        )}

        <span className="mk-foot">
          <Say tone="mute" size="sm">
            Every field opens where it came from
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

StructuredOutputPreview.work = {
  for: (id) =>
    ({
      extracted: { base: "clean", values: {}, edited: [], open: null },
      lowconf: { base: "uncertain", values: {}, edited: [], open: null },
      missing: { base: "missing", values: {}, edited: [], open: null },
      source: { base: "clean", values: {}, edited: [], open: "Shop" },
      edited: { base: "uncertain", values: { Date: "12 Aug 2025" }, edited: ["Date"], open: null },
    })[id] ?? { base: "clean", values: {}, edited: [], open: null },

  state: (w) => {
    if (w.edited.length) return "edited";
    if (w.open && !w.open.startsWith("edit:")) return "source";
    if (w.base === "missing") return "missing";
    return w.base === "uncertain" ? "lowconf" : "extracted";
  },
};

// ── No voice form, drawn as what happens instead ────────────────────────────
//
// Fields, rows and cards are a layout, and a layout read out is a list nobody
// can hold — four keys and four values is past what anyone keeps from one
// sentence. So the pattern does not exist here.
//
// What survives is the part that matters most: a value the model worked out
// rather than read still has to be flagged, and flagging it out loud costs a
// clause rather than a chip. That is the trade this surface makes, and it is
// why the answer is one value and a handoff rather than four values.
function StructuredVoice({ work, set }) {
  const { base, values, edited, open } = work;
  const total = FIXED.Total.value;
  const date = values.Date ?? READ[base].Date.value;
  const mine = edited.includes("Date");

  if (open && !open.startsWith("edit:")) {
    return (
      <VoiceStage
        device="Headphones"
        mood="rest"
        heard="Where did that come from?"
        caption="Off the top line of the receipt."
      >
        <Btn onClick={() => set({ ...work, open: null })}>Back</Btn>
      </VoiceStage>
    );
  }

  return (
    <VoiceStage
      device="Headphones"
      mood={mine ? "rest" : "speaking"}
      heard="What was that receipt?"
      /* One value, and the flag as a clause. The other three are on the phone,
         because saying them is saying a list. */
      caption={
        mine
          ? `${total} at Sainsbury's, dated ${date}. Yours now — the next scan won't touch it.`
          : base === "missing"
            ? `${total} at Sainsbury's. There's no date printed on it.`
            : base === "uncertain"
              ? `${total} at Sainsbury's. The date's a guess from the folder, not off the paper.`
              : `${total} at Sainsbury's, ${date}.`
      }
    >
      {!mine && base !== "clean" && (
        <Btn variant="primary" onClick={() => set({ ...work, values: { ...values, Date: "12 Aug 2025" }, edited: ["Date"] })}>
          Say the date
        </Btn>
      )}
      {!mine && base === "clean" && (
        <Btn onClick={() => set({ ...work, open: "Shop" })}>Where's that from?</Btn>
      )}
      <Handoff to="Sent to your phone">
        The other three read back as a list, and a list is the one thing this surface can't
        hand somebody.
      </Handoff>
    </VoiceStage>
  );
}

StructuredOutputPreview.surfaces = { voice: StructuredVoice };

// ── On a canvas ─────────────────────────────────────────────────────────────
//
// Same `work`. What changes is where a field traces back to: not a line of a
// document but a region of the thing it was read off, so opening a value
// highlights the part of the receipt it came from.
//
// That turns the pattern's hardest claim into something you can check at a
// glance. On a page, "this field came from here" is a panel that opens beside
// the value and asks the reader to believe the link. Here the link is drawn —
// and the field the model *worked out* rather than read is the one with no
// region to point at, which is the failure this pattern exists to make visible.
function StructuredCanvas({ work, set }) {
  const { base, values, edited, open } = work;
  const scan = { ...FIXED, ...READ[base] };
  const valueOf = (k) => values[k] ?? scan[k].value;
  const openKey = open && !open.startsWith("edit:") ? open : null;

  return (
    <Board title="Receipt · 14 Aug">
      {/* The source, with the open field's region lit on it. */}
      <Obj label="The photo" meta={openKey ? `Showing ${openKey}` : "4 regions read"} wide>
        <span className="cv-regions">
          {FIELDS.map((k) => (
            <span
              key={k}
              className="cv-region"
              data-on={k === openKey ? "" : undefined}
              /* A worked-out value has no region to light, which is the whole
                 point: the field that isn't on the paper can't be pointed at. */
              data-none={!scan[k].sure ? "" : undefined}
            >
              {k}
            </span>
          ))}
        </span>
      </Obj>

      {FIELDS.map((k) => {
        const mine = edited.includes(k);
        const value = valueOf(k);
        const low = !scan[k].sure && !mine && !!value;
        return (
          <Obj
            key={k}
            label={k}
            meta={mine ? "You set this" : low ? "Worked out, not read" : !value ? "Not found" : undefined}
            tone={mine ? "next" : undefined}
            selected={k === openKey}
          >
            <span className="cv-layer" data-provisional={low ? "" : undefined}>
              {value || "Not found"}
            </span>
            <OnObject>
              <Btn onClick={() => set({ ...work, open: openKey === k ? null : k })}>
                {openKey === k ? "Hide" : "Show on the photo"}
              </Btn>
              {!mine && (
                <Btn
                  variant={low ? "primary" : "secondary"}
                  onClick={() => set({ ...work, values: { ...values, [k]: value || "14 Aug 2025" }, edited: [...edited, k] })}
                >
                  Set it
                </Btn>
              )}
            </OnObject>
          </Obj>
        );
      })}
    </Board>
  );
}

StructuredOutputPreview.surfaces.canvas = StructuredCanvas;
