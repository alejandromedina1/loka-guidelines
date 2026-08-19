import { SpecOverlay } from "../SpecOverlay.jsx";
import { blocks, htmlDocument, indent, rule, ruleHeadlines, ruleTexts, specPrompt, tokenRef } from "../snippets.js";

// Resolved values for the chip — Loka Figma "20 / tag" (node 149:412): a
// bordered, unfilled box carrying one uppercase label. The layer is named
// "20" but measures 24px tall — that's the one sourced size, so it anchors
// the middle of the three-size range this system adds around it.
const T = {
  radius: 8, // Figma's one sourced value — held constant rather than scaled per size
  border: "#EFF1F5", // gray-5
  fontSize: 14,
  fontWeight: 500,
  letterSpacing: 1.12, // 8% of 14px, matching Figma's lineHeight:1/letterSpacing:8 eyebrow style
  color: "#828FA5", // gray-50
};

// Horizontal padding per height — grows with the box since the corner radius
// doesn't; 8px at 24px is Figma's own sourced pairing.
const SIZE_SPECS = {
  20: { padX: 6 },
  24: { padX: 8 },
  28: { padX: 10 },
};

const toPx = (size) => parseInt(size, 10) || 24;

// The guidance behind the chip, stated once. The specs panel shows the
// headlines; the AI prompt shows these with their reasoning attached.
export function tagsRules(size) {
  const px = toPx(size);
  const spec = SIZE_SPECS[px] ?? SIZE_SPECS[24];
  return [
    {
      rule: "One border, no fill.",
      why: "The box is a 1px gray-5 line around uppercase text — there's no background to color per category, unlike a status badge.",
    },
    {
      rule: "Text is uppercase and letter-spaced, not sentence case.",
      why: "Matches the system's eyebrow type style — Alliance No.2 Medium with 1.12px tracking — rather than the Body styles used elsewhere.",
    },
    {
      rule: "Three preset heights — 20/24/28px — not a freeform number.",
      why: "24px is Figma's own sourced size; 20 and 28 extend the same box up and down, the same relationship the Avatar's size range has to its own sourced 32px.",
    },
    {
      rule: `Horizontal padding grows with height — ${spec.padX}px at ${px}px — but the corner radius doesn't.`,
      why: "Keeps the tag's proportions consistent as it grows. The 8px radius is Figma's one sourced value; holding it constant across sizes beats guessing a scale for it from a single data point.",
    },
    {
      rule: "Holds one short label, not a sentence.",
      why: "It's a category marker (\"Blog\") — long copy would fight the fixed height instead of wrapping into it.",
    },
  ];
}

export function tagsSpecs({ size }) {
  const px = toPx(size);
  const spec = SIZE_SPECS[px] ?? SIZE_SPECS[24];
  return {
    rules: ruleHeadlines(tagsRules(size)),
    rows: [
      ["Box", `${px}px tall · hugs its label`],
      ["Radius", `${T.radius}px`],
      ["Border", `1px ${T.border} · gray-5`],
      ["Padding", `0 ${spec.padX}px`],
      ["Text", `${T.fontSize}px / 1 · ${T.fontWeight} · uppercase · ${T.letterSpacing}px tracking`],
      ["Color", `${T.color} · gray-50`],
      ["Sizes", "20 · 24 · 28px"],
    ],
  };
}

// Live Tags preview — Loka Figma "20 / tag" (node 149:412), extended with the
// 20/28px sizes flanking its own sourced 24px. Size is driven from a
// properties-panel dropdown rather than a canvas toggle — it changes how big
// the tag is, not what's being demonstrated, so it doesn't need the
// prev/next-adjacent prominence the Dropdown's own mode toggle gets.
export function TagsPreview({ size, bestPractices }) {
  const px = toPx(size);
  const spec = SIZE_SPECS[px] ?? SIZE_SPECS[24];

  return (
    <div className="bp-stage" data-bp={bestPractices || undefined}>
      <SpecOverlay on={bestPractices} widthMode="hug" heightMode="fixed" padX={spec.padX} padY={0}>
        <span className="tag-chip" style={{ height: px, padding: `0 ${spec.padX}px` }}>
          Blog
        </span>
      </SpecOverlay>
    </div>
  );
}

// ── Copyable output ─────────────────────────────────────────────────────────

const CLASS = "loka-tag";

export function tagsCss() {
  return blocks(
    rule(`.${CLASS}`, [
      ["display", "inline-flex"],
      ["align-items", "center"],
      ["justify-content", "center"],
      ["flex", "none"],
      ["border", `1px solid ${T.border}`],
      ["border-radius", `${T.radius}px`],
      ["font-size", `${T.fontSize}px`],
      ["font-weight", T.fontWeight],
      ["line-height", "1"],
      ["letter-spacing", `${T.letterSpacing}px`],
      ["text-transform", "uppercase"],
      ["color", T.color],
      ["white-space", "nowrap"],
    ]),
    ...Object.entries(SIZE_SPECS).map(([px, spec]) =>
      rule(`.${CLASS}[data-size="${px}"]`, [
        ["height", `${px}px`],
        ["padding", `0 ${spec.padX}px`],
      ]),
    ),
  );
}

export function tagsHtmlSnippet({ size }) {
  const px = toPx(size);
  const markup = [
    `<span class="${CLASS}" data-size="${px}">Blog</span>`,
    "",
    "<!-- One short label, uppercased and letter-spaced by CSS rather than in",
    "     the markup — keep the text content mixed-case so it still reads",
    "     right anywhere text-transform doesn't apply. -->",
  ].join("\n");

  return htmlDocument({ title: `Tags — ${size}`, css: tagsCss(), markup });
}

export function tagsPromptSnippet({ size }) {
  const px = toPx(size);
  const spec = SIZE_SPECS[px] ?? SIZE_SPECS[24];

  return specPrompt({
    component: "Tags",
    config: size,
    sections: [
      [
        "Box",
        [
          ["Height", `${px}px, fixed — one of 20/24/28`],
          ["Width", "hugs its label"],
          ["Padding", `0 ${spec.padX}px`],
          ["Radius", `${T.radius}px`],
          ["Border", `1px solid ${tokenRef(T.border)}`],
          ["Fill", "none — border only"],
        ],
      ],
      [
        "Type",
        [
          ["Family", "Alliance No.2"],
          ["Size / line-height", `${T.fontSize}px / 1`],
          ["Weight", `${T.fontWeight} (Medium)`],
          ["Letter spacing", `${T.letterSpacing}px`],
          ["Case", "uppercase, via CSS text-transform"],
          ["Color", tokenRef(T.color)],
        ],
      ],
    ],
    notes: [
      ...ruleTexts(tagsRules(size)),
      "The label is a category marker, not a status or count — that's the Filter bar's chip and the Progress Bar's own conventions, not this one's.",
    ],
    reference: tagsHtmlSnippet({ size }),
  });
}
