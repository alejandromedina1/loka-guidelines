import { Body, Btn, Chip, Cite, Frame, FrameBar, GhostLines, Label, Note, Row, Say } from "./kit.jsx";
import { Handoff, VoiceStage } from "./voice.jsx";
import { Board, Nothing, Obj, OnObject } from "./canvas.jsx";

// Sourced Answer, on a question about your own money. The Partly sourced state
// is the one worth staring at: it's the only preview here where two sentences
// that look equally authoritative aren't — and the unsourced one is the kind of
// plausible general claim a reader has no reason to doubt.
//
// The markers open and close. That is the pattern: a citation nobody can open
// is a citation nobody can check, and the second one opening onto "you don't
// have access to this account" is the case that makes the first one mean
// something — the marker is a promise that the claim traces back, not a promise
// that the reader may see it.
const SOURCES = {
  1: {
    head: "Eating out · March",
    count: "8 payments",
    line: "Deliveroo · 28 Mar · £34.10",
  },
  2: { locked: "Sam's credit card · March" },
};

export function GroundedAnswerPreview({ work, set }) {
  const { base, open } = work;
  const toggle = (n) => set({ ...work, open: open === n ? null : n });

  return (
    <Frame width={550}>
      <FrameBar title="Why is March higher?" />
      <Body>
        {base === "none" ? (
          <Note tone="plain" title="Nothing found">
            Searched 1,204 payments in <strong>March</strong> and found nothing from Vodafone.
          </Note>
        ) : (
          <p className="mk-answer">
            <span className="mk-grounded">
              Food went up £96, mostly takeaways
              <Cite n={1} open={open === 1} onClick={() => toggle(1)} />
            </span>{" "}
            {base === "mixed" ? (
              /* The shortcut drops the distinction entirely. Same two sentences,
                 same weight — and the second one now reads as sourced. It also
                 carries no marker, which is the honest version of not having
                 one: nothing to open, because there is nothing behind it. */
              <span className="mk-ungrounded">
                and most households saw energy costs rise by about a third this winter.
              </span>
            ) : (
              <span className="mk-grounded">
                and your energy bill rose £34
                <Cite n={2} open={open === 2} onClick={() => toggle(2)} />
              </span>
            )}
          </p>
        )}

        {base === "mixed" && (
          <Note tone="warn" title="Not from your payments">
            Nothing in your accounts covers other households. The second sentence is general
            knowledge.
          </Note>
        )}

        {open === 1 && (
          <div className="mk-source">
            <span className="mk-source-head">
              <Label>{SOURCES[1].head}</Label>
              <Chip>{SOURCES[1].count}</Chip>
            </span>
            <GhostLines widths={[100, 72]} tone="mute" />
            <Say size="sm">{SOURCES[1].line}</Say>
            <GhostLines widths={[96, 44]} tone="mute" />
          </div>
        )}

        {open === 2 && (
          <div className="mk-source">
            <Row lead tone="mute">
              <Label>{SOURCES[2].locked}</Label>
            </Row>
            <Note tone="plain" title="You don't have access to this account">
              Ask Sam to share it.
            </Note>
          </div>
        )}

        {base !== "none" && open === null && (
          <span className="mk-chips">
            <Chip>2 sources</Chip>
            <Chip>1,204 payments read</Chip>
          </span>
        )}
      </Body>
    </Frame>
  );
}

GroundedAnswerPreview.work = {
  for: (id) =>
    ({
      cited: { base: "cited", open: null },
      mixed: { base: "mixed", open: null },
      none: { base: "none", open: null },
      source: { base: "cited", open: 1 },
      locked: { base: "cited", open: 2 },
    })[id] ?? { base: "cited", open: null },

  state: (w) => (w.open === 1 ? "source" : w.open === 2 ? "locked" : w.base),
};

// ── No voice form, drawn as the thing that happens instead ──────────────────
//
// This pattern's verdict for voice is "No form here", and the honest drawing of
// that is not an empty stage. A superscript has no spoken equivalent, and
// reading a source after every claim destroys the answer it is attached to — so
// the pattern genuinely does not exist here. But the *need* does: the answer is
// said without markers, the offer to show where it came from is something the
// device says, and the sources arrive on a screen. That handoff is a real
// decision with a real answer, and it is what somebody building for voice needs.
//
// What makes it read as an absence rather than a voice version of the pattern:
// nothing on this stage is openable, there are no markers to open, and the last
// thing that happens is leaving.
function GroundedVoice({ work, set }) {
  const { base, open } = work;

  if (base === "none") {
    return (
      <VoiceStage
        device="Kitchen speaker"
        mood="rest"
        heard="Why is March higher?"
        caption="Nothing from Vodafone in March. Searched all 1,204 payments."
      />
    );
  }

  if (open !== null) {
    return (
      <VoiceStage
        device="Kitchen speaker"
        mood="rest"
        heard="Where's that from?"
        caption={
          open === 2
            ? "That one's on Sam's card, and you don't have access to it."
            : "Eight payments, eating out, March. Sent to your phone."
        }
      >
        {open === 1 && (
          <Handoff to="Sent to your phone">
            The list itself needs a screen — eight payments read aloud is eight payments nobody
            can hold.
          </Handoff>
        )}
        <Btn onClick={() => set({ ...work, open: null })}>Back</Btn>
      </VoiceStage>
    );
  }

  return (
    <VoiceStage
      device="Kitchen speaker"
      mood="speaking"
      heard="Why is March higher?"
      caption={
        base === "mixed"
          ? "Food went up £96, mostly takeaways. The energy figure is yours; the rest is a general estimate."
          : "Food went up £96, mostly takeaways, and your energy bill rose £34."
      }
    >
      {/* No markers to open, so the trace has to be asked for. That is the
          difference this surface makes, and it costs a whole turn. */}
      <Btn onClick={() => set({ ...work, open: 1 })}>Where&apos;s that from?</Btn>
    </VoiceStage>
  );
}

GroundedAnswerPreview.surfaces = { voice: GroundedVoice };

// ── On a canvas ─────────────────────────────────────────────────────────────
//
// Same `work`: which base came back, which marker is open. What changes is what
// a marker is attached to. A superscript attaches to a clause; here it attaches
// to the region that was made from the source, so checking it means looking at
// the thing rather than re-reading the sentence.
//
// That makes the partly-sourced case visible in a way the screen version has to
// work for. On a page, two sentences of equal weight are the problem and a tint
// is the fix. Here the unsourced object simply has no marker on it, and an
// object with nothing attached is conspicuous in a way a sentence never is.
function GroundedCanvas({ work, set }) {
  const { base, open } = work;

  if (base === "none") {
    return (
      <Board title="Board · why is March higher?">
        <Nothing>Nothing in March came from Vodafone, so there is nothing to place.</Nothing>
      </Board>
    );
  }

  return (
    <Board title="Board · why is March higher?">
      <Obj label="Food" meta="From 8 payments" tone="next" selected={open === 1}>
        <span className="cv-layer" data-tone="next">Up £96 — mostly takeaways</span>
        <OnObject>
          <Btn onClick={() => set({ ...work, open: open === 1 ? null : 1 })}>
            {open === 1 ? "Hide source" : "Source"}
          </Btn>
        </OnObject>
      </Obj>

      {base === "mixed" ? (
        /* No marker, because there is nothing behind it. An object with nothing
           attached is conspicuous on a board in a way a sentence on a page is
           not — which is this surface doing the pattern's work for it. */
        <Obj label="Energy" meta="Nothing attached">
          <span className="cv-layer">Up about a third — general estimate</span>
        </Obj>
      ) : (
        <Obj label="Energy" meta="From 1 account" selected={open === 2}>
          <span className="cv-layer" data-tone="next">Up £34</span>
          <OnObject>
            <Btn onClick={() => set({ ...work, open: open === 2 ? null : 2 })}>
              {open === 2 ? "Hide source" : "Source"}
            </Btn>
          </OnObject>
        </Obj>
      )}

      {open === 1 && (
        <Obj label="Eating out · March" meta="8 payments" wide>
          <span className="cv-layer">Deliveroo · 28 Mar · £34.10</span>
        </Obj>
      )}
      {open === 2 && (
        <Obj label="Sam's credit card" meta="No access" wide>
          <span className="cv-layer">Ask Sam to share it.</span>
        </Obj>
      )}
    </Board>
  );
}

GroundedAnswerPreview.surfaces.canvas = GroundedCanvas;
