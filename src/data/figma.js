// Where every "Open in Figma" in the hub points.
//
// These docs describe a Figma file, and until now they linked to it exactly once
// — at the file root, from a placeholder. That's the wrong granularity for the
// Brand Hub in particular: most of its readers are designers, and what they want
// from a page about a treatment is the treatment, open, in the tool they're
// already in. A section that documents a Figma node should link to that node.
//
// The file key lives here and nowhere else. If the published library ever becomes
// a separate file from the working one, this is the single line to change — every
// node id below is relative to it.
export const FIGMA_FILE = "iwZ7QLk8pxnbyw2sGJNki3";

// The file itself, with no node id — "the library", as opposed to "the thing this
// section documents". Exported because the Figma library section means the former
// and every other link in the hub means the latter.
export const FIGMA_FILE_URL = `https://www.figma.com/design/${FIGMA_FILE}/Design-System`;

// Node ids are colon-separated in the API and hyphen-separated in a URL. Taking
// the API form everywhere and converting here means an id can be pasted straight
// off get_metadata or the plugin API without being reformatted first.
export function figmaUrl(node) {
  return node ? `${FIGMA_FILE_URL}?node-id=${node.replace(":", "-")}` : null;
}

// Section-level targets, keyed by the hub's own section ids so a link can be looked
// up by the thing it belongs to rather than passed down by hand.
//
// Only the two Imagery entries are wired at the moment: the per-section links that
// sat under each title are switched off, and the ones that remain are in the Imagery
// labs' canvas feet. The rest are kept because finding these ids again is the
// expensive part — see the note in SectionHead.jsx for what restoring them takes.
//
// Each is the tightest node that actually exists, which is not the same depth
// everywhere: Colors, Typography, Spacing, Icons and Graphics each hold one
// top-level frame, so the frame is the target and Figma zooms to it. Imagery's
// page holds two sections, so those are targeted individually.
//
// Deliberately incomplete. `patterns` has no entry because the hub's Patterns
// section has no single frame in the file that corresponds to it — better an
// absent link than one that lands somewhere plausible and wrong. FigmaLink
// renders nothing when the node is missing, so a gap costs nothing.
export const FIGMA_NODES = {
  logo: "176:2", // the Logo page
  color: "84:2", // Foundations / Colors
  typography: "90:2", // Foundations / Typography
  spacing: "92:2", // Foundations / Spacing
  icons: "64:205", // Icons
  graphics: "65:1224", // Graphics
  imagery: "29:199", // the Imagery page — both sections
  "imagery-styling": "183:54", // Styling section
  "imagery-usage": "184:4698", // Usage section
};
