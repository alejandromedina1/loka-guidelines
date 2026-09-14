import { Body, Btn, Btns, Frame, FrameBar, Label, Note, Row, Steps } from "./kit.jsx";

// Clear Refusal, in four product surfaces rather than four callouts.
//
// WHAT WAS WRONG WITH IT
//
// Every state was a frame containing a message and two buttons, and nothing
// else. Four kinds of refusal drew four boxes that differed only in their
// words, which made the pattern look like a copy exercise — and it is the one
// pattern in the hub whose thesis is that refusal is *a product behaviour*:
// "four frames make the point that refusal is something products do, not
// something chatbots say". A refusal with no product around it is exactly the
// chatbot reply it is arguing against.
//
// So each state now draws the thing that was refused, and the refusal sits
// where the result would have been. You can see the £300 that didn't go, the
// account it couldn't read, the two payments it couldn't tell apart, and the
// two report sections that are finished and saved. That is also what makes the
// pattern's second decision visible — "enough reason to change the next move" —
// because the next move is only obvious once you can see what is in the way.
//
// Three of the five decisions are now drawn rather than described:
//   the reason is specific     — the boundary is on screen beside the refusal
//   there is a path forward    — carried inside the callout, never loose
//   over-refusal is reportable — "This looks wrong", one click, on all four
//
// And the Inspect axis is answered. It is graded Recommended with the note
// "which kind of limit it is — a rule, a missing ability, a permission, or
// missing data", and the canvas said nothing at all about that: tone was the
// only difference between a rule and a failure, which is colour as the only
// signal. Each refusal now names its own kind.
//
// Every state is intentionally *not* red. A rule and a missing connection are
// the system working as designed, and spending the error treatment on them
// leaves nothing left when something actually breaks.
//
// The copy is product voice — no "I", because in a product that isn't a chatbot
// there is no "I" to speak. "New payees are held for 24 hours" is a fact about
// how the bank works. "I can't do that one" is a character.

// The report the fourth state was part-way through. Named sections rather than
// three grey lines, because that state's whole instruction is "keep and label
// what was finished" — and a placeholder is neither kept nor labelled.
const SECTIONS = [
  "Where it went",
  "Compared to February",
  "Card spending",
  "Subscriptions",
  "Forecast",
];

// What it could read, and what it couldn't. The boundary and what sits inside
// it, which is the difference between a refusal somebody can act on and one
// that produces a verbatim retry.
const ACCOUNTS = [
  { name: "Current account", meta: "1,204 payments", on: true },
  { name: "Joint account", meta: "312 payments", on: true },
  { name: "Sam's credit card", meta: "Not connected", on: false },
];

// The two the check couldn't separate. Identical on every field it can see,
// which is why it says so instead of picking one.
const CHARGES = [
  { name: "Sainsbury's Local · 14 Aug", meta: "£48.20 · receipt attached" },
  { name: "Sainsbury's Local · 14 Aug", meta: "£48.20 · no receipt" },
];

// A name against a value on one baseline — the same row the source list and the
// candidate list use, so three patterns draw "here is a thing and here is what
// it holds" the same way.
function Line({ name, meta, off }) {
  return (
    <Row tone={off ? "mute" : undefined}>
      <span className="mk-src">
        <span className="mk-src-name" data-off={off || undefined}>
          {name}
        </span>
        <span className="mk-src-meta">{meta}</span>
      </span>
    </Row>
  );
}

const SURFACE = {
  policy: "Pay Ana Ruiz",
  capability: "Spending · All accounts",
  noanswer: "Was I charged twice?",
  partial: "Spending report · March",
};

export function RefusalPreview({ state }) {
  return (
    <Frame width={540}>
      <FrameBar title={SURFACE[state]} />
      <Body>
        {/* A rule, not a fault. The payment is on screen and unsent: the named
            limit is what makes it actionable, and the reader now knows what to
            do and when, which "unavailable" never tells them. */}
        {state === "policy" && (
          <>
            <div className="mk-params">
              <Row lead>
                <span className="mk-param">
                  <span className="mk-param-key">To</span>
                  <span className="mk-param-val">Ana Ruiz · 04-00-72 · ••••3391</span>
                </span>
              </Row>
              <Row>
                <span className="mk-param">
                  <span className="mk-param-key">Amount</span>
                  <span className="mk-param-val">£300.00</span>
                </span>
              </Row>
              <Row>
                <span className="mk-param">
                  <span className="mk-param-key">From</span>
                  <span className="mk-param-val">Current account · £1,240 available</span>
                </span>
              </Row>
            </div>
            <Note
              kind="Rule"
              title="New payees are held for 24 hours"
              actions={
                <Btns align="end">
                  <Btn>This looks wrong</Btn>
                  <Btn variant="primary">Pay tomorrow, 09:00</Btn>
                </Btns>
              }
            >
              Ana was added 20 minutes ago. This is your bank's rule, not a problem with the
              payment.
            </Note>
          </>
        )}

        {/* A missing connection, stated as a boundary plus what is inside it.
            The list is that second half drawn: two accounts it read and one it
            can't reach, so "what would change this" is a row on screen rather
            than a sentence to parse. */}
        {state === "capability" && (
          <>
            <Label>Read for this total</Label>
            <div className="mk-list">
              {ACCOUNTS.map((a) => (
                <Line key={a.name} name={a.name} meta={a.meta} off={!a.on} />
              ))}
            </div>
            <Note
              kind="Not set up"
              title="Your credit card isn't connected"
              actions={
                <Btns align="end">
                  <Btn>This looks wrong</Btn>
                  <Btn variant="primary">Upload a statement</Btn>
                </Btns>
              }
            >
              The total above covers your current and joint accounts. An uploaded statement works
              too.
            </Note>
          </>
        )}

        {/* Not sure enough is an outcome, and it earns the same calm treatment
            as a rule. The two charges are drawn because the reason has to be
            checkable: they are identical on every field the check can see,
            which is the whole of why it won't pick one. */}
        {state === "noanswer" && (
          <>
            <Label>Two payments match</Label>
            <div className="mk-list">
              {CHARGES.map((c, i) => (
                <Line key={i} name={c.name} meta={c.meta} />
              ))}
            </div>
            <Note
              kind="Not sure"
              title="Not confident enough to answer"
              actions={
                <Btns align="end">
                  <Btn>This looks wrong</Btn>
                  <Btn variant="primary">Ask your bank</Btn>
                </Btns>
              }
            >
              Same shop, same day, same amount — and only one has a receipt.
            </Note>
          </>
        )}

        {/* Work kept rather than discarded. The five sections are named and the
            first two are finished, so "keep and label what was finished" is a
            list somebody can read instead of three grey lines. The stop is a
            neutral ring, not a failure mark: nothing broke. */}
        {state === "partial" && (
          <>
            <Label>Report sections</Label>
            <Steps items={SECTIONS} at={2} paused />
            <Note
              kind="Partly done"
              title="Stopped at Card spending"
              actions={
                <Btns align="end">
                  <Btn>This looks wrong</Btn>
                  <Btn variant="primary">Keep the two sections</Btn>
                </Btns>
              }
            >
              The first two are yours to read now. The card section needs that account connected,
              and the last two come after it.
            </Note>
          </>
        )}
      </Body>
    </Frame>
  );
}
