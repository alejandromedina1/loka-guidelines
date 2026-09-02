import { useCallback, useEffect, useState } from "react";
import { useCopy } from "./hooks/useCopy.js";
import { useScrollSpy } from "./hooks/useScrollSpy.js";
import { useSearch } from "./hooks/useSearch.js";
import { TopBar } from "./components/layout/TopBar.jsx";
import { Sidebar } from "./components/layout/Sidebar.jsx";
import { SearchOverlay } from "./components/layout/SearchOverlay.jsx";
import { IntroSection } from "./components/sections/IntroSection.jsx";
import { FigmaLibrarySection } from "./components/sections/FigmaLibrarySection.jsx";
import { LogoSection } from "./components/sections/LogoSection.jsx";
import { ColorSection } from "./components/sections/ColorSection.jsx";
import { TypographySection } from "./components/sections/TypographySection.jsx";
import { SpacingSection } from "./components/sections/SpacingSection.jsx";
import { IconsSection } from "./components/sections/IconsSection.jsx";
import { GraphicsSection } from "./components/sections/GraphicsSection.jsx";
import { PatternsSection } from "./components/sections/PatternsSection.jsx";
import { ImagerySection } from "./components/sections/ImagerySection.jsx";
import { ComponentsSection } from "./components/sections/ComponentsSection.jsx";
import { AiPrinciplesSection } from "./components/sections/AiPrinciplesSection.jsx";
import { AiPatternsSection } from "./components/sections/AiPatternsSection.jsx";
import { AiAntipatternsSection } from "./components/sections/AiAntipatternsSection.jsx";
import { hubForSection } from "./data/navigation.js";

// Which top-level nav item owns each sub-section. Hoisted to a module-level Map:
// this is read on every scroll-spy change, and building two arrays per call to
// scan them linearly is work that never varies.
const SUB_SECTION_PARENT = new Map([
  ["color", "color"],
  ["color-neutral", "color"],
  ["color-blue", "color"],
  ["color-semantic", "color"],
  ["typography", "typography"],
  ["type-desktop", "typography"],
  ["type-mobile", "typography"],
  ["imagery", "imagery"],
  ["imagery-styling", "imagery"],
  ["imagery-usage", "imagery"],
  ["imagery-project", "imagery"],
]);

// Maps a possibly-nested active section id to the top-level nav id, so a parent
// nav item stays highlighted while one of its sub-sections is in view.
function toActiveTop(active) {
  return SUB_SECTION_PARENT.get(active) ?? active;
}

// Which section is current when a view is scrolled to the top. Each hub mounts
// its own run of sections, so "the first one" differs per hub — see useScrollSpy.
const TOP_SECTION = { brand: "logo", product: "components", ai: "ai-patterns" };

// AI Patterns' three sections are exclusive views rather than a run you scroll
// through, so one of these is mounted at a time and the sidebar switches
// between them. Stacking them meant scrolling off the end of a pattern landed
// you in Anti-patterns, which then read as that pattern's anti-patterns instead
// of the hub's — the same misreading the hub split itself exists to prevent,
// one level down.
const AI_VIEWS = new Set(["ai-patterns", "ai-principles", "ai-antipatterns"]);

// Sentinel for "the top of this view" as a scroll destination — see pendingScroll.
const TOP = Symbol("top");

// Top-level composition: global state (theme, mobile nav, selected component,
// expanded type row) wired to the layout chrome and documentation sections.
export default function App() {
  const { copied, copy } = useCopy();

  // Which hub is open, or null for the landing. This is the app's coarsest piece
  // of state: it decides which sections are mounted and which list the sidebar
  // shows. The hubs are deliberately exclusive — the whole reason the landing
  // asks which one you want is so no audience has to scroll through another's
  // half to reach its own.
  const [hub, setHub] = useState(null);

  // Which of AI Patterns' three views is mounted. Only meaningful inside that
  // hub; it persists across visits, so leaving from Anti-patterns and coming
  // back returns you there.
  const [aiView, setAiView] = useState("ai-patterns");

  // What counts as current when the page is at the top. Inside AI Patterns that
  // has to be the mounted view rather than a fixed section, or the sidebar
  // highlights Patterns while you're looking at Anti-patterns.
  const topSection = hub === "ai" ? aiView : (TOP_SECTION[hub] ?? "introduction");

  const { active, registerRef, scrollTo } = useScrollSpy(topSection);

  const [theme, setTheme] = useState("light");
  const [mobileNav, setMobileNav] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState("Button");
  // Which variant of the selected component is on the canvas — the Input
  // Field's four types, the Dropdown's two modes. It lives up here rather than
  // in the playground because the nav panel picks it: those are sidebar
  // entries, not a control inside the canvas. Shared across components rather
  // than one state per component, since only one is ever on stage at a time.
  const [componentVariant, setComponentVariant] = useState("Text");
  const [selectedLogo, setSelectedLogo] = useState("wordmark");
  const [selectedPattern, setSelectedPattern] = useState("dot-grid");
  // AI Hub's canvas. Named apart from `selectedPattern` above, which is the
  // Brand Hub's background motif — two different things called "pattern" is the
  // one collision this system already had, and conflating them in state would
  // make it permanent. Opens on the first entry on the shelf, so the sidebar's
  // top category is the one expanded and the reader starts where the list does.
  const [selectedAiPattern, setSelectedAiPattern] = useState("prompt-composer");
  const [selectedImagery, setSelectedImagery] = useState("simple");
  const [selectedUsage, setSelectedUsage] = useState("gray-container");
  const [selectedProject, setSelectedProject] = useState("desktop");
  const [expandedRow, setExpandedRow] = useState(null);

  const toggleRow = useCallback((id) => setExpandedRow((c) => (c === id ? null : id)), []);

  // Where to land, queued until the hub that owns it has mounted. Crossing hubs
  // — a search result, or a component picked from anywhere — swaps the whole
  // section list, and scrolling to an element that doesn't exist yet is a no-op,
  // so the scroll waits for the commit that mounts it. Same-hub navigation goes
  // through here too rather than branching: the effect runs immediately after
  // that render either way.
  //
  // TOP is the other kind of destination: entering or leaving a hub replaces the
  // page under the reader, so the new view starts at its own top rather than
  // inheriting an offset measured against sections that aren't mounted any more.
  const [pendingScroll, setPendingScroll] = useState(null);

  useEffect(() => {
    if (!pendingScroll) return;
    if (pendingScroll === TOP) window.scrollTo({ top: 0 });
    else scrollTo(pendingScroll);
    setPendingScroll(null);
  }, [pendingScroll, scrollTo]);

  // Navigate to a section, entering (or leaving) whichever hub owns it, and
  // always close the mobile nav drawer.
  //
  // An AI view is a swap rather than a scroll: it replaces what's mounted, so
  // the new view starts at its own top the same way entering a hub does.
  const navigate = useCallback((id) => {
    setHub(hubForSection(id));
    if (AI_VIEWS.has(id)) {
      setAiView(id);
      setPendingScroll(TOP);
    } else {
      setPendingScroll(id);
    }
    setMobileNav(false);
  }, []);

  // Entering a hub from the landing tiles or the sidebar, and leaving it again.
  const enterHub = useCallback((id) => {
    setHub(id);
    setPendingScroll(TOP);
    setMobileNav(false);
  }, []);

  const leaveHub = useCallback(() => {
    setHub(null);
    setPendingScroll(TOP);
    setMobileNav(false);
  }, []);

  // `variant` comes from the nav's component sub-items; without one the
  // component keeps whatever variant it was last showing.
  const selectComponent = useCallback(
    (name, variant) => {
      setSelectedComponent(name);
      if (variant) setComponentVariant(variant);
      // Routed through navigate, so picking a component from the search overlay
      // while the Brand Hub is open enters the Product Hub on the way.
      navigate("components");
    },
    [navigate]
  );

  // Mirrors selectComponent: routed through navigate, so picking a pattern from
  // the search overlay or the index while another hub is open enters AI Hub on
  // the way rather than selecting something nobody can see.
  const selectAiPattern = useCallback(
    (id) => {
      setSelectedAiPattern(id);
      navigate("ai-patterns");
    },
    [navigate]
  );

  const runSearchResult = useCallback(
    (r) => {
      if (r.setComponent) setSelectedComponent(r.setComponent);
      if (r.setVariant) setComponentVariant(r.setVariant);
      if (r.setLogo) setSelectedLogo(r.setLogo);
      if (r.setPattern) setSelectedPattern(r.setPattern);
      if (r.setImagery) setSelectedImagery(r.setImagery);
      if (r.setUsage) setSelectedUsage(r.setUsage);
      if (r.setProject) setSelectedProject(r.setProject);
      if (r.setAiPattern) setSelectedAiPattern(r.setAiPattern);
      navigate(r.target);
    },
    [navigate]
  );

  const search = useSearch(runSearchResult);

  return (
    <div className="app" data-theme={theme}>
      <TopBar
        theme={theme}
        setTheme={setTheme}
        onToggleNav={() => setMobileNav((v) => !v)}
        showNav={hub !== null}
        onOpenSearch={() => search.setOpen(true)}
        onHome={leaveHub}
      />

      {search.open && (
        <SearchOverlay
          query={search.query}
          setQuery={search.setQuery}
          results={search.results}
          onRun={search.runResult}
          onClose={() => search.setOpen(false)}
        />
      )}

      {/* No sidebar on the landing: the two halves are the only way in, so a nav
          listing them a second time is a duplicate of the page itself. It
          appears on entering a hub, which is also the first moment there's
          anything for it to list. The shell drops to a single column without it,
          so the split gets the full width. */}
      <div className="shell" data-nonav={hub === null || undefined}>
        {hub !== null && (
          <Sidebar
            active={active}
            activeTop={toActiveTop(active)}
            hub={hub}
            onLeaveHub={leaveHub}
            selectedComponent={selectedComponent}
            componentVariant={componentVariant}
            onSelectComponent={selectComponent}
            selectedAiPattern={selectedAiPattern}
            onSelectAiPattern={selectAiPattern}
            onNavigate={navigate}
            open={mobileNav}
          />
        )}

        {mobileNav && hub !== null && <div className="scrim" onClick={() => setMobileNav(false)} />}

        {/* Each view mounts only its own sections. That's what makes the
            sidebar's filtered list honest: there is nothing below the fold from
            the other hub to scroll into, so the nav and the page can't disagree
            about what this view contains. */}
        <main className="content">
          {hub === null && (
            <>
              <IntroSection
                registerRef={registerRef}
                copied={copied}
                onCopy={copy}
                onEnterHub={enterHub}
              />
              <FigmaLibrarySection registerRef={registerRef} />
            </>
          )}

          {hub === "brand" && (
            <>
              <LogoSection
                registerRef={registerRef}
                copied={copied}
                onCopy={copy}
                selectedLogo={selectedLogo}
                setSelectedLogo={setSelectedLogo}
              />
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
              <ImagerySection
                registerRef={registerRef}
                copied={copied}
                onCopy={copy}
                selectedImagery={selectedImagery}
                setSelectedImagery={setSelectedImagery}
                selectedUsage={selectedUsage}
                setSelectedUsage={setSelectedUsage}
                selectedProject={selectedProject}
                setSelectedProject={setSelectedProject}
              />
            </>
          )}

          {hub === "product" && (
            <ComponentsSection
              registerRef={registerRef}
              copied={copied}
              onCopy={copy}
              selectedComponent={selectedComponent}
              setSelectedComponent={setSelectedComponent}
              componentVariant={componentVariant}
              setComponentVariant={setComponentVariant}
              theme={theme}
            />
          )}

          {/* One view at a time — see AI_VIEWS above. */}
          {hub === "ai" && aiView === "ai-patterns" && (
            <AiPatternsSection
              registerRef={registerRef}
              selectedAiPattern={selectedAiPattern}
              onSelectAiPattern={selectAiPattern}
              onSelectComponent={selectComponent}
            />
          )}

          {hub === "ai" && aiView === "ai-principles" && (
            <AiPrinciplesSection registerRef={registerRef} onSelectAiPattern={selectAiPattern} />
          )}

          {hub === "ai" && aiView === "ai-antipatterns" && (
            <AiAntipatternsSection registerRef={registerRef} />
          )}
        </main>
      </div>
    </div>
  );
}
