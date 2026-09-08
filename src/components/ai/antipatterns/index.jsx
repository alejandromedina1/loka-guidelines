import { Body, Btn, Btns, Chip, Field, Frame, FrameBar, Ghost, GhostLines, Label, Note, Row, Say, Spinner } from "../previews/kit.jsx";

// One wireframe per anti-pattern, on the same kit and the same ramp as the
// pattern previews.
//
// This page was 578 words with nothing to look at, in a hub whose whole
// argument is show-don't-tell — the largest gap between what the hub claimed
// and what it did. Every one of the nine has an obvious visual, and failure is
// more legible than success: the rubber stamp is instantly recognisable as a
// picture and takes a paragraph to describe.
//
// Each draws only the mistake. The card's "Instead" line carries the fix, so
// these don't need a comparison the way a pattern's Compare pill does.

function ConfidenceTheatre() {
  return (
    <Frame width={340}>
      <FrameBar title="Account" />
      <Body>
        <Row>
          <span className="mk-xf">
            <span className="mk-xf-key">Credit limit</span>
            <span className="mk-xf-val">£40,000</span>
          </span>
        </Row>
        {/* Same weight, same treatment, same everything as the verified row
            above it — with a number attached that changes nothing. */}
        <Row>
          <span className="mk-xf">
            <span className="mk-xf-key">Default risk</span>
            <span className="mk-xf-val">Low · 87% confidence</span>
          </span>
        </Row>
      </Body>
    </Frame>
  );
}

function BlankBox() {
  return (
    <Frame width={340}>
      <FrameBar title="New expense" />
      <Body>
        <Field placeholder="Ask me anything about this expense…" />
        <GhostLines widths={[100, 100, 62]} tone="mute" />
        <Btns align="end">
          <Btn variant="primary">Save</Btn>
        </Btns>
      </Body>
    </Frame>
  );
}

function RubberStamp() {
  return (
    <Frame width={340}>
      <FrameBar title="Confirm" />
      <Body>
        <Say>Are you sure you want to continue?</Say>
        <Say tone="mute" size="sm">
          This action will be applied.
        </Say>
        <Btns align="end">
          <Btn>Cancel</Btn>
          <Btn variant="primary">Confirm</Btn>
        </Btns>
      </Body>
    </Frame>
  );
}

function FeedbackVoid() {
  return (
    <Frame width={340}>
      <FrameBar title="Summary" />
      <Body>
        <GhostLines widths={[100, 94, 70]} />
        {/* Two buttons and no statement of where the signal goes or what it
            changes — so it goes nowhere and changes nothing. */}
        <Btns>
          <Btn>Helpful</Btn>
          <Btn>Not helpful</Btn>
        </Btns>
      </Body>
    </Frame>
  );
}

function SilentFallback() {
  return (
    <Frame width={340}>
      <FrameBar title="Why is March higher?" />
      <Body>
        <Say>Food went up £96, mostly takeaways.</Say>
        {/* No marker, no source panel, no mention that the search returned
            nothing — identical to a sourced answer. */}
        <span className="mk-chips">
          <Chip>Answered</Chip>
        </span>
      </Body>
    </Frame>
  );
}

function EternalSpinner() {
  return (
    <Frame width={340}>
      <FrameBar title="Generating" />
      <Body>
        <div className="mk-blocked">
          <Spinner label="Working…" />
        </div>
      </Body>
    </Frame>
  );
}

function SparkleWashing() {
  return (
    <Frame width={340}>
      <FrameBar title="Deal summary" />
      <Body>
        <span className="mk-scope-head">
          <Label>Summary</Label>
          <span className="mk-sparkle" aria-hidden />
        </span>
        <GhostLines widths={[100, 96, 58]} />
      </Body>
    </Frame>
  );
}

function HappyPathDemo() {
  return (
    <Frame width={340}>
      <FrameBar title="Demo · 3 of 3" />
      <Body>
        <Note tone="ok" title="Matched 340 of 340">
          Every record resolved on the first pass.
        </Note>
        <Row lead>
          <span className="mk-src">
            <span className="mk-src-name">Sainsbury's Local</span>
            <span className="mk-score">98%</span>
          </span>
        </Row>
        <Row lead>
          <span className="mk-src">
            <span className="mk-src-name">Homebase</span>
            <span className="mk-score">97%</span>
          </span>
        </Row>
      </Body>
    </Frame>
  );
}

function OneNumber() {
  return (
    <Frame width={340}>
      <FrameBar title="Model performance" />
      <Body>
        <div className="mk-band" data-tone="high">
          <span className="mk-band-value">94%</span>
          <span className="mk-band-note">accurate</span>
        </div>
        <Ghost w={44} tone="mute" />
      </Body>
    </Frame>
  );
}

// Keyed by anti-pattern id. One missing simply renders no figure, which is the
// same call the pattern shelf makes for a preview it hasn't built.
export const ANTIPATTERN_FIGURES = {
  "confidence-theatre": ConfidenceTheatre,
  "blank-box": BlankBox,
  "rubber-stamp": RubberStamp,
  "feedback-void": FeedbackVoid,
  "silent-fallback": SilentFallback,
  "eternal-spinner": EternalSpinner,
  "sparkle-washing": SparkleWashing,
  "happy-path-demo": HappyPathDemo,
  "one-number": OneNumber,
};
