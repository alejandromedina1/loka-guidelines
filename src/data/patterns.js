// Background patterns & motifs — reusable decorative textures for section
// backgrounds, empty states, and cards. Each entry drives a live playground:
// `defaults`/`controls` seed the adjustable knobs, and `id` selects the tile
// builder in utils/patternStyles.js. Colors are per-theme hex pairs rather than
// CSS custom properties, because the mark color has to be baked into the inline
// SVG background-image. The dark values are picked to hold roughly the same
// mark-to-surface contrast as their light counterparts, not to be strict
// inverses of them.

export const PATTERN_BG = { light: "#FDFDFD", dark: "#020F1F" }; // dark = gray-90

export const PATTERNS = [
  {
    id: "dot-grid",
    name: "Dot Grid",
    color: { light: "#E7ECF2", dark: "#041D3E" }, // gray-10 / gray-80
    description:
      "An evenly spaced field of square dots for subtle section and card backgrounds. Adjust the square size and the gap between dots.",
    defaults: { size: 3, gap: 21 },
    controls: [
      { key: "size", label: "Square size", min: 2, max: 4, step: 1, unit: "px" },
      { key: "gap", label: "Spacing", min: 20, max: 40, step: 1, unit: "px" },
    ],
  },
  {
    id: "line-grid",
    name: "Line Grid",
    color: { light: "#EFF1F5", dark: "#041D3E" }, // gray-5 / gray-80
    description:
      "A continuous grid of hairlines for large hero and section backgrounds, where the dot field would read as noise. Lines are always 1px; adjust the gap between them.",
    // `thickness` is fixed at a 1px hairline — no control, so it never varies.
    defaults: { thickness: 1, gap: 147 },
    controls: [{ key: "gap", label: "Spacing", min: 60, max: 150, step: 1, unit: "px" }],
  },
  {
    id: "glow",
    name: "Soft Blue Glow",
    color: { light: "#1877F2", dark: "#1877F2" }, // blue-80
    description:
      "A diffuse blue halo that lifts a call-to-action or the corner of a section without adding an edge. Bleed it off the container so the falloff never resolves into a visible circle.",
    defaults: { size: 333, intensity: 30 },
    controls: [
      { key: "size", label: "Diameter", min: 300, max: 640, step: 1, unit: "px" },
      { key: "intensity", label: "Intensity", min: 20, max: 60, step: 1, unit: "%" },
    ],
  },
  {
    id: "corner-markers",
    // Not a background fill like the others: four boxes straddling a
    // container's edges, so the gallery renders it as real nodes.
    kind: "frame",
    name: "Corner Markers",
    color: { light: "#186BF3", dark: "#186BF3" }, // blue-100
    // The framed edge picks up the Line Grid ink, since in use the markers pin
    // a block to that grid and land on its intersections.
    lineColor: { light: "#EFF1F5", dark: "#041D3E" }, // gray-5 / gray-80
    description:
      "Small blue squares centred on the corners of a block, pinning it to the layout grid. They straddle the edge rather than sitting inside it, so each square reads as a crossing point, not a decoration in the corner.",
    defaults: { size: 12 },
    // Steps in 2s across the 6–12px range: 6, 8, 10, 12. Odd sizes can't sit
    // centred on an edge without landing on a half pixel, so they're skipped.
    controls: [{ key: "size", label: "Marker size", min: 6, max: 12, step: 2, unit: "px" }],
  },
];
