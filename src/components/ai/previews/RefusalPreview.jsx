import { Body, Btn, Btns, Frame, FrameBar, GhostLines, Note, Say } from "./kit.jsx";

// Graceful Refusal. Every state here is intentionally *not* red: a policy limit
// and a capability limit are the system working as designed, and spending the
// error treatment on them leaves nothing left when something actually breaks.
export function RefusalPreview({ state }) {
  return (
    <Frame width={540}>
      <FrameBar title="Assistant" />
      <Body>
        {/* The shortcut passes the model's own refusal straight through, in
            error treatment. It reads as a bug, so the user retries verbatim. */}
        {state === "policy" && (
          <>
            <Note tone="plain" title="I can't draft this one">
              Performance reviews go through People Ops rather than through me — there's a template
              and an approval path this would skip.
            </Note>
            <Btns align="end">
              <Btn>Report</Btn>
              <Btn variant="primary">Open the template</Btn>
            </Btns>
          </>
        )}

        {state === "capability" && (
          <>
            <Note tone="plain" title="I can't reach private repositories">
              I can read anything in the public org, and I can work from a file you paste in.
            </Note>
            <Say tone="mute" size="sm">
              Specific enough to change the next move. “I can't help with that” produces a retry of
              the same request.
            </Say>
            <Btns align="end">
              <Btn>Report</Btn>
              <Btn variant="primary">Paste a file instead</Btn>
            </Btns>
          </>
        )}

        {state === "noanswer" && (
          <>
            <Note tone="plain" title="I'm not confident enough to answer this">
              Two of your documents disagree about the notice period and I can't tell which is
              current.
            </Note>
            <Btns align="end">
              <Btn>Show me both</Btn>
              <Btn variant="primary">Ask Legal</Btn>
            </Btns>
          </>
        )}

        {state === "partial" && (
          <>
            <GhostLines widths={[100, 92, 46]} />
            <Note tone="plain" title="Stopped after 2 of 5 sections">
              The first two sections are finished and saved. I can't write the compensation section —
              that one needs People Ops.
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
