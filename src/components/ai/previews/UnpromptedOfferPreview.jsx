import { Fragment } from "react";
import { Body, Btn, Btns, Chip, Field, Frame, FrameBar, Label, Note, Part, Row, Say } from "./kit.jsx";
import { VoiceStage } from "./voice.jsx";
import { Board, Obj, OnObject } from "./canvas.jsx";

// Heads-Up on a subscription that quietly went up in price.
//
// The pattern's whole argument is about the state nobody designs — the one
// where there is nothing to say. So the opening frame is the ordinary product
// screen with no AI anywhere on it, and the offer arrives on the tick a few
// seconds later. That sequence is the pattern: a preview that opened on the
// offer would be drawing a notification, and a notification is what this is
// trying not to be.
//
// The price rise is the right subject because the value is entirely in the
// noticing. Nobody re-reads fourteen subscription lines every month, and the
// product does — which is the only honest reason to speak first.
const LINES = [
  { name: "Disney+", was: "£7.99", now: "£10.99" },
  { name: "Spotify", now: "£11.99" },
  { name: "Gym membership", now: "£32.00" },
];

const NOTICED = "Disney+ went from £7.99 to £10.99 in February";
const SINCE = "Three months at the higher price so far — £9.00 more than before.";

export function UnpromptedOfferPreview({ work, set }) {
  const { noticed, took, waved, busy, off } = work;

  // Badly timed is drawn on a different screen on purpose. The offer is not
  // wrong here — it is the same sentence, word for word — and what makes it a
  // failure is the half-finished payment underneath it. Drawing it on the
  // subscriptions list would have shown a tidier version of the same success.
  if (busy) {
    return (
      <Frame width={540}>
        <FrameBar title="New payment · £240.00" />
        <Body>
          <Label>To</Label>
          <Field value="Northwind Ltd" />
          <Label>Reference</Label>
          <Field placeholder="Invoice number" />
          <Part name="Banner" block>
            <Note
              kind="Noticed"
              title={NOTICED}
              actions={
                <Part name="Button">
                  <Btns align="end">
                    <Btn onClick={() => set({ ...work, busy: false, waved: true })}>Not now</Btn>
                  </Btns>
                </Part>
              }
            >
              {SINCE}
            </Note>
          </Part>
        </Body>
      </Frame>
    );
  }

  return (
    <Frame width={540}>
      <FrameBar title="Subscriptions · 14 active" />
      <Body>
        <span className="mk-scope-head">
          <Label>This month</Label>
          <Chip>£84.31</Chip>
        </span>

        {/* The offer hangs off the line it is about, rather than floating over
            the whole list. This pattern's second decision — lead with what you
            noticed, then what you suggest — stops being a matter of wording
            when the reason is the row directly above the suggestion; and its
            own canvas answer already argued exactly this, which the screen
            drawing was quietly contradicting. */}
        <div className="mk-list">
          {LINES.map((l, i) => {
            const subject = Boolean(l.was);
            return (
              <Fragment key={l.name}>
                <Part name={i === 0 ? "List Item" : null} block>
                  <Row lead={subject && noticed && !waved && !took}>
                    <span className="mk-money">
                      <span className="mk-money-name">
                        {l.was ? `${l.name} · was ${l.was}` : l.name}
                      </span>
                      {subject && took && <span className="mk-money-mark">In review</span>}
                      <span className="mk-money-amt">{l.now}</span>
                    </span>
                  </Row>
                </Part>

                {subject && noticed && !took && !waved && (
                  <div className="mk-attach">
                    <Part name="Banner" block>
                      <Note
                        kind="Noticed"
                        title={NOTICED}
                        actions={
                          <Part name="Button">
                            <Btns align="end">
                              <Btn onClick={() => set({ ...work, waved: true })}>Not now</Btn>
                              <Btn variant="primary" onClick={() => set({ ...work, took: true })}>
                                Move it to review
                              </Btn>
                            </Btns>
                          </Part>
                        }
                      >
                        {SINCE}
                      </Note>
                    </Part>
                  </div>
                )}

                {/* The off switch lives where the dismissal happened, on the
                    line it was about — this is the one moment somebody has
                    just proved they want it, and a setting three screens away
                    is one nobody finds again to undo. */}
                {subject && waved && (
                  <div className="mk-attach" data-quiet="">
                    <Say tone="mute" size="sm">
                      {off
                        ? "Price rises are off. Turn them back on from this line."
                        : "Price rises won't come up again for Disney+."}
                    </Say>
                    {!off && (
                      <Part name="Button">
                        <Btns align="end">
                          <Btn onClick={() => set({ ...work, off: true })}>Turn price rises off</Btn>
                        </Btns>
                      </Part>
                    )}
                  </div>
                )}
              </Fragment>
            );
          })}
        </div>
      </Body>
    </Frame>
  );
}

// Nothing to say is the resting position, so `for` returns it with everything
// off — and the tick is what makes the pattern legible: the canvas opens on an
// ordinary screen and the product speaks first, unasked, a few seconds later.
UnpromptedOfferPreview.work = {
  for: (id) =>
    ({
      quiet: { noticed: false, took: false, waved: false, busy: false, off: false },
      offered: { noticed: true, took: false, waved: false, busy: false, off: false },
      mistimed: { noticed: true, took: false, waved: false, busy: true, off: false },
      taken: { noticed: true, took: true, waved: false, busy: false, off: false },
      dismissed: { noticed: true, took: false, waved: true, busy: false, off: false },
    })[id] ?? { noticed: false, took: false, waved: false, busy: false, off: false },

  state: (w) =>
    !w.noticed ? "quiet" : w.busy ? "mistimed" : w.took ? "taken" : w.waved ? "dismissed" : "offered",

  // The only move the system makes, and it is the whole pattern. Badly timed is
  // never on it: an offer that lands on somebody's half-finished payment by
  // itself would teach that interrupting is the ordinary course, which is the
  // opposite of what this says.
  tick: (w) => (w.noticed ? null : { work: { ...w, noticed: true }, in: 2800 }),
};

// ── Spoken ──────────────────────────────────────────────────────────────────
//
// Same `work`. This surface makes the pattern's cost visible, because there is
// exactly one channel and speaking first takes all of it. On a screen an offer
// can be ignored at a glance; out loud it has already been spent by the time
// anybody decides.
//
// So the quiet state has no caption at all. That is not an empty drawing — it
// is the honest one, and it is the only state on any surface in this hub where
// the right answer is that the product says nothing.
function OfferVoice({ work, set }) {
  const { noticed, took, waved, busy, off } = work;

  if (busy) {
    return (
      <VoiceStage
        device="Kitchen speaker"
        mood="speaking"
        heard="…and sixty, forty-two, and—"
        caption={`${NOTICED}.`}
      >
        <Btn onClick={() => set({ ...work, busy: false, waved: true })}>Not now</Btn>
      </VoiceStage>
    );
  }

  if (took) {
    return <VoiceStage device="Kitchen speaker" mood="rest" caption="Moved to review." />;
  }

  if (waved) {
    return (
      <VoiceStage
        device="Kitchen speaker"
        mood="rest"
        caption={
          off
            ? "Price rises are off. Say “price alerts on” to bring them back."
            : "Not mentioning that one again. Turn price rises off altogether?"
        }
      >
        {!off && <Btn onClick={() => set({ ...work, off: true })}>Turn them off</Btn>}
      </VoiceStage>
    );
  }

  if (noticed) {
    return (
      <VoiceStage
        device="Kitchen speaker"
        mood="speaking"
        caption={`${NOTICED}. Move it to review?`}
      >
        <Btn onClick={() => set({ ...work, waved: true })}>No</Btn>
        <Btn variant="primary" onClick={() => set({ ...work, took: true })}>
          Yes
        </Btn>
      </VoiceStage>
    );
  }

  return <VoiceStage device="Kitchen speaker" mood="rest" />;
}

UnpromptedOfferPreview.surfaces = { voice: OfferVoice };

// ── On a canvas ─────────────────────────────────────────────────────────────
//
// Same `work`. The offer attaches to the object it is about, which settles the
// pattern's second decision — lead with what you noticed — as a matter of
// position rather than of wording. There is no order to get wrong when the
// reason and the suggestion are in the same glance.
//
// It also changes what a dismissal means. Waving one off on a board is said
// about that object, because the thing being detached is attached to something.
function OfferCanvas({ work, set }) {
  const { noticed, took, waved, busy, off } = work;

  if (busy) {
    return (
      <Board title="Board · Subscriptions">
        {/* Selected and mid-move. Nothing is lost when it lands here — the work
            still stops, which is the whole of the cost. */}
        <Obj label="Gym membership" meta="£32.00" selected>
          <OnObject>
            <span className="cv-layer">{NOTICED}</span>
            <Btns align="end">
              <Btn onClick={() => set({ ...work, busy: false, waved: true })}>Not now</Btn>
            </Btns>
          </OnObject>
        </Obj>
      </Board>
    );
  }

  return (
    <Board title="Board · Subscriptions">
      {LINES.map((l) => {
        const subject = Boolean(l.was);
        return (
          <Obj
            key={l.name}
            label={l.name}
            meta={l.now}
            tone={subject && took ? "next" : undefined}
          >
            {subject && took && <span className="cv-layer" data-tone="next">In review</span>}
            {subject && noticed && !took && !waved && (
              <OnObject>
                <span className="cv-layer">{`Up from ${l.was} in February`}</span>
                <Btns align="end">
                  <Btn onClick={() => set({ ...work, waved: true })}>Not now</Btn>
                  <Btn variant="primary" onClick={() => set({ ...work, took: true })}>
                    Move to review
                  </Btn>
                </Btns>
              </OnObject>
            )}
          </Obj>
        );
      })}

      {waved && (
        <span className="cv-foot">
          <Say tone="mute" size="sm">
            {off ? "Price rises are off for the board" : "Detached from Disney+"}
          </Say>
          {!off && (
            <Btns align="end">
              <Btn onClick={() => set({ ...work, off: true })}>Turn price rises off</Btn>
            </Btns>
          )}
        </span>
      )}
    </Board>
  );
}

UnpromptedOfferPreview.surfaces.canvas = OfferCanvas;
