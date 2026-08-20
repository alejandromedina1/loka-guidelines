import { useState } from "react";
import cortado from "../../assets/logos/cortado.svg";
import { IMAGERY_PROJECT, PROJECT_NOTE, findPhoto } from "../../data/imagery.js";
import { PROJECT_BOX, projectLogoStyle, projectSafeStyle } from "../../utils/imageryStyles.js";
import { FigmaLink } from "../common/FigmaLink.jsx";
import { CodePanel, CodeToggle } from "../playground/CodePanel.jsx";
import { PgToggle } from "../playground/controls/PgToggle.jsx";
import { PhotoSwitcher } from "./PhotoSwitcher.jsx";
import { projectSnippets } from "./projectSnippets.js";

// Project images — the third Imagery lab, on the same .pg frame as the other two
// so the section reads as one thing, but answering a different question from
// either.
//
// Styling is a parameter space, so it gets knobs. Usage is a choice between three
// fixed placements, so it gets a comparison. This is neither: the layout follows
// from what the project delivered, so there's nothing to choose and nothing to
// tune — you arrive knowing which of the three you need. What's actually hard is
// rebuilding the frame for a client whose logo isn't in the Figma file, and that's
// what the lab is for. Hence Measurements, which turns the preview into a
// dimensioned drawing — the inset, the box, the lockup's own box.
//
// Which layout you want is still a condition rather than a preference, but every
// lede opens with that condition, so it doesn't need a line of its own above the
// layout's name.
//
// The panel deliberately holds less than Usage's does. The code drawer states the
// whole construction, so a spec list here would only restate it — and four of the
// seven values are the same in all three layouts, which makes them noise repeated
// three times rather than a spec. What's left is the three that actually differ,
// which is the same as saying: what changes when you switch layout.
//
// The Cortado lockup is the documented example and the only logo here. Swapping in
// a second would mean inventing a client, and the frame is what's being documented
// anyway — what varies is which photo it has to hold, which the switcher covers.
export function ImageryProject({ copied, onCopy, selected, setSelected, local, onPickLocal }) {
  const layout = IMAGERY_PROJECT.find((l) => l.id === selected) || IMAGERY_PROJECT[0];

  // Keyed by layout, like both sibling labs: trying a photo on Mobile and going
  // back to Desktop shouldn't discard it.
  const [photos, setPhotos] = useState(() =>
    Object.fromEntries(IMAGERY_PROJECT.map((l) => [l.id, l.photo])),
  );

  // One flag for all three, not one per layout. It's a way of looking at the
  // frame rather than a property of a layout, and the whole reason to turn it on
  // is to compare the three constructions — which switching layouts shouldn't
  // interrupt. Off by default: the format is a finished image first.
  const [measured, setMeasured] = useState(false);

  // Stays open across a layout switch, so the three constructions can be read
  // against each other rather than re-opened one at a time.
  const [showCode, setShowCode] = useState(false);

  const photo = findPhoto(photos[layout.id], local);

  // Only the photo can be wandered off, so it's all Reset restores — and the
  // pairing each layout opens on is the documented one, so it's worth a way back.
  const dirty = photo.id !== layout.photo;

  return (
    <div className="pg img-lab">
      <div className="pg-stage">
        <div className="pg-canvas grey">
          <PhotoSwitcher
            current={photo.id}
            onPick={(id) => setPhotos((cur) => ({ ...cur, [layout.id]: id }))}
            local={local}
            onPickLocal={onPickLocal}
          />

          <div className="pg-canvas-center">
            <ProjectFrame layout={layout} photo={photo} measured={measured} />
          </div>

          <div className="pg-canvas-foot">
            <div className="canvas-variants">
              {IMAGERY_PROJECT.map((l) => (
                <button
                  key={l.id}
                  className="canvas-variant-btn"
                  data-active={l.id === layout.id}
                  onClick={() => setSelected(l.id)}
                >
                  {l.name}
                </button>
              ))}
            </div>
            {/* Figma first. The Brand Hub's readers are mostly designers, and for
                this format in particular the output is an image file, not markup
                — the code is for the one consumer who renders project cards from
                a CMS. Ordered the same way in all three Imagery labs, rather
                than emphasised here and not there: a per-section rule about
                which action matters more is the kind of inconsistency that
                makes a system feel arbitrary. */}
            <div className="pg-foot-actions">
              <FigmaLink node={layout.figmaNode} label={`${layout.name} in Figma`} />
              <CodeToggle open={showCode} onToggle={() => setShowCode((v) => !v)} />
            </div>
          </div>
        </div>

        {showCode && (
          <CodePanel
            snippets={projectSnippets(layout)}
            name={`project-image-${layout.id}`}
            copied={copied}
            onCopy={onCopy}
          />
        )}
      </div>

      <div className="pg-controls">
        <div className="pg-ctrl-head">
          <div className="pg-ctrl-titlerow">
            <span className="pg-ctrl-title">{layout.name}</span>
            {dirty && (
              <button
                className="img-reset"
                onClick={() => setPhotos((cur) => ({ ...cur, [layout.id]: layout.photo }))}
              >
                Reset
              </button>
            )}
          </div>
          <p className="pg-ctrl-desc">{layout.lede}</p>
        </div>
        {/* Above the spec list on purpose: it's the switch that puts these numbers
            on the image, so it reads as their heading rather than as an extra. */}
        <PgToggle label="Measurements" value={measured} onChange={setMeasured} />
        <dl className="imguse-specs">
          {layout.specs.map(([label, value]) => (
            <div key={label} className="imguse-spec">
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        <p className="imgproj-note">{PROJECT_NOTE}</p>
      </div>
    </div>
  );
}

// The frame itself. Everything invariant is in global.css and re-emitted by
// projectImageCss, so what arrives inline is only what the layout changes: the
// box's aspect and the lockup's width.
//
// `.img-demo` gives it the same width as the other two labs and `.imgproj-demo`
// overrides their 3:2 with Figma's own 532 x 370. The construction holds at either
// — that's the point of keeping the inset and the widths as proportions — but only
// at the reference ratio does Desktop's box come out inset 24px on all four sides
// rather than wider at the sides than at the top, and that even inset is most of
// what makes it read as a window.
function ProjectFrame({ layout, photo, measured }) {
  return (
    <div className="project-image img-demo imgproj-demo">
      <img src={photo.src} alt={photo.alt} />
      <span className="project-scrim" />

      <div className="project-safe frame-markers" style={projectSafeStyle(layout)}>
        {/* First, so .frame-markers' :nth-child(1..4) still selects the four
            squares — the runs below are `b` and selected by type. */}
        <i />
        <i />
        <i />
        <i />
        <b />
        <b />
        <b />
        <b />
        {layout.chrome === "dots" && (
          <div className="project-chrome">
            <span />
            <span />
            <span />
          </div>
        )}
        {layout.chrome === "notch" && <span className="project-notch" />}
      </div>

      <div className="project-logo" style={projectLogoStyle(layout)}>
        <img src={cortado} alt="Cortado" />
      </div>

      {measured && <ProjectMeasurements layout={layout} />}
    </div>
  );
}

// The dimensioned version. Three chips, all of them in dead space — two in the
// inset bands above and below the box, one under the lockup — so nothing the
// format is made of gets covered by a label describing it. Blue and dashed, the
// same language the Styling lab marks its dot mask in.
function ProjectMeasurements({ layout }) {
  const band = { height: PROJECT_BOX.top };
  return (
    <>
      <div className="imgproj-band" style={{ top: 0, ...band }}>
        <span className="imgproj-chip">{layout.measure.inset}</span>
      </div>
      <div className="imgproj-band" style={{ bottom: 0, ...band }}>
        <span className="imgproj-chip">{layout.measure.box}</span>
      </div>
      <div className="imgproj-logobox" style={projectLogoStyle(layout)}>
        <span className="imgproj-chip">{layout.measure.logo}</span>
      </div>
    </>
  );
}
