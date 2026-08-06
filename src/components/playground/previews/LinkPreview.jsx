// Link — the Loka Figma "Link / Light" component (node 30:2487). Two states:
// resting gray-80 text with a marker dot that's in the layout but invisible,
// and a hover state that turns the text blue-100 and reveals the dot beside
// it. Real hover already shows this in the browser; the canvas pills pin the
// state for cases the mouse can't reach — same trick the Checkbox pills use.
export function LinkPreview({ state = "Default" }) {
  const hovered = state === "Hover";

  return (
    <a href="#" className="lnk" data-hover={hovered || undefined} onClick={(e) => e.preventDefault()}>
      <span className="lnk-dot" aria-hidden />
      Link
    </a>
  );
}
