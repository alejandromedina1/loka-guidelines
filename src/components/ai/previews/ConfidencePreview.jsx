import { Body, Btn, Btns, Chip, Frame, FrameBar, GhostLines, Label, Note, Say } from "./kit.jsx";
import { VoiceStage } from "./voice.jsx";
import { Board, Obj, OnObject } from "./canvas.jsx";

// Confidence Levels on a duplicate-charge check — something somebody acts on
// with their bank, where the temptation is to print a percentage to two decimal
// places and call that rigour.

// The three bands a check can land in. Drawn rather than named in prose,
// because how many of them are lit is the entire read: one band is an
// estimate, three is an estimate that couldn't separate them. What used to sit
// here was a single continuous fill — the false precision this pattern exists
// to argue against, drawn by the pattern arguing against it.
const BANDS = ["Low", "Medium", "High"];

// from/to are inclusive indices into BANDS, so every check is a span and a
// confident one is just a span of one. This is also what finally separates
// "Above the bar" from "Shown as a range": the second is wider, visibly.
const SPAN = {
  high: { from: 2, to: 2, value: "Likely a duplicate", note: "Highest of three bands" },
  banded: { from: 1, to: 2, value: "Possibly a duplicate", note: "Spans two bands" },
  low: { from: 0, to: 2, value: "Can't tell", note: "Spans all three bands" },
};

export function ConfidencePreview({ state }) {
  const low = state === "low";
  const span = SPAN[state];

  return (
    <Frame width={540}>
      <FrameBar title="Sainsbury's · £48.20" />
      <Body>
        <span className="mk-scope-head">
          <Label>Charged twice?</Label>
          {state !== "unavailable" && <Chip>{low ? "Low confidence" : "Based on 6 checks"}</Chip>}
        </span>

        {state === "unavailable" ? (
          <Note tone="plain" title="Not enough history to check this">
            Three weeks of payments, and none of them from this shop.
          </Note>
        ) : (
          <div className="mk-band" data-tone={low ? "low" : "high"}>
            <span className="mk-band-value">{span.value}</span>
            <span className="mk-bands">
              {BANDS.map((b, i) => (
                <span
                  key={b}
                  className="mk-bands-seg"
                  data-on={(i >= span.from && i <= span.to) || undefined}
                >
                  <span className="mk-bands-tick" aria-hidden />
                  <span className="mk-bands-name">{b}</span>
                </span>
              ))}
            </span>
            <span className="mk-band-note">{span.note}</span>
          </div>
        )}

        {(state === "high" || state === "banded") && (
          <GhostLines widths={[100, 92, 58]} tone="mute" />
        )}

        {low && (
          <Note tone="warn" title="Check before reporting">
            Open both payments before reporting this to your bank.
          </Note>
        )}

        <span className="mk-foot">
          <Say tone="mute" size="sm">
            {state === "unavailable" ? "Checks return at 3 months" : "Last checked 14:02"}
          </Say>
          <Btns align="end">
            <Btn>Show both payments</Btn>
            <Btn variant="primary" disabled={low || state === "unavailable"}>
              Report to your bank
            </Btn>
          </Btns>
        </span>
      </Body>
    </Frame>
  );
}

// ── Spoken ──────────────────────────────────────────────────────────────────
//
// The one pattern where the voice answer is *only* copy, and that makes it the
// clearest demonstration of what this surface does to a design. On a screen the
// bands carry the hedge and the words can stay short; out loud there are no
// bands, so the words carry all of it and the choice between "likely",
// "possibly" and "can't tell" is the entire pattern.
//
// Never a number. A percentage read aloud sounds more exact than a printed one:
// nobody says "eighty-four per cent" tentatively, so a spoken score is a claim
// of precision the model has not earned. The screen version already argues this
// against a continuous fill — this is the same argument with nothing to fall
// back on.
const SPOKEN_HEDGE = {
  high: "Looks like a duplicate — same shop, same amount, same day.",
  banded: "Might be a duplicate. Worth opening both before you report it.",
  low: "Can't tell from what's here.",
  unavailable: "Not enough history on this shop to check.",
};

function ConfidenceVoice({ state }) {
  const sure = state === "high";
  return (
    <VoiceStage
      device="Watch"
      mood={state === "unavailable" ? "rest" : "speaking"}
      heard="Was I charged twice?"
      caption={SPOKEN_HEDGE[state] ?? SPOKEN_HEDGE.low}
    >
      {/* The action follows the hedge, which is the point: a confident answer
          can offer the irreversible thing and an unsure one cannot. */}
      {sure && <Btn variant="primary">Report it</Btn>}
      {(state === "banded" || state === "low") && <Btn>Show me both</Btn>}
    </VoiceStage>
  );
}

ConfidencePreview.surfaces = { voice: ConfidenceVoice };

// ── On a canvas ─────────────────────────────────────────────────────────────
//
// Per object rather than per answer, and drawn on the object itself. That is the
// change, and it is a bigger one than it sounds: on a page there is one result
// and one score, so the hedge is a band under a sentence. On a board there are
// several things placed at once and they were not all worked out equally well,
// so a single score for the lot would be the average nobody can act on.
//
// An unsure object reads as provisional rather than placed — which is the
// closest this system gets to saying "check me" without printing a number.
function ConfidenceCanvas({ state }) {
  const span = SPAN[state];
  const sure = state === "high";
  const none = state === "unavailable";

  return (
    <Board title="Board · duplicate check">
      <Obj
        label="Sainsbury's · £48.20"
        meta={none ? "Not checked" : span.note}
        tone={sure ? "next" : undefined}
        selected={!sure && !none}
      >
        {/* Provisional, not placed. The dashes are the same "this is a slot,
            not a fixture" reading the optional part chips use. */}
        <span className="cv-layer" data-provisional={!sure && !none ? "" : undefined}>
          {none ? "Nothing to compare it against" : span.value}
        </span>
        <OnObject>
          <Btn>Open both</Btn>
          {sure && <Btn variant="primary">Report it</Btn>}
        </OnObject>
      </Obj>

      <Obj label="Pret · £4.60" meta="Read off the receipt" tone="next">
        <span className="cv-layer" data-tone="next">Not a duplicate</span>
      </Obj>
    </Board>
  );
}

ConfidencePreview.surfaces.canvas = ConfidenceCanvas;
