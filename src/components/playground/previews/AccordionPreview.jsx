import { useEffect, useState } from "react";
import { FAQ_ITEMS } from "../../../data/components.js";
import { PlusMinusIcon } from "../../common/Icon.jsx";
import {
  FONT_STACK,
  blocks,
  htmlDocument,
  indent,
  rule,
  ruleHeadlines,
  ruleTexts,
  specPrompt,
  tokenRef,
} from "../snippets.js";

// Resolved values for the accordion. It's the one built component without
// redlines — they'd land on a divider rather than a box — so the specs panel is
// the only place these values appear on screen.
const T = {
  maxWidth: 640,
  divider: "#E7ECF2", // var(--line) · gray-10
  qPadY: 20,
  qPadX: 4,
  qPadBottomOpen: 8,
  qGap: 20,
  qSize: 16,
  qWeight: 600,
  qTracking: "-.01em",
  qColor: "#010812", // var(--ink) · black
  iconBox: 24,
  iconGlyph: 16,
  iconColor: "#5C6A82", // var(--ink-3) · gray-60
  aSize: 14.5,
  aLineHeight: 1.6,
  aColor: "#5C6A82", // var(--ink-3) · gray-60
  aPadBottom: 22,
};

// Live Accordion preview. One item is open at a time; clicking the open item
// collapses it.
export function AccordionPreview({ onState }) {
  const [openFaq, setOpenFaq] = useState(0);

  // Which item is open is the only state the accordion has, and it lives here
  // rather than in the playground — so it's posted up for the canvas readout.
  useEffect(() => {
    onState?.(
      openFaq >= 0
        ? { text: `Open · item ${openFaq + 1}`, tone: "active" }
        : { text: "All closed", tone: "default" },
    );
  }, [openFaq, onState]);

  return (
    <div className="faq">
      {FAQ_ITEMS.map((item, i) => {
        const open = openFaq === i;
        return (
          <div key={item.q} className="faq-item" data-open={open}>
            <button className="faq-q" onClick={() => setOpenFaq(open ? -1 : i)}>
              <span className="faq-q-text">{item.q}</span>
              <span className="faq-icon" aria-hidden>
                <PlusMinusIcon />
              </span>
            </button>
            <div className="faq-a-wrap">
              <p className="faq-a">{item.a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Nothing here is redlined, so every row is carrying its own weight. Padding is
// the exception — it's the one thing the open state changes, which makes it
// worth stating.
const ACCORDION_SPECS = [
  ["Divider", `1px ${T.divider} · gray-10`],
  ["Question", `${T.qSize}px / ${T.qWeight} · ${T.qColor}`],
  ["Question pad", `${T.qPadY}px ${T.qPadX}px · ${T.qPadBottomOpen}px bottom when open`],
  ["Answer", `${T.aSize}px / ${T.aLineHeight} · ${T.aColor}`],
  ["Icon", `${T.iconGlyph}px in ${T.iconBox}px · ${T.iconColor}`],
];

// The guidance behind the component, stated once. The specs panel shows the
// headlines; the AI prompt shows these with their reasoning attached.
export function accordionRules() {
  return [
    {
      rule: "One item is open at a time, and the open one closes on a second click.",
      why: "Opening another closes the current one, and the list can end up fully closed.",
    },
    {
      rule: "The question row must be a real button, or a <summary>.",
      why: "It has to be reachable by keyboard and announce its expanded state — a div with a click handler does neither.",
    },
    {
      rule: "There is no fill and no radius. The dividers are the whole structure.",
      why: "Don't add a card around the list.",
    },
    {
      rule: "The plus becomes a minus by collapsing one stroke, not by swapping glyphs.",
      why: "The vertical stroke fades and scales to 0 over 180ms; cross-fading two icons reads as a flicker.",
    },
    {
      rule: "Animate the answer with a grid-template-rows transition, not a measured height.",
      why: "0fr to 1fr over 240ms animates to the content's natural height without measuring it in JavaScript. It needs the answer rendered while closed, which is the only reason not to use <details>.",
    },
  ];
}

export function accordionSpecs() {
  return { rules: ruleHeadlines(accordionRules()), rows: ACCORDION_SPECS };
}

// ── Copyable output ─────────────────────────────────────────────────────────

const CLASS = "loka-accordion";

// The plus that loses its vertical stroke when open, matching PlusMinusIcon.
const PLUS_SVG =
  `<svg viewBox="0 0 16 16" width="${T.iconGlyph}" height="${T.iconGlyph}" aria-hidden="true">` +
  `<path d="M3 8h10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>` +
  `<path class="${CLASS}__icon-v" d="M8 3v10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>` +
  `</svg>`;

export function accordionCss() {
  return blocks(
    rule(`.${CLASS}`, [
      ["width", "100%"],
      ["max-width", `${T.maxWidth}px`],
    ]),
    // Dividers between items, plus one above the first — the list reads as a
    // set of rules rather than as free-floating questions.
    rule(`.${CLASS}__item`, [["border-bottom", `1px solid ${T.divider}`]]),
    rule(`.${CLASS}__item:first-child`, [["border-top", `1px solid ${T.divider}`]]),
    rule(`.${CLASS}__q`, [
      ["display", "flex"],
      ["align-items", "center"],
      ["justify-content", "space-between"],
      ["gap", `${T.qGap}px`],
      ["width", "100%"],
      ["padding", `${T.qPadY}px ${T.qPadX}px`],
      ["cursor", "pointer"],
      ["list-style", "none"],
      ["font-family", FONT_STACK],
      ["font-size", `${T.qSize}px`],
      ["font-weight", T.qWeight],
      ["letter-spacing", T.qTracking],
      ["color", T.qColor],
      ["transition", "padding .2s ease, color .12s"],
    ]),
    // Safari still paints its own disclosure triangle without this.
    rule(`.${CLASS}__q::-webkit-details-marker`, [["display", "none"]]),
    rule(`.${CLASS}__item[open] .${CLASS}__q`, [["padding-bottom", `${T.qPadBottomOpen}px`]]),
    rule(`.${CLASS}__icon`, [
      ["flex", "none"],
      ["display", "grid"],
      ["place-items", "center"],
      ["width", `${T.iconBox}px`],
      ["height", `${T.iconBox}px`],
      ["color", T.iconColor],
      ["transition", "color .14s"],
    ]),
    rule(`.${CLASS}__q:hover .${CLASS}__icon`, [["color", T.qColor]]),
    // Plus becomes minus: the vertical stroke collapses into the horizontal one
    // rather than the glyph being swapped out.
    rule(`.${CLASS}__icon-v`, [
      ["transform-origin", "center"],
      ["transition", "opacity .18s ease, transform .18s ease"],
    ]),
    rule(`.${CLASS}__item[open] .${CLASS}__icon-v`, [
      ["opacity", "0"],
      ["transform", "scaleY(0)"],
    ]),
    rule(`.${CLASS}__a`, [
      ["margin", "0"],
      ["padding", `0 ${T.qPadX}px ${T.aPadBottom}px`],
      ["font-family", FONT_STACK],
      ["font-size", `${T.aSize}px`],
      ["line-height", T.aLineHeight],
      ["color", T.aColor],
    ]),
  );
}

// A <details>/<summary> disclosure: no JavaScript, and the keyboard, the tab
// order, and find-in-page all work on their own.
//
// One trade-off, called out in the snippet itself. The live component animates
// the answer open with a grid-template-rows transition, which needs the answer
// rendered at all times — and <details> stops rendering it when closed. This
// opens instantly instead. The AI prompt tab carries the animated spec.
export function accordionHtmlSnippet() {
  const item = (faq, i) =>
    [
      `<details class="${CLASS}__item"${i === 0 ? " open" : ""}>`,
      indent(`<summary class="${CLASS}__q">`),
      indent(`<span>${faq.q}</span>`, 4),
      indent(`<span class="${CLASS}__icon">${PLUS_SVG}</span>`, 4),
      indent("</summary>"),
      indent(`<p class="${CLASS}__a">${faq.a}</p>`),
      "</details>",
    ].join("\n");

  const markup = [
    `<div class="${CLASS}">`,
    ...FAQ_ITEMS.slice(0, 2).map((faq, i) => indent(item(faq, i))),
    "</div>",
    "",
    "<!-- <details> opens instantly. The library animates the answer's height with a",
    "     grid-template-rows 0fr → 1fr transition, which needs the answer rendered while",
    "     closed — see the AI prompt tab for that version. Only one item is open at a",
    "     time there too, which is the other thing <details> won't do on its own. -->",
  ].join("\n");

  return htmlDocument({ title: "Accordion", css: accordionCss(), markup });
}

export function accordionPromptSnippet() {
  return specPrompt({
    component: "Accordion",
    config: "FAQ disclosure list",
    sections: [
      [
        "List",
        [
          ["Width", `fills its container, ${T.maxWidth}px maximum`],
          ["Divider", `1px solid ${tokenRef(T.divider)} below every item, and above the first`],
          ["Fill", "none — the list sits directly on the page"],
        ],
      ],
      [
        "Question row",
        [
          ["Padding", `${T.qPadY}px ${T.qPadX}px, dropping to ${T.qPadBottomOpen}px at the bottom when open`],
          ["Gap", `${T.qGap}px between the text and the icon`],
          ["Font", "Alliance No.2"],
          ["Text", `${T.qSize}px / ${T.qWeight}, letter-spacing ${T.qTracking}`],
          ["Colour", tokenRef(T.qColor)],
          ["Icon", `${T.iconGlyph}px glyph in a ${T.iconBox}px box, ${tokenRef(T.iconColor)}`],
        ],
      ],
      [
        "Answer",
        [
          ["Padding", `0 ${T.qPadX}px ${T.aPadBottom}px`],
          ["Text", `${T.aSize}px / ${T.aLineHeight}`],
          ["Colour", tokenRef(T.aColor)],
        ],
      ],
    ],
    states: [
      "Open: the question's bottom padding tightens from 20px to 8px over 200ms, so the answer settles toward the question it belongs to rather than floating between two.",
      "The icon is a plus that becomes a minus — the vertical stroke fades and scales to 0 over 180ms. Animate that one stroke; don't cross-fade two glyphs.",
      `The answer's height animates with a grid-template-rows transition from 0fr to 1fr over 240ms. Wrap the answer in a grid container, give the answer overflow: hidden, and transition the wrapper's rows — that animates to the content's natural height without measuring it in JavaScript.`,
      "Hover on the question row darkens the icon to the question's own colour over 140ms. The text itself doesn't change.",
    ],
    notes: [
      ...ruleTexts(accordionRules()),
      "If you don't need the open/close animation, <details>/<summary> gives you the whole component with no JavaScript.",
    ],
    reference: accordionHtmlSnippet(),
  });
}
