import { SectionHead } from "../common/SectionHead.jsx";
import { ImageryGallery } from "../imagery/ImageryGallery.jsx";
import { ImageryUsage } from "../imagery/ImageryUsage.jsx";

// Foundations / Imagery — how photography is treated, and where it sits.
//
// Two sub-sections under one nav item, the same shape Color uses for its ramps and
// matching the two sections on the Figma Imagery page. They're one foundation
// because placing a photo needs both answers at once, but they're presented
// differently on purpose: Styling is a parameter space, so it gets a playground,
// and Usage is a choice between three fixed compositions, so it gets a comparison.
export function ImagerySection({
  registerRef,
  copied,
  onCopy,
  selectedImagery,
  setSelectedImagery,
  selectedUsage,
  setSelectedUsage,
}) {
  return (
    <section id="imagery" className="section" ref={(el) => registerRef("imagery", el)}>
      <SectionHead title="Imagery">
        How photography is treated before it goes on a page, and how it sits once it's there.
      </SectionHead>

      <div id="imagery-styling" className="sub-anchor" ref={(el) => registerRef("imagery-styling", el)}>
        <div className="sub-head">
          <h3 className="sub-title">Styling</h3>
          <p className="section-desc">
            Four treatments, from the bare image to a dot field and a blurred caption band. Pick a
            style, adjust it live, then copy its CSS.
          </p>
        </div>
        <ImageryGallery
          copied={copied}
          onCopy={onCopy}
          selected={selectedImagery}
          setSelected={setSelectedImagery}
        />
      </div>

      <div id="imagery-usage" className="sub-anchor" ref={(el) => registerRef("imagery-usage", el)}>
        <div className="sub-head">
          <h3 className="sub-title">Usage</h3>
          <p className="section-desc">
            Three ways to place an image. Two of them are patterns the system already has — the
            Line Grid and the Corner Markers — wrapped around a photo rather than a section.
          </p>
        </div>
        <ImageryUsage
          copied={copied}
          onCopy={onCopy}
          selected={selectedUsage}
          setSelected={setSelectedUsage}
        />
      </div>
    </section>
  );
}
