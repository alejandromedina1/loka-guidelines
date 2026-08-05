import { useCallback, useEffect, useRef, useState } from "react";

// Reads the element's untransformed origin, its size, and the box it must stay
// inside — all in viewport coordinates. `applied` is the offset currently
// rendered, which getBoundingClientRect already includes, so subtracting it
// recovers where the element sits with no transform at all. That indirection is
// what lets the bounds be an ancestor other than the positioning parent.
function measure(node, boundsSelector, applied) {
  const box = node?.closest(boundsSelector);
  if (!node || !box) return null;
  const r = node.getBoundingClientRect();
  return {
    origin: { left: r.left - applied.x, top: r.top - applied.y },
    size: { w: r.width, h: r.height },
    bounds: box.getBoundingClientRect(),
  };
}

function clampTo(p, { origin, size, bounds }) {
  const minX = bounds.left - origin.left;
  const minY = bounds.top - origin.top;
  // Math.max against the min handles a bounds box smaller than the element:
  // pin to the top-left rather than invert the range.
  const maxX = Math.max(minX, bounds.right - size.w - origin.left);
  const maxY = Math.max(minY, bounds.bottom - size.h - origin.top);
  return {
    x: Math.min(Math.max(p.x, minX), maxX),
    y: Math.min(Math.max(p.y, minY), maxY),
  };
}

// Drag-to-reposition for the floating annotation panels. Returns the current
// offset plus the mousedown handler to wire onto whatever acts as the handle.
//
// Pass `nodeRef` and `boundsSelector` to keep the panel inside an ancestor — the
// spec sheet roams the whole playground, so it's bounded by `.pg` rather than by
// the canvas it's positioned in. Omit `boundsSelector` for panels anchored
// outside their parent on purpose (the behaviour card sits at left:100%), where
// clamping would yank them back in.
//
// The offset a drag is passing through is a transient value: mid-drag it only
// needs to reach one element's transform, and routing it through state would
// re-render the panel — and everything it renders — on every mousemove. So the
// move handler writes the transform straight onto `nodeRef` and keeps the live
// offset in a ref, committing to state once on release. React only sees the
// position the panel came to rest at, which is the one it has to render.
export function useDragOffset(initial, nodeRef, boundsSelector) {
  const [pos, setPos] = useState(initial);
  // The rendered offset, tracked so a drag can pick up where the last one ended
  // without reading state it isn't subscribed to during the drag.
  const posRef = useRef(initial);

  const clamp = useCallback(
    (candidate, applied) => {
      if (!nodeRef?.current || !boundsSelector) return candidate;
      const m = measure(nodeRef.current, boundsSelector, applied);
      return m ? clampTo(candidate, m) : candidate;
    },
    [nodeRef, boundsSelector],
  );

  // Keeps the ref in step with what's rendered, including the clamp below and
  // any caller that resets the offset.
  const commit = useCallback((next) => {
    posRef.current = next;
    setPos(next);
  }, []);

  // Dragging to an edge and then shrinking the window would otherwise strand the
  // panel outside, with no way to drag it back.
  useEffect(() => {
    const box = nodeRef?.current?.closest(boundsSelector || "");
    if (!box || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => commit(clamp(posRef.current, posRef.current)));
    ro.observe(box);
    return () => ro.disconnect();
  }, [nodeRef, boundsSelector, clamp, commit]);

  const onMouseDown = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const origin = { ...posRef.current };
    // Measured once at grab: the geometry can't shift mid-drag, and re-reading
    // the rect every mousemove would thrash layout.
    const m = nodeRef?.current && boundsSelector
      ? measure(nodeRef.current, boundsSelector, origin)
      : null;

    // Straight to the transform, no state: the panel is already where the CSS
    // says it is, so this is the whole update. `live` holds the last offset for
    // the commit on release.
    let live = origin;
    const move = (ev) => {
      const candidate = {
        x: origin.x + (ev.clientX - startX),
        y: origin.y + (ev.clientY - startY),
      };
      live = m ? clampTo(candidate, m) : candidate;
      const node = nodeRef?.current;
      if (node) node.style.transform = `translate(${live.x}px, ${live.y}px)`;
      else setPos(live);
    };
    const up = () => {
      // One render for the whole drag, and it agrees with the transform already
      // on the element, so nothing moves at the handover.
      commit(live);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  return [pos, onMouseDown];
}
