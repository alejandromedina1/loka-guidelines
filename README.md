# Loka Design System

An interactive documentation site for Loka's brand and product interface — logo,
color, typography, spacing, icons, graphics, and the components built on top of
them. Built with **React 18** and **Vite**.

## Getting started

```bash
npm install
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # production build to dist/
npm run preview  # preview the production build
```

## Project structure

The app was refactored from a single 1,600-line file into small, focused
modules. Responsibilities are separated into **data**, **utils**, **hooks**, and
**components** (further grouped by feature).

```
src/
├── main.jsx                    # React entry point; imports global styles
├── App.jsx                     # Top-level composition + global state
│
├── data/                       # Static content, decoupled from the UI
│   ├── palette.js              #   PALETTE — color tokens
│   ├── typeScale.js            #   TYPE_SCALE — desktop/mobile type tokens
│   ├── spacing.js              #   SPACING — 4px-based spacing tokens
│   ├── icons.js                #   ICON_CATEGORIES — inline-SVG icon library
│   ├── graphics.js             #   GRAPHICS — isometric spot illustrations
│   ├── components.js           #   COMPONENT_LIST, AVATARS, FAQ_ITEMS
│   └── navigation.js           #   NAV model + scroll-spy target ids
│
├── utils/
│   └── color.js                # Hex/RGB/HSL conversion, WCAG contrast, var names
│
├── hooks/
│   ├── useCopy.js              # Copy-to-clipboard with transient "copied" state
│   ├── useScrollSpy.js         # Tracks the in-view section; smooth-scroll helpers
│   └── useSearch.js            # ⌘K command palette: index, filtering, shortcuts
│
└── components/
    ├── common/                 # Cross-cutting UI: LokaLogo, CopyValue,
    │                           #   SectionHead, and the shared Icon glyph set
    ├── color/                  # Swatch, ColorGroup
    ├── typography/             # TypeRow, TypeScale
    ├── spacing/                # SpacingScale
    ├── icons/                  # IconGallery
    ├── graphics/               # GraphicsGallery
    ├── playground/             # Interactive component explorer
    │   ├── ComponentPlayground.jsx
    │   ├── buttonStyles.js      #   Pure styling logic for the Button preview
    │   ├── controls/            #   PgSelect, PgToggle
    │   └── previews/            #   ButtonPreview, AccordionPreview, TabsPreview
    ├── layout/                 # TopBar, Sidebar, SearchOverlay + SearchFab
    └── sections/               # One component per documentation section
        ├── IntroSection.jsx
        ├── ColorSection.jsx
        ├── TypographySection.jsx
        ├── SpacingSection.jsx
        ├── IconsSection.jsx
        ├── GraphicsSection.jsx
        └── ComponentsSection.jsx

styles/global.css               # The full stylesheet (extracted from the source)
```

## Design principles applied

- **Single responsibility** — every component, hook, and data module does one
  thing. Presentational components are separated from stateful orchestration.
- **Data / logic / view separation** — token data lives in `data/`, math and
  formatting in `utils/`, stateful behavior in `hooks/`, and rendering in
  `components/`.
- **No duplicated markup** — repeated inline SVGs were consolidated into a
  single reusable `Icon` glyph set.
- **Self-documenting names** — files and exports are named for what they hold.

> **Note:** the original monolithic `loka-design-system.jsx` is left at the
> repository root for reference. It is no longer imported anywhere and can be
> deleted once you're happy with the rebuild.
