import { useEffect, useRef, useState } from "react";
import {
  makeButtonStyle,
  makeStrokeStyle,
  buttonLabel,
  buttonSpec,
  GHOST_SURFACES,
} from "../buttonStyles.js";
import { ArrowInline } from "../../common/Icon.jsx";

// Live Button preview with hover/press interaction and a redlined
// best-practices overlay. The spec sheet is rendered by the playground in the
// properties column — see buttonSpecs() in buttonStyles.js for what it shows.
//
// A draggable "Interaction" card used to sit beside the button behind a "Show
// behaviour" toggle. Its content is in buttonRules() now: the toggle only ever
// worked for the Button, and the canvas already demonstrates the thing the card
// described, with the state label above reading it out live.

export function ButtonPreview({ variant, device, surface, disabled, bestPractices, btnState, setBtnState }) {
  const isGhost = variant === "Ghost";
  const spec = buttonSpec({ variant, device, surface });
  const style = makeButtonStyle({
    variant,
    state: disabled ? "default" : btnState,
    device,
    disabled,
    surface,
  });
  const strokeStyle = makeStrokeStyle({ variant, state: btnState, disabled });

  // Width is hug-content (or container-filling, for Ghost), so measure it rather
  // than guess. offset* ignores the pressed transform, unlike getBoundingClientRect.
  const btnRef = useRef(null);
  const [measured, setMeasured] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = btnRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const read = () => setMeasured({ w: el.offsetWidth, h: el.offsetHeight });
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, [variant, device, surface]);

  const buttonEl = (
    <button
      ref={btnRef}
      style={style}
      disabled={disabled}
      onMouseEnter={() => setBtnState("hover")}
      onMouseLeave={() => setBtnState("default")}
      onMouseDown={() => setBtnState("pressed")}
      onMouseUp={() => setBtnState("hover")}
    >
      {/* The 1px gradient stroke, sitting exactly over the button's transparent
          border. Ghost has no stroke, so it gets no ring. */}
      {strokeStyle && <span className="btn-ring" style={strokeStyle} aria-hidden />}
      {buttonLabel(variant)}
      {/* Ghost is the only variant with an icon, and Figma puts it AFTER the
          label. No variant in the library uses a leading icon. When the overlay
          is on, the icon is highlighted in-flow — Ghost centres its content, so
          an absolutely-placed marker would drift away from the real glyph. */}
      {isGhost &&
        (bestPractices ? (
          <span className="bp-icon-hl">
            <ArrowInline size={spec.iconSize} />
            <span className="bp-icon-note">
              <span className="bp-tag">
                icon {spec.iconSize}px &middot; {spec.iconPosition}
              </span>
            </span>
          </span>
        ) : (
          <ArrowInline size={spec.iconSize} />
        ))}
    </button>
  );

  return (
    <div className="bp-stage">
      <div className="bp-anchor">
        <div className="btn-variants">
          <div className={`btn-cell ${bestPractices ? "bp-on" : ""}`}>
            <div className="btn-box">
              {/* Ghost is transparent and full-bleed, so it only reads correctly
                  inside the card footer that supplies its surface. */}
              {isGhost ? (
                <span
                  className="btn-ghost-frame"
                  style={{ background: (GHOST_SURFACES[surface] ?? {}).fill }}
                >
                  {buttonEl}
                </span>
              ) : (
                buttonEl
              )}
              {bestPractices && (
                <>
                  <span className="bp-pad-inner bp-pad-inner-left" style={{ width: spec.padX }} />
                  <span className="bp-pad-inner bp-pad-inner-right" style={{ width: spec.padX }} />
                  <span className="bp-h">
                    <span className="bp-tag">{measured.h || spec.height}px</span>
                    <span className="bp-h-line" />
                  </span>
                  <span className="bp-w">
                    <span className="bp-w-line" />
                    <span className="bp-tag">
                      {measured.w ? `${measured.w}px · ${spec.sizing}` : spec.sizing}
                    </span>
                  </span>
                  <span className="bp-pad-note">
                    <span className="bp-tag bp-tag-quiet">&larr; {spec.padX}px &rarr;</span>
                  </span>
                  {/* The trailing-icon callout rides with the icon itself, up in
                      the button's content — see buttonEl above. */}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
