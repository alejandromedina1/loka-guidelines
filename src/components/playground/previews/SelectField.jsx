import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SELECT_GROUPS, SELECT_MAX, SELECT_SINGLE_OPTIONS } from "../../../data/components.js";
import { CaretDown, CheckBold, CircleX } from "../../common/Icon.jsx";

// Searchable, grouped select — the Loka Figma "Dropdown" component
// (node 6916:50169). Figma documents it as five variants; they're all states of
// one control, so this is built interactive and each variant falls out of use:
//
//   Default     closed, nothing picked
//   Opened      list showing, nothing picked
//   Selected    list showing, one or more picked (ticked rows + tags below)
//   No results  a query that matches nothing
//   Complete    multi-select only — the three-selection ceiling reached: the list
//               stays open with the unpicked rows disabled, so a swap starts by
//               unticking
//
// `mode` splits the control in two: "multi" keeps the ceiling, the ticked rows,
// and the tag row underneath; "single" picks one row and closes on it, the way
// a native select would, with the chosen label filling the closed control
// instead of sitting in a tag. Both share every other row of markup and CSS —
// it's one control with two selection models, not two controls.
//
// `options` is a plain, ungrouped list for callers that just need a simple
// dropdown — the Input Field's Select type, say, where the demo content is one
// of four field types rather than the point of the page. Leaving it out falls
// back to a mode default: SELECT_GROUPS.multi's grouped, behaviour-describing
// copy for multi-select, or the flat SELECT_SINGLE_OPTIONS for single — one
// value doesn't need categories to sort through, so it gets no eyebrow label
// and no divider between rows either, the same as an explicit `options` list.
export function SelectField({ mode = "multi", options, disabled, error, focus, placeholder, onOpenChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState([]);
  const rootRef = useRef(null);
  const inputRef = useRef(null);

  // Only multi-select has a ceiling — single-select just replaces its one pick.
  const atMax = mode === "multi" && selected.length >= SELECT_MAX;

  // Filtering keeps a group only while it still has a matching option. A flat
  // list — an explicit `options` prop, or single-select's own default — is one
  // nameless group, so the panel skips its label and its divider.
  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const flat = options ?? (mode === "single" ? SELECT_SINGLE_OPTIONS : null);
    const all = flat ? [{ label: null, options: flat }] : SELECT_GROUPS.multi;
    if (!q) return all;
    return all
      .map((g) => ({ ...g, options: g.options.filter((o) => o.toLowerCase().includes(q)) }))
      .filter((g) => g.options.length > 0);
  }, [mode, options, query]);

  const noResults = open && groups.length === 0;

  // Every way out of the open state goes through here — caret, Escape, and
  // clicking away — so collapsing always lands back on the default closed
  // control instead of reopening onto a stale filter. Selections survive:
  // closing the list isn't a way to clear them.
  const closeList = useCallback(() => {
    setOpen(false);
    setQuery("");
    onOpenChange?.(false);
  }, [onOpenChange]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) closeList();
    };
    const onKey = (e) => e.key === "Escape" && closeList();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, closeList]);

  const openList = () => {
    if (disabled) return;
    setOpen(true);
    onOpenChange?.(true);
    // Let the input mount before focusing it.
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  // Single-select commits on the same click that picks the row: one value at a
  // time means there's nothing left to confirm. Multi-select's ceiling never
  // closes the list or clears a selection — it only stops the list growing.
  // Unticking a chosen row is the way back under the limit, which is why the
  // ticked rows stay live while the rest go disabled.
  const toggle = (option) => {
    if (mode === "single") {
      setSelected([option]);
      closeList();
      return;
    }
    if (selected.includes(option)) {
      setSelected((cur) => cur.filter((o) => o !== option));
      return;
    }
    if (atMax) return;
    const next = [...selected, option];
    setSelected(next);
    // The third pick drops the filter with it: the search row goes inert at the
    // ceiling, so leaving a query in it would strand a value nobody can edit —
    // and hide the rows that still need unticking.
    if (next.length >= SELECT_MAX) setQuery("");
  };

  const remove = (option) => setSelected((cur) => cur.filter((o) => o !== option));

  // Tags are multi-only — single-select's one value fills the closed control
  // directly instead of sitting in a removable chip below it.
  const foot = mode === "multi" && selected.length > 0 && (
    <div className="ms-foot">
      {atMax && <p className="ms-max">Maximum {SELECT_MAX} selected.</p>}
      <div className="ms-tags">
        {selected.map((o) => (
          <span className="ms-tag" key={o}>
            {o}
            <button
              type="button"
              className="ms-tag-x"
              aria-label={`Remove ${o}`}
              disabled={disabled}
              onClick={() => remove(o)}
            >
              <CircleX />
            </button>
          </span>
        ))}
      </div>
    </div>
  );

  // Single-select's closed control shows the chosen label in place of the
  // placeholder, the way a native select would — there's no tag to hold it.
  const filled = mode === "single" && selected.length > 0;
  const closedText = filled ? selected[0] : placeholder;

  return (
    // The anchor holds the closed control's height so the open panel can lift
    // out of flow and overlay whatever is below, instead of pushing it down.
    <div className="ms-anchor">
      <div
        ref={rootRef}
        className="ms"
        data-open={open || undefined}
        data-error={error || undefined}
        data-disabled={disabled || undefined}
        data-focus={focus || undefined}
      >
        {open ? (
          <>
            {/* Clicking the control again collapses it, the way the filter chip
                does. Once there's a query, clicking back into the input places
                the caret in it instead of closing — otherwise fixing a typo
                would collapse the panel. Empty, there's nothing in the input to
                protect, so any click on the row — including the placeholder —
                closes it, the same as clicking the closed control would have.
                Keyboard users get the same exit via the caret button or Esc. */}
            <div
              className="ms-search"
              data-max={atMax || undefined}
              onClick={(e) => {
                if (e.target === inputRef.current && query) return;
                closeList();
              }}
            >
              {/* At the ceiling there is nothing left to search for, so the row
                  goes inert — placeholder and caret both step down a gray. */}
              <input
                ref={inputRef}
                className="ms-search-input"
                placeholder="Type to search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={disabled || atMax}
              />
              {/* The caret toggles: it opens from the closed control, and collapses
                  back to the default state from here. */}
              <button
                type="button"
                className="ms-caret"
                aria-label="Close options"
                aria-expanded
                onClick={closeList}
              >
                <CaretDown open />
              </button>
            </div>
            <div className="ms-list" data-empty={noResults || undefined}>
              {noResults ? (
                <p className="ms-empty">Not matching solutions.</p>
              ) : (
                groups.map((g, i) => (
                  <div className="ms-group" key={g.label ?? i}>
                    {g.label && <span className="ms-group-label">{g.label}</span>}
                    <div className="ms-options">
                      {g.options.map((o) => {
                        const on = selected.includes(o);
                        return (
                          <button
                            type="button"
                            key={o}
                            className="ms-option"
                            data-selected={on || undefined}
                            aria-pressed={on}
                            disabled={atMax && !on}
                            onClick={() => toggle(o)}
                          >
                            <span className="ms-option-text">{o}</span>
                            {on && <CheckBold />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
            {foot}
          </>
        ) : (
          <>
            <div className="ms-control" data-filled={filled || undefined} data-disabled={disabled || undefined}>
              {/* Live even at the ceiling: reopening is how a selection gets
                  swapped out, so the closed control never mutes. */}
              <span className="ms-control-text">{closedText}</span>
              {/* The caret is the open trigger, not the row around it — the same
                  split the open state already draws between its search input
                  and its own caret button. Same 20px box either state, so
                  opening doesn't nudge the glyph sideways. */}
              <button
                type="button"
                className="ms-caret"
                aria-label="Open options"
                aria-expanded={false}
                disabled={disabled}
                onClick={openList}
              >
                <CaretDown />
              </button>
            </div>
            {foot}
          </>
        )}
      </div>
    </div>
  );
}

// Shared behavioural rules, in one place so the Input Field's Select type
// (always single) and the Dropdown component (either mode) read consistently
// rather than describing the same control two different ways.
export function selectRules(mode) {
  return [
    {
      rule: "The panel overlays the page — it never pushes content down.",
      why: "It's absolutely positioned, so it adds no height. Clicking the control again collapses it.",
    },
    mode === "multi"
      ? {
          rule: "At three selections the unpicked rows disable, so a swap starts by unticking.",
          why: "The panel stays open while that happens rather than closing on the third pick.",
        }
      : {
          rule: "Picking a row fills the field and closes the list.",
          why: "One value at a time, so there's nothing left to confirm — the same click that picks it commits it.",
        },
  ];
}

// The panel's own spec rows — values nothing on the canvas reports, since the
// redlines measure the closed control. Tags only exist in multi-select.
export function selectPanelSpecs(mode) {
  return [
    ["Panel fill", "#EEF2FE · blue-5"],
    ["List", "348px max · scrolls"],
    ["Option", "48px · radius 12px · #EFF1F5"],
    ...(mode === "multi" ? [["Tag", "#EEF2FE on 1px #D8E2F6"]] : []),
  ];
}
