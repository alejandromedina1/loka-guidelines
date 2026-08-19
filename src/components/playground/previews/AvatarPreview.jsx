import { AVATAR_SWATCHES } from "../../../data/components.js";
import { SpecOverlay } from "../SpecOverlay.jsx";
import { blocks, htmlDocument, indent, rule, ruleHeadlines, ruleTexts, specPrompt, tokenRef } from "../snippets.js";

// Resolved values for the box — Loka Figma "Avatar/Initials" (node 147:36): a
// square, sharp-cornered box showing one or two initials centered inside.
// Figma sources only the 32px size and the Initials content; the Image
// variant and the rest of the size range are this system's own extension of
// the same box, not a second component invented alongside it.
const T = {
  fontWeight: 500,
  lineHeight: 1.4,
};

// Initials' type size per box size — a fixed lookup rather than a computed
// ratio, matching how the box itself only takes six discrete presets rather
// than a freeform number.
const TYPE_SCALE = { 24: 10, 32: 14, 40: 16, 48: 18, 54: 20, 64: 22 };

const toPx = (size) => parseInt(size, 10) || 32;

// A real sample photo — Unsplash, License-free — standing in for whatever
// photo an actual person's avatar would carry. Not a Figma asset, since the
// sourced node only defines Initials; it exists so the Image variant
// demonstrates a filled box instead of an empty one. Swap it for the real
// photo in production.
const SAMPLE_PHOTO_URL =
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=256&h=256&fit=crop&crop=faces&q=80";

// The guidance behind the box, stated once. The specs panel shows the
// headlines; the AI prompt shows these with their reasoning attached.
export function avatarRules({ variant, color, size }) {
  const swatch = AVATAR_SWATCHES[color] ?? AVATAR_SWATCHES.Blue;
  const px = toPx(size);
  return [
    {
      rule: "Two variants, not one with a fallback icon baked in.",
      why: "Image shows the person's actual photo; Initials is the deliberate placeholder for when there isn't one. The calling code decides which to render — this component doesn't infer it from a missing image.",
    },
    {
      rule: "Six preset sizes — 24/32/40/48/54/64px — not a freeform number.",
      why: "Each is a place in the product that already has a slot for it. 32px is Figma's own sourced size; a size outside the set doesn't have a home to justify it.",
    },
    {
      rule: "Square, no radius, in both variants.",
      why: "Matches the sourced Initials spec; Image mirrors it rather than introducing a second shape convention alongside it.",
    },
    {
      rule: "Initials' six-color range doesn't apply to Image.",
      why: "A photo already disambiguates one person from another, so recoloring it would be decorative — the range exists only to keep initials-only avatars visually distinct from each other.",
    },
    variant === "Initials"
      ? {
          rule: "One color per person, kept — not re-rolled per screen.",
          why: `${color}'s pairing (${swatch.bg} on ${swatch.text}) is one of six; the same person showing up in a different color between views reads as a bug, not personalization.`,
        }
      : {
          rule: "The sample photo is a stand-in, not the real person.",
          why: "It exists so this page doesn't demonstrate the Image variant as an empty box — swap the src for whichever person's photo actually belongs there before shipping.",
        },
    {
      rule: `Initials' type sizes with the box off a fixed lookup, ${px}px → ${TYPE_SCALE[px] ?? 14}px here.`,
      why: "Matches how the box itself only takes six discrete sizes; a computed ratio would produce type sizes nobody asked for.",
    },
  ];
}

export function avatarSpecs({ variant, color, size }) {
  const swatch = AVATAR_SWATCHES[color] ?? AVATAR_SWATCHES.Blue;
  const px = toPx(size);
  const args = { variant, color, size };
  return {
    rules: ruleHeadlines(avatarRules(args)),
    rows: [
      ["Box", `${px}×${px}px · no radius`],
      ["Variant", variant],
      ...(variant === "Initials"
        ? [
            ["Fill", `${swatch.bg} · ${color}`],
            ["Text", `${TYPE_SCALE[px] ?? 14}px / ${T.lineHeight} · ${T.fontWeight} · ${swatch.text}`],
            ["Colors", "Blue · Green · Orange · Purple · Pink · Yellow"],
          ]
        : [["Content", "Photo, object-fit: cover — sample shown for demonstration"]]),
      ["Sizes", "24 · 32 · 40 · 48 · 54 · 64px"],
    ],
  };
}

// Live Avatar preview — Loka Figma "Avatar/Initials" component set (node
// 147:36) for the Initials variant, extended with an Image variant and a
// six-size range this system adds on top of it. Color only applies to
// Initials; a photo doesn't need one, same relationship Filter's Multi-/
// Single-select modes have to their own options.
export function AvatarPreview({ variant, color, size, bestPractices }) {
  const px = toPx(size);
  const swatch = AVATAR_SWATCHES[color] ?? AVATAR_SWATCHES.Blue;
  const fontSize = TYPE_SCALE[px] ?? 14;

  return (
    <div className="bp-stage" data-bp={bestPractices || undefined}>
      <SpecOverlay on={bestPractices} widthMode="fixed" heightMode="fixed" padX={0} padY={0}>
        {variant === "Image" ? (
          <span className="avatar-initials avatar-initials--image" style={{ width: px, height: px }}>
            <img src={SAMPLE_PHOTO_URL} alt="" />
          </span>
        ) : (
          <span
            className="avatar-initials"
            data-color={color}
            style={{ width: px, height: px, fontSize, background: swatch.bg, color: swatch.text }}
          >
            A
          </span>
        )}
      </SpecOverlay>
    </div>
  );
}

// ── Copyable output ─────────────────────────────────────────────────────────

const CLASS = "loka-avatar";

export function avatarCss() {
  return blocks(
    rule(`.${CLASS}`, [
      ["display", "flex"],
      ["align-items", "center"],
      ["justify-content", "center"],
      ["flex", "none"],
      ["font-weight", T.fontWeight],
      ["line-height", T.lineHeight],
      ["text-align", "center"],
      ["overflow", "hidden"],
    ]),
    ...Object.entries(TYPE_SCALE).map(([px, fontSize]) =>
      rule(`.${CLASS}[data-size="${px}"]`, [
        ["width", `${px}px`],
        ["height", `${px}px`],
        ["font-size", `${fontSize}px`],
      ]),
    ),
    ...Object.entries(AVATAR_SWATCHES).map(([name, swatch]) =>
      rule(`.${CLASS}[data-color="${name}"]`, [
        ["background", swatch.bg],
        ["color", swatch.text],
      ]),
    ),
    rule(`.${CLASS}--image`, [["background", "#E7ECF2"]]),
    rule(`.${CLASS}--image img`, [
      ["width", "100%"],
      ["height", "100%"],
      ["object-fit", "cover"],
      ["display", "block"],
    ]),
  );
}

export function avatarHtmlSnippet({ variant, color, size }) {
  const px = toPx(size);
  const markup =
    variant === "Image"
      ? [
          `<span class="${CLASS} ${CLASS}--image" data-size="${px}">`,
          indent(`<img src="${SAMPLE_PHOTO_URL}" alt="" />`),
          "</span>",
        ].join("\n")
      : `<span class="${CLASS}" data-size="${px}" data-color="${color}">A</span>`;

  const note =
    variant === "Image"
      ? [
          "",
          "<!-- Image variant: object-fit: cover fills the box regardless of the",
          "     photo's own aspect ratio. This sample is from Unsplash, standing",
          "     in for demonstration — swap the src for the real person's photo. -->",
        ].join("\n")
      : [
          "",
          "<!-- Initials variant: one or two characters, the person's actual",
          "     initials. data-color picks the fill/text pair from the six",
          "     defined below — swap it per person, don't reassign it between",
          "     views. -->",
        ].join("\n");

  return htmlDocument({ title: `Avatar — ${variant}`, css: avatarCss(), markup: markup + note });
}

export function avatarPromptSnippet({ variant, color, size }) {
  const px = toPx(size);
  const swatch = AVATAR_SWATCHES[color] ?? AVATAR_SWATCHES.Blue;
  const args = { variant, color, size };

  return specPrompt({
    component: "Avatar",
    config: `${variant} · ${px}px`,
    sections: [
      [
        "Box",
        [
          ["Size", `${px}×${px}px — one of 24/32/40/48/54/64`],
          ["Radius", "none — square corners"],
          ...(variant === "Image"
            ? [["Content", `photo, object-fit: cover — sample: ${SAMPLE_PHOTO_URL}`]]
            : [["Fill", tokenRef(swatch.bg)]]),
        ],
      ],
      ...(variant === "Initials"
        ? [
            [
              "Type",
              [
                ["Family", "Alliance No.2"],
                ["Size / line-height", `${TYPE_SCALE[px] ?? 14}px / ${T.lineHeight}`],
                ["Weight", `${T.fontWeight} (Medium)`],
                ["Color", tokenRef(swatch.text)],
                ["Alignment", "centered on both axes"],
              ],
            ],
            [
              "Colors",
              Object.entries(AVATAR_SWATCHES).map(([name, s]) => [name, `${tokenRef(s.bg)} fill, ${tokenRef(s.text)} text`]),
            ],
          ]
        : []),
    ],
    notes: [
      ...ruleTexts(avatarRules(args)),
      variant === "Initials"
        ? "Holds one or two characters — the initials of the person it represents, not decorative text."
        : "The sample photo is a stand-in for demonstration — swap the src for the real person's photo before shipping.",
    ],
    reference: avatarHtmlSnippet(args),
  });
}
