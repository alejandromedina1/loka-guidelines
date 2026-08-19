import phone from "../assets/imagery/phone.jpg";
import colleagues from "../assets/imagery/colleagues.jpg";
import presenting from "../assets/imagery/presenting.jpg";
import lab from "../assets/imagery/lab.jpg";
import { DOT_ANCHORS } from "../utils/imageryStyles.js";

// Photography treatments. The four styles are cumulative rather than
// alternatives: Simple is the bare image, Dots adds a texture over the whole
// frame, Blur adds a band at the bottom edge for a caption, and Dots + Blur is
// both. `layers` says which overlays a style turns on — the gallery renders
// exactly those and `utils/imageryStyles.js` emits CSS for exactly those — and
// `defaults`/`controls` seed the adjustable knobs, same shape as data/patterns.js.
//
// The photos are a set rather than one per style, and any treatment can be put on
// any of them, because the settings a treatment needs are a property of the
// photograph, not of the treatment. A mask that clears the presenter is wrong for
// the group shot. Each style opens on the one Figma pairs it with; switching is how
// you find that out rather than being told it.
//
// They're Figma's own photos, cropped the way Figma crops them, so the numbers
// below can be checked against the page. `subject` is where the subject sits in the
// frame — it isn't used to compute anything, it's what the playground shows you
// when you go looking for somewhere to put the dot field.
export const IMAGERY_PHOTOS = [
  {
    id: "presenting",
    label: "Presenter",
    src: presenting,
    alt: "A Loka team member presenting to a room",
    subject: "Centre, full height — no clear side, so keep the fade short",
  },
  {
    id: "colleagues",
    label: "Colleagues",
    src: colleagues,
    alt: "Two colleagues looking at a phone together",
    subject: "Lower two thirds — clear window above it, so fade from Top",
  },
  {
    id: "lab",
    label: "Lab",
    src: lab,
    alt: "A gloved hand holding a petri dish in a laboratory",
    subject: "Subject in the centre band — the case for fading from Edges",
  },
  {
    id: "phone",
    label: "Phone",
    src: phone,
    alt: "Someone looking at a map on their phone",
    subject: "Left and centre — clear along the top edge",
  },
];

// The dot field. The square is fixed at 2px — see utils/imageryStyles.js — so
// what's left to set is the gap between them and how much they carry.
//
// Two gaps, not a range: a field this fine only has a couple of densities that
// read as texture rather than as a visible grid, and picking off a slider invites
// a third that's neither. 24px is the looser of the pair and the default — the
// nearer of the two to Figma's 27.59px pitch on the Dots + Blur frame, the frame
// whose dots are closest to 2px. Spacing is the gap, not the pitch, to match the
// Dot Grid pattern's controls.
const DOT_SPACINGS = [20, 24];

// Anchor and reach are the mask: where the field hangs off, and how far in from
// there it survives before it's gone. Top and Bottom fade on the Y axis; Edges
// fades radially inward for a subject that's centre-frame with no clear side — see
// utils/imageryStyles.js. 40% from the top is the default, about what the
// Colleagues photo wants, with its subjects in the lower two thirds under a
// defocused window.
const DOT_DEFAULTS = {
  dotSpacing: 24,
  dotAnchor: "Top",
  dotReach: 40,
};
const DOT_CONTROLS = [
  { key: "dotSpacing", label: "Spacing", options: DOT_SPACINGS, unit: "px", group: "Dot field" },
  // Labelled "Fade" rather than "Anchor"/"Reach": the thing being set is the dot
  // field's fade, and that's the word to scan the panel for.
  { key: "dotAnchor", label: "Fade from", options: DOT_ANCHORS, group: "Dot field" },
  { key: "dotReach", label: "Fade over", min: 10, max: 100, step: 5, unit: "%", group: "Dot field" },
];

// Nothing about the band's depth is adjustable: it's the caption's own height
// plus a fixed 30px above and below, and the caption's measure is in cqw so the
// line count matches Figma at any width. The blur radius is the one knob.
// 10px to 24px. Below 10 the ramp is too shallow to lift a caption off a busy
// photo; above 24 the band stops reading as the image softening and starts
// reading as a panel sitting on it. Figma's Blur frame is drawn at 40, which is
// past that ceiling — the two styles here bracket the range instead, Blur at the
// top of it and Dots + Blur at the bottom.
const BAND_CONTROLS = [
  { key: "blur", label: "Blur radius", min: 10, max: 24, step: 2, unit: "px", group: "Band" },
];

// `caption` on a style says only where the type sits — "headline" centred on the
// frame, "band" in flow inside the blurred band. The string itself lives in
// `defaults.text`, so it's editable in the panel like any other value. That's
// worth more here than on most controls: the band takes its height from the
// caption, so typing a fourth line into it deepens the band in front of you.
// `needs` names a toggle this control depends on, so it greys out rather than
// sitting there editable with nothing to affect.
const TEXT_CONTROL = (rows, needs) => ({
  key: "text",
  label: "Text",
  text: true,
  rows,
  needs,
  group: "Text",
});

// Rendered in this order, and only when a style has controls in them.
export const IMAGERY_GROUPS = ["Text", "Dot field", "Band"];

export const IMAGERY_STYLES = [
  {
    id: "simple",
    name: "Simple",
    photo: "phone",
    layers: {},
    description:
      "The image on its own, cropped to the frame and untreated. The default — add a treatment only when something has to sit on top of the photo.",
    defaults: {},
    controls: [],
  },
  {
    id: "dots",
    name: "Dots",
    photo: "presenting",
    layers: { scrim: true, dots: true },
    // 72px Medium on a 1676px frame in Figma, so it's held in cqw and tracks
    // the frame instead of the viewport.
    caption: "headline",
    description:
      "A dot field over the photo, masked so it clears the subject — anchor it to the edge the subject isn't on, or to Edges when it sits centre-frame. Scrim only with type.",
    // The toggle is the whole decision the scrim represents: either type sits
    // over the body of the image and needs carrying, or it doesn't and the photo
    // is left alone. There's no in-between to tune, so it's a switch, not a
    // slider — flip it to see the same treatment with and without.
    defaults: {
      hasText: true,
      text: "For the Love\nof Launching",
      ...DOT_DEFAULTS,
      // This photo's subject stands centre-frame and full-height, her head about
      // 11% down, so the field has to be gone before it reaches her. 40% is the
      // norm — switch to Colleagues in the playground to see the field get the room
      // it normally has. This photo is what the low end of the range is for.
      dotReach: 15,
    },
    controls: [
      { key: "hasText", label: "Text over image", toggle: true, group: "Text" },
      TEXT_CONTROL(2, "hasText"),
      ...DOT_CONTROLS,
    ],
  },
  {
    id: "blur",
    name: "Blur",
    photo: "lab",
    layers: { blur: true },
    // 24px Regular at 115% in Figma, on a 445px frame — held in cqw, so both the
    // size and the measure track the frame and the text wraps to the same three
    // lines it does there.
    caption: "band",
    description:
      "A band at the bottom edge that blurs and tints the photo behind it, ramping to nothing at its top. Its depth is the caption plus 30px, nothing more.",
    defaults: {
      text: "Big Pharma arms focusing on R&D rather than commercial or clinical stage",
      blur: 24,
    },
    controls: [TEXT_CONTROL(3), ...BAND_CONTROLS],
  },
  {
    id: "dots-blur",
    name: "Dots + Blur",
    photo: "presenting",
    layers: { dots: true, blur: true },
    caption: "band",
    description:
      "Both layers. The blur drops to 10px because the dot field already breaks the surface up, and with no scrim the mask alone has to clear the subject.",
    defaults: {
      text: "Where the work actually happens",
      ...DOT_DEFAULTS,
      // Her head starts about 11% down, so the field has to be gone by then — the
      // Colleagues photo can afford the usual 40%, this one can't.
      dotReach: 15,
      blur: 10,
    },
    controls: [TEXT_CONTROL(2), ...DOT_CONTROLS, ...BAND_CONTROLS],
  },
];
