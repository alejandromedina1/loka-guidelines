// The heading block that opens each documentation section: a title and an
// optional descriptive paragraph.
export function SectionHead({ title, children }) {
  return (
    <div className="section-head">
      <h2 className="section-title">{title}</h2>
      {children && <p className="section-desc">{children}</p>}
    </div>
  );
}
