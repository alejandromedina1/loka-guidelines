import { useDragOffset } from "./useDragOffset.js";

// The floating spec sheet behind the playground's "Best practices" toggle: the
// measured values and the guidance a designer would otherwise open Figma to
// read. Docked to the canvas's top-left rather than beside the component —
// previews are centred, so anchoring alongside pushes it off-canvas on a narrow
// stage. `rows` is a list of [label, value] pairs; `note` is the guidance line.
export function BestPracticesPanel({ rows, note, badge = "Specs" }) {
  const [pos, onGrab] = useDragOffset({ x: 0, y: 0 });

  return (
    <div className="bp-float" style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}>
      <div className="bp-panel">
        {/* Only the header drags, so the values below stay selectable. */}
        <div className="bp-panel-head" onMouseDown={onGrab}>
          <span className="bp-panel-badge">{badge}</span>
          <span className="bp-panel-grip" aria-hidden>
            ⠿
          </span>
        </div>
        <dl className="bp-specs">
          {rows.map(([key, value]) => (
            <div className="bp-spec-row" key={key}>
              <dt>{key}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        {note && <p className="bp-panel-note">{note}</p>}
      </div>
    </div>
  );
}
