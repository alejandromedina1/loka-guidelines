// The canvas kit — a bounded artboard with objects on it.
//
// The screen kit is document-shaped: a window bar over a column of rows,
// callouts and fields. A canvas is none of those. The thing being designed is
// an object somebody placed, and every pattern that changes on this surface
// changes for the same reason — the output is a thing in space rather than a
// paragraph in a flow, so scope is a selection, a diff is the object before and
// after, and an empty result is empty space rather than an empty list.
//
// Deliberately few parts. Two previews in, the risk is a second component
// library growing here; everything below is scaffolding for an illustration and
// nothing is a control the Product Hub already ships.
export function Board({ title, children }) {
  return (
    <div className="mk-frame cv-frame">
      <div className="mk-bar">
        <span className="mk-bar-dots" aria-hidden />
        <span className="mk-bar-title">{title}</span>
      </div>
      <div className="cv-board">{children}</div>
    </div>
  );
}

// A placed object. `tone` carries what it is rather than how it looks: `now` is
// what is there, `next` is what is proposed, `gone` is what it would replace.
export function Obj({ label, meta, tone, selected, wide, children }) {
  return (
    <div
      className="cv-obj"
      data-tone={tone}
      data-selected={selected ? "" : undefined}
      data-wide={wide ? "" : undefined}
    >
      {selected && <span className="cv-handles" aria-hidden />}
      {/* Name first. An object on a board is a thing before it is a value, and
          reading its contents before knowing which object they belong to is the
          same mistake as a table with its header at the bottom. */}
      {(label || meta) && (
        <span className="cv-obj-head">
          {label && <span className="cv-obj-label">{label}</span>}
          {meta && <span className="cv-obj-meta">{meta}</span>}
        </span>
      )}
      <span className="cv-obj-body">{children}</span>
    </div>
  );
}

// Objects side by side, which is how this surface compares two of anything.
export function Pair({ children }) {
  return <div className="cv-pair">{children}</div>;
}

// The controls that belong to a selection rather than to the page. On a canvas
// an action attaches to the thing it acts on — a footer bar would put "accept"
// the same distance from both changes, which is the one thing Change Review
// says not to do.
export function OnObject({ children }) {
  return <span className="cv-on-object">{children}</span>;
}

// Empty space that means something. A canvas has no empty list to leave blank,
// so a result with nothing in it has to say so where the object would have been.
export function Nothing({ children }) {
  return <div className="cv-nothing">{children}</div>;
}
