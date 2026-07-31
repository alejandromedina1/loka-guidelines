// A labelled numeric slider for the playground's properties panel. The slider
// is the only way to change the value — the readout is plain text, so it sits
// flush to the row's right edge opposite the label rather than being inset by
// an input's border.
export function PgRange({ label, value, min, max, step = 1, unit = "", onChange, disabled }) {
  return (
    <div className="pg-row pg-row-range" data-disabled={disabled}>
      <div className="pg-row-head">
        <span className="pg-row-label">{label}</span>
        <span className="pg-row-value">{`${value}${unit}`}</span>
      </div>
      <input
        className="pg-range"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        aria-label={label}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}
