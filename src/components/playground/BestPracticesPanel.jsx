// The specs sheet for whatever is on the canvas: the rules that govern the
// component, then the values the redlines can't draw.
//
// It used to float over the canvas with drag, resize and fold, and it opened
// with 16 to 21 rows. Three or four of those restated the width, height and
// padding the redlines were already drawing a few pixels away, one ("Font ·
// Alliance No.2") was the same in every component, and one or two named the
// variant or state the canvas pills were already showing lit. The exhaustive
// list is the code panel's job now — its AI prompt carries every value with a
// token name and a custom property attached.
//
// So this holds what only it can say. Colour is most of it: the one part of a
// spec that's invisible in a redline and different for every variant. The rules
// go above the values, because they're the reason to open the panel — they used
// to be one paragraph pushed below the table.
//
// Cut to that, it fits the properties column it was always styled to look like
// a sibling of, which is what retires the drag, the resize and the fold: all
// three were machinery for a panel too big to place.
export function BestPracticesPanel({ rules = [], rows = [] }) {
  if (!rules.length && !rows.length) return null;

  return (
    <div className="bp-panel">
      <span className="bp-panel-badge">Best practices</span>

      {rules.length > 0 && (
        <ul className="bp-rules">
          {rules.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
      )}

      {rows.length > 0 && (
        <dl className="bp-specs">
          {rows.map(([key, value]) => (
            <div className="bp-spec-row" key={key}>
              <dt>{key}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
