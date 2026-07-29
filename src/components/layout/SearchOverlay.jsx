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

// The floating "Search" button shown once the user scrolls past the intro.
export function SearchFab({ onOpen }) {
  return (
    <button className="fab-search" onClick={onOpen} aria-label="Search">
      <SearchIcon />
      <span className="fab-search-text">Search</span>
      <span className="fab-search-kbd">⌘K</span>
    </button>
  );
}
