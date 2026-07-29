// Component-catalog data used by the interactive playground.

// The full list of components the design system documents. Drives both the
// sidebar "Components" group and the playground's prev/next cycling.
export const COMPONENT_LIST = [
  "Accordion",
  "Avatars",
  "Button",
  "Card",
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
