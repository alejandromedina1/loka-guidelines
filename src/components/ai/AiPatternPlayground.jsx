import { DemoStage } from "./demos/DemoStage.jsx";
import { AI_UI_GUIDES } from "../../data/aiUiPatternGuides.js";
import { DEMOS } from "./demos/demos.js";

// One AI pattern in the Product Hub's playground frame: the live demo on the
// canvas, and beside it the one question somebody has while watching it —
// should I use this?
//
// The panel used to open on the pattern's name and surface, which the section
// head directly above had just said, and the canvas carried prev/next arrows
// that did what the pager at the foot of the page does. Both are gone: the
// head names the pattern, the pager moves between them, and the panel holds
// only the fit — when to use it, when not, and who already ships it. What it
// pairs with is drawn live at the foot of the page, so it isn't listed here too.
//
// Nothing here configures the demo. A demo is a behaviour over time, so the
// canvas's control is Replay (on the stage itself) and the demo's own buttons.
export function AiPatternPlayground({ pattern }) {
  const seenIn = AI_UI_GUIDES[pattern.id]?.seenIn;
  const live = !!DEMOS[pattern.id]?.try;

  return (
    <div className="pg pg-nolist ai-pg">
      <div className="pg-stage">
        {/* A plain canvas, not the grey one: the demo brings its own grey stage,
            and grey on grey vanishes in the dark theme. */}
        <div className="pg-canvas">
          {/* Keyed so a new pattern is a fresh mount: the demo starts from its
              first frame and plays straight away. */}
          <div className="pg-canvas-center">
            <DemoStage key={pattern.id} id={pattern.id} start="now" size="page" />
          </div>

          <div className="pg-canvas-foot">
            {/* Says which kind of demo this is, because the stage looks the
                same either way: one you press, or one that plays for you. */}
            <span className="ai-pg-hint">{live ? "Live demo: press, type and pick inside it" : "Plays on open: use Replay to watch again"}</span>
            <span className="ai-legend">
              <i aria-hidden="true" />
              AI-produced content
            </span>
          </div>
        </div>
      </div>

      <div className="pg-controls">
        <span className="ai-pg-title">Is it the right fit?</span>
        <dl className="ai-props">
          <div className="ai-prop">
            <dt>Use it when</dt>
            <dd>{pattern.use}</dd>
          </div>
          <div className="ai-prop">
            <dt>Avoid it when</dt>
            <dd>{pattern.avoid}</dd>
          </div>
          {seenIn && (
            <div className="ai-prop">
              <dt>Seen in</dt>
              <dd>{seenIn.join(", ")}</dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
