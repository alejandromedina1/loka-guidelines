// A labelled row of clickable color swatches for the playground's properties
// panel — same row shape as PgSelect, but for the Avatar's Initials variant,
// where comparing six colors reads faster side by side than as dropdown text.
export function PgColorPicker({ label, value, options, swatches, onChange, disabled }) {
  return (
    <div className="pg-row" data-disabled={disabled}>
      <span className="pg-row-label">{label}</span>
      <span className="pg-color-picker">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            className="pg-color-swatch"
            data-active={value === o}
            style={{ background: swatches[o]?.bg }}
            disabled={disabled}
            onClick={() => onChange(o)}
            aria-label={o}
            aria-pressed={value === o}
          />
        ))}
      </span>
    </div>
  );
}
