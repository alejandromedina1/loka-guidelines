import { SelectField, selectPanelSpecs, selectRules } from "./SelectField.jsx";
import { SpecOverlay } from "../SpecOverlay.jsx";
import { blocks, htmlDocument, indent, rule, ruleHeadlines, ruleTexts, specPrompt, tokenRef } from "../snippets.js";

// The search-and-select control's own values — the same box the Input Field's
// Select type uses (see its T), documented here on its own since this is where
// the multi-select mode actually lives.
const T = {
  height: 48,
  radius: 12,
  padX: 16,
  fontSize: 14.5,
  fill: "#FAFBFC", // var(--bg-soft)
  line: "#E7ECF2", // var(--line) · gray-10
  ink: "#010812", // var(--ink) · black
  placeholder: "#A8B3CA", // gray-40
  caret: "#5C6A82", // gray-60
};

const toMode = (variant) => (variant === "Single-select" ? "single" : "multi");

// The guidance behind the control, stated once. The shared rows come from
// SelectField so the Input Field's Select type and this component can't
// describe the same behaviour two different ways.
export function dropdownRules(variant) {
  const mode = toMode(variant);
  return [
    {
      rule: "Shares the Input Field family's fill, border and radius.",
      why: "One box across every field type — including this one — is what makes them read as a single component, so don't restyle it in isolation.",
    },
    ...selectRules(mode),
  ];
}

export function dropdownSpecs({ variant }) {
  const mode = toMode(variant);
  return {
    rules: ruleHeadlines(dropdownRules(variant)),
    rows: [
      ["Height", `${T.height}px closed`],
      ["Radius", `${T.radius}px`],
      ["Border", `1px ${T.line} · gray-10`],
      ["Fill", `${T.fill} · bg-soft`],
      ["Text", `${T.fontSize}px`],
      ["Placeholder", `${T.placeholder} · gray-40`],
      ...selectPanelSpecs(mode),
    ],
  };
}

// Live Dropdown preview — the search-and-select control on its own, split by
// mode. Multi-select is the Loka Figma "Dropdown" component (node 6916:50169)
// in full: a three-selection ceiling, ticked rows, and tags underneath.
// Single-select is the same control simplified to one value, closing on pick —
// what the Input Field's own Select type embeds.
export function DropdownPreview({ variant, bestPractices, onState }) {
  const mode = toMode(variant);

  const handleOpenChange = (open) =>
    onState?.(open ? { text: "Open", tone: "active" } : { text: "Closed", tone: "default" });

  return (
    <div className="bp-stage" data-bp={bestPractices || undefined}>
      {/* Same headroom problem as the Input Field's Select type: the panel is
          absolutely positioned, so it adds no height — it has room to open
          into only because this field sits at the stage's top rather than
          centred, permanently, rather than measured and animated at runtime. */}
      <div className="field-demo" data-lift>
        <label className="field">
          <span className="field-label">{variant}</span>
          {/* `fill` because the control is width:100% of the field — redlining
              it as hug-content would misreport the box. */}
          <SpecOverlay on={bestPractices} fill widthMode="fill" padX={T.padX} padY={0} heightMode="fixed">
            <SelectField mode={mode} placeholder="Type to search" onOpenChange={handleOpenChange} />
          </SpecOverlay>
        </label>
      </div>
    </div>
  );
}

// ── Copyable output ─────────────────────────────────────────────────────────

const CLASS = "loka-dropdown";

const CARET_URI =
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' ` +
  `viewBox='0 0 16 16'%3E%3Cpath d='M4 6l4 4 4-4' fill='none' stroke='%23${T.caret.slice(1)}' ` +
  `stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`;

export function dropdownCss() {
  return blocks(
    rule(`.${CLASS}`, [
      ["display", "flex"],
      ["flex-direction", "column"],
      ["gap", "10px"],
      ["width", "100%"],
      ["max-width", "380px"],
    ]),
    rule(`.${CLASS}__label`, [
      ["font-size", "13.5px"],
      ["font-weight", "500"],
      ["color", "#2E3F5A"],
    ]),
    rule(`.${CLASS}__control`, [
      ["width", "100%"],
      ["height", `${T.height}px`],
      ["padding", `0 ${T.padX * 2 + 12}px 0 ${T.padX}px`],
      ["font-size", `${T.fontSize}px`],
      ["color", T.ink],
      ["background", T.fill],
      ["border", `1px solid ${T.line}`],
      ["border-radius", `${T.radius}px`],
      ["appearance", "none"],
      ["-webkit-appearance", "none"],
      ["cursor", "pointer"],
      ["background-image", CARET_URI],
      ["background-repeat", "no-repeat"],
      ["background-position", `right ${T.padX}px center`],
    ]),
  );
}

// Emitted as a native select in the family's box — the library's dropdown is a
// custom widget that needs JavaScript for search, and for multi-select, the
// ceiling and tags. Its full spec lives in the AI prompt instead.
export function dropdownHtmlSnippet({ variant }) {
  const mode = toMode(variant);
  const id = "dropdown-demo";

  const control =
    `<select id="${id}" class="${CLASS}__control"${mode === "multi" ? " multiple" : ""}>\n` +
    (mode === "single" ? `  <option value="" disabled selected>Type to search</option>\n` : "") +
    `  <option>Option one</option>\n` +
    `  <option>Option two</option>\n` +
    `  <option>Option three</option>\n` +
    `</select>`;

  const markup = [
    `<div class="${CLASS}">`,
    indent(`<label class="${CLASS}__label" for="${id}">${variant}</label>`),
    indent(control),
    "</div>",
    "",
    `<!-- A native select in the family's box. The library's dropdown is a custom`,
    `     widget that needs JavaScript — search${mode === "multi" ? ", a three-selection ceiling, and removable tags" : " and closing the panel on pick"} —`,
    "     see the AI prompt tab for its spec. -->",
  ].join("\n");

  return htmlDocument({ title: `Dropdown — ${variant}`, css: dropdownCss(), markup });
}

export function dropdownPromptSnippet({ variant }) {
  const mode = toMode(variant);

  return specPrompt({
    component: "Dropdown",
    config: variant,
    sections: [
      [
        "Box",
        [
          ["Width", "fills its container"],
          ["Height", `${T.height}px closed`],
          ["Padding", `0 ${T.padX}px`],
          ["Radius", `${T.radius}px`],
          ["Border", `1px solid ${tokenRef(T.line)}`],
          ["Fill", tokenRef(T.fill)],
        ],
      ],
      [
        "Type",
        [
          ["Family", "Alliance No.2"],
          ["Value", `${T.fontSize}px`],
          ["Value colour", tokenRef(T.ink)],
          ["Placeholder", tokenRef(T.placeholder)],
        ],
      ],
      ["Panel", selectPanelSpecs(mode)],
    ],
    states: [
      "Open: the panel is absolutely positioned and overlays what's below rather than pushing the page down. Clicking the control again collapses it.",
      mode === "multi"
        ? "At three selections the unpicked rows disable, so a swap starts by unticking. Choices collect as removable tags below the control."
        : "Picking a row fills the control with its label and closes the panel — one value at a time, so there's nothing left to confirm.",
    ],
    notes: [
      ...ruleTexts(dropdownRules(variant)),
      mode === "multi"
        ? "This is the full Loka Figma Dropdown component (node 6916:50169): search row, checkable options, removable tags, and the three-selection ceiling. For the simplified single-value version, see Single-select or the Input Field's own Select type."
        : "The single-select mode of the same control — one value, closing on pick. For the ceiling, tags, and unticking, see Multi-select.",
    ],
    reference: dropdownHtmlSnippet({ variant }),
  });
}
