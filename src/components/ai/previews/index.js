import { PromptComposerPreview } from "./PromptComposerPreview.jsx";
import { StreamingPreview } from "./StreamingPreview.jsx";
import { GroundedAnswerPreview } from "./GroundedAnswerPreview.jsx";
import { DiffReviewPreview } from "./DiffReviewPreview.jsx";
import { ApprovalGatePreview } from "./ApprovalGatePreview.jsx";
import { RefusalPreview } from "./RefusalPreview.jsx";
import { ScopedContextPreview } from "./ScopedContextPreview.jsx";
import { StagedRevealPreview } from "./StagedRevealPreview.jsx";
import { InlineSuggestionPreview } from "./InlineSuggestionPreview.jsx";
import { NoAnswerPreview } from "./NoAnswerPreview.jsx";
import { StructuredOutputPreview } from "./StructuredOutputPreview.jsx";
import { ConfidencePreview } from "./ConfidencePreview.jsx";
import { PlanPreviewPreview } from "./PlanPreviewPreview.jsx";
import { VersionHistoryPreview } from "./VersionHistoryPreview.jsx";

// Preview registry, keyed by pattern id. A pattern with no entry falls back to
// the playground's own empty state, so an unbuilt one reads as unbuilt rather
// than as broken — the same call Components makes for previews it hasn't built.
//
// Every preview is a pure function of the surface it is handed. It holds no
// state of its own — PatternDetail owns the working data and the preview
// renders it — which is what keeps the canvas and the frame from disagreeing:
// the state the page names is derived from the same data the frame drew, so
// there is no second copy of it to drift.
//
// Twelve of the fourteen carry a `work` static beside the component: `for`,
// `state` and sometimes `tick`. See PatternDetail.jsx for the protocol, and
// smoke29 for the properties it has to keep — chiefly that `state(for(id))` is
// `id` for every state, or the tabs and the decision links would be naming
// frames the canvas isn't showing.
export const PATTERN_PREVIEWS = {
  "prompt-composer": PromptComposerPreview,
  "streaming-response": StreamingPreview,
  "grounded-answer": GroundedAnswerPreview,
  "diff-review": DiffReviewPreview,
  "approval-gate": ApprovalGatePreview,
  "graceful-refusal": RefusalPreview,
  "scoped-context": ScopedContextPreview,
  "staged-reveal": StagedRevealPreview,
  "inline-suggestion": InlineSuggestionPreview,
  "no-answer-fallback": NoAnswerPreview,
  "structured-output": StructuredOutputPreview,
  "confidence-hedging": ConfidencePreview,
  "plan-preview": PlanPreviewPreview,
  "version-history": VersionHistoryPreview,
};
