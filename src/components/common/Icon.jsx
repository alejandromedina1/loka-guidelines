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

// Filled caret used by the multi-select control. Distinct from ChevronDown,
// which is stroked — this is the glyph the Figma dropdown ships with.
export function CaretDown({ size = 12 }) {
  return (
    <svg viewBox="0 0 12 12" width={size} height={size} aria-hidden>
      <path
        d="M10.0156 4.76531L6.26561 8.51531C6.23078 8.55018 6.18942 8.57784 6.1439 8.59671C6.09837 8.61558 6.04958 8.62529 6.0003 8.62529C5.95101 8.62529 5.90222 8.61558 5.85669 8.59671C5.81117 8.57784 5.76981 8.55018 5.73498 8.51531L1.98498 4.76531C1.93248 4.71287 1.89672 4.64602 1.88222 4.57324C1.86773 4.50046 1.87515 4.42501 1.90356 4.35645C1.93197 4.28789 1.98008 4.22931 2.0418 4.1881C2.10352 4.1469 2.17608 4.12494 2.2503 4.125H9.7503C9.82451 4.12494 9.89707 4.1469 9.95879 4.1881C10.0205 4.22931 10.0686 4.28789 10.097 4.35645C10.1254 4.42501 10.1329 4.50046 10.1184 4.57324C10.1039 4.64602 10.0681 4.71287 10.0156 4.76531Z"
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

// The dotted-square token glyph used by the spacing cards.
export function TokenDotIcon({ size = 13 }) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size}>
      <rect x="2.5" y="2.5" width="11" height="11" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="8" cy="8" r="2" fill="currentColor" />
    </svg>
  );
}
