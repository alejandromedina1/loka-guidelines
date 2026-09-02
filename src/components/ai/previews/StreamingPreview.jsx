import { Body, Btn, Btns, Frame, FrameBar, Note, Say } from "./kit.jsx";

const ANSWER =
  "Churn concentrated in accounts that onboarded during the March migration: 62 of 148 cancellations came from that cohort, against 19% of total signups.";
const PARTIAL = "Churn concentrated in accounts that onboarded during the March migration: 62 of";

// Streaming Response. The caret animates on the Streaming state and holds still
// everywhere else, which is the difference between "working" and "stuck" — and
// the reason a stalled stream needs a deadline rather than a spinner.
export function StreamingPreview({ state }) {
  return (
    <Frame width={540}>
      <FrameBar title="Assistant" />
      <Body>
        {state === "waiting" && (
          <div className="ai-skel" aria-label="Preparing response">
            <span className="ai-skel-line" style={{ width: "94%" }} />
            <span className="ai-skel-line" style={{ width: "98%" }} />
            <span className="ai-skel-line" style={{ width: "61%" }} />
          </div>
        )}

        {state === "streaming" && (
          <p className="ai-answer">
            {PARTIAL}
            <span className="ai-caret" aria-hidden />
          </p>
        )}

        {state === "complete" && <p className="ai-answer">{ANSWER}</p>}

        {(state === "stopped" || state === "dropped") && (
          <p className="ai-answer" data-partial>
            {PARTIAL}
          </p>
        )}

        {/* Three treatments, not one. Stopped is the user's own choice so it
            stays neutral; a lost connection is a real failure and reads as one. */}
        {state === "stopped" && (
          <Note tone="plain" title="Stopped — partial answer">
            Kept, marked, and still copyable.
          </Note>
        )}
        {state === "dropped" && (
          <Note tone="bad" title="Connection lost">
            The partial answer is kept. Continue from here, or retry.
          </Note>
        )}

        {state === "waiting" && (
          <Say tone="mute" size="sm">
            Nothing is drawn for the first 300ms — faster than that and the placeholder is a flash.
          </Say>
        )}

        <span className="mk-foot">
          <span />
          <Btns align="end">
            {state === "streaming" || state === "waiting" ? (
              <Btn variant="danger">Stop</Btn>
            ) : state === "dropped" ? (
              <>
                <Btn>Continue</Btn>
                <Btn variant="primary">Retry</Btn>
              </>
            ) : (
              <>
                <Btn disabled={state === "waiting"}>Copy</Btn>
                <Btn variant="primary">Regenerate</Btn>
              </>
            )}
          </Btns>
        </span>

      </Body>
    </Frame>
  );
}
