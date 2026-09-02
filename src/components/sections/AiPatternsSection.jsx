import { SectionHead } from "../common/SectionHead.jsx";
import { AI_PATTERN_BY_ID, AI_PATTERNS } from "../../data/aiPatterns.js";
import { PatternDetail } from "../ai/PatternDetail.jsx";

// AI Patterns / Patterns — the core of the hub, one pattern on the canvas.
//
// Mirrors the Product Hub's playground rather than the Brand Hub's run of
// stacked sections, and for the same reason: a pattern entry is a page, and
// twenty-four of them stacked is a scroll nobody finishes.
//
// The canvas comes first and the writing sits under it, which is the ordering
// that makes this work for two audiences at once. A stakeholder clicks through
// the state pills and sees what the pattern is; a designer keeps scrolling for
// the decisions, the defaults and the failure modes. Neither has to read the
// other's half to get their answer.
export function AiPatternsSection({
  registerRef,
  selectedAiPattern,
  onSelectAiPattern,
  onSelectComponent,
}) {
  const pattern = AI_PATTERN_BY_ID.get(selectedAiPattern) ?? AI_PATTERNS[0];

  return (
    <section id="ai-patterns" className="section" ref={(el) => registerRef("ai-patterns", el)}>
      {/* Titled with the pattern on the canvas rather than with the word
          "Patterns" — the same call ComponentsSection makes, where the heading
          is the selected component.

          The description is the pattern's own definition. It used to sit in the
          properties column at 12.5px in a 260px gutter; here it's in the head's
          second column at 15px, which is where a definition should be read.
          That also means it appears once on the page rather than twice. */}
      <SectionHead title={pattern.name}>{pattern.definition}</SectionHead>
      {/* Keyed on the pattern, so switching one out resets the canvas to the
          new pattern's first state rather than carrying over a state id the
          incoming pattern doesn't have. */}
      <PatternDetail
        key={pattern.id}
        pattern={pattern}
        onSelectComponent={onSelectComponent}
        onSelectAiPattern={onSelectAiPattern}
      />
    </section>
  );
}
