import { Body, Btn, Btns, Frame, FrameBar, Label, Note, Part, Say } from "./kit.jsx";
import { VoiceStage } from "./voice.jsx";
import { Board, Obj, OnObject } from "./canvas.jsx";

// After a Mistake: a VAT figure that was wrong, found nine days after somebody
// filed on the strength of it.
//
// The subject of the drawing is the REACH — everything downstream of the wrong
// answer, and whether each of those things can be put back. Almost every
// product can say an answer was wrong and nothing at all about what was done
// with it, which leaves the expensive half of the job to the person who has
// less information than we do.
//
// So the wireframe is a list of consequences with a verdict on each, and the
// reversible and irreversible are separated BEFORE anything is pressed. One
// button covering both produces a half-completed rollback that nobody can
// audit afterwards.
const WRONG = { was: "£4,210", is: "£3,880", what: "VAT owed for Q1" };
const REACH = [
  { what: "Marked 14 payments as VAT-bearing", back: true, how: "Unmarks cleanly" },
  { what: "Set the Q1 accrual to £4,210", back: true, how: "Resets to £3,880" },
  { what: "Filed the Q1 return", back: false, how: "HMRC has it" },
  { what: "Emailed the summary to Priya", back: false, how: "She read it on the 4th", seen: true },
];

export function AfterMistakePreview({ work, set }) {
  const { traced, undone, told, hard } = work;
  const back = REACH.filter((r) => r.back);
  const cant = REACH.filter((r) => !r.back);

  return (
    <Frame width={570}>
      <FrameBar title="Q1 VAT · corrected" />
      <Body>
        {/* Facts first. Somebody arriving here is working out whether they are
            exposed, and a paragraph of regret sits between them and knowing. */}
        {/* Anatomy: the correction notice across the top is the Banner. */}
        <Part name="Banner" block>
          <div className="mk-wrong">
            <span className="mk-wrong-head">
              <Label>{WRONG.what}</Label>
              <span className="mk-wrong-when">Wrong for 9 days</span>
            </span>
            <span className="mk-wrong-pair">
              <span className="mk-wrong-old">{WRONG.was}</span>
              <span className="mk-wrong-new">{WRONG.is}</span>
              <span className="vh">{` — was ${WRONG.was}, is ${WRONG.is}`}</span>
            </span>
          </div>
        </Part>

        {!traced ? (
          <span className="mk-foot">
            <Say tone="mute" size="sm">The figure is corrected. Nine days of consequences are not.</Say>
            <Part name="Button">
              <Btns align="end">
                <Btn variant="primary" onClick={() => set({ ...work, traced: true })}>
                  What followed from it?
                </Btn>
              </Btns>
            </Part>
          </span>
        ) : (
          <>
            <Label>
              {hard
                ? `${back.length} put back · ${cant.length} left`
                : `${REACH.length} things followed from it`}
            </Label>
            {/* The list as the part, rather than its first row: a marker
                inside a <ul> has to be an <li>, and the row is one. */}
            <Part name="List Item" block>
            <ul className="mk-reach">
              {(hard ? back : REACH).map((r) => (
                <li
                  key={r.what}
                  className="mk-reach-row"
                  data-back={r.back ? "" : undefined}
                  data-done={(r.back && undone) || (r.seen && told) ? "" : undefined}
                >
                  <span className="mk-reach-what">{r.what}</span>
                  <span className="mk-reach-how">{r.how}</span>
                  {/* The verdict as a word. Reversible and irreversible is the
                      one distinction everything here turns on, and a tint would
                      be it resting on paint. */}
                  <span className="mk-reach-kind">
                    {r.back ? (undone ? "Put back" : "Can undo") : r.seen && told ? "Told" : "Can't undo"}
                  </span>
                </li>
              ))}
            </ul>
            </Part>

            {hard && (
              <>
                <Label>What has to happen outside this product</Label>
                <ul className="mk-reach">
                  {cant.map((r) => (
                    <li key={r.what} className="mk-reach-row">
                      <span className="mk-reach-what">{r.what}</span>
                      <span className="mk-reach-how">
                        {r.seen ? "Send the correction to where she read it" : "File an amendment by the 30th"}
                      </span>
                      <span className="mk-reach-kind">Not us</span>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {!hard && undone && cant.length > 0 && (
              <Part name="Alert" block>
                <Note
                  tone="warn"
                  kind="Outside the product"
                  title="Two can't be put back from here"
                  actions={
                    !told && (
                      <Part name="Button">
                        <Btns align="end">
                          <Btn variant="primary" onClick={() => set({ ...work, told: true })}>
                            Correct it where Priya read it
                          </Btn>
                        </Btns>
                      </Part>
                    )
                  }
                >
                  {/* Say what would have to happen instead. A product implying it
                      can fix what it can't is the third mistake on top of two. */}
                  Amendment due by the 30th.
                </Note>
              </Part>
            )}

            <span className="mk-foot">
              {undone ? (
                <Say tone="mute" size="sm">{`${back.length} put back · ${cant.length} can't be`}</Say>
              ) : (
                <span />
              )}
              {/* Empty once everything that can be put back has been. */}
              <Part name={undone ? null : "Button"}>
                <Btns align="end">
                  {!undone && (
                    <Btn variant="primary" onClick={() => set({ ...work, undone: true })}>
                      {`Put back the ${back.length} that can be`}
                    </Btn>
                  )}
                </Btns>
              </Part>
            </span>
          </>
        )}
      </Body>
    </Frame>
  );
}

AfterMistakePreview.work = {
  for: (id) =>
    ({
      found: { traced: false, undone: false, told: false },
      reach: { traced: true, undone: false, told: false },
      fixing: { traced: true, undone: true, told: false },
      told: { traced: true, undone: true, told: true },
      stuck: { traced: true, undone: true, told: false, hard: true },
    })[id] ?? { traced: false, undone: false, told: false, hard: false },

  state: (w) =>
    !w.traced ? "found" : w.told ? "told" : w.hard ? "stuck" : w.undone ? "fixing" : "reach",

  // No tick. Nothing here happens on its own: a product that started undoing
  // things by itself, after a mistake, would be making the fourth one.
};

// ── Spoken ──────────────────────────────────────────────────────────────────
//
// Same `work`. The hard part on this surface is that a correction has to
// re-open a subject that closed days ago — so it names the old answer in enough
// detail to be recognised BEFORE it says anything was wrong, which is the
// opposite order to a screen, where the heading does that work.
function MistakeVoice({ work, set }) {
  const { traced, undone, told, hard } = work;

  if (told)
    return (
      <VoiceStage device="Watch" mood="rest" caption="Priya's been sent the correction where she read it." />
    );

  if (hard)
    return (
      <VoiceStage
        device="Watch"
        mood="stopped"
        caption="Two of them can't be put back from here. The return needs an amendment by the 30th."
      />
    );

  if (undone)
    return (
      <VoiceStage
        device="Watch"
        mood="speaking"
        caption="Two put back. Two can't be — the filing, and the summary Priya read."
      >
        <Btn variant="primary" onClick={() => set({ ...work, told: true })}>Tell Priya</Btn>
      </VoiceStage>
    );

  if (traced)
    return (
      <VoiceStage
        device="Watch"
        mood="speaking"
        heard="What did that affect?"
        caption="Four things. Two can be put back from here, two can't."
      >
        <Btn variant="primary" onClick={() => set({ ...work, undone: true })}>Put back what you can</Btn>
      </VoiceStage>
    );

  return (
    <VoiceStage
      device="Watch"
      mood="speaking"
      caption="The Q1 VAT figure from the 2nd — £4,210 — was wrong. It's £3,880."
    >
      <Btn variant="primary" onClick={() => set({ ...work, traced: true })}>What did that affect?</Btn>
    </VoiceStage>
  );
}

AfterMistakePreview.surfaces = { voice: MistakeVoice };

// ── On a canvas ─────────────────────────────────────────────────────────────
//
// Same `work`, and this is the surface that does the pattern's hardest sentence
// best. "Here is everything that followed from a wrong answer" is a list you
// are asked to trust on a page; here it is the objects that came from it,
// sitting next to it — the reach of a mistake as a shape rather than a claim.
function MistakeCanvas({ work, set }) {
  const { traced, undone, told, hard } = work;

  return (
    <Board title="Board · Q1 VAT">
      <Obj label={WRONG.what} meta={`Was ${WRONG.was} · now ${WRONG.is}`} selected wide>
        <span className="cv-layer" data-provisional>Wrong for 9 days</span>
        {!traced && (
          <OnObject>
            <Btns align="end">
              <Btn variant="primary" onClick={() => set({ ...work, traced: true })}>
                Show what came from this
              </Btn>
            </Btns>
          </OnObject>
        )}
      </Obj>

      {traced &&
        REACH.map((r) => (
          <Obj
            key={r.what}
            label={r.what}
            meta={r.back ? (undone ? "Put back" : "Came from it") : "Outside the product"}
            tone={r.back && undone ? "next" : undefined}
          >
            {/* What can't be put back STAYS on the board, marked, rather than
                being quietly cleared away with everything that could. */}
            <span className="cv-layer" data-tone={r.back && undone ? "next" : undefined}
              data-provisional={!r.back ? "" : undefined}>
              {r.how}
            </span>
          </Obj>
        ))}

      {traced && (
        <span className="cv-foot">
          <Say tone="mute" size="sm">
            {undone ? "What stayed is what couldn't be reversed" : "Connected to the thing they came from"}
          </Say>
          {!undone && (
            <Btns align="end">
              <Btn variant="primary" onClick={() => set({ ...work, undone: true })}>
                Put back what can be
              </Btn>
            </Btns>
          )}
          {undone && !told && !hard && (
            <Btns align="end">
              <Btn variant="primary" onClick={() => set({ ...work, told: true })}>Tell Priya</Btn>
            </Btns>
          )}
        </span>
      )}
    </Board>
  );
}

AfterMistakePreview.surfaces.canvas = MistakeCanvas;
