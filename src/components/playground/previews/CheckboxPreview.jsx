import { useState } from "react";
import { BestPracticesPanel } from "../BestPracticesPanel.jsx";
import { SpecOverlay } from "../SpecOverlay.jsx";
import { CheckSmall } from "../../common/Icon.jsx";

const CHECKBOX_SPECS = [
  ["Height", "40px · hug width"],
  ["Padding", "8px"],
  ["Gap", "8px"],
  ["Radius", "12px"],
  ["Border", "1px #EFF1F5 · gray-5"],
  ["Control", "16px circle · radius 100px"],
  ["Control border", "1px #E7ECF2 · gray-10"],
  ["Control · checked", "#186BF3 · blue-100"],
  ["Tick", "12px · white"],
  ["Font", "Alliance No.2"],
  ["Text", "14px / 1.45"],
  ["Label", "#828FA5 · gray-50"],
  ["Label · checked", "#020F1F · gray-90"],
  ["Label · disabled", "#7C92AE · greyblue"],
  ["Fill · hover", "#F5F6FA"],
  ["Fill · checked", "#F5F6FA"],
  ["Disabled", "50% opacity"],
];

const CHECKBOX_NOTE =
  "Figma calls the checked variant “Focused”, but it's the checked state — no focus ring is defined, so keyboard focus falls back to the browser default. The whole pill is the target, not just the circle.";

// Checkbox — the Loka Figma "Checkbox / 40" component (node 3692:15296). Figma
// documents four states, but they aren't four things to render:
//
//   Default    resting, empty circle, gray-50 label
//   Hovered    the same control with the backgroundgrey fill — pure CSS
//   Focused    misnamed: this is the checked state. The circle fills blue-100
//              and the label darkens to gray-90, so it follows the value
//   disabled   half-opacity with a greyblue label — driven by the prop
//
// So only checked and disabled are real inputs; the rest falls out.
// Figma documents the control with an industry name; one is enough to show
// every state, since checked and disabled are both driven from outside the pill.
const LABEL = "Life Sciences";

export function CheckboxPreview({ disabled, bestPractices }) {
  const [checked, setChecked] = useState(true);

  return (
    <div className="bp-stage" data-bp={bestPractices || undefined}>
      <SpecOverlay on={bestPractices} padX={8} padY={8} widthMode="hug" heightMode="fixed">
        <button
          type="button"
          role="checkbox"
          aria-checked={checked}
          className="cbx"
          data-checked={checked || undefined}
          disabled={disabled}
          onClick={() => setChecked((v) => !v)}
        >
          <span className="cbx-box">{checked && <CheckSmall />}</span>
          {LABEL}
        </button>
      </SpecOverlay>
      {bestPractices && <BestPracticesPanel rows={CHECKBOX_SPECS} note={CHECKBOX_NOTE} />}
    </div>
  );
}
