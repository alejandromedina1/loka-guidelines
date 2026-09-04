import { Body, Btn, Btns, Frame, FrameBar, Label, Note, Say } from "./kit.jsx";

// Inline Suggestion inside a CRM note field — no assistant, no prompt, just
// somebody writing and the system finishing the sentence. The whole pattern
// lives in one decision: whether the reader can see where their words stop.
const TYPED = "Renewal call went well. Ops team wants";
const GHOST = " a shorter onboarding window before they commit to the annual plan.";
const FULL = TYPED + GHOST;

export function InlineSuggestionPreview({ state }) {
  const showGhost = state === "offered";

  return (
    <Frame width={540}>
      <FrameBar title="Northwind Ltd · Account note" />
      <Body>
        <Label>Note</Label>
        <div className="mk-editor" data-focus>
          {state === "typing" && (
            <span className="mk-typed">
              Renewal call went well. Ops<span className="ai-caret" aria-hidden />
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
              {TYPED} a phased rollout<span className="ai-caret" aria-hidden />
            </span>
          )}
          {state === "unavailable" && (
            <span className="mk-typed">
              Spoke to procurement about the SOC 2 addendum
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
            Below the confidence bar for this account, so nothing is offered. Padding with a weak
            guess is how the good suggestions get ignored too.
          </Note>
        )}
      </Body>
    </Frame>
  );
}
