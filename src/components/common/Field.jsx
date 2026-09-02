import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

// Sizing has to happen before paint, or a field that opens with content is
// briefly the wrong height. useLayoutEffect does that but warns under a server
// renderer, where there's no layout to read — so it falls back to useEffect
// there. The app is a Vite SPA and never hits that path in production; this
// keeps the component honest for anything that does.
const useMeasureEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

// The Input Field family, as a component: a label, one of the three controls,
// and an optional error line.
//
// The box is painted by .field-* in global.css, which is what makes this safe
// to share — anything rendering these classes gets the documented 48px/12px
// control rather than an approximation of it.
//
// `wrap` is the one concession to the playground. Its redline overlay has to
// sit around the control and nothing else, and threading that through as a
// wrapper is cheaper than either duplicating the markup or teaching this
// component about redlines. Everyone else gets the identity default.
export function Field({
  label,
  type = "Text",
  state = "default",
  value,
  placeholder,
  error,
  rows,
  onChange,
  wrap = (control) => control,
}) {
  const disabled = state === "Disabled";
  const isError = state === "Error";
  // Real focus lands on whatever the caller clicked, so the pinned state is a
  // flag rather than :focus. Same ring either way — see global.css.
  const focus = state === "Focus" || undefined;

  // The textarea grows with its content instead of carrying a drag handle.
  // A resize grip asks the writer to manage a box while they're trying to write
  // in it, and it's the one control in a form whose size the user has to fix
  // themselves; measuring the content is the job the field can do for them.
  //
  // Height is cleared before it's read, because scrollHeight only reports the
  // content's height when the box isn't already taller than it — without the
  // reset the field could grow but never shrink back.
  const areaRef = useRef(null);
  const fit = useCallback(() => {
    const el = areaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  // `value` is a dependency for controlled use; uncontrolled typing is handled
  // by onInput below.
  useMeasureEffect(() => {
    if (type === "Textarea") fit();
  }, [type, value, fit]);

  const control =
    type === "Textarea" ? (
      <textarea
        ref={areaRef}
        onInput={fit}
        className="field-textarea"
        data-error={isError}
        data-focus={focus}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        value={value}
        onChange={onChange}
        readOnly={!onChange}
      />
    ) : (
      <input
        className="field-input"
        data-error={isError}
        data-focus={focus}
        type={type === "Email" ? "email" : "text"}
        placeholder={placeholder}
        disabled={disabled}
        value={value}
        onChange={onChange}
        readOnly={!onChange}
      />
    );

  return (
    <div className="field-demo">
      <label className="field">
        {label && <span className="field-label">{label}</span>}
        {wrap(control)}
      </label>
      {isError && error && <span className="field-error-msg">{error}</span>}
    </div>
  );
}
