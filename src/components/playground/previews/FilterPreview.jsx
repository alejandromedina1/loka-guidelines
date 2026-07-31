import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FILTER_GROUPS } from "../../../data/components.js";
import { BestPracticesPanel } from "../BestPracticesPanel.jsx";
import { CaretDown } from "../../common/Icon.jsx";

const FILTER_SPECS = [
  ["Bar", "#EFF1F5 · gray-5"],
  ["Bar radius", "500px · pill"],
  ["Bar gap", "6px"],
  ["Chip", "36px · hug width"],
  ["Chip padding", "12px"],
  ["Chip radius", "80px"],
  ["Chip gap", "6px"],
  ["Chip · open", "#D6DCE6 · gray-20"],
  ["Arrow", "12px · gray-40 / gray-50 open"],
  ["Font", "Alliance No.2"],
  ["Text", "16px / 1.3"],
  ["Label", "#041D3E · gray-80"],
  ["Panel offset", "44px below the bar"],
  ["Panel", "#F5F6FA · 1px #EFF1F5"],
  ["Panel radius", "12px · padding 4px"],
  ["Row", "44px · padding 12px · radius 10px"],
  ["Count", "#A8B3CA · 22px column"],
];

const FILTER_NOTE =
  "The panel's first row is an input, not a heading — type to filter. Counts sit in a fixed 22px column so labels stay aligned across one- and two-digit values. The panel is absolute: it overlays the page rather than pushing it down.";

// Filter bar — the Loka Figma "filter" component (node 4866:24030). Figma
// documents two variants; they're the same control in two states, so this is
// built interactive and each variant falls out of use:
//
//   default   every chip plain on the gray-5 bar
//   active    the open chip on gray-20, its arrow flipped up, panel below
//
// The panel's first row is a real input — typing filters the options under it.
export function FilterPreview({ bestPractices }) {
  const [openLabel, setOpenLabel] = useState(null);
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState({});
  const rootRef = useRef(null);
  const inputRef = useRef(null);

  // Closing always drops the query, so reopening starts clean rather than on a
  // stale filter — same collapse rule as the multi-select.
  const close = useCallback(() => {
    setOpenLabel(null);
    setQuery("");
  }, []);

  useEffect(() => {
    if (!openLabel) return;
    const onDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) close();
    };
    const onKey = (e) => e.key === "Escape" && close();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [openLabel, close]);

  const openGroup = FILTER_GROUPS.find((g) => g.label === openLabel);

  const options = useMemo(() => {
    if (!openGroup) return [];
    const q = query.trim().toLowerCase();
    if (!q) return openGroup.options;
    return openGroup.options.filter((o) => o.label.toLowerCase().includes(q));
  }, [openGroup, query]);

  const toggleGroup = (label) => {
    if (label === openLabel) return close();
    setOpenLabel(label);
    setQuery("");
    // Let the panel mount before focusing its input.
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const pick = (groupLabel, option) =>
    setPicked((cur) => ({
      ...cur,
      [groupLabel]: cur[groupLabel] === option ? undefined : option,
    }));

  return (
    <div className="bp-stage">
      <div className="filt" ref={rootRef}>
        <div className="filt-bar">
          {FILTER_GROUPS.map((g) => {
            const on = g.label === openLabel;
            return (
              <button
                key={g.label}
                type="button"
                className="filt-toggle"
                data-open={on || undefined}
                aria-expanded={on}
                onClick={() => toggleGroup(g.label)}
              >
                {g.label}
                <CaretDown open={on} />
              </button>
            );
          })}
        </div>

        {openGroup && (
          <div className="filt-panel">
            <input
              ref={inputRef}
              className="filt-search"
              placeholder="Looking for"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {options.length === 0 ? (
              <p className="filt-empty">Not matching options.</p>
            ) : (
              options.map((o) => (
                <button
                  key={o.label}
                  type="button"
                  className="filt-option"
                  data-picked={picked[openGroup.label] === o.label || undefined}
                  aria-pressed={picked[openGroup.label] === o.label}
                  onClick={() => pick(openGroup.label, o.label)}
                >
                  <span className="filt-count">{o.count}</span>
                  <span className="filt-option-label">{o.label}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>
      {bestPractices && <BestPracticesPanel rows={FILTER_SPECS} note={FILTER_NOTE} />}
    </div>
  );
}
