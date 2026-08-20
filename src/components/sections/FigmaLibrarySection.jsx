import { useState } from "react";
import { FIGMA_FILE_URL } from "../../data/figma.js";
import { SectionHead } from "../common/SectionHead.jsx";
import { makeButtonStyle, makeStrokeStyle } from "../playground/buttonStyles.js";

// The file root — no node id, because this is the one link in the hub that means
// "the library" rather than "the thing this section documents". It resolves
// against the same key every other Figma target here does, so publishing the
// library to a separate file is one edit in data/figma.js rather than a hunt.

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
      href={FIGMA_FILE_URL}
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
