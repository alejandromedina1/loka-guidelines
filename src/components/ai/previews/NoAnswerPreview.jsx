import { Body, Btn, Btns, Chip, Frame, FrameBar, Label, Note, Row, Say } from "./kit.jsx";
import { VoiceStage } from "./voice.jsx";
import { Board, Nothing, Obj, OnObject } from "./canvas.jsx";

// No Good Match on finding a payment from a description. A ranked list is where
// this failure does the most damage, because somebody will act on whatever sits
// at the top whether or not it deserves to be there — and here that means
// querying the wrong charge with their bank.
//
// The near misses open and close, which is the pattern's one real gesture:
// below the bar is a place you go deliberately, and it has to be as easy to
// leave as to enter or it is just the ranked list with a longer preamble.
const BAR = 70;
const STRONG = [
  { name: "Sainsbury's Local · 14 Aug", score: 91 },
  { name: "Homebase · 12 Aug", score: 84 },
];
const WEAK = [
  { name: "Boots · 9 Aug", score: 31 },
  { name: "Co-op · 2 Aug", score: 24 },
  { name: "Shell · 28 Jul", score: 12 },
];

function Candidate({ c, weak }) {
  return (
    <Row lead={!weak} tone={weak ? "mute" : undefined}>
      <span className="mk-cand">
        <span className="mk-cand-name" data-weak={weak || undefined}>
          {c.name}
        </span>
        <span className="mk-score" data-weak={weak || undefined}>
          {c.score}% match
        </span>
      </span>
    </Row>
  );
}

export function NoAnswerPreview({ work, set }) {
  const { base, weak } = work;

  return (
    <Frame width={540}>
      <FrameBar title="Find a payment · about £48, garden centre" />
      <Body>
        {base === "confident" && (
          <>
            <span className="mk-scope-head">
              <Label>Matches above {BAR}%</Label>
              <Chip>1,204 searched</Chip>
            </span>
            <div className="mk-list">
              {STRONG.map((c) => (
                <Candidate key={c.name} c={c} />
              ))}
            </div>
          </>
        )}

        {base === "insufficient" && (
          <>
            <Note
              tone="warn"
              title="Not enough loaded to search yet"
              actions={
                <Btns align="end">
                  <Btn>Bring in older payments</Btn>
                  <Btn variant="primary">Search by hand</Btn>
                </Btns>
              }
            >
              Only 3 weeks of payments are here. Anything older hasn't been brought in.
            </Note>
          </>
        )}

        {base === "none" && !weak && (
          <>
            <Note tone="plain" title={`No payment cleared ${BAR}%`}>
              Searched 1,204 payments. The closest was {WEAK[0].score}%.
            </Note>
            <span className="mk-foot">
              <Say tone="mute" size="sm">
                1,204 searched · 0 above the bar
              </Say>
              <Btns align="end">
                {/* Below the bar is somewhere you go on purpose. Nothing here is
                    promoted into the ranked list — the list stays empty and
                    this opens a second one that says what it is. */}
                <Btn onClick={() => set({ ...work, weak: true })}>Show near misses</Btn>
                <Btn variant="primary">Search more widely</Btn>
              </Btns>
            </span>
          </>
        )}

        {base === "none" && weak && (
          <>
            <span className="mk-scope-head">
              <Label>Below the {BAR}% bar</Label>
              <Chip>Opened deliberately</Chip>
            </span>
            <div className="mk-list">
              {WEAK.map((c) => (
                <Candidate key={c.name} c={c} weak />
              ))}
            </div>
            <span className="mk-foot">
              <Say tone="mute" size="sm">
                None of these is an answer
              </Say>
              <Btns align="end">
                <Btn onClick={() => set({ ...work, weak: false })}>Hide near misses</Btn>
                <Btn variant="primary">Search more widely</Btn>
              </Btns>
            </span>
          </>
        )}
      </Body>
    </Frame>
  );
}

NoAnswerPreview.work = {
  for: (id) =>
    ({
      confident: { base: "confident", weak: false },
      none: { base: "none", weak: false },
      insufficient: { base: "insufficient", weak: false },
      weak: { base: "none", weak: true },
    })[id] ?? { base: "confident", weak: false },

  state: (w) => (w.base === "none" && w.weak ? "weak" : w.base),
};

// ── Spoken ──────────────────────────────────────────────────────────────────
//
// Same `work`: what came back, and whether the weak ones were asked for.
//
// This surface removes the failure the pattern is named for. On a screen the
// damage is done by rank — somebody acts on whatever sits at the top whether or
// not it deserves to be there — and out loud there is no top, because there is
// no list. What replaces it is a subtler version of the same mistake: saying one
// result *sounds* like an answer whether or not it cleared the bar, so the bar
// has to be in the sentence.
//
// One nearest thing, never three. Three read out is a list, and a list is what
// this surface cannot hand anybody.
function NoAnswerVoice({ work, set }) {
  const { base, weak } = work;

  if (base === "confident") {
    return (
      <VoiceStage
        device="Car"
        mood="speaking"
        heard="Find the garden centre one, about £48"
        caption={`${STRONG[0].name}, £48.20.`}
      >
        <Btn>Not that one</Btn>
      </VoiceStage>
    );
  }

  if (base === "insufficient") {
    return (
      <VoiceStage
        device="Car"
        mood="rest"
        heard="Find the garden centre one, about £48"
        caption="Only three weeks of payments have been brought in, so there isn't enough to search yet."
      >
        <Btn variant="primary">Bring in the older ones</Btn>
      </VoiceStage>
    );
  }

  if (weak) {
    return (
      <VoiceStage
        device="Car"
        mood="speaking"
        heard="What was closest?"
        /* One, and said as what it is. Three would be a list, and a list on this
           surface is the ranked list the pattern is trying not to be. */
        caption={`${WEAK[0].name}, ${WEAK[0].score}%. That's well under the bar, so it's probably not it.`}
      >
        <Btn onClick={() => set({ ...work, weak: false })}>Search wider instead</Btn>
      </VoiceStage>
    );
  }

  return (
    <VoiceStage
      device="Car"
      mood="speaking"
      heard="Find the garden centre one, about £48"
      caption={`Nothing close enough. Searched 1,204 payments and the best was ${WEAK[0].score}%.`}
    >
      <Btn onClick={() => set({ ...work, weak: true })}>What was closest?</Btn>
      <Btn variant="primary">Search wider</Btn>
    </VoiceStage>
  );
}

NoAnswerPreview.surfaces = { voice: NoAnswerVoice };

// ── On a canvas ─────────────────────────────────────────────────────────────
//
// Same `work`. Nothing to place, so the space stays empty and says why — and
// that emptiness does the pattern's job better than any list can.
//
// The failure being guarded against is that somebody acts on whatever sits at
// the top of a ranked list. On a board there is no top, and the weak results
// cannot be smuggled in as small ones: an object is either placed or it is not.
// So "below the bar" is a second board somebody opens on purpose, and the first
// one stays genuinely, visibly empty rather than filling with things that don't
// qualify.
function NoAnswerCanvas({ work, set }) {
  const { base, weak } = work;

  if (base === "confident") {
    return (
      <Board title="Board · about £48, garden centre">
        {STRONG.map((c) => (
          <Obj key={c.name} label={c.name} meta={`${c.score}% match`} tone="next">
            <span className="cv-layer" data-tone="next">Over the {BAR}% bar</span>
          </Obj>
        ))}
      </Board>
    );
  }

  if (base === "insufficient") {
    return (
      <Board title="Board · about £48, garden centre">
        <Nothing>
          Only three weeks of payments have been brought in. There isn&apos;t enough here to
          search yet.
        </Nothing>
      </Board>
    );
  }

  if (weak) {
    return (
      <Board title={`Board · below the ${BAR}% bar`}>
        {WEAK.map((c) => (
          <Obj key={c.name} label={c.name} meta={`${c.score}% match`}>
            {/* Provisional, never placed. Drawing them as ordinary objects is
                the promotion-by-rank this pattern exists to prevent, moved to a
                surface where placing a thing means more. */}
            <span className="cv-layer" data-provisional>
              Under the bar
            </span>
          </Obj>
        ))}
        <span className="cv-foot">
          <Say tone="mute" size="sm">Opened on purpose — none of these is an answer</Say>
          <Btns align="end">
            <Btn onClick={() => set({ ...work, weak: false })}>Close them</Btn>
          </Btns>
        </span>
      </Board>
    );
  }

  return (
    <Board title="Board · about £48, garden centre">
      {/* The empty board is the answer. Filling it with near misses would be
          the ranked list with extra steps. */}
      <Nothing>
        Nothing cleared {BAR}%. Searched 1,204 payments; the closest was {WEAK[0].score}%.
      </Nothing>
      <span className="cv-foot">
        <Say tone="mute" size="sm">Nothing placed</Say>
        <Btns align="end">
          <Btn onClick={() => set({ ...work, weak: true })}>Open the near misses</Btn>
          <Btn variant="primary">Search wider</Btn>
        </Btns>
      </span>
    </Board>
  );
}

NoAnswerPreview.surfaces.canvas = NoAnswerCanvas;
