import { hexToRgb, luminance } from "../../utils/color.js";

const INK = "#010812";

// Luminance above which the Copy HEX pill switches to its dark fill. Sits
// between gray-50 (0.27) and gray-40 (0.45) so the flip lands where the
// palette stops reading as a "dark" color.
const PILL_FLIP = 0.36;

// Everything a chip's appearance derives from is a pure function of its hex, and
// the palette is a fixed set of them — so the luminance maths and the style object
// are computed once per colour and cached at module level. Without this, all 27
// chips redo it on every re-render of the page, and the page re-renders whenever
// the scroll-spy crosses a section.
const paintCache = new Map();

function swatchPaint(rawHex) {
  const cached = paintCache.get(rawHex);
  if (cached) return cached;

  const lum = luminance(hexToRgb(rawHex));
  const isLight = lum > 0.55;
  // Dark swatches get a light pill, light swatches a dark one, so it reads at
  // full contrast in its default state (not only while hovered).
  const darkPill = lum > PILL_FLIP;
  const paint = {
    hex: `#${rawHex.toUpperCase()}`,
    fg: isLight ? "#010812" : "#FFFFFF",
    fgDim: isLight ? "rgba(1,8,18,.55)" : "rgba(255,255,255,.65)",
    style: {
      background: `#${rawHex.toUpperCase()}`,
      boxShadow: isLight ? "inset 0 0 0 1px var(--line)" : "none",
      "--pill-bg": darkPill ? INK : "#FFFFFF",
      "--pill-fg": darkPill ? "#FFFFFF" : INK,
      "--pill-ring": darkPill ? "rgba(255,255,255,.22)" : "rgba(1,8,18,.16)",
      // Scrim pushes the swatch away from the pill, never toward it.
      "--swatch-scrim": darkPill ? "rgba(255,255,255,.18)" : "rgba(1,8,18,.24)",
    },
  };
  paintCache.set(rawHex, paint);
  return paint;
}

// A single color chip. Foreground text/contrast flips automatically based on
// the swatch's luminance so labels stay legible on light and dark colors.
export function Swatch({ group, token, copied, onCopy }) {
  const { hex, fg, fgDim, style } = swatchPaint(token.hex);
  const id = `swatch-${group}-${token.name}`;
  const isCopied = copied === id;

  return (
    <div className="swatch" style={style}>
      <div className="swatch-hover">
        <button className="swatch-copy" onClick={() => onCopy(hex, id)} title={`Copy ${hex}`}>
          {isCopied ? "Copied" : "Copy HEX"}
        </button>
      </div>
      <div className="swatch-meta">
        <span className="swatch-name" style={{ color: fg }}>
          {token.name}
        </span>
        <span className="swatch-hex" style={{ color: fgDim }}>
          {hex}
        </span>
      </div>
    </div>
  );
}
