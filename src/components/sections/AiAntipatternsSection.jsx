import { SectionHead } from "../common/SectionHead.jsx";
import { AI_ANTIPATTERNS } from "../../data/aiAntipatterns.js";
import { ANTIPATTERN_FIGURES } from "../ai/antipatterns/index.jsx";

// AI Patterns / Anti-patterns — the named failures, as its own view.
//
// Its own view for a specific reason: stacked under the pattern canvas, these
// read as the anti-patterns *of that pattern*. They aren't. Every one is
// hub-wide, and most are the inverse of something a principle argues for
// rather than of any single entry on the shelf.
//
// Each carries a wireframe of the mistake and three fixed parts — what it looks
// like, why it happens, what to do instead. The middle one is why the page works
// on a mixed audience: none of these are stupid mistakes, every one is the
// locally reasonable choice, which is exactly why naming them is worth doing.
//
// The wireframe leads. This page used to be nine cards of prose in a hub whose
// argument is show-don't-tell, and failure is the easier half to show — a rubber
// stamp is recognisable in a second as a picture and takes a paragraph to
// describe.
export function AiAntipatternsSection({ registerRef }) {
  return (
    <section
      id="ai-antipatterns"
      className="section"
      ref={(el) => registerRef("ai-antipatterns", el)}
    >
      <SectionHead title="Anti-patterns">
        Nine named failures that turn up across every pattern here, so a vague worry in a review becomes
        something you can point at. Written for everyone — most of these get agreed to in rooms with
        no designer in them.
      </SectionHead>

      <div className="ai-anti">
        {AI_ANTIPATTERNS.map((a) => {
          const Figure = ANTIPATTERN_FIGURES[a.id];
          return (
          <article key={a.id} className="ai-anti-card">
            {Figure && (
              <div className="ai-anti-fig" aria-hidden>
                <Figure />
              </div>
            )}
            <h3 className="ai-anti-name">{a.name}</h3>
            <dl className="ai-anti-parts">
              <div>
                <dt>Looks like</dt>
                <dd>{a.looks}</dd>
              </div>
              <div>
                <dt>Why it happens</dt>
                <dd>{a.why}</dd>
              </div>
              <div>
                <dt>Instead</dt>
                <dd data-tone="fix">{a.instead}</dd>
              </div>
            </dl>
          </article>
          );
        })}
      </div>
    </section>
  );
}
