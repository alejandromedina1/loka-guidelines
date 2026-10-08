import { Body, Btn, Btns, Field, Frame, FrameBar, Label, Part, Say } from "./kit.jsx";
import { VoiceStage } from "./voice.jsx";
import { Board, Nothing, Obj } from "./canvas.jsx";

// Suggested Prompts on the spending box. The examples are written at the length
// a real question is, because the length is as much of the lesson as the
// wording — a two-word example teaches a shape nobody can reuse.
//
// Drawn as a stack of whole sentences rather than as chips. Chips would be the
// context tags Prompt Box already draws, and they would force the examples down
// to two or three words each, which is the one thing this pattern must not do.
const GENERAL = [
  { ask: "What did I spend on food last month?", gets: "One figure, with the payments behind it" },
  { ask: "Which subscriptions went up this year?", gets: "A list, with the old and new prices" },
  { ask: "Compare March with the same month last year", gets: "Two columns, by category" },
];

// About what's on screen. A generic set teaches that the feature exists; a
// specific set gets used, and getting used is how anybody learns the rest.
const ON_PAGE = [
  { ask: "Why is this month higher than February?", gets: "The three biggest differences" },
  { ask: "Is £84 normal for subscriptions?", gets: "This month against your last twelve" },
];

export function SuggestedPromptsPreview({ work, set }) {
  const { typed, picked, scope } = work;
  const list = scope === "page" ? ON_PAGE : GENERAL;
  const standDown = Boolean(typed);

  return (
    <Frame width={540}>
      <FrameBar title={scope === "page" ? "Spending · March" : "Ask about your money"} />
      <Body>
        <Part name="Input Field" block>
          <Field
            placeholder="Ask about your spending…"
            value={typed}
            state={typed ? "focus" : "idle"}
            onChange={(e) => set({ ...work, typed: e.target.value, picked: null })}
          />
        </Part>

        {scope === "none" ? (
          // Better empty than padded. Three weak examples teach that the
          // feature is weak, so nothing is offered and nothing apologises for
          // it either — a line explaining the absence is the padding again.
          <span className="mk-foot">
            <Say tone="mute" size="sm">Ask anything about the last 6 years</Say>
          </span>
        ) : standDown ? (
          // Stood down to one line. They do not disappear — somebody who
          // stalls mid-sentence still has a way back — but they stop competing
          // with a question that is already being written.
          <span className="mk-egs-shut">
            <span className="mk-eg-ask">{`${list.length} examples`}</span>
            <Part name="Button">
              <Btn onClick={() => set({ ...work, typed: "", picked: null })}>Show them</Btn>
            </Part>
          </span>
        ) : (
          <>
            <Label>{scope === "page" ? "About this page" : "Things people ask"}</Label>
            <ul className="mk-egs">
              {list.map((e, i) => (
                <li key={e.ask}>
                  {/* Fills the box, never sends. The first thing anybody does
                      with an example is change one word in it, and firing on
                      click turns a browse into a commitment. Only the first
                      row is marked in anatomy — a null name marks nothing. */}
                  <Part name={i === 0 ? "List Item" : null} block>
                  <button
                    type="button"
                    className="mk-eg"
                    data-picked={picked === i ? "" : undefined}
                    onClick={() => set({ ...work, typed: e.ask, picked: i })}
                  >
                    <span className="mk-eg-ask">{e.ask}</span>
                    <span className="mk-eg-gets">{e.gets}</span>
                  </button>
                  </Part>
                </li>
              ))}
            </ul>
          </>
        )}

        {picked !== null && (
          <span className="mk-foot">
            <Say tone="mute" size="sm">In the box — change it before it goes</Say>
            <Part name="Button">
              <Btns align="end">
                <Btn onClick={() => set({ ...work, typed: "", picked: null })}>Clear</Btn>
                <Btn variant="primary">Ask</Btn>
              </Btns>
            </Part>
          </span>
        )}
      </Body>
    </Frame>
  );
}

SuggestedPromptsPreview.work = {
  // What the reader typed survives a jump to a state that allows it.
  keep: ["typed"],
  for: (id) =>
    ({
      open: { typed: "", picked: null, scope: "all" },
      narrowed: { typed: "", picked: null, scope: "page" },
      typing: { typed: "How much did I spend on", picked: null, scope: "all" },
      used: { typed: GENERAL[1].ask, picked: 1, scope: "all" },
      thin: { typed: "", picked: null, scope: "none" },
    })[id] ?? { typed: "", picked: null, scope: "all" },

  state: (w) =>
    w.scope === "none"
      ? "thin"
      : w.picked !== null
        ? "used"
        : w.typed
          ? "typing"
          : w.scope === "page"
            ? "narrowed"
            : "open",

  // No tick, and that is the answer for this one. Everything here is the user's
  // move — typing a character, picking an example, clearing it. A system that
  // swapped its own suggestions while somebody read them would be the pattern
  // working against itself.
};

// ── Spoken ──────────────────────────────────────────────────────────────────
//
// Same `work`. Reading four examples aloud costs more than the question they
// were meant to save, so the whole pattern compresses to one — offered late,
// after somebody has already stalled, rather than as an opening menu.
function PromptsVoice({ work, set }) {
  const { typed, picked, scope } = work;
  const list = scope === "page" ? ON_PAGE : GENERAL;

  if (scope === "none") return <VoiceStage device="Kitchen speaker" mood="listening" />;

  if (picked !== null)
    return (
      <VoiceStage device="Kitchen speaker" mood="listening" caption={`“${list[0].ask}” — ask that?`}>
        <Btn onClick={() => set({ ...work, typed: "", picked: null })}>No</Btn>
        <Btn variant="primary">Yes</Btn>
      </VoiceStage>
    );

  if (typed)
    return <VoiceStage device="Kitchen speaker" mood="listening" heard="How much did I spend on—" />;

  if (scope === "page")
    return (
      <VoiceStage
        device="Kitchen speaker"
        mood="speaking"
        caption={`You were looking at March. You could ask: ${ON_PAGE[0].ask.toLowerCase()}`}
      >
        <Btn variant="primary" onClick={() => set({ ...work, picked: 0 })}>Ask that</Btn>
      </VoiceStage>
    );

  return <VoiceStage device="Kitchen speaker" mood="listening" />;
}

SuggestedPromptsPreview.surfaces = { voice: PromptsVoice };

// ── On a canvas ─────────────────────────────────────────────────────────────
//
// Same `work`. An empty board is the blank box made larger, and the examples
// sit on it rather than in a panel — so what could be made and where it would
// go are the same thing.
function PromptsCanvas({ work, set }) {
  const { typed, picked, scope } = work;
  const list = scope === "page" ? ON_PAGE : GENERAL;

  if (scope === "none")
    return (
      <Board title="Board · Spending">
        <Nothing>Nothing here yet. Drop a statement on it, or start drawing.</Nothing>
      </Board>
    );

  if (picked !== null)
    return (
      <Board title="Board · Spending">
        <Obj label={list[picked].ask} meta="Not made yet" selected wide>
          <span className="cv-layer" data-provisional>{list[picked].gets}</span>
        </Obj>
      </Board>
    );

  if (typed)
    return (
      <Board title="Board · Spending">
        <Obj label="Untitled" meta="Being made" selected wide>
          <span className="cv-layer">{typed}</span>
        </Obj>
      </Board>
    );

  return (
    <Board title="Board · Spending">
      {scope === "page" && <Obj label="March" meta="142 payments" />}
      {list.map((e, i) => (
        <Obj key={e.ask} label={e.ask} meta="Example">
          <span className="cv-layer" data-provisional>{e.gets}</span>
        </Obj>
      ))}
      <span className="cv-foot">
        <Say tone="mute" size="sm">
          {scope === "page" ? "Placed beside what you already have" : "Nothing placed yet"}
        </Say>
        <Btns align="end">
          <Btn variant="primary" onClick={() => set({ ...work, picked: 0 })}>Make the first one</Btn>
        </Btns>
      </span>
    </Board>
  );
}

SuggestedPromptsPreview.surfaces.canvas = PromptsCanvas;
