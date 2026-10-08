# Shared components — working notes

Loaded when working under `src/components/common/`.

## Four pills that are not each other

Figma has three components the eye reads as "a chip", and they were being confused:

| | Figma | Box | Case | States |
| --- | --- | --- | --- | --- |
| **Tags** | `20 / tag` (`149:412`) | 24px · r8 · bordered | UPPERCASE | none — it's a label |
| **Tabs** | `Tabs` (`389:367`) | 40px · r80 pill | Sentence | default / hover / active |
| **Services Tabs** | the 70px marker item | 70px · r12 in a blurred bar | Sentence | hover / active |
| **Number Chip** | `Number Chip` (`391:384`) | **32x20 / 26x16 fixed** · r500 | digits | none — it's a count |

`search_design_system` confirms `20 / tag` is the **only** tag component in the Loka library, so
Tags is correctly sourced — don't "fix" it toward the pill. The pill was added as **Tabs** and
what used to hold that name is now **Services Tabs**; Change Review's `composedOf: ["Tabs"]` was
always meaning the pill and now resolves to it.

**Number Chip has two sizes, and the second is derived, not chosen.** The sourced chip is
32x20 at 14px, so width is exactly `1.6 x height` and type is exactly `0.7 x height`. Holding
both at height 16 gives 26 and 11. **Any new step must hold both ratios** — no test recomputes
them now (`smoke24` did and is gone), so check both ratios by hand before adding a size. Use **20** beside a title (the
Icon Gallery's category name is 16px/600) and **16** beside an 11px uppercase eyebrow, where
14px type is louder than the label it belongs to — which is what the AI hub's four counts were
doing when the sourced size went in everywhere.

**Number Chip is fixed on both axes** — `width:32px`, never `min-width`. A row of counts only
lines up if every box is identical, so a number past three characters gets capped (`99+`) rather
than the box allowed to grow. It also resets `letter-spacing`, because it sits inside 11px
uppercase eyebrow labels that would otherwise track its digits apart. Three hand-rolled counts
were replaced by it: `.ico-group-count`, `.ai-when-count`, `.ai-parts-count` — all three rules
deleted. It's the first component bound to the **semantic** rungs (`color-bg-muted`,
`color-text-secondary`) rather than the `colors/neutral/*` primitives the older ones use; same
values today, but a theme pass moves the semantic rung and leaves the primitive alone.

**Tabs is the base selector.** Four places drew it by hand before it existed — the playground's
variant strip, the code panel's format strip, the AI hub's chips, and the Filter's toggle (which
already used `border-radius:80px`). The strips now share its state language at their own sizes:
importing 40px/16px into a 260px properties column would break the layout, the same reason AI
previews scale system components onto the `--pv-*` ramp. `.tab-pill` outlines with an **inset
shadow, never a border** — Figma's default has a 1px line and its hover has a fill and no line,
so a real border would shift the label a pixel on hover.
