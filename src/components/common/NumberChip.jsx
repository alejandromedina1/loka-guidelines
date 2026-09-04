// The Number Chip, as a component.
//
// Loka Figma "Number Chip" (node 391:384): a fixed 32x20 pill holding one
// number. The project had been drawing it by hand in three places — the Icon
// Gallery's per-category counts and the AI hub's two label counts — each with
// its own box, type size and fill.
//
// Two things about this node are worth keeping straight:
//
//   The width is fixed, not hugging. It holds up to three characters; past
//   that the number has to be capped ("99+") rather than the box allowed to
//   grow, or a row of chips stops lining up.
//
//   It is bound to semantic tokens — `color-bg-muted` and
//   `color-text-secondary` — not to the `colors/neutral/*` primitives the
//   older components use. Those resolve to gray-5 and gray-70 today, and the
//   values below are the resolved pair; the names are recorded so a future
//   theme pass knows which rung to follow.
export const NUMBER_CHIP_SPEC = {
  radius: 500,
  lineHeight: 1.45,
  fill: "#EFF1F5", // color-bg-muted -> gray-5
  label: "#2E3F5A", // color-text-secondary -> gray-70
};

// 20 is Figma's own size and it anchors the scale, the same way the Tag's
// sourced 24 anchors its three. The second step is not a guess: the sourced
// chip is 32x20 with 14px text, so width is exactly 1.6x the height and the
// type is exactly 0.7x it. Holding both ratios at height 16 gives 25.6 and
// 11.2 — rounded to 26 and 11.
//
// It exists because 20/14px only reads as a count beside a title. The Icon
// Gallery's category name is 16px/600 and takes the sourced size; the AI hub's
// two label rows are 11px uppercase eyebrows, where a 14px number is louder
// than the thing it belongs to. At height 16 the number matches its label
// exactly rather than shouting over it.
export const NUMBER_CHIP_SIZES = [16, 20];

export const NUMBER_CHIP_BOX = {
  20: { width: 32, height: 20, fontSize: 14 }, // Figma's own
  16: { width: 26, height: 16, fontSize: 11 }, // the same two ratios, held
};

export const toChipSize = (size) =>
  NUMBER_CHIP_SIZES.includes(parseInt(size, 10)) ? parseInt(size, 10) : 20;

export function NumberChip({ size = 20, children, ...rest }) {
  const px = toChipSize(size);
  return (
    <span className="number-chip" data-size={px === 20 ? undefined : px} {...rest}>
      {children}
    </span>
  );
}
