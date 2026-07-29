import { useState } from "react";
import { COMPONENT_LIST } from "../../data/components.js";
import { SIZE_SPEC, buttonSnippet } from "./buttonStyles.js";
import { PgSelect } from "./controls/PgSelect.jsx";
import { PgToggle } from "./controls/PgToggle.jsx";
import { ButtonPreview } from "./previews/ButtonPreview.jsx";
import { AccordionPreview } from "./previews/AccordionPreview.jsx";
import { AvatarsPreview } from "./previews/AvatarsPreview.jsx";
import { ArrowLeft, ArrowRight, ChevronToggle, CheckIcon, CopyIcon } from "../common/Icon.jsx";

const BUTTON_VARIANTS = ["Primary", "Secondary", "Outline", "Ghost"];

// The component documentation surface: a live preview canvas, a prev/next
// cycler, per-component property controls, and a copyable code snippet.
// The Button is the fully-built reference component; others show a placeholder.
export function ComponentPlayground({ copied, onCopy, selected, setSelected, theme }) {
  const dark = theme === "dark";
  const isButton = selected === "Button";

  const [variant, setVariant] = useState("Primary");
  const [size, setSize] = useState("40px");
  const [leadingIcon, setLeadingIcon] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [bestPractices, setBestPractices] = useState(false);
  const [showBehaviour, setShowBehaviour] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [btnState, setBtnState] = useState("default"); // default | hover | pressed

  const cycle = (dir) => {
    const i = COMPONENT_LIST.indexOf(selected);
    const next = (i + dir + COMPONENT_LIST.length) % COMPONENT_LIST.length;
    setSelected(COMPONENT_LIST[next]);
  };

  const code = buttonSnippet({ variant, size, leadingIcon, disabled });
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
          size={size}
          leadingIcon={leadingIcon}
          disabled={disabled}
          bestPractices={bestPractices}
          showBehaviour={showBehaviour}
          dark={dark}
          btnState={btnState}
          setBtnState={setBtnState}
        />
      );
    }
    if (selected === "Accordion") return <AccordionPreview />;
    if (selected === "Avatars") return <AvatarsPreview />;
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
        <div className={`pg-canvas ${dark ? "dark" : ""}`}>
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
            <button className="pg-viewcode" onClick={() => setShowCode((v) => !v)}>
              {showCode ? "Hide code" : "View code"}
              <ChevronToggle open={showCode} />
            </button>
          </div>
        </div>

        {showCode && (
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
        <PgSelect label="Size" value={size} options={Object.keys(SIZE_SPEC)} onChange={setSize} disabled={!isButton} />
        <PgToggle label="Leading icon" value={leadingIcon} onChange={setLeadingIcon} disabled={!isButton} />
        <PgToggle label="Disabled" value={disabled} onChange={setDisabled} disabled={!isButton} />
        <PgToggle label="Best practices" value={bestPractices} onChange={setBestPractices} disabled={!isButton} />
        <PgToggle label="Show behaviour" value={showBehaviour} onChange={setShowBehaviour} disabled={!isButton} />
      </div>
    </div>
  );
}
