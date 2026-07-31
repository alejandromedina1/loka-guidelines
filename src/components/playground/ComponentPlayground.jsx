import { useState } from "react";
import { COMPONENT_LIST } from "../../data/components.js";
import {
  BUTTON_VARIANTS,
  DARK_SURFACE_VARIANTS,
  DEVICE_SPEC,
  GHOST_SURFACES,
  buttonSnippet,
} from "./buttonStyles.js";
import { PgSelect } from "./controls/PgSelect.jsx";
import { PgToggle } from "./controls/PgToggle.jsx";
import { ButtonPreview } from "./previews/ButtonPreview.jsx";
import { AccordionPreview } from "./previews/AccordionPreview.jsx";
import { AvatarsPreview } from "./previews/AvatarsPreview.jsx";
import { FilterPreview } from "./previews/FilterPreview.jsx";
import { CheckboxPreview } from "./previews/CheckboxPreview.jsx";
import { InputFieldPreview, inputFieldSnippet } from "./previews/InputFieldPreview.jsx";
import { ArrowLeft, ArrowRight, ChevronToggle, CheckIcon, CopyIcon } from "../common/Icon.jsx";

const FIELD_TYPES = ["Text", "Email", "Textarea", "Select"];

// The component documentation surface: a live preview canvas, a prev/next
// cycler, per-component property controls, and a copyable code snippet.
// The Button is the fully-built reference component; others show a placeholder.
export function ComponentPlayground({ copied, onCopy, selected, setSelected, theme }) {
  const dark = theme === "dark";
  const isButton = selected === "Button";
  const isInputField = selected === "Input Field";
  const isCheckbox = selected === "Checkbox";
  const isFilter = selected === "Filter";
  // Every component with a spec sheet written for it.
  const hasBestPractices = isButton || isCheckbox || isFilter || isInputField;

  const [variant, setVariant] = useState("Primary");
  const [device, setDevice] = useState("Desktop");
  const [surface, setSurface] = useState("Gray 10");
  const [disabled, setDisabled] = useState(false);
  const [bestPractices, setBestPractices] = useState(false);
  const [showBehaviour, setShowBehaviour] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [btnState, setBtnState] = useState("default"); // default | hover | pressed

  const [fieldType, setFieldType] = useState("Text");
  const [fieldDisabled, setFieldDisabled] = useState(false);
  const [fieldError, setFieldError] = useState(false);

  const cycle = (dir) => {
    const i = COMPONENT_LIST.indexOf(selected);
    const next = (i + dir + COMPONENT_LIST.length) % COMPONENT_LIST.length;
    setSelected(COMPONENT_LIST[next]);
  };

  // Outline dark is white-on-dark by design, so the canvas follows the variant
  // rather than the app theme for it. Ghost brings its own surface instead.
  const darkCanvas = dark || (isButton && DARK_SURFACE_VARIANTS.includes(variant));

  const code = isButton
    ? buttonSnippet({ variant, device, surface, disabled })
    : isInputField
      ? inputFieldSnippet({ type: fieldType, disabled: fieldDisabled, error: fieldError })
      : "";
  const stateLabel = disabled
    ? "Disabled"
    : btnState === "hover"
      ? "Hovered"
      : btnState === "pressed"
        ? "Pressed"
        : "Default";

  const renderPreview = () => {
    if (isButton) {
      return (
        <ButtonPreview
          variant={variant}
          device={device}
          surface={surface}
          disabled={disabled}
          bestPractices={bestPractices}
          showBehaviour={showBehaviour}
          btnState={btnState}
          setBtnState={setBtnState}
        />
      );
    }
    if (selected === "Accordion") return <AccordionPreview />;
    if (selected === "Avatars") return <AvatarsPreview />;
    if (isFilter) return <FilterPreview bestPractices={bestPractices} />;
    if (isCheckbox) {
      return <CheckboxPreview disabled={disabled} bestPractices={bestPractices} />;
    }
    if (isInputField) {
      return (
        <InputFieldPreview
          type={fieldType}
          disabled={fieldDisabled}
          error={fieldError}
          bestPractices={bestPractices}
        />
      );
    }
    return (
      <div className="pg-empty">
        <span className="pg-empty-name">{selected}</span>
        <span className="pg-empty-note">Live preview coming soon</span>
      </div>
    );
  };

  return (
    <div className="pg pg-nolist">
      <div className="pg-stage">
        <div className={`pg-canvas ${darkCanvas ? "dark" : ""}`}>
          <div className="pg-canvas-nav">
            {isButton && (
              <span className="btn-state-label" data-state={disabled ? "disabled" : btnState}>
                {stateLabel}
              </span>
            )}
            <button className="pg-arrow" aria-label="Previous" onClick={() => cycle(-1)}>
              <ArrowLeft />
            </button>
            <button className="pg-arrow" aria-label="Next" onClick={() => cycle(1)}>
              <ArrowRight />
            </button>
          </div>

          <div className="pg-canvas-center">{renderPreview()}</div>

          <div className="pg-canvas-foot">
            {isButton ? (
              <div className="canvas-variants">
                {BUTTON_VARIANTS.map((v) => (
                  <button
                    key={v}
                    className="canvas-variant-btn"
                    data-active={variant === v}
                    onClick={() => setVariant(v)}
                  >
                    {v}
                  </button>
                ))}
              </div>
            ) : (
              <span />
            )}
            {code && (
              <button className="pg-viewcode" onClick={() => setShowCode((v) => !v)}>
                {showCode ? "Hide code" : "View code"}
                <ChevronToggle open={showCode} />
              </button>
            )}
          </div>
        </div>

        {showCode && code && (
          <div className="pg-code">
            <div className="pg-code-head">
              <span className="pg-code-file">{selected.toLowerCase().replace(/\s+/g, "_")}.html.erb</span>
              <button className="pg-code-copy" onClick={() => onCopy(code, "pg-code")}>
                {copied === "pg-code" ? (
                  <>
                    <CheckIcon /> Copied
                  </>
                ) : (
                  <>
                    <CopyIcon /> Copy snippet
                  </>
                )}
              </button>
            </div>
            <pre className="pg-code-body">
              <span className="pg-ln">1</span>
              <code>{code}</code>
            </pre>
          </div>
        )}
      </div>

      <div className="pg-controls">
        <div className="pg-ctrl-head">
          <span className="pg-ctrl-title">{selected}</span>
        </div>
        {isInputField ? (
          <>
            <PgSelect label="Type" value={fieldType} options={FIELD_TYPES} onChange={setFieldType} />
            <PgToggle label="Disabled" value={fieldDisabled} onChange={setFieldDisabled} />
            <PgToggle label="Error state" value={fieldError} onChange={setFieldError} />
            <PgToggle label="Best practices" value={bestPractices} onChange={setBestPractices} />
          </>
        ) : (
          <>
            <PgSelect
              label="Device"
              value={device}
              options={Object.keys(DEVICE_SPEC)}
              onChange={setDevice}
              disabled={!isButton}
            />
            {isButton && variant === "Ghost" && (
              <PgSelect
                label="Surface"
                value={surface}
                options={Object.keys(GHOST_SURFACES)}
                onChange={setSurface}
              />
            )}
            {/* Checkbox documents a disabled state too, so the control stays live for it. */}
            <PgToggle
              label="Disabled"
              value={disabled}
              onChange={setDisabled}
              disabled={!isButton && !isCheckbox}
            />
            <PgToggle
              label="Best practices"
              value={bestPractices}
              onChange={setBestPractices}
              disabled={!hasBestPractices}
            />
            <PgToggle label="Show behaviour" value={showBehaviour} onChange={setShowBehaviour} disabled={!isButton} />
          </>
        )}
      </div>
    </div>
  );
}
