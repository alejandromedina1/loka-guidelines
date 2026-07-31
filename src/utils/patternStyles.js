import { hexToRgb } from "./color.js";

// Builds the background CSS for each pattern. The grids are tileable inline-SVG
// background-images, so the mark size and the gap around it can vary
// independently (a plain CSS gradient can't isolate a square or hold a crisp
// hairline for an arbitrary fill color); both tile on a square cell, so the gap
// is the same on X and Y. The glow is a single non-repeating radial gradient.
// One builder per pattern id, keyed by the entries in data/patterns.js.
function rgba(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function tile(cell, marks, background) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${cell}' height='${cell}'>${marks}</svg>`;
  return {
    backgroundColor: background,
    backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(svg)}")`,
    backgroundSize: `${cell}px ${cell}px`,
  };
}

function dotGrid({ size, gap, color, background }) {
  const marks = `<rect width='${size}' height='${size}' fill='${color}'/>`;
  return tile(size + gap, marks, background);
}

// Two edges of the cell — one vertical, one horizontal — so tiling closes the grid.
function lineGrid({ thickness, gap, color, background }) {
  const cell = thickness + gap;
  const marks =
    `<rect width='${thickness}' height='${cell}' fill='${color}'/>` +
    `<rect width='${cell}' height='${thickness}' fill='${color}'/>`;
  return tile(cell, marks, background);
}

// Figma draws the halo as a blue→white ramp whose opacity also falls off, which
// over the surface works out to plain blue at alpha (1 - t)(1 - 2t/3) — the
// fractions below. CSS gradients interpolate premultiplied, so a single
// 0%→100% stop pair would trace a straight line through that curve and read
// noticeably heavier mid-falloff; sampling it at quarter-stops tracks it.
const GLOW_FALLOFF = [1, 0.625, 1 / 3, 0.125, 0];

function glow({ size, intensity, color, background }) {
  const stops = GLOW_FALLOFF.map(
    (f, i) => `${rgba(color, Number(((f * intensity) / 100).toFixed(3)))} ${i * 25}%`,
  );
  return {
    backgroundColor: background,
    // `closest-side` sizes the ramp to the tile's half-width, not its diagonal:
    // the outer stop lands exactly on the tile edge, so the halo reaches zero
    // before it's clipped instead of cutting off mid-falloff as a square.
    backgroundImage: `radial-gradient(circle closest-side, ${stops.join(", ")})`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    backgroundSize: `${size}px ${size}px`,
  };
}

const BUILDERS = { "dot-grid": dotGrid, "line-grid": lineGrid, glow };

export function patternStyle(id, values) {
  return BUILDERS[id](values);
}

export function patternCss(id, values) {
  return Object.entries(patternStyle(id, values))
    .map(([prop, value]) => `${prop.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}: ${value};`)
    .join("\n");
}

// Corner markers aren't a background — they're four boxes straddling the edges
// of a container, so they can't be clipped to it. This emits the rule set for a
// container plus four marker children rather than a block of background props.
const MARKER_CORNERS = [
  ["top", "left"],
  ["top", "right"],
  ["bottom", "left"],
  ["bottom", "right"],
];

export function cornerMarkersCss({ size, color }) {
  const offset = `-${size / 2}px`;
  return [
    ".frame-markers { position: relative; }",
    ".frame-markers > i {",
    "  position: absolute;",
    `  width: ${size}px;`,
    `  height: ${size}px;`,
    `  background: ${color};`,
    "}",
    ...MARKER_CORNERS.map(
      ([v, h], i) => `.frame-markers > i:nth-child(${i + 1}) { ${v}: ${offset}; ${h}: ${offset}; }`,
    ),
  ].join("\n");
}
