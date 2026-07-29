import { hexToRgb, luminance } from "../../utils/color.js";

// A single color chip. Foreground text/contrast flips automatically based on
// the swatch's luminance so labels stay legible on light and dark colors.
export function Swatch({ group, token, copied, onCopy }) {
  const isLight = luminance(hexToRgb(token.hex)) > 0.55;
  const hex = `#${token.hex.toUpperCase()}`;
  const id = `swatch-${group}-${token.name}`;
  const isCopied = copied === id;
  const fg = isLight ? "#010812" : "#FFFFFF";
  const fgDim = isLight ? "rgba(1,8,18,.55)" : "rgba(255,255,255,.65)";

  return (
    <div
      className="swatch"
      style={{ background: hex, boxShadow: isLight ? "inset 0 0 0 1px var(--line)" : "none" }}
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
