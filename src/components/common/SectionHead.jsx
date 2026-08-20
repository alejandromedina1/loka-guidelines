// The heading block that opens each documentation section: a title and an optional
// descriptive paragraph.
//
// It used to carry an "Open in Figma" link under the title, currently switched off.
// Restoring it is a `figma` prop, a <FigmaLink> here, and a wrapper around the two
// so the head's two-column grid stays two columns — the node ids it needs are still
// in data/figma.js.
export function SectionHead({ title, children }) {
  return (
    <div className="section-head">
      <h2 className="section-title">{title}</h2>
      {children && <p className="section-desc">{children}</p>}
    </div>
  );
}
