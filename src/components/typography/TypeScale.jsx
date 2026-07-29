import { TYPE_SCALE } from "../../data/typeScale.js";
import { TypeRow } from "./TypeRow.jsx";

// The full type scale for one breakpoint. A single expanded row is tracked by
// the parent so only one detail panel is open at a time across both scales.
export function TypeScale({ breakpoint, copied, onCopy, expandedRow, onToggleRow }) {
  return (
    <div className="rows">
      {TYPE_SCALE[breakpoint].map((t) => (
        <TypeRow
          key={t.name}
          token={t}
          breakpoint={breakpoint}
          copied={copied}
          onCopy={onCopy}
          expanded={expandedRow === `type-${breakpoint}-${t.name}`}
          onToggle={onToggleRow}
        />
      ))}
    </div>
  );
}
