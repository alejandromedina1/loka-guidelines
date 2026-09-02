import { Body, Btn, Btns, Chip, Field, Frame, FrameBar, Note, Row, Say, Steps } from "./kit.jsx";

const STEPS = ["Build the audience", "Render the template", "Send to 1,240 people", "Log the send"];

// Approval Gate. The gate itself is stated as an effect in the user's words —
// "Email 1,240 subscribers", never "run send_campaign" — which is the whole
// difference between approving something and approving something you understood.
export function ApprovalGatePreview({ state }) {
  if (state === "executing" || state === "done" || state === "failed") {
    return (
      <Frame width={540}>
        <FrameBar title="Campaign · Winter re-engagement" />
        <Body>
          {state === "failed" && (
            <Note tone="bad" title="Stopped at step 3 of 4">
              412 of 1,240 emails were sent before the provider rejected the batch. 828 were not
              sent. Nothing needs undoing for those.
            </Note>
          )}
          {state === "done" && (
            <Note tone="ok" title="Sent to 1,240 people">
              Completed 14:32. Bounces will appear here within an hour.
            </Note>
          )}
          <Steps items={STEPS} at={state === "executing" ? 2 : state === "failed" ? 2 : 4} />
          {state === "executing" && (
            <Say tone="mute" size="sm">
              Step-level progress, because step-level failure is possible.
            </Say>
          )}
          {state === "failed" && (
            <Btns align="end">
              <Btn>Download the 828 unsent</Btn>
              <Btn variant="primary">Retry those only</Btn>
            </Btns>
          )}
        </Body>
      </Frame>
    );
  }

  const modified = state === "modified";

  return (
    <Frame width={540}>
      <FrameBar title="Approval needed" />
      <Body>
        <Say size="lg">Email 1,240 subscribers</Say>
        <div className="mk-params">
          <Row lead>
            <span className="mk-param">
              <span className="mk-param-key">Audience</span>
              <span className="mk-param-val">Inactive 90+ days · 1,240 people</span>
            </span>
          </Row>
          <Row>
            <span className="mk-param">
              <span className="mk-param-key">Send at</span>
              {modified ? (
                <Field state="focus" value="Tomorrow, 09:00" />
              ) : (
                <span className="mk-param-val">Immediately</span>
              )}
            </span>
          </Row>
          <Row>
            <span className="mk-param">
              <span className="mk-param-key">Reply-to</span>
              <span className="mk-param-val">hello@…</span>
            </span>
          </Row>
        </div>

        {modified && <Chip>Send time changed</Chip>}

        <Note tone="warn">This can't be unsent. Nothing runs until you approve it.</Note>

        <span className="mk-foot">
          <Say tone="mute" size="sm">
            Waiting won't send it.
          </Say>
          <Btns align="end">
            <Btn>Reject</Btn>
            <Btn>{modified ? "Revert" : "Modify"}</Btn>
            <Btn variant="primary">Approve</Btn>
          </Btns>
        </span>
      </Body>
    </Frame>
  );
}
