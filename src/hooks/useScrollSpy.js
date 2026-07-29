import { useCallback, useEffect, useRef, useState } from "react";
import { SPY_IDS } from "../data/navigation.js";

// Distance from the top of the viewport at which a section is considered
// "current" — the standard scroll-spy heuristic.
const ACTIVE_LINE = 120;

// Tracks which documented section is currently in view and exposes helpers to
// register section elements and smooth-scroll to them.
export function useScrollSpy() {
  const [active, setActive] = useState("introduction");
  const refs = useRef({});

  const registerRef = useCallback((id, el) => {
    if (el) refs.current[id] = el;
  }, []);

  const scrollTo = useCallback((id) => {
    refs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const scroller = document.scrollingElement || document.documentElement;
      // At the very top, always show Introduction.
      if (scroller.scrollTop < 40) {
        setActive("introduction");
        return;
      }

      // Otherwise pick the section whose top has passed the active line and is
      // closest to it.
      let current = "introduction";
      let bestDelta = -Infinity;
      for (const id of SPY_IDS) {
        const el = refs.current[id];
        if (!el) continue;
        const delta = el.getBoundingClientRect().top - ACTIVE_LINE;
        if (delta <= 0 && delta > bestDelta) {
          bestDelta = delta;
          current = id;
        }
      }
      setActive(current);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return { active, registerRef, scrollTo };
}
