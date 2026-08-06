import { SpecOverlay } from "../SpecOverlay.jsx";
import { CheckSmall } from "../../common/Icon.jsx";
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
const T = {
  height: 40,
  pad: 8,
  gap: 8,
  radius: 12,
  border: "#EFF1F5", // gray-5
  box: 16,
  boxRadius: 100,
  boxBorder: "#E7ECF2", // gray-10
  boxChecked: "#186BF3", // blue-100
  tick: 12,
  tickColor: "#FFFFFF",
  fontSize: 14,
  lineHeight: 1.45,
  label: "#828FA5", // gray-50
  labelChecked: "#020F1F", // gray-90
  labelDisabled: "#7C92AE", // GreyBlue
  fillHover: "#F5F6FA", // BackgroundGrey
  disabledOpacity: 0.5,
};

// Height, padding and the font are absent: the redlines draw the first two on
// the pill itself, and the font is the system's. The two identical fill rows
// merged — hover and checked share one value, and stating it twice read as two
// facts to check rather than one.
const CHECKBOX_SPECS = [
  ["Radius", `${T.radius}px`],
  ["Border", `1px ${T.border} · gray-5`],
  ["Control", `${T.box}px circle · 1px ${T.boxBorder}`],
  ["Control · checked", `${T.boxChecked} · ${T.tick}px white tick`],
  ["Text", `${T.fontSize}px / ${T.lineHeight}`],
  ["Label", `${T.label} · gray-50`],
  ["Label · checked", `${T.labelChecked} · gray-90`],
  ["Label · disabled", `${T.labelDisabled} · greyblue`],
  ["Fill · hover & checked", T.fillHover],
  ["Disabled", `${Math.round(T.disabledOpacity * 100)}% opacity`],
];

// The guidance behind the control, stated once. The specs panel shows the
// headlines; the AI prompt shows these with their reasoning attached.
export function checkboxRules() {
  return [
    {
      rule: "The whole pill is the target, not just the circle.",
      why: 'Build it as a <label> wrapping a native checkbox rather than a button with role="checkbox" — the keyboard, the tab order and the checked state then come for free.',
    },
    {
      rule: "Figma calls the checked variant “Focused”. It is the checked state.",
      why: "No focus ring is defined anywhere in the component, so don't build one from that variant name; keyboard focus falls back to the browser default.",
    },
    {
      rule: "Hover and checked share one fill.",
      why: "A checked control still reads as checked once the pointer leaves it.",
    },
  ];
}

export function checkboxSpecs() {
  // The state isn't a row — it's the lit canvas pill, already on screen.
  return { rules: ruleHeadlines(checkboxRules()), rows: CHECKBOX_SPECS };
}

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
// Placeholder copy, like the Filter's and the Tabs'. One control is enough to
// show every state, since checked and disabled are both driven from outside the
// pill. Kept short: the pill hugs its label, so a sentence would stretch the box
// the redlines are measuring.
const LABEL = "Option label";

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
    </div>
  );
}

// ── Copyable output ─────────────────────────────────────────────────────────

const CLASS = "loka-checkbox";

// The tick, matching CheckSmall in Icon.jsx.
const TICK_SVG =
  `<svg viewBox="6 6 12 12" width="${T.tick}" height="${T.tick}" aria-hidden="true">` +
  `<path d="M10.4969 15.3333L7 12.1733L7.87423 11.3832L10.4969 13.7533L16.1258 8.66667L17 9.45669L10.4969 15.3333Z" ` +
  `fill="currentColor"/></svg>`;

// The preview drives its states from data-attributes so the canvas pills can
// pin them; a real checkbox drives them from a native input instead, which is
// what this emits — no JavaScript, and the keyboard works for free.
export function checkboxCss() {
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
      // The stroke sits inside, so the 12px tick centres with 2px of clearance
      // rather than the box growing to fit it.
      ["border-radius", `${T.boxRadius}px`],
      ["color", T.tickColor],
      ["transition", "background .12s, border-color .12s"],
    ]),
    rule(`.${CLASS}__box svg`, [
      ["flex", "none"],
      ["opacity", "0"],
      ["transition", "opacity .12s"],
    ]),
    rule(`.${CLASS}:hover`, [["background", T.fillHover]]),
    // :has() is what lets the pill respond to the input nested inside it —
    // checked and disabled are both states of the input, not of the label.
    rule(`.${CLASS}:has(:checked)`, [
      ["background", T.fillHover],
      ["color", T.labelChecked],
    ]),
    rule(`.${CLASS}__input:checked ~ .${CLASS}__box`, [
      ["background", T.boxChecked],
      ["border-color", T.boxChecked],
    ]),
    rule(`.${CLASS}__input:checked ~ .${CLASS}__box svg`, [["opacity", "1"]]),
    rule(`.${CLASS}:has(:disabled)`, [
      ["opacity", T.disabledOpacity],
      ["background", "none"],
      ["color", T.labelDisabled],
      ["cursor", "not-allowed"],
    ]),
    // No focus ring is defined anywhere in the component, so the pill borrows
    // the browser's rather than inventing one.
    rule(`.${CLASS}:has(:focus-visible)`, [["outline", "auto"]]),
  );
}

export function checkboxHtmlSnippet({ state = "Default" }) {
  const attrs = [
    `type="checkbox"`,
    `class="${CLASS}__input"`,
    state === "Checked" ? "checked" : null,
    state === "Disabled" ? "disabled" : null,
  ].filter(Boolean);

  const markup = [
    `<label class="${CLASS}">`,
    indent(`<input ${attrs.join(" ")}>`),
    indent(`<span class="${CLASS}__box">${TICK_SVG}</span>`),
    indent(`<span>${LABEL}</span>`),
    "</label>",
  ].join("\n");

  const caveat =
    state === "Hovered"
      ? "\n<!-- Hover is pure CSS, so it isn't in the markup — the :hover rule above draws it. -->"
      : "";

  return htmlDocument({
    title: `Checkbox — ${state}`,
    css: checkboxCss(),
    markup: markup + caveat,
  });
}

export function checkboxPromptSnippet({ state = "Default" }) {
  return specPrompt({
    component: "Checkbox",
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
          ["Radius", `${T.boxRadius}px — a circle`],
          ["Border", `1px solid ${tokenRef(T.boxBorder)}`],
          ["Tick", `${T.tick}px, ${tokenRef(T.tickColor)}, centred with 2px of clearance`],
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
      `Checked: the control fills ${tokenRef(T.boxChecked)} with a matching border and the tick appears; the pill takes the same ${tokenRef(T.fillHover)} fill as hover, and the label darkens to ${tokenRef(T.labelChecked)}.`,
      `Disabled: ${Math.round(T.disabledOpacity * 100)}% opacity, no fill, label goes ${tokenRef(T.labelDisabled)}, cursor: not-allowed.`,
      "Focus: no ring is defined in the component. Fall back to the browser default, or this project's existing focus treatment.",
    ],
    notes: ruleTexts(checkboxRules()),
    reference: checkboxHtmlSnippet({ state }),
  });
}
