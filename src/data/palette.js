// Color palette tokens
// Extracted verbatim from the original Loka design-system source.

import { cssColorVar } from "../utils/color.js";

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
  // The `colors/semantic/*` variables from Figma's Primitives collection.
  // Only the Red/Amber/Green feedback ramps are documented here — see
  // SEMANTIC_LEGACY_TOKENS below for the job-named surfaces/lines that used
  // to live in this section.
  semantic: {
    label: "Semantic",
    description:
      "Red, Amber, and Green — the state colors used for system feedback: errors, warnings, and success.",
    groups: [
      {
        key: "red",
        label: "Red",
        description:
          "Red signals critical states and irreversible actions. It is used for errors, destructive actions, and system feedback that requires immediate attention. Red should feel intentional and rare, not decorative. Don't use red for neutral emphasis or non-critical highlights.",
        tokens: [
          { name: "red-01", hex: "FEF8F8" },
          { name: "red-02", hex: "FDEEEF" },
          { name: "red-03", hex: "FCE1E3" },
          { name: "red-04", hex: "FAD2D5" },
          { name: "red-05", hex: "F8C1C5" },
          { name: "red-06", hex: "F6AEB3" },
          { name: "red-07", hex: "F3959C" },
          { name: "red-08", hex: "EF747E" },
          { name: "red-09", hex: "FB1E27" },
          { name: "red-10", hex: "E30C1C" },
          { name: "red-11", hex: "BB070E" },
          { name: "red-12", hex: "4D131E" },
        ],
      },
      {
        key: "amber",
        label: "Amber",
        description:
          "Amber communicates caution and pending states. It is used for warnings, system limitations, or situations that require user awareness but not immediate action. Amber sits between neutral and critical, providing clear signal without urgency.",
        tokens: [
          { name: "amber-01", hex: "FFFDF8" },
          { name: "amber-02", hex: "FFFAEE" },
          { name: "amber-03", hex: "FEF6E0" },
          { name: "amber-04", hex: "FEF2D2" },
          { name: "amber-05", hex: "FEEDC1" },
          { name: "amber-06", hex: "FEE7AD" },
          { name: "amber-07", hex: "FDE094" },
          { name: "amber-08", hex: "FDD773" },
          { name: "amber-09", hex: "FFC652" },
          { name: "amber-10", hex: "FBB80A" },
          { name: "amber-11", hex: "A76805" },
          { name: "amber-12", hex: "44331D" },
        ],
      },
      {
        key: "green",
        label: "Green",
        description:
          "Green represents success and completion. It is used for confirmations, successful actions, and healthy system states. Green should feel calm and reassuring. Don't over use it.",
        tokens: [
          { name: "green-01", hex: "F8FCFA" },
          { name: "green-02", hex: "EEF8F4" },
          { name: "green-03", hex: "E1F2EB" },
          { name: "green-04", hex: "D3ECE1" },
          { name: "green-05", hex: "C2E4D6" },
          { name: "green-06", hex: "AFDCC9" },
          { name: "green-07", hex: "97D2B9" },
          { name: "green-08", hex: "77C4A3" },
          { name: "green-09", hex: "18A969" },
          { name: "green-10", hex: "10975D" },
          { name: "green-11", hex: "04703E" },
          { name: "green-12", hex: "0F2E21" },
        ],
      },
    ],
  },
};

// Returns every token in a palette group, whether it's stored flat (`tokens`,
// like Neutral/Blue) or split into named sub-groups (`groups`, like Semantic's
// Red/Amber/Green).
export function paletteTokens(entry) {
  return entry.tokens ?? entry.groups.flatMap((g) => g.tokens);
}

// Job-named surfaces/lines that used to be documented under Semantic. Removed
// from the visible section (Semantic is Red/Amber/Green only now), but kept
// here — not exported, not in the command-palette index — purely so
// tokenForHex still resolves them: CheckboxPreview, FilterPreview, and
// TabsPreview hardcode these exact hex values, and snippets.js uses
// tokenForHex to label a color in generated code. Delete a hex below only
// after checking nothing still hardcodes it.
const SEMANTIC_LEGACY_TOKENS = [
  { name: "PageBackground", hex: "FDFDFD" },
  { name: "BackgroundGrey", hex: "F5F6FA" },
  { name: "Line-stroke", hex: "ECECEE" },
  { name: "LineOpaque", hex: "DFDFE1" },
  { name: "GreyBlue", hex: "7C92AE" },
  { name: "DarkBlue", hex: "041D3E" },
];

// Reverse lookup from a resolved hex to the token that owns it, so generated
// snippets and specs can name a colour rather than just quoting its value —
// "#186BF3" on its own tells a developer nothing about where it came from.
//
// First writer wins, and the group order above is what settles the collisions:
// DarkBlue and gray-80 are the same value, and the ramp step is the name a
// developer is likelier to recognise.
const TOKEN_BY_HEX = new Map();
for (const [group, entry] of Object.entries(PALETTE)) {
  for (const { name, hex } of paletteTokens(entry)) {
    const key = `#${hex.toUpperCase()}`;
    if (!TOKEN_BY_HEX.has(key)) {
      TOKEN_BY_HEX.set(key, { group, name, cssVar: cssColorVar(group, name) });
    }
  }
}
for (const { name, hex } of SEMANTIC_LEGACY_TOKENS) {
  const key = `#${hex.toUpperCase()}`;
  if (!TOKEN_BY_HEX.has(key)) {
    TOKEN_BY_HEX.set(key, { group: "semantic", name, cssVar: cssColorVar("semantic", name) });
  }
}

// Returns { group, name, cssVar } for a hex value, or null when there's no
// token behind it — rgba() overlays, `transparent`, and the gradient stroke
// stops are all real values in the system that no palette entry names.
export function tokenForHex(value) {
  if (typeof value !== "string") return null;
  const match = value.trim().match(/^#?([0-9a-f]{6})$/i);
  return match ? (TOKEN_BY_HEX.get(`#${match[1].toUpperCase()}`) ?? null) : null;
}
