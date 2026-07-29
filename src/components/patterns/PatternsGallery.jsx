import { useState } from "react";
import { PATTERNS, DOT_COLOR } from "../../data/patterns.js";
import { dotGridStyle, dotGridCss } from "../../utils/dotGridPattern.js";
import { PgRange } from "../playground/controls/PgRange.jsx";
import { CheckIcon, CopyIcon } from "../common/Icon.jsx";

// Live pattern playgrounds: each entry renders on a real background-image (no
// screenshots) with sliders wired to its adjustable knobs, so the square size
// and the horizontal/vertical gap can be tuned before copying the CSS.
export function PatternsGallery({ copied, onCopy, theme }) {
  const color = theme === "dark" ? DOT_COLOR.dark : DOT_COLOR.light;

  return (
    <div className="pat-labs">
      {PATTERNS.map((p) => (
        <PatternLab key={p.id} pattern={p} color={color} copied={copied} onCopy={onCopy} />
      ))}
    </div>
  );
}

function PatternLab({ pattern, color, copied, onCopy }) {
  const [values, setValues] = useState(pattern.defaults);
  const set = (key) => (v) => setValues((cur) => ({ ...cur, [key]: v }));

  const style = dotGridStyle({ ...values, color });
  const css = dotGridCss({ ...values, color });
  const copyId = `pat-${pattern.id}`;

  return (
    <div className="pg pat-lab">
      <div className="pg-stage">
        <div className="pg-canvas">
          <div className="pg-canvas-center">
            <div className="pat-swatch" style={style} />
          </div>
          <div className="pg-canvas-foot">
            <span />
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
            value={values[c.key]}
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
