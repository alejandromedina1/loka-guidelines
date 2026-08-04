// Component-catalog data used by the interactive playground.

// The full list of components the design system documents. Drives both the
// sidebar "Components" group and the playground's prev/next cycling.
export const COMPONENT_LIST = [
  "Accordion",
  "Avatars",
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

// Sample people used by the Avatars preview.
export const AVATARS = [
  { name: "Ava Reyes", initials: "AR", color: "#1957F4" },
  { name: "Marcus Lin", initials: "ML", color: "#0FA47A" },
  { name: "Priya Nair", initials: "PN", color: "#E0602F" },
  { name: "Tomás Ruiz", initials: "TR", color: "#7C4DE0" },
  { name: "Jade Okoro", initials: "JO", color: "#D4396B" },
];

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
