// The demos' shared runtime, ported as written from reference/ai-ui-patterns.html.
//
// These are deliberately the source's own five helpers and not React
// equivalents. Every demo in demos.js drives the DOM directly — textContent,
// innerHTML, .remove() — and the only way to keep their timing and behaviour
// identical is to keep the code they call identical too.
//
// CANCELLATION IS `isConnected`. A demo never holds a timer handle; it checks
// whether its own root is still in the document after every wait, and stops if
// it isn't. DemoStage replays by remounting the root (a new `key`), so the old
// root is detached and whatever was still typing into it gives up at its next
// character. Nothing has to be cleaned up because nothing is left holding on.

// Read once, at load, exactly as the source does. Under reduced motion every
// wait is zero, so an animated demo jumps straight to its finished frame rather
// than being skipped — the end state is still the thing worth seeing.
export const RM =
  typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

export const wait = (ms) => new Promise((r) => setTimeout(r, RM ? 0 : ms));

// Types `text` into `el` one character at a time. Returns false the moment the
// demo's root leaves the document, which is how a replay stops the run before it.
export async function type(el, text, root, speed = 26) {
  for (const ch of text) {
    if (!root.isConnected) return false;
    el.textContent += ch;
    await wait(speed);
  }
  return root.isConnected;
}

export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
