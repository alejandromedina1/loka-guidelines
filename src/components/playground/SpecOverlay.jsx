import { useEffect, useRef, useState } from "react";

// Redlines drawn over a component when "Best practices" is on — the same
// figures Figma's inspect panel reports: padding bands on both axes, and width
// and height dimension lines carrying the measured value and its sizing mode.
//
// Width and height are measured rather than declared, so they can't drift from
// what's actually rendered; padding is passed in, since a band has to be drawn
// at a known inset and reading it back off the box would just restate the CSS.
export function SpecOverlay({
  on,
  padX,
  padY,
  widthMode = "hug",
  heightMode = "fixed",
  fill,
  children,
}) {
  const ref = useRef(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!on || !el || typeof ResizeObserver === "undefined") return;
    const read = () => setSize({ w: el.offsetWidth, h: el.offsetHeight });
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, [on]);

  return (
    <div className="rl" data-on={on || undefined} data-fill={fill || undefined} ref={ref}>
      {children}
      {on && (
        <>
          {padX > 0 && (
            <>
              <span className="rl-band rl-band-l" style={{ width: padX }} />
              <span className="rl-band rl-band-r" style={{ width: padX }} />
              <span className="rl-note rl-note-x">
                <span className="bp-tag bp-tag-quiet">&larr; {padX}px &rarr;</span>
              </span>
            </>
          )}
          {padY > 0 && (
            <>
              <span className="rl-band rl-band-t" style={{ height: padY }} />
              <span className="rl-band rl-band-b" style={{ height: padY }} />
              <span className="rl-note rl-note-y">
                <span className="bp-tag bp-tag-quiet">&uarr; {padY}px &darr;</span>
              </span>
            </>
          )}
          <span className="rl-h">
            <span className="bp-tag">
              {size.h}px &middot; {heightMode}
            </span>
            <span className="rl-h-line" />
          </span>
          <span className="rl-w">
            <span className="rl-w-line" />
            <span className="bp-tag">
              {size.w}px &middot; {widthMode}
            </span>
          </span>
        </>
      )}
    </div>
  );
}
