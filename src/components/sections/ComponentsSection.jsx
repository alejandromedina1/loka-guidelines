import { SectionHead } from "../common/SectionHead.jsx";
import { ComponentPlayground } from "../playground/ComponentPlayground.jsx";

// Components — the interactive playground. The section title tracks the
// currently selected component.
export function ComponentsSection({ registerRef, copied, onCopy, selectedComponent, setSelectedComponent, theme }) {
  return (
    <section id="components" className="section" ref={(el) => registerRef("components", el)}>
      <SectionHead title={selectedComponent}>
        Select a component from the sidebar to preview it live, adjust its properties, and copy the code.
      </SectionHead>
      <ComponentPlayground
        copied={copied}
        onCopy={onCopy}
        selected={selectedComponent}
        setSelected={setSelectedComponent}
        theme={theme}
      />
    </section>
  );
}
