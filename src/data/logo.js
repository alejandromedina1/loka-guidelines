import { contrastRatio, hexToRgb, luminance } from "../utils/color.js";
import markSource from "../assets/logos/loka-mark.svg?raw";
import wordmarkSource from "../assets/logos/loka-wordmark.svg?raw";

// The logo, and the six files a designer or developer comes here to get.
//
// Two lockups and three colours, held as two source files rather than six. The
// three wordmark exports are byte-identical apart from their `fill`, so a colour
// is a fill swap and nothing else — which means the swap is lossless, the three
// can't drift apart the way three separate files eventually do, and what you see
// on the page is generated from the same string the download hands over.

// `height` is how tall the lockup is drawn in its plate. The two aren't the same
// number because they aren't the same shape: the wordmark is nearly four times as
// wide as it is tall and needs the room, the mark is square and would look
// oversized at the same height.
//
// `ratio` is the file's own viewBox, and for the wordmark that is not the artwork's
// ratio: the export carries roughly 97 units of empty space on its left and 105 on
// its right, with none above or below. Placed as-is it will sit with side margins
// nobody asked for. Kept exactly as exported — it's the official file, and silently
// re-cropping the logo is not a call this page should make — but flagged, because
// the first person to place it will otherwise think they made the mistake.
// Clear space, and where the rule comes from.
//
// The Logo page in Figma carries two pasted screenshots of *Resend's* brand
// guidelines — not Loka's — and they're the only statement of a clear-space rule
// anywhere in the file. That's also where "Lettermark" comes from. Their rule:
//
//   "The clear space (X) equals 1/2 of the cap height. The clear space should be
//    kept on all sides of the logo."
//
// Adopted here because it's the model on the page and it's a sound, conventional
// rule — but it is borrowed, and nobody at Loka has signed it off as Loka's. That's
// the one thing to confirm before this page is treated as authoritative.
//
// `clear` is x as a share of the lockup's rendered height, so it holds at any size.
//
//   Wordmark   cap height is the L: y 39.2383 to 188.709 in the file's 853 x 225
//              box, so 149.4707. x = 74.7354, which is 0.33216 of the box height.
//              The L is the right letter to measure — flat top, flat baseline, no
//              optical overshoot, unlike the O, which overshoots at both ends.
//   Lettermark a symbol has no cap height, so the rule has nothing to divide. The
//              equivalent taken here is half the mark's own height. That's an
//              interpretation, not something the reference covers — flagged as the
//              second thing to confirm.
//
// `art` is where the ink actually sits inside the file, as insets of the file box,
// because clear space is measured from the artwork and not from the export's edge.
// The wordmark's export is padded and the lettermark's isn't, so without this the
// wordmark's zone would be drawn a full 1.3x out from where it belongs.
export const LOGO_LOCKUPS = [
  {
    id: "wordmark",
    name: "Wordmark",
    file: "loka-wordmark",
    source: wordmarkSource,
    ratio: "853 / 225",
    // 88 rather than 64: x is a third of the height, and at 64 the band was 21px —
    // too narrow to letter. At 88 it's 29px, which a 10px label sits in.
    height: 88,
    // Ink bounds x 97 → 747.612, y 0 → 224.563 of the 853 x 225 box. Derived from
    // the L and KA paths (absolute H commands, so exact) and confirmed by
    // rasterising the file and reading the bounding box back.
    art: { left: 0.11372, right: 0.12355, top: 0, bottom: 0.00194 },
    // The cap height, as insets within the file box: the L runs y 39.2383 to
    // 188.709 of 225. This is what x is half of, and the diagram draws it as 2x so
    // the value isn't just asserted. Note 1 - 0.174392 - 0.161293 = 0.664315, which
    // is exactly 2 x `clear` — asserted in the lab, because if the two ever drift
    // the diagram would be quietly showing a different rule from the one it states.
    cap: { top: 0.174392, bottom: 0.161293 },
    capName: "the cap height, off the L",
    clear: 0.33216,
    // Worth knowing before placing the file: its own padding is 1.30x on the left
    // and 1.41x on the right, and none at all top or bottom. Butt it against
    // something horizontally and the clear space is already there; do it vertically
    // and there is none.
    clearNote: "The export carries 1.3x at the left and 1.4x at the right, and none above or below.",
    description:
      "The L, the target O, and the KA. Use it anywhere there's room for it to be read.",
  },
  {
    id: "lettermark",
    name: "Lettermark",
    file: "loka-lettermark",
    source: markSource,
    ratio: "32 / 31.8742",
    height: 96,
    // Full bleed: the mark touches all four edges of its own box.
    art: { left: 0, right: 0, top: 0, bottom: 0 },
    // No cap height in a symbol, so 2x is the mark's own height — which is the whole
    // box. Drawing it makes the interpretation visible rather than leaving x looking
    // like a number somebody chose.
    cap: { top: 0, bottom: 0 },
    capName: "the mark's own height",
    clear: 0.5,
    clearNote: "The export is cropped tight to the mark, so all of the clear space has to be added around it.",
    description:
      "The target O lifted out of the wordmark, for places too small or too square for the full lockup — an avatar, a favicon, an app icon.",
  },
];

// `surfaces` is the surfaces this colour is documented on, in order — the first is
// what the lab opens on. Taken from the brand's own Logo usage board, which states
// four pairings and no others: white on dark, white on the brand blue, black on
// light, blue on white.
//
// A list rather than a single value because White genuinely has two, and collapsing
// that to one would have lost the blue application, which is the most recognisable
// thing the logo does.
//
// This list is the whole permitted set, not a starting point. The Surface control
// offers exactly these and nothing else, so a colour can only ever appear on a
// surface the brand documents it on.
//
// That is stricter than legibility requires, and deliberately: black on white
// measures 20:1 and blue on dark 4.8:1, both perfectly readable, and neither is
// allowed. Which pairings are permitted is a brand decision, not a contrast
// calculation — the contrast floor below is a check on this list, not a substitute
// for it.
//
// `token` names the palette entry when there is one — see the note below on the two
// that don't have one.
export const LOGO_COLORS = [
  {
    id: "blue",
    name: "Blue",
    hex: "#1877F2",
    token: "blue-80",
    surfaces: ["white"],
    use: "The default lockup — reach for it unless the background rules it out.",
  },
  {
    id: "black",
    name: "Black",
    hex: "#010812",
    token: "black",
    surfaces: ["light"],
    use: "Where blue would compete: dense documents, co-branded layouts, print.",
  },
  {
    id: "white",
    name: "White",
    hex: "#FFFFFF",
    token: "white",
    surfaces: ["dark", "blue"],
    use: "The only variant that goes over photography.",
  },
];

// What the logo can be put on. A fixed four rather than a free colour picker: these
// are the surfaces the usage board shows, and a picker would invite a fifth.
//
// White and Light are separate because the board treats them separately — the blue
// lockup is shown on white, the black one on a grey card — and merging them would
// throw away a distinction somebody made on purpose. Dark is the logo's own black
// and Blue is its own blue, so changing surface never introduces a colour the logo
// isn't already drawn in.
export const LOGO_SURFACES = [
  { id: "white", name: "White", value: "#FFFFFF", token: "white" },
  { id: "light", name: "Light", value: "#EFF1F5", token: "gray-5" },
  { id: "dark", name: "Dark", value: "#010812", token: "black" },
  { id: "blue", name: "Blue", value: "#1877F2", token: "blue-80" },
];

// Every value in this section resolves to a palette token, which is why there is no
// note here flagging one that doesn't.
//
// Two of the three were already exact: the logo blue is blue-80 (#1877F2 — not the
// blue-100 the Color section leads with, which is a step along the ramp and worth
// knowing when sampling), and white is white. Black was the one stray at #050517,
// in no ramp at all, and is snapped to `black` (#010812) — the nearest neutral by a
// clear margin, Δ7 against gray-90's Δ13, and the semantic match for a colour called
// Black.
//
// The consequence is worth being explicit about: the files this section hands over
// carry the token values, so the downloaded black lockup is #010812 and no longer
// byte-matches the #050517 export it was built from. That is the trade for having a
// logo drawn in colours the system actually defines.

// A colour is a fill swap. `fill="none"` on the root survives it — the pattern
// requires a hex — which is what keeps the swap safe to run over the whole file.
export function logoSvg(lockup, color) {
  return lockup.source.replace(/fill="#[0-9A-Fa-f]{3,8}"/g, `fill="${color.hex}"`);
}

// A floor on the documented pairings themselves, so a pairing that isn't legible
// can't be added to `surfaces` above and quietly shipped.
//
// 3:1, where WCAG puts graphical objects (1.4.11) — a logo is one, not a run of
// text. Every documented pairing clears it today, with room: the tightest are blue
// on white and white on blue, both at 4.23. Nothing is currently excluded by this,
// which is the point — it's an assertion that holds rather than a filter doing work.
//
// Worth knowing what those 4.23s mean: the logo blue clears the bar as a graphic and
// would fail 4.5:1 as body text on the same white. So this floor is the right one
// for a logo and the wrong one to reuse for type.
export const LOGO_MIN_CONTRAST = 3;

export function surfaceContrast(color, surface) {
  return contrastRatio(luminance(hexToRgb(color.hex)), luminance(hexToRgb(surface.value)));
}

// The surfaces a colour may appear on: the ones it's documented against, and of
// those, only the ones it's legible on.
//
// Both conditions, in that order. The documented list is the rule; the contrast
// filter is there so a pairing added upstream that doesn't actually work never
// reaches the control. Today it removes nothing.
export function allowedSurfaces(color) {
  return color.surfaces
    .map((id) => LOGO_SURFACES.find((s) => s.id === id))
    .filter((s) => s && surfaceContrast(color, s) >= LOGO_MIN_CONTRAST);
}

// The surface a colour opens on: the first one it's documented against, which is
// always one it's allowed on — asserted by the fact that no documented pairing falls
// under the floor above.
export function defaultSurface(color) {
  return color.surfaces[0];
}

export function logoFilename(lockup, color, ext = "svg") {
  return `${lockup.file}-${color.id}.${ext}`;
}
