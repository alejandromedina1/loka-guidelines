import { IMAGERY_PHOTOS } from "../../data/imagery.js";

// The photo row above every Imagery canvas. All three labs need it for the same
// reason: what a treatment or a frame actually looks like depends on the
// photograph under it, so swapping is the first thing worth trying — and it
// belongs next to the image rather than down in the properties panel.
//
// Shared rather than written three times so the labs can't drift apart on it.
//
// The last slot takes a photo of the reader's own, for the same reason the other
// five are switchable and one step further: knowing how a treatment sits on Loka's
// photography is no use when the photo you have to ship is a client's. It stays in
// the tab — an object URL, never uploaded anywhere — and there is one slot rather
// than a growing set, because the point is to try a photograph, not to build a
// library somewhere that won't be saved.
export function PhotoSwitcher({ current, onPick, local, onPickLocal }) {
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

      {local && (
        <button
          className="img-photo-btn"
          data-active={local.id === current}
          onClick={() => onPick(local.id)}
          title={local.label}
          aria-label="Show this on your own photo"
          aria-pressed={local.id === current}
        >
          <img src={local.src} alt="" />
        </button>
      )}

      {onPickLocal && (
        // A label wrapping a hidden input, not a button calling .click() on one:
        // the label is the native way to make a file input look like anything
        // else, and it keeps the keyboard and screen-reader behaviour that comes
        // with the input for free.
        <label className="img-photo-add" title="Check one of your own photos">
          {local ? "Replace" : "Your photo"}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onPickLocal(file);
              // Cleared so picking the same file twice still fires a change —
              // otherwise re-choosing a file you just edited does nothing.
              e.target.value = "";
            }}
          />
        </label>
      )}
    </div>
  );
}
