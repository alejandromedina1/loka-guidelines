import { SpecOverlay } from "../SpecOverlay.jsx";
import {
  FONT_STACK,
  blocks,
  htmlDocument,
  indent,
  rule,
  ruleHeadlines,
  ruleTexts,
  specPrompt,
  tokenRef,
} from "../snippets.js";

// Resolved values for the control, in one place — global.css paints these, and
// the spec sheet and the copyable snippets below both read them from here.
// There's no sourced Figma node for the Radio Button yet, so every dimension
// below is carried over from the Checkbox's own box/pill (node 3692:15296)
// rather than a design file's own measurements — the two are meant to read as
// one family, not two boxes that happen to look similar.
const T = {
  height: 40,
  pad: 8,
  gap: 8,
  radius: 12,
  border: "#EFF1F5", // gray-5
  box: 16,
  boxBorder: "#E7ECF2", // gray-10
  boxSelected: "#186BF3", // blue-100
  dot: 8,
  fontSize: 14,
  lineHeight: 1.45,
  label: "#828FA5", // gray-50
  labelSelected: "#020F1F", // gray-90
  labelDisabled: "#7C92AE", // GreyBlue
  fillHover: "#F5F6FA", // BackgroundGrey
  disabledOpacity: 0.5,
};

// Height, padding and the font are absent for the same reason the Checkbox's
// list leaves them out: the redlines draw the first two on the pill itself,
// and the font is the system's.
const RADIO_SPECS = [
  ["Radius", `${T.radius}px`],
  ["Border", `1px ${T.border} · gray-5`],
  ["Control", `${T.box}px circle · 1px ${T.boxBorder}`],
  ["Control · selected", `${T.boxSelected} ring · ${T.dot}px dot`],
  ["Text", `${T.fontSize}px / ${T.lineHeight}`],
  ["Label", `${T.label} · gray-50`],
  ["Label · selected", `${T.labelSelected} · gray-90`],
  ["Label · disabled", `${T.labelDisabled} · greyblue`],
  ["Fill · hover & selected", T.fillHover],
  ["Disabled", `${Math.round(T.disabledOpacity * 100)}% opacity`],
];

// The guidance behind the control, stated once. The specs panel shows the
// headlines; the AI prompt shows these with their reasoning attached.
export function radioButtonRules() {
  return [
    {
      rule: "The whole pill is the target, not just the circle.",
      why: 'Build it as a <label> wrapping a native radio input rather than a button with role="radio" — the keyboard, the tab order and the checked state then come for free.',
    },
    {
      rule: "Selecting one clears the rest of its group, not this control alone.",
      why: 'Give every radio in the same decision the same name attribute — that\'s what makes picking one uncheck the others, with no JavaScript.',
    },
    {
      rule: "Hover and selected share one fill.",
      why: "A selected control still reads as selected once the pointer leaves it — same call the Checkbox makes.",
    },
  ];
}

export function radioButtonSpecs() {
  // The state isn't a row — it's the lit canvas pill, already on screen.
  return { rules: ruleHeadlines(radioButtonRules()), rows: RADIO_SPECS };
}

// Radio Button — built in this system's own Checkbox anatomy rather than a
// sourced Figma component. The canvas pills step through the same four states
// the Checkbox documents, swapping its tick for a dot and its filled box for a
// ring, which is the one visual difference between "pick one of these" and
// "toggle this on its own":
//
//   Default    resting, empty ring, gray-50 label
//   Hovered    the same control with the backgroundgrey fill
//   Selected   ring and dot fill blue-100, label darkens to gray-90
//   Disabled   half-opacity with a greyblue label
//
// Hover is pure CSS in real use, so the pinned state is a flag the same rule
// answers to — otherwise picking "Hovered" from a pill, which moves the cursor
// away from the control, could never show it.
const LABEL = "Option label";

export function RadioButtonPreview({ state = "Default", setState, bestPractices }) {
  const selected = state === "Selected";
  const disabled = state === "Disabled";
  const hovered = state === "Hovered";

  return (
    <div className="bp-stage" data-bp={bestPractices || undefined}>
      <SpecOverlay on={bestPractices} padX={8} padY={8} widthMode="hug" heightMode="fixed">
        <button
          type="button"
          role="radio"
          aria-checked={selected}
          className="rdo"
          data-checked={selected || undefined}
          data-hover={hovered || undefined}
          disabled={disabled}
          // The control stays live, so the pills follow the click rather than
          // drifting out of step with what's on screen — same trick the
          // Checkbox uses. There's no sibling here to hand the selection to,
          // so a second click hands it back to Default instead; a real group
          // deselects a radio only by picking another one in it.
          onClick={() => setState?.(selected ? "Default" : "Selected")}
        >
          <span className="rdo-box">{selected ? <span className="rdo-dot" /> : null}</span>
          {LABEL}
        </button>
      </SpecOverlay>
    </div>
  );
}

// ── Copyable output ─────────────────────────────────────────────────────────

const CLASS = "loka-radio-button";

// The preview drives its states from data-attributes so the canvas pills can
// pin them; a real radio drives them from a native input instead, which is
// what this emits — no JavaScript, and the keyboard works for free.
export function radioButtonCss() {
  return blocks(
    // The whole pill is the target, not just the circle, so the label is the
    // control rather than a sibling of it.
    rule(`.${CLASS}`, [
      ["display", "inline-flex"],
      ["align-items", "center"],
      ["gap", `${T.gap}px`],
      ["height", `${T.height}px`],
      ["padding", `${T.pad}px`],
      ["border", `1px solid ${T.border}`],
      ["border-radius", `${T.radius}px`],
      ["cursor", "pointer"],
      ["font-family", FONT_STACK],
      ["font-size", `${T.fontSize}px`],
      ["font-weight", "400"],
      ["line-height", T.lineHeight],
      ["color", T.label],
      ["transition", "background .12s, color .12s"],
    ]),
    // The input still exists and still takes focus — it's just not what's
    // painted. Hiding it with display:none would take it out of the tab order.
    rule(`.${CLASS}__input`, [
      ["position", "absolute"],
      ["width", "1px"],
      ["height", "1px"],
      ["opacity", "0"],
      ["margin", "0"],
      ["pointer-events", "none"],
    ]),
    rule(`.${CLASS}__box`, [
      ["flex", "none"],
      ["display", "inline-flex"],
      ["align-items", "center"],
      ["justify-content", "center"],
      ["width", `${T.box}px`],
      ["height", `${T.box}px`],
      ["border", `1px solid ${T.boxBorder}`],
      ["border-radius", "100px"],
      ["transition", "border-color .12s"],
    ]),
    // The dot sits in the layout at rest too, just at zero scale, so selecting
    // a row doesn't pop a new element in — it grows from the ring's centre.
    rule(`.${CLASS}__dot`, [
      ["width", `${T.dot}px`],
      ["height", `${T.dot}px`],
      ["border-radius", "100px"],
      ["background", T.boxSelected],
      ["transform", "scale(0)"],
      ["transition", "transform .12s"],
    ]),
    rule(`.${CLASS}:hover`, [["background", T.fillHover]]),
    // :has() is what lets the pill respond to the input nested inside it —
    // selected and disabled are both states of the input, not of the label.
    rule(`.${CLASS}:has(:checked)`, [
      ["background", T.fillHover],
      ["color", T.labelSelected],
    ]),
    rule(`.${CLASS}__input:checked ~ .${CLASS}__box`, [["border-color", T.boxSelected]]),
    rule(`.${CLASS}__input:checked ~ .${CLASS}__box .${CLASS}__dot`, [["transform", "scale(1)"]]),
    rule(`.${CLASS}:has(:disabled)`, [
      ["opacity", T.disabledOpacity],
      ["background", "none"],
      ["color", T.labelDisabled],
      ["cursor", "not-allowed"],
    ]),
    // No focus ring is defined for this control any more than for the
    // Checkbox, so the pill borrows the browser's rather than inventing one.
    rule(`.${CLASS}:has(:focus-visible)`, [["outline", "auto"]]),
  );
}

export function radioButtonHtmlSnippet({ state = "Default" }) {
  const attrs = [
    `type="radio"`,
    `name="loka-radio-demo"`,
    `class="${CLASS}__input"`,
    state === "Selected" ? "checked" : null,
    state === "Disabled" ? "disabled" : null,
  ].filter(Boolean);

  const markup = [
    `<label class="${CLASS}">`,
    indent(`<input ${attrs.join(" ")}>`),
    indent(`<span class="${CLASS}__box"><span class="${CLASS}__dot"></span></span>`),
    indent(`<span>${LABEL}</span>`),
    "</label>",
    "",
    `<!-- One control on its own, same as the specimen above. A real group is`,
    `     two or more of these sharing the same name — that's what makes`,
    `     selecting one clear the rest, with no JavaScript. -->`,
  ].join("\n");

  const caveat =
    state === "Hovered"
      ? "\n<!-- Hover is pure CSS, so it isn't in the markup — the :hover rule above draws it. -->"
      : "";

  return htmlDocument({
    title: `Radio Button — ${state}`,
    css: radioButtonCss(),
    markup: markup + caveat,
  });
}

export function radioButtonPromptSnippet({ state = "Default" }) {
  return specPrompt({
    component: "Radio Button",
    config: state,
    sections: [
      [
        "Pill",
        [
          ["Width", "hug content — the whole pill is the click target"],
          ["Height", `${T.height}px`],
          ["Padding", `${T.pad}px`],
          ["Gap", `${T.gap}px between control and label`],
          ["Radius", `${T.radius}px`],
          ["Border", `1px solid ${tokenRef(T.border)}`],
          ["Fill", "none at rest"],
        ],
      ],
      [
        "Control",
        [
          ["Size", `${T.box}px square`],
          ["Radius", "100px — a circle"],
          ["Border", `1px solid ${tokenRef(T.boxBorder)}`],
          ["Dot", `${T.dot}px, ${tokenRef(T.boxSelected)}, centred — scales in rather than appearing`],
        ],
      ],
      [
        "Type",
        [
          ["Family", "Alliance No.2"],
          ["Size", `${T.fontSize}px / ${T.lineHeight}`],
          ["Weight", "400"],
          ["Label", tokenRef(T.label)],
        ],
      ],
    ],
    states: [
      `Hover: pill fills ${tokenRef(T.fillHover)} over 120ms. The control and label don't change.`,
      `Selected: the ring's border becomes ${tokenRef(T.boxSelected)} and its dot scales in at the same colour; the pill takes the same ${tokenRef(T.fillHover)} fill as hover, and the label darkens to ${tokenRef(T.labelSelected)}.`,
      `Disabled: ${Math.round(T.disabledOpacity * 100)}% opacity, no fill, label goes ${tokenRef(T.labelDisabled)}, cursor: not-allowed.`,
      "Focus: no ring is defined for this control. Fall back to the browser default, or this project's existing focus treatment.",
    ],
    notes: [
      ...ruleTexts(radioButtonRules()),
      "No Figma node is sourced for this component yet — every dimension mirrors the Checkbox's own box and pill (node 3692:15296) so the two read as one family rather than two similar-but-different controls.",
    ],
    reference: radioButtonHtmlSnippet({ state }),
  });
}
