import { Body, Btn, Btns, Chip, Field, Frame, FrameBar, Note, Row, Say, Steps } from "./kit.jsx";

const STEPS = ["Check the balance", "Line up 4 payments", "Send £740", "Log the payments"];

// Approval Gate. The gate itself is stated as an effect in the user's words —
// "Pay 4 bills, £740 in total", never "run batch_transfer" — which is the whole
// difference between approving something and approving something you understood.
//
// Four bills rather than one transfer, because this pattern has to be able to
// fail halfway and mean it. One payment either happens or doesn't; four is
// where "stopped at step 3" is a real state with real consequences.
export function ApprovalGatePreview({ state }) {
  if (state === "executing" || state === "done" || state === "failed") {
    return (
      <Frame width={540}>
        <FrameBar title="Pay 4 bills" />
        <Body>
          {/* The meter now carries which step stopped and how far it got, so
              the callout only has to say the part a meter can't draw: what
              the reader has to do about the two that didn't go. */}
          {state === "failed" && (
            <Note tone="bad" title="Your bank declined the batch">
              2 bills weren't paid. Nothing needs undoing for those.
            </Note>
          )}
          {state === "done" && (
            <Note tone="ok" title="4 bills paid · £740">
              Completed 14:32. Each one will show on your statement within an hour.
            </Note>
          )}
          <Steps
            items={STEPS}
            at={state === "done" ? 4 : 2}
            failed={state === "failed" ? 2 : undefined}
            notes={state === "failed" ? { 2: "£310 of £740" } : undefined}
          />
          {state === "failed" && (
            <Btns align="end">
              <Btn>See the 2 unpaid</Btn>
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
        <Say size="lg">Pay 4 bills, £740 in total</Say>
        <div className="mk-params">
          <Row lead>
            <span className="mk-param">
              <span className="mk-param-key">From</span>
              <span className="mk-param-val">Current account · £1,240 available</span>
            </span>
          </Row>
          <Row>
            <span className="mk-param">
              <span className="mk-param-key">When</span>
              {modified ? (
                <Field state="focus" value="Tomorrow, 09:00" />
              ) : (
                <span className="mk-param-val">Now</span>
              )}
            </span>
          </Row>
          <Row>
            <span className="mk-param">
              <span className="mk-param-key">Bills</span>
              <span className="mk-param-val">Energy, water, phone, council tax</span>
            </span>
          </Row>
        </div>

        {modified && <Chip>Time changed</Chip>}

        <Note tone="warn">Sent money can't be pulled back.</Note>

        <span className="mk-foot">
          <Say tone="mute" size="sm">
            Nothing is sent until you approve.
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
