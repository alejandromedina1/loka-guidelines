import { useState } from "react";
import { CheckIcon, ChevronToggle, CopyIcon } from "../common/Icon.jsx";

// The playground's code drawer, in two pieces because they live in two places:
// the toggle sits in the canvas foot and the panel opens under the canvas, and
// the parent owns the open/closed flag between them.
//
// Shared rather than written per lab. Every surface that hands over code hands
// over the same two things in the same two tabs — a self-contained HTML + CSS
// block and a prompt for a coding agent — and the whole value of that promise is
// that it's identical wherever you find it.
const CODE_VIEWS = [
  {
    id: "html",
    label: "HTML + CSS",
    ext: "html",
    copy: "Copy snippet",
    hint: "Self-contained — paste it into any page and it renders. Move the CSS into your stylesheet and rename the classes to suit.",
  },
  {
    id: "prompt",
    label: "AI prompt",
    ext: "md",
    copy: "Copy prompt",
    hint: "Paste into Claude Code, Cursor, or any coding agent to build this in your own framework and conventions.",
  },
];

export function CodeToggle({ open, onToggle }) {
  return (
    <button className="pg-viewcode" onClick={onToggle}>
      {open ? "Hide code" : "Get the code"}
      <ChevronToggle open={open} />
    </button>
  );
}

// `snippets` is `{ html, prompt }`; `name` is what the download-style filename is
// built from. Which tab you're on is the panel's own business — it's a way of
// reading the same thing, not state anything outside the drawer acts on.
export function CodePanel({ snippets, name, copied, onCopy }) {
  const [viewId, setViewId] = useState("html");
  const view = CODE_VIEWS.find((v) => v.id === viewId) ?? CODE_VIEWS[0];
  const code = snippets?.[view.id] ?? "";
  const filename = `${name.toLowerCase().replace(/\s+/g, "-")}.${view.ext}`;
  const copyId = `pg-code-${view.id}`;

  return (
    <div className="pg-code">
      <div className="pg-code-head">
        <div className="pg-code-tabs" role="tablist" aria-label="Code format">
          {CODE_VIEWS.map((v) => (
            <button
              key={v.id}
              role="tab"
              className="pg-code-tab"
              data-active={v.id === view.id}
              aria-selected={v.id === view.id}
              onClick={() => setViewId(v.id)}
            >
              {v.label}
            </button>
          ))}
        </div>
        <button className="pg-code-copy" onClick={() => onCopy(code, copyId)}>
          {copied === copyId ? (
            <>
              <CheckIcon /> Copied
            </>
          ) : (
            <>
              <CopyIcon /> {view.copy}
            </>
          )}
        </button>
      </div>
      {/* What the format is for. Without it the tabs read as two flavours of the
          same thing, and the prompt tab in particular isn't self-explanatory. */}
      <div className="pg-code-hint">
        <span>{view.hint}</span>
        <span className="pg-code-file">{filename}</span>
      </div>
      <pre className="pg-code-body">
        <span className="pg-ln">
          {code
            .split("\n")
            .map((_, i) => i + 1)
            .join("\n")}
        </span>
        <code>{code}</code>
      </pre>
    </div>
  );
}
