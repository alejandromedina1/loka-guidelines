// The Tab pill, as a component.
//
// Loka Figma "Tabs" (node 389:367): a 40px pill carrying one sentence-case
// label, in three states. This is the base selector the system had been
// improvising in four places — the playground's variant strip, the code
// panel's format strip, the AI hub's chips, and the Filter's own toggle all
// draw the same pill by hand.
//
// Not to be confused with two neighbours that were already documented:
//   Services Tabs — the 70px marker items in a blurred 78px bar
//   Tags          — "20 / tag", a 24px bordered box of uppercase text, static
// This one is the only one of the three with hover and active states, which is
// what makes it a selector rather than a label.
//
// The states are a set, not a ramp, and the box must not move between them:
// Figma draws `default` with a 1px border and `hover` with a fill and no
// border, which would shift the label by a pixel on hover if the border were a
// real border. So the outline is an inset shadow — the same trick .ai-chip
// already uses — and every state paints inside the same 40px box.
export const TAB_STATES = ["Default", "Hover", "Active"];

// Figma's own values. Height and padding are the component's spec rather than
// a page's styling, so they live here; the paint is .tab-pill in global.css.
export const TAB_SPEC = {
  height: 40,
  padX: 14,
  radius: 80,
  fontSize: 16,
  lineHeight: 1.3,
  // gray-5 / gray-50 / gray-90, all bound variables on the Figma node
  line: "#EFF1F5",
  label: "#828FA5",
  activeFill: "#020F1F",
  activeLabel: "#EFF1F5",
};

// `state` is a prop rather than internal, matching Button: the playground has
// to be able to hold a state open for inspection, which a :hover selector
// can't do. Passing nothing gives the real interactive pill, where the browser
// drives hover itself.
export function Tab({ state, children, onClick, ...rest }) {
  return (
    <button
      type="button"
      className="tab-pill"
      data-state={state ? state.toLowerCase() : undefined}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  );
}
