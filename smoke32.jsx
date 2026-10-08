// smoke32 — the shelf.
//
// The browse the hub was always documented as having. It renders twenty-eight
// cards, sixteen of which mount a real preview at card size, so it is the one
// place in the project where every wireframe is on screen at once. That makes a
// few things worth pinning that nothing else has had to.
import { renderToString } from "react-dom/server";
import fs from "node:fs";
import { AI_PATTERNS, DOCUMENTED_COUNT } from "./src/data/aiPatterns.js";
import { PATTERN_PREVIEWS } from "./src/components/ai/previews/index.js";
import { PatternShelf } from "./src/components/ai/PatternShelf.jsx";

let fails = 0;
const bad = (m) => { fails++; console.log(`FAIL  ${m}`); };
const ok = (m, c, n) => (c ? console.log(`  ok  ${m}${n ? ` — ${n}` : ""}`) : bad(`${m}${n ? ` — ${n}` : ""}`));
const count = (h, s) => h.split(s).length - 1;

const html = renderToString(<PatternShelf onOpen={() => {}} />);
const css = fs.readFileSync("./src/styles/global.css", "utf8");

console.log("\nEvery pattern is on the shelf, exactly once");
// Compared as visible text rather than as markup. React escapes an apostrophe
// to &#x27; and an ampersand to &amp;, so "Stop & Steer" and "it's" never match
// the source string — which is what the first version of this check tripped on
// and reported as six missing patterns.
const text = html
  .replace(/<[^>]*>/g, " ")
  .replace(/&#x27;|&#39;/g, "'")
  .replace(/&quot;/g, '"')
  .replace(/&amp;/g, "&")
  .replace(/&nbsp;/g, " ")
  .replace(/\s+/g, " ");

ok("one card per entry", count(html, 'class="ai-card"') === AI_PATTERNS.length,
  `${count(html, 'class="ai-card"')} cards for ${AI_PATTERNS.length} entries`);
for (const p of AI_PATTERNS) {
  if (!text.includes(p.name)) bad(`${p.name} is missing from the shelf`);
  // The definition, not a second shorter line written for a card — that would
  // be a source that drifts from the one string written to land cold.
  if (!text.includes(p.definition.replace(/\s+/g, " ").slice(0, 50)))
    bad(`${p.name}: the card is not showing its own definition`);
}
ok(`${AI_PATTERNS.length} names and ${AI_PATTERNS.length} definitions present`, true);

// Numbered across the whole shelf. The number is the sense of how many there
// are; restarting it per category would turn it into a per-aisle index, which
// is a different and less useful thing.
console.log("\nNumbered 01 through the end, in taxonomy order");
const nums = [...html.matchAll(/class="ai-card-no">(\d+)</g)].map((m) => m[1]);
ok("every card is numbered", nums.length === AI_PATTERNS.length, `${nums.length} numbers`);
ok("…and they run in order with no gaps",
  nums.every((v, i) => Number(v) === i + 1) && nums[0] === "01",
  `${nums[0]}…${nums[nums.length - 1]}`);

console.log("\nPlanned entries are text, and say so");
const planned = AI_PATTERNS.filter((p) => p.status !== "documented");
ok("a dashed, text-only card for each", count(html, "data-planned") === planned.length,
  `${count(html, "data-planned")} of ${planned.length}`);
ok("each one says it isn't written up", count(html, "ai-card-todo") === planned.length);
ok("figures only on the ones that have a drawing",
  count(html, "ai-card-fig") === DOCUMENTED_COUNT, `${count(html, "ai-card-fig")} of ${DOCUMENTED_COUNT}`);

// The whole card is the control. The frame inside it is a picture: at this size
// its text is texture rather than reading, and everything a reader needs is the
// name and the definition beside it in real type. So it is out of the tab order
// and out of the accessibility tree — otherwise a keyboard user would walk
// several hundred wireframe controls to cross the shelf.
console.log("\nThe drawings are pictures, not controls");
ok("every figure is inert", count(html, 'class="ai-card-fig" aria-hidden="true" inert=""') === DOCUMENTED_COUNT,
  `${count(html, 'inert=""')} inert`);
const controlsInFigures = count(html, "<button") - AI_PATTERNS.length;
ok("…which is the only thing standing between a reader and every preview control",
  controlsInFigures > 0, `${controlsInFigures} preview controls, all sealed off`);

// The card cannot be a button, because it mounts a preview and a preview has
// real Buttons in it. `inert` does nothing about invalid nesting: a <button>
// inside a <button> is malformed markup whatever its descendants are marked as.
// So the card is a div with exactly one control in it, stretched over the whole
// card by a pseudo-element.
const nested = (() => {
  let depth = 0, worst = 0;
  for (const m of html.matchAll(/<(\/?)button\b/g)) {
    depth += m[1] ? -1 : 1;
    worst = Math.max(worst, depth);
  }
  return worst;
})();
ok("no button is nested inside another button", nested <= 1, `deepest nesting ${nested}`);
ok("…and each card still has exactly one control",
  count(html, 'class="ai-card-name"') === AI_PATTERNS.length,
  `${count(html, 'class="ai-card-name"')} controls`);

// A card renders the pattern's OPENING state, and one of those used to open a
// field with autoFocus. Sixteen of them on one page is sixteen elements
// competing to steal focus the moment the shelf mounts.
console.log("\nNothing on the shelf grabs focus when it loads");
ok("no autoFocus in any opening frame", !/autofocus/i.test(html),
  /autofocus/i.test(html) ? "found one" : "none");

// And nothing moves. The previews carry `work.tick`; the shelf never calls it,
// which is what keeps twenty-eight timers off the page. Effects don't run under
// renderToString, so this is asserted at the source instead.
console.log("\nNothing on the shelf moves");
// Comments stripped first: this file explains at length why it does not tick,
// and the first version of this check was matching its own reasoning.
const src = fs.readFileSync("./src/components/ai/PatternShelf.jsx", "utf8")
  .replace(/\/\*[^]*?\*\//g, " ")
  .split("\n").map((l) => l.replace(/\/\/.*$/, "")).join("\n");
ok("the shelf never reads tick", !src.includes("tick"));
// It holds no state at all now. A card used to expand in place into a compact
// lab, which made "which card is open" the shelf's one piece of state; cards go
// straight to the page instead, so there is nothing here to hold and nothing
// that could start a timer behind a still card.
ok("…and runs no clock of its own",
  !/useEffect|setTimeout|setInterval|requestAnimationFrame/.test(src));
ok("…and holds no state", !/useState\(/.test(src));
const ticking = AI_PATTERNS.filter((p) => PATTERN_PREVIEWS[p.id]?.work?.tick).length;
ok("…on previews that would otherwise move", ticking > 0, `${ticking} patterns carry a tick`);

// Same both-ways CSS check the rest of the AI hub gets.
console.log("\nglobal.css — the shelf's classes resolve both ways");
const used = [...new Set([...html.matchAll(/class="([^"]+)"/g)].flatMap((m) => m[1].split(/\s+/)))]
  .filter((c) => c.startsWith("ai-"));
for (const c of used) if (!css.includes(`.${c}`)) bad(`.${c} is used and has no rule`);
for (const c of ["ai-shelf", "ai-shelf-group", "ai-cards", "ai-card", "ai-card-fig", "ai-card-text",
                 "ai-card-top", "ai-card-no", "ai-card-name", "ai-card-def", "ai-card-todo",
                 "ai-shelf-foot"])
  if (!css.includes(`.${c}`)) bad(`.${c} has no rule`);
ok(`${used.length} shelf classes used, every one styled`, true);
// The way back to the shelf is the sidebar's hub title, not a button on the
// pattern page: "All patterns" sat above the pattern's name and was a second
// way to say "the top of this hub".
{
  const side = fs.readFileSync("./src/components/layout/Sidebar.jsx", "utf8");
  ok("the AI Patterns title in the sidebar opens the shelf",
    /hub === "ai" \? \(\s*<button\s+className="nav-hub-title"\s+onClick=\{\(\) => onSelectAiPattern\(null\)\}/.test(side));
  ok("…and the pattern page carries no button of its own for it",
    !fs.readFileSync("./src/components/sections/AiPatternsSection.jsx", "utf8").includes("All patterns</") &&
    !/\.ai-back\b/.test(css));
  ok("…and the title keeps the display face and a focus ring",
    /\.app button\.nav-hub-title\{[^}]*font-family:var\(--display\)/.test(css) &&
    /\.app button\.nav-hub-title:focus-visible\{[^}]*--blue/.test(css));
}

// ── A card opens the page ────────────────────────────────────────────
// Clicking a pattern opens its page. It used to expand the card into a compact
// lab with the page one more click on — three ways into one pattern and two
// sizes of the same lab. So: no lab on the shelf, ever, and the name's one
// handler is the page.
console.log("\nA card opens the pattern's page, not a preview of it");
{
  let opened = null;
  const tree = PatternShelf({ onOpen: (id) => { opened = id; } });
  // Walk the element tree for the first card's name and press it.
  const find = (node) => {
    if (Array.isArray(node)) { for (const n of node) { const f = find(n); if (f) return f; } return null; }
    if (!node || typeof node !== "object") return null;
    if (node.props?.className === "ai-card-name") return node;
    if (typeof node.type === "function" && node.props?.pattern && node.props?.onOpen) return find(node.type(node.props));
    return find(node.props?.children);
  };
  const name = find(tree);
  name?.props.onClick();
  ok("the name opens the page for its own pattern", opened === AI_PATTERNS[0].id, String(opened));
  ok("…and is not a disclosure any more", !html.includes("aria-expanded"));
  ok("no lab is ever mounted on the shelf", !html.includes("ai-lab") && !src.includes("PatternDetail"));
  ok("…and the expand-in-place rules are gone from CSS",
    !css.includes(".ai-card[data-open]") && !css.includes(".ai-card-lab"));
}

// The honesty line said "28 of 28 are written up. The rest are on the shelf…"
// on the first screen of the hub. It only appears when it has something to say.
console.log("\nThe shelf footer only speaks when something is unwritten");
ok("no footer while every pattern is written up",
  DOCUMENTED_COUNT === AI_PATTERNS.length ? !html.includes("ai-shelf-foot") : html.includes("ai-shelf-foot"));

console.log(fails ? `\n${fails} FAILED\n` : "\nall passed\n");
process.exit(fails ? 1 : 0);
