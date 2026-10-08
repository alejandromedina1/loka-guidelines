import { useEffect } from "react";
import { SectionHead } from "../common/SectionHead.jsx";
import { Tab } from "../common/Tab.jsx";
import { NumberChip } from "../common/NumberChip.jsx";
import { DemoStage } from "../ai/demos/DemoStage.jsx";
import {
  AI_CAPABILITY_BY_ID,
  AI_UI_PATTERN_BY_ID,
  ALL_CAPABILITY,
  LAYERS,
  SURFACE_FILTERS,
  SURFACE_LABEL,
  patternsFor,
  uiLine,
  uiName,
} from "../../data/aiCapabilities.js";
import { AI_PATTERN_BY_ID } from "../../data/aiPatterns.js";

// AI Patterns / By capability — pick what the AI does, see the patterns that
// bring it to the interface. The third exclusive view in the hub, beside the
// Patterns shelf and Principles; why it exists alongside the shelf rather than
// replacing it is in data/aiCapabilities.js.
//
// Two states, the same shape as the Patterns view: `patternId` null is the
// grid for one capability, otherwise one pattern's page. The capability, the
// surface and the pattern all live in App, because the sidebar reads the first
// two (its counts follow the surface filter, as the source's rail did).
//
// What changed from the source, outside the demos, is only the frame — the
// house's SectionHead, group heads, card grid, Tab pills and definition rail
// in place of its own type and its slide-in sheet. A sheet over a grid was the
// source's way of keeping the grid behind you; here the sidebar does that, so
// the detail is a page, the same as every other pattern in this hub.
export function AiCapabilitiesSection({
  registerRef,
  cap,
  surface,
  onSurface,
  patternId,
  onOpenPattern,
  onSelectCapability,
  onSelectAiPattern,
}) {
  // A merged entry has no page here — it IS a shelf pattern, and App sends it
  // there — so an id that names one (an old link, say) shows the grid.
  const found = patternId ? AI_UI_PATTERN_BY_ID.get(patternId) : null;
  const pattern = found && !found.merged ? found : null;

  // Every way into a pattern from this view goes through here, so a merged
  // entry always lands on its shelf page and never on a second one.
  const open = (id) => {
    const p = AI_UI_PATTERN_BY_ID.get(id);
    if (p.merged) onSelectAiPattern(p.merged);
    else onOpenPattern(id);
  };

  // The address follows the view, as the source's writeHash did, and is
  // cleared on the way out so it never names a view you have left.
  useEffect(() => {
    const path = `#cap/${cap}/${surface}${pattern ? `/${pattern.id}` : ""}`;
    window.history.replaceState(null, "", window.location.pathname + window.location.search + path);
  }, [cap, surface, pattern]);
  useEffect(
    () => () => {
      if (window.location.hash.startsWith("#cap/"))
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
    },
    [],
  );

  return (
    <section id="ai-capabilities" className="section" ref={(el) => registerRef("ai-capabilities", el)}>
      {pattern ? (
        <PatternPage
          key={pattern.id}
          pattern={pattern}
          onOpenPattern={open}
          onSelectCapability={onSelectCapability}
          onSelectAiPattern={onSelectAiPattern}
        />
      ) : (
        <CapabilityShelf cap={cap} surface={surface} onSurface={onSurface} onOpenPattern={open} />
      )}
    </section>
  );
}

function CapabilityShelf({ cap, surface, onSurface, onOpenPattern }) {
  const c = AI_CAPABILITY_BY_ID.get(cap) ?? ALL_CAPABILITY;
  const list = patternsFor(cap, surface);

  return (
    <>
      <SectionHead title={c.name}>
        {c.desc} Typical features: {c.ex}
      </SectionHead>

      <div className="ai-cap-bar">
        {/* The house's Tab pill, as a filter. A tablist rather than a group of
            toggles because exactly one is on and it decides what is listed,
            which is what the pill's aria-selected state is drawn for. */}
        <div className="ai-cap-tabs" role="tablist" aria-label="Surface">
          {SURFACE_FILTERS.map((f) => (
            <Tab key={f.id} role="tab" aria-selected={surface === f.id} onClick={() => onSurface(f.id)}>
              {f.label}
            </Tab>
          ))}
        </div>
        <span className="ai-cap-legend">
          <i className="ai-demo ai-cap-swatch" aria-hidden="true" />
          AI-produced content
        </span>
      </div>

      <div className="ai-shelf">
        {LAYERS.map((layer) => {
          const items = list.filter((p) => p.layer === layer.id);
          return (
            <section key={layer.id} className="ai-shelf-group">
              <div className="group-head">
                <h3 className="group-title">
                  {layer.label}
                  <NumberChip size={16}>{items.length}</NumberChip>
                </h3>
                <p className="group-desc">{layer.desc}</p>
              </div>
              {items.length ? (
                <div className="ai-cards">
                  {/* Keyed on the filter as well as the pattern, so changing
                      either remounts the card and its demo plays again — the
                      source rebuilt the whole grid on every change, and a demo
                      that had already finished off-screen would otherwise sit
                      on its last frame. */}
                  {items.map((p) => (
                    <Card key={`${cap}/${surface}/${p.id}`} pattern={p} onOpen={onOpenPattern} />
                  ))}
                </div>
              ) : (
                <p className="ai-shelf-foot">
                  No {layer.id === "core" ? "core" : "trust"} patterns for this capability on this surface.
                  Switch to All surfaces to see the rest.
                </p>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}

// The shelf's card box with a live demo where its still figure would be. The
// demo is meant to be pressed, so unlike the shelf's card the whole box is not
// a link — only the name is, as in the source.
//
// A merged entry's card is the shelf pattern's: its name, its definition, and
// its page — with this view's demo on top, which is the one thing the shelf
// card (a still) doesn't have.
function Card({ pattern, onOpen }) {
  return (
    <div className="ai-card" data-live="">
      <DemoStage id={pattern.id} start="scroll" />
      <span className="ai-card-text">
        <span className="ai-card-top">
          <button type="button" className="ai-card-name" onClick={() => onOpen(pattern.id)}>
            {uiName(pattern)}
          </button>
          <span className="ai-card-surface">{SURFACE_LABEL[pattern.s]}</span>
        </span>
        <span className="ai-card-def">{uiLine(pattern)}</span>
      </span>
    </div>
  );
}

function PatternPage({ pattern, onOpenPattern, onSelectCapability, onSelectAiPattern }) {
  const layer = LAYERS.find((l) => l.id === pattern.layer);
  const related = (pattern.related ?? []).map((id) => AI_PATTERN_BY_ID.get(id)).filter(Boolean);

  return (
    <div className="ai-cap-page">
      {/* The head's description is where the source's badge went — surface and
          layer — rather than `use`, which the rail below already carries. A
          sentence said twice on one page is the duplication this hub keeps
          cutting. */}
      <SectionHead title={pattern.name}>
        {SURFACE_LABEL[pattern.s]} · {layer.label}. {layer.desc}
      </SectionHead>

      {/* Plays as soon as the page opens, as the source's sheet did — the page
          is opened on the demo, so there is nothing to scroll to first. */}
      <DemoStage id={pattern.id} start="now" size="page" />

      <dl className="ai-defs">
        <div className="ai-defs-row">
          <dt>Use it when</dt>
          <dd>{pattern.use}</dd>
        </div>
        <div className="ai-defs-row">
          <dt>Avoid it when</dt>
          <dd>{pattern.avoid}</dd>
        </div>
        <div className="ai-defs-row">
          <dt>Pair it with</dt>
          <dd className="ai-chips">
            {pattern.pairs.map((id) => (
              <button key={id} type="button" className="ai-chip" onClick={() => onOpenPattern(id)}>
                {uiName(AI_UI_PATTERN_BY_ID.get(id))}
              </button>
            ))}
          </dd>
        </div>
        <div className="ai-defs-row">
          <dt>Serves these capabilities</dt>
          <dd className="ai-chips">
            {pattern.caps.map((id) => (
              <button key={id} type="button" className="ai-chip" onClick={() => onSelectCapability(id)}>
                {AI_CAPABILITY_BY_ID.get(id).name}
              </button>
            ))}
          </dd>
        </div>
        {/* Not in the source. A shelf pattern that covers neighbouring ground —
            related, not the same; the same ones were merged into the shelf and
            have no page here. */}
        {related.length > 0 && (
          <div className="ai-defs-row">
            <dt>Related on the shelf</dt>
            <dd className="ai-chips">
              {related.map((p) => (
                <button key={p.id} type="button" className="ai-chip" onClick={() => onSelectAiPattern(p.id)}>
                  {p.name}
                </button>
              ))}
            </dd>
          </div>
        )}
      </dl>
    </div>
  );
}
