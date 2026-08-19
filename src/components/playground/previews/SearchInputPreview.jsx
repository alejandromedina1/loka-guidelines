import { useEffect, useState } from "react";
import { SpecOverlay } from "../SpecOverlay.jsx";
import { CircleX, SearchIcon } from "../../common/Icon.jsx";
import { FONT_STACK, blocks, htmlDocument, indent, rule, ruleHeadlines, ruleTexts, specPrompt, tokenRef } from "../snippets.js";

// The field family's own box — the same values Input Field paints (see its
// own T), duplicated here rather than imported so this file reads on its own,
// the same call the Dropdown makes about the box it shares with Input Field's
// Select type. Icon and clear-button values are this control's own addition
// to that shared box.
const T = {
  height: 48,
  radius: 12,
  padX: 16,
  fontSize: 14.5,
  fill: "#FAFBFC", // bg-soft
  line: "#E7ECF2", // gray-10
  ink: "#010812", // black
  placeholder: "#A8B3CA", // gray-40
  icon: "#5C6A82", // gray-60 — same as the Dropdown's own caret
  iconSize: 16,
  clearHover: "#2E3F5A", // gray-70
  clearHit: 20, // the clear button's own hit target, not the glyph size
  blue: "#1957F4", // NewBlue — the same focus color Input Field uses
  blueSoft: "#EEF2FE",
  ring: 3,
  disabledOpacity: 0.55,
};

// Left and right padding both reserve the same 40px — icon inset (16px) plus
// its own width (16px) plus an 8px gap, and the mirror of that on the right
// for the clear button. Stated once so the CSS and the specs row can't drift.
const SIDE_PAD = T.padX + T.iconSize + 8;

const SEARCH_SPECS = [
  ["Height", `${T.height}px`],
  ["Radius", `${T.radius}px`],
  ["Border", `1px ${T.line} · gray-10`],
  ["Fill", `${T.fill} · bg-soft`],
  ["Side padding", `${SIDE_PAD}px, reserved on both sides whether the clear button is showing or not`],
  ["Text", `${T.fontSize}px`],
  ["Placeholder", `${T.placeholder} · gray-40`],
  ["Icon", `${T.iconSize}px · ${T.icon} · gray-60`],
  ["Clear button", `${T.icon} · gray-60, ${T.clearHover} · gray-70 on hover`],
  ["Focus", `${T.blue} border + ${T.ring}px ${T.blueSoft} ring`],
  ["Disabled", `${Math.round(T.disabledOpacity * 100)}% opacity`],
];

// The guidance behind the control, stated once. The specs panel shows the
// headlines; the AI prompt shows these with their reasoning attached.
export function searchInputRules() {
  return [
    {
      rule: "The clear button's slot is always reserved, filled or not.",
      why: `The ${SIDE_PAD}px of right padding never changes — the button fades in over it rather than being inserted, so the first character typed doesn't shift the caret sideways.`,
    },
    {
      rule: "The magnifier is decorative; give the input its own accessible name.",
      why: 'aria-hide the icon and label the control with a <label>, aria-label, or at minimum a placeholder — a floating glyph with no text next to it announces nothing on its own.',
    },
    {
      rule: "The clear control is a real <button>, reachable by keyboard.",
      why: 'A styled <span onClick> can\'t be tabbed to or activated with Enter/Space; a <button type="button"> gets both for free — the same call the Checkbox and the Radio Button make about their own controls.',
    },
  ];
}

export function searchInputSpecs() {
  // The state isn't a row — it's the lit canvas pill, already on screen.
  return { rules: ruleHeadlines(searchInputRules()), rows: SEARCH_SPECS };
}

// Search Input — the Input Field family's own box (height, radius, border,
// fill) with a leading magnifier and a trailing clear button, neither of
// which is a sourced Figma component on its own. The canvas pills step
// through:
//
//   Default   resting, empty, placeholder showing
//   Focus     the family's shared blue border + ring
//   Filled    a sample query, clear button faded in
//   Disabled  half-opacity, cursor not-allowed
//
// The control stays live under all four: typing always shows or hides the
// clear button for real, and clearing a pinned "Filled" query hands the pill
// back to Default rather than leaving it lying about a query that's gone.
const SAMPLE_QUERY = "brand colors";

export function SearchInputPreview({ state = "Default", setState, bestPractices }) {
  const [text, setText] = useState("");
  const disabled = state === "Disabled";
  const focusPinned = state === "Focus" || undefined;

  // Only Filled carries a query — every other pill resets to empty, so
  // switching straight from Filled to Disabled (or Focus) can't leave stale
  // text behind and misreport what that state actually looks like.
  useEffect(() => {
    setText(state === "Filled" ? SAMPLE_QUERY : "");
  }, [state]);

  const filled = text.length > 0;

  return (
    <div className="bp-stage" data-bp={bestPractices || undefined}>
      {/* `fill` because the control is width:100% of the field, same call
          Input Field makes — redlining it as hug-content would misreport it. */}
      <SpecOverlay on={bestPractices} fill widthMode="fill" padX={0} padY={0} heightMode="fixed">
        {/* No data-filled flag — :not(:placeholder-shown) reads that straight
            off the real input, live or exported, so the two can't disagree. */}
        <div className="sch" data-focus={focusPinned}>
          <span className="sch-icon" aria-hidden="true">
            <SearchIcon />
          </span>
          <input
            className="sch-input"
            type="text"
            placeholder="Search"
            aria-label="Search"
            disabled={disabled}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button
            type="button"
            className="sch-clear"
            tabIndex={filled ? 0 : -1}
            aria-label="Clear search"
            onClick={() => {
              setText("");
              setState?.("Default");
            }}
          >
            <CircleX size={15} />
          </button>
        </div>
      </SpecOverlay>
    </div>
  );
}

// ── Copyable output ─────────────────────────────────────────────────────────

const CLASS = "loka-search-input";

// Matches SearchIcon in Icon.jsx.
const SEARCH_ICON_SVG =
  `<svg viewBox="0 0 16 16" width="${T.iconSize}" height="${T.iconSize}" aria-hidden="true">` +
  `<circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" stroke-width="1.5"/>` +
  `<path d="M10.5 10.5L14 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;

// Matches CircleX in Icon.jsx.
const CLEAR_ICON_SVG =
  `<svg viewBox="0 0 15 15" width="15" height="15" aria-hidden="true">` +
  `<path d="M7.5 0C11.6421 0 15 3.35786 15 7.5C15 11.6421 11.6421 15 7.5 15C3.35786 15 0 11.6421 0 7.5C0 3.35786 3.35786 0 7.5 0ZM7.5 6.83008L5.18359 4.51465L4.52051 5.17676L6.83691 7.49316L4.51367 9.81738L5.17676 10.4805L7.5 8.15625L9.82422 10.4805L10.4873 9.81738L8.16309 7.49316L10.4805 5.17676L9.81738 4.51367L7.5 6.83008Z" ` +
  `fill="currentColor"/></svg>`;

// The wrapper carries the box (border, radius, fill); the input inside is
// bare, so it can't paint a second, competing border under the icon. Focus
// and disabled are both read off the real input via :focus-within and :has()
// — no JavaScript, and the keyboard works for free.
export function searchInputCss() {
  return blocks(
    rule(`.${CLASS}`, [
      ["position", "relative"],
      ["display", "inline-flex"],
      ["align-items", "center"],
      ["width", "100%"],
      ["max-width", "380px"],
      ["height", `${T.height}px`],
      ["border", `1px solid ${T.line}`],
      ["border-radius", `${T.radius}px`],
      ["background", T.fill],
      ["transition", "border-color .14s, box-shadow .14s"],
    ]),
    rule(`.${CLASS}:focus-within`, [
      ["border-color", T.blue],
      ["box-shadow", `0 0 0 ${T.ring}px ${T.blueSoft}`],
    ]),
    rule(`.${CLASS}:has(.${CLASS}__input:disabled)`, [["opacity", T.disabledOpacity]]),
    rule(`.${CLASS}__icon`, [
      ["position", "absolute"],
      ["left", `${T.padX}px`],
      ["display", "flex"],
      ["color", T.icon],
      ["pointer-events", "none"],
    ]),
    rule(`.${CLASS}__input`, [
      ["flex", "1"],
      ["width", "100%"],
      ["height", "100%"],
      ["padding", `0 ${SIDE_PAD}px`],
      ["border", "none"],
      ["background", "none"],
      ["outline", "none"],
      ["font-family", FONT_STACK],
      ["font-size", `${T.fontSize}px`],
      ["color", T.ink],
    ]),
    rule(`.${CLASS}__input::placeholder`, [["color", T.placeholder]]),
    rule(`.${CLASS}__input:disabled`, [["cursor", "not-allowed"]]),
    // Its slot is always reserved — see the rule above — so it fades in
    // rather than being inserted, and the caret's column never shifts.
    rule(`.${CLASS}__clear`, [
      ["position", "absolute"],
      ["right", `${T.padX - 2}px`],
      ["display", "inline-flex"],
      ["align-items", "center"],
      ["justify-content", "center"],
      ["width", `${T.clearHit}px`],
      ["height", `${T.clearHit}px`],
      ["padding", "0"],
      ["border", "none"],
      ["background", "none"],
      ["color", T.icon],
      ["cursor", "pointer"],
      ["opacity", "0"],
      ["pointer-events", "none"],
      ["transition", "opacity .12s, color .12s"],
    ]),
    rule(`.${CLASS}:has(.${CLASS}__input:not(:placeholder-shown)) .${CLASS}__clear`, [
      ["opacity", "1"],
      ["pointer-events", "auto"],
    ]),
    rule(`.${CLASS}__clear:hover`, [["color", T.clearHover]]),
    rule(`.${CLASS}:has(.${CLASS}__input:focus-visible)`, [["outline", "auto"]]),
  );
}

export function searchInputHtmlSnippet({ state = "Default" }) {
  const disabled = state === "Disabled";
  const value = state === "Filled" ? SAMPLE_QUERY : "";

  const markup = [
    `<div class="${CLASS}">`,
    indent(`<span class="${CLASS}__icon">${SEARCH_ICON_SVG}</span>`),
    indent(
      `<input class="${CLASS}__input" type="text" placeholder="Search" aria-label="Search"` +
        `${value ? ` value="${value}"` : ""}${disabled ? " disabled" : ""}>`,
    ),
    indent(
      `<button type="button" class="${CLASS}__clear" aria-label="Clear search"${value ? "" : ` tabindex="-1"`}>${CLEAR_ICON_SVG}</button>`,
    ),
    "</div>",
    "",
    `<!-- The clear button's own fade-in needs no JavaScript — it's driven by`,
    `     :not(:placeholder-shown) on the input above. Only the click itself`,
    `     does: wire it to reset the input's value and return focus to it. -->`,
  ].join("\n");

  const caveat =
    state === "Focus"
      ? "\n<!-- Focus is a browser state, so it isn't in the markup — the :focus-within rule above draws it. -->"
      : "";

  return htmlDocument({
    title: `Search Input — ${state}`,
    css: searchInputCss(),
    markup: markup + caveat,
  });
}

export function searchInputPromptSnippet({ state = "Default" }) {
  return specPrompt({
    component: "Search Input",
    config: state,
    sections: [
      [
        "Box",
        [
          ["Width", "fills its container, up to 380px"],
          ["Height", `${T.height}px`],
          ["Padding", `0 ${SIDE_PAD}px — the same on both sides, reserved whether the clear button shows or not`],
          ["Radius", `${T.radius}px`],
          ["Border", `1px solid ${tokenRef(T.line)}`],
          ["Fill", tokenRef(T.fill)],
        ],
      ],
      [
        "Icon & clear button",
        [
          ["Icon", `${T.iconSize}px magnifier, ${tokenRef(T.icon)}, ${T.padX}px from the left edge`],
          ["Clear hit target", `${T.clearHit}px square, ${T.padX - 2}px from the right edge`],
          ["Clear glyph", `${tokenRef(T.icon)} at rest, ${tokenRef(T.clearHover)} on hover`],
          ["Clear visibility", "opacity 0 → 1 over 120ms once there's a query — never display:none, so it can't shift layout"],
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
    ],
    states: [
      `Focus: border becomes ${tokenRef(T.blue)} with a ${T.ring}px ${tokenRef(T.blueSoft)} ring, transitioned over 140ms — the same treatment the Input Field uses, driven by :focus-within on the wrapper rather than :focus on the input alone, since the icon and the clear button sit outside it.`,
      "Filled: a query is present, so the clear button fades in. Nothing else about the box changes.",
      `Disabled: ${Math.round(T.disabledOpacity * 100)}% opacity, cursor: not-allowed.`,
    ],
    notes: [
      ...ruleTexts(searchInputRules()),
      "Shares the Input Field family's own box rather than a second one — same height, radius, border and fill. Only the icon and the clear button are this control's own.",
    ],
    reference: searchInputHtmlSnippet({ state }),
  });
}
