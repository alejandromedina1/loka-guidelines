import { Body, Btn, Btns, Chip, Frame, FrameBar, Hot, Label, Note, Row, Say, Steps } from "./kit.jsx";
import { VoiceStage } from "./voice.jsx";

// Plan Preview on cancelling unused subscriptions. The steps are the point: the
// outcome ("cancel 3 subscriptions") hides the one step that contacts people.
//
// The plan is edited rather than illustrated. Any step can be taken out, the
// count and the warning follow what is left, and the run only performs the
// steps still in it — which is the pattern's argument made operable: a plan you
// can read but not change is a progress bar with extra words.
//
// Running is real too. Steps complete one at a time and Pause holds the next
// one, so "paused before step 3" is a place you stopped it rather than a frame
// you were shown, and Resume carries on from there.
const PLAN = [
  { label: "Find subscriptions you haven't used", risk: false },
  { label: "Work out what you'd save", risk: false },
  { label: "Cancel 3 subscriptions", risk: true },
  { label: "Email the 3 companies to confirm", risk: true },
];
const STEP_TIME = 900;

export function PlanPreviewPreview({ work, set }) {
  const { cut, at, paused } = work;
  const steps = PLAN.filter((_, i) => !cut.includes(i));
  const risky = steps.filter((s) => s.risk);

  if (at !== null) {
    const done = at >= steps.length;
    return (
      <Frame width={540}>
        <FrameBar title="Cancel 3 subscriptions" />
        <Body>
          {done && (
            <Note tone="ok" title={`${steps.length} of ${steps.length} steps complete`}>
              Finished 16:41. You'll save £27 a month.
            </Note>
          )}
          {paused && !done && (
            <Note tone="warn" title={`Paused before step ${at + 1}`}>
              {at} step{at === 1 ? "" : "s"} done and reversible.
              {risky.length > 0 && " Nothing has been cancelled yet."}
            </Note>
          )}
          {/* Paused holds the next step in a neutral ring rather than the blue
              one in-flight steps get: the note says nothing has been cancelled
              yet, and this is that sentence drawn. */}
          <Steps items={steps.map((s) => s.label)} at={at} paused={paused} />
          <span className="mk-foot">
            <Say tone="mute" size="sm">
              {done ? "Receipt kept on your account" : "Pauses between steps"}
            </Say>
            <Btns align="end">
              {paused && !done && (
                <Btn onClick={() => set({ ...work, at: null, paused: false })}>Abandon</Btn>
              )}
              {!done && (
                <Btn
                  variant={paused ? "primary" : "danger"}
                  onClick={() => set({ ...work, paused: !paused })}
                >
                  {paused ? "Resume" : "Pause"}
                </Btn>
              )}
              {done && <Btn>View what changed</Btn>}
            </Btns>
          </span>
        </Body>
      </Frame>
    );
  }

  return (
    <Frame width={540}>
      <FrameBar title="Cancel 3 subscriptions" />
      <Body>
        <span className="mk-scope-head">
          <Label>Plan</Label>
          <Chip>
            {steps.length} step{steps.length === 1 ? "" : "s"}
            {cut.length > 0 && ` · ${cut.length} removed`}
          </Chip>
        </span>

        <div className="mk-list">
          {PLAN.map((s, i) => {
            const removed = cut.includes(i);
            return (
              <Row key={s.label} lead={s.risk && !removed} tone={removed ? "mute" : undefined}>
                <span className="mk-plan">
                  <span className="mk-plan-step" data-cut={removed ? "" : undefined}>
                    {s.label}
                  </span>
                  {s.risk && !removed && <Chip>Can't be undone</Chip>}
                  {/* Every step can be taken out, and put back. The pattern's
                      claim is that a plan is reviewed before it runs, and a
                      review you can't act on is a reading. */}
                  <Hot
                    label={removed ? `Put back: ${s.label}` : `Remove: ${s.label}`}
                    onClick={() =>
                      set({
                        ...work,
                        cut: removed ? cut.filter((x) => x !== i) : [...cut, i],
                      })
                    }
                  >
                    <Chip>{removed ? "Put back" : "Remove"}</Chip>
                  </Hot>
                </span>
              </Row>
            );
          })}
        </div>

        <Note
          tone={risky.length ? "warn" : "plain"}
          title={
            risky.length === 0
              ? "Nothing left that can't be undone"
              : risky.length === 1
                ? "One step can't be undone"
                : "Two steps can't be undone"
          }
        >
          {risky.length === 0
            ? "The steps still in the plan all run inside this app."
            : `${risky.map((s) => `“${s.label}”`).join(" and ")} reach outside this app. Remove either before running.`}
        </Note>

        <span className="mk-foot">
          <Say tone="mute" size="sm">
            Nothing runs until you start it
          </Say>
          <Btns align="end">
            <Btn disabled={cut.length === 0} onClick={() => set({ ...work, cut: [] })}>
              Restore all
            </Btn>
            <Btn
              variant="primary"
              disabled={steps.length === 0}
              onClick={() => set({ ...work, at: 0, paused: false })}
            >
              Run {steps.length} step{steps.length === 1 ? "" : "s"}
            </Btn>
          </Btns>
        </span>
      </Body>
    </Frame>
  );
}

PlanPreviewPreview.work = {
  for: (id) =>
    ({
      proposed: { cut: [], at: null, paused: false },
      edited: { cut: [3], at: null, paused: false },
      running: { cut: [], at: 1, paused: false },
      paused: { cut: [], at: 2, paused: true },
      done: { cut: [], at: PLAN.length, paused: false },
    })[id] ?? { cut: [], at: null, paused: false },

  state: (w) => {
    if (w.at === null) return w.cut.length ? "edited" : "proposed";
    if (w.paused) return "paused";
    return w.at >= PLAN.length - w.cut.length ? "done" : "running";
  },

  tick: (w) =>
    w.at === null || w.paused || w.at >= PLAN.length - w.cut.length
      ? null
      : { work: { ...w, at: w.at + 1 }, in: STEP_TIME },
};

// ── Spoken ──────────────────────────────────────────────────────────────────
//
// Same `work`: which steps were cut, how far a run has got, whether it is held.
//
// Four steps cannot be listed and edited out loud — reading them takes longer
// than doing two of them, and "remove the fourth" needs a fourth somebody can
// count to. So the plan compresses to two facts: how many steps, and which ones
// cannot be undone. That second half is not a summary, it is the whole review:
// the pattern exists because "cancel 3 subscriptions" hides the step that emails
// three companies, and naming only the irreversible ones is the shortest form of
// that argument that still makes it.
function PlanVoice({ work, set }) {
  const { cut, at, paused } = work;
  const steps = PLAN.filter((_, i) => !cut.includes(i));
  const risky = steps.filter((s) => s.risk);
  const done = at !== null && at >= steps.length;

  if (at !== null) {
    return (
      <VoiceStage
        device="Kitchen speaker"
        mood={done ? "rest" : paused ? "rest" : "thinking"}
        heard={paused ? "Hold on" : "Go ahead"}
        caption={
          done
            ? "All done. You'll save £27 a month."
            : paused
              ? `Held at step ${at + 1}. Nothing's been cancelled.`
              : `Step ${at + 1} of ${steps.length}.`
        }
      >
        {!done && (
          <Btn
            variant={paused ? "primary" : "danger"}
            onClick={() => set({ ...work, paused: !paused })}
          >
            {paused ? "Carry on" : "Hold on"}
          </Btn>
        )}
        {paused && !done && (
          <Btn onClick={() => set({ ...work, at: null, paused: false })}>Stop altogether</Btn>
        )}
      </VoiceStage>
    );
  }

  return (
    <VoiceStage
      device="Kitchen speaker"
      mood="speaking"
      heard="Cancel the ones I don't use"
      /* How many, and only the ones that can't be taken back. Reading all four
         costs more than doing two of them. */
      caption={
        risky.length === 0
          ? `${steps.length} steps, and all of them can be undone.`
          : `${steps.length} steps. ${risky.length === 1 ? "One of them can't" : "Two of them can't"} be undone — ${risky
              .map((s) => s.label.toLowerCase())
              .join(", and ")}.`
      }
    >
      <Btn variant="primary" onClick={() => set({ ...work, at: 0, paused: false })}>
        Go ahead
      </Btn>
      {/* Editing by naming the risky step, because it is the one the reader has
          just been told about and so the only one they can refer to. */}
      {risky.length > 0 && (
        <Btn onClick={() => set({ ...work, cut: [...cut, PLAN.indexOf(risky[risky.length - 1])] })}>
          Skip the last one
        </Btn>
      )}
      {cut.length > 0 && <Btn onClick={() => set({ ...work, cut: [] })}>Put them all back</Btn>}
    </VoiceStage>
  );
}

PlanPreviewPreview.surfaces = { voice: PlanVoice };
