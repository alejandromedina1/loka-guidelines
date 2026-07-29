import { SectionHead } from "../common/SectionHead.jsx";
import { IconGallery } from "../icons/IconGallery.jsx";

// Foundations / Icons — the 24px-grid glyph library.
export function IconsSection({ registerRef, copied, onCopy }) {
  return (
    <section id="icons" className="section" ref={(el) => registerRef("icons", el)}>
      <SectionHead title="Icons">
        The Loka icon set — a consistent library built on a 24px grid with a single accent color, so every
        glyph shares the same weight and optical sizing.
      </SectionHead>
      <IconGallery copied={copied} onCopy={onCopy} />
    </section>
  );
}
