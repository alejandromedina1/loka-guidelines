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
  // Not sourced — a floor under the panel's own width, not the bar's. The
  // panel matches whichever bar it hangs from (see filt/filt-panel in
  // global.css), but Single select's bar is one narrow chip; without a
  // floor its panel would be too narrow for its own rows to stay on one
  // line. 300px stays under the three-chip bar's own ~338px, so Multiple
  // select keeps its exact match rather than gaining a wider one.
  panelMinWidth: 300,
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
  ["Panel width", `matches the bar · ${T.panelMinWidth}px minimum`],
  ["Row", `${T.rowHeight}px · padding ${T.rowPad}px · radius ${T.rowRadius}px`],
  ["Row · picked", `${T.rowPicked} · gray-20`],
  ["Count", `${T.count} · ${T.countWidth}px column`],
];

// Whether the bar shows all three groups or just one. Multiple select is the
// bar's original, default behaviour — Selecting, Searching and Counts each
// keep their own pick, independent of the others. Single select drops down
// to Selecting alone: with only one active pick possible bar-wide, the other
// two groups would just be dead ends sitting next to it.
const isSingleSelect = (variant) => variant === "Single select";

// The guidance behind the bar, stated once. The specs panel shows the
// headlines; the AI prompt shows these with their reasoning attached.
export function filterRules(variant = "Multiple select") {
  const single = isSingleSelect(variant);
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
      rule: "The bar has no size of its own on either axis — it hugs its chips.",
      why: `Its box is the sum of theirs plus the ${T.barGap}px gaps. That has to be inline-flex, not flex: a block-level flex container stretches to fill its own parent's width regardless of how few chips are in it, which leaves empty pill background trailing the last one rather than the pill ending right after it.`,
    },
    {
      rule: `The panel matches the bar's width, down to a ${T.panelMinWidth}px floor.`,
      why: `Matching the bar exactly is what keeps Multiple select's panel from overhanging past Counts, its last chip. But Single select's own bar is one narrow chip — without a floor under the panel specifically, its rows would wrap rather than stay on one line. ${T.panelMinWidth}px reads comfortably and still sits under the three-chip bar's own width, so Multiple select keeps its exact match.`,
    },
    {
      rule: "One chip is open at a time, and closing always clears the query.",
      why: "Reopening starts clean rather than on a stale filter. The panel also dismisses on an outside click and on Escape.",
    },
    single
      ? {
          rule: "One chip, not three — Single select drops Searching and Counts entirely.",
          why: "With only one active pick possible bar-wide, showing three groups to choose from would just be two dead ends. Selecting is the one group that stays, not a merge of all three into one list.",
        }
      : {
          rule: "Groups are independent — picking in one doesn't touch another.",
          why: "Each group holds its own pick, so narrowing by one category leaves every other group's filter in place.",
        },
  ];
}

export function filterSpecs({ variant } = {}) {
  return { rules: ruleHeadlines(filterRules(variant)), rows: FILTER_SPECS };
}

// Filter bar — the Loka Figma "filter" component (node 4866:24030). Figma
// documents two variants; they're the same control in two states, so this is
// built interactive and each variant falls out of use:
//
//   default   every chip plain on the gray-5 bar
//   active    the open chip on gray-20, its arrow flipped up, panel below
//
// The panel's first row is a real input — typing filters the options under it.
// `variant` is a second axis on top of that: Multiple select keeps every
// group's pick independent (the bar's original behaviour) across all three
// chips. Single select isn't those same three chips with stricter picking —
// it's one chip, Selecting, since a bar that can only hold one active pick
// has no use for Searching or Counts as a second or third dead end.
export function FilterPreview({ variant = "Multiple select", bestPractices, onState }) {
  const single = isSingleSelect(variant);
  const visibleGroups = single ? FILTER_GROUPS.slice(0, 1) : FILTER_GROUPS;
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

  // Switching modes can drop the chip that's currently open — Searching or
  // Counts stop existing the moment Single select takes over — so close
  // rather than leave openLabel pointing at a chip that's no longer there.
  useEffect(() => {
    close();
  }, [variant, close]);

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

  const openGroup = visibleGroups.find((g) => g.label === openLabel);

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

  // Multiple select keeps every group's pick in the same object, untouched by
  // the others. Single select replaces the whole object with just this pick —
  // or empties it on a re-pick — so no other group can hold one at the same time.
  const pick = (groupLabel, option) =>
    single
      ? setPicked((cur) => (cur[groupLabel] === option ? {} : { [groupLabel]: option }))
      : setPicked((cur) => ({
          ...cur,
          [groupLabel]: cur[groupLabel] === option ? undefined : option,
        }));

  return (
    <div className="bp-stage" data-bp={bestPractices || undefined}>
      <div className="filt" ref={rootRef}>
        <div className="filt-bar">
          {visibleGroups.map((g, i) => {
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
    // positioning context it hangs from. width:fit-content, not 100%: the
    // panel below is width:100% of this box, so stretching it to fill the
    // container would make the panel wider than the bar itself now that the
    // bar hugs its own chips instead of stretching too.
    rule(`.${CLASS}`, [
      ["position", "relative"],
      ["width", "fit-content"],
      ["max-width", `${T.width}px`],
    ]),
    // inline-flex, not flex — a block-level flex container stretches to fill
    // its parent's width regardless of how few chips are in it, leaving
    // visible empty pill background after the last one.
    rule(`.${CLASS}__bar`, [
      ["display", "inline-flex"],
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
      ["min-width", `${T.panelMinWidth}px`],
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
export function filterHtmlSnippet({ variant = "Multiple select" } = {}) {
  const single = isSingleSelect(variant);
  const visibleGroups = single ? FILTER_GROUPS.slice(0, 1) : FILTER_GROUPS;
  const open = visibleGroups[0];

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
    ...visibleGroups.map((g, i) => indent(chip(g, i === 0), 4)),
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
    "     see the AI prompt tab for what each has to do.",
    single
      ? "     Single select: one chip, not three — Searching and Counts don't exist here. -->"
      : "     Multiple select: each group keeps its own pick, independent of the rest. -->",
  ].join("\n");

  return htmlDocument({ title: `Filter — ${variant}, bar with panel open`, css: filterCss(), markup });
}

export function filterPromptSnippet({ variant = "Multiple select" } = {}) {
  const single = isSingleSelect(variant);
  return specPrompt({
    component: "Filter",
    config: `Bar with dropdown panel — ${variant}`,
    sections: [
      [
        "Bar",
        [
          ["Width", `hugs its chips, ${T.width}px maximum — the panel below matches this, not its container`],
          ["Fill", tokenRef(T.bar)],
          ["Radius", `${T.barRadius}px — a pill`],
          ["Gap", `${T.barGap}px between chips`],
          ["Height", "hugs its chips — it has no height of its own"],
          [
            "Chip count",
            single
              ? "one chip (Selecting) — Multiple select's other two groups, Searching and Counts, don't exist in this mode"
              : "three chips (Selecting, Searching, Counts), one per group",
          ],
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
          ["Width", `matches the bar, ${T.panelMinWidth}px minimum`],
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
      single
        ? "There's only the one group to pick from, so the bar carries at most one active filter at a time by construction, not by clearing other groups' picks."
        : "Each group's pick is independent — picking in one leaves every other group's pick in place.",
    ],
    notes: [
      ...ruleTexts(filterRules(variant)),
      "Each option is a toggle, so use aria-pressed rather than a checkbox role.",
    ],
    reference: filterHtmlSnippet({ variant }),
  });
}
