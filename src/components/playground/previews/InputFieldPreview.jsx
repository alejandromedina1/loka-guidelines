import { useState } from "react";
import { MultiSelectField } from "./MultiSelectField.jsx";
import { BestPracticesPanel } from "../BestPracticesPanel.jsx";

const FIELD_COPY = {
  Text: { label: "Full name", placeholder: "John" },
  Email: { label: "Company Email", placeholder: "john@company.com" },
  Textarea: { label: "What else should we know before responding?", placeholder: "Let us know here…" },
  Select: { label: "Multi-select", placeholder: "Type to search" },
};

// Shared across the family; the control rows below vary by type.
const FIELD_BASE_SPECS = [
  ["Radius", "12px"],
  ["Border", "1px var(--line)"],
  ["Fill", "var(--bg-soft) · #FAFBFC"],
  ["Font", "Alliance No.2"],
  ["Label", "13.5px / 500 · var(--ink-2)"],
  ["Label gap", "10px"],
  ["Focus", "blue border + 3px blue-soft ring"],
  ["Error", "var(--danger) border · message 12.5px"],
  ["Error gap", "10px"],
  ["Disabled", "55% opacity"],
];

const FIELD_TYPE_SPECS = {
  Text: [
    ["Height", "48px"],
    ["Padding", "0 16px"],
    ["Text", "14.5px"],
    ["Placeholder", "#A8B3CA · gray-40"],
  ],
  Email: [
    ["Height", "48px"],
    ["Padding", "0 16px"],
    ["Text", "14.5px"],
    ["Placeholder", "#A8B3CA · gray-40"],
  ],
  Textarea: [
    ["Height", "110px min · resizes"],
    ["Padding", "12px 16px"],
    ["Text", "14.5px / 1.5"],
    ["Placeholder", "#A8B3CA · gray-40"],
  ],
  Select: [
    ["Height", "48px closed"],
    ["Padding", "0 16px"],
    ["Text", "14.5px"],
    ["Panel", "absolute · overlays, no reflow"],
    ["Panel fill", "#EEF2FE · blue-5"],
    ["List", "348px max · scrolls"],
    ["Option", "48px · radius 12px · #EFF1F5"],
    ["Tag", "#EEF2FE on 1px #D8E2F6"],
    ["Ceiling", "3 selections"],
  ],
};

const FIELD_NOTES = {
  Text: "One gap governs both sides of the box — 10px to the label above and to the error below — so the message never drifts away from the field it belongs to.",
  Email: "Type email rather than text so mobile keyboards adapt; the visual spec is identical to Text.",
  Textarea:
    "The only control in the family that grows. It keeps the family's 14.5px but relaxes to 1.5 line height, since it holds more than one line.",
  Select:
    "Body text is 14.5px, not the 16px the standalone Figma frame specifies — matching the field family wins over matching the frame. Clicking the control again collapses it; the panel overlays rather than pushing the page down.",
};

// Live Input Field preview — label sits a full space-10 above the control, and
// every control (text, textarea, select) shares the same fill/border/radius
// so the field family reads as one component.
export function InputFieldPreview({ type, disabled, error, bestPractices }) {
  const [text, setText] = useState("");
  const copy = FIELD_COPY[type];

  return (
    <div className="bp-stage">
      <div className="field-demo" data-type={type}>
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
            <MultiSelectField disabled={disabled} error={error} placeholder={copy.placeholder} />
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
      {bestPractices && (
        <BestPracticesPanel
          rows={[["Type", type], ...FIELD_TYPE_SPECS[type], ...FIELD_BASE_SPECS]}
          note={FIELD_NOTES[type]}
        />
      )}
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
