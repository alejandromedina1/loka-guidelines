import { IMAGERY_PHOTOS } from "../../data/imagery.js";

// The photo row above either Imagery canvas. Both labs need it for the same reason:
// what a treatment or a placement actually looks like depends on the photograph
// under it, so swapping is the first thing worth trying — and it belongs next to the
// image rather than down in the properties panel.
//
// Shared rather than written twice so the two labs can't drift apart on it.
export function PhotoSwitcher({ current, onPick }) {
  return (
    <div className="pg-canvas-nav img-photos">
      <span className="img-photos-label">Photo</span>
      {IMAGERY_PHOTOS.map((p) => (
        <button
          key={p.id}
          className="img-photo-btn"
          data-active={p.id === current}
          onClick={() => onPick(p.id)}
          title={`${p.label} — ${p.subject}`}
          aria-label={`Show this on the ${p.label} photo`}
          aria-pressed={p.id === current}
        >
          <img src={p.src} alt="" />
        </button>
      ))}
    </div>
  );
}
