import { SectionHead } from "../common/SectionHead.jsx";
import { SpacingScale } from "../spacing/SpacingScale.jsx";

// Foundations / Spacing — the value-based 4px scale.
export function SpacingSection({ registerRef, copied, onCopy }) {
  return (
    <section id="spacing" className="section" ref={(el) => registerRef("spacing", el)}>
      <SectionHead title="Spacing">
        A value-based scale built on a 4px base. Each token is named for its pixel value — space-16 is 16px —
        so the name is self-documenting and never needs a lookup.
      </SectionHead>
      <SpacingScale copied={copied} onCopy={onCopy} />
    </section>
  );
}
