import { useCallback, useEffect, useRef, useState } from "react";
import { LOCAL_PHOTO_ID } from "../../data/imagery.js";
import { SectionHead } from "../common/SectionHead.jsx";
import { ImageryGallery } from "../imagery/ImageryGallery.jsx";
import { ImageryProject } from "../imagery/ImageryProject.jsx";
import { ImageryUsage } from "../imagery/ImageryUsage.jsx";

// Foundations / Imagery — how photography is treated, where it sits, and the one
// place it carries a client's mark.
//
// Three sub-sections under one nav item, the same shape Color uses for its ramps.
//
// Figma's Imagery page has two sections, not three — Styling and Usage — and the
// Image component the third documents sits inside Styling. Splitting it out is a
// decision this hub makes, not one it inherits: see below for why. Which is also
// why Styling and Usage link to their Figma sections and Project images links to
// a component variant — those are the nodes that actually exist.
//
// They're one foundation because
// placing a photo needs all three answers at once, but they're presented
// differently on purpose, because each asks a different kind of question: Styling
// is a parameter space, so it gets a playground; Usage is a choice between three
// fixed compositions, so it gets a comparison; and Project images is a single
// construction you rebuild for a client, so it gets a dimensioned drawing.
//
// Project images is last because it consumes the other two rather than competing
// with them — and it's its own sub-section rather than a fourth Usage placement
// because it's the only imagery format whose content is a client's, which is a
// different job from choosing how a photo of ours sits on a page.
export function ImagerySection({
  registerRef,
  copied,
  onCopy,
  selectedImagery,
  setSelectedImagery,
  selectedUsage,
  setSelectedUsage,
  selectedProject,
  setSelectedProject,
}) {
  // The reader's own photo, held at the level all three labs share so one dropped
  // into Project images is still there in Styling. Not lifted to App: nothing
  // outside Imagery has any use for it.
  const [localPhoto, setLocalPhoto] = useState(null);

  // Object URLs are held by the document until revoked, so replacing one has to
  // release the last.
  //
  // Mirrored into a ref so the unmount cleanup can read the current photo without
  // a state setter it only calls for the side effect — and without listing
  // localPhoto as a dependency, which would revoke the URL on every replacement
  // as the effect tore itself down.
  const live = useRef(null);
  const release = () => {
    if (live.current) {
      URL.revokeObjectURL(live.current.src);
      live.current = null;
    }
  };

  const pickLocalPhoto = useCallback((file) => {
    release();
    const photo = {
      id: LOCAL_PHOTO_ID,
      label: file.name || "Your photo",
      src: URL.createObjectURL(file),
      alt: "A photo you supplied",
    };
    live.current = photo;
    setLocalPhoto(photo);
  }, []);

  // Same release on the way out, for a reader who leaves with one loaded.
  useEffect(() => release, []);

  const photoProps = { local: localPhoto, onPickLocal: pickLocalPhoto };

  return (
    <section id="imagery" className="section" ref={(el) => registerRef("imagery", el)}>
      <SectionHead title="Imagery">
        How photography is treated before it goes on a page, and how it sits once it's there.
      </SectionHead>

      <div id="imagery-styling" className="sub-anchor" ref={(el) => registerRef("imagery-styling", el)}>
        <div className="sub-head">
          <h3 className="sub-title">Styling</h3>
          <p className="section-desc">
            Four treatments, from the bare image to a dot field and a blurred caption band. Pick a
            style, adjust it live, then copy its CSS.
          </p>
        </div>
        <ImageryGallery
          {...photoProps}
          copied={copied}
          onCopy={onCopy}
          selected={selectedImagery}
          setSelected={setSelectedImagery}
        />
      </div>

      <div id="imagery-usage" className="sub-anchor" ref={(el) => registerRef("imagery-usage", el)}>
        <div className="sub-head">
          <h3 className="sub-title">Usage</h3>
          <p className="section-desc">
            Three ways to place an image. Two of them are patterns the system already has — the
            Line Grid and the Corner Markers — wrapped around a photo rather than a section.
          </p>
        </div>
        <ImageryUsage
          {...photoProps}
          copied={copied}
          onCopy={onCopy}
          selected={selectedUsage}
          setSelected={setSelectedUsage}
        />
      </div>

      <div id="imagery-project" className="sub-anchor" ref={(el) => registerRef("imagery-project", el)}>
        <div className="sub-head">
          <h3 className="sub-title">Project images</h3>
          <p className="section-desc">
            The client-work frame: a project photo, the client's lockup in white, and a ruled box
            with markers on its corners. One construction, three layouts — and which layout you
            want follows from what the project shipped rather than from how it looks.
          </p>
        </div>
        <ImageryProject
          {...photoProps}
          copied={copied}
          onCopy={onCopy}
          selected={selectedProject}
          setSelected={setSelectedProject}
        />
      </div>
    </section>
  );
}
