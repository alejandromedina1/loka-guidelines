// Color palette tokens
// Extracted verbatim from the original Loka design-system source.

export const PALETTE = {
  neutral: {
    label: "Neutral",
    description:
      "The backbone of the system. Neutrals carry structure and hierarchy — surfaces, text, borders, dividers. They should never compete with content or accent color.",
    tokens: [
      { name: "black", hex: "010812" },
      { name: "gray-90", hex: "020F1F" },
      { name: "gray-80", hex: "041D3E" },
      { name: "gray-70", hex: "2E3F5A" },
      { name: "gray-60", hex: "5C6A82" },
      { name: "gray-50", hex: "828FA5" },
      { name: "gray-40", hex: "A8B3CA" },
      { name: "gray-30", hex: "CCD4E0" },
      { name: "gray-20", hex: "D6DCE6" },
      { name: "gray-10", hex: "E7ECF2" },
      { name: "gray-5", hex: "EFF1F5" },
      { name: "white", hex: "FFFFFF" },
    ],
  },
  blue: {
    label: "Blue",
    description:
      "The primary brand and interactive color. Blue carries links, focus states, selected items, and informational messaging. Spend it deliberately — to guide attention, not to decorate.",
    tokens: [
      { name: "NewBlue", hex: "1957F4" },
      { name: "blue-100", hex: "186BF3" },
      { name: "blue-80", hex: "1877F2" },
      { name: "blue-70", hex: "2F85F3" },
      { name: "blue-60", hex: "5495F4" },
      { name: "blue-40", hex: "84AAF3" },
      { name: "blue-20", hex: "BDCFF5" },
      { name: "blue-10", hex: "D8E2F6" },
      { name: "blue-5", hex: "EEF2FE" },
    ],
  },
  // The root-level `colors/*` variables from Figma's Primitives collection —
  // everything that isn't a step on the neutral or blue ramp. Names match the
  // Figma variables exactly so a value can be traced back to its token.
  semantic: {
    label: "Semantic",
    description:
      "Colors named for the job they do rather than for where they sit on a ramp — the page itself, a section fill, a divider, a muted label. Reach for these before picking a step off the neutral scale: the name records the decision, so a surface that should track the page background doesn't quietly become “whichever gray looked right”. Two values will look familiar — DarkBlue is gray-80 and GreyBlue sits between gray-40 and gray-50 — but Figma binds them as their own variables, so they're documented as their own tokens.",
    tokens: [
      { name: "PageBackground", hex: "FDFDFD" },
      { name: "BackgroundGrey", hex: "F5F6FA" },
      { name: "Line-stroke", hex: "ECECEE" },
      { name: "LineOpaque", hex: "DFDFE1" },
      { name: "GreyBlue", hex: "7C92AE" },
      { name: "DarkBlue", hex: "041D3E" },
    ],
  },
};
