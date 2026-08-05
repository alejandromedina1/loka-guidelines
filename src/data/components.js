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
// Figma only fills in the Industries list; the other two are written to match
// its shape so all three chips open onto something real.
export const FILTER_GROUPS = [
  {
    label: "Industries",
    options: [
      { count: 12, label: "Healthcare" },
      { count: 9, label: "Fintech" },
      { count: 12, label: "Saas & ISVs" },
      { count: 7, label: "AdTech & MarTech" },
      { count: 8, label: "Life Sciences" },
    ],
  },
  {
    label: "Solutions",
    options: [
      { count: 14, label: "Generative AI" },
      { count: 11, label: "Data Platforms" },
      { count: 8, label: "MLOps" },
      { count: 6, label: "Cloud Migration" },
      { count: 5, label: "Analytics" },
    ],
  },
  {
    label: "Tech stack",
    options: [
      { count: 18, label: "AWS" },
      { count: 10, label: "Databricks" },
      { count: 9, label: "Snowflake" },
      { count: 13, label: "Python" },
      { count: 4, label: "Terraform" },
    ],
  },
];

// Labels for the Tabs bar — Loka Figma "service-icon-item" (node 4007:23097),
// which the Industries section uses to switch what the block below it shows.
// Figma ships every slot filled with the same placeholder ("Healthcare
// Provider"), so the rest come from the industry vocabulary the Filter and
// Checkbox previews already use. Four is what the Figma bar carries, and the
// longest label is deliberately long enough to ellipsize at narrow widths —
// that truncation is part of the item's spec.
export const TABS = ["Healthcare Provider", "Fintech", "Life Sciences", "SaaS & ISVs"];

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
