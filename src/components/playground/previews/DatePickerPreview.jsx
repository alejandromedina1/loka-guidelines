import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SpecOverlay } from "../SpecOverlay.jsx";
import { ArrowLeft, ArrowRight, CalendarIcon, CircleX } from "../../common/Icon.jsx";
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

// The control's resolved values, in one place — global.css paints these, and the
// redlines, the spec sheet and the copyable snippets all read them from here so
// the four can't drift apart.
//
// Nothing below is this component's own invention. The trigger half is the Input
// Field family's box (see InputFieldPreview's own T — same height, radius,
// border, fill, focus ring and error treatment) with the Search Input's icon
// math applied to a trailing glyph instead of a leading one. The panel half is
// the Dropdown's open panel (see global.css's .ms[data-open]) with its 48px
// option row re-cut as a day cell. There's no sourced Figma node for a Date
// Picker, so borrowing both halves is what keeps it inside the system rather
// than beside it.
const T = {
  // trigger — the field family's box
  height: 48,
  radius: 12,
  padX: 16,
  fontSize: 14.5,
  fill: "#FAFBFC", // var(--bg-soft)
  line: "#E7ECF2", // var(--line) · gray-10
  ink: "#010812", // var(--ink) · black
  placeholder: "#A8B3CA", // gray-40
  labelSize: 13.5,
  labelWeight: 500,
  inkLabel: "#2E3F5A", // var(--ink-2) · gray-70
  gap: 10,
  errorSize: 12.5,
  blue: "#1957F4", // var(--blue) · NewBlue
  blueSoft: "#EEF2FE", // var(--blue-soft) · blue-5
  danger: "#D64545", // var(--danger)
  dangerSoft: "#FBEAEA", // var(--danger-soft)
  ring: 3,
  disabledOpacity: 0.55,
  // the calendar trigger — a real button, so it takes the Dropdown caret's
  // gray-50 rather than the Search Input magnifier's gray-60: that glyph is
  // decorative and this one is clickable.
  iconSize: 16,
  hit: 20,
  trigger: "#828FA5", // gray-50
  triggerOff: "#A8B3CA", // gray-40
  // panel — the Dropdown's open panel
  panelGap: 8,
  panelFill: "#EEF2FE", // blue-5
  panelLine: "#D6DCE6", // gray-20
  panelRadius: 16,
  headFill: "#FAFBFC", // bg-soft
  headLine: "#ECECEE", // line-stroke
  monthSize: 14.5,
  calFill: "#FAFBFC", // bg-soft — the grid sits on the same surface as the header
  calPad: 12,
  weekSize: 12,
  weekInk: "#2E3F5A", // gray-70
  // day cell — the option row's radius and text colour on a smaller box
  cell: 36,
  cellRadius: 12,
  cellGap: 4,
  dayInk: "#5C6A82", // gray-60
  dayHover: "#EFF1F5", // gray-5
  dayOutside: "#A8B3CA", // gray-40
  dayOff: "#CCD4E0", // gray-30
  selected: "#186BF3", // blue-100
  selectedInk: "#FFFFFF",
  range: "#D8E2F6", // blue-10
  today: "#186BF3", // blue-100
  chipFill: "#EEF2FE", // blue-5
  chipLine: "#D8E2F6", // blue-10
  chipInk: "#186BF3", // blue-100
};

// The trigger's slot, reserved on the right whether a value is showing or not —
// the same 16 + 16 + 8 the Search Input reserves for its own two glyphs. Stated
// once so the CSS and the spec row can't drift.
const SIDE_PAD = T.padX + T.iconSize + 8;

// Always six rows, never five — see the rule below.
const ROWS = 6;

const PCT = (n) => `${Math.round(n * 100)}%`;

// ── Dates ───────────────────────────────────────────────────────────────────

// Pinned rather than read off the clock. Every snippet this playground hands a
// developer is a pure function of its arguments, so a live `new Date()` would
// make the copied HTML change from one day to the next, and the today marker in
// the grid would wander with it. March 2026 is the month on the canvas because
// its shape is the awkward one: it opens on a Sunday, so a Monday-first grid
// carries six leading days from February and still needs all six rows — the
// case a month that happens to start on a Monday would hide.
const VIEW = { year: 2026, month: 2 }; // month is 0-based — March
const TODAY = "2026-03-18";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Monday-first, and two letters rather than one: a single-letter row repeats T
// and S, so the columns stop being nameable out loud.
const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

const pad = (n) => String(n).padStart(2, "0");
const isoOf = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

// Which column the 1st lands in. getDay() is Sunday-first, so it shifts by one.
const firstColumn = (year, month) => (new Date(year, month, 1).getDay() + 6) % 7;

const monthOf = (iso) => {
  const [year, month] = iso.split("-").map(Number);
  return { year, month: month - 1 };
};

const shift = (iso, days) => {
  const [year, month, day] = iso.split("-").map(Number);
  return isoOf(new Date(year, month - 1, day + days));
};

// Round-tripped rather than range-checked: Date normalises 2026-02-30 into
// March 2nd, so re-formatting what it parsed and comparing is what catches a
// day the month doesn't have.
const parseIso = (text) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return null;
  const [year, month, day] = text.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return isoOf(date) === text ? text : null;
};

// Six rows of cells for the month on screen, with the neighbouring months
// filling the leading and trailing slots — Date normalises the overflow, so the
// day before the 1st is just offset -1 rather than a month-length lookup.
const monthCells = ({ year, month }) => {
  const lead = firstColumn(year, month);
  return Array.from({ length: ROWS * 7 }, (_, i) => {
    const date = new Date(year, month, 1 - lead + i);
    return { iso: isoOf(date), day: date.getDate(), outside: date.getMonth() !== month };
  });
};

// ISO sorts lexicographically, so a range test needs no parsing at all.
const between = (iso, start, end) => Boolean(start && end && iso > start && iso < end);

const RANGE_SEP = " – ";
const PLACEHOLDER = { single: "YYYY-MM-DD", range: "YYYY-MM-DD – YYYY-MM-DD" };
const ERROR_MESSAGE = "Use YYYY-MM-DD.";

const isRange = (variant) => variant === "Date range";

// ── Guidance ────────────────────────────────────────────────────────────────

// The guidance behind the control, stated once. The specs panel shows the
// headlines; the AI prompt shows these with their reasoning attached.
export function datePickerRules(variant) {
  return [
    {
      rule: "Shares the Input Field family's fill, border and radius.",
      why: "One box across every field type — including this one — is what makes them read as a single component, so don't restyle it in isolation.",
    },
    {
      rule: "The panel overlays the page — it never pushes content down.",
      why: `It's absolutely positioned ${T.panelGap}px below the trigger, so it adds no height. Clicking the calendar glyph again collapses it, and so does Escape or a click outside.`,
    },
    {
      rule: "One format in, the same format out — ISO 8601.",
      why: "The value the field displays is the value it accepts typed, which is what lets the two round-trip. It also sidesteps the 03/04 problem: a picker that renders dates one way and parses them another is a control that reads correctly and submits the wrong day.",
    },
    {
      rule: "The grid is always six rows, whatever the month.",
      why: "A month needing five rows and the next needing six would change the panel's height mid-interaction, moving the cell under the cursor. The trailing days of the neighbouring month fill the gap instead.",
    },
    {
      rule: "Never selection by colour alone.",
      why: "The blue-100 fill is paired with aria-pressed on each day and an aria-label carrying the full date, so the accessibility tree and the styling can't disagree about which day is chosen.",
    },
    isRange(variant)
      ? {
          rule: "A range commits on its second pick, not its first.",
          why: "The panel stays open after the start date, the same way the Dropdown's stays open below its ceiling. Picking a day before the start swaps the two rather than rejecting it, and the chosen range collects into a removable chip under the grid.",
        }
      : {
          rule: "Picking a day fills the field and closes the panel.",
          why: "One value at a time, so there's nothing left to confirm — the same call single-select makes in the Dropdown.",
        },
    {
      rule: "Time isn't this control's job.",
      why: "The Time Picker documents that half separately. Pair the two rather than growing an hour strip into this panel.",
    },
  ];
}

export function datePickerSpecs({ variant }) {
  return {
    rules: ruleHeadlines(datePickerRules(variant)),
    rows: [
      ["Height", `${T.height}px closed`],
      ["Radius", `${T.radius}px`],
      ["Border", `1px ${T.line} · gray-10`],
      ["Fill", `${T.fill} · bg-soft`],
      ["Right padding", `${SIDE_PAD}px — the trigger's slot, reserved whether a date is set or not`],
      ["Text", `${T.fontSize}px`],
      ["Placeholder", `${T.placeholder} · gray-40`],
      ["Trigger", `${T.iconSize}px glyph in a ${T.hit}px box · ${T.trigger} · gray-50`],
      ["Panel", `${T.panelFill} · blue-5 on 1px ${T.panelLine} · gray-20, radius ${T.panelRadius}px`],
      ["Panel offset", `${T.panelGap}px below the trigger`],
      ["Month header", `${T.height}px · ${T.headFill} · ${T.monthSize}px / ${T.labelWeight}`],
      ["Weekday row", `${T.weekSize}px caps · ${T.weekInk} · gray-70`],
      ["Day cell", `${T.cell}px tall · radius ${T.cellRadius}px · ${T.cellGap}px gap · six rows`],
      ["Day · hover", `${T.dayHover} · gray-5`],
      ["Day · selected", `${T.selected} · blue-100, text ${T.selectedInk}`],
      ...(isRange(variant) ? [["Day · in range", `${T.range} · blue-10`]] : []),
      ["Day · today", `${T.today} · blue-100 text, no fill`],
      ["Day · outside month", `${T.dayOutside} · gray-40`],
      ["Day · unavailable", `${T.dayOff} · gray-30 — for min/max bounds; the demo sets none`],
      ...(isRange(variant) ? [["Range chip", `${T.chipFill} on 1px ${T.chipLine}`]] : []),
      ["Focus", `${T.blue} border + ${T.ring}px ${T.blueSoft} ring`],
      ["Error", `${T.danger} border · message ${T.errorSize}px`],
      ["Disabled", `${PCT(T.disabledOpacity)} opacity`],
    ],
  };
}

// ── Live preview ────────────────────────────────────────────────────────────

// Date Picker — the field family's box with a calendar panel hanging off it,
// split by how many dates it commits to. The variant is the canvas pill strip;
// open/closed is the control's own business, so it reports that upward the way
// the Dropdown and the Filter do rather than taking it as a prop.
//
// Single date keeps the field typeable: what it displays is ISO, and ISO is
// what it parses back, so the two round-trip. A date the calendar can't hold
// (2026-02-30, say) flags the family's error state for real rather than
// demonstrating it from a pill. Date range is read-only — the panel is the only
// way in, since a typed range has two values and no unambiguous separator.
export function DatePickerPreview({ variant, bestPractices, onState }) {
  const range = isRange(variant);

  const [view, setView] = useState(VIEW);
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [open, setOpen] = useState(false);
  // Raw text while the field is being edited, so an in-progress "2026-03-" can
  // sit in the input without being parsed at every keystroke. null means "show
  // the committed value instead".
  const [typed, setTyped] = useState(null);
  const [invalid, setInvalid] = useState(false);
  // Which cell the arrow keys are on. Separate from the selection: moving
  // through the grid shouldn't pick anything until Enter or a click does.
  const [focusIso, setFocusIso] = useState(TODAY);
  // Focus only follows focusIso once the keyboard has asked for it — opening
  // the panel leaves the caret in the field, which is where a typeable control
  // should keep it.
  const [roving, setRoving] = useState(false);

  const rootRef = useRef(null);
  const gridRef = useRef(null);

  const cells = useMemo(() => monthCells(view), [view]);

  const closePanel = useCallback(() => {
    setOpen(false);
    setRoving(false);
  }, []);

  // Switching selection model resets the control. A range carried over from the
  // other mode would leave the single-date field showing two dates it can't
  // parse, and a half-finished range waiting on an end date nothing will set.
  useEffect(() => {
    setStart(null);
    setEnd(null);
    setTyped(null);
    setInvalid(false);
    setView(VIEW);
    setFocusIso(TODAY);
    setOpen(false);
    setRoving(false);
  }, [range]);

  // The canvas readout. Error outranks everything — it's the state the field is
  // actually in — then open, then whether there's a value to show.
  useEffect(() => {
    if (invalid) onState?.({ text: "Error", tone: "error" });
    else if (open) onState?.({ text: "Open", tone: "active" });
    else if (start) onState?.({ text: "Selected", tone: "active" });
    else onState?.({ text: "Closed", tone: "default" });
  }, [invalid, open, start, onState]);

  // Every way out of the open state, the same three the Dropdown's panel
  // answers to: the trigger, Escape, and a click outside.
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) closePanel();
    };
    const onKey = (e) => e.key === "Escape" && closePanel();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, closePanel]);

  useEffect(() => {
    if (!open || !roving) return;
    gridRef.current?.querySelector(`[data-iso="${focusIso}"]`)?.focus();
  }, [open, roving, focusIso]);

  const openPanel = () => {
    setOpen(true);
    setRoving(false);
    // Reopen onto the month the selection is in, not wherever paging left off.
    const anchor = start ?? TODAY;
    setView(monthOf(anchor));
    setFocusIso(anchor);
  };

  const page = (dir) => {
    setView((v) => {
      const month = v.month + dir;
      return { year: v.year + Math.floor(month / 12), month: ((month % 12) + 12) % 12 };
    });
  };

  const value = typed ?? (start ? (end ? start + RANGE_SEP + end : start) : "");

  // Committed on Enter or blur rather than per keystroke: "2026-0" is a date
  // halfway through being typed, not an invalid one. Empty clears the field
  // instead of erroring — deleting a value is a legitimate thing to do.
  const commit = () => {
    if (typed === null) return;
    const text = typed.trim();
    if (!text) {
      setTyped(null);
      setStart(null);
      setEnd(null);
      setInvalid(false);
      return;
    }
    const parsed = parseIso(text);
    // The text stays on screen when it doesn't parse — it's what the message
    // below the field is talking about.
    if (!parsed) {
      setInvalid(true);
      return;
    }
    setTyped(null);
    setInvalid(false);
    setStart(parsed);
    setEnd(null);
    setView(monthOf(parsed));
    setFocusIso(parsed);
  };

  // Single date commits on the click that picks it. A range keeps the panel open
  // after its first endpoint, and a second pick earlier than the first swaps the
  // two rather than refusing — the day someone clicks is a day they meant.
  const pick = (cell) => {
    setTyped(null);
    setInvalid(false);
    setFocusIso(cell.iso);
    if (cell.outside) setView(monthOf(cell.iso));

    if (!range) {
      setStart(cell.iso);
      setEnd(null);
      closePanel();
      return;
    }
    if (!start || end) {
      setStart(cell.iso);
      setEnd(null);
      return;
    }
    const [from, to] = cell.iso < start ? [cell.iso, start] : [start, cell.iso];
    setStart(from);
    setEnd(to);
    closePanel();
  };

  const clear = () => {
    setStart(null);
    setEnd(null);
    setTyped(null);
    setInvalid(false);
  };

  // Roving tabindex: one cell in the grid is tabbable and the arrows move which.
  // When the focused date is in a month that isn't on screen, the 1st takes the
  // slot so Tab can still reach the grid at all.
  const onGridKey = (e) => {
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
    if (!step) return;
    e.preventDefault();
    const next = shift(focusIso, step);
    const m = monthOf(next);
    if (m.year !== view.year || m.month !== view.month) setView(m);
    setFocusIso(next);
    setRoving(true);
  };

  const tabTarget = cells.some((c) => c.iso === focusIso)
    ? focusIso
    : cells.find((c) => !c.outside)?.iso;

  const monthLabel = `${MONTHS[view.month]} ${view.year}`;

  return (
    <div className="bp-stage" data-bp={bestPractices || undefined}>
      {/* Same headroom problem as the Dropdown's: the panel is absolutely
          positioned, so it adds no height — it has room to open into only
          because this field sits at the stage's top rather than centred. */}
      <div className="field-demo" data-lift>
        <label className="field">
          <span className="field-label">{variant}</span>
          {/* `fill` because the trigger is width:100% of the field — redlining
              it as hug-content would misreport the box. The redlines measure
              the closed trigger either way: the panel is out of flow, so it
              adds nothing to what the overlay reads back. */}
          <SpecOverlay on={bestPractices} fill widthMode="fill" padX={T.padX} padY={0} heightMode="fixed">
            <div className="dp-anchor" ref={rootRef}>
              <div className="dp" data-open={open || undefined} data-error={invalid || undefined}>
                <input
                  className="dp-input"
                  type="text"
                  inputMode={range ? "none" : "numeric"}
                  placeholder={range ? PLACEHOLDER.range : PLACEHOLDER.single}
                  aria-label={variant}
                  aria-invalid={invalid || undefined}
                  aria-describedby={invalid ? "dp-demo-error" : undefined}
                  // A typed range has two values and no separator everyone
                  // reads the same way, so the panel is the only way into it.
                  readOnly={range}
                  value={value}
                  onChange={(e) => {
                    setTyped(e.target.value);
                    setInvalid(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      commit();
                    }
                  }}
                  onBlur={commit}
                  onClick={() => range && (open ? closePanel() : openPanel())}
                />
                <button
                  type="button"
                  className="dp-trigger"
                  aria-label={open ? "Close calendar" : "Open calendar"}
                  aria-expanded={open}
                  onClick={() => (open ? closePanel() : openPanel())}
                >
                  <CalendarIcon />
                </button>
              </div>

              {open && (
                <div className="dp-panel" role="group" aria-label={`${variant} calendar`}>
                  <div className="dp-head">
                    <button type="button" className="dp-nav" aria-label="Previous month" onClick={() => page(-1)}>
                      <ArrowLeft />
                    </button>
                    {/* Announced on change, since paging months is the one
                        thing here that alters the grid without moving focus. */}
                    <span className="dp-month" aria-live="polite">
                      {monthLabel}
                    </span>
                    <button type="button" className="dp-nav" aria-label="Next month" onClick={() => page(1)}>
                      <ArrowRight />
                    </button>
                  </div>

                  <div className="dp-cal">
                    <div className="dp-week" aria-hidden="true">
                      {WEEKDAYS.map((d) => (
                        <span key={d}>{d}</span>
                      ))}
                    </div>
                    <div className="dp-grid" ref={gridRef} onKeyDown={onGridKey}>
                      {cells.map((cell) => {
                        const on = cell.iso === start || cell.iso === end;
                        return (
                          <button
                            type="button"
                            key={cell.iso}
                            className="dp-day"
                            data-iso={cell.iso}
                            data-outside={cell.outside || undefined}
                            data-today={cell.iso === TODAY || undefined}
                            data-range={between(cell.iso, start, end) || undefined}
                            data-selected={on || undefined}
                            aria-pressed={on}
                            aria-label={cell.iso}
                            tabIndex={cell.iso === tabTarget ? 0 : -1}
                            onClick={() => pick(cell)}
                          >
                            {cell.day}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Range only, and only once there's something to say — with
                      nothing picked the panel ends flush at the grid, the same
                      way the Dropdown's ends flush at its list. */}
                  {range && start && (
                    <div className="dp-foot">
                      {end ? (
                        <span className="dp-chip">
                          {start}
                          {RANGE_SEP}
                          {end}
                          <button type="button" className="dp-chip-x" aria-label="Clear range" onClick={clear}>
                            <CircleX />
                          </button>
                        </span>
                      ) : (
                        <p className="dp-hint">Pick the end date.</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </SpecOverlay>
        </label>
        {invalid && (
          <span className="field-error-msg" id="dp-demo-error">
            {ERROR_MESSAGE}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Copyable output ─────────────────────────────────────────────────────────

const CLASS = "loka-date-picker";

export function datePickerCss({ variant }) {
  const range = isRange(variant);

  return blocks(
    rule(`.${CLASS}`, [
      ["display", "flex"],
      ["flex-direction", "column"],
      ["gap", `${T.gap}px`],
      ["width", "100%"],
      ["max-width", "380px"],
    ]),
    rule(`.${CLASS}__label`, [
      ["font-family", FONT_STACK],
      ["font-size", `${T.labelSize}px`],
      ["font-weight", T.labelWeight],
      ["color", T.inkLabel],
    ]),
    // Two inputs rather than one, in range mode: a native date field holds one
    // value, so the range is a pair of them with the separator between.
    range
      ? rule(`.${CLASS}__range`, [
          ["display", "flex"],
          ["align-items", "center"],
          ["gap", "8px"],
        ])
      : "",
    range
      ? rule(`.${CLASS}__sep`, [
          ["flex", "none"],
          ["font-family", FONT_STACK],
          ["font-size", `${T.fontSize}px`],
          ["color", T.dayInk],
        ])
      : "",
    rule(`.${CLASS}__control`, [
      ["width", "100%"],
      ["min-width", "0"],
      ["height", `${T.height}px`],
      ["padding", `0 ${T.padX}px`],
      ["font-family", FONT_STACK],
      ["font-size", `${T.fontSize}px`],
      ["color", T.ink],
      ["background", T.fill],
      ["border", `1px solid ${T.line}`],
      ["border-radius", `${T.radius}px`],
      ["transition", "border-color .14s, box-shadow .14s"],
    ]),
    rule(`.${CLASS}__control:focus`, [
      ["outline", "none"],
      ["border-color", T.blue],
      ["box-shadow", `0 0 0 ${T.ring}px ${T.blueSoft}`],
    ]),
    rule(`.${CLASS}__control[aria-invalid="true"]`, [["border-color", T.danger]]),
    rule(`.${CLASS}__control[aria-invalid="true"]:focus`, [
      ["box-shadow", `0 0 0 ${T.ring}px ${T.dangerSoft}`],
    ]),
    rule(`.${CLASS}__control:disabled`, [
      ["opacity", T.disabledOpacity],
      ["cursor", "not-allowed"],
    ]),
    // The native control brings its own calendar glyph, so this sizes and
    // positions that one instead of adding a second. It can't be recoloured —
    // see the note in the markup.
    rule(`.${CLASS}__control::-webkit-calendar-picker-indicator`, [
      ["width", `${T.iconSize}px`],
      ["height", `${T.iconSize}px`],
      ["opacity", "0.55"],
      ["cursor", "pointer"],
    ]),
    rule(`.${CLASS}__error`, [
      ["font-family", FONT_STACK],
      ["font-size", `${T.errorSize}px`],
      ["color", T.danger],
    ]),
  );
}

// Emitted as native date inputs in the family's box. The library's picker is a
// custom widget — the panel, the six-row grid, the range's two-pick commit and
// its keyboard map all need JavaScript — and a snippet that renders a broken
// half of it would be worse than one that renders a working simpler thing. The
// full panel spec lives in the AI prompt tab instead.
export function datePickerHtmlSnippet({ variant }) {
  const range = isRange(variant);
  const id = "date-demo";

  const control = (suffix, label) =>
    `<input type="date" id="${id}${suffix}" class="${CLASS}__control" value="${TODAY}" aria-label="${label}">`;

  const body = range
    ? [
        `<div class="${CLASS}__range">`,
        indent(control("-start", "Start date")),
        indent(`<span class="${CLASS}__sep" aria-hidden="true">${RANGE_SEP.trim()}</span>`),
        indent(control("-end", "End date")),
        "</div>",
      ].join("\n")
    : control("", variant);

  const markup = [
    `<div class="${CLASS}">`,
    indent(`<label class="${CLASS}__label" for="${id}${range ? "-start" : ""}">${variant}</label>`),
    indent(body),
    "</div>",
    "",
    `<!-- Native date inputs in the field family's box. The Loka picker is a`,
    `     custom widget that needs JavaScript — the panel, the always-six-row`,
    `     grid,${range ? " the two-pick range commit," : ""} arrow-key navigation — see the AI prompt tab`,
    "     for its full spec.",
    "",
    "     The native calendar glyph can be sized and positioned but not",
    `     recoloured, so it sits at 55% opacity rather than gray-50 (${T.trigger}).`,
    "     A custom trigger button is what gets you the exact token.",
    range
      ? "\n     Two inputs, because a native date field holds one value. Validate\n     that start <= end on submit — the pair can't enforce it between them. -->"
      : " -->",
  ].join("\n");

  return htmlDocument({ title: `Date Picker — ${variant}`, css: datePickerCss({ variant }), markup });
}

export function datePickerPromptSnippet({ variant }) {
  const range = isRange(variant);

  return specPrompt({
    component: "Date Picker",
    config: variant,
    sections: [
      [
        "Trigger",
        [
          ["Width", "fills its container, up to 380px"],
          ["Height", `${T.height}px`],
          ["Padding", `0 ${SIDE_PAD}px 0 ${T.padX}px — the right side is the calendar trigger's reserved slot`],
          ["Radius", `${T.radius}px`],
          ["Border", `1px solid ${tokenRef(T.line)}`],
          ["Fill", tokenRef(T.fill)],
          [
            "Calendar glyph",
            `${T.iconSize}px in a ${T.hit}px hit box, ${T.padX}px from the right edge, ${tokenRef(T.trigger)} — gray-50 rather than the Search Input's gray-60, because this glyph is a button and that one is decorative`,
          ],
          ["Glyph · disabled", tokenRef(T.triggerOff)],
        ],
      ],
      [
        "Panel",
        [
          ["Position", `absolute, ${T.panelGap}px below the trigger, the trigger's own width, z-index above the page`],
          ["Fill", tokenRef(T.panelFill)],
          ["Border", `1px solid ${tokenRef(T.panelLine)}`],
          ["Radius", `${T.panelRadius}px, with overflow clipped so the header's corners follow it`],
          ["Backdrop", "blur(30px)"],
          ["Month header", `${T.height}px tall, ${tokenRef(T.headFill)}, 1px ${tokenRef(T.headLine)} bottom border, ${T.padX}px side padding`],
          ["Month label", `${T.monthSize}px / ${T.labelWeight}, ${tokenRef(T.inkLabel)}, aria-live="polite"`],
          ["Month arrows", `${T.iconSize}px glyphs in ${T.hit}px boxes, ${tokenRef(T.trigger)}`],
          ["Calendar body", `${tokenRef(T.calFill)}, ${T.calPad}px padding`],
        ],
      ],
      [
        "Grid",
        [
          ["Columns", "7, equal width — Monday first"],
          ["Rows", `${ROWS}, always — the neighbouring months fill the leading and trailing slots`],
          ["Weekday row", `${T.weekSize}px, weight ${T.labelWeight}, uppercase, .06em tracking, ${tokenRef(T.weekInk)}`],
          ["Day cell", `${T.cell}px tall, ${T.cellRadius}px radius, ${T.cellGap}px gap`],
          ["Day text", `${T.fontSize}px, ${tokenRef(T.dayInk)}`],
          ["Day · hover", tokenRef(T.dayHover)],
          ["Day · selected", `${tokenRef(T.selected)} fill, ${tokenRef(T.selectedInk)} text, weight 500`],
          ...(range ? [["Day · inside the range", tokenRef(T.range)]] : []),
          ["Day · today", `${tokenRef(T.today)} text at weight 500, no fill — so it can't be mistaken for the selection`],
          ["Day · outside the month", tokenRef(T.dayOutside)],
          ["Day · unavailable", `${tokenRef(T.dayOff)}, cursor: not-allowed — for min/max bounds`],
          ...(range
            ? [["Range chip", `${tokenRef(T.chipFill)} on 1px ${tokenRef(T.chipLine)}, 100px radius, ${T.fontSize}px ${tokenRef(T.chipInk)}, with a ${T.hit}px clear button`]]
            : []),
        ],
      ],
      [
        "Type & format",
        [
          ["Family", "Alliance No.2"],
          ["Value", `${T.fontSize}px`],
          ["Value colour", tokenRef(T.ink)],
          ["Placeholder", `"${range ? PLACEHOLDER.range : PLACEHOLDER.single}", ${tokenRef(T.placeholder)}`],
          ["Label", `${T.labelSize}px / ${T.labelWeight}, ${tokenRef(T.inkLabel)}`],
          ["Gap", `${T.gap}px — the same gap above the trigger and below it`],
          ["Format", `ISO 8601 (YYYY-MM-DD)${range ? `, the two dates joined by "${RANGE_SEP.trim()}"` : ""} — displayed and accepted`],
        ],
      ],
    ],
    states: [
      `Open: the panel is absolutely positioned and overlays what's below rather than pushing the page down. The calendar glyph collapses it, and so do Escape and a click outside.`,
      range
        ? "Selecting: the first pick sets the start and the panel stays open; the second sets the end and closes it. A second pick earlier than the first swaps the two rather than rejecting it. Until the end lands, the footer reads \"Pick the end date.\""
        : "Selecting: the pick fills the field and closes the panel — one value, so there's nothing left to confirm.",
      `Focus: border becomes ${tokenRef(T.blue)} with a ${T.ring}px ${tokenRef(T.blueSoft)} ring over 140ms, drawn with :focus-within on the trigger row since the calendar button sits outside the input.`,
      `Error: border becomes ${tokenRef(T.danger)}, the ring becomes ${tokenRef(T.dangerSoft)}, and a ${T.errorSize}px message in ${tokenRef(T.danger)} appears below at the same ${T.gap}px gap. Drive it from aria-invalid and point at the message with aria-describedby.`,
      `Disabled: ${PCT(T.disabledOpacity)} opacity, cursor: not-allowed, and the trigger's glyph steps down to ${tokenRef(T.triggerOff)}.`,
    ],
    notes: [
      ...ruleTexts(datePickerRules(variant)),
      "Keyboard: the arrow keys move a roving tabindex through the grid one day (left/right) or one week (up/down) at a time, paging the month when they cross its edge — moving does not select; Enter or a click does. Escape closes the panel and returns focus to the trigger.",
      range
        ? "Only the panel writes a range — the field is read-only, since two dates in one text box have no separator every reader parses the same way. Single date keeps its field typeable; see that variant."
        : "The field stays typeable: what it displays is ISO and ISO is what it parses, so the two round-trip. Commit on Enter or blur rather than per keystroke — \"2026-0\" is a date halfway through being typed, not an invalid one. Round-trip the parse (re-format what you parsed and compare) so 2026-02-30 is caught rather than silently normalised to March 2nd.",
      "No Figma node is sourced for this component. The trigger is the Input Field family's box with the Search Input's icon math on a trailing glyph, and the panel is the Dropdown's own open panel with its 48px option row re-cut as a day cell — every value above is already published somewhere else in the system.",
    ],
    reference: datePickerHtmlSnippet({ variant }),
  });
}
