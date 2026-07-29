import { CheckIcon, CopyIcon } from "./Icon.jsx";

// A labelled, click-to-copy value chip. `copied`/`onCopy` come from useCopy and
// are keyed by `id` so only this chip shows the confirmation when clicked.
export function CopyValue({ label, value, id, copied, onCopy, mono = true }) {
  const isCopied = copied === id;
  return (
    <button
      className="copyval"
      data-copied={isCopied}
      onClick={() => onCopy(value, id)}
      title={`Copy ${value}`}
    >
      {label && <span className="copyval-key">{label}</span>}
      <span className="copyval-val" style={{ fontFamily: mono ? "var(--mono)" : "inherit" }}>
        {value}
      </span>
      <span className="copyval-icon" aria-hidden>
        {isCopied ? <CheckIcon /> : <CopyIcon />}
      </span>
    </button>
  );
}
