import { Body, Btn, Btns, Frame, FrameBar, Label, Note, Say } from "./kit.jsx";
import { VoiceStage } from "./voice.jsx";
import { Board, Nothing, Obj, OnObject } from "./canvas.jsx";

// Inline Suggestion inside the note on a payment — no assistant, no prompt, just
// somebody writing and the system finishing the sentence. The whole pattern
// lives in one decision: whether the reader can see where their words stop.
//
// You type here. That is the only way this pattern can be understood, because
// every state of it is defined by the relationship between two things — what
// you wrote and what was offered — and a wireframe with both pre-filled shows
// the relationship without ever letting you feel it. Stop typing and a
// suggestion arrives; press Tab and it is taken; keep typing and it goes.
//
// Tab is caught on the field rather than illustrated in the foot. It is the
// keybinding the pattern is named for, and a caption reading "Tab to accept"
// over a field where Tab moves focus is a wireframe contradicting itself.
const GHOST = " split three ways, he owes me £16.";
// How long a pause counts as a pause. Short enough to happen while somebody is
// reading the frame, long enough not to fire between two words.
const PAUSE = 700;
// Nothing is offered below this, which is what "nothing clears the bar" means.
const MIN = 3;

export function InlineSuggestionPreview({ work, set }) {
  const { typed, offered, took, mute } = work;
  // A suggestion is showing only while nothing has been done about it.
  const showGhost = offered && took === null;

  // Typing is what dismisses a suggestion — not a button, because there is no
  // button. Carrying on *is* the dismissal.
  //
  // And it clears the last outcome, which is what keeps the cycle a cycle: type
  // after a dismissal and the pause can offer again, type after taking one and
  // the words are yours to edit so Undo stops applying to them. Holding the
  // outcome would have left the editor dead after the first suggestion — the
  // one thing a pattern about typing must not do.
  const type = (value) =>
    set({ ...work, typed: value, offered: false, took: offered ? "dismissed" : null });

  return (
    <Frame width={540}>
      <FrameBar title="Note on a payment · £48.20" />
      <Body>
        <Label>Note</Label>
        {/* A mirror under a transparent textarea — the technique a real editor
            uses for ghost text, and the only one available: no <input> or
            <textarea> can style a span inside its own value, which is why this
            pattern's Input Field is the one essential part the kit hand-draws.
            The mirror carries the paint and sets the height; the textarea
            carries the caret, the keystrokes and Tab. */}
        <div className="mk-editor" data-focus>
          <span className="mk-typed" aria-hidden>
            {typed}
            {/* The one thing this pattern is: the model's words have to look
                like the model's words. The shortcut renders them identically
                to the typed text, and it gets accepted by momentum. */}
            {showGhost && <span className="mk-ghost-text">{GHOST}</span>}
            {/* A zero-width space so an empty mirror still has a line box and
                the field doesn't collapse under its own placeholder. */}
            {"\u200b"}
          </span>
          {/* The suggestion is drawn in the mirror, and the mirror is hidden
              from assistive tech — so without this the one thing this pattern
              is about never reaches a screen reader at all. A real editor
              announces a completion for the same reason: the words are on
              screen but not in the field, so nothing else can report them. */}
          <span className="vh" aria-live="polite">
            {showGhost ? `Suggestion: ${GHOST.trim()} Press Tab to accept.` : ""}
          </span>
          <textarea
            className="mk-editor-input"
            aria-label="Note"
            placeholder={typed ? undefined : "Write a note…"}
            value={typed}
            onChange={(e) => type(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Tab" && showGhost) {
                e.preventDefault();
                set({ ...work, typed: typed + GHOST, offered: false, took: "accepted" });
              }
            }}
          />
        </div>

        <span className="mk-foot">
          <Say tone="mute" size="sm">
            {showGhost
              ? "Tab to accept · keep typing to ignore"
              : took === "accepted"
                ? "Yours to edit — it is your note now"
                : "Suggestions appear when you pause"}
          </Say>
          <Btns align="end">
            {took === "accepted" && (
              <Btn
                onClick={() =>
                  set({ ...work, typed: typed.slice(0, -GHOST.length), took: null })
                }
              >
                Undo
              </Btn>
            )}
          </Btns>
        </span>

        {mute && (
          <Note tone="plain" title="No suggestion here">
            Nothing above the bar for this payment.
          </Note>
        )}
      </Body>
    </Frame>
  );
}

InlineSuggestionPreview.work = {
  for: (id) =>
    ({
      typing: { typed: "Dinner with", offered: false, took: null, mute: false },
      unavailable: { typed: "Parking, Stoke Newington", offered: false, took: null, mute: true },
      offered: { typed: "Dinner with Sam —", offered: true, took: null, mute: false },
      accepted: { typed: "Dinner with Sam —" + GHOST, offered: false, took: "accepted", mute: false },
      dismissed: { typed: "Dinner with Sam — my half of the table", offered: false, took: "dismissed", mute: false },
    })[id] ?? { typed: "", offered: false, took: null, mute: false },

  state: (w) => {
    if (w.mute) return "unavailable";
    if (w.offered) return "offered";
    if (w.took) return w.took;
    return "typing";
  },

  // The pause is the trigger, and a pause is the user doing nothing — which is
  // why this is the system's move and not a control. There is no button for
  // "stop typing".
  tick: (w) =>
    w.mute || w.offered || w.took || w.typed.trim().length < MIN
      ? null
      : { work: { ...w, offered: true }, in: PAUSE },
};

// ── Spoken ──────────────────────────────────────────────────────────────────
//
// Same `work`: what has been dictated, whether something is on offer, what was
// done about it. What changes is the cost of offering.
//
// On a screen the suggestion is grey words you can ignore for free — you see
// them, you keep typing, nothing was spent. Out loud there is no ignoring: the
// offer takes a second of somebody's attention whether they wanted it or not,
// and it interrupts the thing they were in the middle of saying. So the bar
// goes up and the rate goes down, and the accept has to be one syllable.
function InlineVoice({ work, set }) {
  const { typed, offered, took, mute } = work;
  const showGhost = offered && took === null;

  return (
    <VoiceStage
      device="Headphones"
      mood={showGhost ? "speaking" : took === "accepted" ? "rest" : "listening"}
      heard={typed || undefined}
      caption={
        showGhost
          ? "Add “split three ways, he owes me £16”?"
          : took === "accepted"
            ? "Added. Say “undo” if that's wrong."
            : mute
              ? undefined
              : undefined
      }
    >
      {/* One syllable, because the alternative is listening to a menu. */}
      {showGhost && (
        <>
          <Btn variant="primary" onClick={() => set({ ...work, typed: typed + GHOST, offered: false, took: "accepted" })}>
            Yes
          </Btn>
          <Btn onClick={() => set({ ...work, offered: false, took: "dismissed" })}>No</Btn>
        </>
      )}
      {took === "accepted" && (
        <Btn onClick={() => set({ ...work, typed: typed.slice(0, -GHOST.length), took: null })}>
          Undo
        </Btn>
      )}
      {!showGhost && took !== "accepted" && (
        <Btn onClick={() => set({ ...work, typed: typed ? typed : "Dinner with Sam —", offered: false, took: null })}>
          Keep talking
        </Btn>
      )}
    </VoiceStage>
  );
}

InlineSuggestionPreview.surfaces = { voice: InlineVoice };

// ── On a canvas ─────────────────────────────────────────────────────────────
//
// Same `work`. A faint object rather than faint words, and carrying on drawing
// is what dismisses it — the same gesture as carrying on typing, which is the
// pattern's own answer and the reason it survives the move intact.
//
// What the surface adds is a place to put it. Ghost text has to sit in the flow
// of the sentence it is finishing, which is why it must look unmistakably unlike
// the typed words; a ghost object sits *beside* what you drew, so the distinction
// is spatial before it is stylistic and the momentum-accept this pattern warns
// about is that much harder to make by accident.
function InlineCanvas({ work, set }) {
  const { typed, offered, took, mute } = work;
  const showGhost = offered && took === null;

  return (
    <Board title="Board · monthly note">
      <Obj label="Yours" meta={took === "accepted" ? "Extended" : undefined} selected={!showGhost}>
        <span className="cv-layer">{typed || "Nothing drawn yet"}</span>
      </Obj>

      {showGhost && (
        /* Beside, not inside. The offer is a thing next to your thing, so
           taking it is a decision rather than a momentum. */
        <Obj label="Suggested" meta="Not placed">
          <span className="cv-layer" data-provisional>
            {GHOST.trim()}
          </span>
          <OnObject>
            <Btn
              variant="primary"
              onClick={() => set({ ...work, typed: typed + GHOST, offered: false, took: "accepted" })}
            >
              Place it
            </Btn>
            <Btn onClick={() => set({ ...work, offered: false, took: "dismissed" })}>Leave it</Btn>
          </OnObject>
        </Obj>
      )}

      {mute && <Nothing>Nothing worth suggesting for this one.</Nothing>}

      <span className="cv-foot">
        <Say tone="mute" size="sm">
          {showGhost
            ? "Carrying on drawing leaves it"
            : took === "accepted"
              ? "Placed — it's yours to move"
              : "Pause, and something may appear beside it"}
        </Say>
        <Btns align="end">
          {took === "accepted" && (
            <Btn onClick={() => set({ ...work, typed: typed.slice(0, -GHOST.length), took: null })}>
              Undo
            </Btn>
          )}
        </Btns>
      </span>
    </Board>
  );
}

InlineSuggestionPreview.surfaces.canvas = InlineCanvas;
