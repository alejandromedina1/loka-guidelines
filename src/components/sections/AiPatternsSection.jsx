import { SectionHead } from "../common/SectionHead.jsx";
import { ArrowLeft, ArrowRight, CheckSmall, CircleX } from "../common/Icon.jsx";
import { DemoStage } from "../ai/demos/DemoStage.jsx";
import { AiPatternPlayground } from "../ai/AiPatternPlayground.jsx";
import {
  AI_CAPABILITIES,
  AI_CAPABILITY_BY_ID,
  AI_LAYERS,
  AI_LAYER_BY_ID,
  AI_UI_PATTERNS,
  AI_UI_PATTERN_BY_ID,
  ALL_CAPABILITY,
  SURFACE_FILTERS,
  SURFACE_LABEL,
  patternsFor,
} from "../../data/aiUiPatterns.js";
import { AI_UI_GUIDES } from "../../data/aiUiPatternGuides.js";

// AI Patterns Hub — one section, the same shape as the Product Hub's: the
// sidebar picks what's on it. `patternId` null is the Overview (every pattern,
// or one capability's, filtered by surface); otherwise it's that pattern's
// page. Capability and surface live in App so they survive a trip into a
// pattern and back — which is what lets the breadcrumb return you to the exact
// list you came from.
//
// The page is built for somebody arriving cold, so every view answers "where
// am I" in its title and "where next" at its end: a capability is the page's
// title rather than a line under a generic one, an empty group offers the
// filter change that fills it, and a pattern ends on what it pairs with and a
// named pager rather than blank space.
export function AiPatternsSection({
  registerRef,
  patternId,
  onSelectPattern,
  cap,
  setCap,
  surface,
  setSurface,
}) {
  const pattern = patternId ? AI_UI_PATTERN_BY_ID.get(patternId) : null;

  // A capability from a pattern goes back to the Overview filtered to it, with
  // the surface reset so the pattern you came from is in the list.
  const showCapability = (id) => {
    setCap(id);
    setSurface("all");
    onSelectPattern(null);
  };

  return (
    <section id="ai-patterns" className="section" ref={(el) => registerRef("ai-patterns", el)}>
      {pattern ? (
        <PatternPage
          key={pattern.id}
          pattern={pattern}
          cap={cap}
          onSelectPattern={onSelectPattern}
          onSelectCapability={showCapability}
        />
      ) : (
        <Overview
          cap={cap}
          setCap={setCap}
          surface={surface}
          setSurface={setSurface}
          onSelectPattern={onSelectPattern}
          onSelectCapability={showCapability}
        />
      )}
    </section>
  );
}

function Overview({ cap, setCap, surface, setSurface, onSelectPattern, onSelectCapability }) {
  const c = AI_CAPABILITY_BY_ID.get(cap) ?? null;
  const list = patternsFor(cap, surface);
  const surfaceLabel = SURFACE_FILTERS.find((f) => f.id === surface).label;
  const filtered = cap !== ALL_CAPABILITY.id || surface !== "all";

  return (
    <>
      {c ? (
        <>
          <Crumbs items={[{ label: "All patterns", onClick: () => onSelectCapability("all") }, { label: c.name }]} />
          <SectionHead title={c.name}>
            {c.desc} <span className="ai-head-ex">Typical features: {c.ex}</span>
          </SectionHead>
        </>
      ) : (
        <SectionHead title="AI UI Patterns">
          The interface patterns for building AI features — in chat, and inside products that aren&apos;t a
          chat. Each one has a live demo to try, and a page with what you need to design it: the parts, the
          states, and the calls a design review will argue about.
        </SectionHead>
      )}

      {/* One bar for everything that changes the list, held in view while the
          grid scrolls under it, so a filter is never a scroll away. The
          capability shows here as a chip, with a way to clear it, so the bar
          says why the list is short without a trip back to the sidebar. */}
      <div className="ai-toolbar">
        <span className="ai-result" aria-live="polite">
          <strong>{list.length}</strong> pattern{list.length === 1 ? "" : "s"}
          {c && <> for {c.name}</>}
          {surface !== "all" && <> · {surfaceLabel.toLowerCase()}</>}
        </span>
        {c && (
          <button type="button" className="ai-filter-chip" onClick={() => setCap(ALL_CAPABILITY.id)}>
            {c.name}
            <span className="vh">, remove filter</span>
            <CircleX size={13} />
          </button>
        )}
        <div className="ai-seg" role="group" aria-label="Where it lives">
          {SURFACE_FILTERS.map((f) => (
            <button key={f.id} type="button" aria-pressed={surface === f.id} onClick={() => setSurface(f.id)}>
              {f.label}
            </button>
          ))}
        </div>
        <Legend />
      </div>

      {AI_LAYERS.map((layer) => {
        const items = list.filter((p) => p.layer === layer.id);
        // An empty group says why, and offers the one change that fills it.
        // The surface filter only gets the blame when it's actually on — under
        // a capability with no patterns in this layer at all, widening the
        // surface would do nothing, so the way out is the whole layer.
        const bySurface = surface !== "all" && patternsFor(cap, "all").some((p) => p.layer === layer.id);
        return (
          <section key={layer.id} className="ai-layer">
            <div className="group-head">
              <h3 className="group-title">
                {layer.label} <span className="ai-count">{items.length}</span>
              </h3>
              <p className="group-desc">{layer.desc}</p>
            </div>
            {items.length ? (
              <div className="ai-cards">
                {/* Keyed on the filters too, so a change remounts the card and
                    its demo plays again rather than sitting on its last frame. */}
                {items.map((p) => (
                  <Card key={`${cap}/${surface}/${p.id}`} pattern={p} onOpen={onSelectPattern} />
                ))}
              </div>
            ) : bySurface ? (
              <div className="ai-empty">
                <span>
                  No {layer.label.toLowerCase()} patterns{c ? ` for ${c.name}` : ""}{" "}
                  {surface === "chat" ? "in chat" : "embedded in a product"}.
                </span>
                <button type="button" className="ai-empty-btn" onClick={() => setSurface("all")}>
                  Show all surfaces
                </button>
              </div>
            ) : (
              <div className="ai-empty">
                <span>
                  None are specific to {c ? c.name : "this filter"}, but most AI features still need a way to
                  check and undo what the AI did.
                </span>
                <button type="button" className="ai-empty-btn" onClick={() => onSelectCapability(ALL_CAPABILITY.id)}>
                  See all {layer.label.toLowerCase()} patterns
                </button>
              </div>
            )}
          </section>
        );
      })}

      {filtered && (
        <div className="ai-foot">
          <button
            type="button"
            className="ai-empty-btn"
            onClick={() => {
              setSurface("all");
              onSelectCapability(ALL_CAPABILITY.id);
            }}
          >
            Show all {AI_UI_PATTERNS.length} patterns
          </button>
        </div>
      )}
    </>
  );
}

function Legend() {
  return (
    <span className="ai-legend">
      <i aria-hidden="true" />
      AI-produced content
    </span>
  );
}

function Crumbs({ items }) {
  return (
    <nav className="ai-crumbs" aria-label="Breadcrumb">
      {items.map((it, i) => (
        <span key={it.label} className="ai-crumb">
          {i > 0 && <span className="ai-crumb-sep" aria-hidden="true">/</span>}
          {it.onClick ? (
            <button type="button" onClick={it.onClick}>
              {it.label}
            </button>
          ) : (
            <span aria-current="page">{it.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

// The demo is meant to be pressed, so it stays its own target. Everything
// under it — name, surface, the line, the cue — is one button-sized target that
// opens the pattern: the name's hit area is stretched over the text block, so
// there is still exactly one control and one accessible name.
function Card({ pattern, onOpen }) {
  return (
    <article className="ai-card">
      <DemoStage id={pattern.id} start="scroll" />
      <div className="ai-card-text">
        <div className="ai-card-meta">
          <button type="button" className="ai-card-name" onClick={() => onOpen(pattern.id)}>
            {pattern.name}
          </button>
          <span className="ai-card-surface">{SURFACE_LABEL[pattern.s]}</span>
        </div>
        {/* What it is, not when to use it: somebody browsing doesn't know the
            pattern yet, and "when" only lands once you know "what". */}
        <p className="ai-card-use">{AI_UI_GUIDES[pattern.id]?.what ?? pattern.use}</p>
        <span className="ai-card-open" aria-hidden="true">
          Open pattern <ArrowRight size={13} />
        </span>
      </div>
    </article>
  );
}

function PatternPage({ pattern, cap, onSelectPattern, onSelectCapability }) {
  const layer = AI_LAYER_BY_ID.get(pattern.layer);
  const guide = AI_UI_GUIDES[pattern.id];
  // The capability crumb only when this pattern is in it — a pattern reached
  // from search while "Summarize" was last open shouldn't claim to live there.
  const from = cap !== ALL_CAPABILITY.id && pattern.caps.includes(cap) ? AI_CAPABILITY_BY_ID.get(cap) : null;
  const i = AI_UI_PATTERNS.indexOf(pattern);
  const n = AI_UI_PATTERNS.length;
  const prev = AI_UI_PATTERNS[(i - 1 + n) % n];
  const next = AI_UI_PATTERNS[(i + 1) % n];

  return (
    <>
      <Crumbs
        items={[
          { label: "All patterns", onClick: () => onSelectCapability(ALL_CAPABILITY.id) },
          ...(from ? [{ label: from.name, onClick: () => onSelectCapability(from.id) }] : []),
          { label: pattern.name },
        ]}
      />
      {/* The description is what the pattern IS, in one plain sentence. It
          used to be the layer's blurb, which is the same on eighteen pages and
          told a designer nothing about this one. */}
      <SectionHead title={pattern.name}>{guide.what}</SectionHead>

      {/* Where it sits, on one line: the layer and surface as facts, and the
          capabilities as the way back to everything else that serves them. */}
      <div className="ai-meta">
        <span className="ai-meta-fact">
          <span className="ai-meta-k">Layer</span> {layer.label}
        </span>
        <span className="ai-meta-fact">
          <span className="ai-meta-k">Lives</span> {SURFACE_LABEL[pattern.s]}
        </span>
        <span className="ai-meta-fact ai-meta-caps">
          <span className="ai-meta-k">Serves</span>
          {pattern.caps.map((id) => (
            <button key={id} type="button" className="ai-chip" onClick={() => onSelectCapability(id)}>
              {AI_CAPABILITY_BY_ID.get(id).name}
            </button>
          ))}
        </span>
      </div>

      <AiPatternPlayground pattern={pattern} />

      <BuildIt guide={guide} />

      {/* Where to go next, in the order somebody finishing a pattern needs it:
          what ships alongside this one, drawn live, then the next in the
          library by name. */}
      <section className="ai-layer ai-pairs">
        <div className="group-head">
          <h3 className="group-title">Pairs well with</h3>
          <p className="group-desc">Patterns that usually ship alongside {pattern.name.replace(/[“”"]/g, "")}.</p>
        </div>
        <div className="ai-cards">
          {pattern.pairs.map((id) => (
            <Card key={id} pattern={AI_UI_PATTERN_BY_ID.get(id)} onOpen={onSelectPattern} />
          ))}
        </div>
      </section>

      <nav className="ai-pager" aria-label="More patterns">
        <button type="button" className="ai-pager-btn" onClick={() => onSelectPattern(prev.id)}>
          <span className="ai-pager-dir">
            <ArrowLeft size={13} /> Previous
          </span>
          <span className="ai-pager-name">{prev.name}</span>
        </button>
        <button type="button" className="ai-pager-btn" data-next="" onClick={() => onSelectPattern(next.id)}>
          <span className="ai-pager-dir">
            Next <ArrowRight size={13} />
          </span>
          <span className="ai-pager-name">{next.name}</span>
        </button>
      </nav>
    </>
  );
}

// Everything a designer needs once the demo has convinced them: what to draw,
// which frames to draw beyond the happy one, and the calls a design review
// will argue about. Open, not folded — it sits below the demo already, and it
// is the part of the page that changes a design.
function BuildIt({ guide }) {
  return (
    <section className="ai-layer ai-build" aria-labelledby="ai-build-title">
      <div className="group-head">
        <h3 className="group-title" id="ai-build-title">
          Build it
        </h3>
        <p className="group-desc">The parts to draw and the states to design, including the ones the demo skips.</p>
      </div>

      <div className="ai-build-grid">
        <div className="ai-build-card">
          <h4 className="ai-build-h">Anatomy</h4>
          <ol className="ai-parts">
            {guide.anatomy.map((a, i) => (
              <li key={a.name}>
                <span className="ai-parts-no" aria-hidden="true">
                  {i + 1}
                </span>
                <span className="ai-parts-name">{a.name}</span>
                <span className="ai-parts-note">{a.note}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="ai-build-card">
          <h4 className="ai-build-h">States to design</h4>
          <ul className="ai-states">
            {guide.states.map((st) => (
              <li key={st.name}>
                <span className="ai-states-name">{st.name}</span>
                <span className="ai-states-note">{st.note}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Do and Don't carry their meaning in the heading and the icon, in
            ink. No green and red: "don't" is advice, not a failure. */}
        <div className="ai-build-card">
          <h4 className="ai-build-h">Do</h4>
          <ul className="ai-rules">
            {guide.dos.map((t) => (
              <li key={t}>
                <span className="ai-rule-ic" aria-hidden="true">
                  <CheckSmall size={12} />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="ai-build-card">
          <h4 className="ai-build-h">Don&apos;t</h4>
          <ul className="ai-rules">
            {guide.donts.map((t) => (
              <li key={t}>
                <span className="ai-rule-ic" aria-hidden="true">
                  <CircleX size={13} />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="ai-a11y">
        <span className="ai-a11y-k">Accessibility</span>
        <p>{guide.a11y}</p>
      </div>
    </section>
  );
}
