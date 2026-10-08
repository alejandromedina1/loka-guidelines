// A text segmented control, for a property that is one of two or three named
// values — Screen | Voice | Canvas.
//
// PgIconToggle is the same control with icons, and this shares its look: the
// grey track, the raised white segment for the chosen one. It exists because
// the AI hub's pattern panel needed the text version, and drawing it there by
// hand would have been a second segmented control in a project that has one.
//
// It stacks — the label above, the track at the panel's full width under it —
// because two or three words side by side don't fit beside a label in 260px,
// and a full-width track is also the bigger, calmer target.
export function PgSegment({ label, value, options, onChange, disabled }) {
  return (
    <div className="pg-row pg-row-stack" data-disabled={disabled}>
      <span className="pg-row-label">{label}</span>
      <span className="pg-segment" role="group" aria-label={label}>
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            className="pg-segment-btn"
            data-active={value === o.value}
            aria-pressed={value === o.value}
            disabled={disabled}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </span>
    </div>
  );
}
