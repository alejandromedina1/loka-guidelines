import { GRAPHICS } from "../../data/graphics.js";

// A grid of isometric spot illustrations. Each card reveals its active state on
// hover (handled in CSS).
export function GraphicsGallery() {
  return (
    <div className="gfx-grid">
      {GRAPHICS.map((g) => (
        <div key={g.label} className="gfx-card" title={g.label}>
          <span className="gfx-art" dangerouslySetInnerHTML={{ __html: g.svg }} />
          <span className="gfx-label">{g.label}</span>
        </div>
      ))}
    </div>
  );
}
