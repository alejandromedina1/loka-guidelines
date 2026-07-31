import { SectionHead } from "../common/SectionHead.jsx";
import { PatternsGallery } from "../patterns/PatternsGallery.jsx";

// Foundations / Patterns — reusable background textures and motifs.
export function PatternsSection({
  registerRef,
  copied,
  onCopy,
  theme,
  selectedPattern,
  setSelectedPattern,
}) {
  return (
    <section id="patterns" className="section" ref={(el) => registerRef("patterns", el)}>
      <SectionHead title="Patterns">
        Decorative background textures and motifs, built for section and card backgrounds. Pick a
        pattern, adjust it live, then copy its CSS.
      </SectionHead>
      <PatternsGallery
        copied={copied}
        onCopy={onCopy}
        theme={theme}
        selected={selectedPattern}
        setSelected={setSelectedPattern}
      />
    </section>
  );
}
