import { Body, Btn, Btns, Frame, FrameBar, GhostLines, Note } from "./kit.jsx";

// Clear Refusal, in four product surfaces rather than one chat window.
//
// Two things were wrong with the previous drawing, and they were the same
// thing twice. It was framed as an "Assistant", and it spoke in the model's
// first person — "I can't draft this one", "I can read anything in the public
// org". That contradicts the pattern's own first decision: *where does the
// refusal copy come from? Your product, not the model.* A wireframe that
// answers its own question the wrong way teaches the wrong lesson faster than
// the prose can correct it.
//
// So the copy is now product voice — no "I", because in a product that isn't a
// chatbot there is no "I" to speak. "Performance reviews go through People Ops"
// is a fact about the company. "I can't draft this one" is a character.
//
// Each state also names its own surface, because these are four *kinds* of
// limit and they surface in four different places: a drafting tool, a code
// audit, a policy lookup. Four frames make the point that refusal is something
// products do, not something chatbots say.
//
// Every state is intentionally *not* red: a policy limit and a capability limit
// are the system working as designed, and spending the error treatment on them
// leaves nothing left when something actually breaks.
export function RefusalPreview({ state }) {
  const draft = state === "policy" || state === "partial";
  const title =
    draft
      ? "Draft · Q3 performance review"
      : state === "capability"
        ? "Code audit · northwind-api"
        : "Policy check · Notice period";

  return (
    <Frame width={540}>
      <FrameBar title={title} />
      <Body>
        {/* A rule, not a fault. The named owner is what makes it actionable —
            the reader now knows who to go to, which "unavailable" never
            tells them. */}
        {state === "policy" && (
          <>
            <Note tone="plain" title="Performance reviews go through People Ops">
              There's a template and an approval path this would skip.
            </Note>
            <Btns align="end">
              <Btn>Report</Btn>
              <Btn variant="primary">Open the template</Btn>
            </Btns>
          </>
        )}

        {/* A missing connection, stated as a boundary plus what is inside it.
            The second sentence is the pattern's whole point: enough to change
            the next move, rather than enough to prompt a verbatim retry. */}
        {state === "capability" && (
          <>
            <Note tone="plain" title="Private repositories aren't connected">
              Anything in the public org can be read, and a pasted file works too.
            </Note>
            <Btns align="end">
              <Btn>Report</Btn>
              <Btn variant="primary">Paste a file</Btn>
            </Btns>
          </>
        )}

        {/* Not sure enough is an outcome, and it earns the same calm treatment
            as a rule. The reason is specific enough to be checkable. */}
        {state === "noanswer" && (
          <>
            <Note tone="plain" title="Not confident enough to answer">
              Two documents disagree about the notice period, and neither is marked current.
            </Note>
            <Btns align="end">
              <Btn>Show both</Btn>
              <Btn variant="primary">Ask Legal</Btn>
            </Btns>
          </>
        )}

        {/* Work kept rather than discarded. The finished sections stay on
            screen, which is what stops a partial stop reading as a crash. */}
        {state === "partial" && (
          <>
            <GhostLines widths={[100, 92, 46]} />
            <Note tone="plain" title="Stopped after 2 of 5 sections">
              The first two are finished and saved. The compensation section needs People Ops.
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
