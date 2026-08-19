import { SpecOverlay } from "../SpecOverlay.jsx";
import { blocks, htmlDocument, indent, rule, ruleHeadlines, ruleTexts, specPrompt, tokenRef } from "../snippets.js";

// Resolved values for the control, in one place — global.css paints these, and
// the spec sheet and the copyable snippets below both read them from here.
// There's no sourced Figma node for the Toggle Switch, and unlike the
// Checkbox and the Radio Button it isn't wrapped in their pill either — this
// is the bare switch, so there's no label, border or padding to size. blue-100
// is the same token those two use for their own "on" state, on purpose, not
// this app's own chrome accent (var(--blue), NewBlue): this is a Loka
// component being documented, not a setting in this tool's panel.
const T = {
  trackW: 38,
  trackH: 24,
  trackRadius: 100,
  trackOff: "#E7ECF2", // gray-10
  trackHover: "#D6DCE6", // gray-20
  trackOn: "#186BF3", // blue-100
  knob: 18,
  // The knob's inset splits by axis now that the track is taller than it is
  // a fixed multiple of the knob: 2px on the sides (unchanged — that's what
  // sets the travel below), 3px top and bottom to stay centred in 24px
  // rather than drifting toward the top edge.
  knobInsetX: 2,
  knobColor: "#FFFFFF",
  disabledOpacity: 0.5,
};

// Centred vertically: the track's height minus the knob's, split evenly.
const KNOB_INSET_Y = (T.trackH - T.knob) / 2;

// How far the knob travels: the track minus the knob minus its inset on each
// side. Stated once here so the CSS below and the specs row it appears in
// can't quietly drift apart. Horizontal only — the vertical inset centres
// the knob but doesn't move it.
const TRAVEL = T.trackW - T.knob - T.knobInsetX * 2;

const TOGGLE_SPECS = [
  ["Track", `${T.trackW}×${T.trackH}px · ${T.trackRadius}px radius`],
  ["Track · off", `${T.trackOff} · gray-10`],
  ["Track · hover", `${T.trackHover} · gray-20`],
  ["Track · on", `${T.trackOn} · blue-100`],
  ["Knob", `${T.knob}px circle · ${T.knobColor} · ${T.knobInsetX}px sides, ${KNOB_INSET_Y}px top/bottom`],
  ["Disabled", `${Math.round(T.disabledOpacity * 100)}% opacity`],
];

// The guidance behind the control, stated once. The specs panel shows the
// headlines; the AI prompt shows these with their reasoning attached.
export function toggleSwitchRules() {
  return [
    {
      rule: "The switch ships bare — no label, no pill.",
      why: "There's nothing on screen to say what it does, so give it an aria-label (or pair it with a <label> of your own) wherever you place it.",
    },
    {
      rule: "Hover darkens the track itself.",
      why: "The Checkbox and the Radio Button share their hover fill with a wrapping pill; this control has none, so the affordance has to live on the track.",
    },
    {
      rule: "The knob's travel is measured, not eyeballed.",
      why: `${T.trackW}px track − ${T.knob}px knob − ${T.knobInsetX}px inset each side leaves ${TRAVEL}px to slide, so translateX(${TRAVEL}px) lands it flush against the far edge rather than short of it. The vertical inset is its own number (${KNOB_INSET_Y}px) — it centres the knob in the taller track, and has nothing to do with how far it slides.`,
    },
  ];
}

export function toggleSwitchSpecs() {
  // The state isn't a row — it's the lit canvas pill, already on screen.
  return { rules: ruleHeadlines(toggleSwitchRules()), rows: TOGGLE_SPECS };
}

// Toggle Switch — the bare control, no label and no pill around it (compare
// the Checkbox and the Radio Button, which are both a clickable pill wrapping
// their control and a line of text). The canvas pills still step through the
// same four slots:
//
//   Off        resting, empty track
//   Hovered    the track one step darker
//   On         track and knob shift to blue-100, knob slides to the far edge
//   Disabled   half-opacity
//
// Hover is pure CSS in real use, so the pinned state is a flag the same rule
// answers to — otherwise picking "Hovered" from a pill, which moves the cursor
// away from the control, could never show it.
export function ToggleSwitchPreview({ state = "Off", setState, bestPractices }) {
  const on = state === "On";
  const disabled = state === "Disabled";
  const hovered = state === "Hovered";

  return (
    <div className="bp-stage" data-bp={bestPractices || undefined}>
      <SpecOverlay on={bestPractices} padX={0} padY={0} widthMode="fixed" heightMode="fixed">
        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-label="Toggle"
          className="tgl"
          data-on={on || undefined}
          data-hover={hovered || undefined}
          disabled={disabled}
          // The control stays live, so the pills follow the click rather than
          // drifting out of step with what's on screen — same trick the
          // Checkbox and the Radio Button use.
          onClick={() => setState?.(on ? "Off" : "On")}
        >
          <span className="tgl-knob" />
        </button>
      </SpecOverlay>
    </div>
  );
}

// ── Copyable output ─────────────────────────────────────────────────────────

const CLASS = "loka-toggle-switch";

// The preview drives its states from data-attributes so the canvas pills can
// pin them; a real switch drives them from a native checkbox instead, which
// is what this emits — no JavaScript, and the keyboard works for free. The
// label element doubles as the track here, since there's no separate pill to
// hold it.
export function toggleSwitchCss() {
  return blocks(
    rule(`.${CLASS}`, [
      ["position", "relative"],
      ["display", "inline-flex"],
      ["flex", "none"],
      ["width", `${T.trackW}px`],
      ["height", `${T.trackH}px`],
      ["border-radius", `${T.trackRadius}px`],
      ["background", T.trackOff],
      ["cursor", "pointer"],
      ["transition", "background .12s"],
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
    rule(`.${CLASS}__knob`, [
      ["position", "absolute"],
      ["top", `${KNOB_INSET_Y}px`],
      ["left", `${T.knobInsetX}px`],
      ["width", `${T.knob}px`],
      ["height", `${T.knob}px`],
      ["border-radius", "100px"],
      ["background", T.knobColor],
      ["box-shadow", "0 1px 3px rgba(1,8,18,.3)"],
      ["transition", "transform .16s"],
    ]),
    rule(`.${CLASS}:hover`, [["background", T.trackHover]]),
    // :has() is what lets the track respond to the input nested inside it —
    // on and disabled are both states of the input, not of the label.
    rule(`.${CLASS}:has(:checked)`, [["background", T.trackOn]]),
    rule(`.${CLASS}__input:checked ~ .${CLASS}__knob`, [["transform", `translateX(${TRAVEL}px)`]]),
    rule(`.${CLASS}:has(:disabled)`, [
      ["opacity", T.disabledOpacity],
      ["cursor", "not-allowed"],
    ]),
    // No focus ring is defined for this control any more than for the
    // Checkbox, so it borrows the browser's rather than inventing one.
    rule(`.${CLASS}:has(:focus-visible)`, [["outline", "auto"]]),
  );
}

export function toggleSwitchHtmlSnippet({ state = "Off" }) {
  const attrs = [
    `type="checkbox"`,
    `role="switch"`,
    `aria-label="Toggle"`,
    `class="${CLASS}__input"`,
    state === "On" ? "checked" : null,
    state === "Disabled" ? "disabled" : null,
  ].filter(Boolean);

  const markup = [
    `<label class="${CLASS}">`,
    indent(`<input ${attrs.join(" ")}>`),
    indent(`<span class="${CLASS}__knob"></span>`),
    "</label>",
    "",
    `<!-- Bare by design — no visible label. The aria-label above is what a`,
    `     screen reader announces; pair it with a <label> of your own if the`,
    `     control needs one on screen too. -->`,
  ].join("\n");

  const caveat =
    state === "Hovered"
      ? "\n<!-- Hover is pure CSS, so it isn't in the markup — the :hover rule above draws it. -->"
      : "";

  return htmlDocument({
    title: `Toggle Switch — ${state}`,
    css: toggleSwitchCss(),
    markup: markup + caveat,
  });
}

export function toggleSwitchPromptSnippet({ state = "Off" }) {
  return specPrompt({
    component: "Toggle Switch",
    config: state,
    sections: [
      [
        "Switch",
        [
          ["Width", "hug content — the whole switch is the click target, no label"],
          ["Track", `${T.trackW}×${T.trackH}px, radius ${T.trackRadius}px`],
          ["Track · off", tokenRef(T.trackOff)],
          ["Track · on", tokenRef(T.trackOn)],
          [
            "Knob",
            `${T.knob}px circle, ${tokenRef(T.knobColor)}, ${T.knobInsetX}px inset on the sides, ${KNOB_INSET_Y}px top/bottom (centred)`,
          ],
          ["Travel", `${TRAVEL}px — track minus knob minus the horizontal inset on both sides`],
        ],
      ],
    ],
    states: [
      `Hover: the track darkens to ${tokenRef(T.trackHover)} over 120ms. There's no wrapping pill to fill, so the affordance lives on the track itself.`,
      `On: the track becomes ${tokenRef(T.trackOn)} and the knob slides ${TRAVEL}px to the far edge over 160ms.`,
      `Disabled: ${Math.round(T.disabledOpacity * 100)}% opacity, cursor: not-allowed.`,
      "Focus: no ring is defined for this control. Fall back to the browser default, or this project's existing focus treatment.",
    ],
    notes: [
      ...ruleTexts(toggleSwitchRules()),
      "No Figma node is sourced for this component yet, and unlike the Checkbox and the Radio Button it isn't wrapped in their pill either — this ships as the bare switch. blue-100 is the same token those two use for their own \"on\" state.",
    ],
    reference: toggleSwitchHtmlSnippet({ state }),
  });
}
