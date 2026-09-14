import { Body, Btn, Btns, Chip, Field, Frame, FrameBar, Note, Row, Say, Steps } from "./kit.jsx";

const STEPS = ["Check the balance", "Line up 4 payments", "Send £740", "Log the payments"];

// Approval Gate. The gate itself is stated as an effect in the user's words —
// "Pay 4 bills, £740 in total", never "run batch_transfer" — which is the whole
// difference between approving something and approving something you understood.
//
// Four bills rather than one transfer, because this pattern has to be able to
// fail halfway and mean it. One payment either happens or doesn't; four is
// where "stopped at step 3" is a real state with real consequences.
//
// Two things are actually done here rather than shown. Modify opens the one
// parameter that can be changed and lets you type in it, and what you type is
// what the approval then carries — a gate that displays a value nobody can
// correct is a confirmation dialog. And Approve runs the steps one at a time,
// so "stopped at step 3" arrives as a thing that happened to a batch you
// released rather than as a frame captioned Failed midway.
const WHEN = "Now";
const STEP_TIME = 800;

export function ApprovalGatePreview({ work, set }) {
  const { when, editing, at, failed } = work;
  const running = at !== null;
  const modified = when !== WHEN;

  if (running) {
    const stopped = failed !== null && at >= failed;
    const done = at >= STEPS.length;
    return (
      <Frame width={540}>
        <FrameBar title="Pay 4 bills" />
        <Body>
          {/* The meter carries which step stopped and how far it got, so the
              callout only has to say the part a meter can't draw: what the
              reader has to do about the two that didn't go. */}
          {stopped && (
            <Note tone="bad" title="Your bank declined the batch">
              2 bills weren't paid. Nothing needs undoing for those.
            </Note>
          )}
          {done && (
            <Note tone="ok" title={`4 bills paid · £740${when === WHEN ? "" : ` · ${when}`}`}>
              Completed 14:32. Each one will show on your statement within an hour.
            </Note>
          )}
          <Steps
            items={STEPS}
            at={at}
            failed={stopped ? failed : undefined}
            notes={stopped ? { [failed]: "£310 of £740" } : undefined}
          />
          {stopped && (
            <Btns align="end">
              <Btn>See the 2 unpaid</Btn>
              <Btn variant="primary" onClick={() => set({ ...work, at: failed, failed: null })}>
                Retry those only
              </Btn>
            </Btns>
          )}
        </Body>
      </Frame>
    );
  }

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
              {editing ? (
                <Field
                  state="focus"
                  value={when}
                  autoFocus
                  onChange={(e) => set({ ...work, when: e.target.value })}
                />
              ) : (
                <span className="mk-param-val">{when}</span>
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

        {modified && !editing && <Chip>Time changed</Chip>}

        <Note tone="warn">Sent money can't be pulled back.</Note>

        <span className="mk-foot">
          <Say tone="mute" size="sm">
            Nothing is sent until you approve.
          </Say>
          <Btns align="end">
            <Btn>Reject</Btn>
            {/* The one parameter that can move. Modify opens it, Revert puts it
                back — and what it says when you approve is what you typed. */}
            {modified || editing ? (
              <Btn onClick={() => set({ ...work, when: WHEN, editing: false })}>Revert</Btn>
            ) : (
              <Btn onClick={() => set({ ...work, editing: true })}>Modify</Btn>
            )}
            {/* The gate. Approving is the only way past it, which is the
                pattern — so it is the only control here that runs anything. */}
            <Btn
              variant="primary"
              onClick={() => set({ ...work, editing: false, at: 0 })}
            >
              Approve
            </Btn>
          </Btns>
        </span>
      </Body>
    </Frame>
  );
}

ApprovalGatePreview.work = {
  for: (id) =>
    ({
      await: { when: WHEN, editing: false, at: null, failed: null },
      modified: { when: "Tomorrow, 09:00", editing: false, at: null, failed: null },
      executing: { when: WHEN, editing: false, at: 2, failed: null },
      done: { when: WHEN, editing: false, at: STEPS.length, failed: null },
      failed: { when: WHEN, editing: false, at: 2, failed: 2 },
    })[id] ?? { when: WHEN, editing: false, at: null, failed: null },

  state: (w) => {
    if (w.at === null) return w.when !== WHEN || w.editing ? "modified" : "await";
    if (w.failed !== null && w.at >= w.failed) return "failed";
    return w.at >= STEPS.length ? "done" : "executing";
  },

  // One step at a time once it has been released. Nothing fails on this
  // timetable: a bank declining a batch is reachable from the tabs, because a
  // gate whose demo fails on its own teaches that approving is what breaks it.
  tick: (w) =>
    w.at === null || w.failed !== null || w.at >= STEPS.length
      ? null
      : { work: { ...w, at: w.at + 1 }, in: STEP_TIME },
};
