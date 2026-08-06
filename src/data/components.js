// Component-catalog data used by the interactive playground.

// The full list of components the design system documents. Drives both the
// sidebar "Components" group and the playground's prev/next cycling.
// Avatars is deliberately absent: it's being reworked, so it's out of the docs
// until there's a component to document.
export const COMPONENT_LIST = [
  "Accordion",
  "Button",
  "Card",
  "Checkbox",
  "Filter",
  "Input Field",
  "Link",
  "List Item",
  "Navigation Menu",
  "Search",
  "Tabs",
  "Tags",
  "Toggle",
];

// The Input Field is four controls under one name, and each of them documents
// the same four states. Both axes are shared: the types split the component in
// the nav panel, the states drive the playground's canvas pills.
//
// The states are exclusive on purpose — a control is focused or errored or
// disabled, and picking one from a strip is how you compare them. Combinations
// like an errored field taking focus still exist in CSS for real use.
export const FIELD_TYPES = ["Text", "Email", "Textarea", "Select"];
export const FIELD_STATES = ["Default", "Focus", "Error", "Disabled"];

// The Link's two states — Loka Figma "Link / Light" (node 30:2487). Resting text
// and a hover that reveals the marker dot; there's no third variant to document.
export const LINK_STATES = ["Default", "Hover"];

// The Checkbox's four states, in the order Figma lays its variants out. "Checked"
// is Figma's "Focused" under the name it actually describes — no focus ring is
// defined anywhere in the component, and the variant is the ticked control.
export const CHECKBOX_STATES = ["Default", "Hovered", "Checked", "Disabled"];

// Sample copy used by the Accordion preview.
export const FAQ_ITEMS = [
  {
    q: "What is the Loka Design System?",
    a: "It's the single source of truth for Loka's brand and product interface — the logo, color, typography, spacing, icons, graphics, and the components built on top of them. It keeps every surface consistent and on-brand.",
  },
  {
    q: "Who should use these guidelines?",
    a: "Designers, engineers, and anyone creating Loka-branded materials. Following the system ensures a cohesive experience across marketing and product without reinventing the basics each time.",
  },
  {
    q: "How are the tokens named?",
    a: "Tokens are value-based and self-documenting — for example, space-16 is 16px and IconCalendar is the calendar glyph. The name tells you what it is, so there's no lookup needed.",
  },
  {
    q: "Can I request new components or icons?",
    a: "Yes. The system is designed to grow — new icons slot into their category, and new components follow the same interactive documentation pattern you see here.",
  },
];

// Filter bar groups — Loka Figma "filter" (node 4866:24030). The leading count
// is part of the design: each option carries how many results match it.
//
// The copy is placeholder, and deliberately describes the control rather than
// standing in for a real catalogue — same as SELECT_GROUPS below and the FAQ
// above. This is a reference page, so reading the panel should teach how the
// filter behaves; industry names would only teach what Loka sells.
//
// Counts mix one and two digits on purpose: they sit in a fixed 22px column so
// the labels stay aligned across both, and an all-two-digit list would hide it.
export const FILTER_GROUPS = [
  {
    label: "Selecting",
    options: [
      { count: 12, label: "Pick one per group" },
      { count: 9, label: "Picking again clears it" },
      { count: 4, label: "Groups are independent" },
      { count: 17, label: "The bar hugs its chips" },
      { count: 8, label: "Chips keep their own width" },
    ],
  },
  {
    label: "Searching",
    options: [
      { count: 14, label: "The first row is an input" },
      { count: 6, label: "Type above to filter" },
      { count: 11, label: "No match shows a note" },
      { count: 3, label: "Closing clears the query" },
      { count: 20, label: "Escape closes the panel" },
    ],
  },
  {
    label: "Counts",
    options: [
      { count: 1, label: "Counts sit in a fixed column" },
      { count: 18, label: "One digit lines up with two" },
      { count: 7, label: "The label never shifts" },
      { count: 22, label: "The panel overlays the page" },
      { count: 5, label: "It never pushes content down" },
    ],
  },
];

// Labels for the Tabs bar — Loka Figma "service-icon-item" (node 4007:23097).
// Four is what the Figma bar carries.
//
// Placeholder copy, like the Filter's. The first slot is deliberately the long
// one: truncation is part of the item's spec, and in the 4-up bar — where each
// item gets a quarter of the row — it's the one that shows it. It reads in full
// in the "Item" view, which is correct rather than a gap: that view pins the
// item to the 345px share it gets in the real bar, so a label that truncated
// even there would misrepresent what fits.
export const TABS = ["A tab label that ellipsizes", "Second tab", "Third tab", "Fourth tab"];

// Grouped options for the multi-select dropdown documented under "Input Field".
// Mirrors the Loka Figma "Dropdown" component (node 6916:50169), including its
// three-selection ceiling.
//
// The options deliberately describe the control rather than carrying real
// content: this is a reference page, so reading the list should teach how the
// dropdown behaves. Kept short so the tags stay legible and grouping still
// shows — enough rows that the list scrolls, without a catalogue to wade through.
export const SELECT_MAX = 3;

export const SELECT_GROUPS = [
  {
    label: "Selecting",
    options: ["Pick up to three", "Checked rows are chosen", "Choices collect as tags"],
  },
  {
    label: "Searching",
    options: ["Type above to filter", "Groups hide when empty", "No match shows a note"],
  },
  {
    label: "Limits",
    options: ["The third pick locks the rest", "Untick a row to free one up", "Tags clear with the \u00d7"],
  },
];
