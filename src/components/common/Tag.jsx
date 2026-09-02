// The Tag chip, as a component.
//
// Loka Figma "20 / tag" (node 149:412): a bordered, unfilled box carrying one
// uppercase label. The layer is named "20" but measures 24px tall — that's the
// one sourced size, so it anchors the middle of the three the system adds
// around it.
//
// The box itself is painted by .tag-chip in global.css; the only thing that
// varies per size is the height and the horizontal padding, which lives here
// because it's the component's own spec rather than a page's styling.
export const TAG_SIZES = [20, 24, 28];

// Padding grows with the box since the corner radius doesn't. 8px at 24px is
// Figma's own sourced pairing; the other two extend that relationship.
export const TAG_PAD_X = { 20: 6, 24: 8, 28: 10 };

export const toTagPx = (size) => parseInt(size, 10) || 24;

export function Tag({ size = 24, children }) {
  const px = toTagPx(size);
  const padX = TAG_PAD_X[px] ?? TAG_PAD_X[24];
  return (
    <span className="tag-chip" style={{ height: px, padding: `0 ${padX}px` }}>
      {children}
    </span>
  );
}
