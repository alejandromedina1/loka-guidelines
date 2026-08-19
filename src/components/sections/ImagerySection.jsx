import { SectionHead } from "../common/SectionHead.jsx";
import { ImageryGallery } from "../imagery/ImageryGallery.jsx";

// Foundations / Imagery — how photography is treated before it goes on a page.
export function ImagerySection({ registerRef, copied, onCopy, selectedImagery, setSelectedImagery }) {
  return (
    <section id="imagery" className="section" ref={(el) => registerRef("imagery", el)}>
      <SectionHead title="Imagery">
        Four treatments for photography, from the bare image to a dot field and a blurred caption
        band. Pick a style, adjust it live, then copy its CSS.
      </SectionHead>
      <ImageryGallery
        copied={copied}
        onCopy={onCopy}
        selected={selectedImagery}
        setSelected={setSelectedImagery}
      />
    </section>
  );
}
