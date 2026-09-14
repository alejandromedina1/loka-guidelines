import { Body, Btn, Btns, Chip, Diff, Frame, FrameBar, Label, Note, Row, Say } from "./kit.jsx";
import { Handoff, VoiceStage } from "./voice.jsx";

// Undo & History on one payment. The failure it guards against is quiet: once
// automatic changes are logged as "System", nobody knows which ones to check.
//
// The trail is walked rather than posed. Open any entry to see what it changed,
// ask an automatic one what it could see, pick a point and go back to it — and
// going back writes a new entry into the trail you are looking at, which is the
// pattern's own rule about undo and the one thing a static frame cannot show.
const TRAIL = [
  {
    id: "cat",
    who: "Auto-sort",
    ai: true,
    what: "Set category · Groceries",
    when: "16:04",
    from: "Category — Shopping",
    to: "Category — Groceries",
    saw: "The receipt photo, your last 6 payments here",
    by: "A new payment landing",
  },
  {
    id: "name",
    who: "Sam",
    ai: false,
    what: "Renamed to Sainsbury's Local",
    when: "14:22",
    from: "Name — SAINSBURYS LOCAL 4471",
    to: "Name — Sainsbury's Local",
  },
  {
    id: "shop",
    who: "Auto-sort",
    ai: true,
    what: "Read the shop name off the receipt",
    when: "09:15",
    from: "Name — (empty)",
    to: "Name — SAINSBURYS LOCAL 4471",
    saw: "The receipt photo",
    by: "A photo being attached",
  },
];

export function VersionHistoryPreview({ work, set }) {
  const { open, why, restoring, undone } = work;
  const entry = TRAIL.find((e) => e.id === open) ?? null;
  const target = TRAIL.find((e) => e.id === restoring) ?? null;
  // Going back writes an entry rather than removing one. Every automatic change
  // is still named and still attributed — which is the whole argument.
  const trail = undone
    ? [{ id: "undo", who: "You", ai: false, what: `Went back to ${undone}`, when: "16:12" }, ...TRAIL]
    : TRAIL;

  const back = () => set({ ...work, open: null, why: false, restoring: null });

  if (target) {
    return (
      <Frame width={540}>
        <FrameBar title="Sainsbury's · £48.20" />
        <Body>
          <Note tone="plain" title={`Going back to ${target.when}`}>
            {TRAIL.indexOf(target) === 1
              ? "This adds a new entry. The change above it stays in the record."
              : `This adds a new entry. The ${TRAIL.indexOf(target)} changes above it stay in the record.`}
          </Note>
          <span className="mk-foot">
            <Say tone="mute" size="sm">
              Logged as a new entry
            </Say>
            <Btns align="end">
              <Btn onClick={back}>Cancel</Btn>
              <Btn
                variant="primary"
                onClick={() => set({ open: null, why: false, restoring: null, undone: target.when })}
              >
                Confirm
              </Btn>
            </Btns>
          </span>
        </Body>
      </Frame>
    );
  }

  if (entry) {
    return (
      <Frame width={540}>
        <FrameBar title="Sainsbury's · £48.20" />
        <Body>
          <Label>
            {entry.who} · {entry.when}
          </Label>
          <Diff from={entry.from} to={entry.to} />

          {/* What an automatic change could see when it made the decision. Only
              an automatic one can be asked: a person's change has a person
              behind it, and "what could Sam see" is a different question with a
              different answer. */}
          {why && entry.ai && (
            <div className="mk-source">
              <span className="mk-source-head">
                <Label>{entry.who}</Label>
                <Chip>Ran at {entry.when}</Chip>
              </span>
              <div className="mk-params">
                <Row>
                  <span className="mk-param">
                    <span className="mk-param-key">Could see</span>
                    <span className="mk-param-val">{entry.saw}</span>
                  </span>
                </Row>
                <Row>
                  <span className="mk-param">
                    <span className="mk-param-key">Set off by</span>
                    <span className="mk-param-val">{entry.by}</span>
                  </span>
                </Row>
              </div>
            </div>
          )}

          <span className="mk-foot">
            <Say tone="mute" size="sm">
              {entry.ai ? "Automatic — it can say why" : "Changed by a person"}
            </Say>
            <Btns align="end">
              <Btn onClick={back}>Back</Btn>
              {entry.ai && (
                <Btn onClick={() => set({ ...work, why: !why })}>
                  {why ? "Hide why" : "Why it changed"}
                </Btn>
              )}
              <Btn variant="primary" onClick={() => set({ ...work, restoring: entry.id })}>
                Go back to here
              </Btn>
            </Btns>
          </span>
        </Body>
      </Frame>
    );
  }

  return (
    <Frame width={540}>
      <FrameBar title="Sainsbury's · £48.20" />
      <Body>
        <span className="mk-scope-head">
          <Label>Last 30 days</Label>
          <Chip>
            {trail.filter((e) => e.ai).length} automatic · {trail.filter((e) => !e.ai).length} person
          </Chip>
        </span>
        <div className="mk-list">
          {trail.map((e) => (
            <Row
              key={e.id}
              lead={e.ai}
              tone={e.ai ? undefined : "mute"}
              onClick={e.from ? () => set({ ...work, open: e.id, why: false }) : undefined}
              label={`Open ${e.who} · ${e.when}`}
            >
              <span className="mk-hist">
                <span className="mk-hist-who">{e.who}</span>
                <span className="mk-hist-what">{e.what}</span>
                <span className="mk-hist-when">{e.when}</span>
              </span>
            </Row>
          ))}
        </div>
        <span className="mk-foot">
          <Say tone="mute" size="sm">
            30 days, and it means 30 days
          </Say>
          <Btns align="end">
            <Btn>Compare</Btn>
            <Btn variant="primary" onClick={() => set({ ...work, restoring: TRAIL[1].id })}>
              Go back to a point
            </Btn>
          </Btns>
        </span>
      </Body>
    </Frame>
  );
}

VersionHistoryPreview.work = {
  for: (id) =>
    ({
      trail: { open: null, why: false, restoring: null, undone: null },
      diff: { open: "cat", why: false, restoring: null, undone: null },
      attributed: { open: "cat", why: true, restoring: null, undone: null },
      restore: { open: null, why: false, restoring: "name", undone: null },
    })[id] ?? { open: null, why: false, restoring: null, undone: null },

  state: (w) => {
    if (w.restoring) return "restore";
    if (w.open) return w.why ? "attributed" : "diff";
    return "trail";
  },
};

// ── Spoken ──────────────────────────────────────────────────────────────────
//
// Same `work`: which entry is open, whether it has been asked to explain itself,
// whether a restore is being confirmed.
//
// What changes is reach. "Undo that" is the whole of what this surface can
// address — it means the last thing, and there is no way to say "the third one
// down" without reading the list first. So going further back leaves.
//
// What does *not* change is the pattern's own argument, and it survives intact:
// an automatic change has to be named and has to be able to say what it could
// see. A log that reads back "System changed it" is as useless spoken as
// written, and out loud it is the only thing there is.
function HistoryVoice({ work, set }) {
  const { open, why, restoring } = work;
  const entry = TRAIL.find((e) => e.id === open) ?? null;
  const target = TRAIL.find((e) => e.id === restoring) ?? null;

  if (target) {
    return (
      <VoiceStage
        device="Watch"
        mood="speaking"
        heard="Put it back how it was"
        caption={`Back to ${target.when}, before ${TRAIL.indexOf(target)} change${TRAIL.indexOf(target) === 1 ? "" : "s"}. That gets logged too.`}
      >
        <Btn variant="primary" onClick={() => set({ open: null, why: false, restoring: null, undone: target.when })}>
          Do it
        </Btn>
        <Btn onClick={() => set({ ...work, restoring: null })}>Leave it</Btn>
      </VoiceStage>
    );
  }

  if (entry) {
    return (
      <VoiceStage
        device="Watch"
        mood="speaking"
        heard={why ? "How did it know?" : "What changed?"}
        /* Named, not "System". The pattern's whole failure mode is a log that
           can't tell you which changes to re-check, and that failure is worse
           here — there is no column to scan for the automatic ones. */
        caption={
          why
            ? `${entry.saw}. It ran when a new payment landed.`
            : `${entry.who} set the category to Groceries at ${entry.when}. It was Shopping before.`
        }
      >
        {entry.ai && !why && <Btn onClick={() => set({ ...work, why: true })}>How did it know?</Btn>}
        <Btn variant="primary" onClick={() => set({ ...work, restoring: entry.id })}>
          Undo that
        </Btn>
      </VoiceStage>
    );
  }

  return (
    <VoiceStage
      device="Watch"
      mood="listening"
      heard="What's been happening to this payment?"
      caption="Three changes in the last day. Two of them automatic."
    >
      {/* The last one, and only the last one — "the third one down" needs a
          list to count down, and there isn't one. */}
      <Btn variant="primary" onClick={() => set({ ...work, open: TRAIL[0].id, why: false })}>
        What was the last one?
      </Btn>
      <Handoff to="Sent to your phone">
        Anything further back than the last change needs the list itself, and a list is what
        this surface can't hand somebody.
      </Handoff>
    </VoiceStage>
  );
}

VersionHistoryPreview.surfaces = { voice: HistoryVoice };
