import { Body, Btn, Btns, Chip, Frame, FrameBar, Label, Note, Row, Say, Steps } from "./kit.jsx";

// Plan Preview on a bulk record update. The steps are the point: the outcome
// ("update 340 records") hides the one step that contacts people.
const PLAN = [
  { label: "Match 340 accounts on region", risk: false },
  { label: "Recalculate renewal dates", risk: false },
  { label: "Write the new dates to Salesforce", risk: true },
  { label: "Email 340 account owners", risk: true },
];

export function PlanPreviewPreview({ state }) {
  if (state === "running" || state === "paused" || state === "done") {
    const at = state === "done" ? 4 : state === "paused" ? 2 : 1;
    return (
      <Frame width={540}>
        <FrameBar title="Bulk update · Q4 renewals" />
        <Body>
          {state === "done" && (
            <Note tone="ok" title="4 of 4 steps complete">
              340 records updated, 340 owners emailed. Finished 16:41.
            </Note>
          )}
          {state === "paused" && (
            <Note tone="warn" title="Paused before step 3">
              Two steps done and reversible. Nothing has been written to Salesforce yet.
            </Note>
          )}
          <Steps items={PLAN.map((s) => s.label)} at={at} />
          <span className="mk-foot">
            <Say tone="mute" size="sm">
              {state === "done" ? "Receipt kept on the record" : "Pauses at step boundaries"}
            </Say>
            <Btns align="end">
              {state === "paused" && <Btn>Abandon</Btn>}
              {state !== "done" && (
                <Btn variant={state === "paused" ? "primary" : "danger"}>
                  {state === "paused" ? "Resume" : "Pause"}
                </Btn>
              )}
              {state === "done" && <Btn>View changes</Btn>}
            </Btns>
          </span>
        </Body>
      </Frame>
    );
  }

  const removed = state === "edited";
  return (
    <Frame width={540}>
      <FrameBar title="Bulk update · Q4 renewals" />
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
                {s.risk && !(removed && i === 3) && <Chip>Irreversible</Chip>}
                {removed && i === 3 && <Chip>Removed</Chip>}
              </span>
            </Row>
          ))}
        </div>

        <Note tone={removed ? "plain" : "warn"} title={removed ? "Nothing will be sent" : "Two steps can't be undone"}>
          {removed
            ? "Step 4 was cut, so no email goes out. The other three run as listed."
            : "Steps 3 and 4 write outside this tool. Remove either before running."}
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
