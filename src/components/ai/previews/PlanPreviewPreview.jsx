import { Body, Btn, Btns, Chip, Frame, FrameBar, Label, Note, Row, Say, Steps } from "./kit.jsx";

// Plan Preview on cancelling unused subscriptions. The steps are the point: the
// outcome ("cancel 3 subscriptions") hides the one step that contacts people.
const PLAN = [
  { label: "Find subscriptions you haven't used", risk: false },
  { label: "Work out what you'd save", risk: false },
  { label: "Cancel 3 subscriptions", risk: true },
  { label: "Email the 3 companies to confirm", risk: true },
];

export function PlanPreviewPreview({ state }) {
  if (state === "running" || state === "paused" || state === "done") {
    const at = state === "done" ? 4 : state === "paused" ? 2 : 1;
    return (
      <Frame width={540}>
        <FrameBar title="Cancel 3 subscriptions" />
        <Body>
          {state === "done" && (
            <Note tone="ok" title="4 of 4 steps complete">
              3 cancelled, 3 confirmation emails sent. Finished 16:41. You'll save £27 a month.
            </Note>
          )}
          {state === "paused" && (
            <Note tone="warn" title="Paused before step 3">
              Two steps done and reversible. Nothing has been cancelled yet.
            </Note>
          )}
          {/* Paused holds step 3 in a neutral ring rather than the blue one
              in-flight steps get: the note says nothing has been cancelled
              yet, and this is that sentence drawn. */}
          <Steps items={PLAN.map((s) => s.label)} at={at} paused={state === "paused"} />
          <span className="mk-foot">
            <Say tone="mute" size="sm">
              {state === "done" ? "Receipt kept on your account" : "Pauses between steps"}
            </Say>
            <Btns align="end">
              {state === "paused" && <Btn>Abandon</Btn>}
              {state !== "done" && (
                <Btn variant={state === "paused" ? "primary" : "danger"}>
                  {state === "paused" ? "Resume" : "Pause"}
                </Btn>
              )}
              {state === "done" && <Btn>View what changed</Btn>}
            </Btns>
          </span>
        </Body>
      </Frame>
    );
  }

  const removed = state === "edited";
  return (
    <Frame width={540}>
      <FrameBar title="Cancel 3 subscriptions" />
      <Body>
        <span className="mk-scope-head">
          <Label>Plan</Label>
          <Chip>{removed ? "3 steps · 1 removed" : "4 steps"}</Chip>
        </span>

        <div className="mk-list">
          {PLAN.map((s, i) => (
            <Row key={s.label} lead={s.risk} tone={removed && i === 3 ? "mute" : undefined}>
              <span className="mk-plan">
                <span className="mk-plan-step" data-cut={removed && i === 3 ? "" : undefined}>
                  {s.label}
                </span>
                {s.risk && !(removed && i === 3) && <Chip>Can't be undone</Chip>}
                {removed && i === 3 && <Chip>Removed</Chip>}
              </span>
            </Row>
          ))}
        </div>

        <Note
          tone={removed ? "plain" : "warn"}
          title={removed ? "No emails will go out" : "Two steps can't be undone"}
        >
          {removed
            ? "Step 4 was cut, so nothing is emailed. The other three run as listed."
            : "Steps 3 and 4 reach outside this app. Remove either before running."}
        </Note>

        <span className="mk-foot">
          <Say tone="mute" size="sm">
            Nothing runs until you start it
          </Say>
          <Btns align="end">
            <Btn>Edit plan</Btn>
            <Btn variant="primary">Run {removed ? "3" : "4"} steps</Btn>
          </Btns>
        </span>
      </Body>
    </Frame>
  );
}
