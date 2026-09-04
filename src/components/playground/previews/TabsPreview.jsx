import { SpecOverlay } from "../SpecOverlay.jsx";
import { Tab, TAB_SPEC } from "../../common/Tab.jsx";
import { blocks, htmlDocument, rule, ruleHeadlines, ruleTexts, specPrompt, tokenRef } from "../snippets.js";

// Resolved values for the pill — Loka Figma "Tabs" (node 389:367), a 40px
// selector in three states. The values are the node's own bound variables:
// gray-5 for the line and the hover fill, gray-50 for the label, gray-90 for
// the selected fill.
//
// This is the base selector the system had been drawing by hand in four
// places. It is not Services Tabs (the 70px marker items in a blurred bar) and
// not Tags (a 24px uppercase bordered box with no states) — it's the only one
// of the three that can be selected, which is the whole point of it.
const T = TAB_SPEC;

// The guidance behind the pill, stated once. The specs panel shows the
// headlines; the AI prompt carries these with their reasoning attached.
export function tabsRules(state) {
  return [
    {
      rule: "Three states, and they are a set — not a ramp.",
      why: "Default is an outline, hover is a light fill, selected is a near-black fill. Nothing sits between them, so there's no fourth state to interpolate.",
    },
    {
      rule: "The box never moves between states.",
      why: `Figma draws the default with a 1px line and the hover with a fill and no line. As a real border that would shift the label a pixel on hover, so the outline is an inset shadow and all three states paint inside the same ${T.height}px box.`,
    },
    {
      rule: "Sentence case, not uppercase.",
      why: "This is the label of a thing you can pick — a section, a service, a format. Tags are uppercase because they're category markers you can't click; the case is what tells the two apart at a glance.",
    },
    {
      rule: "One short label, no icon and no count.",
      why: "The pill hugs its text and clips, so anything long fights the fixed height instead of wrapping into it. A count belongs on a Tag beside it.",
    },
    {
      rule: "Selected is a fill, never a colour change alone.",
      why: `${T.activeFill} against ${T.label} is the strongest separation the neutral ramp offers, and it survives being the only selected item in a long strip.`,
    },
  ];
}

export function tabsSpecs({ state }) {
  return {
    rules: ruleHeadlines(tabsRules(state)),
    rows: [
      ["Box", `${T.height}px tall · hugs its label`],
      ["Radius", `${T.radius}px · a full pill`],
      ["Padding", `0 ${T.padX}px`],
      ["Text", `${T.fontSize}px / ${T.lineHeight} · Regular · sentence case`],
      ["Default", `1px ${T.line} line · no fill · ${T.label} label`],
      ["Hover", `${T.line} fill · no line · ${T.label} label`],
      ["Selected", `${T.activeFill} fill · ${T.activeLabel} label`],
      ["Backdrop", "blur 10px — it sits over content"],
    ],
  };
}

// Live Tabs preview. State is driven from the canvas strip rather than the
// properties panel, because it changes what's being demonstrated rather than
// how big it is — the same call the Button's own state control makes.
export function TabsPreview({ state = "Default", bestPractices }) {
  return (
    <div className="bp-stage" data-bp={bestPractices || undefined}>
      <SpecOverlay on={bestPractices} widthMode="hug" heightMode="fixed" padX={T.padX} padY={0}>
        <Tab state={state}>Blog</Tab>
      </SpecOverlay>
    </div>
  );
}

// ── Copyable output ─────────────────────────────────────────────────────────

const CLASS = "loka-tab";

export function tabsCss() {
  return blocks(
    rule(`.${CLASS}`, [
      ["display", "inline-flex"],
      ["align-items", "center"],
      ["justify-content", "center"],
      ["flex", "none"],
      ["height", `${T.height}px`],
      ["padding", `0 ${T.padX}px`],
      ["border-radius", `${T.radius}px`],
      ["font-size", `${T.fontSize}px`],
      ["font-weight", "400"],
      ["line-height", String(T.lineHeight)],
      ["white-space", "nowrap"],
      ["color", T.label],
      // an inset shadow, not a border: see the rule about the box not moving
      ["box-shadow", `inset 0 0 0 1px ${T.line}`],
      ["backdrop-filter", "blur(10px)"],
      ["cursor", "pointer"],
    ]),
    rule(`.${CLASS}:hover`, [["background", T.line], ["box-shadow", "none"]]),
    rule(`.${CLASS}[aria-selected="true"]`, [
      ["background", T.activeFill],
      ["color", T.activeLabel],
      ["box-shadow", "none"],
    ]),
  );
}

export function tabsHtmlSnippet({ state }) {
  const selected = state === "Active";
  const markup = [
    '<div role="tablist">',
    `  <button class="${CLASS}" role="tab" aria-selected="${selected}">Blog</button>`,
    `  <button class="${CLASS}" role="tab" aria-selected="${!selected}">Careers</button>`,
    "</div>",
    "",
    "<!-- Selection is aria-selected, not a class: the state a screen reader",
    "     announces and the state the CSS paints should be the same fact. -->",
  ].join("\n");

  return htmlDocument({ title: `Tabs — ${state}`, css: tabsCss(), markup });
}

export function tabsPromptSnippet({ state }) {
  return specPrompt({
    component: "Tabs",
    config: state,
    sections: [
      [
        "Box",
        [
          ["Height", `${T.height}px, fixed`],
          ["Width", "hugs its label"],
          ["Padding", `0 ${T.padX}px`],
          ["Radius", `${T.radius}px — a full pill`],
          ["Backdrop", "blur(10px)"],
        ],
      ],
      [
        "Type",
        [
          ["Family", "Alliance No.2"],
          ["Size / line-height", `${T.fontSize}px / ${T.lineHeight}`],
          ["Weight", "400 (Regular)"],
          ["Case", "sentence case — uppercase is the Tag, not this"],
        ],
      ],
      [
        "States",
        [
          ["Default", `1px ${tokenRef(T.line)} inset line, no fill, ${tokenRef(T.label)} label`],
          ["Hover", `${tokenRef(T.line)} fill, no line, ${tokenRef(T.label)} label`],
          ["Selected", `${tokenRef(T.activeFill)} fill, ${tokenRef(T.activeLabel)} label`],
        ],
      ],
    ],
    notes: [
      ...ruleTexts(tabsRules(state)),
      "Two neighbours it is not: Services Tabs is the 70px marker item in a blurred bar, and Tags is a 24px uppercase bordered box with no states.",
    ],
    reference: tabsHtmlSnippet({ state }),
  });
}
