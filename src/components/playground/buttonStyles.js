// Pure styling logic for the interactive Button preview. Kept out of the React
// component so the visual rules are easy to read and adjust in one place.
//
// Mirrors the "Button" component in the Loka Figma library. Figma models the
// button on three axes — type, device, state — which map here to variant,
// device, and state.

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

// The copyable ERB snippet reflecting the current button configuration.
export function buttonSnippet({ variant, device, surface, disabled }) {
  const slug = (s) => s.toLowerCase().replace(/\s+/g, "_");
  return (
    `<%= render ButtonComponent.new(` +
    `variant: :${slug(variant)}, device: :${device.toLowerCase()}` +
    // Ghost's trailing arrow is part of the variant, so it needs no icon arg.
    (variant === "Ghost" ? `, surface: :${slug(surface)}` : "") +
    (disabled ? `, disabled: true` : "") +
    `, label: "Label") %>`
  );
}
