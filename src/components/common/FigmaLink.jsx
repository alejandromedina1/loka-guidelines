import { figmaUrl } from "../../data/figma.js";
import { ArrowUpRight } from "./Icon.jsx";

// "Open in Figma", pointed at one node.
//
// Renders nothing without a node, which is what lets the node map in
// data/figma.js be incomplete: a section whose Figma source hasn't been
// identified simply doesn't offer the link, rather than offering one that lands
// in the wrong place.
//
// `label` exists for the one case where "Open in Figma" isn't specific enough —
// the Project images lab, where the link resolves to a particular variant of a
// component set and saying which one is the whole point.
export function FigmaLink({ node, label = "Open in Figma" }) {
  const href = figmaUrl(node);
  if (!href) return null;
  return (
    <a className="fig-link" href={href} target="_blank" rel="noreferrer noopener">
      {label}
      <ArrowUpRight />
    </a>
  );
}
