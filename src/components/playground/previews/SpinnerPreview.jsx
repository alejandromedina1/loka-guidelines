import { SpecOverlay } from "../SpecOverlay.jsx";
import { blocks, htmlDocument, ruleHeadlines, ruleTexts, specPrompt, tokenRef } from "../snippets.js";

// Resolved values for the control, in one place — global.css paints these, and
// the spec sheet and the copyable snippets below both read them from here.
// There's no sourced Figma node for the Spinner; gray-10 and blue-100 are the
// same track/indicator tokens the rest of this family already uses (the
// Checkbox's empty box, the Toggle Switch's "on" track), so a loading state
// reads as part of the same system rather than a fourth blue borrowed from
// nowhere.
const T = {
  sizes: { Small: 16, Medium: 24, Large: 32 },
  strokes: { Small: 2, Medium: 3, Large: 4 },
  track: "#E7ECF2", // gray-10
  indicator: "#186BF3", // blue-100
  duration: 0.8, // seconds per turn, at rest
  // Slowed rather than stopped for prefers-reduced-motion — see the rule below.
  reducedDuration: 2.4,
};

function spinnerSpecRows(size) {
  return [
    ["Size", `${T.sizes[size]}px · ${size}`],
    ["Stroke", `${T.strokes[size]}px`],
    ["Track", `${T.track} · gray-10`],
    ["Indicator", `${T.indicator} · blue-100`],
    ["Duration", `${T.duration}s per turn · linear · infinite`],
    ["Reduced motion", `${T.reducedDuration}s per turn`],
  ];
}

// The guidance behind the control, stated once. The specs panel shows the
// headlines; the AI prompt shows these with their reasoning attached.
export function spinnerRules() {
  return [
    {
      rule: "The whole ring is always painted; only its top edge changes color.",
      why: "That's the classic border-color spinner — a track-colored circle with one segment recolored blue-100, then rotated. One element, no pseudo-elements, no JavaScript.",
    },
    {
      rule: `role="status" and an aria-label carry the meaning — there's no text on screen.`,
      why: "A spinner announcing nothing to assistive tech is just a decoration that happens to move, the same call the Toggle Switch's bare control makes about its own aria-label.",
    },
    {
      rule: "Slow the spin for prefers-reduced-motion — don't freeze it.",
      why: `Stopping it outright reads as stuck or broken; ${T.duration}s → ${T.reducedDuration}s keeps "something is loading" true at a calmer pace.`,
    },
  ];
}

export function spinnerSpecs({ size = "Medium" } = {}) {
  return { rules: ruleHeadlines(spinnerRules()), rows: spinnerSpecRows(size) };
}

// Spinner — built in this system's own tokens rather than a sourced Figma
// component: gray-10 for the ring that's always there, blue-100 for the
// quarter-turn arc that reads as motion. Size is the only axis, and it's a
// properties-panel dropdown rather than a canvas pill strip — the same call
// the Tags' own size makes, since Small/Medium/Large don't change what's
// being demonstrated, just how big it is.
export function SpinnerPreview({ size = "Medium", bestPractices }) {
  return (
    <div className="bp-stage" data-bp={bestPractices || undefined}>
      <SpecOverlay on={bestPractices} padX={0} padY={0} widthMode="fixed" heightMode="fixed">
        <span className="spn" data-size={size} role="status" aria-label="Loading" />
      </SpecOverlay>
    </div>
  );
}

// ── Copyable output ─────────────────────────────────────────────────────────

const CLASS = "loka-spinner";

// The border-color trick: a circle with a track-colored border all the way
// round, one edge recolored to the indicator, and a rotation animation on the
// whole thing. No markup for a separate arc — the "arc" is just which edge is
// still track-colored at any given frame.
export function spinnerCss({ size = "Medium" } = {}) {
  const px = T.sizes[size];
  const stroke = T.strokes[size];

  const ring = `.${CLASS} {\n  display: inline-block;\n  width: ${px}px;\n  height: ${px}px;\n  border-radius: 100px;\n  border: ${stroke}px solid ${T.track};\n  border-top-color: ${T.indicator};\n  animation: ${CLASS}-spin ${T.duration}s linear infinite;\n}`;

  const keyframes = `@keyframes ${CLASS}-spin {\n  to {\n    transform: rotate(360deg);\n  }\n}`;

  const reducedMotion =
    `@media (prefers-reduced-motion: reduce) {\n` +
    `  .${CLASS} {\n    animation-duration: ${T.reducedDuration}s;\n  }\n` +
    `}`;

  return blocks(ring, keyframes, reducedMotion);
}

export function spinnerHtmlSnippet({ size = "Medium" }) {
  const markup = [
    `<span class="${CLASS}" role="status" aria-label="Loading"></span>`,
    "",
    `<!-- One element — the ring is a border with its top edge recolored, then`,
    `     rotated. aria-label is what a screen reader announces; there's`,
    `     nothing rendered on screen to say what it's for otherwise. -->`,
  ].join("\n");

  return htmlDocument({
    title: `Spinner — ${size}`,
    css: spinnerCss({ size }),
    markup,
  });
}

export function spinnerPromptSnippet({ size = "Medium" }) {
  return specPrompt({
    component: "Spinner",
    config: size,
    sections: [
      [
        "Ring",
        [
          ["Size", `${T.sizes[size]}px square`],
          ["Radius", "100px — a circle"],
          ["Stroke", `${T.strokes[size]}px`],
          ["Track", tokenRef(T.track)],
          ["Indicator", `${tokenRef(T.indicator)}, the top edge only`],
        ],
      ],
      [
        "Motion",
        [
          ["Animation", "rotate(0deg) to rotate(360deg)"],
          ["Duration", `${T.duration}s, linear, infinite`],
          ["Reduced motion", `${T.reducedDuration}s — slowed, not stopped`],
        ],
      ],
    ],
    states: [
      `Spinning is the only state — it never stops on its own. Mount it while work is in flight and unmount it (or swap it for the result) when it isn't.`,
      `Reduced motion: anyone with prefers-reduced-motion set gets the same rotation at ${T.reducedDuration}s a turn instead of ${T.duration}s, not a frozen ring.`,
    ],
    notes: [
      ...ruleTexts(spinnerRules()),
      "No Figma node is sourced for this component yet — the track and indicator reuse this system's own gray-10 and blue-100 rather than inventing a fifth color for loading states.",
    ],
    reference: spinnerHtmlSnippet({ size }),
  });
}
