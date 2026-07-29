// A labelled dropdown control for the playground's properties panel.
export function PgSelect({ label, value, options, onChange, disabled }) {
  return (
    <label className="pg-row" data-disabled={disabled}>
      <span className="pg-row-label">{label}</span>
      <span className="pg-row-control">
        <select value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)}>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </span>
    </label>
  );
}
