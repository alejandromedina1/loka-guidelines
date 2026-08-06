import { SearchIcon } from "../common/Icon.jsx";

// The ⌘K command-palette overlay: a search input over a scrollable list of
// results (or curated suggestions when the query is empty).
export function SearchOverlay({ query, setQuery, results, onRun, onClose }) {
  return (
    <div className="searchov" onClick={onClose}>
      <div className="searchbox" onClick={(e) => e.stopPropagation()}>
        <div className="searchbox-input">
          <SearchIcon strokeWidth={1.4} />
          <input
            autoFocus
            placeholder="Search…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && results[0]) onRun(results[0]);
            }}
          />
          <button className="searchbox-esc" onClick={onClose}>
            Esc
          </button>
        </div>
        <div className="searchbox-results">
          {!query.trim() && <p className="searchbox-hint">Suggestions</p>}
          {results.length === 0 ? (
            <p className="searchbox-empty">No results for “{query}”.</p>
          ) : (
            results.map((r, i) => (
              <button key={`${r.kind}-${r.label}-${i}`} className="searchres" onClick={() => onRun(r)}>
                <span className="searchres-label">{r.label}</span>
                {r.sub && <span className="searchres-sub">{r.sub}</span>}
                <span className="searchres-kind">{r.kind}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// The search trigger, in the topbar.
//
// It used to be a pill floating at the bottom centre of the viewport. That was
// fine while the page scrolled freely, but once the Components section was
// sized to the viewport its canvas foot — the state pills on the left, "Get the
// code" on the right — landed at the bottom of the screen too, and the pill sat
// on top of them. Moving it anywhere else in the floating layer just picks a
// different thing to cover, so it isn't floating any more: the topbar has a row
// of its own that nothing else can occupy.
//
// Styled as a field rather than a button because that's what it opens, and it
// now shows on every section including the intro — there's no longer a reason
// to hide it, and search should be reachable from anywhere.
export function SearchTrigger({ onOpen }) {
  return (
    <button
      className="topbar-search"
      onClick={onOpen}
      aria-label="Search"
      aria-keyshortcuts="Meta+K"
    >
      <SearchIcon />
      <span className="topbar-search-text">Search</span>
      <span className="topbar-search-kbd">⌘K</span>
    </button>
  );
}
