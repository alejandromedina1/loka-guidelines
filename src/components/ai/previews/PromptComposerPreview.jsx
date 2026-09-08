import { Body, Btn, Btns, Chip, Field, Frame, FrameBar, GhostLines, Label, Note, Say } from "./kit.jsx";

// Prompt Box — the input surface, in each of its five states.
//
// Framed as a step in a workflow rather than a chat window. The pattern does
// involve a text field, which is why the hub's first principle says to save one
// for genuinely open-ended intent — but "open-ended" is not the same as
// "conversational". This is somebody starting a piece of work by describing it,
// which is the case that earns a prompt in a product that isn't a chatbot.
export function PromptComposerPreview({ state }) {
  const over = state === "over";
  const empty = state === "empty";
  return (
    <Frame width={540}>
      <FrameBar title="New spending report" />
      <Body>
        {/* Submitted: the request is echoed and locked above the answer it
            produced, and a fresh composer opens below for the follow-up. */}
        {state === "submitted" && (
          <>
            <div className="mk-echo">
              <Label>You asked</Label>
              <Say size="sm">What did I spend on food last month?</Say>
            </div>
            <GhostLines widths={[100, 95, 88, 54]} />
          </>
        )}

        {/* The three parameters the decision says belong on chips rather than in
            prose — which account, which dates, what shape the answer takes —
            shown before the send rather than discovered after it. */}
        {state === "context" && (
          <span className="mk-chips">
            <Chip>Current account</Chip>
            <Chip>Last 30 days</Chip>
            <Chip>As a chart</Chip>
            <Chip>+ Add</Chip>
          </span>
        )}

        <Field
          rows={2}
          state={over ? "error" : empty || state === "submitted" ? "idle" : "focus"}
          placeholder="Describe the report you want…"
          value={
            empty || state === "submitted"
              ? ""
              : over
                ? "What did I spend on food last month, and break it down by shop, by day of the week, by card, and compare each one against the same month last year and the year before…"
                : "What did I spend on food last month?"
          }
        />

        {over && <Note tone="warn">Shorten by 180 characters to send.</Note>}

        <span className="mk-foot">
          {over ? (
            <Say tone="bad" size="sm">
              4,180 / 4,000 characters
            </Say>
          ) : (
            <span />
          )}
          <Btns align="end">
            <Btn>Add a file</Btn>
            <Btn variant="primary" disabled={empty || over || state === "submitted"}>
              Send
            </Btn>
          </Btns>
        </span>
      </Body>
    </Frame>
  );
}
