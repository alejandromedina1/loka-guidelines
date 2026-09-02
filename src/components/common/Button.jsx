import { forwardRef } from "react";
import { makeButtonStyle, makeStrokeStyle } from "../playground/buttonStyles.js";

// The Button, as an actual component.
//
// Its styling has always lived in playground/buttonStyles.js, but the only
// thing that rendered it was the Product Hub's own preview — so anything else
// that needed a button (the AI Hub's pattern wireframes, for one) had to
// approximate one, and every approximation was a second button that could
// drift from the real thing.
//
// This is that missing piece and nothing more: the style factory, the gradient
// ring, and a `<button>`. Everything the playground adds on top — hover and
// press tracking, the redline overlay, the ghost surface frame — stays in
// ButtonPreview, because none of it belongs to a button used in anger.
//
// `state` is a prop rather than internal, deliberately. The playground drives
// it to demonstrate hover and pressed on demand, and a wireframe wants it
// pinned at rest; a component that owned its own hover state could do neither.
export const Button = forwardRef(function Button(
  { variant = "Primary", state = "default", device = "Desktop", surface = "Gray 10", disabled, children, ...rest },
  ref
) {
  const style = makeButtonStyle({ variant, state, device, disabled, surface });
  // A CSS border can't hold a gradient, so the stroke is an overlay sitting on
  // the transparent border the style reserves for it. Null for variants that
  // never carry one.
  const stroke = makeStrokeStyle({ variant, state, disabled });

  return (
    <button ref={ref} style={style} disabled={disabled} {...rest}>
      {stroke && <span className="btn-ring" style={stroke} aria-hidden />}
      {children}
    </button>
  );
});
