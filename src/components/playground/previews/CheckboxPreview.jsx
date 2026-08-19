import { SpecOverlay } from "../SpecOverlay.jsx";
import { CheckSmall } from "../../common/Icon.jsx";
import { blocks, htmlDocument, indent, rule, ruleHeadlines, ruleTexts, specPrompt, tokenRef } from "../snippets.js";

// The accessible name for the bare control — there's no text printed beside
// it, so this only ever reaches an aria-label, never the screen.
const LABEL = "Option label";

// Resolved values for the control, in one place — global.css paints these, and
// the spec sheet and the copyable snippets below both read them from here.
const T = {
  // None of these three is the sourced Figma control either (that one
  // measures 16px) — this system's own scale, for contexts where a bigger,
  // more tappable target matters more than matching the render exactly.
  // 28px, the middle step, is the default.
  boxSize: { "24px": 24, "28px": 28, "32px": 32 },
  // Rounded is the sourced Figma radius — a full circle. Squared is this
  // system's own addition, not in the design file; 4px keeps it a square with
  // soft corners rather than a sharp one, in step with the rest of the system.
  boxRadius: { Rounded: 100, Squared: 4 },
  boxBorder: "#E7ECF2", // gray-10
  boxChecked: "#186BF3", // blue-100
  tickColor: "#FFFFFF",
  fillHover: "#F5F6FA", // BackgroundGrey
  disabledOpacity: 0.5,
};

// The tick's own size per control size — roughly 57% of the box at every
// step, not a flat clearance. A fixed gap shrinks proportionally as the box
// grows, which is what made the tick read as cramped at 32px; scaling it
// with the box keeps the same visible breathing room at every size instead.
const TICK_SIZE = { "24px": 14, "28px": 16, "32px": 18 };
const tickFor = (size) => TICK_SIZE[size];

// Only the two axes that actually change the markup earn a suffix — the
// default 28px stays silent the way Rounded already does.
function configSuffix(shape, size) {
  const parts = [];
  if (shape === "Squared") parts.push("Squared");
  if (size !== "28px") parts.push(size);
  return parts.length ? `, ${parts.join(", ")}` : "";
}

function checkboxSpecRows(shape, size) {
  const rounded = shape !== "Squared";
  const box = T.boxSize[size];
  return [
    ["Size", size],
    ["Control", `${box}px ${rounded ? "circle" : "square"} · 1px ${T.boxBorder}`],
    ["Control radius", `${T.boxRadius[shape]}px${rounded ? " — a circle" : ""}`],
    ["Control · hover", T.fillHover],
    ["Control · checked", `${T.boxChecked} · ${tickFor(size)}px white tick`],
    ["Disabled", `${Math.round(T.disabledOpacity * 100)}% opacity`],
  ];
}

// The guidance behind the control, stated once. The specs panel shows the
// headlines; the AI prompt shows these with their reasoning attached.
export function checkboxRules() {
  return [
    {
      rule: "The circle is the whole target — there's no pill around it.",
      why: 'Even at the largest size this is a small hit area on its own; build it as a <label> wrapping a native checkbox rather than a button with role="checkbox" so the keyboard, the tab order and the checked state come for free, and give it room from its neighbours since there\'s no padded pill to lean on.',
    },
    {
      rule: "No visible label — the control still needs an accessible name.",
      why: `aria-label="${LABEL}" on the input carries what a text node used to; a screen reader still announces it even though nothing prints beside the circle.`,
    },
    {
      rule: "Figma calls the checked variant “Focused”. It is the checked state.",
      why: "No focus ring is defined anywhere in the component, so don't build one from that variant name; keyboard focus falls back to the browser default.",
    },
    {
      rule: "Checked wins over hover, not the other way round.",
      why: "Order the checked rule after the hover rule despite equal specificity, so a checked control caught mid-hover still reads as checked rather than flickering back to the hover tint.",
    },
    {
      rule: "Squared is this system's own addition, not a Figma variant.",
      why: `The sourced component (node 3692:15296) only documents the circular control; Squared swaps its ${T.boxRadius.Rounded}px radius for ${T.boxRadius.Squared}px, same tokens otherwise, for interfaces that read better with corners.`,
    },
    {
      rule: "None of the three sizes is the sourced Figma control either.",
      why: "That one measures 16px. This scale (24/28/32px) exists for contexts where a bigger, more tappable target matters more than matching the render exactly — the tick scales with the box (about 57% of it at every step) rather than keeping a flat clearance that would leave it cramped at the larger end.",
    },
  ];
}

export function checkboxSpecs({ shape = "Rounded", size = "28px" } = {}) {
  // The state isn't a row — it's the lit canvas pill, already on screen.
  return { rules: ruleHeadlines(checkboxRules()), rows: checkboxSpecRows(shape, size) };
}

// Checkbox — the Loka Figma "Checkbox / 40" component (node 3692:15296), pared
// down to the circle alone: no pill, no label, just the control the pill used
// to wrap. The canvas pills step through the same four states:
//
//   Default    resting, empty circle
//   Hovered    the same circle with the backgroundgrey fill
//   Checked    Figma's "Focused": circle fills blue-100
//   Disabled   half-opacity
//
// Hover is pure CSS in real use, so the pinned state is a flag the same rule
// answers to — otherwise picking "Hovered" from a pill, which moves the cursor
// away from the control, could never show it.
//
// Shape and Size are both second, independent axes — Rounded (the sourced
// circle) or Squared, 24/28/32px — so they live as their own controls in the
// properties panel rather than doubling the canvas pills.
export function CheckboxPreview({
  state = "Default",
  setState,
  shape = "Rounded",
  size = "28px",
  bestPractices,
}) {
  const checked = state === "Checked";
  const disabled = state === "Disabled";
  const hovered = state === "Hovered";

  return (
    <div className="bp-stage" data-bp={bestPractices || undefined}>
      {/* No padding to redline — the button is the control itself now, not a
          pill wrapping it. */}
      <SpecOverlay on={bestPractices} padX={0} padY={0} widthMode="fixed" heightMode="fixed">
        <button
          type="button"
          role="checkbox"
          aria-checked={checked}
          aria-label={LABEL}
          className="cbx"
          data-checked={checked || undefined}
          data-hover={hovered || undefined}
          // Rounded and 28px are the defaults global.css already paints, so
          // only a non-default value needs a flag — same trick data-checked
          // and data-hover use above.
          data-shape={shape === "Squared" ? "Squared" : undefined}
          data-size={size !== "28px" ? size : undefined}
          disabled={disabled}
          // The control stays live, so the pills follow the click rather than
          // drifting out of step with what's on screen.
          onClick={() => setState?.(checked ? "Default" : "Checked")}
        >
          {checked ? <CheckSmall size={tickFor(size)} /> : null}
        </button>
      </SpecOverlay>
    </div>
  );
}

// ── Copyable output ─────────────────────────────────────────────────────────

const CLASS = "loka-checkbox";

// The tick, matching CheckSmall in Icon.jsx, sized for the chosen control size.
const tickSvg = (size) =>
  `<svg viewBox="6 6 12 12" width="${tickFor(size)}" height="${tickFor(size)}" aria-hidden="true">` +
  `<path d="M10.4969 15.3333L7 12.1733L7.87423 11.3832L10.4969 13.7533L16.1258 8.66667L17 9.45669L10.4969 15.3333Z" ` +
  `fill="currentColor"/></svg>`;

// The preview drives its states from data-attributes so the canvas pills can
// pin them; a real checkbox drives them from a native input instead, which is
// what this emits — no JavaScript, and the keyboard works for free. Shape and
// Size both have no equivalent live toggle here — there's no pseudo-class for
// either the way :checked covers state — so they're baked into the emitted
// radius and dimensions directly.
export function checkboxCss({ shape = "Rounded", size = "28px" } = {}) {
  const box = T.boxSize[size];

  return blocks(
    // The label doubles as the control itself — there's no separate pill to
    // hold it, so its own border and radius are the circle's.
    rule(`.${CLASS}`, [
      ["position", "relative"],
      ["display", "inline-flex"],
      ["align-items", "center"],
      ["justify-content", "center"],
      ["flex", "none"],
      ["width", `${box}px`],
      ["height", `${box}px`],
      ["border", `1px solid ${T.boxBorder}`],
      // The stroke sits inside, so the tick — sized separately, see tickSvg
      // below — centres with room around it rather than filling the box.
      ["border-radius", `${T.boxRadius[shape]}px`],
      ["color", T.tickColor],
      ["cursor", "pointer"],
      ["transition", "background .12s, border-color .12s"],
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
    rule(`.${CLASS} svg`, [
      ["flex", "none"],
      ["opacity", "0"],
      ["transition", "opacity .12s"],
    ]),
    rule(`.${CLASS}:hover`, [["background", T.fillHover]]),
    // Declared after :hover with equal specificity, so a checked control
    // stays blue rather than flickering back to the hover tint mid-pointer.
    rule(`.${CLASS}:has(:checked)`, [
      ["background", T.boxChecked],
      ["border-color", T.boxChecked],
    ]),
    rule(`.${CLASS}:has(:checked) svg`, [["opacity", "1"]]),
    rule(`.${CLASS}:has(:disabled)`, [
      ["opacity", T.disabledOpacity],
      ["cursor", "not-allowed"],
    ]),
    // No focus ring is defined anywhere in the component, so the control
    // borrows the browser's rather than inventing one.
    rule(`.${CLASS}:has(:focus-visible)`, [["outline", "auto"]]),
  );
}

export function checkboxHtmlSnippet({ state = "Default", shape = "Rounded", size = "28px" }) {
  const attrs = [
    `type="checkbox"`,
    `class="${CLASS}__input"`,
    `aria-label="${LABEL}"`,
    state === "Checked" ? "checked" : null,
    state === "Disabled" ? "disabled" : null,
  ].filter(Boolean);

  const markup = [
    `<label class="${CLASS}">`,
    indent(`<input ${attrs.join(" ")}>`),
    indent(tickSvg(size)),
    "</label>",
    "",
    `<!-- No visible text — aria-label carries the name a text node used to,`,
    `     since the <label> wrapping the input has nothing else to give it. -->`,
  ].join("\n");

  const caveat =
    state === "Hovered"
      ? "\n<!-- Hover is pure CSS, so it isn't in the markup — the :hover rule above draws it. -->"
      : "";

  return htmlDocument({
    title: `Checkbox — ${state}${configSuffix(shape, size)}`,
    css: checkboxCss({ shape, size }),
    markup: markup + caveat,
  });
}

export function checkboxPromptSnippet({ state = "Default", shape = "Rounded", size = "28px" }) {
  const rounded = shape !== "Squared";

  return specPrompt({
    component: "Checkbox",
    config: `${state}${configSuffix(shape, size)}`,
    sections: [
      [
        "Control",
        [
          ["Width", "the control itself is the click target — no pill, no label"],
          ["Size", `${T.boxSize[size]}px square`],
          ["Radius", `${T.boxRadius[shape]}px${rounded ? " — a circle" : ""}`],
          ["Border", `1px solid ${tokenRef(T.boxBorder)}`],
          ["Fill", "none at rest"],
          ["Tick", `${tickFor(size)}px, ${tokenRef(T.tickColor)}, centred — about 57% of the box, not a flat clearance`],
        ],
      ],
    ],
    states: [
      `Hover: fills ${tokenRef(T.fillHover)} over 120ms.`,
      `Checked: fills ${tokenRef(T.boxChecked)} with a matching border and the tick appears — this wins over the hover fill even mid-pointer.`,
      `Disabled: ${Math.round(T.disabledOpacity * 100)}% opacity, cursor: not-allowed.`,
      "Focus: no ring is defined in the component. Fall back to the browser default, or this project's existing focus treatment.",
    ],
    notes: ruleTexts(checkboxRules()),
    reference: checkboxHtmlSnippet({ state, shape, size }),
  });
}
