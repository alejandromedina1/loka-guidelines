import { useState } from "react";
import { HUBS, HUB_NAV } from "../../data/navigation.js";
import { ArrowLeft, CaretRight } from "../common/Icon.jsx";

// The left navigation. It only exists inside a hub — the landing is the choice
// between the three, and the panels of that screen are the way in — so this lists
// one hub's sections and nothing else: the Brand Hub's foundations, the Product
// Hub's component categories, or the AI Hub's pattern shelf, never two at once.
// That's the point of the split: no audience scrolls through another's half to
// reach its own.
//
// Leaves come in three kinds and the difference is where they lead. A
// Foundations leaf is a place to scroll to. A component leaf puts a component on
// the playground canvas. A pattern leaf puts a pattern on the AI Hub's canvas.
// Only the first has a scroll target of its own; the other two share one section
// apiece, so "active" for them means "this is what's on stage".
export function Sidebar({
  active,
  activeTop,
  hub,
  onLeaveHub,
  selectedComponent,
  componentVariant,
  onSelectComponent,
  selectedAiPattern,
  onSelectAiPattern,
  onNavigate,
  open,
}) {
  const [expandedGroups, setExpandedGroups] = useState({ color: false, typography: false });

  // `undefined` means "nobody has touched this one", which is what lets a
  // category open itself when it holds the pattern on the canvas while still
  // obeying a reader who has explicitly opened or shut it. Toggling therefore
  // has to be told what the row is currently showing rather than reading the
  // map, since `!undefined` would close a group that looks open.
  const toggleGroup = (id, isOpen) => setExpandedGroups((g) => ({ ...g, [id]: !isOpen }));

  // One leaf row. Which of the three kinds it is decides both what "active"
  // means and where clicking it goes.
  //
  // A component leaf may also carry a `variant` — the Input Field's types. Most
  // leaves (Button, Tags, ...) don't, and for those being on that component is
  // enough, so the variant check is skipped rather than compared against
  // undefined.
  //
  // `planned` marks a pattern the taxonomy lists but the hub hasn't written up
  // yet. It stays clickable — the canvas has a state for it — and gets a muted
  // treatment so the shelf reads honestly about what's finished.
  const renderSub = (s) => {
    const isActive = s.component
      ? active === "components" &&
        selectedComponent === s.component &&
        (s.variant === undefined || componentVariant === s.variant)
      : s.aiPattern
        ? active === "ai-patterns" && selectedAiPattern === s.aiPattern
        : active === s.id;

    const handleClick = () => {
      if (s.component) onSelectComponent(s.component, s.variant);
      else if (s.aiPattern) onSelectAiPattern(s.aiPattern);
      else onNavigate(s.id);
    };

    return (
      <button
        key={s.id}
        className="nav-subitem"
        data-active={isActive}
        data-planned={s.planned || undefined}
        onClick={handleClick}
      >
        {s.label}
      </button>
    );
  };

  // One item row, whatever list it belongs to.
  const renderItem = (item) => {
    const hasSub = !!item.sub;
    const isComponent = !!item.component;
    // Whether this category holds whatever is currently on a canvas — a
    // pattern in AI Patterns, a component in Product. Both hubs put one thing
    // on stage and pick it from here, so both should reveal it; only the AI
    // side did, which meant the same interaction behaved differently depending
    // on which hub you were in.
    const holdsActiveLeaf = !!item.sub?.some(
      (leaf) =>
        (active === "ai-patterns" && leaf.aiPattern === selectedAiPattern) ||
        (active === "components" && leaf.component === selectedComponent),
    );

    // Every category ships collapsed, so entering a hub — or arriving from
    // search, or stepping with the canvas arrows — used to leave the sidebar
    // showing shut rows with the selection hidden inside one. The leaf already
    // knew it was active; nobody could see it.
    //
    // Derived here rather than set from an effect, so it's right on the first
    // paint instead of expanding a beat later.
    const groupOpen = expandedGroups[item.id] ?? holdsActiveLeaf;

    const isActiveTop = isComponent
      ? active === "components" && selectedComponent === item.component
      : holdsActiveLeaf || activeTop === item.id;

    // Opening a parent reveals its children either way; a component parent also
    // puts itself on the canvas, keeping whichever variant is already selected.
    // A `toggleOnly` parent (the Components category headers) has nothing of its
    // own to navigate to, so its row just flips open/closed instead of always
    // forcing open.
    const handleClick = () => {
      if (item.toggleOnly) {
        toggleGroup(item.id, groupOpen);
        return;
      }
      if (isComponent) onSelectComponent(item.component);
      else onNavigate(item.id);
      if (hasSub) setExpandedGroups((g) => ({ ...g, [item.id]: true }));
    };

    return (
      <div key={item.id}>
        <button className="nav-item" data-active={isActiveTop} onClick={handleClick}>
          <span className="nav-item-label">{item.label}</span>
          {hasSub && (
            <span
              className="nav-caret"
              data-open={groupOpen}
              onClick={(e) => {
                e.stopPropagation();
                toggleGroup(item.id, groupOpen);
              }}
            >
              <CaretRight />
            </span>
          )}
        </button>
        {hasSub && groupOpen && <div className="nav-sub">{item.sub.map(renderSub)}</div>}
      </div>
    );
  };

  const renderGroups = (groups) =>
    groups.map((section) => (
      <div key={section.group} className="nav-group">
        <span className="nav-group-label">{section.group}</span>
        {section.items.map(renderItem)}
      </div>
    ));

  const openHub = HUBS.find((h) => h.id === hub);

  return (
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <nav>
        {/* The way back out. It sits above the list rather than in it — the
            hub's own group is the only thing this nav lists, and a "leave" row
            inside Foundations would read as a foundation. */}
        <button className="nav-back" onClick={onLeaveHub}>
          <ArrowLeft size={14} />
          <span>All hubs</span>
        </button>
        <span className="nav-hub-title">{openHub?.label}</span>
        {renderGroups(HUB_NAV[hub])}
      </nav>
      <div className="sidebar-foot">
        <span className="sidebar-ver-label">Brand Guidelines</span>
        <span className="sidebar-ver">Version 1.0</span>
      </div>
    </aside>
  );
}
