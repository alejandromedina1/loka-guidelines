import { useEffect, useRef, useState } from "react";
import { TABS } from "../../../data/components.js";
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

// Resolved values for both views. global.css paints these; the spec sheets and
// the copyable snippets below read them from here.
const T = {
  // The item
  itemHeight: 70,
  itemShare: 345, // its width in the real 4-up bar — it has none of its own
  itemPad: 12,
  itemRadius: 12,
  stackGap: 12,
  stackGapActive: 8,
  mark: 12,
  markDot: 6,
  markBorder: "#DFDFE1", // LineOpaque
  blue: "#186BF3", // blue-100
  fontSize: 16,
  lineHeight: 1.3,
  labelDefault: "#041D3E", // DarkBlue
  fillHover: "#FFFFFF", // white
  fillActive: "#DBE7F5", // a raw hex in Figma, not a palette token
  // The bar
  barHeight: 78,
  barPad: 4,
  barRadius: 15,
  barFill: "rgba(255,255,255,.9)",
  barShadow: "0 0 6px rgba(0,0,0,.1)",
  barBackdrop: "blur(10px)",
  barGap: 4,
};

// The item on its own, and the bar that hosts it, are two different specs — so
// each view brings its own sheet rather than one merged list that fits neither.
// Height, width, padding and the font are absent from both: the redlines draw
// the first three, and the font is the system's.
const ITEM_SPECS = [
  ["Radius", `${T.itemRadius}px`],
  ["Stack gap", `${T.stackGap}px · ${T.stackGapActive}px when active`],
  ["Marker", `${T.mark}px square · 1px ${T.markBorder}`],
  ["Marker · hover", `1px ${T.blue} + ${T.markDot}px dot`],
  ["Marker · active", `${T.blue} · blue-100`],
  ["Text", `${T.fontSize}px / ${T.lineHeight} · ellipsis`],
  ["Label", `${T.labelDefault} · DarkBlue`],
  ["Label · hover & active", `${T.blue} · blue-100`],
  ["Fill · hover", `${T.fillHover} · white`],
  ["Fill · active", T.fillActive],
];

// Selection and keyboard behaviour used to be rows here. They're rules — a row
// reading "Keyboard · one tab stop" states a fact without saying what to build.
const BAR_SPECS = [
  ["Radius", `${T.barRadius}px`],
  ["Fill", T.barFill],
  ["Shadow", T.barShadow],
  ["Backdrop", T.barBackdrop],
  ["Gap", `${T.barGap}px`],
  ["Items", `equal share of the row · ${T.itemHeight}px tall`],
  ["Item radius", `${T.itemRadius}px`],
];

// The guidance behind both views, stated once. The specs panel shows the
// headlines; the AI prompt shows these with their reasoning attached.
export function tabsRules({ view = "Item" }) {
  const shared = [
    {
      rule: "Figma's three variants are three appearances of one control.",
      why: "Only selection is state — hover is pure CSS, and it must not apply to the selected item.",
    },
    {
      rule: `The item carries no width — the bar hands it an equal share of the row.`,
      why: `Give every item flex: 1 1 0 with min-width: 0; that min-width is what lets a long label ellipsize instead of pushing its neighbours around. ${T.itemShare}px is the share in a 4-up bar.`,
    },
    {
      rule: "The item must clip its overflow.",
      why: "Shrunk below the ~36px its marker and padding need, the marker doesn't shrink with it and the spill escapes the item and then the bar.",
    },
  ];

  return view === "Full bar"
    ? [
        {
          rule: "The bar is one tab stop, not four.",
          why: 'Only the selected tab is tabbable (tabindex="0", the rest -1); arrows move selection and focus together, wrapping at the ends. Without that roving tabindex a keyboard has to walk all four tabs to get past the bar.',
        },
        {
          rule: "Exactly one item is selected at a time — the bar is never empty.",
          why: "It opens with the first item selected.",
        },
        ...shared,
      ]
    : [
        ...shared,
        {
          rule: `The stack tightens ${T.stackGap}px → ${T.stackGapActive}px once active, so the label nudges as you select.`,
          why: "That's the spec, not a bug to normalise away.",
        },
        {
          rule: `The active fill ${T.fillActive} is a raw hex in Figma, not a palette token.`,
          why: "blue-10 (#D8E2F6) is the nearest one, but the spec value is the one to use.",
        },
      ];
}

export function tabsSpecs({ view = "Item" }) {
  const isBar = view === "Full bar";
  return {
    rules: ruleHeadlines(tabsRules({ view })),
    rows: isBar ? BAR_SPECS : ITEM_SPECS,
  };
}

// One tab item. The ARIA differs by view — a row of these is a tablist, a single
// one out of context is just a toggle — so the caller passes it in.
function TabItem({ label, active, onClick, aria }) {
  return (
    <button
      type="button"
      className="tab-item"
      data-active={active || undefined}
      onClick={onClick}
      {...aria}
    >
      {/* Figma nests the marker and label in a full-width stack, and it earns its
          keep here too: it's what the label measures its ellipsis against. */}
      <span className="tab-stack">
        <span className="tab-mark" aria-hidden />
        <span className="tab-label">{label}</span>
      </span>
    </button>
  );
}

// Tabs — the Loka Figma "service-icon-item" component set (node 4007:23097),
// and the bar that hosts it (node 4253:19091). Figma documents the item as
// three variants, which are three appearances of one control:
//
//   Default   hairline marker, DarkBlue label, no fill
//   Hovered   marker becomes a blue ring around a 6px dot, label goes blue
//   Active    marker fills solid blue, label goes blue, item takes the blue fill
//
// The canvas pills switch between the item on its own and the full bar.
export function TabsPreview({ view = "Item", bestPractices, onState }) {
  const isBar = view === "Full bar";
  // Two independent selections: the bar's index, and whether the lone item is
  // picked. Sharing one value would mean the solo view could only ever show the
  // first label, or the bar could open with nothing selected — which it never is.
  const [active, setActive] = useState(0);
  const [soloActive, setSoloActive] = useState(false);
  const rowRef = useRef(null);

  // Selection is the item's only state, and both selections live here rather
  // than in the playground — so the live one is posted up for the canvas
  // readout. The bar names the selected tab, since which one is picked is the
  // state; solo, there's only ever the one label to pick.
  useEffect(() => {
    onState?.(
      isBar
        ? { text: `Selected · ${TABS[active]}`, tone: "active" }
        : soloActive
          ? { text: "Selected", tone: "active" }
          : { text: "Default", tone: "default" },
    );
  }, [isBar, active, soloActive, onState]);

  // A tablist is one tab stop: only the selected tab is tabbable and the arrows
  // move between them.
  const onKeyDown = (e) => {
    const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const next = (active + dir + TABS.length) % TABS.length;
    setActive(next);
    rowRef.current?.children[next]?.focus();
  };

  return (
    <div className="bp-stage" data-bp={bestPractices || undefined}>
      {/* The bar fills the section it sits in, so the demo box supplies a width
          for it to fill; solo, the item is pinned to the 345px share it gets in
          the real 4-up bar, since it has no width of its own to hug. */}
      <div className={isBar ? "tabs-demo" : "tab-solo-demo"}>
        <SpecOverlay
          on={bestPractices}
          fill
          padX={isBar ? 4 : 12}
          padY={isBar ? 4 : 12}
          widthMode="fill"
          heightMode={isBar ? "hug" : "fixed"}
        >
          {isBar ? (
            <div className="tabs">
              <div className="tabs-row" role="tablist" ref={rowRef} onKeyDown={onKeyDown}>
                {TABS.map((label, i) => (
                  <TabItem
                    key={label}
                    label={label}
                    active={i === active}
                    onClick={() => setActive(i)}
                    aria={{
                      role: "tab",
                      "aria-selected": i === active,
                      tabIndex: i === active ? 0 : -1,
                    }}
                  />
                ))}
              </div>
            </div>
          ) : (
            <TabItem
              label={TABS[0]}
              active={soloActive}
              onClick={() => setSoloActive((v) => !v)}
              aria={{ "aria-pressed": soloActive }}
            />
          )}
        </SpecOverlay>
      </div>
    </div>
  );
}

// ── Copyable output ─────────────────────────────────────────────────────────

const CLASS = "loka-tab";

// Selection is read straight off the ARIA rather than a parallel data-attribute,
// so the appearance and what a screen reader hears can't disagree. Which
// attribute carries it depends on context: in the bar an item is a tab and uses
// aria-selected, on its own it's a toggle and uses aria-pressed. Both have to
// paint, so every state selector covers the pair.
const on = (suffix = "") =>
  `.${CLASS}[aria-selected="true"]${suffix}, .${CLASS}[aria-pressed="true"]${suffix}`;
const off = (suffix = "") =>
  `.${CLASS}:hover:not([aria-selected="true"]):not([aria-pressed="true"])${suffix}`;

// The item's own rules, shared by both views — the bar is a container around
// exactly this control, so it adds rules rather than replacing any.
function itemCss() {
  return blocks(
    // flex:1 1 0 with min-width:0 is what makes items share the row equally and
    // lets a long label ellipsize instead of pushing its neighbours around.
    rule(`.${CLASS}`, [
      ["flex", "1 1 0"],
      ["min-width", "0"],
      ["height", `${T.itemHeight}px`],
      ["display", "flex"],
      ["flex-direction", "column"],
      ["align-items", "flex-start"],
      ["justify-content", "center"],
      ["padding", `${T.itemPad}px`],
      ["border", "none"],
      ["border-radius", `${T.itemRadius}px`],
      ["background", "none"],
      // min-width:0 lets flex shrink the item below the 36px its marker and
      // padding need, and the marker doesn't shrink — without this the spill
      // escapes the item and then the bar.
      ["overflow", "hidden"],
      ["cursor", "pointer"],
      ["text-align", "left"],
      ["transition", "background .12s"],
    ]),
    rule(`.${CLASS}__stack`, [
      ["display", "flex"],
      ["flex-direction", "column"],
      ["gap", `${T.stackGap}px`],
      ["width", "100%"],
      ["min-width", "0"],
    ]),
    // Figma tightens the stack by 4px on the active item. It does nudge the
    // label as you select — that's the spec, not a bug to normalise away.
    rule(on(` .${CLASS}__stack`), [["gap", `${T.stackGapActive}px`]]),
    // One box carries all three markers: a hairline square at rest, a blue ring
    // around a dot on hover, and a solid blue square when active.
    rule(`.${CLASS}__mark`, [
      ["flex", "none"],
      ["width", `${T.mark}px`],
      ["height", `${T.mark}px`],
      ["display", "grid"],
      ["place-items", "center"],
      ["border", `1px solid ${T.markBorder}`],
      ["transition", "border-color .12s, background .12s"],
    ]),
    // The dot is a centred ::after, so the 3px inset Figma draws falls out of
    // the 1px border rather than needing a value of its own.
    rule(`.${CLASS}__mark::after`, [
      ["content", '""'],
      ["width", `${T.markDot}px`],
      ["height", `${T.markDot}px`],
      ["background", T.blue],
      ["opacity", "0"],
      ["transition", "opacity .12s"],
    ]),
    rule(`.${CLASS}__label`, [
      ["display", "block"],
      ["min-width", "0"],
      ["overflow", "hidden"],
      ["text-overflow", "ellipsis"],
      ["white-space", "nowrap"],
      ["font-family", FONT_STACK],
      ["font-size", `${T.fontSize}px`],
      ["font-weight", "400"],
      ["line-height", T.lineHeight],
      ["color", T.labelDefault],
      ["transition", "color .12s"],
    ]),
    rule(off(), [["background", T.fillHover]]),
    rule(off(` .${CLASS}__mark`), [["border-color", T.blue]]),
    rule(off(` .${CLASS}__mark::after`), [["opacity", "1"]]),
    rule(on(), [["background", T.fillActive]]),
    rule(on(` .${CLASS}__mark`), [
      ["background", T.blue],
      ["border-color", "transparent"],
    ]),
    rule(`${off(` .${CLASS}__label`)},\n${on(` .${CLASS}__label`)}`, [["color", T.blue]]),
  );
}

export function tabsCss({ view = "Item" }) {
  if (view !== "Full bar") return itemCss();

  return blocks(
    rule(`.${CLASS}-bar`, [
      ["display", "flex"],
      ["align-items", "center"],
      ["gap", `${T.barGap}px`],
      ["padding", `${T.barPad}px`],
      ["border-radius", `${T.barRadius}px`],
      ["background", T.barFill],
      ["backdrop-filter", T.barBackdrop],
      ["box-shadow", T.barShadow],
    ]),
    itemCss(),
  );
}

// One tab item's markup. `selected` drives both the ARIA and the appearance, so
// there's no second source of truth to keep in step.
function itemMarkup({ label, selected, inBar }) {
  const aria = inBar
    ? ` role="tab" aria-selected="${selected}" tabindex="${selected ? 0 : -1}"`
    : ` aria-pressed="${selected}"`;
  return [
    `<button type="button" class="${CLASS}"${aria}>`,
    indent(`<span class="${CLASS}__stack">`),
    indent(`<span class="${CLASS}__mark" aria-hidden="true"></span>`, 4),
    indent(`<span class="${CLASS}__label">${label}</span>`, 4),
    indent("</span>"),
    "</button>",
  ].join("\n");
}

export function tabsHtmlSnippet({ view = "Item" }) {
  if (view !== "Full bar") {
    // The item has no width of its own, so shown alone it needs something to
    // size it — the wrapper is pinned to the share it takes in the real 4-up
    // bar, which is also what makes the label's ellipsis visible.
    const markup = [
      `<div style="width: ${T.itemShare}px; display: flex">`,
      indent(itemMarkup({ label: TABS[0], selected: false, inBar: false })),
      "</div>",
      "",
      "<!-- The item carries no width in the spec — the bar hands it an equal share of",
      `     the row, and ${T.itemShare}px is that share in a 4-up bar. The wrapper above is`,
      "     standing in for the bar; don't give the item a width of its own.",
      "     Hover is pure CSS. Toggling aria-pressed is the only JavaScript. -->",
    ].join("\n");

    return htmlDocument({ title: "Tabs — item", css: tabsCss({ view }), markup });
  }

  const markup = [
    `<div class="${CLASS}-bar" role="tablist">`,
    ...TABS.map((label, i) => indent(itemMarkup({ label, selected: i === 0, inBar: true }))),
    "</div>",
    "",
    "<!-- The bar is one tab stop, not four. Selecting a tab means moving aria-selected",
    "     and tabindex to it and calling .focus(); ArrowLeft/ArrowRight move between",
    "     tabs, wrapping at the ends. That roving tabindex is the whole script. -->",
  ].join("\n");

  return htmlDocument({ title: "Tabs — full bar", css: tabsCss({ view }), markup });
}

export function tabsPromptSnippet({ view = "Item" }) {
  const isBar = view === "Full bar";

  return specPrompt({
    component: "Tabs",
    config: isBar ? "Full bar" : "Item",
    sections: [
      ...(isBar
        ? [
            [
              "Bar",
              [
                ["Height", `${T.barHeight}px, hugging its items`],
                ["Padding", `${T.barPad}px`],
                ["Gap", `${T.barGap}px`],
                ["Radius", `${T.barRadius}px`],
                ["Fill", T.barFill],
                ["Shadow", T.barShadow],
                ["Backdrop", T.barBackdrop],
                ["Items", "each takes an equal share of the row"],
              ],
            ],
          ]
        : []),
      [
        "Item",
        [
          ["Width", `none of its own — ${T.itemShare}px as one of four in the bar`],
          ["Height", `${T.itemHeight}px`],
          ["Padding", `${T.itemPad}px`],
          ["Radius", `${T.itemRadius}px`],
          ["Stack gap", `${T.stackGap}px, tightening to ${T.stackGapActive}px when active`],
        ],
      ],
      [
        "Marker",
        [
          ["Size", `${T.mark}px square — not a circle`],
          ["Default", `1px solid ${tokenRef(T.markBorder)}`],
          ["Hover", `1px solid ${tokenRef(T.blue)} around a centred ${T.markDot}px dot`],
          ["Active", `filled ${tokenRef(T.blue)}, border transparent`],
        ],
      ],
      [
        "Label",
        [
          ["Font", "Alliance No.2"],
          ["Text", `${T.fontSize}px / ${T.lineHeight}`],
          ["Default", tokenRef(T.labelDefault)],
          ["Hover and active", tokenRef(T.blue)],
          ["Overflow", "single line, ellipsised"],
        ],
      ],
      [
        "Fill",
        [
          ["Default", "none"],
          ["Hover", tokenRef(T.fillHover)],
          ["Active", `${T.fillActive} — a raw hex in Figma, not a palette token. blue-10 (#D8E2F6) is the nearest one, but the spec value is the one to use.`],
        ],
      ],
    ],
    states: [
      "Figma's three variants are three appearances of one control, not three states: only selection is state. Hover is pure CSS and must not apply to the selected item.",
      "All transitions are 120ms — fill, marker border, marker dot opacity, and label colour.",
      "The content stack tightens from 12px to 8px once active, so the label nudges as you select. That's intentional.",
      ...(isBar
        ? ["Exactly one item is selected at a time. The bar is never empty — it opens with the first item selected."]
        : []),
    ],
    notes: [
      ...ruleTexts(tabsRules({ view })),
      isBar
        ? 'Use role="tablist" on the bar and role="tab" with aria-selected on each item.'
        : 'Out of a tablist a single item is a toggle, not a tab: use aria-pressed rather than role="tab".',
      "One 12px box carries all three markers. Draw the hover dot as a centred ::after inside it rather than as a separate element, so the 3px inset falls out of the 1px border.",
    ],
    reference: tabsHtmlSnippet({ view }),
  });
}
