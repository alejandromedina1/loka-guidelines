import { ICON_CATEGORIES } from "../../data/icons.js";

// The icon library, grouped by category and filterable by name or keywords.
// Clicking a glyph copies its JSX tag (e.g. `<IconCheck />`).
export function IconGallery({ filter = "", copied, onCopy }) {
  const q = filter.trim().toLowerCase();
  // Filter and drop-if-empty in one pass rather than mapping every category and
  // then walking the result again. With no query there's nothing to compute, so
  // the whole list passes straight through.
  let groups;
  if (!q) {
    groups = ICON_CATEGORIES;
  } else {
    groups = [];
    for (const cat of ICON_CATEGORIES) {
      const icons = cat.icons.filter(
        (ic) => ic.name.toLowerCase().includes(q) || ic.keywords.toLowerCase().includes(q)
      );
      if (icons.length > 0) groups.push({ ...cat, icons });
    }
  }

  if (groups.length === 0) {
    return <p className="ico-empty">No icons match “{filter}”.</p>;
  }

  return (
    <div className="ico-groups">
      {groups.map((cat) => (
        <div key={cat.name} className="ico-group">
          <div className="ico-group-head">
            <span className="ico-group-name">{cat.name}</span>
            <span className="ico-group-count">{cat.icons.length}</span>
          </div>
          <div className="ico-grid">
            {cat.icons.map((ic) => (
              <button
                key={ic.name}
                className="ico-card"
                title={`Copy ${ic.name}`}
                onClick={() => onCopy(`<${ic.name} />`, `ico-${ic.name}`)}
              >
                <span className="ico-art" dangerouslySetInnerHTML={{ __html: ic.svg }} />
                <span className="ico-label">{copied === `ico-${ic.name}` ? "Copied" : ic.name}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
