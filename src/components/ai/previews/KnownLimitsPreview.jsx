import { Body, Btn, Btns, Frame, FrameBar, Label, Note, Part, Say } from "./kit.jsx";
import { VoiceStage } from "./voice.jsx";
import { Board, Obj, OnObject } from "./canvas.jsx";

// Known Limits on the money product. The drawing's subject is FRESHNESS PER
// SOURCE, because "up to date" is not a claim anybody can act on and one stale
// source inside five current ones is invisible under a single label.
//
// The pattern has two homes and the wireframe shows both: a place somebody can
// look it up, and the same fact delivered at the moment it bites. The second is
// the one that changes behaviour — a page alone only ever reaches the people
// who were already being careful.
const SOURCES = [
  { name: "Current account", when: "2 minutes ago", ok: true },
  { name: "Joint account", when: "2 minutes ago", ok: true },
  { name: "Credit card", when: "yesterday, 23:00", ok: true },
  { name: "Savings", when: "9 days ago", ok: false, why: "The bank changed its login" },
];
const CANT = [
  "Move money between accounts",
  "See anything before 2019",
  "Read statements you haven't uploaded",
];

export function KnownLimitsPreview({ work, set }) {
  const { open, edge, stale } = work;

  // The moment it bites. The same facts as the page, delivered where somebody
  // has just asked for something outside the edge — which is where the pattern
  // actually does its work.
  if (edge) {
    return (
      <Frame width={540}>
        <FrameBar title="Move £200 to savings" />
        <Body>
          <Part name="Banner" block>
            <Note
              kind="Outside what it does"
              title="It can read your accounts, not move money between them"
              actions={
                <Btns align="end">
                  <Btn onClick={() => set({ ...work, edge: false, open: "cant" })}>What else can&apos;t it do?</Btn>
                  <Btn variant="primary">Open your bank</Btn>
                </Btns>
              }
            >
              Nothing was moved, and nothing was queued.
            </Note>
          </Part>
        </Body>
      </Frame>
    );
  }

  // Findable, and not in the way. A limits page nobody opens is the same as no
  // limits page; a banner on every screen is worse than both. So the resting
  // state is the ordinary product screen with one quiet line on it.
  if (!open) {
    return (
      <Frame width={540}>
        <FrameBar title="Accounts" />
        <Body>
          <div className="mk-list">
            {SOURCES.slice(0, 3).map((s, i) => (
              <Part key={s.name} name={i === 0 ? "List Item" : null} block>
                <span className="mk-lim-row">
                  <span className="mk-lim-name">{s.name}</span>
                  <span className="mk-lim-when">{s.when}</span>
                </span>
              </Part>
            ))}
          </div>
          <span className="mk-foot">
            <Say tone="mute" size="sm">One line, on the screen it applies to</Say>
            <Btns align="end">
              <Btn onClick={() => set({ ...work, open: "reach" })}>What this can see and do</Btn>
            </Btns>
          </span>
        </Body>
      </Frame>
    );
  }

  return (
    <Frame width={540}>
      <FrameBar title="What this can see and do" />
      <Body>
        {open === "cant" ? (
          <>
            {/* Stated as things, not as regret. A list of capabilities with no
                matching list of gaps is marketing, and people fill an unstated
                gap with an assumption more generous than the truth. */}
            <Label>What it can&apos;t do</Label>
            <div className="mk-list">
              {CANT.map((c, i) => (
                <Part key={c} name={i === 0 ? "List Item" : null} block>
                  <span className="mk-lim-row" data-no="">
                    <span className="mk-lim-name">{c}</span>
                    <span className="mk-lim-kind">No</span>
                  </span>
                </Part>
              ))}
            </div>
          </>
        ) : (
          <>
            <Label>What it reads, and when it last did</Label>
            <div className="mk-list">
              {SOURCES.map((s, i) => {
                const bad = !s.ok && stale;
                return (
                  <Part key={s.name} name={i === 0 ? "List Item" : null} block>
                    <span className="mk-lim-row" data-stale={bad ? "" : undefined}>
                      <span className="mk-lim-name">
                        {s.name}
                        {bad && <span className="mk-lim-why">{s.why}</span>}
                      </span>
                      {/* Per source, with a date. One stale source among five
                          current ones is invisible under a single label. */}
                      <span className="mk-lim-when">{bad ? s.when : s.ok ? s.when : "2 minutes ago"}</span>
                      <span className="mk-lim-kind">{bad ? "Stale" : "Current"}</span>
                    </span>
                  </Part>
                );
              })}
            </div>

            {stale && (
              <Part name="Banner" block>
                <Note tone="warn" kind="Marked on the answers" title="Savings hasn't refreshed since the 21st">
                  Answers that use it say so.
                </Note>
              </Part>
            )}
          </>
        )}

        <span className="mk-foot">
          <Say tone="mute" size="sm">
            {open === "cant" ? "Reviewed 3 October" : "Checked 14:02"}
          </Say>
          <Btns align="end">
            <Btn onClick={() => set({ ...work, open: open === "cant" ? "reach" : "cant" })}>
              {open === "cant" ? "What it can see" : "What it can't do"}
            </Btn>
          </Btns>
        </span>
      </Body>
    </Frame>
  );
}

KnownLimitsPreview.work = {
  for: (id) =>
    ({
      resting: { open: null, edge: false, stale: false },
      reach: { open: "reach", edge: false, stale: false },
      cant: { open: "cant", edge: false, stale: false },
      atedge: { open: null, edge: true, stale: false },
      stale: { open: "reach", edge: false, stale: true },
    })[id] ?? { open: null, edge: false, stale: false },

  state: (w) =>
    w.edge ? "atedge" : w.stale ? "stale" : w.open === "cant" ? "cant" : w.open === "reach" ? "reach" : "resting",

  // No tick. A source going stale is a failure and failures are never on the
  // timer — and a limits page that rearranged itself while somebody read it
  // would be teaching the opposite of what it is for.
};

// ── Spoken ──────────────────────────────────────────────────────────────────
//
// Same `work`. A list of limits cannot be recited, so this surface can only
// answer the question actually asked — which means the whole pattern collapses
// into the one state where it bites. That is the strongest argument anywhere in
// the hub that the edge matters more than the page.
function LimitsVoice({ work, set }) {
  const { open, edge, stale } = work;

  if (edge)
    return (
      <VoiceStage
        device="Kitchen speaker"
        mood="speaking"
        heard="Move two hundred to savings"
        caption="It can read your accounts but not move money. Nothing was moved."
      >
        <Btn onClick={() => set({ ...work, edge: false, open: "cant" })}>What else?</Btn>
      </VoiceStage>
    );

  if (stale)
    return (
      <VoiceStage
        device="Kitchen speaker"
        mood="speaking"
        caption="One thing first — the savings figure is nine days old. The bank changed its login."
      />
    );

  if (open === "cant")
    return (
      <VoiceStage
        device="Kitchen speaker"
        mood="speaking"
        heard="What can't you do?"
        caption="Three things: move money, anything before 2019, and statements you haven't uploaded."
      />
    );

  if (open === "reach")
    return (
      <VoiceStage
        device="Kitchen speaker"
        mood="speaking"
        heard="How fresh is the credit card?"
        caption="Last night at eleven. The two current accounts are from two minutes ago."
      />
    );

  return <VoiceStage device="Kitchen speaker" mood="rest" />;
}

KnownLimitsPreview.surfaces = { voice: LimitsVoice };

// ── On a canvas ─────────────────────────────────────────────────────────────
//
// Same `work`. The edge is a region of the board rather than a sentence
// somebody has to remember, so what it cannot do is a PLACE — an absence with
// an edge. Dragging something past that edge is the moment it bites, and the
// edge is already drawn, so nothing has to be explained when it happens.
function LimitsCanvas({ work, set }) {
  const { open, edge, stale } = work;

  return (
    <Board title="Board · What it reaches">
      <span className="cv-regions">
        <span className="cv-region" data-on="">
          Inside what it reads
        </span>
        <span className="cv-region" data-none="">
          Outside — yours to do
        </span>
      </span>

      {SOURCES.slice(0, 3).map((s) => (
        <Obj key={s.name} label={s.name} meta={s.when} tone="next">
          <span className="cv-layer" data-tone="next">Inside the edge</span>
        </Obj>
      ))}

      <Obj label="Savings" meta={stale ? "9 days old" : "2 minutes ago"} tone={stale ? undefined : "next"}>
        <span className="cv-layer" data-provisional={stale ? "" : undefined} data-tone={stale ? undefined : "next"}>
          {stale ? "The bank changed its login" : "Inside the edge"}
        </span>
      </Obj>

      <Obj label="Move £200" meta="Outside" selected={edge}>
        <span className="cv-layer" data-provisional>Past the edge — nothing happened</span>
        {edge && (
          <OnObject>
            <Btns align="end">
              <Btn variant="primary" onClick={() => set({ ...work, edge: false })}>Open your bank</Btn>
            </Btns>
          </OnObject>
        )}
      </Obj>

      <span className="cv-foot">
        <Say tone="mute" size="sm">
          {open === "cant" ? "The empty side is the list" : "Each source carries its own date"}
        </Say>
        {!edge && (
          <Btns align="end">
            <Btn onClick={() => set({ ...work, edge: true })}>Try dragging one past it</Btn>
          </Btns>
        )}
      </span>
    </Board>
  );
}

KnownLimitsPreview.surfaces.canvas = LimitsCanvas;
