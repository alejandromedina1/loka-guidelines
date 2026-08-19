import { dotGrid } from "./patternStyles.js";

// Builds the CSS for the four imagery treatments. A styled image is a stack of
// layers over the photograph, always in this order:
//
//   scrim  a flat wash of the ink at 50%, present only when type sits over the
//          body of the image — it exists to carry that type, not to style the
//          photo, so an image with no text over it doesn't get one
//   dots   the Dot Grid pattern from data/patterns.js, in gray-5 rather than the
//          gray-10 that pattern uses on a surface — over photography the mark has
//          to stay lighter than anything it might land on
//   band   a strip pinned to the bottom edge that blurs and tints what's
//          behind it, so a caption sits on the photo with no plate under it
//
// One builder per layer, plus `imageryCss` to emit the whole set as a rule set.

// #05142E — the near-black navy Figma ramps the band tint through, and the scrim's
// colour too. Kept in one place because those two are the treatments' only darks:
// if they drift apart, an image with both layers has a cool scrim over it and a
// differently-cool band on top, which reads as a mistake rather than a system.
const INK = "5, 20, 46";

// gray-5 (#EFF1F5) — the dot field's mark. A step lighter than the gray-10 both
// the Dot Grid pattern and the Figma frame use, because those sit on a known
// surface and this sits on a photograph, where the field has to read against
// whatever the brightest thing under it happens to be.
const DOT_INK = "239, 241, 245";

// The tint Figma paints into the band: a 20%-opacity ramp from clear through the
// ink to blue-100, running down the band so it's densest at the edge the caption
// sits on. The clear end is written rgba(…, 0) rather than `transparent` so the
// first leg interpolates through the navy, not through CSS's transparent black.
const TINT_STOPS = [
  [`rgba(${INK}, 0)`, 0],
  [`rgba(${INK}, 0.2)`, 49],
  ["rgba(24, 107, 243, 0.2)", 85.6],
];

export const BAND_TINT = `linear-gradient(to bottom, ${TINT_STOPS.map(
  ([color, pos]) => `${color} ${pos}%`,
).join(", ")})`;

// Figma draws the band as one rectangle carrying a *progressive* background
// blur — a radius that ramps from 0 at the top of the band to `blur` at the
// bottom. `backdrop-filter` takes a single radius, and masking one blurred
// layer with a gradient doesn't stand in for it: that cross-fades sharp content
// with fully-blurred content, so the sharp edges ghost through the top of the
// ramp instead of softening.
//
// So the band is a stack of layers. Each fades in over its own fifth of the band
// and stays on below that, so at the band's top edge every layer is still fully
// masked out — the blur starts at nothing there and merges into the untouched
// photo with no seam. Anything opaque at 0% puts a hard line across the image.
//
// Each layer blurs what the ones beneath it already blurred, so the radii
// compound in quadrature. Picking them so the compounded radius tracks Figma's
// linear ramp means solving Σ(r_i²) = (blur·k/N)² at each step k, which leaves
// r_i = (blur/N)·√(2i+1) — and the full stack sums to exactly `blur` at the
// bottom edge rather than overshooting it. Figma's own frames ramp to 40px; the
// system caps at 24 — see BAND_CONTROLS in data/imagery.js.
const BAND_LAYERS = 5;

export function bandLayers(blur) {
  const step = 100 / BAND_LAYERS;
  const round = (n) => Number(n.toFixed(2));
  return Array.from({ length: BAND_LAYERS }, (_, i) => ({
    radius: round((blur / BAND_LAYERS) * Math.sqrt(2 * i + 1)),
    mask:
      "linear-gradient(to bottom, " +
      `transparent ${round(i * step)}%, #000 ${round((i + 1) * step)}%` +
      ")",
  }));
}

// The dot field is never run edge to edge over a photograph: it has to clear the
// subject — faces, a screen, whatever the image is of — or it reads as dirt on
// the lens. Figma does this with an alpha mask on the dot group, a linear
// gradient from opaque at one edge of the frame to clear before the subject
// starts. On Figma's group shot that's a fade out 44% down from the top, which
// keeps the field on the ceiling and windows and off the people below.
//
// So the field is anchored to an edge and given a reach, rather than being
// positioned around the subject: a gradient can't know where a face is, and a
// mask tuned per photo isn't a system. Pick the edge the subject *isn't* on.
//
// A linear fade only ever runs on the Y axis. A photograph stacks vertically —
// ceiling or sky, then the subject, then foreground — so a vertical fade lands in
// the band above or below whatever the shot is of. A horizontal one would cut
// across the subject instead of clearing it, since subjects tend to span the
// frame's width.
//
// Which leaves the case a Y-axis fade can't serve at all: a subject centre-frame
// and full-height, with no clear side to fade from. That's "Edges" — a radial fade
// inward from every side at once, clearing the middle and keeping the field in the
// margins. It's a third anchor rather than a separate linear/radial switch, so
// `dotReach` keeps one meaning in every mode (how far in from the anchor the field
// survives) and no control is ever left sitting there doing nothing.
export const DOT_ANCHORS = ["Top", "Bottom", "Edges"];

// The linear gradient runs away from the anchor, so the field is densest there.
const FADE_TOWARD = { Top: "bottom", Bottom: "top" };

// Falls back rather than interpolating an unknown anchor into the mask: one
// `undefined` in a gradient makes the whole declaration invalid, and a mask that
// silently doesn't apply looks like a field with no mask at all — much harder to
// spot than a field masked the wrong way round.
function dotMask(anchor, reach) {
  if (anchor === "Edges") {
    // `closest-side` so 100% lands on the frame's nearer edge instead of its
    // farthest corner — the same reason the Soft Blue Glow pattern uses it, and
    // what makes `reach` mean the same fraction of the frame it does above. The
    // corners fall outside that circle and so keep full field, which is right:
    // they're the furthest thing from a centred subject.
    return `radial-gradient(circle closest-side at center, transparent ${100 - reach}%, #000 100%)`;
  }
  const toward = FADE_TOWARD[anchor] ?? FADE_TOWARD.Top;
  return `linear-gradient(to ${toward}, #000 0%, transparent ${reach}%)`;
}

// Always 2px on photography, whatever the image's size. Over a photo the field is
// grain, not a graphic element: at 3px and up the squares start reading as their
// own pattern competing with the picture, and scaling them with the image would
// make a hero and a thumbnail two different textures. The Figma frames measure
// 4.58px and 2.51px, but those are crops at different scales — 2px is the value.
const DOT_SIZE = 2;

// Always 30%, same as the square is always 2px. The field's weight is a property
// of the field, not of the photo it lands on: tuning it per image is how you end
// up with a set of pages whose texture doesn't match. What varies per photo is
// where the field is allowed to be, which is the mask's job below.
const DOT_OPACITY = 30;

export function dotOverlay({ dotSpacing, dotAnchor, dotReach }) {
  // The tile builder always emits a surface color, because a pattern swatch is
  // the surface. Here there's a photograph behind the field instead, so the
  // background is dropped rather than declared transparent.
  const { backgroundColor: _, ...tile } = dotGrid({
    size: DOT_SIZE,
    gap: dotSpacing,
    color: `rgba(${DOT_INK}, ${DOT_OPACITY / 100})`,
  });
  const mask = dotMask(dotAnchor, dotReach);
  return { ...tile, WebkitMaskImage: mask, maskImage: mask };
}

// Always 50%. Below that the type stops holding on the bright parts of a photo,
// above it the picture is gone — and a scrim that varies per image is a scrim
// someone has to re-judge every time, which is the opposite of a system. The
// decision isn't how strong, it's whether there's type to carry at all.
const SCRIM_OPACITY = 50;

export const scrimOverlay = { backgroundColor: `rgba(${INK}, ${SCRIM_OPACITY / 100})` };

// The band has no height of its own: the caption sits inside it in flow, so the
// band is exactly the caption's box plus this padding above and below. Both terms
// are fixed — the band can't be taller or shorter than the text it exists to
// carry, and the 30px doesn't vary with the image. Checks out against Figma,
// where the Blur example's 140px band holds 84px of text: 84 + 2x30 = 144.
const BAND_PAD = 30;

export const bandPadding = { padding: `${BAND_PAD}px 0` };

function decl(props) {
  return Object.entries(props)
    .map(([prop, value]) => `  ${prop.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}: ${value};`)
    .join("\n");
}

function rule(selector, props) {
  return `${selector} {\n${decl(props)}\n}`;
}

// The copyable stylesheet for the selected treatment: the frame, the photo, and
// only the layers that treatment actually uses. Both the mask and the backdrop
// filter are emitted with their -webkit- twins — Safari still needs the prefix
// on backdrop-filter, and shipped -webkit-mask-image for years before the
// unprefixed property.
export function imageryCss(layers, values) {
  const rules = [
    // Corners stay square, so there's nothing to clip: every layer below is
    // either the photo at 100% or an inset overlay, and none of them overflow.
    rule(".imagery", { position: "relative" }),
    rule(".imagery > img", {
      display: "block",
      width: "100%",
      height: "100%",
      objectFit: "cover",
    }),
  ];

  if (layers.scrim) {
    rules.push(
      "/* Scrim — #05142E at 50%. Only when type sits over the image body. */",
      rule(".imagery-scrim", { position: "absolute", inset: "0", ...scrimOverlay }),
    );
  }

  if (layers.dots) {
    rules.push(
      "/* Dot field — the Dot Grid pattern in gray-5, masked so it clears the subject */",
      rule(".imagery-dots", { position: "absolute", inset: "0", ...dotOverlay(values) }),
    );
  }

  if (layers.blur) {
    rules.push(
      "/* Caption band — a progressive blur, as a stack of masked layers that ramps\n   from nothing at the top edge to `blur` at the bottom */",
      rule(".imagery-band", {
        position: "absolute",
        inset: "auto 0 0",
        ...bandPadding,
      }),
      rule(".imagery-band > i", { position: "absolute", inset: "0" }),
      ...bandLayers(values.blur).map(({ radius, mask }, i) =>
        rule(`.imagery-band > i:nth-child(${i + 1})`, {
          WebkitBackdropFilter: `blur(${radius}px)`,
          backdropFilter: `blur(${radius}px)`,
          WebkitMaskImage: mask,
          maskImage: mask,
        }),
      ),
      rule(".imagery-band > b", { position: "absolute", inset: "0", background: BAND_TINT }),
      "/* The caption, in flow — this is what gives the band its height. Only\n   positioned so it paints above the ramp and tint, which precede it. Size it\n   from the type scale. */",
      rule(".imagery-caption", { position: "relative", color: "#fff", textAlign: "center" }),
    );
  }

  return rules.join("\n");
}
