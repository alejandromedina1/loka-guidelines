import { useRef, useState } from "react";
import { makeButtonStyle } from "../buttonStyles.js";
import { ArrowInline } from "../../common/Icon.jsx";

// Live Button preview with hover/press interaction, an optional best-practices
// spacing overlay, and a draggable "behaviour" annotation card.
export function ButtonPreview({
  variant,
  size,
  leadingIcon,
  disabled,
  bestPractices,
  showBehaviour,
  dark,
  btnState,
  setBtnState,
}) {
  const [bhPos, setBhPos] = useState({ x: 60, y: 0 });
  const bhDrag = useRef(null);

  const onBhDown = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const origin = { ...bhPos };
    const move = (ev) => setBhPos({ x: origin.x + (ev.clientX - startX), y: origin.y + (ev.clientY - startY) });
    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    bhDrag.current = { move, up };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  const style = makeButtonStyle({ variant, state: disabled ? "default" : btnState, size, disabled, dark });

  return (
    <div className="bp-anchor">
      <div className="btn-variants">
        <div className={`btn-cell ${bestPractices ? "bp-on" : ""}`}>
          <div className="btn-box">
            <button
              style={style}
              disabled={disabled}
              onMouseEnter={() => setBtnState("hover")}
              onMouseLeave={() => setBtnState("default")}
              onMouseDown={() => setBtnState("pressed")}
              onMouseUp={() => setBtnState("hover")}
            >
              {leadingIcon && <ArrowInline />}
              Button
            </button>
            {bestPractices && (
              <>
                <span className="bp-pad-inner bp-pad-inner-left" />
                <span className="bp-pad-inner bp-pad-inner-right" />
                <span className="bp-width">
                  <span className="bp-width-line" />
                  <span className="bp-width-tag">16px · 120px</span>
                </span>
              </>
            )}
          </div>
        </div>
      </div>
      {showBehaviour && (
        <div className="bh" style={{ transform: `translate(${bhPos.x}px, ${bhPos.y}px)` }}>
          <div className="bh-card" onMouseDown={onBhDown}>
            <span className="bh-badge">Interaction</span>
            <p className="bh-text">
              On hover the button lifts with a subtle shadow; on press it darkens and scales down slightly.
              Focus shows a visible ring for keyboard users.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
