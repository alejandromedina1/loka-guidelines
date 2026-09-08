import { Body, Btn, Btns, Frame, FrameBar, GhostLines, Note } from "./kit.jsx";

// Clear Refusal, in four product surfaces rather than one chat window.
//
// The copy is product voice — no "I", because in a product that isn't a chatbot
// there is no "I" to speak. "New payees are held for 24 hours" is a fact about
// how the bank works. "I can't do that one" is a character.
//
// Each state also names its own surface, because these are four *kinds* of
// limit and they surface in four different places: a payment, an account list,
// a question, a report. Four frames make the point that refusal is something
// products do, not something chatbots say. Nothing here follows anything else,
// which is why the track draws these four apart rather than in a run.
//
// Every state is intentionally *not* red: a rule and a missing connection are
// the system working as designed, and spending the error treatment on them
// leaves nothing left when something actually breaks.
export function RefusalPreview({ state }) {
  const title =
    state === "policy"
      ? "Pay Ana Ruiz · £300"
      : state === "capability"
        ? "Spending · All accounts"
        : state === "noanswer"
          ? "Was I charged twice?"
          : "Spending report · March";

  return (
    <Frame width={540}>
      <FrameBar title={title} />
      <Body>
        {/* A rule, not a fault. The named limit is what makes it actionable —
            the reader now knows what to do and when, which "unavailable"
            never tells them. */}
        {state === "policy" && (
          <>
            <Note tone="plain" title="New payees are held for 24 hours">
              Ana was added 20 minutes ago. This is your bank's rule, not a problem with the
              payment.
            </Note>
            <Btns align="end">
              <Btn>Report</Btn>
              <Btn variant="primary">Pay tomorrow</Btn>
            </Btns>
          </>
        )}

        {/* A missing connection, stated as a boundary plus what is inside it.
            The second sentence is the pattern's whole point: enough to change
            the next move, rather than enough to prompt a verbatim retry. */}
        {state === "capability" && (
          <>
            <Note tone="plain" title="Your credit card isn't connected">
              Your current and joint accounts can be read, and an uploaded statement works too.
            </Note>
            <Btns align="end">
              <Btn>Report</Btn>
              <Btn variant="primary">Upload a statement</Btn>
            </Btns>
          </>
        )}

        {/* Not sure enough is an outcome, and it earns the same calm treatment
            as a rule. The reason is specific enough to be checkable. */}
        {state === "noanswer" && (
          <>
            <Note tone="plain" title="Not confident enough to answer">
              Two payments to the same shop on the same day, and only one has a receipt.
            </Note>
            <Btns align="end">
              <Btn>Show both</Btn>
              <Btn variant="primary">Ask your bank</Btn>
            </Btns>
          </>
        )}

        {/* Work kept rather than discarded. The finished sections stay on
            screen, which is what stops a partial stop reading as a crash. */}
        {state === "partial" && (
          <>
            <GhostLines widths={[100, 92, 46]} />
            <Note tone="plain" title="Stopped after 2 of 5 sections">
              The first two are finished and saved. The card section needs that account connected.
            </Note>
            <Btns align="end">
              <Btn>Discard</Btn>
              <Btn variant="primary">Keep the two sections</Btn>
            </Btns>
          </>
        )}
      </Body>
    </Frame>
  );
}
