import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { DEMOS } from "./demos.js";

// One capability demo on its stage — the source's mountDemo / startDemo, as a
// component.
//
// React owns the stage and the Replay button; it does NOT own the demo. The
// demos rewrite their own DOM as they play (a caret removed, a row of buttons
// swapped for a "Sent" line, tags deleted), and a tree React thought it owned
// would be reconciled back over those edits on the next render. So the effect
// builds the demo's root by hand, exactly as mountDemo did, and the cleanup
// removes it.
//
// Removing it is also the cancellation. Every running demo checks
// `root.isConnected` after each wait (runtime.js), so a detached root stops at
// its next step with nothing to clear. That is what makes the three ways a root
// goes away all safe: Replay (a new `mount`), the card leaving the grid, and
// StrictMode's dev-only double mount, which would otherwise type every demo
// twice into one bubble.
//
// `start`:
//   "scroll" — the shelf. The demo plays once half the stage is on screen and
//              not before, so a demo below the fold hasn't finished before
//              anybody can see it. The source's one shared observer, per stage.
//   "now"    — the pattern page, which opens on the demo. The source started its
//              sheet's demo straight away for the same reason.
//
// One change from the source, on purpose: Replay plays. The source's Replay
// remounted the markup but left the stage's `_started` flag set, so the second
// start was skipped and Replay reset a demo to its first frame and stopped
// there — the caret blinking in an empty bubble. A fresh mount that then runs
// is what the button is called.

// A layout effect has nothing to do on the server, and React says so on every
// render — which is every card in every render check. The stage's server render
// is the empty stage either way.
const useMountEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export function DemoStage({ id, start = "scroll", size = "card" }) {
  const demo = DEMOS[id];
  const stageRef = useRef(null);
  const started = useRef(start === "now");
  const [mount, setMount] = useState(0);

  // Layout, not passive: the root is built before the browser paints, so the
  // stage never shows a frame of nothing on its way in.
  useMountEffect(() => {
    const stage = stageRef.current;
    const box = document.createElement("div");
    box.style.cssText = "width:100%;display:flex;justify-content:center";
    box.innerHTML = demo.html;
    stage.prepend(box);
    demo.init?.(box);

    let io = null;
    if (demo.run) {
      if (started.current) demo.run(box);
      else {
        io = new IntersectionObserver(
          (entries) =>
            entries.forEach((e) => {
              if (!e.isIntersecting || started.current) return;
              started.current = true;
              io.disconnect();
              demo.run(box);
            }),
          { threshold: 0.5 },
        );
        io.observe(stage);
      }
    }
    return () => {
      io?.disconnect();
      box.remove();
    };
  }, [demo, mount]);

  return (
    <div ref={stageRef} className="ai-demo dm-stage" data-size={size}>
      {demo.run ? (
        <button
          type="button"
          className="dm-replay"
          aria-label="Replay demo"
          onClick={(e) => {
            e.stopPropagation();
            started.current = true;
            setMount((m) => m + 1);
          }}
        >
          Replay
        </button>
      ) : demo.try ? (
        <span className="dm-try">Try it</span>
      ) : null}
    </div>
  );
}
