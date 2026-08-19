// Component-catalog data used by the interactive playground.

// The full list of components the design system documents. Drives the
// playground's prev/next cycling and the name shown on its canvas; the
// sidebar groups these into categories (see COMPONENT_CATEGORIES in
// navigation.js) rather than reading this list directly.
export const COMPONENT_LIST = [
  // Actions
  "Button",
  "Link",
  "Floating Action Button",
  // Inputs
  "Input Field",
  "Search Input",
  "Input Dropdown",
  "Checkbox",
  "Radio Button",
  "Toggle Switch",
  "Slider",
  "Date Picker",
  "Time Picker",
  "File Upload",
  "Filter",
  // Feedback
  "Alert",
  "Banner",
  "Toast",
  "Progress Bar",
  "Spinner",
  "Empty State",
  // Navigation
  "Navbar",
  "Sidebar",
  "Breadcrumb",
  "Tabs",
  "Pagination",
  "Menu",
  // Overlays
  "Modal",
  "Dialog",
  "Drawer",
  "Popover",
  "Tooltip",
  "Bottom Sheet",
  // Data Display
  "Avatar",
  "Accordion",
  "Card",
  "Tags",
  "List Item",
];

// The Input Field is three controls under one name, and each of them documents
// the same four states. Both axes are shared: the types split the component in
// the nav panel, the states drive the playground's canvas pills. Select used
// to be a fourth type here; the search-and-select control it embedded now
// documents itself as its own Dropdown component instead.
//
// The states are exclusive on purpose — a control is focused or errored or
// disabled, and picking one from a strip is how you compare them. Combinations
// like an errored field taking focus still exist in CSS for real use.
export const FIELD_TYPES = ["Text", "Email", "Textarea"];
export const FIELD_STATES = ["Default", "Focus", "Error", "Disabled"];

// The Search Input's own four states. Shares the Input Field family's box —
// same height, radius, border and fill — rather than inventing a second one,
// but swaps Error for Filled: a search query doesn't really fail validation
// the way a form field does, while "there's a query, so the clear button is
// showing" is a real, distinct configuration worth documenting on its own.
export const SEARCH_INPUT_STATES = ["Default", "Focus", "Filled", "Disabled"];

// The Avatar's two content variants: a real photo, or the Loka Figma
// "Avatar/Initials" component set (node 147:36) for when there isn't one.
// Image first — it's the ideal case, Initials the deliberate fallback.
export const AVATAR_VARIANTS = ["Image", "Initials"];

// Initials' six background/text pairs, on Figma's own "Property 1" axis;
// order matches the set's left-to-right layout on the canvas, Blue first
// since that's Figma's own default. A photo already disambiguates one person
// from another, so this range only applies to the Initials variant.
export const AVATAR_COLORS = ["Blue", "Green", "Orange", "Purple", "Pink", "Yellow"];

// The literal fill/text hex for each color — not palette tokens, since none
// of these pastel/ink pairs exist in the published Color scales. Shared
// between the live preview and the properties panel's color picker, so
// neither can list a swatch the other doesn't render.
export const AVATAR_SWATCHES = {
  Blue: { bg: "#9DB8FF", text: "#00154D" },
  Green: { bg: "#9EE0C9", text: "#133A2C" },
  Orange: { bg: "#F5C4A6", text: "#451F08" },
  Purple: { bg: "#C9B6F0", text: "#1E0D3F" },
  Pink: { bg: "#F3B4C8", text: "#420B1C" },
  Yellow: { bg: "#F5DCA0", text: "#453307" },
};

// Six preset sizes, not a freeform number — every place the system places an
// avatar is one of these. 32px is Figma's own sourced size; the rest extend
// the same square, no-radius box up and down rather than inventing a second
// shape convention for them.
export const AVATAR_SIZES = ["24px", "32px", "40px", "48px", "54px", "64px"];

// The Card component's two layouts — Loka Figma "CardGraphic" (node 147:307)
// and "CardImage" (node 147:324). Both share one hover interaction and one
// action row; Graphic first since it's the one this system built first.
export const CARD_VARIANTS = ["Graphic", "Image"];

// The Tooltip's two triggers — Loka Figma "Tooltip" (node 150:473) is the
// Toolbar; Icon is this system's own addition for a single info glyph whose
// tooltip carries a full sentence instead of a one-word label. Toolbar first
// since it's the one this system built first.
export const TOOLTIP_VARIANTS = ["Toolbar", "Icon"];

// The Tags component's three preset heights — Loka Figma "20 / tag" (node
// 149:412) measures 24px despite its own layer name; that's the one sourced
// size, so it's the middle value here. 20 and 28 extend the same bordered box
// up and down, the same relationship the Avatar's size range has to its own
// sourced 32px.
export const TAG_SIZES = ["20px", "24px", "28px"];

// The Input Dropdown component documents the search-and-select control on its
// own, split by how many rows it can hold at once — the same split as
// SELECT_GROUPS below. It used to be embedded as the Input Field's Select
// type too; this is now the only place it lives, so the ceiling, tags, and
// three-selection limit have one home rather than two.
export const DROPDOWN_VARIANTS = ["Multi-select", "Single-select"];

// The Filter bar's two selection modes — how many active picks the bar allows
// at once, not per group. Multiple select is the bar's original behavior:
// every group keeps its own pick, independent of the rest. Single select is
// stricter — one active pick bar-wide, so picking in a group clears whatever
// was picked in every other — the same relationship as the Dropdown's own
// Multi-/Single-select split above.
export const FILTER_VARIANTS = ["Multiple select", "Single select"];

// The Date Picker's two selection models — how many dates the control commits
// to, the same axis the Dropdown's Multi-/Single-select split draws. Single
// date closes on the pick; Date range keeps the panel open after the first
// endpoint and closes on the second. No sourced Figma node for this one: the
// trigger is the Input Field family's box and the panel is the Dropdown's own,
// so there's nothing here that isn't already published somewhere else.
export const DATE_PICKER_VARIANTS = ["Single date", "Date range"];

// The Link's two states — Loka Figma "Link / Light" (node 30:2487). Resting text
// and a hover that reveals the marker dot; there's no third variant to document.
export const LINK_STATES = ["Default", "Hover"];

// The Checkbox's four states, in the order Figma lays its variants out. "Checked"
// is Figma's "Focused" under the name it actually describes — no focus ring is
// defined anywhere in the component, and the variant is the ticked control.
export const CHECKBOX_STATES = ["Default", "Hovered", "Checked", "Disabled"];

// The Checkbox's control shape — Rounded is the sourced Figma component (node
// 3692:15296), a full circle. Squared is this system's own addition for
// interfaces that read better with corners; it isn't in the design file, so
// it's a toggle in the properties panel rather than a canvas state pill next
// to the other four, which are.
export const CHECKBOX_SHAPES = ["Rounded", "Squared"];

// The Checkbox's own size scale — none of these three is the sourced Figma
// control either (that one measures 16px). This system's own scale exists for
// contexts where a bigger, more tappable target matters more than matching
// the Figma render exactly; 28px, the middle step, is the default. Lives in
// the properties panel for the same reason Shape does — it's this system's
// own axis, not one of the four sourced states.
export const CHECKBOX_SIZES = ["24px", "28px", "32px"];

// The Radio Button's own four states — same shape as the Checkbox's, since it's
// the same box/pill/label anatomy with a dot standing in for the tick. There's
// no sourced Figma node for this one yet, so the states and dimensions mirror
// the Checkbox's rather than a design file's own variant list.
export const RADIO_STATES = ["Default", "Hovered", "Selected", "Disabled"];

// The Toggle Switch's own four states — same slots as the Checkbox's and the
// Radio Button's (rest, hover, active, disabled), named for what a switch
// actually does rather than reusing "Checked"/"Selected". No sourced Figma
// node for this one either, and unlike the other two it isn't wrapped in
// their pill — this is the bare track and knob, no label.
export const TOGGLE_SWITCH_STATES = ["Off", "Hovered", "On", "Disabled"];

// The Spinner's three sizes. No sourced Figma node for this one; it's a
// size-only axis like the Tags' own scale, not a state — the control never
// stops moving, so there's nothing to switch on the canvas the way the
// Checkbox's or the Toggle Switch's pills do. Medium is the default, the same
// middle-of-the-scale choice the Tags' own sourced size makes.
export const SPINNER_SIZES = ["Small", "Medium", "Large"];

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
    a: "Tokens are value-based and self-documenting — for example, space-16 is 16px and Calendar is the calendar glyph. The name tells you what it is, so there's no lookup needed.",
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

// Grouped options for the search-and-select dropdown — Loka Figma "Dropdown"
// component. Multi mode carries the "Opened" variant's real content (node
// 11:2264): five of Loka's own service categories, four offerings each — the
// exact catalogue the design documents, not stand-in copy. Single mode keeps
// instructional rows instead: there's no single-select "Opened" reference to
// match.
export const SELECT_MAX = 3;

export const SELECT_GROUPS = {
  multi: [
    {
      label: "AI & Agentic",
      options: [
        "AI, ML or Agentic Assessment",
        "AIdeation Workshop",
        "AI Production Accelerator",
        "Other AI & Agentic",
      ],
    },
    {
      label: "Migration & Modernization",
      options: [
        "Claude or OpenAI Migration",
        "Cloud-to-Cloud Migration",
        "Legacy Migration & Modernization",
        "Other Migrations & Modernizations",
      ],
    },
    {
      label: "Data & Analytics",
      options: [
        "AI-Ready Data & Governance",
        "Data Strategy & Discovery",
        "Data Engineering & Infrastructure",
        "Other Data & Analytics",
      ],
    },
    {
      label: "Security & Compliance",
      options: [
        "AI Governance & Safety",
        "Cloud Infrastructure Security",
        "Compliance Programs",
        "Other Security & Compliance",
      ],
    },
    {
      label: "Product Design & Development",
      options: [
        "Design Sprint",
        "AI Feature Integration",
        "Full Mobile & Web Development",
        "Other Product Design and Development",
      ],
    },
  ],
};

// Single-select's demo rows, flat rather than grouped — one value doesn't need
// categories to sort through, so there's no eyebrow label and no divider
// between rows, just the list. Same instructional copy the old two groups
// carried, merged into one.
export const SELECT_SINGLE_OPTIONS = [
  "Pick one to fill the field",
  "Picking again swaps it",
  "Closes the list on pick",
  "Type above to filter",
  "Groups hide when empty",
  "No match shows a note",
];
