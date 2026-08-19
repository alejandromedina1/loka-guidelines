import { useState } from "react";
import { InfoIcon } from "../../common/Icon.jsx";
import { ICON_CATEGORIES } from "../../../data/icons.js";
import { SpecOverlay } from "../SpecOverlay.jsx";
import { blocks, htmlDocument, indent, rule, ruleHeadlines, ruleTexts, specPrompt, tokenRef } from "../snippets.js";

// Two triggers share one tooltip treatment: Loka Figma "Tooltip" (node
// 150:473, Toolbar — Bold/Italic/Underline/Email) and this system's own
// addition, Icon — a single info glyph whose tooltip carries a full
// sentence instead of a one-word label. Default and Hover are frozen Figma
// variants; on the page every trigger gets the same hover/focus treatment,
// not just Bold's sourced example.
const BAR = {
  bg: "#F5F6FA", // color-bg-subtle
  // Figma's own sourced padding is 2px, which puts the toolbar at 28px tall
  // (2 + the button's 24px + 2). Widened to 4px so the shell reads at 32px
  // instead — the button itself keeps its sourced 24×24 size.
  pad: 4,
  gap: 2,
  radius: 2,
};

const BTN = {
  size: 24,
  padX: 6,
  padY: 3,
  hoverBg: "#FDFDFD", // color-bg-page
  textColor: "#020F1F", // color-text-primary / gray-90
  letterSize: 14,
  letterTracking: 1.12,
  iconSize: 16,
};

const TOOLTIP = {
  bg: "#041D3E", // color-bg-inverse / DarkBlue
  color: "#FFFFFF",
  fontSize: 14,
  padX: 6,
  padY: 4,
  radius: 4,
  gap: 6, // not sourced — the distance above the trigger; Figma's -24px offset was specific to Bold's own position
};

// Not sourced — the Toolbar's tooltip is one shared element that slides
// between buttons rather than four independent bubbles crossfading. Same
// house ease-out curve the Card's CTA join animation uses, quicker since
// this travels a much shorter distance.
const SLIDE = { duration: "0.22s", ease: "cubic-bezier(.22,1,.36,1)" };

// Not in the sourced spec at all — the Icon variant's own trigger and its
// longer, wrapped tooltip.
const ICON_TRIGGER = {
  size: 24,
  hoverBg: "#E7ECF2", // gray-10 — a circular hover chip, since there's no toolbar shell to set it apart from
  glyphSize: 16,
  color: "#5C6A82", // gray-60
  hoverColor: "#020F1F", // gray-90
};

const LONG_TOOLTIP = {
  // A fixed width, not max-width: the bubble is absolutely positioned inside
  // a 24px trigger, so a wrapping box sized by shrink-to-fit measures itself
  // against that tiny containing block and never reaches a max-width ceiling
  // — it just wraps at whatever single word is longest instead.
  width: 220,
  lineHeight: 1.4,
  text: "This icon explains a field or setting in more detail — hover or focus it whenever a short label on its own isn't enough.",
};

// The Email icon already lives in the Icons catalog — reused here rather
// than re-fetching a second copy of the same glyph from Figma.
const EMAIL_ICON = ICON_CATEGORIES.flatMap((c) => c.icons).find((i) => i.name === "Email");

// One entry per toolbar button. Only Bold is in Figma's own hovered example;
// Italic, Underline and Email get the identical treatment by extension, not
// because each has its own sourced variant.
const TOOLBAR_ITEMS = [
  { key: "bold", label: "Bold", content: "B", weight: 600 },
  { key: "italic", label: "Italic", content: "I", weight: 500, italic: true },
  { key: "underline", label: "Underline", content: "U", weight: 500, underline: true },
  { key: "email", label: "Email", icon: true },
];

// Guidance both triggers share, stated once regardless of which is on stage.
function sharedTooltipRules() {
  return [
    {
      rule: "No arrow points from the tooltip to its trigger.",
      why: "Figma's own bubble is a plain rounded rectangle — adding a caret would be a generic tooltip convention this component doesn't use.",
    },
    {
      rule: "Real <button> elements with hover and keyboard focus both revealing the tooltip.",
      why: "A trigger is operated by more than a mouse — :focus-visible shows the same content a keyboard user tabbing through would need, not just :hover.",
    },
    {
      rule: "Centered above its own trigger, not pinned to a fixed offset.",
      why: "Figma's single example (Bold) happens to sit at the toolbar's left edge, so its literal absolute offsets only place that one bubble correctly. Centering each tooltip over its own trigger is what makes the rule generalize to every button — and to the Icon variant's own single one.",
    },
  ];
}

function toolbarTooltipRules() {
  return [
    {
      rule: "One shared tooltip slides between buttons, not four independent bubbles.",
      why: "Figma's own hovered variant only shows Bold's, frozen in place. Moving the pointer from one button to another here slides the same element to the new position instead of crossfading a new one in — Italic, Underline and Email get the identical treatment, not just Bold's sourced example.",
    },
    {
      rule: "Hover does two things at once: a white chip behind the button, and a dark label above it.",
      why: "The sourced hover variant carries both — losing either one would read as a different, weaker interaction than what's documented.",
    },
    {
      rule: "Position is measured from each button's real layout, not computed from fixed pixel math.",
      why: "Reading offsetLeft/offsetWidth off the actual hovered button means adding, removing or resizing a button just works — nothing needs updating by hand to match a new layout.",
    },
    {
      rule: "This is the one component in this catalog whose exported snippet needs a little JavaScript.",
      why: "True sliding between two different targets isn't achievable with :hover alone — the tooltip has to persist as one element and move while the hovered button changes underneath it, which only script can drive.",
    },
    {
      rule: "The tooltip text mirrors whichever button is active's own accessible name, so it's marked aria-hidden.",
      why: "Each button's aria-label already says \"Bold\" or \"Italic\" — repeating it through a visible, unhidden node would announce the same word twice to a screen reader.",
    },
    {
      rule: `The toolbar sits at ${BAR.pad * 2 + BTN.size}px tall, not Figma's sourced 28px.`,
      why: `Widening the shell's own padding from 2px to ${BAR.pad}px gets there without touching the button's sourced 24×24 size — the one thing that changed is how much shell surrounds it.`,
    },
  ];
}

function iconTooltipRules() {
  return [
    {
      rule: "A single trigger, not a toolbar shell around one item.",
      why: "The gray bar's job was grouping several buttons — wrapping a lone icon in the same shell would just be an unused box around it.",
    },
    {
      rule: "The hover chip is a circle, not the toolbar's square.",
      why: "Matches how a standalone inline icon button reads elsewhere — next to a form label, say — rather than borrowing the toolbar's own square-button treatment.",
    },
    {
      rule: "The tooltip carries a full sentence, so it wraps and left-aligns instead of centering on one line.",
      why: `A one-word label reads fine centered; a sentence needs a ${LONG_TOOLTIP.width}px measure and left-aligned lines to stay legible once it's more than a few words.`,
    },
    {
      rule: `Fixed width (${LONG_TOOLTIP.width}px), not max-width.`,
      why: "The bubble is absolutely positioned inside a 24px trigger. A wrapping box with only max-width set measures its shrink-to-fit size against that tiny containing block first and never reaches the ceiling — it just wraps at whichever single word is longest. A fixed width sidesteps that entirely.",
    },
    {
      rule: "Linked with aria-describedby, not mirrored and hidden.",
      why: "The Toolbar's one-word labels just restate the button's own aria-label, so the visible copy can be hidden from screen readers. A full sentence is new information, not a restatement — it has to reach assistive tech through aria-describedby instead of being hidden.",
    },
  ];
}

// The guidance behind whichever trigger is on stage, stated once. The specs
// panel shows the headlines; the AI prompt shows these with their reasoning
// attached.
export function tooltipRules(variant) {
  return [...sharedTooltipRules(), ...(variant === "Icon" ? iconTooltipRules() : toolbarTooltipRules())];
}

export function tooltipSpecs({ variant }) {
  const rows =
    variant === "Icon"
      ? [
          ["Trigger", `${ICON_TRIGGER.size}×${ICON_TRIGGER.size}px · circular hover chip`],
          ["Trigger · hover/focus", `${ICON_TRIGGER.hoverBg} · gray-10`],
          ["Glyph", `${ICON_TRIGGER.glyphSize}×${ICON_TRIGGER.glyphSize}px · ${ICON_TRIGGER.color} → ${ICON_TRIGGER.hoverColor}`],
          ["Tooltip", `${TOOLTIP.bg} · ${TOOLTIP.color} text · ${TOOLTIP.radius}px radius`],
          ["Tooltip padding", `${TOOLTIP.padY}px ${TOOLTIP.padX}px`],
          ["Tooltip width", `${LONG_TOOLTIP.width}px fixed · ${LONG_TOOLTIP.lineHeight} line-height · left-aligned`],
          ["Tooltip position", `centered above its trigger, ${TOOLTIP.gap}px gap`],
        ]
      : [
          ["Toolbar", `${BAR.bg} · ${BAR.pad}px padding · ${BAR.gap}px gap · ${BAR.radius}px radius`],
          ["Button", `${BTN.size}×${BTN.size}px · ${BTN.padX}px/${BTN.padY}px padding`],
          ["Button · hover/focus", `${BTN.hoverBg} · color-bg-page`],
          ["Letters", `${BTN.letterSize}px · uppercase · ${BTN.letterTracking}px tracking · ${BTN.textColor}`],
          ["Icon", `${BTN.iconSize}×${BTN.iconSize}px · ${BTN.textColor}`],
          ["Tooltip", `${TOOLTIP.bg} · ${TOOLTIP.color} text · ${TOOLTIP.radius}px radius`],
          ["Tooltip padding", `${TOOLTIP.padY}px ${TOOLTIP.padX}px`],
          ["Tooltip position", `centered above its button, ${TOOLTIP.gap}px gap`],
        ];

  return { rules: ruleHeadlines(tooltipRules(variant)), rows };
}

// Live Tooltip preview — Loka Figma "Tooltip" (node 150:473) for the Toolbar
// variant, plus this system's own single-icon Icon variant. The Icon
// variant's hover/focus is plain CSS; onState only feeds the canvas readout,
// same pattern the Card's hover uses. Which trigger renders is the canvas
// toggle, same as the Card's own Graphic/Image modes.
export function TooltipPreview({ variant, bestPractices, onState }) {
  const report = (label) =>
    onState?.(label === "Default" ? { text: "Default", tone: "default" } : { text: label, tone: "active" });

  // The Toolbar's one shared tooltip needs its position tracked in JS — see
  // the "one shared tooltip slides" rule above for why :hover alone can't
  // do this. left/label default to the resting state; visible starts false
  // so nothing shows before the first hover.
  const [tooltip, setTooltip] = useState({ visible: false, left: 0, label: "" });

  const showTooltip = (e, label) => {
    const btn = e.currentTarget;
    setTooltip({ visible: true, left: btn.offsetLeft + btn.offsetWidth / 2, label });
  };
  const hideTooltip = () => setTooltip((t) => ({ ...t, visible: false }));

  if (variant === "Icon") {
    return (
      <div className="bp-stage" data-bp={bestPractices || undefined}>
        <SpecOverlay on={bestPractices} widthMode="hug" heightMode="hug" padX={0} padY={0}>
          <button
            type="button"
            className="tooltip-icon-btn"
            aria-label="More info"
            aria-describedby="tooltip-icon-desc"
            onMouseEnter={() => report("Info")}
            onMouseLeave={() => report("Default")}
            onFocus={() => report("Info")}
            onBlur={() => report("Default")}
          >
            <InfoIcon size={ICON_TRIGGER.glyphSize} />
            <span id="tooltip-icon-desc" className="tooltip-bubble tooltip-bubble--long" role="tooltip">
              {LONG_TOOLTIP.text}
            </span>
          </button>
        </SpecOverlay>
      </div>
    );
  }

  return (
    <div className="bp-stage" data-bp={bestPractices || undefined}>
      <SpecOverlay on={bestPractices} widthMode="hug" heightMode="hug" padX={BAR.pad} padY={BAR.pad}>
        <div className="tooltip-bar">
          {TOOLBAR_ITEMS.map((item) => (
            <button
              key={item.key}
              type="button"
              className="tooltip-bar-btn"
              aria-label={item.label}
              onMouseEnter={(e) => {
                showTooltip(e, item.label);
                report(item.label);
              }}
              onMouseLeave={() => {
                hideTooltip();
                report("Default");
              }}
              onFocus={(e) => {
                showTooltip(e, item.label);
                report(item.label);
              }}
              onBlur={() => {
                hideTooltip();
                report("Default");
              }}
            >
              {item.icon ? (
                <span
                  className="tooltip-bar-icon"
                  aria-hidden="true"
                  dangerouslySetInnerHTML={{ __html: EMAIL_ICON.svg }}
                />
              ) : (
                <span
                  className="tooltip-bar-letter"
                  aria-hidden="true"
                  style={{
                    fontWeight: item.weight,
                    fontStyle: item.italic ? "italic" : "normal",
                    textDecoration: item.underline ? "underline" : "none",
                  }}
                >
                  {item.content}
                </span>
              )}
            </button>
          ))}
          <span
            className="tooltip-bubble tooltip-bubble--shared"
            role="tooltip"
            aria-hidden="true"
            data-visible={tooltip.visible}
            style={{ left: tooltip.left }}
          >
            {tooltip.label}
          </span>
        </div>
      </SpecOverlay>
    </div>
  );
}

// ── Copyable output ─────────────────────────────────────────────────────────

const CLASS = "loka-tooltip-bar";
const ICON_CLASS = "loka-tooltip-icon";

// A tooltip nested inside, and revealed by, its own single trigger — the
// Icon variant's shape. The Toolbar's tooltip is a sibling shared across
// four buttons instead (see toolbarCss below), so this helper isn't reused
// there the way it used to be.
function tooltipBubbleCss(btnClass, tooltipClass) {
  return blocks(
    rule(tooltipClass, [
      ["position", "absolute"],
      ["left", "50%"],
      ["bottom", `calc(100% + ${TOOLTIP.gap}px)`],
      ["transform", "translateX(-50%)"],
      ["background", TOOLTIP.bg],
      ["color", TOOLTIP.color],
      ["font-size", `${TOOLTIP.fontSize}px`],
      ["font-weight", "500"],
      ["white-space", "nowrap"],
      ["padding", `${TOOLTIP.padY}px ${TOOLTIP.padX}px`],
      ["border-radius", `${TOOLTIP.radius}px`],
      ["opacity", "0"],
      ["visibility", "hidden"],
      ["pointer-events", "none"],
      ["transition", "opacity .12s ease"],
    ]),
    rule(`${btnClass}:hover ${tooltipClass}, ${btnClass}:focus-visible ${tooltipClass}`, [
      ["opacity", "1"],
      ["visibility", "visible"],
    ]),
  );
}

function toolbarCss() {
  return blocks(
    rule(`.${CLASS}`, [
      ["position", "relative"], // anchors the shared tooltip below
      ["display", "inline-flex"],
      ["align-items", "center"],
      ["gap", `${BAR.gap}px`],
      ["padding", `${BAR.pad}px`],
      ["background", BAR.bg],
      ["border-radius", `${BAR.radius}px`],
    ]),
    rule(`.${CLASS}__btn`, [
      ["position", "relative"],
      ["display", "flex"],
      ["align-items", "center"],
      ["justify-content", "center"],
      ["width", `${BTN.size}px`],
      ["height", `${BTN.size}px`],
      ["padding", `${BTN.padY}px ${BTN.padX}px`],
      ["box-sizing", "border-box"],
      ["transition", "background .12s ease"],
    ]),
    rule(`.${CLASS}__btn:hover, .${CLASS}__btn:focus-visible`, [["background", BTN.hoverBg]]),
    rule(`.${CLASS}__letter`, [
      ["font-size", `${BTN.letterSize}px`],
      ["line-height", "1"],
      ["letter-spacing", `${BTN.letterTracking}px`],
      ["text-transform", "uppercase"],
      ["color", BTN.textColor],
    ]),
    rule(`.${CLASS}__icon`, [
      ["display", "flex"],
      ["align-items", "center"],
      ["justify-content", "center"],
      ["width", `${BTN.iconSize}px`],
      ["height", `${BTN.iconSize}px`],
      ["color", BTN.textColor],
    ]),
    rule(`.${CLASS}__icon svg`, [
      ["width", `${BTN.iconSize}px`],
      ["height", `${BTN.iconSize}px`],
      ["display", "block"],
    ]),
    // One tooltip, shared across all four buttons, positioned by a script-set
    // `left` rather than nested inside whichever button is hovered — that's
    // what lets it slide from one position to the next instead of one bubble
    // fading out while a different one fades in.
    rule(`.${CLASS}__tooltip`, [
      ["position", "absolute"],
      ["bottom", `calc(100% + ${TOOLTIP.gap}px)`],
      ["transform", "translateX(-50%)"],
      ["background", TOOLTIP.bg],
      ["color", TOOLTIP.color],
      ["font-size", `${TOOLTIP.fontSize}px`],
      ["font-weight", "500"],
      ["white-space", "nowrap"],
      ["padding", `${TOOLTIP.padY}px ${TOOLTIP.padX}px`],
      ["border-radius", `${TOOLTIP.radius}px`],
      ["opacity", "0"],
      ["visibility", "hidden"],
      ["pointer-events", "none"],
      ["transition", `opacity .15s ease, left ${SLIDE.duration} ${SLIDE.ease}`],
    ]),
    rule(`.${CLASS}__tooltip[data-visible="true"]`, [
      ["opacity", "1"],
      ["visibility", "visible"],
    ]),
  );
}

function iconCss() {
  return blocks(
    rule(`.${ICON_CLASS}`, [
      ["position", "relative"],
      ["display", "flex"],
      ["align-items", "center"],
      ["justify-content", "center"],
      ["width", `${ICON_TRIGGER.size}px`],
      ["height", `${ICON_TRIGGER.size}px`],
      ["border-radius", "999px"],
      ["color", ICON_TRIGGER.color],
      ["transition", "background .12s ease, color .12s ease"],
    ]),
    rule(`.${ICON_CLASS}:hover, .${ICON_CLASS}:focus-visible`, [
      ["background", ICON_TRIGGER.hoverBg],
      ["color", ICON_TRIGGER.hoverColor],
    ]),
    // The shared bubble rules set white-space: nowrap — this override MUST
    // come after them in source order, or the tie on that property resolves
    // to the shared rule's nowrap instead of this one's wrap.
    tooltipBubbleCss(`.${ICON_CLASS}`, `.${ICON_CLASS}__tooltip`),
    rule(`.${ICON_CLASS}__tooltip`, [
      ["white-space", "normal"],
      // A fixed width, not max-width — see the comment on LONG_TOOLTIP above.
      ["width", `${LONG_TOOLTIP.width}px`],
      ["line-height", `${LONG_TOOLTIP.lineHeight}`],
      ["text-align", "left"],
    ]),
  );
}

export function tooltipCss(variant) {
  return variant === "Icon" ? iconCss() : toolbarCss();
}

function toolbarHtmlSnippet() {
  const markup = [
    `<div class="${CLASS}" id="loka-tooltip-bar">`,
    indent(`<button type="button" class="${CLASS}__btn" aria-label="Bold" data-tooltip="Bold">`),
    indent(`<span class="${CLASS}__letter" aria-hidden="true" style="font-weight:600">B</span>`, 4),
    indent("</button>"),
    indent(`<button type="button" class="${CLASS}__btn" aria-label="Italic" data-tooltip="Italic">`),
    indent(
      `<span class="${CLASS}__letter" aria-hidden="true" style="font-weight:500;font-style:italic">I</span>`,
      4,
    ),
    indent("</button>"),
    indent(`<button type="button" class="${CLASS}__btn" aria-label="Underline" data-tooltip="Underline">`),
    indent(
      `<span class="${CLASS}__letter" aria-hidden="true" style="font-weight:500;text-decoration:underline">U</span>`,
      4,
    ),
    indent("</button>"),
    indent(`<button type="button" class="${CLASS}__btn" aria-label="Email" data-tooltip="Email">`),
    indent(`<span class="${CLASS}__icon" aria-hidden="true">${EMAIL_ICON.svg}</span>`, 4),
    indent("</button>"),
    indent(`<span class="${CLASS}__tooltip" role="tooltip" aria-hidden="true"></span>`),
    "</div>",
    "",
    "<!-- Four real buttons sharing one tooltip, not one bubble per button.",
    "     Hover or :focus-visible each to slide it to that button's position",
    "     — the tooltip text mirrors each button's own aria-label, so it's",
    "     marked aria-hidden rather than announced twice. This is the one",
    "     component in this catalog whose reveal needs a little JavaScript:",
    "     true sliding between two different targets isn't achievable with",
    "     :hover alone, since the tooltip has to persist as one element",
    "     while the hovered button changes underneath it. -->",
    "<script>",
    "(function () {",
    indent('var bar = document.getElementById("loka-tooltip-bar");'),
    indent(`var tooltip = bar.querySelector(".${CLASS}__tooltip");`),
    indent(`var buttons = bar.querySelectorAll(".${CLASS}__btn");`),
    indent("buttons.forEach(function (btn) {"),
    indent("var show = function () {", 2),
    indent("tooltip.textContent = btn.dataset.tooltip;", 4),
    indent('tooltip.style.left = (btn.offsetLeft + btn.offsetWidth / 2) + "px";', 4),
    indent('tooltip.dataset.visible = "true";', 4),
    indent("};", 2),
    indent('var hide = function () { tooltip.dataset.visible = "false"; };', 2),
    indent('btn.addEventListener("mouseenter", show);', 2),
    indent('btn.addEventListener("focus", show);', 2),
    indent('btn.addEventListener("mouseleave", hide);', 2),
    indent('btn.addEventListener("blur", hide);', 2),
    indent("});"),
    "})();",
    "</script>",
  ].join("\n");

  return htmlDocument({ title: "Tooltip — Toolbar", css: toolbarCss(), markup });
}

function iconHtmlSnippet() {
  const markup = [
    `<button type="button" class="${ICON_CLASS}" aria-label="More info" aria-describedby="tooltip-icon-desc">`,
    indent(`<!-- info glyph goes here -->`),
    indent(
      `<span id="tooltip-icon-desc" class="${ICON_CLASS}__tooltip" role="tooltip">${LONG_TOOLTIP.text}</span>`,
    ),
    "</button>",
    "",
    "<!-- A real button, hover/focus reveals the tooltip via pure CSS. Unlike",
    "     the Toolbar's one-word labels, this tooltip is new information, not",
    "     a restatement of the button's name — so it's linked with",
    "     aria-describedby and left visible to assistive tech rather than",
    "     hidden. Give the tooltip a unique id per instance in real usage. -->",
  ].join("\n");

  return htmlDocument({ title: "Tooltip — Icon", css: iconCss(), markup });
}

export function tooltipHtmlSnippet({ variant }) {
  return variant === "Icon" ? iconHtmlSnippet() : toolbarHtmlSnippet();
}

export function tooltipPromptSnippet({ variant }) {
  if (variant === "Icon") {
    return specPrompt({
      component: "Tooltip — Icon",
      config: "Single info glyph with a longer, wrapped hover/focus tooltip",
      sections: [
        [
          "Trigger",
          [
            ["Element", "a real <button>, not a styled div — hover and :focus-visible both trigger the tooltip"],
            ["Size", `${ICON_TRIGGER.size}×${ICON_TRIGGER.size}px, circular hover chip`],
            ["Fill · hover/focus", tokenRef(ICON_TRIGGER.hoverBg)],
            ["Glyph", `${ICON_TRIGGER.glyphSize}×${ICON_TRIGGER.glyphSize}px, ${tokenRef(ICON_TRIGGER.color)} → ${tokenRef(ICON_TRIGGER.hoverColor)}`],
          ],
        ],
        [
          "Tooltip",
          [
            ["Fill", tokenRef(TOOLTIP.bg)],
            ["Text", `${TOOLTIP.fontSize}px, Alliance No.2 Medium, ${tokenRef(TOOLTIP.color)}, left-aligned`],
            ["Width", `${LONG_TOOLTIP.width}px fixed — not max-width; see the component's own note on why`],
            ["Line height", `${LONG_TOOLTIP.lineHeight}`],
            ["Padding", `${TOOLTIP.padY}px ${TOOLTIP.padX}px`],
            ["Radius", `${TOOLTIP.radius}px`],
            ["Position", `centered above the trigger, ${TOOLTIP.gap}px gap, no arrow`],
          ],
        ],
        [
          "Accessibility",
          [
            ["Name", 'aria-label="More info" — concise, not the sentence itself'],
            ["Description", "aria-describedby points at the tooltip's own id — it's new information, so it stays in the accessibility tree rather than being hidden"],
          ],
        ],
      ],
      notes: [
        ...ruleTexts(tooltipRules("Icon")),
        "The glyph is a plain circled \"i\" from this system's own icon set — swap the tooltip's sentence for whatever the real field or setting needs explained.",
      ],
      reference: iconHtmlSnippet(),
    });
  }

  return specPrompt({
    component: "Tooltip — Toolbar",
    config: "Formatting toolbar (Bold/Italic/Underline/Email) with one shared, sliding hover tooltip",
    sections: [
      [
        "Toolbar",
        [
          ["Fill", tokenRef(BAR.bg)],
          ["Padding", `${BAR.pad}px`],
          ["Gap", `${BAR.gap}px between buttons`],
          ["Radius", `${BAR.radius}px`],
        ],
      ],
      [
        "Button",
        [
          ["Element", "a real <button>, not a styled div — hover and :focus-visible both trigger the tooltip"],
          ["Size", `${BTN.size}×${BTN.size}px, ${BTN.padX}px/${BTN.padY}px padding`],
          ["Fill · hover/focus", tokenRef(BTN.hoverBg)],
          ["Letters", `${BTN.letterSize}px, uppercase, ${BTN.letterTracking}px tracking, ${tokenRef(BTN.textColor)}`],
          ["Icon", `${BTN.iconSize}×${BTN.iconSize}px, ${tokenRef(BTN.textColor)}`],
        ],
      ],
      [
        "Tooltip",
        [
          ["Element", "one shared node per toolbar, not one per button"],
          ["Fill", tokenRef(TOOLTIP.bg)],
          ["Text", `${TOOLTIP.fontSize}px, Alliance No.2 Medium, ${tokenRef(TOOLTIP.color)}`],
          ["Padding", `${TOOLTIP.padY}px ${TOOLTIP.padX}px`],
          ["Radius", `${TOOLTIP.radius}px`],
          ["Position", `centered above the active button — left is set in script from that button's measured offsetLeft/offsetWidth, ${TOOLTIP.gap}px gap, no arrow`],
          ["Motion", `left transitions over ${SLIDE.duration} on ${SLIDE.ease} when the active button changes; opacity fades over .15s ease when the tooltip appears or disappears`],
        ],
      ],
    ],
    states: [
      "Default: the toolbar's four buttons sit flat with no tooltip visible.",
      "Hover/focus (per button): that button's own fill swaps to color-bg-page, and the shared tooltip's text and position update to match it, sliding there if it was already showing for a different button. Only Figma's Bold example is sourced directly — Italic, Underline and Email carry the identical treatment.",
    ],
    notes: [
      ...ruleTexts(tooltipRules("Toolbar")),
      "The Email glyph is this system's own icon from the Icons catalog — swap the toolbar's buttons for whatever actions the real toolbar needs, keeping one shared tooltip rather than adding a bubble per button.",
    ],
    reference: toolbarHtmlSnippet(),
  });
}
