import { useEffect, useRef, useState } from "react";
import { makeButtonStyle, buttonSpec, GHOST_SURFACES } from "../buttonStyles.js";
import { BestPracticesPanel } from "../BestPracticesPanel.jsx";
import { useDragOffset } from "../useDragOffset.js";
import { ArrowInline } from "../../common/Icon.jsx";

// Live Button preview with hover/press interaction, a redlined best-practices
// overlay, and two draggable annotation panels — the spec sheet and the
// "behaviour" card — floating either side of the button.
export function ButtonPreview({
  variant,
  device,
  surface,
  disabled,
  bestPractices,
  showBehaviour,
  btnState,
  setBtnState,
}) {
  const [bhPos, onBhDown] = useDragOffset({ x: 60, y: 0 });

  const isGhost = variant === "Ghost";
  const spec = buttonSpec({ variant, device, surface });
  const style = makeButtonStyle({
    variant,
    state: disabled ? "default" : btnState,
    device,
    disabled,
    surface,
  });

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
      {isGhost ? "Listen now" : "Button"}
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
        {showBehaviour && (
          <div className="bh" style={{ transform: `translate(${bhPos.x}px, ${bhPos.y}px)` }}>
            <div className="bh-card" onMouseDown={onBhDown}>
              <span className="bh-badge">Interaction</span>
              {isGhost ? (
                <p className="bh-text">
                  Ghost has one state on purpose: it <em>is</em> a card&rsquo;s hover state. The card
                  reveals it on hover, so it never needs a hover of its own. It stays transparent and
                  full-bleed &mdash; the card footer supplies the surface, and the label flips to suit
                  it.
                </p>
              ) : (
                <p className="bh-text">
                  Hover and press share one appearance &mdash; the fill steps to the variant&rsquo;s
                  active tone, and press adds a 0.97 scale so touch still gets feedback. Desktop
                  reaches that state on hover, mobile on press. No focus variant is defined yet, so
                  keyboard focus falls back to the browser&rsquo;s default ring.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
      {bestPractices && (
        <BestPracticesPanel
          rows={buttonRows({ spec, measured, variant, device })}
          note={
            spec.iconSize
              ? "Ghost is the only variant with an icon — an arrow after the label. Never lead with it."
              : "No icon. Ghost is the only variant that carries one, and it sits after the label."
          }
        />
      )}
    </div>
  );
}

// Measured, copy-ready specs for the selected variant — the numbers a designer
// would otherwise have to open Figma to read.
function buttonRows({ spec, measured, variant, device }) {
  const pen = (c) => (c === "transparent" ? "none" : `${spec.borderWidth}px ${c}`);
  const border = pen(spec.borderColor);
  const borderActive = pen(spec.borderColorActive);

  return [
    ["Variant", `${variant} · ${device}`],
    ...(spec.surface ? [["Surface", spec.surface]] : []),
    ["Width", measured.w ? `${measured.w}px · ${spec.sizing}` : spec.sizing],
    ["Height", `${spec.height}px`],
    ["Padding", `0 ${spec.padX}px`],
    ["Radius", spec.radius === 0 ? "0 · square" : `${spec.radius}px · pill`],
    ["Font", "Alliance No.2"],
    ["Text", `${spec.fontSize}px / ${spec.fontWeight}`],
    ["Line height", `${spec.lineHeight}`],
    // Gap only does anything when there's an icon to space away from the label.
    ...(spec.iconSize ? [["Gap", `${spec.gap}px`]] : []),
    ["Icon", spec.iconSize ? `${spec.iconSize}px · ${spec.iconPosition}` : "none"],
    ["Fill", spec.fill],
    ...(spec.fill === spec.fillActive ? [] : [["Fill · hover", spec.fillActive]]),
    ["Border", border],
    ...(border === borderActive ? [] : [["Border · hover", borderActive]]),
    ["Label", spec.label],
    ["Backdrop", spec.backdrop],
    ...(spec.backdrop === spec.backdropActive ? [] : [["Backdrop · hover", spec.backdropActive]]),
  ];
}
