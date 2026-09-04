import { SectionHead } from "../common/SectionHead.jsx";
import { AI_PRINCIPLES } from "../../data/aiPrinciples.js";
import { AI_PATTERN_BY_ID, CONTROL_AXES } from "../../data/aiPatterns.js";

// AI Patterns / Principles — the "why" behind the shelf, as its own view.
//
// A view rather than a band above the patterns, because it belongs to the hub
// and not to any single pattern. Stacked, it also meant everyone scrolled past
// six principle cards to reach the thing they came for.
//
// Supporting content, deliberately: the patterns are this hub's core and this
// page exists to say why they're worth following. It stays because the failure
// mode the hub is built against is a team that picks the right pattern and still
// ships something untrustworthy — read only the shelf and you get the shapes
// without the reasons.
//
// The six are written for the AI most designers are actually asked to ship —
// a ranked queue, a pre-filled field, a score, a flagged exception — rather
// than for a chat box. See data/aiPrinciples.js for why that vantage point
// changes what they say.
//
// Two parts under one section, on the shared `group-head` tier that Color uses
// for its ramps: the six, then the five verbs every pattern page is graded
// against.
//
// Each principle carries chips to the patterns that apply it, which is what
// turns this from a page you read into one you leave — the same `.ai-chip`
// affordance a pattern's "Composed from" uses to reach the Product Hub. Defining the verbs once here is what lets each pattern's properties
// column state them as five grades instead of five paragraphs.
export function AiPrinciplesSection({ registerRef, onSelectAiPattern }) {
  return (
    <section id="ai-principles" className="section" ref={(el) => registerRef("ai-principles", el)}>
      <SectionHead title="Principles">
        Why the patterns look the way they do — six rules that hold for every pattern here rather than
        for any one of them. Written for the kind of AI most of us actually ship: a sorted list, a
        field filled in for you, a score. They work for a chat box too, but none of them need one.
      </SectionHead>

      <div className="ai-prin">
        {AI_PRINCIPLES.map((p, i) => (
          <article key={p.id} className="ai-prin-card">
            <span className="ai-prin-num">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="ai-prin-title">{p.title}</h3>
            <p className="ai-prin-body">{p.body}</p>
            {/* Where to go and see it. Without these the page is six paragraphs
                to read and nothing to do, and the claim that the patterns are
                applications of these principles stays an assertion. */}
            {p.applies?.length > 0 && (
              <div className="ai-prin-applies">
                <span className="ai-prin-applies-label">Applied in</span>
                <div className="ai-chips">
                  {p.applies.map((id) => (
                    <button key={id} className="ai-chip" onClick={() => onSelectAiPattern(id)}>
                      {AI_PATTERN_BY_ID.get(id)?.name ?? id}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </article>
        ))}
      </div>

      <div className="ai-group">
        <div className="group-head">
          <h4 className="group-title">The five things a person has to be able to do</h4>
          <p className="group-desc">
            Every written-up pattern is graded on all five, and “N/A” is a fair answer — what isn't allowed
            is leaving one blank. A pattern that can't say what happens when somebody wants to stop
            it, check it, or undo it isn't finished being designed, however good it looks when
            everything goes right.
          </p>
        </div>
        <dl className="ai-defs">
          {CONTROL_AXES.map((a) => (
            <div key={a.id} className="ai-defs-row">
              <dt>{a.label}</dt>
              <dd>{a.desc}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
