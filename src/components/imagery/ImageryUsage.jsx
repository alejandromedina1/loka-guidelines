import { useState } from "react";
import { IMAGERY_PHOTOS, IMAGERY_USAGE } from "../../data/imagery.js";
import { usageCss, usageStyle } from "../../utils/imageryStyles.js";
import { CheckIcon, CopyIcon } from "../common/Icon.jsx";
import { PhotoSwitcher } from "./PhotoSwitcher.jsx";

// The three placements, one at a time, on the same playground frame as Styling —
// chips in the canvas foot to switch, Copy CSS beside them, the panel on the right
// following along. There are no knobs here (every value in a placement is fixed),
// so the panel carries the spec instead: the numbers are the thing worth reading
// off a placement, and this is where the eye already goes for them.
export function ImageryUsage({ copied, onCopy, selected, setSelected }) {
  const usage = IMAGERY_USAGE.find((u) => u.id === selected) || IMAGERY_USAGE[0];

  // Keyed by placement, so trying a photo on one and switching away doesn't discard
  // it — same as the Styling lab. A placement is a container, so it reads quite
  // differently over a busy photo than a calm one, which is worth being able to see.
  const [photos, setPhotos] = useState(() =>
    Object.fromEntries(IMAGERY_USAGE.map((u) => [u.id, u.photo])),
  );
  const photo = IMAGERY_PHOTOS.find((p) => p.id === photos[usage.id]) ?? IMAGERY_PHOTOS[0];
  const copyId = `imguse-${usage.id}`;

  // The only thing here that can be wandered off is the photo, so that's all Reset
  // restores — but it still earns its place: the pairing each placement opens on is
  // the documented one.
  const dirty = photo.id !== usage.photo;

  return (
    <div className="pg img-lab">
      <div className="pg-stage">
        <div className="pg-canvas grey">
          <PhotoSwitcher
            current={photo.id}
            onPick={(id) => setPhotos((cur) => ({ ...cur, [usage.id]: id }))}
          />

          <div className="pg-canvas-center">
            <UsageFrame usage={usage} photo={photo} />
          </div>
          <div className="pg-canvas-foot">
            <div className="canvas-variants">
              {IMAGERY_USAGE.map((u) => (
                <button
                  key={u.id}
                  className="canvas-variant-btn"
                  data-active={u.id === usage.id}
                  onClick={() => setSelected(u.id)}
                >
                  {u.name}
                </button>
              ))}
            </div>
            <button className="pg-code-copy" onClick={() => onCopy(usageCss(usage), copyId)}>
              {copied === copyId ? (
                <>
                  <CheckIcon /> Copied
                </>
              ) : (
                <>
                  <CopyIcon /> Copy CSS
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="pg-controls">
        <div className="pg-ctrl-head">
          <div className="pg-ctrl-titlerow">
            <span className="pg-ctrl-title">{usage.name}</span>
            {dirty && (
              <button
                className="img-reset"
                onClick={() => setPhotos((cur) => ({ ...cur, [usage.id]: usage.photo }))}
              >
                Reset
              </button>
            )}
          </div>
          <p className="pg-ctrl-desc">{usage.lede}</p>
        </div>
        <dl className="imguse-specs">
          {usage.specs.map(([label, value]) => (
            <div key={label} className="imguse-spec">
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

// One container with a photo in it. `.imagery-frame` is the class the copied CSS
// declares, so what's on screen is the rule set being handed over; `.img-demo` is
// the shared demo frame, the same 3:2 at 560px the Styling lab uses — the three
// placements read as one comparison on identical geometry, and against Styling too. Lines + dots additionally borrows
// `.frame-markers` from the Corner Markers pattern — the squares are real nodes
// straddling the edge, so they can't be a background.
function UsageFrame({ usage, photo }) {
  const marked = usage.id === "lines-dots";
  const frame = (
    <div
      className={`imagery-frame${usage.frameCols ? "" : " img-demo"}${marked ? " frame-markers" : ""}`}
      style={usageStyle(usage)}
    >
      {/* Before the image, so :nth-child(1..4) still selects the four squares. */}
      {marked && (
        <>
          <i />
          <i />
          <i />
          <i />
        </>
      )}
      <img src={photo.src} alt={photo.alt} />
    </div>
  );

  // On-grid is the one placement whose own box is part of the rule, so it gets the
  // wrapper the cell is measured against instead of .img-demo's sizing. 15 x 10 is
  // the same 3:2 the others use — at its 540px cap the cell is exactly 36px.
  if (!usage.frameCols) return frame;
  return (
    <div
      className="imagery-grid"
      style={{
        maxWidth: `${usage.frameCols * usage.cell}px`,
        aspectRatio: `${usage.frameCols} / ${usage.frameRows}`,
      }}
    >
      {frame}
    </div>
  );
}
