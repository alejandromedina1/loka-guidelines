import { useEffect, useRef, useState } from "react";

// A labelled numeric slider for the playground's properties panel, paired
// with a typable number field so exact values can be entered directly.
export function PgRange({ label, value, min, max, step = 1, unit = "", onChange, disabled }) {
  const [text, setText] = useState(String(value));
  const focused = useRef(false);

  // Keep the text field in sync with external value changes (e.g. dragging
  // the slider), but never fight the user while they're mid-keystroke.
  useEffect(() => {
    if (!focused.current) setText(String(value));
  }, [value]);

  const commit = (raw) => {
    const n = Number(raw);
    if (Number.isNaN(n)) return;
    onChange(Math.min(max, Math.max(min, n)));
  };

  return (
    <div className="pg-row pg-row-range" data-disabled={disabled}>
      <div className="pg-row-head">
        <span className="pg-row-label">{label}</span>
        <span className="pg-row-value">
          <input
            className="pg-row-value-input"
            type="number"
            min={min}
            max={max}
            step={step}
            value={text}
            disabled={disabled}
            aria-label={`${label} value`}
            onFocus={() => {
              focused.current = true;
            }}
            onChange={(e) => {
              setText(e.target.value);
              commit(e.target.value);
            }}
            onBlur={() => {
              focused.current = false;
              setText(String(value));
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
            }}
          />
          {unit}
        </span>
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
