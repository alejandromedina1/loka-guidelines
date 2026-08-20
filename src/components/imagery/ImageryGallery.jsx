import { useState } from "react";
import { IMAGERY_GROUPS, IMAGERY_STYLES, findPhoto } from "../../data/imagery.js";
import {
  BAND_TINT,
  bandLayers,
  bandPadding,
  dotOverlay,
  imageryCss,
  scrimOverlay,
} from "../../utils/imageryStyles.js";
import { PgRange } from "../playground/controls/PgRange.jsx";
import { PgSelect } from "../playground/controls/PgSelect.jsx";
import { PgText } from "../playground/controls/PgText.jsx";
import { PgToggle } from "../playground/controls/PgToggle.jsx";
import { FIGMA_NODES } from "../../data/figma.js";
import { FigmaLink } from "../common/FigmaLink.jsx";
import { PhotoSwitcher } from "./PhotoSwitcher.jsx";
import { CheckIcon, CopyIcon } from "../common/Icon.jsx";

// One playground for the four treatments, same shape as the Patterns lab: the
// chips in the canvas foot swap the style, the panel on the right follows, and
// the preview is the real thing — real photo, real backdrop filters — so a
// treatment can be tuned before its CSS is copied.
//
// Where it has to go further than the Patterns lab is that a pattern is right or
// wrong on its own and a photo treatment isn't: the mask that clears one subject
// sits on top of another. So the photo is a control too, and the mask's extent
// draws itself on the image while you're setting it — otherwise "Reach 15%" is a
// number with nothing to check it against.
export function ImageryGallery({ copied, onCopy, selected, setSelected, local, onPickLocal }) {
  const style = IMAGERY_STYLES.find((s) => s.id === selected) || IMAGERY_STYLES[0];

  // Both keyed by style id, so tuning one and switching away doesn't discard it.
  const [values, setValues] = useState(() =>
    Object.fromEntries(IMAGERY_STYLES.map((s) => [s.id, s.defaults])),
  );
  const [photos, setPhotos] = useState(() =>
    Object.fromEntries(IMAGERY_STYLES.map((s) => [s.id, s.photo])),
  );

  // Which control group the pointer or the keyboard focus is in. This drives the
  // guide on the preview: it appears while you're working on the mask and goes
  // again after, so the image is never left permanently marked up.
  const [activeGroup, setActiveGroup] = useState(null);

  const set = (key) => (v) =>
    setValues((cur) => ({ ...cur, [style.id]: { ...cur[style.id], [key]: v } }));

  // Defaults underneath, stored values on top. Normally a no-op — the state is
  // seeded from the same defaults — but a useState initialiser doesn't re-run on
  // hot reload, so adding a control while the dev server is up otherwise leaves
  // the new key `undefined` in the stored object. That used to reach the CSS as
  // `linear-gradient(to undefined, ...)`, which browsers drop whole, silently
  // taking the mask with it.
  const args = { ...style.defaults, ...values[style.id] };
  const photo = findPhoto(photos[style.id], local);
  const copyId = `img-${style.id}`;

  // Only a style that can turn its text off declares `hasText`; the rest always
  // show theirs. The scrim follows it rather than being its own layer, because
  // the scrim's only job is carrying that text — see utils/imageryStyles.js.
  const hasText = args.hasText ?? true;
  const layers = { ...style.layers, scrim: style.layers.scrim && hasText };

  // Every value here is a documented spec, so wandering off one has to be
  // undoable — otherwise the only way back is a page reload, and someone reading
  // the numbers off a tuned panel reads the wrong ones. Shown only when there is
  // something to undo, so it's never an affordance that does nothing.
  const dirty =
    photo.id !== style.photo || style.controls.some((c) => args[c.key] !== style.defaults[c.key]);
  const reset = () => {
    setValues((cur) => ({ ...cur, [style.id]: style.defaults }));
    setPhotos((cur) => ({ ...cur, [style.id]: style.photo }));
  };

  return (
    <div className="pg img-lab">
      <div className="pg-stage">
        <div className="pg-canvas grey">
          <PhotoSwitcher
            current={photo.id}
            onPick={(id) => setPhotos((cur) => ({ ...cur, [style.id]: id }))}
            local={local}
            onPickLocal={onPickLocal}
          />

          <div className="pg-canvas-center">
            <ImageryPreview
              photo={photo}
              caption={style.caption}
              layers={layers}
              hasText={hasText}
              args={args}
              guide={activeGroup === "Dot field" && layers.dots}
            />
          </div>

          {/* Where the subject sits, in words, under the image it describes. This
              is what the mask has to work around, and it's the reason the same
              settings don't carry from one photo to the next. */}
          {photo.subject && (
            <p className="img-subject">
              {photo.subject} — {photo.maskHint}
            </p>
          )}


          <div className="pg-canvas-foot">
            <div className="canvas-variants">
              {IMAGERY_STYLES.map((s) => (
                <button
                  key={s.id}
                  className="canvas-variant-btn"
                  data-active={s.id === style.id}
                  onClick={() => setSelected(s.id)}
                >
                  {s.name}
                </button>
              ))}
            </div>
            <div className="pg-foot-actions">
              <FigmaLink node={FIGMA_NODES["imagery-styling"]} />
              <button
                className="pg-code-copy"
                onClick={() => onCopy(imageryCss(layers, args), copyId)}
              >
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
      </div>

      <div className="pg-controls">
        <div className="pg-ctrl-head">
          <div className="pg-ctrl-titlerow">
            <span className="pg-ctrl-title">{style.name}</span>
            {dirty && (
              <button className="img-reset" onClick={reset}>
                Reset
              </button>
            )}
          </div>
          <p className="pg-ctrl-desc">{style.description}</p>
        </div>

        {/* Grouped rather than one flat run: six rows spanning three subsystems
            read as six unrelated knobs, and the mask's two in particular only
            mean anything as a pair. */}
        {IMAGERY_GROUPS.map((group) => {
          const rows = style.controls.filter((c) => c.group === group);
          if (!rows.length) return null;
          return (
            <div
              key={group}
              className="img-ctrl-group"
              onMouseEnter={() => setActiveGroup(group)}
              onMouseLeave={() => setActiveGroup(null)}
              onFocus={() => setActiveGroup(group)}
              onBlur={() => setActiveGroup(null)}
            >
              <span className="img-ctrl-group-label">{group}</span>
              {rows.map((c) => (
                <Control key={c.key} control={c} args={args} onChange={set(c.key)} />
              ))}
            </div>
          );
        })}

        {/* Simple has nothing to set, and a panel that just stops reads as broken.
            Say so, and point at the one thing still worth doing. */}
        {!style.controls.length && (
          <p className="img-ctrl-empty">
            Nothing to adjust — an untreated image is the whole style. Switch the photo above to
            see it on another subject.
          </p>
        )}
      </div>
    </div>
  );
}

// `toggle`, `text` and `options` discriminate the control: a switch, a field, a
// pick from a list, or a range. Cheaper than tagging every entry with a kind.
function Control({ control: c, args, onChange }) {
  if (c.toggle) return <PgToggle label={c.label} value={args[c.key]} onChange={onChange} />;

  if (c.text) {
    return (
      <PgText
        label={c.label}
        value={args[c.key]}
        rows={c.rows}
        disabled={c.needs ? !args[c.needs] : undefined}
        onChange={onChange}
      />
    );
  }

  if (c.options) {
    return (
      <PgSelect
        label={c.label}
        // A <select>'s value has to match one of its option strings, and it hands
        // a string back. So a numeric option set — marked by carrying a `unit` —
        // is formatted on the way in and parsed on the way out, keeping what's
        // stored a number. Left as a string, `2 + gap` concatenates instead of
        // adding and the tile comes out at 220px.
        value={c.unit ? `${args[c.key]}${c.unit}` : args[c.key]}
        options={c.unit ? c.options.map((o) => `${o}${c.unit}`) : c.options}
        onChange={(v) => onChange(c.unit ? parseFloat(v) : v)}
      />
    );
  }

  return (
    <PgRange
      label={c.label}
      value={args[c.key]}
      min={c.min}
      max={c.max}
      step={c.step}
      unit={c.unit}
      onChange={onChange}
    />
  );
}

// The layer stack, in paint order: photo, scrim, dots, band, caption. Each overlay
// is only in the tree when its style turns it on, and the class names are the ones
// imageryCss declares, so the preview is literally the rule set the Copy CSS
// button hands over — .img-frame and the caption's type are the demo's own.
//
// The two placements are the whole difference between the caption kinds: a "band"
// caption goes *inside* the band, in flow, so the band's height is the text plus
// its padding; a "headline" has no band to sit in and is centred on the frame
// instead. Either way it's the figure's one <figcaption>.
function ImageryPreview({ photo, caption, layers, hasText, args, guide }) {
  // An emptied text field means no caption at all, so the band collapses to its
  // padding rather than holding a gap where the type used to be.
  const banded = caption === "band";
  const showCaption = caption && hasText && args.text?.trim();

  return (
    <figure className="imagery img-demo img-frame">
      <img src={photo.src} alt={photo.alt} />

      {layers.scrim && <span className="imagery-scrim" style={scrimOverlay} />}
      {layers.dots && <span className="imagery-dots" style={dotOverlay(args)} />}

      {layers.blur && (
        <span className="imagery-band" style={bandPadding}>
          {bandLayers(args.blur).map(({ radius, mask }, i) => (
            <i
              key={i}
              style={{
                WebkitBackdropFilter: `blur(${radius}px)`,
                backdropFilter: `blur(${radius}px)`,
                WebkitMaskImage: mask,
                maskImage: mask,
              }}
            />
          ))}
          <b style={{ background: BAND_TINT }} />
          {showCaption && banded && (
            <figcaption className="imagery-caption">{args.text}</figcaption>
          )}
        </span>
      )}

      {showCaption && !banded && <figcaption className="img-headline">{args.text}</figcaption>}

      {/* Where the field runs out, drawn on the photo it has to clear. Scaffolding
          rather than part of the treatment, so it's never in the copied CSS and
          it's gone the moment you stop adjusting the mask. A line for the Y-axis
          fades, a circle for the radial one — the guide has to be the shape of the
          thing it's describing, or it teaches the wrong mental model. */}
      {guide && <MaskGuide anchor={args.dotAnchor} reach={args.dotReach} />}
    </figure>
  );
}

// The mask's boundary, in the mask's own shape. For "Edges" the clear circle is
// sized off the frame's height, because that's what `closest-side` measures the
// radial gradient against — so the ring the guide draws is the ring in the CSS,
// not an approximation of it.
function MaskGuide({ anchor, reach }) {
  if (anchor === "Edges") {
    return (
      <span className="img-guide-radial" style={{ height: `${100 - reach}%` }} aria-hidden>
        <span>Fade reaches {reach}% in</span>
      </span>
    );
  }
  return (
    <span
      className="img-guide"
      data-anchor={anchor}
      style={anchor === "Top" ? { top: `${reach}%` } : { bottom: `${reach}%` }}
      aria-hidden
    >
      <span>Fade ends at {reach}%</span>
    </span>
  );
}
