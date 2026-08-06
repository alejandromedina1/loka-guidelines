import { useCallback, useState } from "react";
import {
  CHECKBOX_STATES,
  COMPONENT_LIST,
  FIELD_STATES,
  LINK_STATES,
} from "../../data/components.js";
import {
  BUTTON_VARIANTS,
  DARK_SURFACE_VARIANTS,
  DEVICE_SPEC,
  GHOST_SURFACES,
  buttonHtmlSnippet,
  buttonPromptSnippet,
  buttonSpecs,
} from "./buttonStyles.js";
import { BestPracticesPanel } from "./BestPracticesPanel.jsx";
import { PgSelect } from "./controls/PgSelect.jsx";
import { PgToggle } from "./controls/PgToggle.jsx";
import { ButtonPreview } from "./previews/ButtonPreview.jsx";
import { LinkPreview } from "./previews/LinkPreview.jsx";
import {
  AccordionPreview,
  accordionHtmlSnippet,
  accordionPromptSnippet,
  accordionSpecs,
} from "./previews/AccordionPreview.jsx";
import {
  FilterPreview,
  filterHtmlSnippet,
  filterPromptSnippet,
  filterSpecs,
} from "./previews/FilterPreview.jsx";
import {
  CheckboxPreview,
  checkboxHtmlSnippet,
  checkboxPromptSnippet,
  checkboxSpecs,
} from "./previews/CheckboxPreview.jsx";
import {
  InputFieldPreview,
  inputFieldHtmlSnippet,
  inputFieldPromptSnippet,
  inputFieldSpecs,
} from "./previews/InputFieldPreview.jsx";
import {
  TabsPreview,
  tabsHtmlSnippet,
  tabsPromptSnippet,
  tabsSpecs,
} from "./previews/TabsPreview.jsx";
import { ArrowLeft, ArrowRight, ChevronToggle, CheckIcon, CopyIcon } from "../common/Icon.jsx";

// Tabs documents two things at once — the item and the bar it sits in.
const TABS_VIEWS = ["Item", "Full bar"];

// Which of the pill-driven states read as "something is happening" rather than
// as the resting one. Tone drives the readout's colour, so a component can name
// its states whatever fits without needing a rule of its own in the stylesheet.
const FIELD_TONE = { Default: "default", Focus: "active", Error: "error", Disabled: "disabled" };
const CHECKBOX_TONE = {
  Default: "default",
  Hovered: "active",
  Checked: "active",
  Disabled: "disabled",
};
const LINK_TONE = { Default: "default", Hover: "active" };

// The two things the code panel can hand a developer. Neither is a call into a
// Loka package, because there isn't one yet — a snippet that only works if the
// reader already has our component installed is documentation dressed up as
// code. These both work on their own: the first renders anywhere it's pasted,
// the second builds the component in whatever stack the reader actually uses.
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
    hint: "Paste into Claude Code, Cursor, or any coding agent to build this component in your own framework and conventions.",
  },
];

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
  const isLink = selected === "Link";

  const [variant, setVariant] = useState("Primary");
  const [device, setDevice] = useState("Desktop");
  const [surface, setSurface] = useState("Gray 10");
  const [disabled, setDisabled] = useState(false);
  const [bestPractices, setBestPractices] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [codeView, setCodeView] = useState("html");
  const [btnState, setBtnState] = useState("default"); // default | hover | pressed

  const [tabsView, setTabsView] = useState("Item");
  const [cbxState, setCbxState] = useState("Default");
  const [linkState, setLinkState] = useState("Default");

  // The type is chosen in the nav panel and arrives as a prop; the state is the
  // playground's own axis, so it sits on the canvas pills.
  const [fieldState, setFieldState] = useState("Default");

  // Where the three self-contained previews post their current state for the
  // canvas readout. Stamped with the component that sent it — see stateReadout.
  const [reported, setReported] = useState({ for: null, state: null });
  const reportState = useCallback((state) => setReported({ for: selected, state }), [selected]);

  const cycle = (dir) => {
    const i = COMPONENT_LIST.indexOf(selected);
    const next = (i + dir + COMPONENT_LIST.length) % COMPONENT_LIST.length;
    setSelected(COMPONENT_LIST[next]);
  };

  // Outline dark is white-on-dark by design, so the canvas follows the variant
  // rather than the app theme for it. Ghost brings its own surface instead.
  const darkCanvas = dark || (isButton && DARK_SURFACE_VARIANTS.includes(variant));

  // Every component with a preview built for it: its two snippet generators,
  // its specs sheet, and the slice of playground state all three vary along.
  // The components still waiting on a preview aren't here — there's nothing
  // built yet to document, and inventing it is what this panel replaced.
  const built = {
    Accordion: {
      html: accordionHtmlSnippet,
      prompt: accordionPromptSnippet,
      specs: accordionSpecs,
      args: {},
    },
    Button: {
      html: buttonHtmlSnippet,
      prompt: buttonPromptSnippet,
      specs: buttonSpecs,
      args: { variant, device, surface, disabled },
    },
    Checkbox: {
      html: checkboxHtmlSnippet,
      prompt: checkboxPromptSnippet,
      specs: checkboxSpecs,
      args: { state: cbxState },
    },
    Filter: {
      html: filterHtmlSnippet,
      prompt: filterPromptSnippet,
      specs: filterSpecs,
      args: {},
    },
    "Input Field": {
      html: inputFieldHtmlSnippet,
      prompt: inputFieldPromptSnippet,
      specs: inputFieldSpecs,
      args: { type: fieldType, state: fieldState },
    },
    Tabs: {
      html: tabsHtmlSnippet,
      prompt: tabsPromptSnippet,
      specs: tabsSpecs,
      args: { view: tabsView },
    },
  }[selected];

  // Both formats are generated up front so switching tabs is instant, and both
  // come from the same spec functions the preview renders from — the snippet
  // can't describe a component other than the one on the canvas.
  const snippets = built ? { html: built.html(built.args), prompt: built.prompt(built.args) } : null;

  // The specs sheet lives in this column rather than floating over the canvas.
  // It's rendered here rather than by each preview so the previews are left with
  // just their redlines, which are the part that has to sit on the component.
  const specs = bestPractices && built ? built.specs(built.args) : null;

  const view = CODE_VIEWS.find((v) => v.id === codeView) ?? CODE_VIEWS[0];
  const code = snippets?.[view.id] ?? "";
  const filename = `${selected.toLowerCase().replace(/\s+/g, "-")}.${view.ext}`;
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
          : isLink
            ? { options: LINK_STATES, value: linkState, onSelect: setLinkState }
            : null;

  // The state readout in the canvas's top-left corner: what the component on
  // stage is doing right now.
  //
  // Button, Input Field, Checkbox and Link take their state from a playground
  // axis, so it's derived here. Accordion, Filter and Tabs own theirs internally and
  // report it up — lifting it would put a filter's open chip and its search
  // query in the playground, which is the control's business, not this one's.
  //
  // The report is stamped with the component it came from: on a switch the new
  // preview's effect fires after this render, so without the stamp the label
  // would show the previous component's state for a frame.
  const reportedFor = reported.for === selected ? reported.state : null;
  const stateReadout = isButton
    ? disabled
      ? { text: "Disabled", tone: "disabled" }
      : btnState === "hover"
        ? { text: "Hovered", tone: "active" }
        : btnState === "pressed"
          ? { text: "Pressed", tone: "pressed" }
          : { text: "Default", tone: "default" }
    : isInputField
      ? { text: fieldState, tone: FIELD_TONE[fieldState] }
      : isCheckbox
        ? { text: cbxState, tone: CHECKBOX_TONE[cbxState] }
        : isLink
          ? { text: linkState, tone: LINK_TONE[linkState] }
          : reportedFor;

  const renderPreview = () => {
    if (isButton) {
      return (
        <ButtonPreview
          variant={variant}
          device={device}
          surface={surface}
          disabled={disabled}
          bestPractices={bestPractices}
          btnState={btnState}
          setBtnState={setBtnState}
        />
      );
    }
    if (selected === "Accordion") return <AccordionPreview onState={reportState} />;
    if (isFilter) return <FilterPreview bestPractices={bestPractices} onState={reportState} />;
    if (isTabs) {
      return <TabsPreview view={tabsView} bestPractices={bestPractices} onState={reportState} />;
    }
    if (isCheckbox) {
      return (
        <CheckboxPreview state={cbxState} setState={setCbxState} bestPractices={bestPractices} />
      );
    }
    if (isInputField) {
      return <InputFieldPreview type={fieldType} state={fieldState} bestPractices={bestPractices} />;
    }
    if (isLink) return <LinkPreview state={linkState} />;
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
            {stateReadout && (
              <span className="pg-state-label" data-tone={stateReadout.tone}>
                {stateReadout.text}
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
            {snippets && (
              <button className="pg-viewcode" onClick={() => setShowCode((v) => !v)}>
                {showCode ? "Hide code" : "Get the code"}
                <ChevronToggle open={showCode} />
              </button>
            )}
          </div>
        </div>

        {showCode && snippets && (
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
                    onClick={() => setCodeView(v.id)}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
              <button className="pg-code-copy" onClick={() => onCopy(code, `pg-code-${view.id}`)}>
                {copied === `pg-code-${view.id}` ? (
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
            {/* What the format is for. Without it the tabs read as two flavours
                of the same thing, and the prompt tab in particular isn't
                self-explanatory. */}
            <div className="pg-code-hint">
              <span>{view.hint}</span>
              <span className="pg-code-file">{filename}</span>
            </div>
            <pre className="pg-code-body">
              <span className="pg-ln">{code.split("\n").map((_, i) => i + 1).join("\n")}</span>
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
              disabled={!built}
            />
          </>
        )}
        {specs && <BestPracticesPanel rules={specs.rules} rows={specs.rows} />}
      </div>
    </div>
  );
}
