import { AI_PATTERNS, AI_PATTERNS_BY_CATEGORY, DOCUMENTED_COUNT } from "../../data/aiPatterns.js";
import { PATTERN_PREVIEWS } from "./previews/index.js";
import { NumberChip } from "../common/NumberChip.jsx";

// The shelf — the view the hub was always described as having and never had.
//
// Until this existed, the only way to find out what a pattern was came down to
// recognising its name in the sidebar and opening its page. Twenty-eight nouns
// in a list is not a browse; it is a lookup, and it only works for somebody who
// already knows what they are looking for. This is the layer before the page:
// every pattern at once, each one showing the thing itself.
//
// WHY THE CARDS DO NOT MOVE. The previews carry `work.tick` — the wait passing,
// the four cards landing, Heads-Up making its offer at 2.8 seconds. Twenty-eight
// of those running at once would be twenty-eight timers and a page where
// everything moves and nothing is legible, which is the opposite of what a
// browse is for. So a card renders the pattern's OPENING state and stops. That
// is free, because a preview is a pure function of its working data: `for` gives
// the frame, nothing ticks it, and there is no state for the card to own.
//
// WHY THE FRAME IS NOT SCALED WITH A TRANSFORM. `.mk-frame` is `width:100%`
// under a `maxWidth`, and every size inside it comes off the `--pv-*` ramp — so
// a card shrinks the frame by narrowing the column and stepping the ramp down,
// which is the knob that exists for exactly this. A transform would fake it and
// would put a second, competing idea of "how big is a preview" into the project.
//
// At card size the text inside a frame is texture rather than reading, which is
// why the figure is `inert` and hidden from assistive tech: everything a reader
// needs is the name and the definition beside it, in real type. The drawing is
// what makes the shelf scannable; it is not where the information lives.
function Card({ pattern, n, onOpen }) {
  const Preview = PATTERN_PREVIEWS[pattern.id];
  const planned = pattern.status !== "documented";
  const first = pattern.states?.[0]?.id;
  const W = Preview?.work ?? null;

  // The card is NOT a button, and that is not a style choice. A documented card
  // mounts a real preview, and a preview contains real Buttons — so wrapping
  // the card in a <button> put a button inside a button, which is invalid and
  // which `inert` does nothing about. The card is a div, and exactly one real
  // control lives in it: the name, stretched over the whole card by a
  // pseudo-element. One control, one accessible name, no nesting.
  return (
    <div className="ai-card" data-planned={planned ? "" : undefined}>
      {/* A planned entry is text and says so. An empty box in its place would
          read as a preview that failed to load. */}
      {!planned && Preview && (
        <span className="ai-card-fig" aria-hidden="true" inert="">
          <Preview state={first} work={W ? W.for(first) : undefined} set={() => {}} />
        </span>
      )}

      <span className="ai-card-text">
        <span className="ai-card-top">
          <span className="ai-card-no">{String(n).padStart(2, "0")}</span>
          {/* Opens the pattern's page. It used to expand the card in place into
              a compact lab, with the page one more click on — three ways into
              one pattern, and two sizes of the same lab. A card that goes
              straight to the page is one way in, and the page is where the lab
              has room to be read. */}
          <button type="button" className="ai-card-name" onClick={() => onOpen(pattern.id)}>
            {pattern.name}
          </button>
        </span>
        {/* The pattern's own definition, not a second shorter line written for
            a card. It is the one string in the project written to land cold,
            and a card-sized copy of it would be a second source that drifts. */}
        <span className="ai-card-def">{pattern.definition}</span>
        {planned && <span className="ai-card-todo">Not written up yet</span>}
      </span>
    </div>
  );
}

export function PatternShelf({ onOpen }) {
  // Numbered across the whole shelf rather than restarted per category. The
  // number is not an index anybody looks a pattern up by — it is the sense of
  // how many there are, which is the thing a list of names never gives you.
  let n = 0;
  const unwritten = AI_PATTERNS.length - DOCUMENTED_COUNT;

  return (
    <div className="ai-shelf">
      {AI_PATTERNS_BY_CATEGORY.map((cat) => (
        <section key={cat.id} className="ai-shelf-group">
          <div className="group-head">
            <h3 className="group-title">
              {cat.label}
              <NumberChip size={16}>{cat.patterns.length}</NumberChip>
            </h3>
            <p className="group-desc">{cat.blurb}</p>
          </div>
          <div className="ai-cards">
            {cat.patterns.map((p) => {
              n += 1;
              return <Card key={p.id} pattern={p} n={n} onOpen={onOpen} />;
            })}
          </div>
        </section>
      ))}

      {/* The shelf's honesty line — only when there is something to be honest
          about. It printed "28 of 28 are written up. The rest are on the
          shelf…" once the last pattern was documented, on the first screen of
          the hub. */}
      {unwritten > 0 && (
        <p className="ai-shelf-foot">
          {`${DOCUMENTED_COUNT} of ${AI_PATTERNS.length} are written up. The other ${unwritten} are on the
          shelf as a definition, so the gaps are visible rather than hidden.`}
        </p>
      )}
    </div>
  );
}
