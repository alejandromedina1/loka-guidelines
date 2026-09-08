import { Body, Btn, Btns, Frame, FrameBar, Note } from "./kit.jsx";

const ANSWER =
  "You spent £412 on food in March, £96 more than February. Most of the rise came from eight takeaway orders in the last week of the month.";
const PARTIAL = "You spent £412 on food in March, £96 more than February. Most of the";

// Streaming Response, on a spending report rather than a chat. This is text
// arriving into a product surface somebody opened on purpose — a question they
// asked about their own money, answered in place.
//
// The caret animates on the Streaming state and holds still everywhere else,
// which is the difference between "working" and "stuck" — and the reason a
// stalled stream needs a deadline rather than a spinner.
export function StreamingPreview({ state }) {
  return (
    <Frame width={540}>
      <FrameBar title="Spending · March" />
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
            Saved. Copy what arrived, or run it again.
          </Note>
        )}
        {state === "dropped" && (
          <Note tone="bad" title="Connection lost">
            The partial answer is kept. Continue from here, or retry.
          </Note>
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
                <Btn variant="primary">Run again</Btn>
              </>
            )}
          </Btns>
        </span>
      </Body>
    </Frame>
  );
}
