import { CheckSmall } from "./Icon.jsx";

// The Checkbox, as a component.
//
// Loka Figma node 3692:15296 documents the circular control at 16px; 24/28/32
// are this system's own scale, for contexts where a bigger target matters more
// than matching the render exactly. 28 is the default.
//
// It lives here for the same reason Button, Field and Tag do: the AI hub's
// Visible Sources pattern lists Checkbox in its `composedOf`, and until now the
// only implementation was wrapped in the Product Hub playground's stage and
// spec-overlay furniture. So the wireframe drew no control at all — the one
// pattern whose whole argument is "sources switch on and off right where
// they're used" had nothing on screen to switch. A second hand-rolled box in
// the preview kit would have made the "Composed from" chip a liar in the other
// direction.
//
// The component owns its own box spec, so the redlines and the rendered thing
// can't disagree. CheckboxPreview still owns the spec sheet and the copyable
// snippets and reads these values from here — the same split buttonStyles.js
// has with Button.
export const CHECKBOX_SIZES = ["24px", "28px", "32px"];

// The tick is roughly 57% of the box at every step rather than a flat
// clearance, so it keeps the same visible breathing room as the box grows.
export const CHECKBOX_TICK = { "24px": 14, "28px": 16, "32px": 18 };
export const tickFor = (size) => CHECKBOX_TICK[size] ?? CHECKBOX_TICK["28px"];

export const CHECKBOX_BOX = { "24px": 24, "28px": 28, "32px": 32 };
// Rounded is the sourced Figma radius — a full circle. Squared is this
// system's own addition; 4px keeps it a square with soft corners.
export const CHECKBOX_RADIUS = { Rounded: 100, Squared: 4 };

export function Checkbox({
  checked,
  hovered,
  disabled,
  shape = "Rounded",
  size = "28px",
  label = "Option label",
  onClick,
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={!!checked}
      aria-label={label}
      className="cbx"
      data-checked={checked || undefined}
      data-hover={hovered || undefined}
      // Rounded and 28px are the defaults global.css already paints, so only a
      // non-default value needs a flag.
      data-shape={shape === "Squared" ? "Squared" : undefined}
      data-size={size !== "28px" ? size : undefined}
      disabled={disabled}
      onClick={onClick}
    >
      {checked ? <CheckSmall size={tickFor(size)} /> : null}
    </button>
  );
}
