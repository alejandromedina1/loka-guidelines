import { SectionHead } from "../common/SectionHead.jsx";
import { LogoLab } from "../logo/LogoLab.jsx";

// Foundations / Logo — the six files, and which one to reach for.
//
// First in the hub, matching the file: Figma's own page order puts ↪ Logo ahead of
// ↪ Colors, and it's the right order for a reader too. The logo is the one asset
// somebody arrives needing a copy of rather than an explanation of, so the section
// is built around getting it rather than around reading about it — one canvas and
// two knobs, the same shape as the Patterns lab, rather than a grid of six cards to
// scan. The variants aren't six items; they're two lockups and a colour.
//
// What it deliberately doesn't cover yet: clear space, minimum sizes, and misuse.
// Those are the other half of a logo page and none of them can be written from the
// files alone — they're rules somebody has to decide, not measurements to lift.
export function LogoSection({ registerRef, copied, onCopy, selectedLogo, setSelectedLogo }) {
  return (
    <section id="logo" className="section" ref={(el) => registerRef("logo", el)}>
      <SectionHead title="Logo">
        Two lockups in three colours, each on the surfaces it's documented against. Copy the SVG
        straight into Figma, or download the file.
      </SectionHead>
      <LogoLab
        copied={copied}
        onCopy={onCopy}
        selected={selectedLogo}
        setSelected={setSelectedLogo}
      />
    </section>
  );
}
