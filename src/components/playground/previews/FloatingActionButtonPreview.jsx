import { useEffect, useState } from "react";
import { SpecOverlay } from "../SpecOverlay.jsx";
import { ArrowInline } from "../../common/Icon.jsx";
import { FONT_STACK, blocks, htmlDocument, indent, rule, ruleHeadlines, ruleTexts, specPrompt, tokenRef } from "../snippets.js";

// Resolved values for the pill — Loka Figma "Frame 2121455575" (node 118:125).
// A count chip and a "See roles" call to action share one floating bar, the
// bar's own fill and border both opacity overlays rather than solid colors.
const T = {
  bg: "rgba(5,5,23,.6)", // colors/neutral-opacity/dark-60
  bgActive: "rgba(5,5,23,.72)", // hover/press — same fill-only convention the Button's own variants use
  blur: 8,
  border: "rgba(255,255,255,.2)", // white-100 at 20%
  borderActive: "rgba(255,255,255,.32)",
  radius: 14,
  gap: 10,
  padTop: 4,
  padRight: 10,
  padBottom: 4,
  padLeft: 4,
  chipBg: "#FFFFFF", // white-100
  chipRadius: 10,
  chipPadX: 10,
  chipPadY: 8,
  chipText: "#2E3F5A", // gray-70
  label: "#FFFFFF", // white-100
  innerGap: 6,
  iconBox: 24,
  // Figma's own frame sets this text at Body Large (20px); sized down to the
  // Button's own Body size instead so the pill's text reads at the same scale
  // as every other button label in the system rather than standing out oversized.
  fontSize: 16,
  lineHeight: 1.3,
};

const FAB_SPECS = [
  ["Pill fill", `${T.bg} · dark-60`],
  ["Pill fill · hover/press", `${T.bgActive}`],
  ["Pill blur", `${T.blur}px backdrop-filter`],
  ["Pill border", `1px ${T.border} · white 20%`],
  ["Pill radius", `${T.radius}px`],
  ["Pill padding", `${T.padTop}px ${T.padRight}px ${T.padBottom}px ${T.padLeft}px`],
  ["Pill gap", `${T.gap}px between chip and CTA`],
  ["Chip", `${T.chipBg} · white-100 · radius ${T.chipRadius}px`],
  ["Chip padding", `${T.chipPadY}px ${T.chipPadX}px`],
  ["Text", `${T.fontSize}px / ${T.lineHeight} · Body`],
  ["Chip text", `${T.chipText} · gray-70`],
  ["Label", `${T.label} · white`],
  ["Icon", `${T.iconBox}px box`],
];

// The guidance behind the pill, stated once. The specs panel shows the
// headlines; the AI prompt shows these with their reasoning attached.
export function floatingActionButtonRules() {
  return [
    {
      rule: "It's a single button, not a static label.",
      why: "The whole pill is one click target — hover and press feedback need to cover the count chip too, not just the \"See roles\" side.",
    },
    {
      rule: "The pill is two nested surfaces, not one flat fill.",
      why: "The white count chip sits inside the translucent bar so the count stays legible no matter what the bar is floating above.",
    },
    {
      rule: "Hover and press share one appearance, like every other button in this system.",
      why: `The fill steps to ${T.bgActive} and the border to ${T.borderActive}; press additionally scales the pill to 0.97. Desktop reaches it by hovering, mobile by pressing.`,
    },
    {
      rule: "The blur only reads over real content behind the pill.",
      why: "backdrop-filter softens whatever sits behind the element — a page background, a photo, a section fill. Over this panel's flat canvas it has nothing to soften, so don't mistake the flat look here for the fill being wrong.",
    },
    {
      rule: "The bar hugs its content on every side rather than taking a fixed width.",
      why: `Its own padding is asymmetric — ${T.padTop}px top and bottom, ${T.padLeft}px before the chip, ${T.padRight}px after the label — so don't average it into one uniform value.`,
    },
    {
      rule: "The arrow sits inline with the label text, not the count.",
      why: "It reads as part of the action (\"See roles\"), so it belongs beside that label rather than the chip.",
    },
    {
      rule: `Text runs at ${T.fontSize}px, the Button's own size, not Figma's literal 20px.`,
      why: "It's a button in every other respect, so its label reads at the same scale as the rest of the system's buttons rather than standing out oversized.",
    },
  ];
}

export function floatingActionButtonSpecs() {
  return { rules: ruleHeadlines(floatingActionButtonRules()), rows: FAB_SPECS };
}

// Floating Action Button — the Loka Figma "Frame 2121455575" (node 118:125): a
// job-count chip and a "See roles" call to action sharing one blurred bar.
// Figma documents only the resting fill; hover and press follow the same
// fill-only convention every other interactive component here uses (see the
// Button's "Outline dark" variant) rather than inventing a new one. State
// lives here rather than in the playground, same as the Accordion, Filter and
// Tabs — it's reported up for the canvas readout instead of being lifted.
export function FloatingActionButtonPreview({ bestPractices, onState }) {
  const [fabState, setFabState] = useState("default"); // default | hover | pressed

  useEffect(() => {
    onState?.(
      fabState === "pressed"
        ? { text: "Pressed", tone: "pressed" }
        : fabState === "hover"
          ? { text: "Hovered", tone: "active" }
          : { text: "Default", tone: "default" },
    );
  }, [fabState, onState]);

  return (
    <div className="bp-stage" data-bp={bestPractices || undefined}>
      <button
        type="button"
        className="fab"
        data-state={fabState}
        onMouseEnter={() => setFabState("hover")}
        onMouseLeave={() => setFabState("default")}
        onMouseDown={() => setFabState("pressed")}
        onMouseUp={() => setFabState("hover")}
      >
        <SpecOverlay on={bestPractices} padX={T.chipPadX} padY={T.chipPadY} widthMode="hug" heightMode="hug">
          <span className="fab-chip">16 Opens</span>
        </SpecOverlay>
        <span className="fab-cta">
          <span className="fab-label">See roles</span>
          <span className="fab-icon" aria-hidden="true">
            <ArrowInline size={16} />
          </span>
        </span>
      </button>
    </div>
  );
}

// ── Copyable output ─────────────────────────────────────────────────────────

const CLASS = "loka-fab";

// Matches ArrowInline in Icon.jsx — the same glyph, as static markup.
const arrowSvg = () =>
  `<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">` +
  `<path d="M3 8h9M8 3.5L12.5 8L8 12.5" fill="none" stroke="currentColor" stroke-width="1.6" ` +
  `stroke-linecap="round" stroke-linejoin="round"/></svg>`;

export function floatingActionButtonCss() {
  return blocks(
    rule(`.${CLASS}`, [
      ["display", "inline-flex"],
      ["align-items", "center"],
      ["gap", `${T.gap}px`],
      ["padding", `${T.padTop}px ${T.padRight}px ${T.padBottom}px ${T.padLeft}px`],
      ["border", `1px solid ${T.border}`],
      ["border-radius", `${T.radius}px`],
      ["background", T.bg],
      ["backdrop-filter", `blur(${T.blur}px)`],
      ["cursor", "pointer"],
      ["transition", "background .12s, border-color .12s, transform .08s"],
    ]),
    rule(`.${CLASS}:hover`, [
      ["background", T.bgActive],
      ["border-color", T.borderActive],
    ]),
    rule(`.${CLASS}:active`, [
      ["background", T.bgActive],
      ["border-color", T.borderActive],
      ["transform", "scale(0.97)"],
    ]),
    rule(`.${CLASS}__chip`, [
      ["display", "flex"],
      ["align-items", "center"],
      ["justify-content", "center"],
      ["padding", `${T.chipPadY}px ${T.chipPadX}px`],
      ["background", T.chipBg],
      ["border-radius", `${T.chipRadius}px`],
      ["overflow", "clip"],
      ["white-space", "nowrap"],
      ["font-family", FONT_STACK],
      ["font-size", `${T.fontSize}px`],
      ["font-weight", "400"],
      ["line-height", T.lineHeight],
      ["color", T.chipText],
    ]),
    rule(`.${CLASS}__cta`, [
      ["display", "flex"],
      ["align-items", "center"],
      ["gap", `${T.innerGap}px`],
    ]),
    rule(`.${CLASS}__label`, [
      ["white-space", "nowrap"],
      ["font-family", FONT_STACK],
      ["font-size", `${T.fontSize}px`],
      ["font-weight", "400"],
      ["line-height", T.lineHeight],
      ["color", T.label],
    ]),
    rule(`.${CLASS}__icon`, [
      ["display", "flex"],
      ["flex", "none"],
      ["align-items", "center"],
      ["justify-content", "center"],
      ["width", `${T.iconBox}px`],
      ["height", `${T.iconBox}px`],
      ["color", T.label],
    ]),
  );
}

export function floatingActionButtonHtmlSnippet() {
  const markup = [
    `<button type="button" class="${CLASS}">`,
    indent(`<span class="${CLASS}__chip">16 Opens</span>`),
    indent(`<span class="${CLASS}__cta">`),
    indent(`<span class="${CLASS}__label">See roles</span>`, 4),
    indent(`<span class="${CLASS}__icon">${arrowSvg()}</span>`, 4),
    indent("</span>"),
    "</button>",
    "",
    "<!-- A real button, not a styled div — the whole pill is one click target,",
    "     count chip included. Meant to float above page content, so position:",
    "     fixed and its z-index are the host page's decision, not this",
    "     component's; the backdrop blur needs real content behind it to read,",
    "     which a flat page background won't give it. -->",
  ].join("\n");

  return htmlDocument({ title: "Floating Action Button", css: floatingActionButtonCss(), markup });
}

export function floatingActionButtonPromptSnippet() {
  return specPrompt({
    component: "Floating Action Button",
    config: "Count chip + \"See roles\" call to action, floating pill button",
    sections: [
      [
        "Pill",
        [
          ["Element", "a real <button>, not a styled div — the count chip sits inside it"],
          ["Width", "hugs its content on every side"],
          ["Fill", tokenRef(T.bg)],
          ["Backdrop blur", `${T.blur}px`],
          ["Border", `1px solid ${tokenRef(T.border)}`],
          ["Radius", `${T.radius}px`],
          ["Padding", `${T.padTop}px top/bottom, ${T.padLeft}px before the chip, ${T.padRight}px after the label`],
          ["Gap", `${T.gap}px between the chip and the call to action`],
        ],
      ],
      [
        "Chip",
        [
          ["Fill", tokenRef(T.chipBg)],
          ["Radius", `${T.chipRadius}px`],
          ["Padding", `${T.chipPadY}px ${T.chipPadX}px`],
          ["Text", `${T.fontSize}px / ${T.lineHeight}, Alliance No.2, ${tokenRef(T.chipText)}`],
        ],
      ],
      [
        "Call to action",
        [
          ["Gap", `${T.innerGap}px between the label and the arrow`],
          ["Label", `${T.fontSize}px / ${T.lineHeight}, Alliance No.2, ${tokenRef(T.label)}`],
          ["Icon", `${T.iconBox}px box, ${tokenRef(T.label)} — same inline arrow the Button's labels use`],
        ],
      ],
    ],
    states: [
      `Hover and press share one appearance: fill steps to ${tokenRef(T.bgActive)} and the border to ${tokenRef(T.borderActive)} over 120ms. Desktop reaches it by hovering, mobile by pressing — same convention as this system's Button.`,
      "Press additionally applies transform: scale(0.97) over 80ms, so touch still gets feedback.",
      "Positioning (fixed, sticky, its z-index) is the hosting page's call — the component itself only owns its own box.",
    ],
    notes: [
      ...ruleTexts(floatingActionButtonRules()),
      "The count and the label are two separate text nodes, not one string — a screen reader should be able to tell \"16 Opens\" from \"See roles\".",
    ],
    reference: floatingActionButtonHtmlSnippet(),
  });
}
