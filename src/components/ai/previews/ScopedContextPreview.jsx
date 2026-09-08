import { Body, Btn, Btns, Check, Chip, Frame, FrameBar, GhostLines, Label, Note, Say } from "./kit.jsx";

// Visible Sources, drawn as a report builder rather than a chat: the thing being
// scoped is a set of accounts, and the question the pattern answers — "what will
// it actually read?" — is a number on screen before anything runs.
//
// Two things were wrong with the previous drawing, and they were the same thing
// twice. There was no control: the pattern lists Checkbox in `composedOf` and
// the wireframe drew a 2px rail, so the one pattern whose whole argument is
// "sources switch on and off right where they're used" had nothing on screen to
// switch. And the Default state showed only the accounts that were already in
// scope, hiding the two that weren't — under a state note reading "a default
// nobody can see is a default nobody can correct".
//
// So every state now renders the same four rows in the same order, and only two
// things ever change: which boxes are ticked, and the two numbers in the head.
// That is what makes Editing and Narrowed legible as *moves* rather than as two
// similar screenshots — flipping between them moves exactly one tick and both
// counts, and nothing else on the frame shifts at all.
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

// Which accounts are ticked in each state, and which row the user just touched.
// The scope grows by one into Editing and collapses from there, so the count
// moves in both directions across the run rather than only down.
const SCOPE = {
  default: { on: ["current", "joint"] },
  editing: { on: ["current", "joint", "savings"], touched: "savings" },
  narrow: { on: ["current"], touched: "joint" },
  empty: { on: [], touched: "current" },
  stale: { on: ["current", "joint"] },
};

export function ScopedContextPreview({ state }) {
  const { on, touched } = SCOPE[state] ?? SCOPE.default;
  // Derived, never typed twice: the head can't claim a total the rows don't add
  // up to, which is the only reason to trust the number at all.
  const reading = SOURCES.filter((s) => on.includes(s.id));
  const payments = reading.reduce((n, s) => n + (s.payments ?? 0), 0);

  return (
    <Frame width={540}>
      <FrameBar title="Spending report · March" />
      <Body>
        {/* The report that has already been built, and the scope stamped on
            it. Stale is the only state where one exists — and it is the state
            the pattern's "does a result remember the scope it came from?"
            decision points at, which until now landed on a canvas with no
            result on it at all. The staleness is the mismatch: this says three
            accounts, the list below shows two ticked. */}
        {state === "stale" && (
          <div className="mk-stamp">
            <span className="mk-stamp-head">
              <Label>Report · 14:02</Label>
              <Chip>Out of date</Chip>
            </span>
            <GhostLines widths={[100, 88, 54]} tone="mute" />
            <Say tone="mute" size="sm">
              Built from 3 accounts · Savings is now off
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
            {/* And what that actually costs, so "what will it read" is a
                number rather than a promise. Both move on every tick. */}
            <Chip>{payments.toLocaleString("en-GB")} payments</Chip>
          </span>
        </span>

        <div className="mk-picks">
          {SOURCES.map((s) => {
            const checked = on.includes(s.id);
            return (
              <div
                className="mk-pick"
                key={s.id}
                data-locked={s.locked || undefined}
                data-touched={s.id === touched || undefined}
              >
                {s.locked ? (
                  <span className="mk-pick-none" aria-hidden>
                    —
                  </span>
                ) : (
                  <Check
                    checked={checked}
                    hovered={s.id === touched || undefined}
                    label={s.name}
                  />
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

        {state === "empty" && (
          <Note tone="warn" title="Nothing in scope">
            Choose at least one account. Nothing will be worked out from general knowledge.
          </Note>
        )}


        <span className="mk-foot">
          <Say tone="mute" size="sm">
            {state === "stale"
              ? `Rebuilding reads ${on.length} accounts`
              : "Nothing runs until you build it"}
          </Say>
          <Btns align="end">
            <Btn variant="primary" disabled={state === "empty"}>
              {state === "stale" ? "Rebuild" : "Build report"}
            </Btn>
          </Btns>
        </span>
      </Body>
    </Frame>
  );
}
