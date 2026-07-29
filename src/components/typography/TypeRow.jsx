import { typeVar } from "../../utils/color.js";
import { CopyValue } from "../common/CopyValue.jsx";
import { ChevronDown } from "../common/Icon.jsx";

// One row of the type scale: a live specimen plus an expandable detail panel
// of copyable size / line-height / weight / CSS values.
export function TypeRow({ token, breakpoint, copied, onCopy, expanded, onToggle }) {
  const rowId = `type-${breakpoint}-${token.name}`;
  const lhPx = Math.round((token.size * token.lh) / 100);
  const previewSize = Math.min(token.size, 44); // cap so huge sizes stay in the row
  const varName = typeVar(token.name);
  const cssBlock = `${varName}: ${token.size}px/${(token.lh / 100).toFixed(2)} 'Alliance No.2';`;
  const specimen = token.upper ? "The Spectrum" : "The quick brown fox";

  return (
    <div className="row trow" data-open={expanded}>
      <button className="row-head trow-head" onClick={() => onToggle(rowId)}>
        <span
          className="trow-specimen"
          style={{
            fontSize: previewSize,
            lineHeight: 1,
            fontWeight: token.weight,
            textTransform: token.upper ? "uppercase" : "none",
            letterSpacing: token.upper ? "0.08em" : token.size > 40 ? "-0.02em" : "-0.01em",
          }}
        >
          {specimen}
        </span>
        <span className="trow-meta">
          <span className="trow-name">{token.name}</span>
          <span className="trow-spec">
            {token.size} / {token.lh}
          </span>
        </span>
        <span className="row-chevron" aria-hidden>
          <ChevronDown />
        </span>
      </button>
      {expanded && (
        <div className="row-detail trow-detail">
          <div className="detail-values">
            <CopyValue label="Size" value={`${token.size}px`} id={`${rowId}-size`} copied={copied} onCopy={onCopy} />
            <CopyValue label="Line" value={`${lhPx}px (${token.lh}%)`} id={`${rowId}-lh`} copied={copied} onCopy={onCopy} />
            <CopyValue label="Weight" value={String(token.weight)} id={`${rowId}-w`} copied={copied} onCopy={onCopy} />
            <CopyValue label="Family" value="Alliance No.2" id={`${rowId}-fam`} copied={copied} onCopy={onCopy} mono={false} />
          </div>
          <div className="detail-values">
            <CopyValue label="CSS" value={cssBlock} id={`${rowId}-css`} copied={copied} onCopy={onCopy} />
            <CopyValue label="Var" value={`var(${varName})`} id={`${rowId}-var`} copied={copied} onCopy={onCopy} />
          </div>
        </div>
      )}
    </div>
  );
}
