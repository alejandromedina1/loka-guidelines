import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FILTER_GROUPS } from "../../../data/components.js";
import { SpecOverlay } from "../SpecOverlay.jsx";
import { CaretDown } from "../../common/Icon.jsx";
import {
  FONT_STACK,
  blocks,
  htmlDocument,
  indent,
  rule,
  ruleHeadlines,
  ruleTexts,
  specPrompt,
  tokenRef,
} from "../snippets.js";

// Resolved values for the bar and its panel. global.css paints these; the spec
// sheet and the copyable snippets below read them from here.
const T = {
  bar: "#EFF1F5", // gray-5
  barRadius: 500,
  barGap: 6,
  chipHeight: 36,
  chipPad: 12,
  chipRadius: 80,
  chipGap: 6,
  chipOpen: "#D6DCE6", // gray-20
  arrow: 12,
  arrowClosed: "#A8B3CA", // gray-40
  arrowOpen: "#828FA5", // gray-50
  fontSize: 16,
  lineHeight: 1.3,
  label: "#041D3E", // gray-80
  panelOffset: 44, // 8px below the 36px bar
  panelGap: 8,
  panel: "#F5F6FA", // BackgroundGrey
  panelBorder: "#EFF1F5", // gray-5
  panelRadius: 12,
  panelPad: 4,
  rowHeight: 44,
  rowPad: 12,
  rowRadius: 10,
  rowHover: "#EFF1F5", // gray-5
  rowPicked: "#D6DCE6", // gray-20
  count: "#A8B3CA", // gray-40
  countWidth: 22,
  empty: "#5C6A82", // gray-60
  width: 366,
  shadow:
    "drop-shadow(0 3px 3px rgba(43,64,92,.05)) drop-shadow(0 11px 5.5px rgba(43,64,92,.04)) " +
    "drop-shadow(0 25px 7.5px rgba(43,64,92,.03)) drop-shadow(0 45px 9px rgba(43,64,92,.01))",
};

// Three nested boxes, so each gets one row rather than three. The chip's own
// height and padding are absent — the redlines draw both on the first chip —
// and so is the font, which is the system's.
const FILTER_SPECS = [
  ["Bar", `${T.bar} · ${T.barRadius}px pill · ${T.barGap}px gap`],
  ["Chip", `radius ${T.chipRadius}px · ${T.chipGap}px gap`],
  ["Chip · open", `${T.chipOpen} · gray-20`],
  ["Arrow", `${T.arrow}px · gray-40 / gray-50 open`],
  ["Text", `${T.fontSize}px / ${T.lineHeight}`],
  ["Label", `${T.label} · gray-80`],
  ["Panel", `${T.panel} · 1px ${T.panelBorder} · radius ${T.panelRadius}px`],
  ["Panel offset", `${T.panelOffset}px below the bar`],
  ["Row", `${T.rowHeight}px · padding ${T.rowPad}px · radius ${T.rowRadius}px`],
  ["Row · picked", `${T.rowPicked} · gray-20`],
  ["Count", `${T.count} · ${T.countWidth}px column`],
];

// The guidance behind the bar, stated once. The specs panel shows the
// headlines; the AI prompt shows these with their reasoning attached.
export function filterRules() {
  return [
    {
      rule: "The panel's first row is an input, not a heading — type to filter.",
      why: "When nothing matches, replace the rows with the empty message rather than showing an empty panel.",
    },
    {
      rule: "The panel overlays the page rather than pushing it down.",
      why: "It's absolutely positioned, so its container needs position: relative and the panel a z-index above the content it covers.",
    },
    {
      rule: `Counts sit in a fixed ${T.countWidth}px column.`,
      why: "Labels then stay aligned across one- and two-digit values, so don't let the count size itself.",
    },
    {
      rule: "The bar has no height of its own — it hugs its chips.",
      why: `Its box is the sum of theirs plus the ${T.barGap}px gaps, so don't pin it to ${T.chipHeight}px.`,
    },
    {
      rule: "One chip is open at a time, and closing always clears the query.",
      why: "Reopening starts clean rather than on a stale filter. The panel also dismisses on an outside click and on Escape.",
    },
  ];
}

export function filterSpecs() {
  return { rules: ruleHeadlines(filterRules()), rows: FILTER_SPECS };
}

// Filter bar — the Loka Figma "filter" component (node 4866:24030). Figma
// documents two variants; they're the same control in two states, so this is
// built interactive and each variant falls out of use:
//
//   default   every chip plain on the gray-5 bar
//   active    the open chip on gray-20, its arrow flipped up, panel below
//
// The panel's first row is a real input — typing filters the options under it.
export function FilterPreview({ bestPractices, onState }) {
  const [openLabel, setOpenLabel] = useState(null);
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState({});
  const rootRef = useRef(null);
  const inputRef = useRef(null);

  // Closing always drops the query, so reopening starts clean rather than on a
  // stale filter — same collapse rule as the multi-select.
  const close = useCallback(() => {
    setOpenLabel(null);
    setQuery("");
  }, []);

  useEffect(() => {
    if (!openLabel) return;
    const onDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) close();
    };
    const onKey = (e) => e.key === "Escape" && close();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [openLabel, close]);

  // Which chip is open is the component's state, and it lives here rather than
  // in the playground — so it's posted up for the canvas readout.
  useEffect(() => {
    onState?.(
      openLabel
        ? { text: `Open · ${openLabel}`, tone: "active" }
        : { text: "Closed", tone: "default" },
    );
  }, [openLabel, onState]);

  const openGroup = FILTER_GROUPS.find((g) => g.label === openLabel);

  const options = useMemo(() => {
    if (!openGroup) return [];
    const q = query.trim().toLowerCase();
    if (!q) return openGroup.options;
    return openGroup.options.filter((o) => o.label.toLowerCase().includes(q));
  }, [openGroup, query]);

  const toggleGroup = (label) => {
    if (label === openLabel) return close();
    setOpenLabel(label);
    setQuery("");
    // Let the panel mount before focusing its input.
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const pick = (groupLabel, option) =>
    setPicked((cur) => ({
      ...cur,
      [groupLabel]: cur[groupLabel] === option ? undefined : option,
    }));

  return (
    <div className="bp-stage" data-bp={bestPractices || undefined}>
      <div className="filt" ref={rootRef}>
        <div className="filt-bar">
          {FILTER_GROUPS.map((g, i) => {
            const on = g.label === openLabel;
            return (
              // The chip is what's redlined, not the bar: the bar hugs its chips,
              // so its own box is the sum of theirs plus the 6px gaps.
              <SpecOverlay
                key={g.label}
                on={bestPractices && i === 0}
                padX={12}
                padY={12}
                widthMode="hug"
                heightMode="fixed"
              >
                <button
                  type="button"
                  className="filt-toggle"
                  data-open={on || undefined}
                  aria-expanded={on}
                  onClick={() => toggleGroup(g.label)}
                >
                  {g.label}
                  <CaretDown open={on} />
                </button>
              </SpecOverlay>
            );
          })}
        </div>

        {openGroup && (
          <div className="filt-panel">
            <input
              ref={inputRef}
              className="filt-search"
              placeholder="Looking for"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {options.length === 0 ? (
              <p className="filt-empty">Not matching options.</p>
            ) : (
              options.map((o) => (
                <button
                  key={o.label}
                  type="button"
                  className="filt-option"
                  data-picked={picked[openGroup.label] === o.label || undefined}
                  aria-pressed={picked[openGroup.label] === o.label}
                  onClick={() => pick(openGroup.label, o.label)}
                >
                  <span className="filt-count">{o.count}</span>
                  <span className="filt-option-label">{o.label}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Copyable output ─────────────────────────────────────────────────────────

const CLASS = "loka-filter";

// The caret, matching CaretDown in Icon.jsx. Two paths rather than a rotation:
// Figma ships the arrow as two glyphs, and the open one isn't the closed one
// turned over.
const caretSvg = (open) =>
  `<svg viewBox="0 0 12 12" width="${T.arrow}" height="${T.arrow}" aria-hidden="true">` +
  `<path d="${open ? "M9 7H3L6 4L9 7Z" : "M9 4H3L6 7L9 4Z"}" fill="currentColor" ` +
  `stroke="currentColor" stroke-width="1" stroke-linejoin="round"/></svg>`;

export function filterCss() {
  return blocks(
    // The panel is absolute, so it contributes no height — the root is the
    // positioning context it hangs from.
    rule(`.${CLASS}`, [
      ["position", "relative"],
      ["width", "100%"],
      ["max-width", `${T.width}px`],
    ]),
    rule(`.${CLASS}__bar`, [
      ["display", "flex"],
      ["align-items", "center"],
      ["gap", `${T.barGap}px`],
      ["background", T.bar],
      ["border-radius", `${T.barRadius}px`],
    ]),
    rule(`.${CLASS}__chip`, [
      ["display", "flex"],
      ["align-items", "center"],
      ["justify-content", "center"],
      ["gap", `${T.chipGap}px`],
      ["height", `${T.chipHeight}px`],
      ["padding", `0 ${T.chipPad}px`],
      ["border", "none"],
      ["border-radius", `${T.chipRadius}px`],
      ["background", "none"],
      ["overflow", "clip"],
      ["cursor", "pointer"],
      ["font-family", FONT_STACK],
      ["font-size", `${T.fontSize}px`],
      ["font-weight", "400"],
      ["line-height", T.lineHeight],
      ["color", T.label],
      ["transition", "background .12s"],
    ]),
    rule(`.${CLASS}__chip[aria-expanded="true"]`, [["background", T.chipOpen]]),
    // The arrow tracks the two state colours the Figma arrow component ships.
    rule(`.${CLASS}__chip svg`, [
      ["flex", "none"],
      ["color", T.arrowClosed],
    ]),
    rule(`.${CLASS}__chip[aria-expanded="true"] svg`, [["color", T.arrowOpen]]),
    rule(`.${CLASS}__panel`, [
      ["position", "absolute"],
      ["left", "0"],
      ["top", `calc(100% + ${T.panelGap}px)`],
      ["z-index", "2"],
      ["width", "100%"],
      ["display", "flex"],
      ["flex-direction", "column"],
      ["gap", "2px"],
      ["padding", `${T.panelPad}px`],
      ["background", T.panel],
      ["border", `1px solid ${T.panelBorder}`],
      ["border-radius", `${T.panelRadius}px`],
      ["filter", T.shadow],
    ]),
    // The panel's first row is an input, not a heading — type to filter.
    rule(`.${CLASS}__search`, [
      ["height", `${T.rowHeight}px`],
      ["padding", `0 ${T.rowPad}px`],
      ["border", "none"],
      ["background", "none"],
      ["outline", "none"],
      ["border-radius", `${T.rowRadius}px`],
      ["font-family", FONT_STACK],
      ["font-size", `${T.fontSize}px`],
      ["font-weight", "400"],
      ["line-height", T.lineHeight],
      ["color", T.label],
    ]),
    rule(`.${CLASS}__search::placeholder`, [["color", T.count]]),
    rule(`.${CLASS}__option`, [
      ["display", "flex"],
      ["align-items", "center"],
      ["gap", `${T.chipGap}px`],
      ["width", "100%"],
      ["height", `${T.rowHeight}px`],
      ["padding", `0 ${T.rowPad}px`],
      ["border", "none"],
      ["border-radius", `${T.rowRadius}px`],
      ["background", "none"],
      ["overflow", "clip"],
      ["cursor", "pointer"],
      ["text-align", "left"],
      ["font-family", FONT_STACK],
      ["font-size", `${T.fontSize}px`],
      ["font-weight", "400"],
      ["line-height", T.lineHeight],
      ["color", T.label],
      ["transition", "background .12s"],
    ]),
    rule(`.${CLASS}__option:hover`, [["background", T.rowHover]]),
    rule(`.${CLASS}__option[aria-pressed="true"]`, [["background", T.rowPicked]]),
    // A fixed column so labels line up whether the count is one or two digits.
    rule(`.${CLASS}__count`, [
      ["flex", "none"],
      ["width", `${T.countWidth}px`],
      ["color", T.count],
    ]),
    rule(`.${CLASS}__empty`, [
      ["margin", "0"],
      ["padding", `${T.rowPad}px`],
      ["font-family", FONT_STACK],
      ["font-size", `${T.fontSize}px`],
      ["line-height", T.lineHeight],
      ["color", T.empty],
    ]),
  );
}

// Emitted with the first chip open, which is Figma's "active" variant and the
// only state that shows every part at once. The open/close, the outside-click
// and Escape dismissal, and the type-to-filter all need JavaScript — the
// comment in the snippet says so, and the AI prompt tab specifies them.
export function filterHtmlSnippet() {
  const open = FILTER_GROUPS[0];

  const chip = (group, isOpen) =>
    [
      `<button type="button" class="${CLASS}__chip" aria-expanded="${isOpen}">`,
      indent(group.label),
      indent(caretSvg(isOpen)),
      "</button>",
    ].join("\n");

  const option = (o) =>
    [
      `<button type="button" class="${CLASS}__option" aria-pressed="false">`,
      indent(`<span class="${CLASS}__count">${o.count}</span>`),
      indent(`<span>${o.label}</span>`),
      "</button>",
    ].join("\n");

  const markup = [
    `<div class="${CLASS}">`,
    indent(`<div class="${CLASS}__bar">`),
    ...FILTER_GROUPS.map((g, i) => indent(chip(g, i === 0), 4)),
    indent("</div>"),
    "",
    indent(`<div class="${CLASS}__panel">`),
    indent(`<input class="${CLASS}__search" placeholder="Looking for">`, 4),
    ...open.options.map((o) => indent(option(o), 4)),
    indent("</div>"),
    "</div>",
    "",
    "<!-- Shown with the first chip open — Figma's active variant, and the only state",
    "     that shows every part at once. Opening and closing a chip, dismissing on",
    "     outside click or Escape, and filtering the rows as you type are all JavaScript;",
    "     see the AI prompt tab for what each has to do. -->",
  ].join("\n");

  return htmlDocument({ title: "Filter — bar with panel open", css: filterCss(), markup });
}

export function filterPromptSnippet() {
  return specPrompt({
    component: "Filter",
    config: "Bar with dropdown panel",
    sections: [
      [
        "Bar",
        [
          ["Width", `fills its container, ${T.width}px maximum`],
          ["Fill", tokenRef(T.bar)],
          ["Radius", `${T.barRadius}px — a pill`],
          ["Gap", `${T.barGap}px between chips`],
          ["Height", "hugs its chips — it has no height of its own"],
        ],
      ],
      [
        "Chip",
        [
          ["Height", `${T.chipHeight}px`],
          ["Width", "hug content"],
          ["Padding", `0 ${T.chipPad}px`],
          ["Radius", `${T.chipRadius}px`],
          ["Gap", `${T.chipGap}px between label and arrow`],
          ["Text", `${T.fontSize}px / ${T.lineHeight}, Alliance No.2, ${tokenRef(T.label)}`],
          ["Arrow", `${T.arrow}px, ${tokenRef(T.arrowClosed)} closed and ${tokenRef(T.arrowOpen)} open`],
        ],
      ],
      [
        "Panel",
        [
          ["Position", `absolute, ${T.panelGap}px below the bar — ${T.panelOffset}px from its top`],
          ["Width", "matches the bar"],
          ["Fill", tokenRef(T.panel)],
          ["Border", `1px solid ${tokenRef(T.panelBorder)}`],
          ["Radius", `${T.panelRadius}px`],
          ["Padding", `${T.panelPad}px, with a 2px gap between rows`],
          ["Shadow", `four stacked drop-shadows: ${T.shadow}`],
        ],
      ],
      [
        "Row",
        [
          ["Height", `${T.rowHeight}px`],
          ["Padding", `0 ${T.rowPad}px`],
          ["Radius", `${T.rowRadius}px`],
          ["Count", `${tokenRef(T.count)} in a fixed ${T.countWidth}px column`],
          ["Label", tokenRef(T.label)],
          ["Hover", tokenRef(T.rowHover)],
          ["Picked", tokenRef(T.rowPicked)],
          ["Empty message", `"Not matching options." in ${tokenRef(T.empty)}`],
        ],
      ],
    ],
    states: [
      `Chip open: fill becomes ${tokenRef(T.chipOpen)} over 120ms and the arrow flips to its up glyph in ${tokenRef(T.arrowOpen)}. Ship the arrow as two paths rather than rotating one — the open glyph isn't the closed one turned over.`,
      "One chip is open at a time: opening another closes the current one, and clicking the open chip closes it.",
      "The panel dismisses on an outside click and on Escape. Closing always clears the query, so reopening starts clean rather than on a stale filter.",
      "Opening a chip moves focus into the panel's search input.",
    ],
    notes: [
      ...ruleTexts(filterRules()),
      "Each option is a toggle, so use aria-pressed rather than a checkbox role.",
    ],
    reference: filterHtmlSnippet(),
  });
}
