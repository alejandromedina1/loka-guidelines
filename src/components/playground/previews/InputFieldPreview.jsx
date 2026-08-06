import { useState } from "react";
import { MultiSelectField } from "./MultiSelectField.jsx";
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

// The field family's resolved values, in one place. global.css is where these
// are actually painted, against custom properties; the redlines, the spec sheet
// and the copyable snippets all need literals instead, and reading them from
// one object is what keeps those three from drifting apart.
const T = {
  height: 48,
  radius: 12,
  padX: 16,
  padY: 12, // textarea only — the single-line controls centre in a fixed box
  textareaMin: 110,
  fontSize: 14.5,
  lineHeight: 1.5, // textarea only, since it holds more than one line
  labelSize: 13.5,
  labelWeight: 500,
  // One gap governs both sides of the control — label above, error below.
  gap: 10,
  errorSize: 12.5,
  ring: 3,
  disabledOpacity: 0.55,
  fill: "#FAFBFC", // var(--bg-soft)
  line: "#E7ECF2", // var(--line) · gray-10
  ink: "#010812", // var(--ink) · black
  inkLabel: "#2E3F5A", // var(--ink-2) · gray-70
  placeholder: "#A8B3CA", // gray-40
  caret: "#5C6A82", // gray-60
  blue: "#1957F4", // var(--blue) · NewBlue
  blueSoft: "#EEF2FE", // var(--blue-soft) · blue-5
  danger: "#D64545", // var(--danger)
  dangerSoft: "#FBEAEA", // var(--danger-soft)
};

const PCT = (n) => `${Math.round(n * 100)}%`;

// Padding the redline bands are drawn at, per type. Textarea is the only one
// with vertical padding; the rest centre a single line in a fixed 48px box.
// Select is measured closed — open, the panel leaves the flow entirely.
const FIELD_REDLINE = {
  Text: { padX: T.padX, padY: 0, heightMode: "fixed" },
  Email: { padX: T.padX, padY: 0, heightMode: "fixed" },
  Textarea: { padX: T.padX, padY: T.padY, heightMode: "min · resizes" },
  Select: { padX: T.padX, padY: 0, heightMode: "fixed" },
};

// Placeholder copy. Text and Email keep standard form vocabulary because the
// label is what tells the two apart — the visual spec is identical, and only
// the keyboard a phone raises differs. The Textarea's used to be a question
// lifted from a real contact form; it's generic now, but still the longest of
// the four, since a long label above the box is worth showing.
const FIELD_COPY = {
  Text: { label: "Full name", placeholder: "John" },
  Email: { label: "Company Email", placeholder: "john@company.com" },
  Textarea: { label: "Additional details", placeholder: "Type your message…" },
  Select: { label: "Multi-select", placeholder: "Type to search" },
};

// Shared across the family. Height and padding are absent on purpose — the
// redlines draw both on the control itself — and so is the font, which is the
// system's rather than the field's. The gaps left the table too: "one gap
// governs both sides" is a rule, not a measurement.
const FIELD_BASE_SPECS = [
  ["Radius", `${T.radius}px`],
  ["Border", `1px ${T.line} · gray-10`],
  ["Fill", `${T.fill} · bg-soft`],
  ["Label", `${T.labelSize}px / ${T.labelWeight} · ${T.inkLabel}`],
  ["Focus", `${T.blue} border + ${T.ring}px ${T.blueSoft} ring`],
  ["Error", `${T.danger} border · message ${T.errorSize}px`],
  ["Disabled", `${PCT(T.disabledOpacity)} opacity`],
];

// Text and Email are the same control with a different input type, so they
// share one row set rather than repeating it.
const TEXTLIKE_SPECS = [
  ["Text", `${T.fontSize}px`],
  ["Placeholder", `${T.placeholder} · gray-40`],
];

// Only Select adds rows of its own: its panel is a second surface with values
// nothing on the canvas reports, since the redlines measure it closed.
const SELECT_PANEL_SPECS = [
  ["Panel fill", `${T.blueSoft} · blue-5`],
  ["List", "348px max · scrolls"],
  ["Option", `${T.height}px · radius ${T.radius}px · #EFF1F5`],
  ["Tag", "#EEF2FE on 1px #D8E2F6"],
];

const FIELD_TYPE_SPECS = {
  Text: TEXTLIKE_SPECS,
  Email: TEXTLIKE_SPECS,
  Textarea: [
    ["Text", `${T.fontSize}px / ${T.lineHeight}`],
    ["Placeholder", `${T.placeholder} · gray-40`],
  ],
  Select: [...TEXTLIKE_SPECS, ...SELECT_PANEL_SPECS],
};

// The guidance behind the family, stated once. The specs panel shows the
// headlines; the AI prompt shows these with their reasoning attached.
export function inputFieldRules({ type }) {
  return [
    {
      rule: "Every control in the family shares one fill, border and radius.",
      why: "That shared box is what makes text, email, textarea and select read as a single component, so don't restyle one of them in isolation.",
    },
    {
      rule: `One ${T.gap}px gap governs both sides — label above, error below.`,
      why: "The message can't drift away from the field it belongs to, and the label can't drift away from the box it names.",
    },
    {
      rule: "Drive the error state from aria-invalid, not a modifier class.",
      why: "Point the control at the message with aria-describedby, so the styling and the accessibility tree can't disagree.",
    },
    ...(type === "Email"
      ? [
          {
            rule: 'Use type="email" so mobile keyboards adapt.',
            why: "The visual spec is identical to Text.",
          },
        ]
      : []),
    ...(type === "Textarea"
      ? [
          {
            rule: "The only control in the family that grows.",
            why: `It keeps the family's ${T.fontSize}px but relaxes to ${T.lineHeight} line height, since it holds more than one line.`,
          },
        ]
      : []),
    ...(type === "Select"
      ? [
          {
            rule: "The panel overlays the page — it never pushes content down.",
            why: "It's absolutely positioned, so it adds no height. Clicking the control again collapses it.",
          },
          {
            rule: "At three selections the unpicked rows disable, so a swap starts by unticking.",
            why: "The panel stays open while that happens rather than closing on the third pick.",
          },
          {
            rule: `Body text is ${T.fontSize}px, matching the family rather than the standalone Figma frame.`,
            why: "The frame specifies 16px; matching the field family wins over matching the frame.",
          },
        ]
      : []),
  ];
}

// What the specs panel shows for the selected type and state.
export function inputFieldSpecs({ type, state }) {
  return {
    rules: ruleHeadlines(inputFieldRules({ type })),
    // Type and state aren't rows: the type is the nav selection and the state
    // is the lit canvas pill, both already on screen.
    rows: [...FIELD_TYPE_SPECS[type], ...FIELD_BASE_SPECS],
  };
}

// Live Input Field preview — label sits a full space-10 above the control, and
// every control (text, textarea, select) shares the same fill/border/radius
// so the field family reads as one component.
export function InputFieldPreview({ type, state = "Default", bestPractices }) {
  const [text, setText] = useState("");
  const copy = FIELD_COPY[type];

  // The pills pin a state, so focus can't rely on the control actually holding
  // it — clicking the pill would hand focus to the pill. `data-state` carries it
  // instead, and the CSS gives it the same ring :focus draws.
  const disabled = state === "Disabled";
  const error = state === "Error";
  const focus = state === "Focus" || undefined;

  return (
    <div className="bp-stage" data-bp={bestPractices || undefined}>
      <div className="field-demo" data-type={type}>
        <label className="field">
          <span className="field-label">{copy.label}</span>
          {/* `fill` because every control in the family is width:100% of the
              field — redlining it as hug-content would misreport the box. */}
          <SpecOverlay on={bestPractices} fill widthMode="fill" {...FIELD_REDLINE[type]}>
            {type === "Textarea" ? (
              <textarea
                className="field-textarea"
                data-error={error}
                data-focus={focus}
                placeholder={copy.placeholder}
                disabled={disabled}
              />
            ) : type === "Select" ? (
              <MultiSelectField
                disabled={disabled}
                error={error}
                focus={focus}
                placeholder={copy.placeholder}
              />
            ) : (
              <input
                className="field-input"
                data-error={error}
                data-focus={focus}
                type={type === "Email" ? "email" : "text"}
                placeholder={copy.placeholder}
                disabled={disabled}
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            )}
          </SpecOverlay>
        </label>
        {error && <span className="field-error-msg">This field is required.</span>}
      </div>
    </div>
  );
}

// ── Copyable output ─────────────────────────────────────────────────────────

const CLASS = "loka-field";
const ERROR_MESSAGE = "This field is required.";
// Long labels get cut, so the trailing hyphen is stripped after the slice as
// well as before it — otherwise "…before-" becomes "…before--error" below.
const slugId = (label) =>
  label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 32)
    .replace(/^-|-$/g, "");

// The native select's caret, as a data URI so the snippet carries its own icon.
// `#` has to be percent-encoded or the URL terminates at the colour.
const CARET_URI =
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' ` +
  `viewBox='0 0 16 16'%3E%3Cpath d='M4 6l4 4 4-4' fill='none' stroke='%23${T.caret.slice(1)}' ` +
  `stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`;

// The stylesheet for the field family, resolved to literals so it renders
// identically wherever it's pasted. Only the rules the chosen type needs are
// emitted — a Text field shouldn't ship the textarea's overrides.
export function inputFieldCss({ type }) {
  // The single gap between label, control, and error is the whole distance on
  // both sides, so the message can't drift away from the box it belongs to.
  const wrapper = rule(`.${CLASS}`, [
    ["display", "flex"],
    ["flex-direction", "column"],
    ["gap", `${T.gap}px`],
    ["width", "100%"],
    ["max-width", "380px"],
  ]);

  const label = rule(`.${CLASS}__label`, [
    ["font-family", FONT_STACK],
    ["font-size", `${T.labelSize}px`],
    ["font-weight", T.labelWeight],
    ["color", T.inkLabel],
  ]);

  // Text, textarea and select share one fill, border and radius, which is what
  // makes the family read as a single component.
  const control = rule(`.${CLASS}__control`, [
    ["width", "100%"],
    ["height", `${T.height}px`],
    ["padding", `0 ${T.padX}px`],
    ["font-family", FONT_STACK],
    ["font-size", `${T.fontSize}px`],
    ["color", T.ink],
    ["background", T.fill],
    ["border", `1px solid ${T.line}`],
    ["border-radius", `${T.radius}px`],
    ["transition", "border-color .14s, box-shadow .14s"],
  ]);

  const placeholder = rule(`.${CLASS}__control::placeholder`, [["color", T.placeholder]]);

  const focus = rule(`.${CLASS}__control:focus`, [
    ["outline", "none"],
    ["border-color", T.blue],
    ["box-shadow", `0 0 0 ${T.ring}px ${T.blueSoft}`],
  ]);

  const disabled = rule(`.${CLASS}__control:disabled`, [
    ["opacity", T.disabledOpacity],
    ["cursor", "not-allowed"],
  ]);

  // aria-invalid rather than a modifier class: the error state has to reach
  // assistive tech anyway, so styling off it keeps the two from disagreeing.
  const error = rule(`.${CLASS}__control[aria-invalid="true"]`, [["border-color", T.danger]]);
  const errorFocus = rule(`.${CLASS}__control[aria-invalid="true"]:focus`, [
    ["box-shadow", `0 0 0 ${T.ring}px ${T.dangerSoft}`],
  ]);
  const errorText = rule(`.${CLASS}__error`, [
    ["font-family", FONT_STACK],
    ["font-size", `${T.errorSize}px`],
    ["color", T.danger],
  ]);

  // The only control in the family that grows. It relaxes to 1.5 line height,
  // since it holds more than one line.
  const textarea =
    type === "Textarea"
      ? rule(`.${CLASS}__control--textarea`, [
          ["height", "auto"],
          ["min-height", `${T.textareaMin}px`],
          ["padding", `${T.padY}px ${T.padX}px`],
          ["line-height", T.lineHeight],
          ["resize", "vertical"],
        ])
      : "";

  const select =
    type === "Select"
      ? rule(`.${CLASS}__control--select`, [
          ["appearance", "none"],
          ["-webkit-appearance", "none"],
          ["cursor", "pointer"],
          // Room for the caret, which sits at the same 16px inset as the text.
          ["padding-right", `${T.padX * 2 + 12}px`],
          ["background-image", CARET_URI],
          ["background-repeat", "no-repeat"],
          ["background-position", `right ${T.padX}px center`],
        ])
      : "";

  return blocks(
    wrapper,
    label,
    control,
    placeholder,
    textarea,
    select,
    focus,
    disabled,
    error,
    errorFocus,
    errorText,
  );
}

// A self-contained HTML + CSS block for the current configuration.
//
// Focus isn't reproducible in static markup — it's a state the browser owns —
// so the Focus pill emits the default field plus a note. Select emits a native
// <select> in the family's box: the library's multi-select is a custom widget
// that needs JavaScript, and its full spec lives in the AI prompt instead.
export function inputFieldHtmlSnippet({ type, state }) {
  const copy = FIELD_COPY[type];
  const id = slugId(copy.label);
  const error = state === "Error";
  const disabled = state === "Disabled";

  const attrs = [
    `class="${CLASS}__control${type === "Textarea" ? ` ${CLASS}__control--textarea` : ""}${
      type === "Select" ? ` ${CLASS}__control--select` : ""
    }"`,
    `id="${id}"`,
    type === "Textarea" || type === "Select" ? null : `type="${type === "Email" ? "email" : "text"}"`,
    type === "Select" ? null : `placeholder="${copy.placeholder}"`,
    disabled ? "disabled" : null,
    error ? 'aria-invalid="true"' : null,
    error ? `aria-describedby="${id}-error"` : null,
  ].filter(Boolean);

  const open = attrs.join(" ");
  const control =
    type === "Textarea"
      ? `<textarea ${open}></textarea>`
      : type === "Select"
        ? `<select ${open}>\n` +
          `  <option value="" disabled selected>${copy.placeholder}</option>\n` +
          `  <option>Option one</option>\n` +
          `  <option>Option two</option>\n` +
          `</select>`
        : `<input ${open}>`;

  const markup = [
    `<div class="${CLASS}">`,
    indent(`<label class="${CLASS}__label" for="${id}">${copy.label}</label>`),
    indent(control),
    error ? indent(`<span class="${CLASS}__error" id="${id}-error">${ERROR_MESSAGE}</span>`) : null,
    "</div>",
  ]
    .filter((line) => line !== null)
    .join("\n");

  // Both can apply at once — a focused Select needs to hear about the widget
  // and about why the state isn't in the markup.
  const caveats = [
    type === "Select"
      ? "<!-- A native select in the family's box. The library's multi-select is a\n     custom widget that needs JavaScript — see the AI prompt tab for its spec. -->"
      : null,
    state === "Focus"
      ? "<!-- Focus is a browser state, so it isn't in the markup — the :focus rule above draws it. -->"
      : null,
  ].filter(Boolean);

  return htmlDocument({
    title: `Input Field — ${type} · ${state}`,
    css: inputFieldCss({ type }),
    markup: [markup, ...caveats].join("\n"),
  });
}

// The same configuration as a spec an agent can build from.
export function inputFieldPromptSnippet({ type, state }) {
  const copy = FIELD_COPY[type];
  const isSelect = type === "Select";

  return specPrompt({
    component: "Input Field",
    config: `${type} · ${state}`,
    sections: [
      [
        "Box",
        [
          ["Width", "fills its container"],
          [
            "Height",
            isSelect
              ? `${T.height}px closed`
              : type === "Textarea"
                ? `${T.textareaMin}px minimum, resizes vertically`
                : `${T.height}px`,
          ],
          [
            "Padding",
            type === "Textarea" ? `${T.padY}px ${T.padX}px` : `0 ${T.padX}px`,
          ],
          ["Radius", `${T.radius}px`],
          ["Border", `1px solid ${tokenRef(T.line)}`],
          ["Fill", tokenRef(T.fill)],
        ],
      ],
      [
        "Type",
        [
          ["Family", "Alliance No.2"],
          [
            "Value",
            type === "Textarea"
              ? `${T.fontSize}px / ${T.lineHeight} line height`
              : `${T.fontSize}px`,
          ],
          ["Value colour", tokenRef(T.ink)],
          ["Placeholder", tokenRef(T.placeholder)],
          ["Label", `${T.labelSize}px / ${T.labelWeight}, ${tokenRef(T.inkLabel)}`],
          ["Gap", `${T.gap}px — the same gap above the control and below it`],
        ],
      ],
      ["Content", [["Label", `"${copy.label}"`], ["Placeholder", `"${copy.placeholder}"`]]],
      ...(isSelect ? [["Multi-select panel", SELECT_PANEL_SPECS]] : []),
    ],
    states: [
      `Focus: border becomes ${tokenRef(T.blue)} with a ${T.ring}px ${tokenRef(T.blueSoft)} ring, transitioned over 140ms. Replace the browser's default outline rather than doubling it.`,
      `Error: border becomes ${tokenRef(T.danger)}, the focus ring becomes ${tokenRef(T.dangerSoft)}, and a ${T.errorSize}px message in ${tokenRef(T.danger)} appears below the control at the same ${T.gap}px gap.`,
      `Disabled: ${PCT(T.disabledOpacity)} opacity, cursor: not-allowed.`,
      ...(isSelect
        ? ["Open: the panel is absolutely positioned and overlays what's below rather than pushing the page down. Clicking the control again collapses it. At three selections the panel stays open and the unpicked rows disable, so a swap starts by unticking."]
        : []),
    ],
    notes: [
      ...ruleTexts(inputFieldRules({ type })),
      ...(isSelect
        ? [
            "The library's select is a custom multi-select, not a native one: it needs a search row, checkable options, removable tags, and a three-selection ceiling.",
          ]
        : []),
    ],
    reference: inputFieldHtmlSnippet({ type, state }),
  });
}
