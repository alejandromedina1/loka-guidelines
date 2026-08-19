import { useCallback, useEffect, useRef, useState } from "react";
import { SPY_IDS } from "../data/navigation.js";

// Distance from the top of the viewport at which a section is considered
// "current" — the standard scroll-spy heuristic.
const ACTIVE_LINE = 120;

// Tracks which documented section is currently in view and exposes helpers to
// register section elements and smooth-scroll to them.
//
// `topId` is what's current when the page is scrolled to the very top, which
// differs per hub: the landing opens on the introduction, the Brand Hub on
// Color, the Product Hub on its single Components section. Passing it in is
// what keeps the sidebar from highlighting nothing at the top of a hub.
export function useScrollSpy(topId = "introduction") {
  const [active, setActive] = useState(topId);
  const refs = useRef({});

  // Switching hubs unmounts a whole run of sections and mounts another, so the
  // registry has to shrink as well as grow: a detached element still answers
  // getBoundingClientRect (with zeroes), which reads as "just above the active
  // line" and would win the scan below over anything actually on screen.
  const registerRef = useCallback((id, el) => {
    if (el) refs.current[id] = el;
    else delete refs.current[id];
  }, []);

  const scrollTo = useCallback((id) => {
    refs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const scroller = document.scrollingElement || document.documentElement;
      // At the very top, always show whichever section opens this view.
      if (scroller.scrollTop < 40) {
        setActive(topId);
        return;
      }

      // Otherwise pick the section whose top has passed the active line and is
      // closest to it.
      let current = topId;
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
  }, [topId]);

  return { active, registerRef, scrollTo };
}
