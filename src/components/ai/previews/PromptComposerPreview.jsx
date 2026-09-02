import { Body, Btn, Btns, Chip, Field, Frame, FrameBar, GhostLines, Label, Note, Say } from "./kit.jsx";

// Prompt Composer — the input surface, in each of its five states.
export function PromptComposerPreview({ state }) {
  const over = state === "over";
  const empty = state === "empty";
  return (
    <Frame width={540}>
      <FrameBar title="Assistant" />
      <Body>
        {/* Submitted: the prompt is echoed and locked above the answer it
            produced, and a fresh composer opens below for the follow-up. */}
        {state === "submitted" && (
          <>
            <div className="mk-echo">
              <Label>You asked</Label>
              <Say size="sm">Summarise last quarter's churn by cohort</Say>
            </div>
            <GhostLines widths={[100, 95, 88, 54]} />
          </>
        )}

        {/* Scope shown before the send, not discovered after it. */}
        {state === "context" && (
          <span className="mk-chips">
            <Chip>accounts_q3.csv</Chip>
            <Chip>Last 90 days</Chip>
            <Chip>+ Add context</Chip>
          </span>
        )}

        <Field
          rows={2}
          state={over ? "error" : empty || state === "submitted" ? "idle" : "focus"}
          placeholder="Ask about your accounts, or describe what to build…"
          value={
            empty || state === "submitted"
              ? ""
              : over
                ? "Summarise last quarter's churn by cohort, then cross-reference every cancelled account against its onboarding path, support history, invoice disputes…"
                : "Summarise last quarter's churn by cohort"
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
            <Btn>Attach</Btn>
            <Btn variant="primary" disabled={empty || over || state === "submitted"}>
              Send
            </Btn>
          </Btns>
        </span>
      </Body>
    </Frame>
  );
}
