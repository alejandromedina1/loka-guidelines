import { Body, Btn, Btns, Frame, FrameBar, Label, Note, Say } from "./kit.jsx";

// Inline Suggestion inside the note on a payment — no assistant, no prompt, just
// somebody writing and the system finishing the sentence. The whole pattern
// lives in one decision: whether the reader can see where their words stop.
const TYPED = "Dinner with Sam —";
const GHOST = " split three ways, he owes me £16.";
const FULL = TYPED + GHOST;

export function InlineSuggestionPreview({ state }) {
  const showGhost = state === "offered";

  return (
    <Frame width={540}>
      <FrameBar title="Note on a payment · £48.20" />
      <Body>
        <Label>Note</Label>
        <div className="mk-editor" data-focus>
          {state === "typing" && (
            <span className="mk-typed">
              Dinner with<span className="ai-caret" aria-hidden />
            </span>
          )}

          {showGhost && (
            <span className="mk-typed">
              {TYPED}
              {/* The one thing this pattern is: the model's words have to look
                  like the model's words. The shortcut renders them identically
                  to the typed text, and it gets accepted by momentum. */}
              <span className="mk-ghost-text">{GHOST}</span>
            </span>
          )}

          {state === "accepted" && <span className="mk-typed">{FULL}</span>}
          {state === "dismissed" && (
            <span className="mk-typed">
              {TYPED} my half of the table<span className="ai-caret" aria-hidden />
            </span>
          )}
          {state === "unavailable" && (
            <span className="mk-typed">
              Parking, Stoke Newington
              <span className="ai-caret" aria-hidden />
            </span>
          )}
        </div>

        {showGhost && (
          <span className="mk-foot">
            <Say tone="mute" size="sm">
              Tab to accept · keep typing to ignore
            </Say>
            <span />
          </span>
        )}
        {state === "accepted" && (
          <span className="mk-foot">
            <Btns align="end">
              <Btn>Undo</Btn>
            </Btns>
          </span>
        )}

        {state === "unavailable" && (
          <Note tone="plain" title="No suggestion here">
            Nothing above the bar for this payment.
          </Note>
        )}
      </Body>
    </Frame>
  );
}
