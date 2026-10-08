// The Toggle Switch, as a component.
//
// It existed only inside its Product Hub playground preview, drawn by the
// shared `.tgl` rules in global.css. The AI hub's pattern page needed real
// switches for its binary tools (Desktop / Mobile, Anatomy),
// and a second hand-drawn switch would be exactly the drift this
// folder exists to prevent — so the markup moved here and the preview renders
// this, the same way Button and Tab did before it.
//
// It ships bare, as the Product Hub documents it: no label of its own, so
// every caller passes `label` for the accessible name and draws any visible
// text beside it.
//
// `hovered` pins the hover look for the playground, which has to hold a state
// open for inspection; left off, the browser drives hover itself.
export function ToggleSwitch({ on, onChange, label, disabled, hovered, ...rest }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={!!on}
      aria-label={label}
      className="tgl"
      data-on={on || undefined}
      data-hover={hovered || undefined}
      disabled={disabled}
      onClick={() => onChange?.(!on)}
      {...rest}
    >
      <span className="tgl-knob" />
    </button>
  );
}
