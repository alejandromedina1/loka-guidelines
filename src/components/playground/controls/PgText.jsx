// A labelled text field for the playground's properties panel. A textarea rather
// than an input because the strings it edits carry their own line breaks — an
// image headline is broken by hand, not left to wrap — and because a caption is
// long enough that a single line would only ever show the end of it.
//
// Stacked rather than label-left/control-right like the other rows: at 260px the
// panel has no width to split, and a field this size reads as its own block.
export function PgText({ label, value, rows = 2, onChange, disabled }) {
  return (
    <label className="pg-row pg-row-text" data-disabled={disabled}>
      <span className="pg-row-label">{label}</span>
      <textarea
        className="pg-textarea"
        value={value}
        rows={rows}
        disabled={disabled}
        spellCheck={false}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
