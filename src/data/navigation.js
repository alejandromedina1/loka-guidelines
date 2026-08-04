// Navigation model — mirrors the documentation page architecture.

import { COMPONENT_LIST, FIELD_TYPES } from "./components.js";

// Turns a component name into its section id, e.g. "Input Field" -> "component-input-field".
export const componentId = (name) =>
  `component-${name.toLowerCase().replace(/\s+/g, "-")}`;

// Components that split in the nav the way Color splits into its scales. Unlike
// the Foundations sub-items, these aren't scroll targets — the playground shows
// one canvas at a time — so each carries the `variant` the playground opens on
// rather than an id to scroll to. Kept out of SPY_IDS for that reason.
const COMPONENT_SUBS = {
  "Input Field": FIELD_TYPES.map((type) => ({
    id: `${componentId("Input Field")}-${type.toLowerCase()}`,
    label: type,
    component: "Input Field",
    variant: type,
  })),
};

export const NAV = [
  {
    group: "Getting started",
    items: [
      { id: "introduction", label: "Introduction" },
      { id: "figma-library", label: "Figma library" },
    ],
  },
  {
    group: "Foundations",
    items: [
      {
        id: "color",
        label: "Color",
        sub: [
          { id: "color-neutral", label: "Neutral" },
          { id: "color-blue", label: "Blue" },
          { id: "color-semantic", label: "Semantic" },
        ],
      },
      {
        id: "typography",
        label: "Typography",
        sub: [
          { id: "type-desktop", label: "Desktop scale" },
          { id: "type-mobile", label: "Mobile scale" },
        ],
      },
      { id: "spacing", label: "Spacing" },
      { id: "icons", label: "Icons" },
      { id: "graphics", label: "Graphics" },
      { id: "patterns", label: "Patterns" },
    ],
  },
  {
    group: "Components",
    items: COMPONENT_LIST.map((c) => ({
      id: componentId(c),
      label: c,
      component: c,
      ...(COMPONENT_SUBS[c] && { sub: COMPONENT_SUBS[c] }),
    })),
  },
];

// Flat list of scroll-spy targets, in document order.
export const SPY_IDS = [
  "introduction",
  "figma-library",
  "color",
  "color-neutral",
  "color-blue",
  "color-semantic",
  "typography",
  "type-desktop",
  "type-mobile",
  "spacing",
  "icons",
  "graphics",
  "patterns",
  "components",
];
