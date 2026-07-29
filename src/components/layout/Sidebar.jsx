import { useState } from "react";
import { NAV } from "../../data/navigation.js";
import { CaretRight } from "../common/Icon.jsx";

// The left navigation. Renders the NAV model, tracks which collapsible groups
// are open, and highlights the active section (or selected component).
export function Sidebar({ active, activeTop, selectedComponent, onSelectComponent, onNavigate, open }) {
  const [expandedGroups, setExpandedGroups] = useState({ color: false, typography: false });

  const toggleGroup = (id) => setExpandedGroups((g) => ({ ...g, [id]: !g[id] }));

  return (
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <nav>
        {NAV.map((section) => (
          <div key={section.group} className="nav-group">
            <span className="nav-group-label">{section.group}</span>
            {section.items.map((item) => {
              const hasSub = !!item.sub;
              const groupOpen = expandedGroups[item.id];
              const isComponent = !!item.component;
              const isActiveTop = isComponent
                ? active === "components" && selectedComponent === item.component
                : activeTop === item.id;

              const handleClick = () => {
                if (isComponent) {
                  onSelectComponent(item.component);
                } else {
                  onNavigate(item.id);
                  if (hasSub) setExpandedGroups((g) => ({ ...g, [item.id]: true }));
                }
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
                      {item.sub.map((s) => (
                        <button
                          key={s.id}
                          className="nav-subitem"
                          data-active={active === s.id}
                          onClick={() => onNavigate(s.id)}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="sidebar-foot">
        <span className="sidebar-ver-label">Brand Guidelines</span>
        <span className="sidebar-ver">Version 1.0</span>
      </div>
    </aside>
  );
}
