import { Body, Btn, Btns, Frame, FrameBar, Label, Note, Part, Say } from "./kit.jsx";
import { VoiceStage } from "./voice.jsx";

// Spending Limits on a run that reconciles six years of statements — the kind
// of job that can loop, and where a loop is an invoice.
//
// Three ceilings, drawn as three meters, because people think in money and runs
// actually fail on steps. Naming which one will bite FIRST is the whole design:
// it turns a limit from something that arrives as a surprise into something
// somebody can predict before pressing go.
//
// Not No Good Match's gauge. That draws candidates under a bar nothing clears,
// vertically, and the subject there is a threshold nothing reaches. Here the
// subject is three budgets being consumed, so it runs horizontally and every
// bar fills.
const CAPS = [
  { key: "steps", label: "Steps", cap: 200, unit: (n) => `${n}` },
  { key: "time", label: "Time", cap: 10, unit: (n) => `${n} min` },
  { key: "money", label: "Money", cap: 4, unit: (n) => `£${n.toFixed(2)}` },
];

// Which ceiling gets there first, as a fraction of itself. This is the number
// the whole pattern turns on and it is computed, never authored — a named
// "binding" ceiling that drifted from the meters would be worse than none.
const binding = (spent) =>
  CAPS.reduce((a, c) => (spent[c.key] / c.cap > spent[a.key] / a.cap ? c : a), CAPS[0]);

function Meter({ c, spent, bind }) {
  const pct = Math.min(100, Math.round((spent / c.cap) * 100));
  return (
    <span className="mk-cap" data-bind={bind ? "" : undefined}>
      <span className="mk-cap-head">
        <Label>{c.label}</Label>
        {/* Against the ceiling, never a bare total. "£4" means nothing; "£4 of
            £10" is the only form somebody can decide from mid-run. */}
        <span className="mk-cap-num">{`${c.unit(spent)} of ${c.unit(c.cap)}`}</span>
      </span>
      <span className="mk-cap-bar">
        <span className="mk-cap-fill" style={{ width: `${pct}%` }} />
      </span>
      {bind && <span className="mk-cap-note">Reaches its ceiling first</span>}
    </span>
  );
}

export function SpendingLimitsPreview({ work, set }) {
  const { spent, started, stopped, raised } = work;
  const b = binding(spent);
  const near = spent[b.key] / b.cap >= 0.75 && !stopped;

  return (
    <Frame width={540}>
      <FrameBar title="Reconcile 6 years of statements" />
      <Body>
        {!started && (
          <Part name="Alert" block>
            <Note kind="Before it starts" title="It stops at whichever of these it reaches first">
              Nothing runs past these. You can raise one later.
            </Note>
          </Part>
        )}

        {stopped && (
          <Part name="Alert" block>
            <Note
              tone="warn"
              kind="Stopped"
              title={`It reached the ${b.label.toLowerCase()} ceiling`}
              actions={
                <Part name="Button">
                  <Btns align="end">
                    <Btn>Keep what it got</Btn>
                    <Btn variant="primary" onClick={() => set({ ...work, stopped: false, raised: true })}>
                      Give it £2 more
                    </Btn>
                  </Btns>
                </Part>
              }
            >
              {/* Stopped, not failed, and what it bought is kept. A ceiling that
                  discards its own work charges for the run and delivers nothing. */}
              4 of 6 years are reconciled and saved.
            </Note>
          </Part>
        )}

        {near && (
          <Part name="Alert" block>
            <Note
              tone="warn"
              kind="Close"
              title={`About a minute of ${b.label.toLowerCase()} left`}
              actions={
                <Btns align="end">
                  <Btn onClick={() => set({ ...work, stopped: true })}>Let it stop</Btn>
                  <Btn variant="primary" onClick={() => set({ ...work, raised: true })}>
                    Raise it to £6
                  </Btn>
                </Btns>
              }
            >
              Enough left to decide, which is the point of saying so now.
            </Note>
          </Part>
        )}

        <div className="mk-caps">
          {CAPS.map((c, i) => (
            <Part key={c.key} name={i === 0 ? "Progress Bar" : null} block>
              <Meter
                c={raised && c.key === "money" ? { ...c, cap: 6 } : c}
                spent={spent[c.key]}
                bind={c.key === b.key}
              />
            </Part>
          ))}
        </div>

        <span className="mk-foot">
          <Say tone="mute" size="sm">
            {raised ? "Raised to £6 — a number, not “no limit”" : "Whichever it reaches first"}
          </Say>
          {/* Empty once it has stopped — the way on is in the note then. */}
          <Part name={stopped ? null : "Button"}>
            <Btns align="end">
              {!started && (
                <Btn variant="primary" onClick={() => set({ ...work, started: true })}>
                  Start it
                </Btn>
              )}
              {started && !stopped && <Btn>Stop now</Btn>}
            </Btns>
          </Part>
        </span>
      </Body>
    </Frame>
  );
}

SpendingLimitsPreview.work = {
  for: (id) =>
    ({
      set: { spent: { steps: 0, time: 0, money: 0 }, started: false, stopped: false, raised: false },
      inside: { spent: { steps: 48, time: 2, money: 0.9 }, started: true, stopped: false, raised: false },
      near: { spent: { steps: 120, time: 7, money: 3.2 }, started: true, stopped: false, raised: false },
      hit: { spent: { steps: 141, time: 9, money: 4 }, started: true, stopped: true, raised: false },
      raised: { spent: { steps: 150, time: 9, money: 4.4 }, started: true, stopped: false, raised: true },
    })[id] ?? { spent: { steps: 0, time: 0, money: 0 }, started: false, stopped: false, raised: false },

  state: (w) => {
    if (!w.started) return "set";
    if (w.raised) return "raised";
    if (w.stopped) return "hit";
    const b = binding(w.spent);
    return w.spent[b.key] / b.cap >= 0.75 ? "near" : "inside";
  },

  // Spend accruing is the system's own move, and it is the thing that makes a
  // ceiling mean anything. It runs up to the warning and then waits: hitting
  // the ceiling is a decision point, not something the demo does to you.
  tick: (w) => {
    if (!w.started || w.stopped || w.raised) return null;
    const b = binding(w.spent);
    if (w.spent[b.key] / b.cap >= 0.75) return null;
    return {
      work: {
        ...w,
        spent: {
          steps: w.spent.steps + 24,
          time: w.spent.time + 1.4,
          money: Number((w.spent.money + 0.58).toFixed(2)),
        },
      },
      in: 1100,
    };
  },
};

// ── Spoken ──────────────────────────────────────────────────────────────────
//
// Same `work`. Three numbers against three ceilings is not a sayable thing, so
// one becomes the headline — the one about to bite — and the other two only
// arrive if somebody asks. Silence while it runs is not a shortcut here: a
// device reading spend aloud as it accrues is the most annoying thing this
// pattern could do.
function LimitsVoice({ work, set }) {
  const { spent, started, stopped, raised } = work;
  const b = binding(spent);

  if (!started)
    return (
      <VoiceStage
        device="Kitchen speaker"
        mood="speaking"
        caption="It'll stop at ten minutes, four pounds or two hundred steps — whichever comes first."
      >
        <Btn variant="primary" onClick={() => set({ ...work, started: true })}>Go on</Btn>
      </VoiceStage>
    );

  if (stopped)
    return (
      <VoiceStage
        device="Kitchen speaker"
        mood="stopped"
        caption="Stopped at four pounds. Four of the six years are done — two more would be about two pounds."
      >
        <Btn variant="primary" onClick={() => set({ ...work, stopped: false, raised: true })}>
          Do it
        </Btn>
      </VoiceStage>
    );

  if (raised)
    return <VoiceStage device="Kitchen speaker" mood="thinking" caption="Six pounds now. Carrying on." />;

  if (spent[b.key] / b.cap >= 0.75)
    return (
      <VoiceStage
        device="Kitchen speaker"
        mood="speaking"
        caption="Three pounds twenty of four. About a minute left before it stops."
      >
        <Btn onClick={() => set({ ...work, stopped: true })}>Let it stop</Btn>
        <Btn variant="primary" onClick={() => set({ ...work, raised: true })}>Make it six</Btn>
      </VoiceStage>
    );

  return <VoiceStage device="Kitchen speaker" mood="thinking" />;
}

SpendingLimitsPreview.surfaces = { voice: LimitsVoice };

// No canvas variant: the pattern holds there unchanged. A ceiling is a number
// and a run against it, and neither becomes a different question because the
// output is an object rather than a page — so a second drawing would contradict
// the verdict rather than illustrate it.
