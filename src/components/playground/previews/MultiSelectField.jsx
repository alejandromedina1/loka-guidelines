import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SELECT_GROUPS, SELECT_MAX } from "../../../data/components.js";
import { CaretDown, CheckBold, CircleX } from "../../common/Icon.jsx";

// Searchable, grouped multi-select — the Loka Figma "Dropdown" component
// (node 6916:50169). Figma documents it as five variants; they're all states of
// one control, so this is built interactive and each variant falls out of use:
//
//   Default     closed, nothing picked
//   Opened      list showing, nothing picked
//   Selected    list showing, one or more picked (ticked rows + tags below)
//   No results  a query that matches nothing
//   Complete    the three-selection ceiling reached: the list stays open with the
//               unpicked rows disabled, so a swap starts by unticking
export function MultiSelectField({ disabled, error, placeholder }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState([]);
  const rootRef = useRef(null);
  const inputRef = useRef(null);

  const atMax = selected.length >= SELECT_MAX;

  // Filtering keeps a group only while it still has a matching option.
  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SELECT_GROUPS;
    return SELECT_GROUPS.map((g) => ({
      ...g,
      options: g.options.filter((o) => o.toLowerCase().includes(q)),
    })).filter((g) => g.options.length > 0);
  }, [query]);

  const noResults = open && groups.length === 0;

  // Every way out of the open state goes through here — caret, Escape, and
  // clicking away — so collapsing always lands back on the default closed
  // control instead of reopening onto a stale filter. Selections survive:
  // closing the list isn't a way to clear them.
  const closeList = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);

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
    // Let the input mount before focusing it.
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  // The ceiling never closes the list or clears a selection — it only stops the
  // list growing. Unticking a chosen row is the way back under the limit, which
  // is why the ticked rows stay live while the rest go disabled.
  const toggle = (option) => {
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

  // Same footer open or closed, so the tags don't shift as the panel collapses.
  // Nothing picked yet means no footer at all: the control ends flush at the
  // list rather than holding an empty blue strip open for tags that don't
  // exist — it appears with the first selection.
  const foot = selected.length > 0 && (
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
              <CircleX size={24} />
            </button>
          </span>
        ))}
      </div>
    </div>
  );

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
      >
        {open ? (
          <>
            {/* Clicking the control again collapses it, the way the filter chip
                does. The filter keeps a button when open; this row becomes a
                search input, so only clicks outside the input itself count —
                otherwise focusing the field to type would close the panel.
                Keyboard users get the same exit via the caret button or Esc. */}
            <div
              className="ms-search"
              data-max={atMax || undefined}
              onClick={(e) => {
                if (e.target !== inputRef.current) closeList();
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
                groups.map((g) => (
                  <div className="ms-group" key={g.label}>
                    <span className="ms-group-label">{g.label}</span>
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
            <button
              type="button"
              className="ms-control"
              disabled={disabled}
              onClick={openList}
              aria-expanded={false}
            >
              {/* Live even at the ceiling: reopening is how a selection gets
                  swapped out, so the closed control never mutes. */}
              <span className="ms-control-text">{placeholder}</span>
              {/* Same 20px box the open state's caret button uses, so opening the
                  dropdown doesn't nudge the glyph sideways. */}
              <span className="ms-caret" aria-hidden>
                <CaretDown />
              </span>
            </button>
            {foot}
          </>
        )}
      </div>
    </div>
  );
}
