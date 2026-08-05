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
  "Figma calls the checked variant “Focused”, but it's the checked state — no focus ring is defined, so keyboard focus falls back to the browser default. The whole pill is the target, not just the circle, and clicking it moves the pills: a click from Default or Hovered checks it, and a click from Checked clears it.";

// Checkbox — the Loka Figma "Checkbox / 40" component (node 3692:15296). Figma
// documents four states, and the canvas pills step through all of them:
//
//   Default    resting, empty circle, gray-50 label
//   Hovered    the same control with the backgroundgrey fill
//   Checked    Figma's "Focused": circle fills blue-100, label darkens to gray-90
//   Disabled   half-opacity with a greyblue label
//
// Hover is pure CSS in real use, so the pinned state is a flag the same rule
// answers to — otherwise picking "Hovered" from a pill, which moves the cursor
// away from the control, could never show it.
// Figma documents the control with an industry name; one is enough to show
// every state, since checked and disabled are both driven from outside the pill.
const LABEL = "Life Sciences";

export function CheckboxPreview({ state = "Default", setState, bestPractices }) {
  const checked = state === "Checked";
  const disabled = state === "Disabled";
  const hovered = state === "Hovered";

  return (
    <div className="bp-stage" data-bp={bestPractices || undefined}>
      <SpecOverlay on={bestPractices} padX={8} padY={8} widthMode="hug" heightMode="fixed">
        <button
          type="button"
          role="checkbox"
          aria-checked={checked}
          className="cbx"
          data-checked={checked || undefined}
          data-hover={hovered || undefined}
          disabled={disabled}
          // The control stays live, so the pills follow the click rather than
          // drifting out of step with what's on screen.
          onClick={() => setState?.(checked ? "Default" : "Checked")}
        >
          <span className="cbx-box">{checked ? <CheckSmall /> : null}</span>
          {LABEL}
        </button>
      </SpecOverlay>
      {bestPractices && (
        <BestPracticesPanel
          rows={[["State", state], ...CHECKBOX_SPECS]}
          note={CHECKBOX_NOTE}
        />
      )}
    </div>
  );
}
