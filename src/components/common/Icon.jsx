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
