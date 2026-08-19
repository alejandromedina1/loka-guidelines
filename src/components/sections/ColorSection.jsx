import { SectionHead } from "../common/SectionHead.jsx";
import { ColorGroup } from "../color/ColorGroup.jsx";
import { PALETTE } from "../../data/palette.js";

// Foundations / Color — the neutral and blue palettes.
export function ColorSection({ registerRef, copied, onCopy }) {
  return (
    <section id="color" className="section" ref={(el) => registerRef("color", el)}>
      <SectionHead title="Color">
        Color anchors the Loka identity. A deep near-black neutral scale carries structure; a single
        decisive blue carries everything interactive. The palette below is the source for both product and
        marketing surfaces.
      </SectionHead>

      <div id="color-neutral" className="sub-anchor" ref={(el) => registerRef("color-neutral", el)}>
        <div className="sub-head">
          <h3 className="sub-title">Neutral</h3>
          <p className="section-desc">{PALETTE.neutral.description}</p>
        </div>
        <ColorGroup group="neutral" data={PALETTE.neutral} copied={copied} onCopy={onCopy} />
      </div>

      <div id="color-blue" className="sub-anchor" ref={(el) => registerRef("color-blue", el)}>
        <div className="sub-head">
          <h3 className="sub-title">Blue</h3>
          <p className="section-desc">{PALETTE.blue.description}</p>
        </div>
        <ColorGroup group="blue" data={PALETTE.blue} copied={copied} onCopy={onCopy} />
      </div>

      {/* Semantics come after the two scales they draw from. Named surfaces/lines
          and the Red/Amber/Green feedback ramps each get their own heading —
          one flat grid of 42 unrelated swatches would read as noise. */}
      <div id="color-semantic" className="sub-anchor" ref={(el) => registerRef("color-semantic", el)}>
        <div className="sub-head">
          <h3 className="sub-title">Semantic</h3>
          <p className="section-desc">{PALETTE.semantic.description}</p>
        </div>
        {PALETTE.semantic.groups.map((g) => (
          <div key={g.key} className="group-block">
            <div className="group-head">
              <h4 className="group-title">{g.label}</h4>
              <p className="group-desc">{g.description}</p>
            </div>
            <ColorGroup group="semantic" data={{ tokens: g.tokens }} copied={copied} onCopy={onCopy} />
          </div>
        ))}
      </div>
    </section>
  );
}
