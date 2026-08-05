import { useState } from "react";
import { CHECKBOX_STATES, COMPONENT_LIST, FIELD_STATES } from "../../data/components.js";
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
import { FilterPreview } from "./previews/FilterPreview.jsx";
import { CheckboxPreview } from "./previews/CheckboxPreview.jsx";
import { InputFieldPreview, inputFieldSnippet } from "./previews/InputFieldPreview.jsx";
import { TabsPreview } from "./previews/TabsPreview.jsx";
import { ArrowLeft, ArrowRight, ChevronToggle, CheckIcon, CopyIcon } from "../common/Icon.jsx";

// Tabs documents two things at once — the item and the bar it sits in.
const TABS_VIEWS = ["Item", "Full bar"];

// The component documentation surface: a live preview canvas, a prev/next
// cycler, per-component property controls, and a copyable code snippet.
// The Button is the fully-built reference component; others show a placeholder.
export function ComponentPlayground({ copied, onCopy, selected, setSelected, fieldType, theme }) {
  const dark = theme === "dark";
  const isButton = selected === "Button";
  const isInputField = selected === "Input Field";
  const isCheckbox = selected === "Checkbox";
  const isFilter = selected === "Filter";
  const isTabs = selected === "Tabs";
  // Every component with a spec sheet written for it.
  const hasBestPractices = isButton || isCheckbox || isFilter || isInputField || isTabs;

  const [variant, setVariant] = useState("Primary");
  const [device, setDevice] = useState("Desktop");
  const [surface, setSurface] = useState("Gray 10");
  const [disabled, setDisabled] = useState(false);
  const [bestPractices, setBestPractices] = useState(false);
  const [showBehaviour, setShowBehaviour] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [btnState, setBtnState] = useState("default"); // default | hover | pressed

  const [tabsView, setTabsView] = useState("Item");
  const [cbxState, setCbxState] = useState("Default");

  // The type is chosen in the nav panel and arrives as a prop; the state is the
  // playground's own axis, so it sits on the canvas pills.
  const [fieldState, setFieldState] = useState("Default");

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
      ? inputFieldSnippet({ type: fieldType, state: fieldState })
      : "";
  // The pill strip under the canvas is the switcher for whichever component is
  // on stage: the Button picks its style variant there, the Input Field and the
  // Checkbox the state they're in, Tabs whether it's showing one item or the whole
  // bar. Each is the one axis that changes what you're looking at, so it belongs
  // on the canvas rather than down in the properties panel.
  const canvasTabs = isButton
    ? { options: BUTTON_VARIANTS, value: variant, onSelect: setVariant }
    : isInputField
      ? { options: FIELD_STATES, value: fieldState, onSelect: setFieldState }
      : isCheckbox
        ? { options: CHECKBOX_STATES, value: cbxState, onSelect: setCbxState }
        : isTabs
          ? { options: TABS_VIEWS, value: tabsView, onSelect: setTabsView }
          : null;

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
    if (isFilter) return <FilterPreview bestPractices={bestPractices} />;
    if (isTabs) return <TabsPreview view={tabsView} bestPractices={bestPractices} />;
    if (isCheckbox) {
      return (
        <CheckboxPreview state={cbxState} setState={setCbxState} bestPractices={bestPractices} />
      );
    }
    if (isInputField) {
      return <InputFieldPreview type={fieldType} state={fieldState} bestPractices={bestPractices} />;
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
            {canvasTabs ? (
              <div className="canvas-variants">
                {canvasTabs.options.map((v) => (
                  <button
                    key={v}
                    className="canvas-variant-btn"
                    data-active={canvasTabs.value === v}
                    aria-pressed={canvasTabs.value === v}
                    onClick={() => canvasTabs.onSelect(v)}
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
          // The type is a nav entry and the state is a canvas pill, which leaves
          // the panel nothing to hold but the redlines. Disabled and Error used to
          // be toggles here; they're two of the states now.
          <PgToggle label="Best practices" value={bestPractices} onChange={setBestPractices} />
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
            {/* The Button is the only component left that takes Disabled from
                here — the Checkbox's is one of its state pills now. */}
            <PgToggle label="Disabled" value={disabled} onChange={setDisabled} disabled={!isButton} />
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
