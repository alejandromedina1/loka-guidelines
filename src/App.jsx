import { useCallback, useState } from "react";
import { useCopy } from "./hooks/useCopy.js";
import { useScrollSpy } from "./hooks/useScrollSpy.js";
import { useSearch } from "./hooks/useSearch.js";
import { TopBar } from "./components/layout/TopBar.jsx";
import { Sidebar } from "./components/layout/Sidebar.jsx";
import { SearchOverlay, SearchFab } from "./components/layout/SearchOverlay.jsx";
import { IntroSection } from "./components/sections/IntroSection.jsx";
import { FigmaLibrarySection } from "./components/sections/FigmaLibrarySection.jsx";
import { ColorSection } from "./components/sections/ColorSection.jsx";
import { TypographySection } from "./components/sections/TypographySection.jsx";
import { SpacingSection } from "./components/sections/SpacingSection.jsx";
import { IconsSection } from "./components/sections/IconsSection.jsx";
import { GraphicsSection } from "./components/sections/GraphicsSection.jsx";
import { PatternsSection } from "./components/sections/PatternsSection.jsx";
import { ComponentsSection } from "./components/sections/ComponentsSection.jsx";

// Maps a possibly-nested active section id to the top-level nav id, so a parent
// nav item stays highlighted while one of its sub-sections is in view.
function toActiveTop(active) {
  if (["color", "color-neutral", "color-blue"].includes(active)) return "color";
  if (["typography", "type-desktop", "type-mobile"].includes(active)) return "typography";
  return active;
}

// Top-level composition: global state (theme, mobile nav, selected component,
// expanded type row) wired to the layout chrome and documentation sections.
export default function App() {
  const { copied, copy } = useCopy();
  const { active, registerRef, scrollTo } = useScrollSpy();

  const [theme, setTheme] = useState("light");
  const [mobileNav, setMobileNav] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState("Button");
  // Which Input Field type is on the canvas. It lives up here rather than in the
  // playground because the nav panel picks it — the component's four types are
  // sidebar entries, not a control inside the canvas.
  const [fieldType, setFieldType] = useState("Text");
  const [selectedPattern, setSelectedPattern] = useState("dot-grid");
  const [expandedRow, setExpandedRow] = useState(null);

  const toggleRow = useCallback((id) => setExpandedRow((c) => (c === id ? null : id)), []);

  // Navigate to a section and always close the mobile nav drawer.
  const navigate = useCallback(
    (id) => {
      scrollTo(id);
      setMobileNav(false);
    },
    [scrollTo]
  );

  // `variant` comes from the nav's component sub-items; without one the
  // component keeps whatever variant it was last showing.
  const selectComponent = useCallback(
    (name, variant) => {
      setSelectedComponent(name);
      if (variant) setFieldType(variant);
      navigate("components");
    },
    [navigate]
  );

  const runSearchResult = useCallback(
    (r) => {
      if (r.setComponent) setSelectedComponent(r.setComponent);
      if (r.setVariant) setFieldType(r.setVariant);
      if (r.setPattern) setSelectedPattern(r.setPattern);
      navigate(r.target);
    },
    [navigate]
  );

  const search = useSearch(runSearchResult);

  return (
    <div className="app" data-theme={theme}>
      <TopBar theme={theme} setTheme={setTheme} onToggleNav={() => setMobileNav((v) => !v)} />

      {active !== "introduction" && <SearchFab onOpen={() => search.setOpen(true)} />}

      {search.open && (
        <SearchOverlay
          query={search.query}
          setQuery={search.setQuery}
          results={search.results}
          onRun={search.runResult}
          onClose={() => search.setOpen(false)}
        />
      )}

      <div className="shell">
        <Sidebar
          active={active}
          activeTop={toActiveTop(active)}
          selectedComponent={selectedComponent}
          componentVariant={fieldType}
          onSelectComponent={selectComponent}
          onNavigate={navigate}
          open={mobileNav}
        />

        {mobileNav && <div className="scrim" onClick={() => setMobileNav(false)} />}

        <main className="content">
          <IntroSection registerRef={registerRef} copied={copied} onCopy={copy} onNavigate={navigate} />
          <FigmaLibrarySection registerRef={registerRef} />
          <ColorSection registerRef={registerRef} copied={copied} onCopy={copy} />
          <TypographySection
            registerRef={registerRef}
            copied={copied}
            onCopy={copy}
            expandedRow={expandedRow}
            onToggleRow={toggleRow}
          />
          <SpacingSection registerRef={registerRef} copied={copied} onCopy={copy} />
          <IconsSection registerRef={registerRef} copied={copied} onCopy={copy} />
          <GraphicsSection registerRef={registerRef} />
          <PatternsSection
            registerRef={registerRef}
            copied={copied}
            onCopy={copy}
            theme={theme}
            selectedPattern={selectedPattern}
            setSelectedPattern={setSelectedPattern}
          />
          <ComponentsSection
            registerRef={registerRef}
            copied={copied}
            onCopy={copy}
            selectedComponent={selectedComponent}
            setSelectedComponent={setSelectedComponent}
            fieldType={fieldType}
            theme={theme}
          />
        </main>
      </div>
    </div>
  );
}
