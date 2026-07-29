import { SPACING } from "../../data/spacing.js";
import { TokenDotIcon } from "../common/Icon.jsx";

// A Figma-variables-style grid of spacing tokens. Each card copies its CSS
// custom-property reference (e.g. `var(--space-16)`).
export function SpacingScale({ copied, onCopy }) {
  return (
    <div className="vargrid">
      {SPACING.map((t) => {
        const id = `space-${t.value}`;
        return (
          <button
            key={t.name}
            className="varcard"
            onClick={() => onCopy(`var(--${t.name})`, id)}
            title={`Copy var(--${t.name})`}
          >
            <span className="varcard-top">
              <span className="varcard-icon" aria-hidden>
                <TokenDotIcon />
              </span>
              <span className="varcard-copy">{copied === id ? "Copied" : "Copy"}</span>
            </span>
            <span className="varcard-name">{t.name}</span>
            <span className="varcard-value">{t.value}px</span>
          </button>
        );
      })}
    </div>
  );
}
