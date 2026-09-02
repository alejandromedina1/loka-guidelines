# Loka Guidelines — working notes

An interactive documentation site for Loka's brand and product interface. React 18 + Vite, no
test framework, no TypeScript. `npm run dev` / `npm run build`.

## Three hubs

The landing is a choice between three panels; entering one swaps the sidebar and mounts only that
hub's sections. The split is navigational, not decorative — nobody should scroll past another
audience's material to reach their own.

| Hub | Contains | Shape |
| --- | --- | --- |
| **Brand Hub** | Logo, Color, Typography, Spacing, Icons, Graphics, Patterns (background motifs), Imagery | A run of stacked sections |
| **Product Hub** | ~40 components | One section, one playground, sidebar swaps the canvas |
| **AI Patterns** | Pattern shelf + Principles + Anti-patterns | Three **exclusive views**, sidebar swaps which is mounted |

`src/data/navigation.js` is the single source for all of it — nav model, per-hub sidebar lists,
scroll-spy targets, and which hub owns a section. The search index (`useSearch.js`) is built from
the same model, so anything added to nav is findable.

## House vocabulary — reuse before inventing

Almost nothing in this project should need a new layout class. Check for an existing one first.

- **Sections**: `.section` > `SectionHead` (title + description, two columns)
- **Tiers**: `.sub-head`/`.sub-title` for nav sub-sections, `.group-head`/`.group-title`/`.group-desc`
  for groups inside one. `.section-eyebrow` for a small uppercase label.
- **Labs**: `.pg` = `minmax(0,1fr) 260px`. Left: `.pg-stage` > `.pg-canvas` > `.pg-canvas-nav`
  (state readout + `.pg-arrow` cycling) + `.pg-canvas-center` + `.pg-canvas-foot`
  (`.canvas-variants` pills + `.pg-viewcode`/`.pg-code-copy`). Right: `.pg-controls` >
  `.pg-ctrl-head` + control rows (`PgToggle`, `PgSelect`, `PgRange`) + `BestPracticesPanel`.
- **Empty state**: `.pg-empty` — the playground's own "not built yet", used by both hubs.
- `--radius: 0px` on containers; `999px` pills for chips.

Every hub's interactive surface is a `.pg` lab. If something new needs a layout, it probably wants
one of these.

## Component reuse

`src/components/common/` holds the real components: **Button**, **Field**, **Tag**. Both the
Product Hub playground and the AI Hub previews render them — there is exactly one implementation
each, and that is deliberate. `buttonStyles.js` still owns Button's styling because it also
generates the specs, rules and copyable snippets.

Anything that needs a control should import from `common/`, not draw its own. If the library
doesn't ship what's needed, say so rather than inventing it silently — that's how the
**Destructive** button variant came to exist (red-10/red-11 from the semantic ramp, AA-checked).

## AI Patterns hub

**Thesis: show more, tell less.** A pattern is a behaviour over time, not a rendered element, and
each one encodes a product-owned policy. That's why it's a pattern library and not a second
component library.

- `src/data/aiPatterns.js` — the taxonomy. 6 categories, 24 entries (14 documented), `status: documented | planned`.
  A documented entry carries: `definition`, `states[]` (each with a `note`),
  `useWhen`/`avoidWhen` as `{lead, detail}`, `decisions[]` with a `loka` default,
  `controls` graded on five axes, `composedOf` (must resolve against `COMPONENT_LIST`).
- `src/components/ai/previews/` — one preview per pattern, pure `({ state, ideal })`. `kit.jsx`
  is the shared wireframe kit; `index.js` is the registry.
- `src/components/ai/antipatterns/` — one wireframe per anti-pattern, same kit and ramp.
- `aiPrinciples.js` entries carry `applies: [patternId]`, rendered as chips that open the
  pattern. Documented patterns only — a chip landing on an empty canvas teaches the opposite.
- **The preview ramp** lives on `.mk-frame` in global.css: `--pv-title/body/meta/micro/gap/pad`
  plus `--pv-sys`, the one factor that scales Button/Field/Tag onto that ramp. A preview is an
  illustration of a screen, not a rendering of one. **Nothing inside a frame sets a literal size.**
- **The canvas is built to be watched.** A segmented **track** carries the lifecycle — filled up to
  where you are, only the current state named, so it never collapses however long the labels get —
  and **Play** sits bottom right as the primary gesture. Each state is keyed so it transitions in
  rather than snapping. Pills were tried and cut: they model alternatives, not a sequence, and five
  of them ran out of foot.

### Settled decisions — don't re-litigate

- Patterns are the core; Principles and Anti-patterns are supporting Reference views.
- The three AI views are exclusive. Stacked, anti-patterns read as *that pattern's* anti-patterns.
- The section heading is the pattern's name and its description is that pattern's definition —
  so neither appears in the properties panel.
- Lifecycle and Failure modes blocks were **cut**: the state pills and Play replaced the first,
  the failure states replaced the second, and the fork-shaped remainder became Decisions.
- Both hubs reveal the sidebar category holding whatever is on their canvas; that behaviour is
  shared, not AI-only.
- Two-column term/detail lists all run one rail: `190px 1fr`, `gap: 24px`.
- The panel holds only what changes the canvas or is a value the canvas can't draw. Its
  badge is **Grades**; the block below keeps the name **Control & trust**.
- Anti-patterns and Principles both lead with something to look at, not prose.
- A "Compare with what usually ships" control was tried twice and cut both times. Anti-patterns
  carries that argument with nine wireframes built for it; the playground is about behaviour
  over time and reads better for being about one thing.

## Verifying

There is no test runner. Render checks are written as JSX in the scratchpad and run through
esbuild + `react-dom/server`:

```
cp smokeN.jsx .smoke-tmp.jsx
./node_modules/.bin/esbuild .smoke-tmp.jsx --bundle --platform=node --format=cjs \
  --jsx=automatic --outfile=/tmp/out.cjs && node /tmp/out.cjs
rm -f .smoke-tmp.jsx
```

Two checks worth running after any CSS work, because the build passes while both are broken:

- every `className` used in the AI hub resolves to a rule in global.css
- no `ai-*` / `mk-*` rule is defined without a referent

Effects don't run under `renderToString`, so anything derived in a `useEffect` won't be visible to
a render test — and usually shouldn't be an effect anyway.

## Conventions

- **`dist/` is committed.** Building overwrites it. Restore it (`git checkout -- dist/`) unless
  publishing was asked for.
- Comments explain *why*, at the density of the surrounding file — this codebase comments heavily
  and the reasoning is the point.
- British-ish house voice in UI copy; em dashes are used freely.
