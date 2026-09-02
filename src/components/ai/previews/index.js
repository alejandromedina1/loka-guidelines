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
// Every preview is a pure function of `state`: the pill strip in the canvas foot
// owns which state is showing, exactly as it does for a Button or an Input
// Field in the Product Hub. Nothing here holds state of its own, so there's no
// way for the canvas and the pills to disagree.
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
