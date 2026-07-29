import { LokaLogo } from "../common/LokaLogo.jsx";
import { CheckIcon, CopyIcon } from "../common/Icon.jsx";
import { ICON_CATEGORIES } from "../../data/icons.js";
import { GRAPHICS } from "../../data/graphics.js";

const SKILL_COMMAND = "npx skills add loka/design-skills";

// The landing hero: an interactive ring of foundation "chips" around the Loka
// mark, plus the Agent-Skill install command.
export function IntroSection({ registerRef, copied, onCopy, onNavigate }) {
  const trackGlow = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <section id="introduction" className="section intro" ref={(el) => registerRef("introduction", el)}>
      <div className="brand-hero" onMouseMove={trackGlow}>
        <div className="hero-glow" aria-hidden />

        <div className="hero-ring">
          <button className="hchip" onClick={() => onNavigate("typography")} title="Typography">
            <span className="hchip-art hchip-aa">Aa</span>
          </button>
          <button className="hchip" onClick={() => onNavigate("color")} title="Color">
            <span className="hchip-art hchip-swatch" aria-hidden>
              <i style={{ background: "#1957F4" }} />
              <i style={{ background: "#5495F4" }} />
              <i style={{ background: "#BDCFF5" }} />
            </span>
          </button>
          <button className="hchip" onClick={() => onNavigate("components")} title="Buttons">
            <span className="hchip-art hchip-button" aria-hidden>
              Button
            </span>
          </button>

          <button className="hchip" onClick={() => onNavigate("spacing")} title="Spacing">
            <span className="hchip-art hchip-spacing" aria-hidden>
              <i />
              <i />
              <i />
            </span>
          </button>

          {/* center logo */}
          <div className="hero-logo-card">
            <LokaLogo height={60} color="#FFFFFF" />
          </div>

          <button className="hchip" onClick={() => onNavigate("icons")} title="Icons">
            <span
              className="hchip-art hchip-realicon"
              aria-hidden
              dangerouslySetInnerHTML={{ __html: ICON_CATEGORIES[1].icons[0].svg }}
            />
          </button>

          <button className="hchip" onClick={() => onNavigate("graphics")} title="Graphics">
            <span
              className="hchip-art hchip-realgfx"
              aria-hidden
              dangerouslySetInnerHTML={{ __html: GRAPHICS[0].svg }}
            />
          </button>
          <button className="hchip" onClick={() => onNavigate("graphics")} title="Imagery">
            <span className="hchip-art hchip-ph" aria-hidden>
              <svg viewBox="0 0 44 34" width="46" height="36">
                <rect x="1" y="1" width="42" height="32" fill="none" stroke="currentColor" strokeWidth="1.6" />
                <path d="M1 24l12-9 9 7 7-6 14 11" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                <circle cx="31" cy="10" r="3.5" fill="currentColor" />
              </svg>
            </span>
          </button>
          <button className="hchip" onClick={() => onNavigate("components")} title="Cards">
            <span className="hchip-art hchip-cards" aria-hidden>
              <i />
              <i />
            </span>
          </button>
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
