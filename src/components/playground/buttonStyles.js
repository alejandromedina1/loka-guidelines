// Pure styling logic for the interactive Button preview. Kept out of the React
// component so the visual rules are easy to read and adjust in one place.
//
// Mirrors the "Button" component in the Loka Figma library. Figma models the
// button on three axes — type, device, state — which map here to variant,
// device, and state.

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
} from "./snippets.js";

// Design-system tokens the button spec references, by their Figma names.
const BLUE_100 = "#186BF3"; // colors/blue/100
const BLUE_NEW = "#1957F4"; // colors/blue/newblue
const GRAY_10 = "#E7ECF2"; // colors/neutral/gray-10
const GRAY_30 = "#CCD4E0"; // colors/neutral/gray-30
const GRAY_80 = "#041D3E"; // colors/neutral/gray-80
const GRAY_90 = "#020F1F"; // colors/neutral/gray-90

// Every bordered variant carries the same shape of stroke: 1px, inside-aligned,
// painted as a left-to-right linear gradient at 10% and blended into whatever
// sits under it. Only the two stops and the blend mode change between variants.
// Read off the Figma nodes — the design-context export flattens these to their
// first stop at full opacity, which is far too dark to be the real edge.
const STROKE_ALPHA = 0.1;
const SLATE_STROKE = { from: "#58697E", to: "#406899" };
const LIGHT_STROKE = { from: "#F6F7F9", to: "#E8EEF5" };

export const BUTTON_VARIANTS = ["Primary", "Secondary", "Outline light", "Outline dark", "Ghost"];

// Outline dark has a white label and white border, so the preview canvas has to
// go dark for it to be legible. Ghost is NOT in this list — it takes its colour
// from whichever surface hosts it (see GHOST_SURFACES).
export const DARK_SURFACE_VARIANTS = ["Outline dark"];

// Ghost has no fill of its own: it spans the full width of a container whose
// background becomes the button's surface, and the label colour follows that
// surface. These are the two pairings the Figma library actually ships —
// the podcast card footer (gray-10) and the originals card footer (blue-100).
export const GHOST_SURFACES = {
  "Gray 10": { fill: GRAY_10, label: GRAY_90 },
  "Blue 100": { fill: BLUE_100, label: "#FFFFFF" },
};

// Figma's `device` axis. The box is identical on both; only the label size
// changes, so this is the type scale rather than a size ramp.
export const DEVICE_SPEC = {
  Desktop: { font: 16 },
  Mobile: { font: 15 },
};

// Every variant shares one box except Ghost, which is taller, roomier, spans its
// container, and keeps square corners — it is a full-bleed bar pinned to the
// bottom of a card, so the container supplies the shape.
const BOX = { height: 40, padX: 14, radius: 80 };
const GHOST_BOX = { height: 44, padX: 16, radius: 0 };

// Shared across every variant.
const BORDER_WIDTH = 1;
const FONT_WEIGHT = 500; // Alliance No.2 Medium
const LINE_HEIGHT = 1.3;
const GAP = 12;
// Ghost is the only variant that carries an icon, and it sits AFTER the label.
// No variant in the library uses a leading icon.
const ICON_SIZE = 18;
const ICON_POSITION = "trailing";
// Width is auto-layout hug in Figma — there is no min-width in the spec, so the
// overlay reports the measured width rather than asserting a floor.

// Figma collapses hover and press into a single appearance: desktop reaches it
// by hovering, mobile by pressing. So both states resolve to `active` here.
const VARIANT_SPEC = {
  Primary: {
    default: { background: BLUE_100, stroke: { ...SLATE_STROKE, blend: "multiply" }, color: "#FFFFFF" },
    // Primary is the only variant that drops its stroke on active.
    active: { background: BLUE_NEW, stroke: null, backdropFilter: "none" },
  },
  Secondary: {
    // Overlay rather than multiply: on a light grey fill it lifts the edge
    // instead of darkening it, which is why this one reads as almost nothing.
    default: { background: GRAY_10, stroke: { ...SLATE_STROKE, blend: "overlay" }, color: GRAY_90 },
    active: { background: GRAY_30 },
  },
  "Outline light": {
    default: {
      background: "rgba(120,138,161,.03)",
      stroke: { ...SLATE_STROKE, blend: "multiply" },
      color: GRAY_80,
    },
    active: { background: "rgba(120,138,161,.1)" },
  },
  "Outline dark": {
    // Screen, and near-white stops: this variant sits on dark imagery, so the
    // edge has to lighten rather than darken.
    default: {
      background: "rgba(255,255,255,.1)",
      stroke: { ...LIGHT_STROKE, blend: "screen" },
      color: "#FFFFFF",
    },
    active: { background: "rgba(250,250,251,.2)" },
  },
  Ghost: {
    default: { background: "transparent", stroke: null, color: "#FFFFFF" },
    // Ghost has exactly one state, and that is deliberate rather than a gap:
    // it IS the reveal-on-hover CTA of its parent card. Hovering the card is
    // what brings it on screen, so it never needs a hover of its own.
    active: {},
  },
};

// Resolves a variant/state pair to its fill, stroke, and label colour.
function paint(variant, state) {
  const spec = VARIANT_SPEC[variant];
  return { ...spec.default, ...(state === "default" ? {} : spec.active) };
}

// Builds the full inline style for a button in a given variant/device/state.
// `surface` only applies to Ghost, which inherits its label colour from the
// container it sits in.
export function makeButtonStyle({
  variant,
  state = "default",
  device = "Desktop",
  disabled,
  surface = "Gray 10",
}) {
  const isGhost = variant === "Ghost";
  const box = isGhost ? GHOST_BOX : BOX;
  const { background, color, backdropFilter } = paint(variant, disabled ? "default" : state);

  return {
    background,
    color: isGhost ? (GHOST_SURFACES[surface] ?? GHOST_SURFACES["Gray 10"]).label : color,
    // The stroke itself is painted by the .btn-ring overlay — a CSS border can't
    // hold a gradient. This one stays transparent to reserve its 1px, so the box
    // never shifts between variants or states, and the ring has somewhere to sit.
    border: `${BORDER_WIDTH}px solid transparent`,
    // Containing block for that overlay.
    position: "relative",
    // Ghost stretches to its container; every other variant hugs its label.
    width: isGhost ? "100%" : undefined,
    // Figma blurs whatever sits behind the button, so the translucent variants
    // stay readable over imagery.
    backdropFilter: backdropFilter ?? "blur(10px)",
    height: box.height,
    padding: `0 ${box.padX}px`,
    borderRadius: box.radius,
    fontSize: DEVICE_SPEC[device].font,
    fontFamily: "var(--display)",
    fontWeight: FONT_WEIGHT,
    lineHeight: LINE_HEIGHT,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: GAP,
    cursor: disabled ? "not-allowed" : "pointer",
    // Figma has no disabled variant; this is the project's own convention.
    opacity: disabled ? 0.45 : 1,
    // Ghost is a full-bleed bar flush with its container's edges, so scaling it
    // would pull it away from those edges. Single-state by design, no press.
    transform: !disabled && !isGhost && state === "pressed" ? "scale(0.97)" : "scale(1)",
    transition: "background .12s, transform .08s",
  };
}

// The gradient stroke, as an inline style for the .btn-ring overlay. Returns
// null for variants that never carry one.
//
// The gradient is always the variant's default-state one, and only its opacity
// follows the current state. Primary is the reason: it drops its stroke on
// active, and fading the ring out over the same 120ms as the fill is what the
// old transitioned border-colour did — swapping the gradient out instead would
// pop, since background-image doesn't interpolate.
export function makeStrokeStyle({ variant, state = "default", disabled }) {
  const base = VARIANT_SPEC[variant].default.stroke;
  if (!base) return null;
  const current = paint(variant, disabled ? "default" : state).stroke;

  return {
    backgroundImage: `linear-gradient(90deg, ${base.from}, ${base.to})`,
    mixBlendMode: base.blend,
    opacity: current ? STROKE_ALPHA : 0,
  };
}

// Redline figures for the best-practices overlay. Reads from the same constants
// makeButtonStyle uses, so the annotations can't drift from the rendered button.
export function buttonSpec({ variant, device, surface = "Gray 10" }) {
  const isGhost = variant === "Ghost";
  const box = isGhost ? GHOST_BOX : BOX;
  const rest = paint(variant, "default");
  const active = paint(variant, "hover");
  const ghost = GHOST_SURFACES[surface] ?? GHOST_SURFACES["Gray 10"];

  return {
    isGhost,
    // Ghost fills its container; the rest hug their label.
    sizing: isGhost ? "fill container" : "hug",
    surface: isGhost ? `${surface} · ${ghost.fill}` : null,
    height: box.height,
    padX: box.padX,
    radius: box.radius,
    fontSize: DEVICE_SPEC[device].font,
    fontWeight: FONT_WEIGHT,
    lineHeight: LINE_HEIGHT,
    gap: GAP,
    // Only Ghost has an icon — everything else is label-only.
    iconSize: isGhost ? ICON_SIZE : null,
    iconPosition: isGhost ? ICON_POSITION : null,
    borderWidth: BORDER_WIDTH,
    strokeAlpha: STROKE_ALPHA,
    fill: rest.background,
    fillActive: active.background,
    stroke: rest.stroke,
    strokeActive: active.stroke,
    label: isGhost ? ghost.label : rest.color,
    backdrop: rest.backdropFilter ?? "blur(10px)",
    backdropActive: active.backdropFilter ?? "blur(10px)",
  };
}

// ── Copyable output ─────────────────────────────────────────────────────────
// Both formats below are built from buttonSpec(), which reads the same
// constants makeButtonStyle() renders the live preview from — so the snippet
// can't drift from the button on the canvas.

const CLASS = "loka-btn";
const variantClass = (variant) => `${CLASS}--${variant.toLowerCase().replace(/\s+/g, "-")}`;

// Placeholder copy. Ghost gets its own because it's a card-footer CTA rather
// than a standalone control, and "Button" in a card footer reads as a mistake.
// Exported so the live preview and the copyable snippet read the same string —
// they used to hold one literal each, which is one literal too many.
const LABEL = { Ghost: "Card action" };
const DEFAULT_LABEL = "Button";

export const buttonLabel = (variant) => LABEL[variant] ?? DEFAULT_LABEL;

// The trailing arrow, matching ArrowInline in Icon.jsx. Inlined rather than
// referenced, because a snippet that needs an icon import isn't self-contained.
const arrowSvg = (size) =>
  `<svg viewBox="0 0 16 16" width="${size}" height="${size}" aria-hidden="true">` +
  `<path d="M3 8h9M8 3.5L12.5 8L8 12.5" fill="none" stroke="currentColor" ` +
  `stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

// Spells a gradient stroke out as prose — "1px #58697E" would be a lie about a
// two-stop gradient painted at a tenth of its strength.
const describeStroke = (stroke, spec) =>
  stroke
    ? `${spec.borderWidth}px linear-gradient(90deg, ${stroke.from} → ${stroke.to}), ` +
      `${Math.round(spec.strokeAlpha * 100)}% opacity, ${stroke.blend} blend`
    : "none";

// The compact form the specs panel shows, where the column is 260px wide.
const penShort = (stroke, spec) =>
  stroke
    ? `${spec.borderWidth}px ${stroke.from} → ${stroke.to} · ${Math.round(spec.strokeAlpha * 100)}% ${stroke.blend}`
    : "none";

// The guidance behind the Button, stated once. The specs panel shows the
// headlines; the AI prompt shows these with their reasoning attached.
export function buttonRules({ variant, surface = "Gray 10" }) {
  const spec = buttonSpec({ variant, device: "Desktop", surface });

  return [
    {
      rule: "The stroke is a gradient at 10% — a CSS border can't hold one.",
      why: "Paint it as a masked overlay over a reserved 1px transparent border, so the box never shifts between variants or states.",
    },
    spec.isGhost
      ? {
          rule: "Ghost has no fill: its container's background is its surface.",
          why: "It spans the full width of that container and the label colour follows the surface. Only two pairings ship in the library — gray-10 and blue-100 card footers.",
        }
      : {
          rule: "No icon. Ghost is the only variant that carries one, after the label.",
          why: "No variant in the library uses a leading icon.",
        },
    {
      rule: "Device sets the label size only — a media query, not a prop.",
      why: "16px desktop, 15px mobile; the box is identical on both.",
    },
    ...(spec.isGhost
      ? [
          {
            rule: "Single-state by design: the card's hover is Ghost's hover.",
            why: "Hovering the parent card is what brings it on screen, so it never needs a hover of its own, and it takes no press scale — it's flush with its container's edges.",
          },
        ]
      : [
          {
            rule: "Width hugs the label — there's no min-width to honour.",
          },
          // The interaction model. This used to live in a draggable card behind
          // a "Show behaviour" toggle that only ever worked for the Button; it
          // belongs with the rest of the guidance, where every component's is.
          {
            rule: "Hover and press share one appearance — desktop hovers, mobile presses.",
            why: "Don't build them as two treatments; press only adds the 0.97 scale on top of the hover fill.",
          },
        ]),
    {
      rule: "No focus state is defined. Don't invent one.",
      why: "Keyboard focus falls back to the browser's default ring, or to whatever focus treatment this project already has.",
    },
  ];
}

// What the specs panel shows. Width, height and padding are absent on purpose —
// the redlines draw all three on the component itself, and the font is the
// system's rather than the Button's. What's left is mostly colour, which is the
// one part of the spec a redline can't show.
export function buttonSpecs({ variant, device, surface = "Gray 10" }) {
  const spec = buttonSpec({ variant, device, surface });
  const border = penShort(spec.stroke, spec);
  const borderActive = penShort(spec.strokeActive, spec);

  return {
    rules: ruleHeadlines(buttonRules({ variant, surface })),
    rows: [
      ...(spec.surface ? [["Surface", spec.surface]] : []),
      ["Radius", spec.radius === 0 ? "0 · square" : `${spec.radius}px · pill`],
      ["Text", `${spec.fontSize}px / ${spec.fontWeight}`],
      ["Fill", spec.fill],
      ...(spec.fill === spec.fillActive ? [] : [["Fill · hover", spec.fillActive]]),
      ["Label", spec.label],
      ["Border", border],
      ...(border === borderActive ? [] : [["Border · hover", borderActive]]),
      // Backdrop isn't here. It's blur(10px) on every variant and only Primary
      // drops it on hover — a rendering detail rather than a decision to read
      // off a spec sheet, and the code panel carries it either way.
    ],
  };
}

// The stylesheet for one button configuration. Every value is resolved: no
// custom properties, so it renders identically wherever it's pasted.
export function buttonCss({ variant, device, surface = "Gray 10" }) {
  const spec = buttonSpec({ variant, device, surface });
  const v = variantClass(variant);
  const ghost = GHOST_SURFACES[surface] ?? GHOST_SURFACES["Gray 10"];

  const base = rule(`.${CLASS}`, [
    ["display", "inline-flex"],
    ["align-items", "center"],
    ["justify-content", "center"],
    ["gap", `${spec.gap}px`],
    ["height", `${spec.height}px`],
    ["padding", `0 ${spec.padX}px`],
    ["border-radius", spec.radius ? `${spec.radius}px` : "0"],
    // The 1px is reserved even where the stroke is invisible, so the box never
    // shifts between variants or states — the ring below is painted over it.
    ["border", `${spec.borderWidth}px solid transparent`],
    ["position", "relative"],
    ["font-family", FONT_STACK],
    ["font-size", `${spec.fontSize}px`],
    ["font-weight", spec.fontWeight],
    ["line-height", spec.lineHeight],
    ["cursor", "pointer"],
    ["transition", "background .12s, opacity .12s, transform .08s"],
  ]);

  const paint = rule(`.${v}`, [
    ["background", spec.fill],
    ["color", spec.label],
    // Figma blurs whatever sits behind the button so the translucent variants
    // stay readable over imagery.
    ["backdrop-filter", spec.backdrop === "none" ? null : spec.backdrop],
    ["width", spec.isGhost ? "100%" : null],
  ]);

  // Figma paints the stroke as a linear gradient, and a CSS border can't hold
  // one — so it's a gradient filling the border box with its middle masked
  // away, leaving only the 1px edge.
  const ring = spec.stroke
    ? rule(`.${v}::after`, [
        ["content", '""'],
        ["position", "absolute"],
        ["inset", `-${spec.borderWidth}px`],
        ["border", `${spec.borderWidth}px solid transparent`],
        ["border-radius", "inherit"],
        ["pointer-events", "none"],
        ["background-image", `linear-gradient(90deg, ${spec.stroke.from}, ${spec.stroke.to})`],
        ["background-origin", "border-box"],
        // Reproduces Figma's stroke blending against the fill underneath.
        ["mix-blend-mode", spec.stroke.blend],
        ["opacity", spec.strokeAlpha],
        ["-webkit-mask", "linear-gradient(#000 0 0) padding-box, linear-gradient(#000 0 0)"],
        ["-webkit-mask-composite", "xor"],
        ["mask", "linear-gradient(#000 0 0) padding-box, linear-gradient(#000 0 0)"],
        ["mask-composite", "exclude"],
        ["transition", "opacity .12s"],
      ])
    : "";

  // Hover and press share one appearance — desktop reaches it by hovering,
  // mobile by pressing. :not(:disabled) because a disabled button still takes
  // :hover in some browsers, and the disabled button has no hover state.
  const hover = rule(`.${v}:hover:not(:disabled)`, [
    ["background", spec.fillActive !== spec.fill ? spec.fillActive : null],
    ["backdrop-filter", spec.backdropActive !== spec.backdrop ? spec.backdropActive : null],
  ]);

  // Primary is the only variant that drops its stroke on active. Fade it rather
  // than swapping the gradient out — background-image doesn't interpolate, so a
  // swap would pop where the fill transitions smoothly.
  const hoverRing =
    spec.stroke && !spec.strokeActive
      ? rule(`.${v}:hover:not(:disabled)::after`, [["opacity", "0"]])
      : "";

  // Ghost is a full-bleed bar flush with its container's edges, so scaling it
  // would pull it away from them.
  const press = spec.isGhost
    ? ""
    : rule(`.${CLASS}:active:not(:disabled)`, [["transform", "scale(0.97)"]]);

  // Figma has no disabled variant; this is the system's own convention.
  const disabled = rule(`.${CLASS}:disabled`, [
    ["opacity", "0.45"],
    ["cursor", "not-allowed"],
  ]);

  // Ghost has no fill of its own — the container's background becomes its
  // surface, so the frame ships with it. Width is the host card's, not ours.
  const frame = spec.isGhost
    ? rule(`.${CLASS}-ghost-frame`, [
        ["display", "flex"],
        ["background", ghost.fill],
      ])
    : "";

  return blocks(base, paint, ring, hover, hoverRing, press, disabled, frame);
}

// A self-contained HTML + CSS block for the current configuration: paste it
// into any page and it renders, with no Loka package required.
export function buttonHtmlSnippet({ variant, device, surface = "Gray 10", disabled }) {
  const spec = buttonSpec({ variant, device, surface });
  const v = variantClass(variant);
  const label = buttonLabel(variant);
  // Ghost is the only variant with an icon, and Figma puts it after the label.
  const icon = spec.iconSize ? `\n  ${arrowSvg(spec.iconSize)}` : "";
  const button =
    `<button class="${CLASS} ${v}"${disabled ? " disabled" : ""}>\n` +
    `  ${label}${icon}\n` +
    `</button>`;

  return htmlDocument({
    title: `Button — ${variant} · ${device}${disabled ? " · disabled" : ""}`,
    css: buttonCss({ variant, device, surface }),
    // Ghost is transparent and full-bleed: it only reads correctly inside the
    // card footer that supplies its surface.
    markup: spec.isGhost
      ? `<div class="${CLASS}-ghost-frame">\n${indent(button)}\n</div>`
      : button,
  });
}

// The same configuration as a spec an agent can build from, in whatever stack
// the developer's project already uses.
export function buttonPromptSnippet({ variant, device, surface = "Gray 10", disabled }) {
  const spec = buttonSpec({ variant, device, surface });
  const stroke = describeStroke(spec.stroke, spec);
  const strokeActive = describeStroke(spec.strokeActive, spec);

  return specPrompt({
    component: "Button",
    config: [variant, device, spec.isGhost && `on ${surface}`, disabled && "disabled"]
      .filter(Boolean)
      .join(" · "),
    sections: [
      [
        "Box",
        [
          ["Width", spec.isGhost ? "fills its container" : "hug content — no min-width in the spec"],
          ["Height", `${spec.height}px`],
          ["Padding", `0 ${spec.padX}px`],
          ["Radius", spec.radius ? `${spec.radius}px (pill)` : "0 (square — the container supplies the shape)"],
          ["Border", stroke],
        ],
      ],
      [
        "Type",
        [
          ["Family", "Alliance No.2"],
          ["Size", `${spec.fontSize}px`],
          ["Weight", `${spec.fontWeight}`],
          ["Line height", `${spec.lineHeight}`],
          ...(spec.iconSize
            ? [
                ["Icon", `${spec.iconSize}px, ${spec.iconPosition} — an arrow after the label`],
                ["Gap", `${spec.gap}px between label and icon`],
              ]
            : [["Icon", "none"]]),
        ],
      ],
      [
        "Color",
        [
          ...(spec.surface ? [["Surface", tokenRef(spec.surface.split(" · ").pop())]] : []),
          ["Fill", tokenRef(spec.fill)],
          ["Label", tokenRef(spec.label)],
          ["Backdrop", spec.backdrop],
        ],
      ],
    ],
    states: [
      spec.fill === spec.fillActive
        ? "Hover and press: no change. Ghost is the reveal-on-hover CTA of its parent card — hovering the card is what brings it on screen, so it never needs a hover of its own."
        : `Hover and press share one appearance: fill steps to ${tokenRef(spec.fillActive)} over 120ms. Desktop reaches it by hovering, mobile by pressing.`,
      ...(spec.stroke && spec.stroke !== spec.strokeActive
        ? [
            spec.strokeActive
              ? `Over the same 120ms the stroke becomes ${strokeActive}. Animate its opacity rather than swapping the gradient — background-image doesn't interpolate, so a swap pops where the fill transitions smoothly.`
              : "Over the same 120ms the stroke fades out entirely. Animate its opacity rather than removing it — background-image doesn't interpolate, so a swap pops where the fill transitions smoothly.",
          ]
        : []),
      ...(spec.isGhost ? [] : ["Press adds transform: scale(0.97) over 80ms, so touch still gets feedback."]),
      // Focus isn't listed here — it's a rule below, and there's no state to
      // describe, only the instruction not to invent one.
      "Disabled: 45% opacity, cursor: not-allowed. Figma has no disabled variant — this is the system's own convention.",
    ],
    notes: ruleTexts(buttonRules({ variant, surface })),
    reference: buttonHtmlSnippet({ variant, device, surface, disabled }),
  });
}
