import { Body, Btn, Btns, Chip, Frame, FrameBar, Label, Note, Part, Say } from "./kit.jsx";
import { Handoff, VoiceStage } from "./voice.jsx";
import { Board, Obj, OnObject } from "./canvas.jsx";

// Action Log after a run that paid four bills. A record, not a trace: Visible
// Working draws what is happening while somebody waits, and this draws what
// happened once nobody is watching any more. The difference shows in the
// drawing — a trace is a route with a live end, and a record is a table with
// times and, crucially, a mark on the entries that CHANGED something.
//
// That mark is the whole design. Most of a log is reads, and anybody who opens
// one is looking for the two or three writes.
const ENTRIES = [
  { t: "14:31", what: "Read your current account balance", wrote: false, io: "Balance £1,240 · 4 bills due" },
  { t: "14:31", what: "Read 4 unpaid bills", wrote: false, io: "Energy, water, phone, council tax" },
  { t: "14:32", what: "Paid Energy · £310", wrote: true, io: "Reference 3041-A · confirmed" },
  { t: "14:32", what: "Paid Water · £96", wrote: true, io: "Reference 3041-B · confirmed" },
  { t: "14:33", what: "Filed all four to March", wrote: true, io: "4 payments · category Bills" },
];

export function ActionLogPreview({ work, set }) {
  const { open, only, detail, gap } = work;
  const shown = only === "wrote" ? ENTRIES.filter((e) => e.wrote) : ENTRIES;
  const wrote = ENTRIES.filter((e) => e.wrote).length;

  if (!open) {
    // Folded, with a count. Open by default it is noise on every successful
    // run; absent it is the first thing anybody asks for when something looks
    // wrong. The count is what makes the folded version honest.
    return (
      <Frame width={540}>
        <FrameBar title="Pay 4 bills · done" />
        <Body>
          <Part name="Accordion" block>
            <span className="mk-log-shut">
              <span className="mk-log-what">{`${ENTRIES.length} actions · ${wrote} changed something`}</span>
              <Btn onClick={() => set({ ...work, open: true })}>Show what it did</Btn>
            </span>
          </Part>
        </Body>
      </Frame>
    );
  }

  return (
    <Frame width={570}>
      <FrameBar title="Pay 4 bills · done" />
      <Body>
        <span className="mk-scope-head">
          <Label>{only === "wrote" ? "Only what changed something" : "Everything it did"}</Label>
          <Part name="Tags">
            <Chip>{`${shown.length} of ${ENTRIES.length}`}</Chip>
          </Part>
        </span>

        {/* The opened log is the Accordion's body; the List Item marker sits
            inside the first <li> so the list keeps its ul > li shape. */}
        <Part name="Accordion" block>
          <ul className="mk-log">
            {shown.map((e, i) => (
              <li key={e.what} className="mk-log-row" data-wrote={e.wrote ? "" : undefined}>
                <Part name={i === 0 ? "List Item" : null} block>
                  <button
                    type="button"
                    className="mk-log-line"
                    onClick={() => set({ ...work, detail: detail === i ? null : i })}
                  >
                    <span className="mk-log-t">{e.t}</span>
                    <span className="mk-log-what">{e.what}</span>
                    {/* The word, not just the rule down the side — reads and writes
                        are the one distinction this record exists to carry. */}
                    <span className="mk-log-kind">{e.wrote ? "Changed" : "Read"}</span>
                  </button>
                  {detail === i && (
                    <span className="mk-log-io">
                      <span className="mk-log-t">In &amp; out</span>
                      <span className="mk-log-what">{e.io}</span>
                    </span>
                  )}
                </Part>
              </li>
            ))}

            {/* A gap stated as a gap. A log that quietly skips what it could not
                capture reads as complete, and somebody concludes an action never
                happened because it is not in the list. */}
            {gap && (
              <li className="mk-log-row" data-gap="">
                <span className="mk-log-line">
                  <span className="mk-log-t">14:33</span>
                  <span className="mk-log-what">Not recorded — the bank timed out</span>
                  <span className="mk-log-kind">Missing</span>
                </span>
              </li>
            )}
          </ul>
        </Part>

        {gap && (
          <Note tone="warn" kind="Incomplete" title="Gap between 14:32 and 14:34">
            Check the bank statement.
          </Note>
        )}

        <span className="mk-foot">
          <Say tone="mute" size="sm">Kept for 7 years</Say>
          <Part name="Button">
            <Btns align="end">
              <Btn onClick={() => set({ ...work, only: only === "wrote" ? null : "wrote", detail: null })}>
                {only === "wrote" ? "Show the reads too" : "Hide the reads"}
              </Btn>
            </Btns>
          </Part>
        </span>
      </Body>
    </Frame>
  );
}

ActionLogPreview.work = {
  for: (id) =>
    ({
      folded: { open: false, only: null, detail: null, gap: false },
      open: { open: true, only: null, detail: null, gap: false },
      wrote: { open: true, only: "wrote", detail: null, gap: false },
      detail: { open: true, only: null, detail: 2, gap: false },
      gap: { open: true, only: null, detail: null, gap: true },
    })[id] ?? { open: false, only: null, detail: null, gap: false },

  state: (w) =>
    !w.open ? "folded" : w.gap ? "gap" : w.detail !== null ? "detail" : w.only === "wrote" ? "wrote" : "open",

  // No tick. The run is over — a record that keeps growing while somebody reads
  // it is a trace, and this pattern exists to be the other thing.
};

// ── Spoken ──────────────────────────────────────────────────────────────────
//
// Same `work`, and a `none`: a record is something you scan, and scanning is
// the one thing this surface cannot do. Nine entries read aloud is a recital.
//
// What survives is the half that was always a sentence — the count, and the
// last thing that changed something. That is also the line that makes somebody
// ask for the rest, which is why the handoff works rather than just failing.
function LogVoice({ work, set }) {
  const { open, only, gap } = work;
  const wrote = ENTRIES.filter((e) => e.wrote);

  if (gap)
    return (
      <VoiceStage
        device="Watch"
        mood="stopped"
        caption="One action didn't get recorded — the bank timed out. Worth checking the statement."
      />
    );

  if (only === "wrote")
    return (
      <VoiceStage device="Watch" mood="speaking" heard="What did it actually change?">
        <Btn variant="primary">Open the record</Btn>
      </VoiceStage>
    );

  if (open)
    return (
      <VoiceStage device="Watch" mood="speaking" heard="What did it do?">
        <Handoff to="the phone">
          Five entries with times and what each one touched is a record to scan, and scanning is the
          thing this surface cannot do.
        </Handoff>
      </VoiceStage>
    );

  return (
    <VoiceStage
      device="Watch"
      mood="rest"
      caption={`Five actions, ${wrote.length} of them changed something. The last one filed all four to March.`}
    >
      <Btn variant="primary" onClick={() => set({ ...work, open: true })}>What did it change?</Btn>
    </VoiceStage>
  );
}

ActionLogPreview.surfaces = { voice: LogVoice };

// ── On a canvas ─────────────────────────────────────────────────────────────
//
// Same `work`. Each entry points at the object it touched, so a record is read
// by looking at what moved rather than by matching names down a list — and the
// gap becomes the one thing this surface makes obvious, because an action with
// no object to point at has nowhere to sit.
function LogCanvas({ work, set }) {
  const { open, only, gap } = work;

  return (
    <Board title="Board · Pay 4 bills">
      <Obj label="Current account" meta={only === "wrote" ? "Not changed" : "Read at 14:31"}
        tone={only === "wrote" ? undefined : "next"}>
        <span className="cv-layer" data-provisional={only === "wrote" ? "" : undefined}>
          {only === "wrote" ? "Hidden — nothing changed here" : "Balance £1,240"}
        </span>
      </Obj>

      <Obj label="Energy · £310" meta="Changed at 14:32" tone="next">
        <span className="cv-layer" data-tone="next">Paid · reference 3041-A</span>
        {open && (
          <OnObject>
            <Btns align="end">
              <Btn onClick={() => set({ ...work, only: only === "wrote" ? null : "wrote" })}>
                {only === "wrote" ? "Show what it read" : "Only what changed"}
              </Btn>
            </Btns>
          </OnObject>
        )}
      </Obj>

      <Obj label="Water · £96" meta="Changed at 14:32" tone="next">
        <span className="cv-layer" data-tone="next">Paid · reference 3041-B</span>
      </Obj>

      {gap && (
        <Obj label="One action" meta="Nothing to point at">
          <span className="cv-layer" data-provisional>Didn&apos;t record — the bank timed out</span>
        </Obj>
      )}

      <span className="cv-foot">
        <Say tone="mute" size="sm">
          {gap ? "Nowhere for this one to sit" : "Marks sit on what was touched"}
        </Say>
      </span>
    </Board>
  );
}

ActionLogPreview.surfaces.canvas = LogCanvas;
