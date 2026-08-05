import { useRef, useState } from "react";
import { useDragOffset } from "./useDragOffset.js";
import { ChevronToggle } from "../common/Icon.jsx";

// Short enough that the panel can't swallow the playground, tall enough that the
// head, a row or two, and the note still fit.
const MIN_HEIGHT = 140;

// The floating spec sheet behind the playground's "Best practices" toggle: the
// measured values and the guidance a designer would otherwise open Figma to
// read. `rows` is a list of [label, value] pairs; `note` is the guidance line.
//
// It docks to the canvas's left edge and the stage reserves a column for it
// (.bp-stage[data-bp]), so it starts beside the component rather than on top of
// it — a panel floating over the thing being measured is the one thing a spec
// sheet must not do. From there it drags anywhere in the playground, resizes by
// its bottom edge, and folds to its title bar when neither is room enough.
export function BestPracticesPanel({ rows, note, badge = "Specs" }) {
  const [open, setOpen] = useState(true);
  // null = size to content, capped by CSS. Once dragged, the user's height wins.
  const [height, setHeight] = useState(null);
  // Bounded by `.pg`, the whole playground, rather than by the canvas it's
  // positioned in — so it can be parked over the controls column or the canvas
  // foot, well clear of the component, and still never leave the playground.
  const floatRef = useRef(null);
  const panelRef = useRef(null);
  const [pos, onGrab] = useDragOffset({ x: 0, y: 0 }, floatRef, ".pg");

  const onResizeDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const panel = panelRef.current;
    if (!panel) return;
    const startY = e.clientY;
    const startH = panel.offsetHeight;
    // Same ceiling the drag respects: the panel grows to the playground's
    // bottom edge and no further.
    const bounds = panel.closest(".pg")?.getBoundingClientRect();
    const maxH = bounds
      ? Math.max(MIN_HEIGHT, bounds.bottom - panel.getBoundingClientRect().top)
      : Infinity;

    // Transient, like the drag offset in useDragOffset: while the edge is held,
    // the height only has to reach this one element, so it goes straight to the
    // style and commits to state on release. Through state it would re-render
    // every spec row on every mousemove.
    let live = startH;
    const move = (ev) => {
      live = Math.min(maxH, Math.max(MIN_HEIGHT, startH + (ev.clientY - startY)));
      panel.style.height = `${live}px`;
      // Matches the `sized` style below, so the commit render is a no-op visually.
      panel.style.maxHeight = "none";
    };
    const up = () => {
      setHeight(live);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  // Collapsed, the head is the whole panel — a fixed height would leave a void
  // under it, so the user's height only applies while open.
  const sized = open && height ? { height, maxHeight: "none" } : undefined;

  return (
    <div
      ref={floatRef}
      className="bp-float"
      style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
    >
      <div
        ref={panelRef}
        className="bp-panel"
        data-collapsed={!open || undefined}
        style={sized}
      >
        {/* The head drags; only the chevron collapses, so a grab that drifts a
            pixel doesn't fold the panel by accident. */}
        <div className="bp-panel-head" onMouseDown={onGrab}>
          <span className="bp-panel-badge">{badge}</span>
          <span className="bp-panel-tools">
            <button
              type="button"
              className="bp-panel-fold"
              aria-expanded={open}
              aria-label={open ? "Collapse specs" : "Expand specs"}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => setOpen((v) => !v)}
            >
              <ChevronToggle open={open} size={13} />
            </button>
            <span className="bp-panel-grip" aria-hidden>
              ⠿
            </span>
          </span>
        </div>
        {open && (
          <>
            <dl className="bp-specs">
              {rows.map(([key, value]) => (
                <div className="bp-spec-row" key={key}>
                  <dt>{key}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            {note && <p className="bp-panel-note">{note}</p>}
            <span
              className="bp-panel-resize"
              onMouseDown={onResizeDown}
              role="separator"
              aria-orientation="horizontal"
              aria-label="Resize specs"
            />
          </>
        )}
      </div>
    </div>
  );
}
