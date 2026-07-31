import { useState } from "react";
import { PATTERNS, PATTERN_BG } from "../../data/patterns.js";
import { patternStyle, patternCss, cornerMarkersCss } from "../../utils/patternStyles.js";
import { PgRange } from "../playground/controls/PgRange.jsx";
import { CheckIcon, CopyIcon } from "../common/Icon.jsx";

// One playground for the whole set, mirroring the component playground: the
// chips in the canvas foot swap the pattern, and the controls panel follows.
// Everything renders for real (no screenshots) so it can be tuned before the
// CSS is copied. Most patterns are a background on a single swatch;
// `kind: "frame"` ones straddle a container's edges and so need real nodes.
export function PatternsGallery({ copied, onCopy, theme, selected, setSelected }) {
  const mode = theme === "dark" ? "dark" : "light";
  const pattern = PATTERNS.find((p) => p.id === selected) || PATTERNS[0];

  // Keyed by pattern id, so tuning one and switching away doesn't discard it.
  const [values, setValues] = useState(() =>
    Object.fromEntries(PATTERNS.map((p) => [p.id, p.defaults])),
  );
  const set = (key) => (v) =>
    setValues((cur) => ({ ...cur, [pattern.id]: { ...cur[pattern.id], [key]: v } }));

  const args = { ...values[pattern.id], color: pattern.color[mode], background: PATTERN_BG[mode] };
  const isFrame = pattern.kind === "frame";
  const css = isFrame ? cornerMarkersCss(args) : patternCss(pattern.id, args);
  const copyId = `pat-${pattern.id}`;

  return (
    <div className="pg pat-lab">
      <div className="pg-stage">
        <div className="pg-canvas">
          <div className="pg-canvas-center">
            {isFrame ? (
              <FramePreview pattern={pattern} mode={mode} args={args} />
            ) : (
              <div className="pat-swatch" style={patternStyle(pattern.id, args)} />
            )}
          </div>
          <div className="pg-canvas-foot">
            <div className="canvas-variants">
              {PATTERNS.map((p) => (
                <button
                  key={p.id}
                  className="canvas-variant-btn"
                  data-active={p.id === pattern.id}
                  onClick={() => setSelected(p.id)}
                >
                  {p.name}
                </button>
              ))}
            </div>
            <button className="pg-code-copy" onClick={() => onCopy(css, copyId)}>
              {copied === copyId ? (
                <>
                  <CheckIcon /> Copied
                </>
              ) : (
                <>
                  <CopyIcon /> Copy CSS
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="pg-controls">
        <div className="pg-ctrl-head">
          <span className="pg-ctrl-title">{pattern.name}</span>
          <p className="pg-ctrl-desc">{pattern.description}</p>
        </div>
        {pattern.controls.map((c) => (
          <PgRange
            key={c.key}
            label={c.label}
            value={values[pattern.id][c.key]}
            min={c.min}
            max={c.max}
            step={c.step}
            unit={c.unit}
            onChange={set(c.key)}
          />
        ))}
      </div>
    </div>
  );
}

// A stand-in block for the markers to frame. The edge is drawn in the Line Grid
// ink so the demo reads the way it does in use — markers sitting on a grid
// crossing — and the squares are inset from the swatch so nothing is clipped.
function FramePreview({ pattern, mode, args }) {
  return (
    <div className="pat-swatch pat-frame-swatch" style={{ backgroundColor: args.background }}>
      <div
        className="frame-markers"
        style={{
          "--marker-size": `${args.size}px`,
          "--marker-color": args.color,
          "--frame-line": pattern.lineColor[mode],
        }}
      >
        <i />
        <i />
        <i />
        <i />
      </div>
    </div>
  );
}
