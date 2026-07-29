import { SectionHead } from "../common/SectionHead.jsx";
import { GraphicsGallery } from "../graphics/GraphicsGallery.jsx";

// Foundations / Graphics — the isometric spot-illustration set.
export function GraphicsSection({ registerRef }) {
  return (
    <section id="graphics" className="section" ref={(el) => registerRef("graphics", el)}>
      <SectionHead title="Graphics">
        Industry spot illustrations — a consistent set of isometric graphics used across marketing and
        product surfaces. Hover any graphic to see its active state.
      </SectionHead>
      <GraphicsGallery />
    </section>
  );
}
