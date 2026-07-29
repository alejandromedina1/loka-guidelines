// A labelled on/off switch for the playground's properties panel.
export function PgToggle({ label, value, onChange, disabled }) {
  return (
    <div className="pg-row" data-disabled={disabled}>
      <span className="pg-row-label">{label}</span>
      <button
        className="pg-toggle"
        data-on={value}
        disabled={disabled}
        onClick={() => onChange(!value)}
        aria-pressed={value}
        aria-label={label}
      >
        <span className="pg-toggle-knob" />
      </button>
    </div>
  );
}
