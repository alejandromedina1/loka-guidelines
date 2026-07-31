import { useState } from "react";

// Drag-to-reposition for the floating annotation panels. Returns the current
// offset plus the mousedown handler to wire onto whatever acts as the handle.
export function useDragOffset(initial) {
  const [pos, setPos] = useState(initial);

  const onMouseDown = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const origin = { ...pos };
    const move = (ev) =>
      setPos({ x: origin.x + (ev.clientX - startX), y: origin.y + (ev.clientY - startY) });
    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  return [pos, onMouseDown];
}
