// A labelled two-icon switch for the playground's properties panel — same
// row shape as PgSelect, but for a control with exactly two options that read
// better as icons than as dropdown text (Device: Desktop/Mobile). Same
// segmented-pill pattern as the TopBar's light/dark switch, sized down to fit
// this panel's rows.
export function PgIconToggle({ label, value, options, onChange, disabled }) {
  return (
    <div className="pg-row" data-disabled={disabled}>
      <span className="pg-row-label">{label}</span>
      <span className="pg-icon-toggle">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            className="pg-icon-toggle-btn"
            data-active={value === o.value}
            disabled={disabled}
            onClick={() => onChange(o.value)}
            aria-label={o.value}
            aria-pressed={value === o.value}
          >
            {o.icon}
          </button>
        ))}
      </span>
    </div>
  );
}
