import { Body, Btn, Btns, Check, Chip, Frame, FrameBar, GhostLines, Label, Note, Say } from "./kit.jsx";
import { VoiceStage } from "./voice.jsx";

// Visible Sources, drawn as a report builder rather than a chat: the thing being
// scoped is a set of accounts, and the question the pattern answers — "what will
// it actually read?" — is a number on screen that moves when you move a tick.
//
// Every state here is produced rather than selected. Switch Savings on and the
// scope is wider; switch two off and it is narrower; switch the last one off and
// you are in the state this pattern exists to prevent an answer from. Build the
// report and then change a tick, and the result goes out of date — which is the
// pattern's fourth decision, demonstrated by doing it rather than by a frame
// captioned "Scope changed".
//
// The account you can't see sits last, after a rule, and carries no control at
// all. It used to be a *disabled checkbox* in the middle of the list, which
// says "temporarily unavailable" — a switch that happens to be off — when what
// it means is "not yours to switch". That blurred the two things this list
// holds: three accounts you choose between, which is relevance, and one you
// have no say over, which is permission and was decided elsewhere by somebody
// else. A reader who can't tell them apart reads the whole pattern as a
// consent screen.
//
// The Loka icon set ships no lock, so none is drawn — the absence of a control
// is the signal, and the row states its own reason beside it.
const SOURCES = [
  { id: "current", name: "Current account", payments: 1204 },
  { id: "joint", name: "Joint account", payments: 312 },
  { id: "savings", name: "Savings", payments: 48 },
  { id: "card", name: "Sam's credit card", locked: true },
];

// The scope the system picked, stated plainly and before anything runs. A
// default nobody can see is a default nobody can correct — so it is drawn as
// two of the four ticked rather than as a list of two.
const DEFAULT = ["current", "joint"];

const same = (a, b) => a.length === b.length && a.every((x) => b.includes(x));
const nameOf = (id) => SOURCES.find((s) => s.id === id)?.name ?? id;

export function ScopedContextPreview({ work, set }) {
  const { on, built } = work;
  // Derived, never typed twice: the head can't claim a total the rows don't add
  // up to, which is the only reason to trust the number at all.
  const payments = SOURCES.filter((s) => on.includes(s.id)).reduce((n, s) => n + (s.payments ?? 0), 0);
  const stale = built && !same(built, on);
  // What changed since the report was built. Named, because "out of date" on
  // its own doesn't tell anybody whether it matters.
  const dropped = stale ? built.filter((id) => !on.includes(id)) : [];
  const added = stale ? on.filter((id) => !built.includes(id)) : [];

  const toggle = (id) =>
    set({ ...work, on: on.includes(id) ? on.filter((x) => x !== id) : [...on, id] });

  return (
    <Frame width={540}>
      <FrameBar title="Spending report · March" />
      <Body>
        {/* The report that has already been built, and the scope stamped on it.
            A result carries the scope it was produced under, so changing a tick
            marks it rather than quietly keeping it. */}
        {built && (
          <div className="mk-stamp" data-stale={stale ? "" : undefined}>
            <span className="mk-stamp-head">
              <Label>Report · 14:02</Label>
              {stale && <Chip>Out of date</Chip>}
            </span>
            <GhostLines widths={[100, 88, 54]} tone="mute" />
            <Say tone="mute" size="sm">
              Built from {built.length} account{built.length === 1 ? "" : "s"}
              {dropped.length > 0 && ` · ${dropped.map(nameOf).join(", ")} now off`}
              {added.length > 0 && ` · ${added.map(nameOf).join(", ")} now on`}
            </Say>
          </div>
        )}

        <span className="mk-scope-head">
          <Label>Reading from</Label>
          <span className="mk-chips">
            {/* The ratio, not the count. "2 accounts" reassures; "2 of 4" is
                the sentence that stops somebody trusting half the picture. */}
            <Chip>
              {on.length} of {SOURCES.length} accounts
            </Chip>
            {/* And what that actually costs, so "what will it read" is a number
                rather than a promise. Both move on every tick. */}
            <Chip>{payments.toLocaleString("en-GB")} payments</Chip>
          </span>
        </span>

        <div className="mk-picks">
          {SOURCES.map((s) => {
            const checked = on.includes(s.id);
            return (
              <div className="mk-pick" key={s.id} data-locked={s.locked || undefined}>
                {s.locked ? (
                  <span className="mk-pick-none" aria-hidden>
                    —
                  </span>
                ) : (
                  <Check checked={checked} label={s.name} onClick={() => toggle(s.id)} />
                )}
                <span className="mk-src">
                  <span className="mk-src-name" data-off={!checked || undefined}>
                    {s.name}
                  </span>
                  <span className="mk-src-meta">
                    {s.locked
                      ? "No access — ask Sam"
                      : `${s.payments.toLocaleString("en-GB")} payments`}
                  </span>
                </span>
              </div>
            );
          })}
        </div>

        {on.length === 0 && (
          <Note tone="warn" title="Nothing in scope">
            Choose at least one account. Nothing will be worked out from general knowledge.
          </Note>
        )}

        <span className="mk-foot">
          <Say tone="mute" size="sm">
            {on.length === 0
              ? "Nothing to read"
              : stale
                ? `Rebuilding reads ${on.length} account${on.length === 1 ? "" : "s"}`
                : "Nothing runs until you build it"}
          </Say>
          <Btns align="end">
            <Btn
              variant="primary"
              disabled={on.length === 0 || (!!built && !stale)}
              onClick={() => set({ ...work, built: [...on] })}
            >
              {stale ? "Rebuild" : "Build report"}
            </Btn>
          </Btns>
        </span>
      </Body>
    </Frame>
  );
}

// Which state the scope is in, read off the ticks. Nothing here is chosen:
// switching the last account off *is* Nothing in scope, and changing one after
// building *is* Scope changed.
ScopedContextPreview.work = {
  for: (id) =>
    ({
      default: { on: DEFAULT, built: null },
      editing: { on: [...DEFAULT, "savings"], built: null },
      narrow: { on: ["current"], built: null },
      empty: { on: [], built: null },
      stale: { on: DEFAULT, built: [...DEFAULT, "savings"] },
    })[id] ?? { on: DEFAULT, built: null },

  state: (w) => {
    // Blocked first: with nothing in scope there is nothing to be out of date
    // about, and this is the state the pattern exists to stop an answer from.
    if (w.on.length === 0) return "empty";
    if (w.built && !same(w.built, w.on)) return "stale";
    if (w.on.some((id) => !DEFAULT.includes(id))) return "editing";
    if (w.on.length < DEFAULT.length) return "narrow";
    return "default";
  },
};

// ── Spoken ──────────────────────────────────────────────────────────────────
//
// Same `work` — which accounts are on, and what a built report was built from.
// What changes is that the list cannot be read out: four names and four counts
// is a list nobody holds, so the scope becomes one number said before the
// answer, and the names only come out when somebody asks which.
//
// The blocked state gains something here. On a screen, nothing in scope is a
// callout beside a list you can fix; out loud there is no list, so the product
// has to say what would fix it.
function ScopedVoice({ work, set }) {
  const { on, built } = work;
  const stale = built && !same(built, on);
  const names = SOURCES.filter((s) => on.includes(s.id)).map((s) => s.name);

  if (on.length === 0) {
    return (
      <VoiceStage
        device="Kitchen speaker"
        mood="speaking"
        heard="What did I spend last month?"
        caption="Nothing's switched on to read. Turn an account back on and ask again."
      >
        <Btn variant="primary" onClick={() => set({ ...work, on: DEFAULT })}>
          Say “use my current and joint”
        </Btn>
      </VoiceStage>
    );
  }

  if (stale) {
    return (
      <VoiceStage
        device="Kitchen speaker"
        mood="speaking"
        heard="Read me that report again"
        caption={`That one was built from ${built.length} accounts. You've changed what's on since.`}
      >
        <Btn variant="primary" onClick={() => set({ ...work, built: [...on] })}>
          Build it again
        </Btn>
      </VoiceStage>
    );
  }

  // Adding a source is the one state here that is the *user* doing something,
  // so it is the one where the device is taking rather than telling. The other
  // four are all the product stating where it will read from.
  const adding = on.some((id) => !DEFAULT.includes(id));

  return (
    <VoiceStage
      device="Kitchen speaker"
      mood={built ? "rest" : adding ? "listening" : "speaking"}
      heard={adding ? "Add my savings too" : "What did I spend last month?"}
      /* The count, not the list. "Two accounts" is holdable; four names and
         four numbers is the thing this surface cannot do. */
      caption={
        built
          ? `Built from ${on.length} account${on.length === 1 ? "" : "s"}. £1,840 in all.`
          : `Reading ${on.length} account${on.length === 1 ? "" : "s"}. Ask me which if you want them named.`
      }
    >
      {!built && (
        <Btn variant="primary" onClick={() => set({ ...work, built: [...on] })}>
          Go ahead
        </Btn>
      )}
      {/* The names on request — which is the shape of every list on this
          surface: a summary, and the detail only if somebody asks for it. */}
      {!built && names.length > 0 && <Btn>Which ones?</Btn>}
      {built && (
        <Btn onClick={() => set({ ...work, on: [...on, "savings"].filter((v, i, a) => a.indexOf(v) === i) })}>
          Add savings
        </Btn>
      )}
    </VoiceStage>
  );
}

ScopedContextPreview.surfaces = { voice: ScopedVoice };
