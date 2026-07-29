import { useCallback, useRef, useState } from "react";

// Legacy fallback for browsers without the async clipboard API.
function fallbackCopy(text) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand("copy");
  } catch {
    /* no-op: nothing more we can do if the copy command is unsupported */
  }
  document.body.removeChild(ta);
}

// Copy-to-clipboard with a transient "copied" state keyed by an id, so any
// number of copyable elements can share one hook instance and only the most
// recently clicked one shows its confirmation.
export function useCopy() {
  const [copied, setCopied] = useState(null);
  const timer = useRef(null);

  const copy = useCallback((value, id) => {
    const done = () => {
      setCopied(id);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(null), 1400);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(value)
        .then(done)
        .catch(() => {
          fallbackCopy(value);
          done();
        });
    } else {
      fallbackCopy(value);
      done();
    }
  }, []);

  return { copied, copy };
}
