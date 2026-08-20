import { useState } from "react";
import {
  LOGO_COLORS,
  LOGO_LOCKUPS,
  LOGO_SURFACES,
  allowedSurfaces,
  defaultSurface,
  logoFilename,
  logoSvg,
} from "../../data/logo.js";
import { PgColorPicker } from "../playground/controls/PgColorPicker.jsx";
import { PgToggle } from "../playground/controls/PgToggle.jsx";
import { PgSelect } from "../playground/controls/PgSelect.jsx";
import { CheckIcon, CopyIcon, DownloadIcon } from "../common/Icon.jsx";

// The longest edge of an exported PNG. One figure rather than a scale multiplier,
// because the lockups have very different natural sizes — 4x would give a 3412px
// wordmark and a 1606px lettermark, which isn't the same promise. At 2000 the
// wordmark lands 2000x527 and the lettermark 2000x1993.
const PNG_LONG_EDGE = 2000;

// SVG suits Figma and a repo; neither suits Keynote or Slides. So the same string
// also goes out as a raster, drawn on a transparent canvas so the white lockup stays
// usable over whatever it's placed on.
async function downloadPng(svg, filename) {
  const img = new Image();
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = () => reject(new Error("Could not rasterise the lockup"));
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });

  // Both files carry width/height attributes, so naturalWidth is the file's own size
  // rather than 0 — which is what makes this ratio trustworthy.
  const ratio = img.naturalWidth / img.naturalHeight;
  const w = ratio >= 1 ? PNG_LONG_EDGE : Math.round(PNG_LONG_EDGE * ratio);
  const h = ratio >= 1 ? Math.round(PNG_LONG_EDGE / ratio) : PNG_LONG_EDGE;

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d").drawImage(img, 0, 0, w, h);

  const a = document.createElement("a");
  a.href = canvas.toDataURL("image/png");
  a.download = filename;
  a.click();
}

// One playground for the logo, the same shape as the Patterns lab: chips in the
// canvas foot swap the lockup, the panel on the right follows, and what's on the
// canvas is the file — the preview is the same string Copy and Download hand over,
// so there's no path by which they disagree.
//
// A grid of all six was the first version of this section and this is better for
// the reason the Patterns lab is: six cards is a catalogue you scan, and one canvas
// with two knobs is a thing you try. The variants aren't really six items — they're
// two lockups and a colour, and the controls say so where six cards didn't.
export function LogoLab({ copied, onCopy, selected, setSelected }) {
  const lockup = LOGO_LOCKUPS.find((l) => l.id === selected) || LOGO_LOCKUPS[0];

  // Keyed by lockup, like every other lab here: setting the Lettermark to white on
  // dark and switching to the Wordmark shouldn't throw that away.
  const [values, setValues] = useState(() =>
    Object.fromEntries(
      LOGO_LOCKUPS.map((l) => [
        l.id,
        { color: LOGO_COLORS[0].id, surface: defaultSurface(LOGO_COLORS[0]) },
      ]),
    ),
  );
  const set = (key) => (v) =>
    setValues((cur) => ({ ...cur, [lockup.id]: { ...cur[lockup.id], [key]: v } }));

  const args = values[lockup.id];
  const color = LOGO_COLORS.find((c) => c.id === args.color) ?? LOGO_COLORS[0];

  // Only the surfaces this colour clears the contrast floor against. Falling back
  // to the documented default rather than to LOGO_SURFACES[0] matters: the first
  // surface in the list is White, which is the one thing the white logo can't go on.
  const surfaces = allowedSurfaces(color);
  const surface =
    surfaces.find((s) => s.id === args.surface) ??
    surfaces.find((s) => s.id === defaultSurface(color)) ??
    surfaces[0];

  // Picking a colour moves the surface to the first one that colour is documented
  // on, which is what stops White vanishing into a light plate the moment it's
  // chosen. The surface stays free afterwards, so the pairing is a starting point
  // and not a rule the control enforces — White's other documented surface is the
  // brand blue, and getting to it is one more click rather than a different mode.
  const pickColor = (id) => {
    const next = LOGO_COLORS.find((c) => c.id === id);
    setValues((cur) => ({ ...cur, [lockup.id]: { color: id, surface: defaultSurface(next) } }));
  };

  // One flag across both lockups rather than one each: it's a way of looking at a
  // mark, and the reason to turn it on is usually to see how the two differ.
  const [clear, setClear] = useState(false);

  const svg = logoSvg(lockup, color);
  const filename = logoFilename(lockup, color);
  const copyId = `logo-${lockup.id}-${color.id}`;

  return (
    <div className="pg logo-lab">
      <div className="pg-stage">
        <div className="pg-canvas">
          <div className="pg-canvas-center">
            <div
              className="logo-plate"
              style={{ background: surface.value }}
              data-dark={surface.id === "dark" || surface.id === "blue"}
            >
              {/* The figure is the file's box. Clear space is drawn against the ink
                  inside it, which for the wordmark is not the same thing. */}
              <div
                className="logo-figure"
                style={{ height: `${lockup.height}px`, aspectRatio: lockup.ratio }}
              >
                <span
                  className="logo-art"
                  dangerouslySetInnerHTML={{ __html: svg }}
                  role="img"
                  aria-label={`Loka ${lockup.name.toLowerCase()}, ${color.name.toLowerCase()}`}
                />
                {clear && <ClearSpace lockup={lockup} />}
              </div>
            </div>
          </div>

          <div className="pg-canvas-foot">
            <div className="canvas-variants">
              {LOGO_LOCKUPS.map((l) => (
                <button
                  key={l.id}
                  className="canvas-variant-btn"
                  data-active={l.id === lockup.id}
                  onClick={() => setSelected(l.id)}
                >
                  {l.name}
                </button>
              ))}
            </div>

            {/* Both actions, neither primary: a designer wants Copy — Figma
                pastes SVG markup straight in — and a repo wants the file. The
                page has no way of knowing which one is reading. */}
            <div className="pg-foot-actions">
              <button className="pg-code-copy" onClick={() => onCopy(svg, copyId)}>
                {copied === copyId ? (
                  <>
                    <CheckIcon /> Copied
                  </>
                ) : (
                  <>
                    <CopyIcon /> Copy SVG
                  </>
                )}
              </button>
              {/* Both formats, grouped: they're one decision — which file do I want — and
                  Copy is a different kind of action, so the gap separates them rather than
                  listing all three flat.

                  Each carries the download glyph and not just its format. "SVG" on its own is
                  a noun and read as a label; the icon is what makes it an action, the same way
                  every other foot action in the hub pairs a verb with a mark. */}
              <span className="logo-downloads">
                <a
                  className="logo-download"
                  href={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`}
                  download={filename}
                  title={`Download ${filename}`}
                >
                  <DownloadIcon /> SVG
                </a>
                {/* A button, not an anchor: the raster doesn't exist until it's asked for, so
                    there's nothing to put in an href. */}
                <button
                  className="logo-download"
                  onClick={() => downloadPng(svg, logoFilename(lockup, color, "png"))}
                  title={`Download ${logoFilename(lockup, color, "png")} — ${PNG_LONG_EDGE}px on the longest edge, transparent background`}
                >
                  <DownloadIcon /> PNG
                </button>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="pg-controls">
        <div className="pg-ctrl-head">
          <span className="pg-ctrl-title">{lockup.name}</span>
          <p className="pg-ctrl-desc">{lockup.description}</p>
        </div>

        <PgColorPicker
          label="Colour"
          value={color.id}
          options={LOGO_COLORS.map((c) => c.id)}
          swatches={Object.fromEntries(LOGO_COLORS.map((c) => [c.id, { bg: c.hex }]))}
          onChange={pickColor}
        />
        {/* A control only where there's a decision. Blue and Black are each
            documented on exactly one surface, and a select holding one option is
            a control that does nothing — so those read as the statement they
            are. White has two, so it gets the select.

            The row stays either way rather than disappearing, so switching
            colour doesn't reflow the panel under the pointer. */}
        {surfaces.length > 1 ? (
          <PgSelect
            label="Surface"
            value={surface.name}
            options={surfaces.map((s) => s.name)}
            onChange={(name) => set("surface")(surfaces.find((s) => s.name === name).id)}
          />
        ) : (
          <div className="pg-row">
            <span className="pg-row-label">Surface</span>
            <span className="logo-surface-fixed">{surface.name} only</span>
          </div>
        )}

        {/* What the selected colour is for, and its value. The panel's job here
            isn't knobs — there are only two — it's saying which of the three you
            should have picked. */}
        <PgToggle label="Clear space" value={clear} onChange={setClear} />

        <div className="logo-readout">
          <span className="logo-hex">
            {color.hex}
            {color.token ? <em> · {color.token}</em> : <em> · no palette token</em>}
          </span>
          <p className="logo-use">{color.use}</p>
          {/* What the export already gives you, which differs between the two and
              is the one part of the clear-space rule the canvas can't show: x is
              lettered on the canvas, this isn't derivable from looking. */}
          {clear && (
            <p className="logo-clear-readout">
              x is half of <strong>{lockup.capName}</strong>. {lockup.clearNote}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// The exclusion zone: the ink's own box, and x out from it on every side.
//
// Both boxes are positioned from the artwork insets, and x arrives as a cqh — a
// share of the figure's height — so one number works horizontally and vertically
// without the aspect ratio having to convert it. Percentages alone couldn't:
// 33.216% of the width is a different distance from 33.216% of the height.
function ClearSpace({ lockup }) {
  const { art, cap, clear } = lockup;
  const pct = (n) => `${(n * 100).toFixed(3)}%`;
  const out = (n) => `calc(${pct(n)} - var(--clear))`;
  const cq = `${(clear * 100).toFixed(3)}cqh`;
  // How far outside the dashed zone the 2x dimension sits, and how far the two
  // extension lines reach to meet it.
  const REF_GAP = 22;
  const refLeft = `calc(${pct(art.left)} - var(--clear) - ${REF_GAP}px)`;
  const refReach = `calc(var(--clear) + ${REF_GAP}px)`;
  return (
    <>
      <span
        className="logo-clear-ink"
        style={{
          left: pct(art.left),
          right: pct(art.right),
          top: pct(art.top),
          bottom: pct(art.bottom),
        }}
      />
      <span
        className="logo-clear-zone"
        style={{
          "--clear": cq,
          left: out(art.left),
          right: out(art.right),
          top: out(art.top),
          bottom: out(art.bottom),
        }}
      />
      {/* x as a dimension: a line spanning the band with an arrowhead at each end,
          and the label beside it. Once on each axis, because the claim worth making
          is that the two distances are equal — stating it four times says less.
          `b` is the line and its arrowheads, `i` the label. */}
      <span
        className="logo-dim"
        data-axis="y"
        style={{
          "--clear": cq,
          left: pct(art.left),
          right: pct(art.right),
          top: out(art.top),
          height: "var(--clear)",
        }}
      >
        <b />
        <i>x</i>
      </span>
      <span
        className="logo-dim"
        data-axis="x"
        style={{
          "--clear": cq,
          top: pct(art.top),
          bottom: pct(art.bottom),
          left: out(art.left),
          width: "var(--clear)",
        }}
      >
        <b />
        <i>x</i>
      </span>

      {/* What x is half of. Two extension lines out from the cap height — the L's
          top and its baseline — to a 2x dimension standing clear of the zone, the
          way a drafting dimension is built. Without it, x is a distance with no
          stated source, which is the one thing a clear-space diagram has to show.

          The lines stop at the artwork's edge rather than crossing it: over the
          letters they'd be invisible anyway, the mark being the same colour. */}
      <span className="logo-guide" style={{ "--clear": cq, left: refLeft, width: refReach, top: pct(cap.top) }} />
      <span className="logo-guide" style={{ "--clear": cq, left: refLeft, width: refReach, bottom: pct(cap.bottom) }} />
      <span
        className="logo-dim"
        data-axis="y"
        data-ref="true"
        style={{ "--clear": cq, left: refLeft, width: 0, top: pct(cap.top), bottom: pct(cap.bottom) }}
      >
        <b />
        <i>2x</i>
      </span>
    </>
  );
}
