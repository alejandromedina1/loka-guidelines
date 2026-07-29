// Navigation model — mirrors the documentation page architecture.

import { COMPONENT_LIST } from "./components.js";

// Turns a component name into its section id, e.g. "Input Field" -> "component-input-field".
export const componentId = (name) =>
  `component-${name.toLowerCase().replace(/\s+/g, "-")}`;

export const NAV = [
  {
    group: "Getting started",
    items: [{ id: "introduction", label: "Introduction" }],
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
    ],
  },
  {
    group: "Components",
    items: COMPONENT_LIST.map((c) => ({
      id: componentId(c),
      label: c,
      component: c,
    })),
  },
];

// Flat list of scroll-spy targets, in document order.
export const SPY_IDS = [
  "introduction",
  "color",
  "color-neutral",
  "color-blue",
  "typography",
  "type-desktop",
  "type-mobile",
  "spacing",
  "icons",
  "graphics",
  "components",
];
