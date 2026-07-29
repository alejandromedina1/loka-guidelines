// Pure styling logic for the interactive Button preview. Kept out of the React
// component so the visual rules are easy to read and adjust in one place.

// Height / padding / font size for each supported button size.
export const SIZE_SPEC = {
  "32px": { height: 32, padding: "0 14px", font: 13 },
  "40px": { height: 40, padding: "0 18px", font: 14 },
  "44px": { height: 44, padding: "0 22px", font: 15 },
};

// Base appearance per variant. A few values depend on the active theme.
function variantStyles(dark) {
  return {
    Primary: { background: "var(--blue)", color: "#fff", border: "1px solid var(--blue)" },
    Secondary: {
      background: dark ? "#fff" : "var(--ink)",
      color: dark ? "var(--ink)" : "#fff",
      border: "1px solid transparent",
    },
    Outline: {
      background: "transparent",
      color: dark ? "#fff" : "var(--ink)",
      border: `1px solid ${dark ? "rgba(255,255,255,.3)" : "var(--line-strong)"}`,
    },
    Ghost: { background: "transparent", color: dark ? "#fff" : "var(--ink)", border: "1px solid transparent" },
  };
}

// Hover / pressed overrides layered on top of the base variant.
function stateStyles(dark) {
  return {
    Primary: {
      hover: { background: "#1246C9", border: "1px solid #1246C9" },
      pressed: { background: "#0E37A0", border: "1px solid #0E37A0" },
    },
    Secondary: {
      hover: { background: dark ? "#E4E8EE" : "#1E2A3D" },
      pressed: { background: dark ? "#CFD6E0" : "#28374F" },
    },
    Outline: {
      hover: {
        background: dark ? "rgba(255,255,255,.08)" : "var(--bg-soft)",
        border: `1px solid ${dark ? "rgba(255,255,255,.5)" : "var(--ink-3)"}`,
      },
      pressed: {
        background: dark ? "rgba(255,255,255,.14)" : "var(--line-2)",
        border: `1px solid ${dark ? "rgba(255,255,255,.6)" : "var(--ink-2)"}`,
      },
    },
    Ghost: {
      hover: { background: dark ? "rgba(255,255,255,.08)" : "var(--bg-soft)" },
      pressed: { background: dark ? "rgba(255,255,255,.14)" : "var(--line-2)" },
    },
  };
}

// Builds the full inline style for a button in a given variant/size/state.
export function makeButtonStyle({ variant, state = "default", size, disabled, dark }) {
  const spec = SIZE_SPEC[size];
  const base = variantStyles(dark)[variant];
  const override = disabled || state === "default" ? {} : stateStyles(dark)[variant][state];
  return {
    ...base,
    ...override,
    height: spec.height,
    padding: spec.padding,
    fontSize: spec.font,
    fontFamily: "var(--display)",
    fontWeight: 600,
    borderRadius: 999,
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.45 : 1,
    transform: !disabled && state === "pressed" ? "scale(0.97)" : "scale(1)",
    transition: "background .12s, border-color .12s, transform .08s",
  };
}

// The copyable ERB snippet reflecting the current button configuration.
export function buttonSnippet({ variant, size, leadingIcon, disabled }) {
  return (
    `<%= render ButtonComponent.new(` +
    `variant: :${variant.toLowerCase()}, size: :${size.replace("px", "")}` +
    (leadingIcon ? `, icon: "arrow"` : "") +
    (disabled ? `, disabled: true` : "") +
    `, label: "Label") %>`
  );
}
