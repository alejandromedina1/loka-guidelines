import { SpecOverlay } from "../SpecOverlay.jsx";
import { NumberChip, NUMBER_CHIP_BOX, NUMBER_CHIP_SPEC, toChipSize } from "../../common/NumberChip.jsx";
import { blocks, htmlDocument, rule, ruleHeadlines, ruleTexts, specPrompt, tokenRef } from "../snippets.js";

// Resolved values for the chip — Loka Figma "Number Chip" (node 391:384).
//
// The canvas steps through values, not sizes: the fixed width is the only
// thing about the component that can break, and "1", "12" and "99+" are the
// three cases worth looking at — comfortable, full, and capped. Size is a
// dropdown in the panel, since it changes how big the chip is rather than what
// is being demonstrated.
const T = NUMBER_CHIP_SPEC;
const box = (size) => NUMBER_CHIP_BOX[toChipSize(size)];

export function numberChipRules(sample, size) {
  const b = box(size);
  return [
    {
      rule: `The width is fixed at ${b.width}px, not hugging its number.`,
      why: "A column or row of counts lines up only if every chip is the same width. Letting the box grow with the number is what makes a list of categories look ragged.",
    },
    {
      rule: "Cap at three characters — show 99+ rather than 1,284.",
      why: `Three digits is what ${b.width}px holds at ${b.fontSize}px. Past that the choice is a wider box or an overflowing one, and a capped number is more honest than either.`,
    },
    {
      rule: "It carries a count, never a status or a label.",
      why: "A word in this box reads as a Tag that lost its border. Uppercase category markers are the Tag; a selectable label is the Tabs pill.",
    },
    {
      rule: "Fill and label come from the semantic rungs, not the neutral ramp.",
      why: "The node binds color-bg-muted and color-text-secondary rather than gray-5 and gray-70 directly. Same values today, but a theme pass moves the semantic rung and leaves the primitive alone.",
    },
    {
      rule: "Two sizes: 20 is Figma's, 16 is the same chip beside a smaller label.",
      why: "The sourced chip is 32x20 at 14px, so width is 1.6x the height and type is 0.7x it. Holding both ratios at height 16 gives 26 and 11 — a derivation, not a taste call. Use 20 beside a title and 16 beside an eyebrow, where 14px type would be louder than the label it belongs to.",
    },
    {
      rule: "No border, and the fill does the separating.",
      why: "It sits beside a heading rather than inside a busy row, so it needs one flat tone to read as secondary — a border would make it compete with the title it belongs to.",
    },
  ];
}

export function numberChipSpecs({ sample, size }) {
  const b = box(size);
  return {
    rules: ruleHeadlines(numberChipRules(sample, size)),
    rows: [
      ["Box", `${b.width} x ${b.height}px · fixed, not hugging`],
      ["Radius", `${T.radius}px · a full pill`],
      ["Text", `${b.fontSize}px / ${T.lineHeight} · Regular · centred`],
      ["Label", `${T.label} · color-text-secondary`],
      ["Fill", `${T.fill} · color-bg-muted`],
      ["Holds", "up to three characters — cap beyond that"],
      ["Sizes", "20 sourced · 16 derived at the same ratios"],
    ],
  };
}

// Live preview. The redlines measure a fixed box on both axes, since neither
// dimension is allowed to move with the content.
export function NumberChipPreview({ sample = "1", size = 20, bestPractices }) {
  return (
    <div className="bp-stage" data-bp={bestPractices || undefined}>
      <SpecOverlay on={bestPractices} widthMode="fixed" heightMode="fixed" padX={0} padY={0}>
        <NumberChip size={size}>{sample}</NumberChip>
      </SpecOverlay>
    </div>
  );
}

// ── Copyable output ─────────────────────────────────────────────────────────

const CLASS = "loka-number-chip";

export function numberChipCss(size) {
  const b = box(size);
  return blocks(
    rule(`.${CLASS}`, [
      ["display", "inline-flex"],
      ["align-items", "center"],
      ["justify-content", "center"],
      ["flex", "none"],
      ["width", `${b.width}px`],
      ["height", `${b.height}px`],
      ["border-radius", `${T.radius}px`],
      ["font-size", `${b.fontSize}px`],
      ["font-weight", "400"],
      ["line-height", String(T.lineHeight)],
      ["color", T.label],
      ["background", T.fill],
    ]),
  );
}

export function numberChipHtmlSnippet({ sample, size }) {
  const markup = [
    `<span class="${CLASS}">${sample}</span>`,
    "",
    "<!-- Cap the number before it reaches the box: at three characters this",
    "     is full, and a fixed width is the whole point of the component. -->",
  ].join("\n");

  return htmlDocument({ title: `Number Chip — ${sample}`, css: numberChipCss(size), markup });
}

export function numberChipPromptSnippet({ sample, size }) {
  const b = box(size);
  return specPrompt({
    component: "Number Chip",
    config: `${sample} · ${toChipSize(size)}px`,
    sections: [
      [
        "Box",
        [
          ["Width", `${b.width}px, fixed — never hugs the number`],
          ["Height", `${b.height}px`],
          ["Radius", `${T.radius}px — a full pill`],
          ["Fill", tokenRef(T.fill) + " · color-bg-muted"],
          ["Border", "none"],
        ],
      ],
      [
        "Type",
        [
          ["Family", "Alliance No.2"],
          ["Size / line-height", `${b.fontSize}px / ${T.lineHeight}`],
          ["Weight", "400 (Regular)"],
          ["Align", "centred on both axes"],
          ["Colour", tokenRef(T.label) + " · color-text-secondary"],
        ],
      ],
    ],
    notes: [
      ...ruleTexts(numberChipRules(sample, size)),
      "Not to be confused with its neighbours: Tags is a 24px uppercase bordered box, and Tabs is a 40px selectable pill with three states.",
    ],
    reference: numberChipHtmlSnippet({ sample, size }),
  });
}
