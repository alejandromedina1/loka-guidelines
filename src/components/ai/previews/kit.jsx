import { Button } from "../../common/Button.jsx";
import { Field as SystemField } from "../../common/Field.jsx";
import { Tag } from "../../common/Tag.jsx";
// A tiny wireframe kit, shared by every pattern preview.
//
// The previews have one job: let a designer or a stakeholder look at a pattern
// and see what it would be on screen, in each of its states. That means they
// have to read as *a product* — a surface, a field, a button — without
// pretending to be any particular product, and without becoming a second
// component library that drifts from the Product Hub's real one.
//
// So: deliberately wireframe. Grey placeholder lines stand in for body copy
// wherever the words don't matter, and real text appears only where the words
// *are* the pattern — the refusal sentence, the approval's effect line, the
// citation. That contrast is doing work: it shows at a glance which copy a
// designer has to write and which is just page furniture.
//
// One kit rather than bespoke markup per pattern, so twenty-eight states across
// six patterns read as one system and a change to the surface treatment lands
// everywhere at once.
//
// Buttons, fields and tags are the real things — common/Button.jsx,
// common/Field.jsx, common/Tag.jsx, the same components the Product Hub
// playground renders. The kit used to draw its own of each, which meant a
// second implementation in the project that could drift from the documented
// one, and made a liar of every "Composed from" chip pointing at them. A
// designer looking at a pattern is now looking at the actual controls.
//
// What stays hand-drawn is only what the library doesn't ship: the window
// chrome, the ghost placeholder lines, the callouts, the diff rows. Those are
// scaffolding for the illustration rather than product surface, and inventing
// a component for them would be inventing a component.
//
// All three are wrapped in a .mk-sys-* element, which scales them by one factor
// onto the preview's own ramp — see the token block in global.css. A preview is
// an illustration of a screen rather than a rendering of one, and at their
// documented sizes these controls outweighed everything drawn around them: a
// 40px pill with a 16px label beside 10px placeholder bars, a 14px content Tag
// over the 10px label above it. Scaling them together keeps their
// relationships to each other exactly the system's while fixing their
// relationship to the copy.

// The app surface a pattern sits inside.
export function Frame({ children, width = 460 }) {
  return (
    <div className="mk-frame" style={{ maxWidth: width }}>
      {children}
    </div>
  );
}

// A window chrome bar, so the frame reads as an application rather than a card.
export function FrameBar({ title }) {
  return (
    <div className="mk-bar">
      <span className="mk-bar-dots" aria-hidden />
      {title && <span className="mk-bar-title">{title}</span>}
    </div>
  );
}

export function Body({ children, gap = 12 }) {
  return (
    <div className="mk-body" style={{ gap }}>
      {children}
    </div>
  );
}

// A placeholder line. `w` is a percentage — body copy whose wording is beside
// the point, so the eye goes to the part of the state that matters.
export function Ghost({ w = 100, tone }) {
  return <span className="mk-ghost" data-tone={tone} style={{ width: `${w}%` }} />;
}

// Several at once, for a paragraph-shaped block.
export function GhostLines({ widths = [100, 96, 62], tone }) {
  return (
    <span className="mk-ghosts">
      {widths.map((w, i) => (
        <Ghost key={i} w={w} tone={tone} />
      ))}
    </span>
  );
}

// Real copy. Used only where the words are the pattern.
export function Say({ children, tone, size }) {
  return (
    <p className="mk-say" data-tone={tone} data-size={size}>
      {children}
    </p>
  );
}

export function Label({ children }) {
  return <span className="mk-label">{children}</span>;
}

// An input. `state` drives the border: idle, focus, error, locked.
// The library's own control. `state` maps the kit's vocabulary onto the field
// family's documented states, and `rows > 1` picks the Textarea rather than
// inventing a taller input.
const FIELD_STATES = { idle: "default", focus: "Focus", error: "Error", locked: "Disabled" };

export function Field({ placeholder, value, state = "idle", rows = 1 }) {
  return (
    <span className="mk-sys-block">
      <SystemField
        type={rows > 1 ? "Textarea" : "Text"}
        state={FIELD_STATES[state] ?? "default"}
        value={value || ""}
        placeholder={placeholder}
      />
    </span>
  );
}

// Maps a wireframe's intent onto a variant the library ships. `danger` now has
// a real one to point at — Destructive, added to buttonStyles.js because these
// patterns kept needing it and the semantic ramp had already reserved red for
// exactly this.
const VARIANTS = { primary: "Primary", secondary: "Secondary", danger: "Destructive" };

export function Btn({ children, variant = "secondary", disabled }) {
  return (
    <span className="mk-sys-inline">
      {/* Out of the tab order: these are illustrations of a control, not the
          control. Several dead buttons per state across ten patterns is a lot
          of nothing to tab through, and only the state pills do anything. */}
      <Button variant={VARIANTS[variant] ?? "Secondary"} disabled={disabled} type="button" tabIndex={-1}>
        {children}
      </Button>
    </span>
  );
}

export function Btns({ children, align }) {
  return (
    <span className="mk-btns" data-align={align}>
      {children}
    </span>
  );
}

// The library's Tag at its smallest documented height — these sit inside an
// illustration of a screen, not on the screen itself.
export function Chip({ children }) {
  return (
    <span className="mk-sys-inline">
      <Tag size={20}>{children}</Tag>
    </span>
  );
}

// A callout. Tones are semantic on purpose: `plain` for states that are the
// system working as designed (a refusal, a stop), `warn` for something that
// needs attention, `bad` only for a genuine failure. Spending the danger colour
// on a policy limit is the mistake the Clear Refusal pattern warns about, so
// the kit shouldn't make it the easy option.
export function Note({ children, tone = "plain", title }) {
  return (
    <div className="mk-note" data-tone={tone}>
      {title && <span className="mk-note-title">{title}</span>}
      <span className="mk-note-body">{children}</span>
    </div>
  );
}

// A list row — a ticket, a file, a step.
export function Row({ children, tone, lead }) {
  return (
    <div className="mk-row" data-tone={tone}>
      {lead && <span className="mk-row-lead" data-tone={tone} aria-hidden />}
      <span className="mk-row-body">{children}</span>
    </div>
  );
}

// An inline citation marker.
export function Cite({ n, open }) {
  return (
    <sup className="mk-cite" data-open={open ? "" : undefined}>
      {n}
    </sup>
  );
}

// A determinate step meter, for multi-step execution.
export function Steps({ items, at }) {
  return (
    <ol className="mk-steps">
      {items.map((label, i) => (
        <li key={label} className="mk-step" data-state={i < at ? "done" : i === at ? "now" : "next"}>
          <span className="mk-step-dot" aria-hidden />
          <span className="mk-step-label">{label}</span>
        </li>
      ))}
    </ol>
  );
}

// A bare spinner. Here only so the shortcut variants can show what a pattern
// looks like when somebody reached for one instead of a shape-matched
// placeholder — it exists to lose the comparison.
export function Spinner({ label }) {
  return (
    <span className="mk-spin-wrap">
      <span className="mk-spin" aria-hidden />
      {label && <span className="mk-spin-label">{label}</span>}
    </span>
  );
}

// A monospaced literal — a function call, an id, a raw model string. Used in the
// shortcut variants where the interface leaked its implementation to the user.
export function Code({ children }) {
  return <code className="mk-code">{children}</code>;
}
