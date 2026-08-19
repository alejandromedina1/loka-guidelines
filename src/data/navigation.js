// Navigation model — mirrors the documentation page architecture.

import { FIELD_TYPES } from "./components.js";

// Turns a component name into its section id, e.g. "Input Field" -> "component-input-field".
export const componentId = (name) =>
  `component-${name.toLowerCase().replace(/\s+/g, "-")}`;

// The Components group is organized into categories in the sidebar (Actions,
// Inputs, Feedback, Navigation, Overlays, Data Display) rather than as one
// flat list. Each category is a pure dropdown — clicking its row only
// expands/collapses it; there's no section for "Actions" itself to scroll
// to, unlike Color or Typography in Foundations.
//
// A leaf is a real, catalogued component: `component` (+ `variant` if it's
// one of several the same component documents, e.g. Input Field's
// Text/Textarea. Input Dropdown's own Single-/Multi-select modes and
// Filter's own Multiple select/Single select modes are both toggles on
// their own canvas instead of separate leaves — one "Input Dropdown" entry
// and one "Filter" entry here, not two apiece. Every leaf is clickable — components without
// a built preview yet (most of Feedback, Overlays, and a few of Inputs and
// Navigation) still open the Components section and show its "Live preview
// coming soon" fallback rather than doing nothing, so the taxonomy is
// browsable end to end even before every page exists.
export const COMPONENT_CATEGORIES = [
  {
    id: "cat-actions",
    label: "Actions",
    sub: [
      { id: componentId("Button"), label: "Button", component: "Button" },
      { id: componentId("Link"), label: "Link", component: "Link" },
      {
        id: componentId("Floating Action Button"),
        label: "Floating Action Button",
        component: "Floating Action Button",
      },
    ],
  },
  {
    id: "cat-inputs",
    label: "Inputs",
    sub: [
      {
        id: `${componentId("Input Field")}-text`,
        label: "Text Input",
        component: "Input Field",
        variant: FIELD_TYPES[0], // "Text"
      },
      {
        id: `${componentId("Input Field")}-textarea`,
        label: "Text Area",
        component: "Input Field",
        variant: FIELD_TYPES[2], // "Textarea"
      },
      { id: componentId("Search Input"), label: "Search Input", component: "Search Input" },
      { id: componentId("Input Dropdown"), label: "Input Dropdown", component: "Input Dropdown" },
      { id: componentId("Checkbox"), label: "Checkbox", component: "Checkbox" },
      { id: componentId("Radio Button"), label: "Radio Button", component: "Radio Button" },
      { id: componentId("Toggle Switch"), label: "Toggle Switch", component: "Toggle Switch" },
      { id: componentId("Slider"), label: "Slider", component: "Slider" },
      { id: componentId("Date Picker"), label: "Date Picker", component: "Date Picker" },
      { id: componentId("Time Picker"), label: "Time Picker", component: "Time Picker" },
      { id: componentId("File Upload"), label: "File Upload", component: "File Upload" },
      { id: componentId("Filter"), label: "Filter", component: "Filter" },
    ],
  },
  {
    id: "cat-feedback",
    label: "Feedback",
    sub: [
      { id: componentId("Alert"), label: "Alert", component: "Alert" },
      { id: componentId("Banner"), label: "Banner", component: "Banner" },
      { id: componentId("Toast"), label: "Toast", component: "Toast" },
      { id: componentId("Progress Bar"), label: "Progress Bar", component: "Progress Bar" },
      { id: componentId("Spinner"), label: "Spinner", component: "Spinner" },
      { id: componentId("Empty State"), label: "Empty State", component: "Empty State" },
    ],
  },
  {
    id: "cat-navigation",
    label: "Navigation",
    sub: [
      { id: componentId("Navbar"), label: "Navbar", component: "Navbar" },
      { id: componentId("Sidebar"), label: "Sidebar", component: "Sidebar" },
      { id: componentId("Breadcrumb"), label: "Breadcrumb", component: "Breadcrumb" },
      { id: componentId("Tabs"), label: "Tabs", component: "Tabs" },
      { id: componentId("Pagination"), label: "Pagination", component: "Pagination" },
      { id: componentId("Menu"), label: "Menu", component: "Menu" },
    ],
  },
  {
    id: "cat-overlays",
    label: "Overlays",
    sub: [
      { id: componentId("Modal"), label: "Modal", component: "Modal" },
      { id: componentId("Dialog"), label: "Dialog", component: "Dialog" },
      { id: componentId("Drawer"), label: "Drawer", component: "Drawer" },
      { id: componentId("Popover"), label: "Popover", component: "Popover" },
      { id: componentId("Tooltip"), label: "Tooltip", component: "Tooltip" },
      { id: componentId("Bottom Sheet"), label: "Bottom Sheet", component: "Bottom Sheet" },
    ],
  },
  {
    id: "cat-data-display",
    label: "Data Display",
    sub: [
      { id: componentId("Avatar"), label: "Avatar", component: "Avatar" },
      { id: componentId("Accordion"), label: "Accordion", component: "Accordion" },
      { id: componentId("Card"), label: "Card", component: "Card" },
      { id: componentId("Tags"), label: "Tags", component: "Tags" },
      { id: componentId("List Item"), label: "List Item", component: "List Item" },
    ],
  },
];

// The system splits into two hubs, and the landing page is the choice between
// them: Brand Hub is the foundations — the raw material every surface is built
// out of — and Product Hub is the component library built on top of it. The
// split is navigational, not just visual: entering a hub swaps the sidebar for
// that hub's list alone, so a designer working on brand never scrolls past
// forty components to reach the color ramps, and an engineer building a form
// never scrolls past the logo rules to reach the Input Field.

// The three nav groups, each defined once. GETTING_STARTED belongs to the
// landing rather than to either hub — the introduction is where the hubs are
// chosen from, so it can't live inside one of them.
const GETTING_STARTED = {
  group: "Getting started",
  items: [
    { id: "introduction", label: "Introduction" },
    { id: "figma-library", label: "Figma library" },
  ],
};

const FOUNDATIONS = {
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
};

const COMPONENTS = {
  group: "Components",
  items: COMPONENT_CATEGORIES.map((cat) => ({
    id: cat.id,
    label: cat.label,
    toggleOnly: true,
    sub: cat.sub,
  })),
};

export const HUBS = [
  { id: "brand", label: "Brand Hub" },
  { id: "product", label: "Product Hub" },
];

// Every group, in document order. This is the search index's source — search
// spans the whole system regardless of which hub is open, so it can't be built
// from one hub's slice.
export const NAV = [GETTING_STARTED, FOUNDATIONS, COMPONENTS];

// What the sidebar renders inside a hub — that hub's list and nothing else. The
// landing has no sidebar at all, so GETTING_STARTED above is only in NAV, for
// the search index: "Figma library" is still findable, and still reachable by
// scrolling past the split.
export const HUB_NAV = {
  brand: [FOUNDATIONS],
  product: [COMPONENTS],
};

// Scroll-spy targets per hub, in document order. The Components hub is one
// section with a playground inside it rather than a run of scrollable sections,
// so it has exactly one.
export const HUB_SPY_IDS = {
  brand: [
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
  ],
  product: ["components"],
};

// The landing's own targets, and the union the scroll-spy hook walks — only one
// hub's sections are mounted at a time, and the hook skips ids it holds no
// element for, so one list covers every view.
const LANDING_SPY_IDS = ["introduction", "figma-library"];

export const SPY_IDS = [...LANDING_SPY_IDS, ...HUB_SPY_IDS.brand, ...HUB_SPY_IDS.product];

// Which hub owns a given scroll target, so a search result can enter the hub it
// lives in before scrolling to it — searching "Neutral" from the Product Hub
// has to cross over, and a target on the landing has to leave whichever hub is
// open. Derived from the groups above rather than hand-listed, so a section
// added to a hub can't be left out of it.
const HUB_BY_SECTION = new Map();
for (const [hub, groups] of Object.entries(HUB_NAV)) {
  for (const group of groups) {
    for (const item of group.items) {
      if (!item.toggleOnly) HUB_BY_SECTION.set(item.id, hub);
      for (const s of item.sub ?? []) if (!s.component) HUB_BY_SECTION.set(s.id, hub);
    }
  }
}
// The playground's own target isn't a nav id — every component leaf resolves to
// this one section — so it's mapped by hand.
HUB_BY_SECTION.set("components", "product");

// null for the landing's own sections, which sit outside both hubs.
export function hubForSection(id) {
  return HUB_BY_SECTION.get(id) ?? null;
}
