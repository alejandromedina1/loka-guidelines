// Small, reusable UI glyphs shared across the app. Centralizing them here keeps
// the feature components free of repeated inline <svg> markup. Each accepts a
// `size` prop and inherits color via `currentColor`.

export function CheckIcon({ size = 13 }) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size}>
      <path d="M13.5 4.5L6 12L2.5 8.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CopyIcon({ size = 13 }) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size}>
      <rect x="5" y="5" width="8" height="8" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3 11V4a1 1 0 011-1h7" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function ChevronDown({ size = 12 }) {
  return (
    <svg viewBox="0 0 12 12" width={size} height={size}>
      <path d="M3 4.5L6 7.5L9 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CaretRight({ size = 9 }) {
  return (
    <svg viewBox="0 0 10 10" width={size} height={size}>
      <path d="M3 2.5L6 5L3 7.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Filled caret used by the multi-select control — the Loka Figma "arrow"
// component (node 4864:23773), which ships as one glyph in two states:
// wrapped points down, unwrapped points up. Distinct from ChevronDown, which is
// stroked. The triangle is 6x3 centred at (6, 5.5), and the 1px round-joined
// stroke is what gives the corners their slight softness at this size.
export function CaretDown({ open, size = 12 }) {
  return (
    <svg viewBox="0 0 12 12" width={size} height={size} aria-hidden>
      <path
        d={open ? "M9 7H3L6 4L9 7Z" : "M9 4H3L6 7L9 4Z"}
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// The tick inside the Checkbox control — material-symbols:check, as the Loka
// Figma checkbox ships it. Figma crops the glyph to the middle 12px of its 24px
// box rather than scaling it down, so the viewBox is offset instead of resized:
// shrinking it would thin the stroke.
export function CheckSmall({ size = 12 }) {
  return (
    <svg viewBox="6 6 12 12" width={size} height={size} aria-hidden>
      <path
        d="M10.4969 15.3333L7 12.1733L7.87423 11.3832L10.4969 13.7533L16.1258 8.66667L17 9.45669L10.4969 15.3333Z"
        fill="currentColor"
      />
    </svg>
  );
}

// Circle with the cross knocked out — removes a selected tag.
export function CircleX({ size = 15 }) {
  return (
    <svg viewBox="0 0 15 15" width={size} height={size} aria-hidden>
      <path
        d="M7.5 0C11.6421 0 15 3.35786 15 7.5C15 11.6421 11.6421 15 7.5 15C3.35786 15 0 11.6421 0 7.5C0 3.35786 3.35786 0 7.5 0ZM7.5 6.83008L5.18359 4.51465L4.52051 5.17676L6.83691 7.49316L4.51367 9.81738L5.17676 10.4805L7.5 8.15625L9.82422 10.4805L10.4873 9.81738L8.16309 7.49316L10.4805 5.17676L9.81738 4.51367L7.5 6.83008Z"
        fill="currentColor"
      />
    </svg>
  );
}

// The heavier check that marks a chosen option in the dropdown list.
export function CheckBold({ size = 24 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <path d="M5 11.5L9.32824 16L18 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

export function ArrowLeft({ size = 16 }) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size}>
      <path d="M12 5l-5 5 5 5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ArrowRight({ size = 16 }) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size}>
      <path d="M8 5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// The leading-icon arrow used inside buttons.
export function ArrowInline({ size = 14 }) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} aria-hidden>
      <path d="M3 8h9M8 3.5L12.5 8L8 12.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SearchIcon({ size = 16, strokeWidth = 1.5 }) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size}>
      <circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" strokeWidth={strokeWidth} />
      <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  );
}

// The Date Picker's trailing glyph. Traced at this size rather than scaled down
// from the published 24px Calendar icon (see icons.js): that one carries a
// hairline 0.5px stroked sub-path, which 24→16 would thin to a third of a
// pixel — the same reason CheckSmall crops its Figma glyph instead of resizing
// it. Same silhouette as the published icon (body, header band, two tabs), and
// the same 1.5px stroke the other 16px field glyphs use. The library icon is
// still the canonical one at 24px.
export function CalendarIcon({ size = 16, strokeWidth = 1.5 }) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} aria-hidden>
      <rect x="2" y="3.5" width="12" height="10.5" rx="1.5" fill="none" stroke="currentColor" strokeWidth={strokeWidth} />
      <path d="M2 7.25h12" stroke="currentColor" strokeWidth={strokeWidth} />
      <path d="M5.5 2v2.5M10.5 2v2.5" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  );
}

// A circled "i" — the Tooltip's single-icon variant hangs its longer
// explanation off this glyph rather than a formatting button.
export function InfoIcon({ size = 16, strokeWidth = 1.5 }) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} aria-hidden>
      <circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth={strokeWidth} />
      <circle cx="8" cy="5.1" r="0.9" fill="currentColor" />
      <path d="M8 7.5V11.2" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  );
}

export function SunIcon({ size = 16 }) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size}>
      <circle cx="10" cy="10" r="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.2 4.2l1.4 1.4M14.4 14.4l1.4 1.4M15.8 4.2l-1.4 1.4M5.6 14.4l-1.4 1.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function MoonIcon({ size = 16 }) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size}>
      <path d="M16 11.5A6 6 0 018.5 4a6 6 0 100 12 6 6 0 007.5-4.5z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function MenuIcon({ size = 18 }) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size}>
      <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

// Plus/minus glyph for the accordion; the vertical stroke animates via CSS.
export function PlusMinusIcon({ size = 16 }) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size}>
      <path d="M3 8h10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path className="faq-icon-v" d="M8 3v10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

// A vertical chevron that flips based on `open`, used by the "View code" toggle.
export function ChevronToggle({ open, size = 14 }) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size}>
      <path d={open ? "M4 10l4-4 4 4" : "M4 6l4 4 4-4"} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Device toggle pair for the playground's properties panel — Loka Figma
// "24 / mobile" (node 122:146) and "24 / desktop" (node 122:142). Each is a
// stroked outer rect (the phone/monitor body) plus a second, solid rect
// flush against one edge (the phone's top notch, the monitor's stand) — two
// separate overlapping shapes in Figma, not a cutout carved from the outline.
// Tracing it as one subtractive path instead reads as a tank top, not a phone.
export function MobileIcon({ size = 16 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <rect x="6" y="3" width="12" height="18" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect x="9" y="3" width="6" height="4" fill="currentColor" />
    </svg>
  );
}

export function DesktopIcon({ size = 16 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <rect x="1" y="3" width="22" height="15" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect x="9" y="17" width="6" height="4" fill="currentColor" />
    </svg>
  );
}

// The dotted-square token glyph used by the spacing cards.
export function TokenDotIcon({ size = 13 }) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size}>
      <rect x="2.5" y="2.5" width="11" height="11" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="8" cy="8" r="2" fill="currentColor" />
    </svg>
  );
}
