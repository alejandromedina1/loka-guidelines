// Background patterns & motifs — reusable decorative textures for section
// backgrounds, empty states, and cards. Each entry drives a live playground:
// `defaults`/`controls` seed the adjustable knobs. The dot color is baked
// into an inline SVG background-image, so it's a plain per-theme hex pair
// rather than a CSS custom property.

export const DOT_COLOR = { light: "#C7CFDB", dark: "#2E3947" };

export const PATTERNS = [
  {
    id: "dot-grid",
    name: "Dot Grid",
    description:
      "An evenly spaced field of square dots for subtle section and card backgrounds. Adjust the square size and the horizontal/vertical spacing independently.",
    defaults: { size: 3, gapX: 21, gapY: 21 },
    controls: [
      { key: "size", label: "Square size", min: 1, max: 12, step: 1, unit: "px" },
      { key: "gapX", label: "Horizontal spacing", min: 4, max: 64, step: 1, unit: "px" },
      { key: "gapY", label: "Vertical spacing", min: 4, max: 64, step: 1, unit: "px" },
    ],
  },
];
