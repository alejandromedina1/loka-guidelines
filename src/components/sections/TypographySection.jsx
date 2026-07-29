import { SectionHead } from "../common/SectionHead.jsx";
import { TypeScale } from "../typography/TypeScale.jsx";

// Foundations / Typography — the Alliance No.2 family and its desktop/mobile scales.
export function TypographySection({ registerRef, copied, onCopy, expandedRow, onToggleRow }) {
  return (
    <section id="typography" className="section" ref={(el) => registerRef("typography", el)}>
      <SectionHead title="Typography">
        Loka is set in <strong>Alliance No.2</strong>. One family across the whole system, with a tight
        scale that shifts between desktop and mobile breakpoints. Values are written as size / line-height.
      </SectionHead>

      <div className="type-hero">
        <div className="type-hero-glyph">Ag</div>
        <div className="type-hero-meta">
          <span className="type-hero-name">Alliance No.2</span>
          <span className="type-hero-sub">Grotesque sans · Degarism Studio</span>
          <div className="type-hero-alpha">
            ABCDEFGHIJKLMNOPQRSTUVWXYZ
            <br />
            abcdefghijklmnopqrstuvwxyz 0123456789
          </div>
        </div>
      </div>

      <div id="type-desktop" className="sub-anchor" ref={(el) => registerRef("type-desktop", el)}>
        <div className="sub-head">
          <h3 className="sub-title">Desktop scale</h3>
          <p className="section-desc">
            Used from the medium breakpoint up. Values are written as size / line-height.
          </p>
        </div>
        <TypeScale breakpoint="desktop" copied={copied} onCopy={onCopy} expandedRow={expandedRow} onToggleRow={onToggleRow} />
      </div>

      <div id="type-mobile" className="sub-anchor" ref={(el) => registerRef("type-mobile", el)}>
        <div className="sub-head">
          <h3 className="sub-title">Mobile scale</h3>
          <p className="section-desc">
            Tightened sizes for small screens, applied below the medium breakpoint.
          </p>
        </div>
        <TypeScale breakpoint="mobile" copied={copied} onCopy={onCopy} expandedRow={expandedRow} onToggleRow={onToggleRow} />
      </div>
    </section>
  );
}
