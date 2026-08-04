import { useState } from "react";
import { SectionHead } from "../common/SectionHead.jsx";
import { makeButtonStyle, makeStrokeStyle } from "../playground/buttonStyles.js";

// The published Figma library. Swap this for the real file URL once the library
// is published — it's the only thing in this section that needs maintaining.
const FIGMA_LIBRARY_URL = "https://www.figma.com/design/REPLACE_ME/Loka-Design-System";

// Getting started / Figma library — the hand-off from these docs to the live
// component library designers actually build with.
export function FigmaLibrarySection({ registerRef }) {
  return (
    <section id="figma-library" className="section" ref={(el) => registerRef("figma-library", el)}>
      <SectionHead title="Figma library">
        Everything documented here is published as a Figma library. Enable it once and the
        foundations and components stay in sync as the system evolves — no copying, no drift.
      </SectionHead>

      <div className="fig-lib">
        <div className="fig-open">
          <div>
            <span className="fig-open-title">Loka Design System</span>
            <span className="fig-open-meta">
              Variables, text styles, and component sets — the source these docs describe.
            </span>
          </div>
          <OpenButton />
        </div>
      </div>
    </section>
  );
}

// The real Button — same spec functions the playground renders from, so this
// can't drift from the documented component. Primary carries no icon: Ghost is
// the only variant in the library that does, and it's a card-footer bar rather
// than a link.
function OpenButton() {
  const [state, setState] = useState("default");
  const style = makeButtonStyle({ variant: "Primary", state, device: "Desktop" });
  const ring = makeStrokeStyle({ variant: "Primary", state });

  return (
    <a
      className="fig-btn"
      href={FIGMA_LIBRARY_URL}
      target="_blank"
      rel="noreferrer noopener"
      style={style}
      onMouseEnter={() => setState("hover")}
      onMouseLeave={() => setState("default")}
      onMouseDown={() => setState("pressed")}
      onMouseUp={() => setState("hover")}
    >
      {ring && <span className="btn-ring" style={ring} aria-hidden />}
      Open in Figma
    </a>
  );
}
