import { SectionHead } from "../common/SectionHead.jsx";
import { PatternsGallery } from "../patterns/PatternsGallery.jsx";

// Foundations / Patterns — reusable background textures and motifs.
export function PatternsSection({ registerRef, copied, onCopy, theme }) {
  return (
    <section id="patterns" className="section" ref={(el) => registerRef("patterns", el)}>
      <SectionHead title="Patterns">
        Decorative background textures and motifs, built for section and card backgrounds. Adjust each
        pattern live, then copy its CSS.
      </SectionHead>
      <PatternsGallery copied={copied} onCopy={onCopy} theme={theme} />
    </section>
  );
}
