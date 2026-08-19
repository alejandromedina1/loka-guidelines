import { useCallback, useState } from "react";
import {
  AVATAR_COLORS,
  AVATAR_SIZES,
  AVATAR_SWATCHES,
  AVATAR_VARIANTS,
  CARD_VARIANTS,
  CHECKBOX_SHAPES,
  CHECKBOX_SIZES,
  CHECKBOX_STATES,
  COMPONENT_LIST,
  DATE_PICKER_VARIANTS,
  DROPDOWN_VARIANTS,
  FIELD_STATES,
  FIELD_TYPES,
  FILTER_VARIANTS,
  LINK_STATES,
  RADIO_STATES,
  SEARCH_INPUT_STATES,
  SPINNER_SIZES,
  TAG_SIZES,
  TOGGLE_SWITCH_STATES,
  TOOLTIP_VARIANTS,
} from "../../data/components.js";
import {
  BUTTON_VARIANTS,
  DARK_SURFACE_VARIANTS,
  GHOST_SURFACES,
  buttonHtmlSnippet,
  buttonPromptSnippet,
  buttonSpecs,
} from "./buttonStyles.js";
import { BestPracticesPanel } from "./BestPracticesPanel.jsx";
import { PgSelect } from "./controls/PgSelect.jsx";
import { PgToggle } from "./controls/PgToggle.jsx";
import { PgIconToggle } from "./controls/PgIconToggle.jsx";
import { PgColorPicker } from "./controls/PgColorPicker.jsx";
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
  RadioButtonPreview,
  radioButtonHtmlSnippet,
  radioButtonPromptSnippet,
  radioButtonSpecs,
} from "./previews/RadioButtonPreview.jsx";
import {
  ToggleSwitchPreview,
  toggleSwitchHtmlSnippet,
  toggleSwitchPromptSnippet,
  toggleSwitchSpecs,
} from "./previews/ToggleSwitchPreview.jsx";
import {
  SpinnerPreview,
  spinnerHtmlSnippet,
  spinnerPromptSnippet,
  spinnerSpecs,
} from "./previews/SpinnerPreview.jsx";
import {
  SearchInputPreview,
  searchInputHtmlSnippet,
  searchInputPromptSnippet,
  searchInputSpecs,
} from "./previews/SearchInputPreview.jsx";
import {
  InputFieldPreview,
  inputFieldHtmlSnippet,
  inputFieldPromptSnippet,
  inputFieldSpecs,
} from "./previews/InputFieldPreview.jsx";
import {
  DropdownPreview,
  dropdownHtmlSnippet,
  dropdownPromptSnippet,
  dropdownSpecs,
} from "./previews/DropdownPreview.jsx";
import {
  DatePickerPreview,
  datePickerHtmlSnippet,
  datePickerPromptSnippet,
  datePickerSpecs,
} from "./previews/DatePickerPreview.jsx";
import {
  TabsPreview,
  tabsHtmlSnippet,
  tabsPromptSnippet,
  tabsSpecs,
} from "./previews/TabsPreview.jsx";
import {
  FloatingActionButtonPreview,
  floatingActionButtonHtmlSnippet,
  floatingActionButtonPromptSnippet,
  floatingActionButtonSpecs,
} from "./previews/FloatingActionButtonPreview.jsx";
import { AvatarPreview, avatarHtmlSnippet, avatarPromptSnippet, avatarSpecs } from "./previews/AvatarPreview.jsx";
import { TagsPreview, tagsHtmlSnippet, tagsPromptSnippet, tagsSpecs } from "./previews/TagsPreview.jsx";
import { CardPreview, cardHtmlSnippet, cardPromptSnippet, cardSpecs } from "./previews/CardPreview.jsx";
import {
  TooltipPreview,
  tooltipHtmlSnippet,
  tooltipPromptSnippet,
  tooltipSpecs,
} from "./previews/TooltipPreview.jsx";
import {
  ArrowLeft,
  ArrowRight,
  ChevronToggle,
  CheckIcon,
  CopyIcon,
  DesktopIcon,
  MobileIcon,
} from "../common/Icon.jsx";

// Tabs documents two things at once — the item and the bar it sits in.
const TABS_VIEWS = ["Item", "Full bar"];

// The Device control reads better as two icons than as dropdown text — same
// two values DEVICE_SPEC already carries, just paired with a glyph apiece.
const DEVICE_OPTIONS = [
  { value: "Desktop", icon: <DesktopIcon /> },
  { value: "Mobile", icon: <MobileIcon /> },
];

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
const RADIO_TONE = {
  Default: "default",
  Hovered: "active",
  Selected: "active",
  Disabled: "disabled",
};
const TOGGLE_TONE = {
  Off: "default",
  Hovered: "active",
  On: "active",
  Disabled: "disabled",
};
const SEARCH_TONE = {
  Default: "default",
  Focus: "active",
  Filled: "active",
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
export function ComponentPlayground({
  copied,
  onCopy,
  selected,
  setSelected,
  componentVariant,
  setComponentVariant,
  theme,
}) {
  const dark = theme === "dark";
  const isButton = selected === "Button";
  const isInputField = selected === "Input Field";
  const isInputDropdown = selected === "Input Dropdown";
  const isDatePicker = selected === "Date Picker";
  const isCheckbox = selected === "Checkbox";
  const isRadio = selected === "Radio Button";
  const isToggleSwitch = selected === "Toggle Switch";
  const isFilter = selected === "Filter";
  const isTabs = selected === "Tabs";
  const isLink = selected === "Link";
  const isFAB = selected === "Floating Action Button";
  const isAvatar = selected === "Avatar";
  const isTags = selected === "Tags";
  const isCard = selected === "Card";
  const isTooltip = selected === "Tooltip";
  const isSpinner = selected === "Spinner";
  const isSearchInput = selected === "Search Input";

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
  // Shape and Size are both their own axis from state — properties-panel
  // controls rather than a fifth/sixth/seventh canvas pill, since neither is
  // one of the sourced Figma states.
  const [cbxShape, setCbxShape] = useState("Rounded");
  const [cbxSize, setCbxSize] = useState("28px");
  const [radioState, setRadioState] = useState("Default");
  const [toggleState, setToggleState] = useState("Off");
  const [searchState, setSearchState] = useState("Default");
  const [linkState, setLinkState] = useState("Default");

  // Color and size are the Avatar's own axes, not shared with the nav-driven
  // `componentVariant` below — Image/Initials is the one that toggle drives,
  // same relationship the Dropdown's mode has to its own state.
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]);
  const [avatarSize, setAvatarSize] = useState(AVATAR_SIZES[1]); // "32px" — Figma's own sourced size

  // The type is chosen in the nav panel and arrives as a prop; the state is the
  // playground's own axis, so it sits on the canvas pills.
  const [fieldState, setFieldState] = useState("Default");

  // `componentVariant` is one state shared across every component with nav
  // sub-items, not one per component — switching to Input Field or Dropdown
  // straight from the top-level nav item (no sub-item, so no variant argument)
  // keeps whatever the last component's variant was, which won't be one of
  // this component's own. Falling back to each list's first entry is what
  // keeps that a harmless default instead of an undefined lookup.
  const resolvedFieldType = FIELD_TYPES.includes(componentVariant) ? componentVariant : FIELD_TYPES[0];
  const resolvedDropdownVariant = DROPDOWN_VARIANTS.includes(componentVariant)
    ? componentVariant
    : DROPDOWN_VARIANTS[0];
  const resolvedDatePickerVariant = DATE_PICKER_VARIANTS.includes(componentVariant)
    ? componentVariant
    : DATE_PICKER_VARIANTS[0];
  const resolvedFilterVariant = FILTER_VARIANTS.includes(componentVariant)
    ? componentVariant
    : FILTER_VARIANTS[0];
  const resolvedAvatarVariant = AVATAR_VARIANTS.includes(componentVariant)
    ? componentVariant
    : AVATAR_VARIANTS[0];
  const resolvedTagSize = TAG_SIZES.includes(componentVariant) ? componentVariant : TAG_SIZES[1];
  const resolvedCardVariant = CARD_VARIANTS.includes(componentVariant) ? componentVariant : CARD_VARIANTS[0];
  const resolvedSpinnerSize = SPINNER_SIZES.includes(componentVariant) ? componentVariant : SPINNER_SIZES[1];
  const resolvedTooltipVariant = TOOLTIP_VARIANTS.includes(componentVariant)
    ? componentVariant
    : TOOLTIP_VARIANTS[0];

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
  // Tabs' rest/hover fills are white/near-white, so a plain white canvas hides
  // the bar entirely — a light grey gives it just enough contrast to read.
  // Skipped when the canvas is already dark, which does that on its own.
  const greyCanvas = isTabs && !darkCanvas;

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
      args: { state: cbxState, shape: cbxShape, size: cbxSize },
    },
    "Radio Button": {
      html: radioButtonHtmlSnippet,
      prompt: radioButtonPromptSnippet,
      specs: radioButtonSpecs,
      args: { state: radioState },
    },
    "Toggle Switch": {
      html: toggleSwitchHtmlSnippet,
      prompt: toggleSwitchPromptSnippet,
      specs: toggleSwitchSpecs,
      args: { state: toggleState },
    },
    Spinner: {
      html: spinnerHtmlSnippet,
      prompt: spinnerPromptSnippet,
      specs: spinnerSpecs,
      args: { size: resolvedSpinnerSize },
    },
    "Search Input": {
      html: searchInputHtmlSnippet,
      prompt: searchInputPromptSnippet,
      specs: searchInputSpecs,
      args: { state: searchState },
    },
    Filter: {
      html: filterHtmlSnippet,
      prompt: filterPromptSnippet,
      specs: filterSpecs,
      args: { variant: resolvedFilterVariant },
    },
    "Input Field": {
      html: inputFieldHtmlSnippet,
      prompt: inputFieldPromptSnippet,
      specs: inputFieldSpecs,
      args: { type: resolvedFieldType, state: fieldState },
    },
    "Input Dropdown": {
      html: dropdownHtmlSnippet,
      prompt: dropdownPromptSnippet,
      specs: dropdownSpecs,
      args: { variant: resolvedDropdownVariant },
    },
    "Date Picker": {
      html: datePickerHtmlSnippet,
      prompt: datePickerPromptSnippet,
      specs: datePickerSpecs,
      args: { variant: resolvedDatePickerVariant },
    },
    Tabs: {
      html: tabsHtmlSnippet,
      prompt: tabsPromptSnippet,
      specs: tabsSpecs,
      args: { view: tabsView },
    },
    "Floating Action Button": {
      html: floatingActionButtonHtmlSnippet,
      prompt: floatingActionButtonPromptSnippet,
      specs: floatingActionButtonSpecs,
      args: {},
    },
    Avatar: {
      html: avatarHtmlSnippet,
      prompt: avatarPromptSnippet,
      specs: avatarSpecs,
      args: { variant: resolvedAvatarVariant, color: avatarColor, size: avatarSize },
    },
    Tags: {
      html: tagsHtmlSnippet,
      prompt: tagsPromptSnippet,
      specs: tagsSpecs,
      args: { size: resolvedTagSize },
    },
    Card: {
      html: cardHtmlSnippet,
      prompt: cardPromptSnippet,
      specs: cardSpecs,
      args: { variant: resolvedCardVariant },
    },
    Tooltip: {
      html: tooltipHtmlSnippet,
      prompt: tooltipPromptSnippet,
      specs: tooltipSpecs,
      args: { variant: resolvedTooltipVariant },
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
  // bar, the Dropdown, the Date Picker and the Filter which mode each is in. Each is the one axis
  // that changes what you're looking at, so it belongs on the canvas rather than
  // down in the properties panel.
  const canvasTabs = isButton
    ? { options: BUTTON_VARIANTS, value: variant, onSelect: setVariant }
    : isInputField
      ? { options: FIELD_STATES, value: fieldState, onSelect: setFieldState }
      : isInputDropdown
        ? { options: DROPDOWN_VARIANTS, value: resolvedDropdownVariant, onSelect: setComponentVariant }
        : isDatePicker
          ? { options: DATE_PICKER_VARIANTS, value: resolvedDatePickerVariant, onSelect: setComponentVariant }
          : isFilter
          ? { options: FILTER_VARIANTS, value: resolvedFilterVariant, onSelect: setComponentVariant }
          : isCheckbox
            ? { options: CHECKBOX_STATES, value: cbxState, onSelect: setCbxState }
            : isRadio
              ? { options: RADIO_STATES, value: radioState, onSelect: setRadioState }
              : isToggleSwitch
                ? { options: TOGGLE_SWITCH_STATES, value: toggleState, onSelect: setToggleState }
                : isSearchInput
                  ? { options: SEARCH_INPUT_STATES, value: searchState, onSelect: setSearchState }
                  : isTabs
                    ? { options: TABS_VIEWS, value: tabsView, onSelect: setTabsView }
                    : isLink
                      ? { options: LINK_STATES, value: linkState, onSelect: setLinkState }
                      : isAvatar
                        ? { options: AVATAR_VARIANTS, value: resolvedAvatarVariant, onSelect: setComponentVariant }
                        : isCard
                          ? { options: CARD_VARIANTS, value: resolvedCardVariant, onSelect: setComponentVariant }
                          : isTooltip
                            ? {
                                options: TOOLTIP_VARIANTS,
                                value: resolvedTooltipVariant,
                                onSelect: setComponentVariant,
                              }
                            : null;

  // The state readout in the canvas's top-left corner: what the component on
  // stage is doing right now.
  //
  // Button, Input Field, Checkbox, Radio Button, Toggle Switch, Search Input
  // and Link take their state from a playground axis, so it's derived here.
  // Accordion, Filter, Tabs and the Floating Action Button own theirs
  // internally and report it up — lifting it would put a filter's open chip
  // and its search query in the playground, which is the control's business,
  // not this one's.
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
        : isRadio
          ? { text: radioState, tone: RADIO_TONE[radioState] }
          : isToggleSwitch
            ? { text: toggleState, tone: TOGGLE_TONE[toggleState] }
            : isSearchInput
              ? { text: searchState, tone: SEARCH_TONE[searchState] }
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
    if (isFilter) {
      return (
        <FilterPreview variant={resolvedFilterVariant} bestPractices={bestPractices} onState={reportState} />
      );
    }
    if (isTabs) {
      return <TabsPreview view={tabsView} bestPractices={bestPractices} onState={reportState} />;
    }
    if (isCheckbox) {
      return (
        <CheckboxPreview
          state={cbxState}
          setState={setCbxState}
          shape={cbxShape}
          size={cbxSize}
          bestPractices={bestPractices}
        />
      );
    }
    if (isRadio) {
      return (
        <RadioButtonPreview state={radioState} setState={setRadioState} bestPractices={bestPractices} />
      );
    }
    if (isToggleSwitch) {
      return (
        <ToggleSwitchPreview state={toggleState} setState={setToggleState} bestPractices={bestPractices} />
      );
    }
    if (isInputField) {
      return <InputFieldPreview type={resolvedFieldType} state={fieldState} bestPractices={bestPractices} />;
    }
    if (isInputDropdown) {
      return <DropdownPreview variant={resolvedDropdownVariant} bestPractices={bestPractices} onState={reportState} />;
    }
    if (isDatePicker) {
      return (
        <DatePickerPreview
          variant={resolvedDatePickerVariant}
          bestPractices={bestPractices}
          onState={reportState}
        />
      );
    }
    if (isLink) return <LinkPreview state={linkState} />;
    if (isFAB) {
      return <FloatingActionButtonPreview bestPractices={bestPractices} onState={reportState} />;
    }
    if (isAvatar) {
      return (
        <AvatarPreview
          variant={resolvedAvatarVariant}
          color={avatarColor}
          size={avatarSize}
          bestPractices={bestPractices}
        />
      );
    }
    if (isTags) {
      return <TagsPreview size={resolvedTagSize} bestPractices={bestPractices} />;
    }
    if (isCard) {
      return (
        <CardPreview variant={resolvedCardVariant} bestPractices={bestPractices} onState={reportState} />
      );
    }
    if (isTooltip) {
      return (
        <TooltipPreview variant={resolvedTooltipVariant} bestPractices={bestPractices} onState={reportState} />
      );
    }
    if (isSpinner) {
      return <SpinnerPreview size={resolvedSpinnerSize} bestPractices={bestPractices} />;
    }
    if (isSearchInput) {
      return (
        <SearchInputPreview state={searchState} setState={setSearchState} bestPractices={bestPractices} />
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
        <div className={`pg-canvas ${darkCanvas ? "dark" : ""} ${greyCanvas ? "grey" : ""}`}>
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
        {isInputField || isInputDropdown || isDatePicker || isRadio || isToggleSwitch || isSearchInput ? (
          // The type (or variant) is a nav entry, which leaves the panel
          // nothing to hold but the redlines. The Input Field's state used to
          // be toggles here; Input Dropdown and the Date Picker have no state
          // axis of their own to add one for — each one's mode is the canvas
          // toggle above, and both report open/closed themselves. The Radio
          // Button, the Toggle Switch and the Search Input have no axis of
          // their own either, and no Disabled toggle to show: each one's is
          // already a canvas pill, so a second, dead one here would just be
          // clutter.
          <PgToggle label="Best practices" value={bestPractices} onChange={setBestPractices} />
        ) : isTags ? (
          // Size is Tags' only axis, and it lives here rather than on the
          // canvas — a dropdown reads better than a three-way pill strip for
          // a property that doesn't change what's being demonstrated, just
          // how big it is.
          <>
            <PgSelect label="Size" value={resolvedTagSize} options={TAG_SIZES} onChange={setComponentVariant} />
            <PgToggle label="Best practices" value={bestPractices} onChange={setBestPractices} />
          </>
        ) : isSpinner ? (
          // Same call as the Tags' size: it doesn't change what's being
          // demonstrated, just how big it is, so it's a dropdown here rather
          // than a canvas pill. There's no state axis to switch anyway — the
          // control never stops moving.
          <>
            <PgSelect
              label="Size"
              value={resolvedSpinnerSize}
              options={SPINNER_SIZES}
              onChange={setComponentVariant}
            />
            <PgToggle label="Best practices" value={bestPractices} onChange={setBestPractices} />
          </>
        ) : isCheckbox ? (
          // Shape and Size are the Checkbox's own axes, not shared with
          // anything else — they live here rather than on the canvas since
          // neither is one of the sourced Figma states the pill strip already
          // steps through. No Disabled toggle: the Checkbox's is one of those
          // pills now, so a second, dead one here would just be clutter.
          <>
            <PgSelect label="Size" value={cbxSize} options={CHECKBOX_SIZES} onChange={setCbxSize} />
            <PgSelect label="Shape" value={cbxShape} options={CHECKBOX_SHAPES} onChange={setCbxShape} />
            <PgToggle label="Best practices" value={bestPractices} onChange={setBestPractices} />
          </>
        ) : isAvatar ? (
          // Image/Initials is the canvas toggle; size and color are the two
          // axes that don't fit there — size applies to both variants, color
          // only to Initials, so it only shows up once there's one to pick.
          <>
            <PgSelect label="Size" value={avatarSize} options={AVATAR_SIZES} onChange={setAvatarSize} />
            {resolvedAvatarVariant === "Initials" && (
              <PgColorPicker
                label="Color"
                value={avatarColor}
                options={AVATAR_COLORS}
                swatches={AVATAR_SWATCHES}
                onChange={setAvatarColor}
              />
            )}
            <PgToggle label="Best practices" value={bestPractices} onChange={setBestPractices} />
          </>
        ) : (
          <>
            <PgIconToggle
              label="Device"
              value={device}
              options={DEVICE_OPTIONS}
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
                here — every other control with a Disabled state (the
                Checkbox, the Radio Button, the Toggle Switch) has its own
                branch above instead, since that state is a canvas pill for
                each of them and a second, dead toggle here would be clutter. */}
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
