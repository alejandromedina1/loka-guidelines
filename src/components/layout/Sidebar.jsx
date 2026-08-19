import { useState } from "react";
import { HUBS, HUB_NAV } from "../../data/navigation.js";
import { ArrowLeft, CaretRight } from "../common/Icon.jsx";

// The left navigation. It only exists inside a hub — the landing is the choice
// between the two, and the halves of that screen are the way in — so this lists
// one hub's sections and nothing else: the Brand Hub's foundations or the Product
// Hub's component categories, never both. That's the point of the split: neither
// audience scrolls through the other's half to reach its own.
export function Sidebar({
  active,
  activeTop,
  hub,
  onLeaveHub,
  selectedComponent,
  componentVariant,
  onSelectComponent,
  onNavigate,
  open,
}) {
  const [expandedGroups, setExpandedGroups] = useState({ color: false, typography: false });

  const toggleGroup = (id) => setExpandedGroups((g) => ({ ...g, [id]: !g[id] }));

  // One item row, whatever list it belongs to.
  const renderItem = (item) => {
    const hasSub = !!item.sub;
    const groupOpen = expandedGroups[item.id];
    const isComponent = !!item.component;
    const isActiveTop = isComponent
      ? active === "components" && selectedComponent === item.component
      : activeTop === item.id;

    // Opening a parent reveals its children either way; a component parent also
    // puts itself on the canvas, keeping whichever variant is already selected.
    // A `toggleOnly` parent (the Components category headers) has nothing of its
    // own to navigate to, so its row just flips open/closed instead of always
    // forcing open.
    const handleClick = () => {
      if (item.toggleOnly) {
        toggleGroup(item.id);
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
                toggleGroup(item.id);
              }}
            >
              <CaretRight />
            </span>
          )}
        </button>
        {hasSub && groupOpen && (
          <div className="nav-sub">
            {/* Foundations sub-items are places to scroll to; component
                sub-items are variants of one canvas, so they're active when that
                variant is the one on stage. Most leaves (Button, Tags, ...)
                don't carry a variant at all — for those, being on that component
                is enough, so the variant check is skipped rather than compared
                against undefined. */}
            {item.sub.map((s) => (
              <button
                key={s.id}
                className="nav-subitem"
                data-active={
                  s.component
                    ? active === "components" &&
                      selectedComponent === s.component &&
                      (s.variant === undefined || componentVariant === s.variant)
                    : active === s.id
                }
                onClick={() => (s.component ? onSelectComponent(s.component, s.variant) : onNavigate(s.id))}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
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
