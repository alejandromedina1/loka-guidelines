import { Swatch } from "./Swatch.jsx";

// A grid of swatches for one palette group (e.g. Neutral or Blue).
export function ColorGroup({ group, data, copied, onCopy }) {
  return (
    <div className="swatch-grid">
      {data.tokens.map((t) => (
        <Swatch key={t.name} group={group} token={t} copied={copied} onCopy={onCopy} />
      ))}
    </div>
  );
}
