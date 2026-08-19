import { ArrowInline } from "../../common/Icon.jsx";
import { GRAPHICS } from "../../../data/graphics.js";
import awsCompetencyPhoto from "../../../assets/cards/aws-competency.jpg";
import { SpecOverlay } from "../SpecOverlay.jsx";
import { tagsCss } from "./TagsPreview.jsx";
import { blocks, htmlDocument, indent, rule, ruleHeadlines, ruleTexts, specPrompt, tokenRef } from "../snippets.js";

// Two Loka Figma component sets share one tile shape: "CardGraphic" (node
// 147:307, icon-led) and "CardImage" (node 147:324, photo-led). Each has its
// own default/hovered variants; both are one real hover interaction here,
// same as the Floating Action Button's default/hover/pressed states.

// The action row is pixel-identical between both variants — same bar, same
// blur, same label size, same "join in the middle" hover motion — so it's
// defined once rather than duplicated per variant.
const CTA = {
  height: 44,
  padX: 16,
  padY: 12,
  gap: 12,
  blur: 10,
  labelSize: 16,
  color: "#FFFFFF",
  iconSize: 18,
  // Not in either sourced spec — Figma's variants swap, they don't move.
  // Added on top of it: the label and icon start pulled apart and slide
  // together on hover, so the reveal reads as one motion joining in the
  // middle rather than a flat fade-in.
  shift: 8,
  ease: "cubic-bezier(.22,1,.36,1)",
  duration: "0.32s",
};

const GRAPHIC = {
  label: "Graphic",
  width: 405,
  height: 280,
  pad: 4, // reveals as a 4px "border" when the hovered fill shows through
  border: "#ECECEE", // colors/line-stroke
  bg: "#FFFFFF",
  bgHover: "#1877F2", // blue-80
  contentPad: 16,
  contentGap: 16,
  textGap: 8,
  iconBox: 64,
  iconGray: "#A8B3CA", // same gray the Graphics gallery's icons rest at
  iconBlue: "#2F85F3", // blue-70 — same hover blue the Graphics gallery already uses, reused rather than inventing a second "icon accent" color
  titleSize: 24,
  titleLineHeight: 1.15,
  titleColor: "#020F1F", // gray-90
  descSize: 18,
  descLineHeight: 1.4,
  descColor: "#5C6A82", // gray-60
  textWeight: 400,
  ctaLabel: "Learn more",
};

const IMAGE = {
  label: "Image",
  width: 545,
  pad: 4,
  border: "#EFF1F5", // colors/neutral/gray-5 — a shade lighter than the Graphic variant's own line-stroke border
  bg: "#FFFFFF",
  bgHover: "#186BF3", // blue-100 — the Graphic variant's own hover is blue-80; each sourced node uses its own shade
  contentPad: 20,
  contentGap: 20,
  metaGap: 12,
  eyebrowSize: 14,
  eyebrowWeight: 500,
  eyebrowTracking: 1.12,
  eyebrowColor: "#828FA5", // gray-50 — same eyebrow treatment the Tags component uses
  dividerColor: "#D6DCE6", // gray-20 — Figma exports the meta divider as an asset, not a literal hex; approximated from the screenshot
  mediaAspect: "505 / 300",
  textGap: 4,
  titleSize: 24,
  titleLineHeight: 1.15,
  titleColor: "#020F1F", // gray-90
  descSize: 16,
  descLineHeight: 1.3,
  descColor: "#5C6A82", // gray-60
  textWeight: 400,
  ctaLabel: "See our blog",
};

// The Health illustration already lives in the Graphics catalog — reused
// here rather than re-fetching a second copy of the same artwork from Figma.
const HEALTH_GRAPHIC = GRAPHICS.find((g) => g.label === "Health");

// Guidance both layouts share, stated once regardless of which is on stage.
function sharedCardRules() {
  return [
    {
      rule: "Both layouts share one hover interaction and one action row.",
      why: 'Graphic and Image are two ways to fill the same tile — an icon-led summary or a photo-led story — not two unrelated components, so the reveal, the blur, the label size and the "join in the middle" motion all come from one shared definition.',
    },
    {
      rule: "The tile is a real hover interaction, not two frozen states.",
      why: "Figma documents \"default\" and \"hovered\" as separate variants; on the page they're one element whose fill and action row respond to the same :hover, the same relationship the Floating Action Button's states have to each other.",
    },
    {
      rule: "No radius anywhere — the tile, its content box and its action row are all square-cornered.",
      why: "Matches both sourced specs exactly; rounding any one part without the others would read as an inconsistency, not a variant.",
    },
    {
      rule: "The action row occupies its 44px + 4px gap at rest — it's invisible, not absent.",
      why: "opacity: 0 keeps its space reserved, so revealing it on hover doesn't grow the tile or shift the content above it.",
    },
    {
      rule: `The label and icon start ${CTA.shift}px apart and slide together on hover, not a flat fade-in.`,
      why: `Not in either sourced spec — Figma's variants swap, they don't move. Added on top of it: both travel the same ${CTA.duration} on the same ${CTA.ease} ease as the row's own opacity, so the "join" reads as one motion rather than a fade plus an unrelated slide.`,
    },
  ];
}

function graphicCardRules() {
  return [
    {
      rule: "The icon reuses the Graphics gallery's own Health illustration and its gray → blue swap.",
      why: "Both live on currentColor already — pointing this card's icon at the same asset and the same blue-70 hover color keeps one illustration and one accent color instead of a second copy of each.",
    },
    {
      rule: "One CTA label, not two.",
      why: "Figma's default and hovered instances are authored separately, and the default one's button text (\"See case study\") sits at opacity: 0 where nothing ever reads it. Only the hovered instance's copy (\"Learn more\") is ever visible, so that's the one label this component carries.",
    },
    {
      rule: "The description clips at two lines.",
      why: "Its own sourced copy says \"maximum 2 lines if possible\" — treated as a real constraint (-webkit-line-clamp: 2) rather than a comment that isn't enforced anywhere.",
    },
  ];
}

function imageCardRules() {
  return [
    {
      rule: "The category tag reuses the system's own Tags component at its 20px size.",
      why: "Same border, same uppercase eyebrow type, same padding — hand-rolling a near-duplicate chip at Figma's literal 6px radius here would leave two slightly different tags in the system instead of one.",
    },
    {
      rule: "The title truncates to one line; the description clamps at two.",
      why: "The title's own sourced spec ellipsizes at one line. The description isn't specified as explicitly as the Graphic variant's copy, so it's held to the same two-line treatment for consistency between the two layouts rather than left to overflow freely.",
    },
    {
      rule: "The tile's height is intrinsic, not a fixed pixel.",
      why: "Figma's own 478.25px is a byproduct of its example image at its example width, not a deliberate constant. Locking the photo's aspect ratio (505:300) and letting the rest of the content set its own height holds up at any width, where a fixed number wouldn't.",
    },
    {
      rule: "The hover fill is blue-100, not the Graphic variant's blue-80.",
      why: "That's the literal color each sourced node uses — a small, deliberate difference between the two layouts, not an inconsistency to iron out.",
    },
    {
      rule: "The action row reserves its space at rest, same as the Graphic variant.",
      why: "Figma's own default instance omits the row entirely rather than hiding it — reproducing that literally would grow the tile on hover. Reserving the space (opacity: 0 → 1) keeps hovering from shifting anything above it.",
    },
  ];
}

// The guidance behind whichever layout is on stage, stated once. The specs
// panel shows the headlines; the AI prompt shows these with their reasoning
// attached.
export function cardRules(variant) {
  return [...sharedCardRules(), ...(variant === "Image" ? imageCardRules() : graphicCardRules())];
}

export function cardSpecs({ variant }) {
  const rows =
    variant === "Image"
      ? [
          ["Box", `${IMAGE.width}px wide · height intrinsic · no radius`],
          ["Padding", `${IMAGE.pad}px, reveals the hover fill as a border`],
          ["Fill", `${IMAGE.bg} → ${IMAGE.bgHover} · blue-100 on hover`],
          ["Content padding", `${IMAGE.contentPad}px · ${IMAGE.contentGap}px gap`],
          ["Meta", `${IMAGE.eyebrowSize}px eyebrow · ${IMAGE.eyebrowColor} · gray-50 · "Blog" tag reuses Tags/20px`],
          ["Media", `${IMAGE.mediaAspect} aspect ratio · object-fit: cover`],
          ["Title", `${IMAGE.titleSize}px / ${IMAGE.titleLineHeight} · ${IMAGE.titleColor} · gray-90 · 1-line ellipsis`],
          ["Description", `${IMAGE.descSize}px / ${IMAGE.descLineHeight} · ${IMAGE.descColor} · gray-60 · 2-line clamp`],
          ["Action row", `${CTA.height}px · opacity 0 → 1 on hover · ${CTA.blur}px backdrop blur`],
          ["CTA", `${CTA.labelSize}px · white · "${IMAGE.ctaLabel}" + arrow`],
        ]
      : [
          ["Box", `${GRAPHIC.width}×${GRAPHIC.height}px · no radius`],
          ["Padding", `${GRAPHIC.pad}px, reveals the hover fill as a border`],
          ["Fill", `${GRAPHIC.bg} → ${GRAPHIC.bgHover} · blue-80 on hover`],
          ["Content padding", `${GRAPHIC.contentPad}px · ${GRAPHIC.contentGap}px gap`],
          ["Icon", `${GRAPHIC.iconBox}×${GRAPHIC.iconBox}px · ${GRAPHIC.iconGray} → ${GRAPHIC.iconBlue}`],
          ["Title", `${GRAPHIC.titleSize}px / ${GRAPHIC.titleLineHeight} · ${GRAPHIC.titleColor} · gray-90`],
          ["Description", `${GRAPHIC.descSize}px / ${GRAPHIC.descLineHeight} · ${GRAPHIC.descColor} · gray-60 · 2-line clamp`],
          ["Action row", `${CTA.height}px · opacity 0 → 1 on hover · ${CTA.blur}px backdrop blur`],
          ["CTA", `${CTA.labelSize}px · white · "${GRAPHIC.ctaLabel}" + arrow`],
        ];

  return { rules: ruleHeadlines(cardRules(variant)), rows };
}

// Live Card preview — Loka Figma "CardGraphic" (node 147:307) and "CardImage"
// (node 147:324). Both report their hover state up for the canvas readout,
// same as the Accordion, Filter, Tabs and Floating Action Button; which
// layout renders is the canvas toggle, same as the Avatar's own Image/
// Initials modes.
export function CardPreview({ variant, bestPractices, onState }) {
  const handleEnter = () => onState?.({ text: "Hovered", tone: "active" });
  const handleLeave = () => onState?.({ text: "Default", tone: "default" });

  if (variant === "Image") {
    return (
      <div className="bp-stage" data-bp={bestPractices || undefined}>
        <SpecOverlay on={bestPractices} widthMode="fixed" heightMode="hug" padX={IMAGE.pad} padY={IMAGE.pad}>
          <a
            className="card-tile card-tile--image"
            href="#case-study"
            onClick={(e) => e.preventDefault()}
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
          >
            <div className="card-tile-media-content">
              <div className="card-tile-meta">
                <div className="card-tile-meta-group">
                  <span className="card-tile-eyebrow">AWS Competency</span>
                  <span className="card-tile-divider" aria-hidden="true" />
                  <span className="card-tile-eyebrow">Aug 28, 2025</span>
                </div>
                <span className="tag-chip" style={{ height: 20, padding: "0 6px" }}>
                  Blog
                </span>
              </div>
              <div className="card-tile-media">
                <img src={awsCompetencyPhoto} alt="" />
              </div>
              <div className="card-tile-media-text">
                <p className="card-tile-image-title">Loka Achieves AWS Small and Medium Business Competency</p>
                <p className="card-tile-image-desc">
                  Their eighth AWS Competency, this latest achievement reflects Loka's expanding and specialized cloud
                  expertise.
                </p>
              </div>
            </div>
            <div className="card-tile-cta">
              <span className="card-tile-cta-label">{IMAGE.ctaLabel}</span>
              <span className="card-tile-cta-icon" aria-hidden="true">
                <ArrowInline size={CTA.iconSize} />
              </span>
            </div>
          </a>
        </SpecOverlay>
      </div>
    );
  }

  return (
    <div className="bp-stage" data-bp={bestPractices || undefined}>
      <SpecOverlay on={bestPractices} widthMode="fixed" heightMode="fixed" padX={GRAPHIC.pad} padY={GRAPHIC.pad}>
        <a
          className="card-tile card-tile--graphic"
          href="#case-study"
          onClick={(e) => e.preventDefault()}
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
        >
          <div className="card-tile-content">
            <span className="card-tile-icon" dangerouslySetInnerHTML={{ __html: HEALTH_GRAPHIC.svg }} />
            <div className="card-tile-text">
              <p className="card-tile-title">Title</p>
              <p className="card-tile-desc">Description of maximum 2 lines if possible</p>
            </div>
          </div>
          <div className="card-tile-cta">
            <span className="card-tile-cta-label">{GRAPHIC.ctaLabel}</span>
            <span className="card-tile-cta-icon" aria-hidden="true">
              <ArrowInline size={CTA.iconSize} />
            </span>
          </div>
        </a>
      </SpecOverlay>
    </div>
  );
}

// ── Copyable output ─────────────────────────────────────────────────────────

const CLASS = "loka-card";

// A right-pointing arrow, matching ArrowInline in Icon.jsx — the same glyph
// the Floating Action Button's own "See roles" label uses.
const arrowSvg = () =>
  `<svg viewBox="0 0 16 16" width="${CTA.iconSize}" height="${CTA.iconSize}" aria-hidden="true">` +
  `<path d="M3 8h9M8 3.5L12.5 8L8 12.5" fill="none" stroke="currentColor" stroke-width="1.6" ` +
  `stroke-linecap="round" stroke-linejoin="round"/></svg>`;

// The action row and its join-in-the-middle hover motion — identical for
// both layouts, so it's generated once and appended to whichever box rules
// precede it.
function ctaCssRules(ctaLabelClass = `.${CLASS}__cta-label`, ctaIconClass = `.${CLASS}__cta-icon`) {
  return blocks(
    rule(`.${CLASS}__cta`, [
      ["display", "flex"],
      ["align-items", "center"],
      ["justify-content", "center"],
      ["gap", `${CTA.gap}px`],
      ["height", `${CTA.height}px`],
      ["flex", "none"],
      ["padding", `${CTA.padY}px ${CTA.padX}px`],
      ["backdrop-filter", `blur(${CTA.blur}px)`],
      ["opacity", "0"],
      ["transition", `opacity ${CTA.duration} ease`],
    ]),
    rule(`.${CLASS}:hover .${CLASS}__cta`, [["opacity", "1"]]),
    rule(ctaLabelClass, [
      ["font-size", `${CTA.labelSize}px`],
      ["font-weight", "500"],
      ["color", CTA.color],
      ["white-space", "nowrap"],
      ["transform", `translateX(${CTA.shift}px)`],
      ["transition", `transform ${CTA.duration} ${CTA.ease}`],
    ]),
    rule(ctaIconClass, [
      ["display", "flex"],
      ["align-items", "center"],
      ["justify-content", "center"],
      ["width", `${CTA.iconSize}px`],
      ["height", `${CTA.iconSize}px`],
      ["flex", "none"],
      ["color", CTA.color],
      ["transform", `translateX(-${CTA.shift}px)`],
      ["transition", `transform ${CTA.duration} ${CTA.ease}`],
    ]),
    rule(`.${CLASS}:hover ${ctaLabelClass}, .${CLASS}:hover ${ctaIconClass}`, [["transform", "translateX(0)"]]),
  );
}

function graphicCss() {
  return blocks(
    rule(`.${CLASS}`, [
      ["display", "flex"],
      ["flex-direction", "column"],
      ["gap", `${GRAPHIC.pad}px`],
      ["width", `${GRAPHIC.width}px`],
      ["height", `${GRAPHIC.height}px`],
      ["padding", `${GRAPHIC.pad}px`],
      ["background", GRAPHIC.bg],
      ["border", `1px solid ${GRAPHIC.border}`],
      ["text-decoration", "none"],
      ["cursor", "pointer"],
      ["transition", "background .16s, border-color .16s"],
    ]),
    rule(`.${CLASS}:hover`, [
      ["background", GRAPHIC.bgHover],
      ["border-color", GRAPHIC.bgHover],
    ]),
    rule(`.${CLASS}__content`, [
      ["display", "flex"],
      ["flex-direction", "column"],
      ["gap", `${GRAPHIC.contentGap}px`],
      ["flex", "1 0 0"],
      ["min-height", "0"],
      ["padding", `${GRAPHIC.contentPad}px`],
      ["background", GRAPHIC.bg],
    ]),
    rule(`.${CLASS}__icon`, [
      ["display", "grid"],
      ["place-items", "center"],
      ["width", `${GRAPHIC.iconBox}px`],
      ["height", `${GRAPHIC.iconBox}px`],
      ["flex", "none"],
      ["color", GRAPHIC.iconGray],
      ["transition", "color .18s"],
    ]),
    rule(`.${CLASS}__icon svg`, [
      ["width", `${GRAPHIC.iconBox}px`],
      ["height", `${GRAPHIC.iconBox}px`],
      ["display", "block"],
    ]),
    rule(`.${CLASS}:hover .${CLASS}__icon`, [["color", GRAPHIC.iconBlue]]),
    rule(`.${CLASS}__text`, [
      ["display", "flex"],
      ["flex-direction", "column"],
      ["gap", `${GRAPHIC.textGap}px`],
      ["flex", "1 0 0"],
      ["min-height", "0"],
    ]),
    rule(`.${CLASS}__title`, [
      ["margin", "0"],
      ["font-size", `${GRAPHIC.titleSize}px`],
      ["font-weight", GRAPHIC.textWeight],
      ["line-height", GRAPHIC.titleLineHeight],
      ["color", GRAPHIC.titleColor],
    ]),
    rule(`.${CLASS}__desc`, [
      ["margin", "0"],
      ["font-size", `${GRAPHIC.descSize}px`],
      ["font-weight", GRAPHIC.textWeight],
      ["line-height", GRAPHIC.descLineHeight],
      ["color", GRAPHIC.descColor],
      ["display", "-webkit-box"],
      ["-webkit-line-clamp", "2"],
      ["-webkit-box-orient", "vertical"],
      ["overflow", "hidden"],
    ]),
    ctaCssRules(),
  );
}

function imageCss() {
  return blocks(
    rule(`.${CLASS}`, [
      ["display", "flex"],
      ["flex-direction", "column"],
      ["gap", `${IMAGE.pad}px`],
      ["width", `${IMAGE.width}px`],
      ["padding", `${IMAGE.pad}px`],
      ["background", IMAGE.bg],
      ["border", `1px solid ${IMAGE.border}`],
      ["text-decoration", "none"],
      ["cursor", "pointer"],
      ["transition", "background .16s, border-color .16s"],
    ]),
    rule(`.${CLASS}:hover`, [
      ["background", IMAGE.bgHover],
      ["border-color", IMAGE.bgHover],
    ]),
    rule(`.${CLASS}__content`, [
      ["display", "flex"],
      ["flex-direction", "column"],
      ["gap", `${IMAGE.contentGap}px`],
      ["width", "100%"],
      ["padding", `${IMAGE.contentPad}px`],
      ["background", IMAGE.bg],
    ]),
    rule(`.${CLASS}__meta`, [
      ["display", "flex"],
      ["align-items", "center"],
      ["justify-content", "space-between"],
      ["width", "100%"],
    ]),
    rule(`.${CLASS}__meta-group`, [
      ["display", "flex"],
      ["align-items", "center"],
      ["gap", `${IMAGE.metaGap}px`],
    ]),
    rule(`.${CLASS}__eyebrow`, [
      ["font-size", `${IMAGE.eyebrowSize}px`],
      ["font-weight", IMAGE.eyebrowWeight],
      ["letter-spacing", `${IMAGE.eyebrowTracking}px`],
      ["text-transform", "uppercase"],
      ["color", IMAGE.eyebrowColor],
      ["white-space", "nowrap"],
    ]),
    rule(`.${CLASS}__divider`, [
      ["width", "1px"],
      ["height", "8.5px"],
      ["flex", "none"],
      ["background", IMAGE.dividerColor],
    ]),
    rule(`.${CLASS}__media`, [
      ["width", "100%"],
      ["aspect-ratio", IMAGE.mediaAspect],
      ["overflow", "hidden"],
      ["flex", "none"],
    ]),
    rule(`.${CLASS}__media img`, [
      ["width", "100%"],
      ["height", "100%"],
      ["object-fit", "cover"],
      ["display", "block"],
    ]),
    rule(`.${CLASS}__media-text`, [
      ["display", "flex"],
      ["flex-direction", "column"],
      ["gap", `${IMAGE.textGap}px`],
      ["width", "100%"],
    ]),
    rule(`.${CLASS}__title`, [
      ["margin", "0"],
      ["font-size", `${IMAGE.titleSize}px`],
      ["font-weight", IMAGE.textWeight],
      ["line-height", IMAGE.titleLineHeight],
      ["color", IMAGE.titleColor],
      ["white-space", "nowrap"],
      ["overflow", "hidden"],
      ["text-overflow", "ellipsis"],
    ]),
    rule(`.${CLASS}__desc`, [
      ["margin", "0"],
      ["font-size", `${IMAGE.descSize}px`],
      ["font-weight", IMAGE.textWeight],
      ["line-height", IMAGE.descLineHeight],
      ["color", IMAGE.descColor],
      ["display", "-webkit-box"],
      ["-webkit-line-clamp", "2"],
      ["-webkit-box-orient", "vertical"],
      ["overflow", "hidden"],
    ]),
    ctaCssRules(),
    // The category tag reuses the standalone Tags component's own CSS
    // wholesale rather than a second, near-duplicate chip — see .loka-tag.
    tagsCss(),
  );
}

export function cardCss(variant) {
  return variant === "Image" ? imageCss() : graphicCss();
}

function graphicHtmlSnippet() {
  const markup = [
    `<a class="${CLASS}" href="/case-study">`,
    indent(`<div class="${CLASS}__content">`),
    indent(`<span class="${CLASS}__icon"><!-- illustration goes here --></span>`, 4),
    indent(`<div class="${CLASS}__text">`, 4),
    indent(`<p class="${CLASS}__title">Title</p>`, 6),
    indent(`<p class="${CLASS}__desc">Description of maximum 2 lines if possible</p>`, 6),
    indent("</div>", 4),
    indent("</div>"),
    indent(`<div class="${CLASS}__cta">`),
    indent(`<span class="${CLASS}__cta-label">${GRAPHIC.ctaLabel}</span>`, 4),
    indent(`<span class="${CLASS}__cta-icon">${arrowSvg()}</span>`, 4),
    indent("</div>"),
    "</a>",
    "",
    "<!-- A real link, not a styled div — the whole tile is one hover/click",
    "     target. Hover is plain CSS (:hover): the fill swaps to blue-80, the",
    "     icon swaps to blue-70, and the CTA row fades in without reflowing",
    "     the tile, since it already occupies its space at opacity: 0. The",
    "     label and icon also slide in from opposite sides as it fades, so",
    "     they read as joining in the middle rather than just appearing. -->",
  ].join("\n");

  return htmlDocument({ title: "Card — Graphic", css: graphicCss(), markup });
}

function imageHtmlSnippet() {
  const markup = [
    `<a class="${CLASS} ${CLASS}--image" href="/blog/aws-competency">`,
    indent(`<div class="${CLASS}__content">`),
    indent(`<div class="${CLASS}__meta">`, 4),
    indent(`<div class="${CLASS}__meta-group">`, 6),
    indent(`<span class="${CLASS}__eyebrow">AWS Competency</span>`, 8),
    indent(`<span class="${CLASS}__divider"></span>`, 8),
    indent(`<span class="${CLASS}__eyebrow">Aug 28, 2025</span>`, 8),
    indent("</div>", 6),
    indent(`<span class="loka-tag" data-size="20">Blog</span>`, 6),
    indent("</div>", 4),
    indent(`<div class="${CLASS}__media">`, 4),
    indent(`<!-- swap for the real photo — this is Loka's own sourced image -->`, 6),
    indent(`<img src="/images/aws-competency.jpg" alt="" />`, 6),
    indent("</div>", 4),
    indent(`<div class="${CLASS}__media-text">`, 4),
    indent(
      `<p class="${CLASS}__title">Loka Achieves AWS Small and Medium Business Competency</p>`,
      6,
    ),
    indent(
      `<p class="${CLASS}__desc">Their eighth AWS Competency, this latest achievement reflects Loka's expanding and specialized cloud expertise.</p>`,
      6,
    ),
    indent("</div>", 4),
    indent("</div>"),
    indent(`<div class="${CLASS}__cta">`),
    indent(`<span class="${CLASS}__cta-label">${IMAGE.ctaLabel}</span>`, 4),
    indent(`<span class="${CLASS}__cta-icon">${arrowSvg()}</span>`, 4),
    indent("</div>"),
    "</a>",
    "",
    "<!-- A real link, not a styled div. The category tag reuses the Tags",
    "     component's own .loka-tag class (see its export) rather than a",
    "     second chip. Hover is plain CSS (:hover): the fill swaps to",
    "     blue-100 and the CTA row fades and slides together, same motion",
    "     as the Graphic variant. -->",
  ].join("\n");

  return htmlDocument({ title: "Card — Image", css: imageCss(), markup });
}

export function cardHtmlSnippet({ variant }) {
  return variant === "Image" ? imageHtmlSnippet() : graphicHtmlSnippet();
}

export function cardPromptSnippet({ variant }) {
  if (variant === "Image") {
    return specPrompt({
      component: "Card — Image",
      config: "Photo + meta + title + description tile, CTA revealed on hover",
      sections: [
        [
          "Box",
          [
            ["Element", "a real <a>, not a styled div — hover is native :hover"],
            ["Width", `${IMAGE.width}px; height intrinsic, driven by the image's aspect ratio`],
            ["Radius", "none, anywhere in the component"],
            ["Padding", `${IMAGE.pad}px, all sides`],
            ["Fill", `${tokenRef(IMAGE.bg)} → ${tokenRef(IMAGE.bgHover)} on hover`],
            ["Border", `1px solid ${tokenRef(IMAGE.border)}, default only`],
          ],
        ],
        [
          "Content",
          [
            ["Padding", `${IMAGE.contentPad}px, ${IMAGE.contentGap}px gap between meta, media and text`],
            [
              "Meta row",
              `${IMAGE.eyebrowSize}px uppercase eyebrow (${tokenRef(IMAGE.eyebrowColor)}) with a ${IMAGE.metaGap}px-gapped divider, a "Blog" tag right-aligned — reuse the Tags component at its 20px size, don't hand-roll a new chip`,
            ],
            ["Media", `full width, ${IMAGE.mediaAspect} aspect ratio, object-fit: cover`],
            ["Title", `${IMAGE.titleSize}px / ${IMAGE.titleLineHeight}, Alliance No.2 Regular, ${tokenRef(IMAGE.titleColor)}, truncates to 1 line with an ellipsis`],
            [
              "Description",
              `${IMAGE.descSize}px / ${IMAGE.descLineHeight}, Alliance No.2 Regular, ${tokenRef(IMAGE.descColor)}, clipped to 2 lines`,
            ],
          ],
        ],
        [
          "Call to action",
          [
            ["Visibility", "opacity: 0 at rest, 1 on hover — reserves its space either way"],
            ["Height", `${CTA.height}px, ${CTA.padY}px ${CTA.padX}px padding`],
            ["Backdrop blur", `${CTA.blur}px — reads only over real content behind it, not a flat fill`],
            ["Label", `${CTA.labelSize}px, Alliance No.2 Medium, ${tokenRef(CTA.color)}, "${IMAGE.ctaLabel}"`],
            ["Icon", `${CTA.iconSize}px box, ${tokenRef(CTA.color)} — same inline arrow the Button's labels use`],
            [
              "Motion",
              `label and icon start ${CTA.shift}px apart (opposite directions) and slide to meet at center over ${CTA.duration} on ${CTA.ease} — not sourced, added for feel`,
            ],
          ],
        ],
      ],
      notes: [
        ...ruleTexts(cardRules("Image")),
        "The photo is Loka's own AWS-competency announcement image — swap it for whatever photo the real card represents.",
      ],
      reference: imageHtmlSnippet(),
    });
  }

  return specPrompt({
    component: "Card — Graphic",
    config: "Illustration + title + description tile, CTA revealed on hover",
    sections: [
      [
        "Box",
        [
          ["Element", "a real <a>, not a styled div — hover is native :hover"],
          ["Size", `${GRAPHIC.width}×${GRAPHIC.height}px`],
          ["Radius", "none, anywhere in the component"],
          ["Padding", `${GRAPHIC.pad}px, all sides`],
          ["Fill", `${tokenRef(GRAPHIC.bg)} → ${tokenRef(GRAPHIC.bgHover)} on hover`],
          ["Border", `1px solid ${tokenRef(GRAPHIC.border)}, default only`],
        ],
      ],
      [
        "Content",
        [
          ["Padding", `${GRAPHIC.contentPad}px`],
          ["Gap", `${GRAPHIC.contentGap}px between icon and text, ${GRAPHIC.textGap}px between title and description`],
          ["Fill", `${tokenRef(GRAPHIC.bg)}, unchanged on hover`],
          ["Icon", `${GRAPHIC.iconBox}×${GRAPHIC.iconBox}px, ${tokenRef(GRAPHIC.iconGray)} → ${tokenRef(GRAPHIC.iconBlue)} on hover`],
          ["Title", `${GRAPHIC.titleSize}px / ${GRAPHIC.titleLineHeight}, Alliance No.2 Regular, ${tokenRef(GRAPHIC.titleColor)}`],
          [
            "Description",
            `${GRAPHIC.descSize}px / ${GRAPHIC.descLineHeight}, Alliance No.2 Regular, ${tokenRef(GRAPHIC.descColor)}, clipped to 2 lines`,
          ],
        ],
      ],
      [
        "Call to action",
        [
          ["Visibility", "opacity: 0 at rest, 1 on hover — reserves its space either way"],
          ["Height", `${CTA.height}px, ${CTA.padY}px ${CTA.padX}px padding`],
          ["Backdrop blur", `${CTA.blur}px — reads only over real content behind it, not a flat fill`],
          ["Label", `${CTA.labelSize}px, Alliance No.2 Medium, ${tokenRef(CTA.color)}, "${GRAPHIC.ctaLabel}"`],
          ["Icon", `${CTA.iconSize}px box, ${tokenRef(CTA.color)} — same inline arrow the Button's labels use`],
          [
            "Motion",
            `label and icon start ${CTA.shift}px apart (opposite directions) and slide to meet at center over ${CTA.duration} on ${CTA.ease} — not sourced, added for feel`,
          ],
        ],
      ],
    ],
    notes: [
      ...ruleTexts(cardRules("Graphic")),
      "The illustration is this system's own Health graphic from the Graphics catalog — swap it for whichever category the card represents, keeping the same gray-to-blue hover treatment.",
    ],
    reference: graphicHtmlSnippet(),
  });
}
