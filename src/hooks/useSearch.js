import { useCallback, useEffect, useMemo, useState } from "react";
import { NAV } from "../data/navigation.js";
import { PALETTE, paletteTokens } from "../data/palette.js";
import { TYPE_SCALE } from "../data/typeScale.js";
import { SPACING } from "../data/spacing.js";
import { ICON_CATEGORIES } from "../data/icons.js";
import { GRAPHICS } from "../data/graphics.js";
import { PATTERNS } from "../data/patterns.js";

// Builds a flat, searchable index spanning every part of the system: nav
// sections, color/type/spacing tokens, icons, and graphics. Computed once.
function buildSearchIndex() {
  const idx = [];

  NAV.forEach((group) =>
    group.items.forEach((it) => {
      // A `toggleOnly` item (the Components category headers — Actions, Inputs,
      // ...) is a pure dropdown with nothing of its own to jump to, so it's left
      // out of the index; its children are indexed below same as any other sub.
      if (it.component) {
        idx.push({ label: it.label, kind: "Component", target: "components", setComponent: it.component });
      } else if (!it.toggleOnly) {
        idx.push({ label: it.label, kind: "Section", target: it.id });
      }
      // Foundations sub-items are scroll targets; component sub-items are variants
      // of the one playground canvas, so they resolve to a component plus the
      // variant to open it on — their ids aren't anywhere to scroll to.
      (it.sub || []).forEach((s) =>
        idx.push(
          s.component
            ? {
                // Only disambiguate with the component name when the label
                // doesn't already say it — a plain leaf like Button or Tabs
                // has label === component, so prefixing would just repeat it.
                label: s.label === s.component ? s.label : `${s.component} · ${s.label}`,
                kind: "Component",
                target: "components",
                setComponent: s.component,
                setVariant: s.variant,
              }
            : { label: s.label, kind: "Section", target: s.id }
        )
      );
    })
  );

  ["neutral", "blue", "semantic"].forEach((g) =>
    paletteTokens(PALETTE[g]).forEach((t) =>
      idx.push({ label: t.name, kind: "Color", sub: `#${t.hex.toUpperCase()}`, target: `color-${g}` })
    )
  );

  ["desktop", "mobile"].forEach((bp) =>
    TYPE_SCALE[bp].forEach((t) =>
      idx.push({ label: t.name, kind: "Type", sub: `${t.size}/${t.lh}`, target: `type-${bp}` })
    )
  );

  SPACING.forEach((t) => idx.push({ label: t.name, kind: "Spacing", sub: `${t.value}px`, target: "spacing" }));

  ICON_CATEGORIES.forEach((cat) =>
    cat.icons.forEach((ic) =>
      idx.push({ label: ic.name, kind: "Icon", sub: cat.name, keywords: ic.keywords, target: "icons" })
    )
  );

  GRAPHICS.forEach((gr) => idx.push({ label: gr.label, kind: "Graphic", target: "graphics" }));

  PATTERNS.forEach((p) =>
    idx.push({ label: p.name, kind: "Pattern", target: "patterns", setPattern: p.id })
  );

  return idx;
}

// Command-palette search: owns the query, open state, ⌘K/Esc shortcut, and the
// filtered results. `onRun` is invoked with the chosen result so the caller can
// navigate and (optionally) select a component or pattern — both sections show
// one canvas at a time, so scrolling to them isn't enough on its own.
export function useSearch(onRun) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const index = useMemo(buildSearchIndex, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // Curated suggestions across the whole system when nothing is typed.
      const find = (kind, label) => index.find((e) => e.kind === kind && e.label === label);
      return [
        find("Color", "NewBlue") || find("Color", "blue-100"),
        find("Type", "H1"),
        find("Spacing", "space-16"),
        find("Icon", "Calendar"),
        find("Graphic", "AI & Agentic"),
        find("Component", "Button"),
      ].filter(Boolean);
    }
    return index
      .filter(
        (e) =>
          e.label.toLowerCase().includes(q) ||
          (e.keywords || "").toLowerCase().includes(q) ||
          (e.sub || "").toLowerCase().includes(q)
      )
      .slice(0, 40);
  }, [query, index]);

  const runResult = useCallback(
    (r) => {
      onRun(r);
      setOpen(false);
      setQuery("");
    },
    [onRun]
  );

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return { open, setOpen, query, setQuery, results, runResult };
}
