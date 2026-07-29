import { useState } from "react";
import { ChevronDown } from "../../common/Icon.jsx";

const SELECT_OPTIONS = ["New project", "Ongoing support", "General question"];

const FIELD_COPY = {
  Text: { label: "Full name", placeholder: "John" },
  Email: { label: "Company Email", placeholder: "john@company.com" },
  Textarea: { label: "What else should we know before responding?", placeholder: "Let us know here…" },
  Select: { label: "What best describes your need?", placeholder: "Select an option" },
};

// Live Input Field preview — label sits a full space-10 above the control, and
// every control (text, textarea, select) shares the same fill/border/radius
// so the field family reads as one component.
export function InputFieldPreview({ type, disabled, error }) {
  const [text, setText] = useState("");
  const [selected, setSelected] = useState("");
  const copy = FIELD_COPY[type];

  return (
    <div className="field-demo">
      <label className="field">
        <span className="field-label">{copy.label}</span>
        {type === "Textarea" ? (
          <textarea
            className="field-textarea"
            data-error={error}
            placeholder={copy.placeholder}
            disabled={disabled}
          />
        ) : type === "Select" ? (
          <span className="field-select-wrap">
            <select
              className={`field-select ${selected ? "" : "field-select-placeholder"}`}
              data-error={error}
              disabled={disabled}
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
            >
              <option value="" disabled>
                {copy.placeholder}
              </option>
              {SELECT_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
            <ChevronDown />
          </span>
        ) : (
          <input
            className="field-input"
            data-error={error}
            type={type === "Email" ? "email" : "text"}
            placeholder={copy.placeholder}
            disabled={disabled}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        )}
      </label>
      {error && <span className="field-error-msg">This field is required.</span>}
    </div>
  );
}

// The copyable ERB snippet reflecting the current field configuration.
export function inputFieldSnippet({ type, disabled, error }) {
  return (
    `<%= render InputFieldComponent.new(` +
    `type: :${type.toLowerCase()}, label: "${FIELD_COPY[type].label}"` +
    (disabled ? `, disabled: true` : "") +
    (error ? `, error: "This field is required."` : "") +
    `) %>`
  );
}
