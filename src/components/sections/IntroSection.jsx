import { CheckIcon, CopyIcon } from "../common/Icon.jsx";
import { HUBS } from "../../data/navigation.js";
import { patternStyle } from "../../utils/patternStyles.js";

const SKILL_COMMAND = "npx skills add loka/design-skills";

// The dot field over the Brand half. It's the published Dot Grid pattern rather
// than a second implementation of one: the Figma frame draws it as a literal
// grid of 4.11x3.93px rounded rects on a 45.25px pitch, which is this pattern at
// size 4 / gap 41. Gray-10 is the pattern's own light colour and one of the
// variables the frame binds. The alpha is the one value here that isn't measured:
// the export comes back at 0.53 scale, so a 4px dot lands on ~2px and its centre
// is already blended with the ground — sampling it reads low, and matching that
// reading renders heavier than the reference at 1:1. 0.3 matches the reference's
// weight by eye; it's the first number to confirm against the frame directly.
//
// Passed as `transparent` background because the dots ride over the panel's
// gradient as their own layer — the pattern builder would otherwise paint a
// ground and bury it.
const DOT_FIELD = patternStyle("dot-grid", {
  size: 4,
  gap: 41,
  color: "rgba(231, 236, 242, 0.3)", // gray-10
  background: "transparent",
});

// The line-and-diamonds motif on the Product half — Figma "Frame 2121455582",
// exported by the Dev Mode server as one SVG and transcribed here rather than
// linked, so the page carries no dependency on an asset host. Every number and
// colour below is the export's own.
//
// Three things this got wrong when it was traced by eye from the frame render:
// the arc rises from the lower corners to meet the line at the centre (it isn't
// a dip), it's Gaussian-blurred, which is what makes it read as a glow rather
// than a stroke, and none of it is white — the hairline and diamonds are
// #AABCDF fading to blue-10 #D8E2F6 at the midpoint, and the arc is #5387D7
// through the same blue-10.
//
// The blur is clipped to the SVG's own box, as Figma clips it. Figma's
// feFlood/feBlend scaffolding around the blur is dropped: blending SourceGraphic
// normally over a transparent flood is a no-op.
function HubVector() {
  return (
    <svg
      className="hub-vector"
      viewBox="0 0 656.605 138.119"
      fill="none"
      aria-hidden
      focusable="false"
    >
      <defs>
        <filter
          id="hub-arc-blur"
          x="0"
          y="0"
          width="656.605"
          height="138.119"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur stdDeviation="11.986" />
        </filter>
        <linearGradient
          id="hub-line-grad"
          x1="30.7583"
          y1="25.6756"
          x2="620.228"
          y2="25.6756"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#AABCDF" />
          <stop offset="0.5" stopColor="#D8E2F6" />
          <stop offset="1" stopColor="#AABCDF" />
        </linearGradient>
        <linearGradient
          id="hub-arc-grad"
          x1="24.6716"
          y1="69.1538"
          x2="631.933"
          y2="69.1538"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#5387D7" stopOpacity="0.8" />
          <stop offset="0.5" stopColor="#D8E2F6" />
          <stop offset="1" stopColor="#5387D7" stopOpacity="0.8" />
        </linearGradient>
      </defs>
      {/* the blurred arc sits under the hairline it meets */}
      <g filter="url(#hub-arc-blur)">
        <path
          d="M24.6716 112.931C24.6716 112.931 176.487 25.3807 328.302 25.3767C480.118 25.3726 631.933 112.931 631.933 112.931"
          stroke="url(#hub-arc-grad)"
          strokeWidth="2.80923"
        />
      </g>
      <path d="M30.7583 25.1756L620.228 25.1756" stroke="url(#hub-line-grad)" strokeWidth="2.80923" />
      <rect
        x="18.7182"
        y="14.2539"
        width="15.919"
        height="15.919"
        transform="rotate(45 18.7182 14.2539)"
        stroke="#AABCDF"
        strokeWidth="2.80923"
      />
      <rect
        x="632.187"
        y="14.1093"
        width="15.919"
        height="15.919"
        transform="rotate(45 632.187 14.1093)"
        stroke="#AABCDF"
        strokeWidth="2.80923"
      />
      <circle cx="328.068" cy="25.377" r="10.3005" stroke="#D8E2F6" strokeWidth="2.80923" />
    </svg>
  );
}

// The stream motif on the AI half. Not traced from a frame — there isn't one
// yet — so it's built from the hub's own subject matter rather than decorated:
// five hairlines of unequal length, the last one short and closed by a solid
// caret. That reads as text still being written, which is the one thing every
// pattern on the shelf has in common.
//
// The lines fade left to right off blue-20 so the motif sits under the pill
// without competing with it; the caret is the only saturated mark (blue-80),
// because the caret is the part that means something.
function AiStream() {
  return (
    <svg
      className="hub-stream"
      viewBox="0 0 400 164"
      fill="none"
      aria-hidden
      focusable="false"
    >
      <defs>
        <linearGradient id="hub-stream-grad" x1="0" y1="0" x2="400" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#AABCDF" stopOpacity="0.25" />
          <stop offset="0.35" stopColor="#8FA8D4" stopOpacity="0.9" />
          <stop offset="1" stopColor="#5387D7" stopOpacity="0.55" />
        </linearGradient>
      </defs>
      {/* Unequal lengths on purpose: five equal bars read as a table, and a
          table is the one output shape this pattern tells you not to stream. */}
      {[
        { y: 6, w: 356 },
        { y: 42, w: 392 },
        { y: 78, w: 318 },
        { y: 114, w: 372 },
        { y: 150, w: 196 },
      ].map((l) => (
        <rect key={l.y} x="0" y={l.y} width={l.w} height="5" rx="2.5" fill="url(#hub-stream-grad)" />
      ))}
      <rect x="206" y="146" width="13" height="13" rx="2" fill="#1877F2" />
    </svg>
  );
}

// The landing — Figma "start" (node 168:8). The viewport split one panel per
// hub, each carrying a single pill and nothing else. The panels are deliberately
// unalike, so each is telling you what's inside before you read its label:
// Brand is the near-black ground the brand material sits on, Product the lit
// blue surface the components sit on, and AI the pale surface a response is
// still being written onto.
//
// Three panels needed a third ground that reads apart from both at a glance, and
// dark → mid → light is the widest separation available without leaving the
// blue family. The cost is that AI's pill inverts — a white pill disappears on a
// pale ground — which is the minimum change needed to keep the label legible
// rather than a second style for its own sake.
export function IntroSection({ registerRef, copied, onCopy, onEnterHub }) {
  return (
    <section id="introduction" className="section intro" ref={(el) => registerRef("introduction", el)}>
      <div className="brand-hero">
        <div className="hub-split">
          {HUBS.map((h) => (
            <button key={h.id} className="hubcard" data-hub={h.id} onClick={() => onEnterHub(h.id)}>
              {h.id === "brand" && <span className="hub-dots" style={DOT_FIELD} aria-hidden />}
              {h.id === "product" && <HubVector />}
              {h.id === "ai" && <AiStream />}
              <span className="hubcard-pill">{h.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="intro-block">
        <h2 className="intro-heading">Skills</h2>
        <div className="intro-col">
          <p className="intro-body">
            Get the Loka brand rules and assets with our official Agent Skill. Install them with a single
            command to enhance your workflow.
          </p>
          <button
            className="skill-cmd"
            onClick={() => onCopy(SKILL_COMMAND, "skill-cmd")}
            title="Copy command"
          >
            <span className="skill-cmd-text">{SKILL_COMMAND}</span>
            <span className="skill-cmd-icon">{copied === "skill-cmd" ? <CheckIcon size={15} /> : <CopyIcon size={15} />}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
