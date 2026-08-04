import { useRef, useState } from "react";
import { TABS } from "../../../data/components.js";
import { BestPracticesPanel } from "../BestPracticesPanel.jsx";
import { SpecOverlay } from "../SpecOverlay.jsx";

// The item on its own, and the bar that hosts it, are two different specs —
// 12px padding against 4px, a fixed 70px against a hugged 78px — so each view
// brings its own sheet rather than one merged list that fits neither.
const ITEM_SPECS = [
  ["Height", "70px"],
  ["Width", "no width of its own · 345px in a 4-up bar"],
  ["Padding", "12px"],
  ["Radius", "12px"],
  ["Stack gap", "12px · 8px when active"],
  ["Marker", "12px square"],
  ["Marker · default", "1px #DFDFE1 · LineOpaque"],
  ["Marker · hover", "1px #186BF3 + 6px dot"],
  ["Marker · active", "#186BF3 · blue-100"],
  ["Font", "Alliance No.2"],
  ["Text", "16px / 1.3 · ellipsis"],
  ["Label · default", "#041D3E · DarkBlue"],
  ["Label · hover & active", "#186BF3 · blue-100"],
  ["Fill · default", "none"],
  ["Fill · hover", "#FFFFFF · white"],
  ["Fill · active", "#DBE7F5"],
];

const BAR_SPECS = [
  ["Height", "78px · hug"],
  ["Padding", "4px"],
  ["Radius", "15px"],
  ["Fill", "rgba(255,255,255,.9)"],
  ["Shadow", "0 0 6px rgba(0,0,0,.1)"],
  ["Backdrop", "blur(10px)"],
  ["Gap", "4px"],
  ["Items", "equal share of the row · 70px tall"],
  ["Item radius", "12px"],
  ["Selection", "one at a time"],
  ["Keyboard", "one tab stop · arrows move"],
];

const ITEM_NOTE =
  "Figma's three variants are three appearances of one control: only selection is state, hover is pure CSS. Hover it to see the ring-and-dot marker, click to select it. Two things to know: the content stack tightens from 12px to 8px once active, so the label nudges as you select, and the active fill #DBE7F5 is a raw hex in Figma rather than a palette token (blue-10, #D8E2F6, is the nearest one).";

const BAR_NOTE =
  "The item carries no width — the bar hands every item an equal share of the row, which is what makes a long label ellipsize rather than push its neighbours around. The bar is one tab stop, not four: arrows move between tabs, so a keyboard doesn't have to walk the whole row to get past it.";

// One tab item. The ARIA differs by view — a row of these is a tablist, a single
// one out of context is just a toggle — so the caller passes it in.
function TabItem({ label, active, onClick, aria }) {
  return (
    <button
      type="button"
      className="tab-item"
      data-active={active || undefined}
      onClick={onClick}
      {...aria}
    >
      {/* Figma nests the marker and label in a full-width stack, and it earns its
          keep here too: it's what the label measures its ellipsis against. */}
      <span className="tab-stack">
        <span className="tab-mark" aria-hidden />
        <span className="tab-label">{label}</span>
      </span>
    </button>
  );
}

// Tabs — the Loka Figma "service-icon-item" component set (node 4007:23097),
// and the bar that hosts it (node 4253:19091). Figma documents the item as
// three variants, which are three appearances of one control:
//
//   Default   hairline marker, DarkBlue label, no fill
//   Hovered   marker becomes a blue ring around a 6px dot, label goes blue
//   Active    marker fills solid blue, label goes blue, item takes the blue fill
//
// The canvas pills switch between the item on its own and the full bar.
export function TabsPreview({ view = "Item", bestPractices }) {
  const isBar = view === "Full bar";
  // Two independent selections: the bar's index, and whether the lone item is
  // picked. Sharing one value would mean the solo view could only ever show the
  // first label, or the bar could open with nothing selected — which it never is.
  const [active, setActive] = useState(0);
  const [soloActive, setSoloActive] = useState(false);
  const rowRef = useRef(null);

  // A tablist is one tab stop: only the selected tab is tabbable and the arrows
  // move between them.
  const onKeyDown = (e) => {
    const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const next = (active + dir + TABS.length) % TABS.length;
    setActive(next);
    rowRef.current?.children[next]?.focus();
  };

  return (
    <div className="bp-stage" data-bp={bestPractices || undefined}>
      {/* The bar fills the section it sits in, so the demo box supplies a width
          for it to fill; solo, the item is pinned to the 345px share it gets in
          the real 4-up bar, since it has no width of its own to hug. */}
      <div className={isBar ? "tabs-demo" : "tab-solo-demo"}>
        <SpecOverlay
          on={bestPractices}
          fill
          padX={isBar ? 4 : 12}
          padY={isBar ? 4 : 12}
          widthMode="fill"
          heightMode={isBar ? "hug" : "fixed"}
        >
          {isBar ? (
            <div className="tabs">
              <div className="tabs-row" role="tablist" ref={rowRef} onKeyDown={onKeyDown}>
                {TABS.map((label, i) => (
                  <TabItem
                    key={label}
                    label={label}
                    active={i === active}
                    onClick={() => setActive(i)}
                    aria={{
                      role: "tab",
                      "aria-selected": i === active,
                      tabIndex: i === active ? 0 : -1,
                    }}
                  />
                ))}
              </div>
            </div>
          ) : (
            <TabItem
              label={TABS[0]}
              active={soloActive}
              onClick={() => setSoloActive((v) => !v)}
              aria={{ "aria-pressed": soloActive }}
            />
          )}
        </SpecOverlay>
      </div>
      {bestPractices && (
        <BestPracticesPanel
          rows={isBar ? BAR_SPECS : ITEM_SPECS}
          note={isBar ? BAR_NOTE : ITEM_NOTE}
        />
      )}
    </div>
  );
}
