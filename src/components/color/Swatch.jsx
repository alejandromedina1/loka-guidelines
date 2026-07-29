import { hexToRgb, luminance } from "../../utils/color.js";

const INK = "#010812";

// Luminance above which the Copy HEX pill switches to its dark fill. Sits
// between gray-50 (0.27) and gray-40 (0.45) so the flip lands where the
// palette stops reading as a "dark" color.
const PILL_FLIP = 0.36;

// A single color chip. Foreground text/contrast flips automatically based on
// the swatch's luminance so labels stay legible on light and dark colors.
export function Swatch({ group, token, copied, onCopy }) {
  const lum = luminance(hexToRgb(token.hex));
  const isLight = lum > 0.55;
  const hex = `#${token.hex.toUpperCase()}`;
  const id = `swatch-${group}-${token.name}`;
  const isCopied = copied === id;
  const fg = isLight ? "#010812" : "#FFFFFF";
  const fgDim = isLight ? "rgba(1,8,18,.55)" : "rgba(255,255,255,.65)";

  // Dark swatches get a light pill, light swatches a dark one, so it reads at
  // full contrast in its default state (not only while hovered).
  const darkPill = lum > PILL_FLIP;

  return (
    <div
      className="swatch"
      style={{
        background: hex,
        boxShadow: isLight ? "inset 0 0 0 1px var(--line)" : "none",
        "--pill-bg": darkPill ? INK : "#FFFFFF",
        "--pill-fg": darkPill ? "#FFFFFF" : INK,
        "--pill-ring": darkPill ? "rgba(255,255,255,.22)" : "rgba(1,8,18,.16)",
        // Scrim pushes the swatch away from the pill, never toward it.
        "--swatch-scrim": darkPill ? "rgba(255,255,255,.18)" : "rgba(1,8,18,.24)",
      }}
    >
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
