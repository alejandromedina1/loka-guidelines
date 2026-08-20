import { htmlDocument, namedColor, specPrompt } from "../playground/snippets.js";
import { projectImageCss } from "../../utils/imageryStyles.js";

// The two things the Project images code drawer hands over, built the same way
// the component playground builds its own: a self-contained HTML + CSS block and
// a spec an agent can implement in whatever stack the project already uses.
//
// Both come off the same `layout` the canvas renders from and the same
// projectImageCss the preview is styled by, so neither can drift from what's on
// screen. Nothing here restates a number — the geometry is stated once, in
// utils/imageryStyles.js, and read from there.

// The markup, which is most of what makes this format hard to rebuild from a
// screenshot: which layer sits where, and why the marker squares have to be the
// first four children of the box.
function markup(layout) {
  const chrome =
    layout.chrome === "dots"
      ? '\n    <div class="project-chrome"><span></span><span></span><span></span></div>'
      : layout.chrome === "notch"
        ? '\n    <span class="project-notch"></span>'
        : "";
  return (
    '<figure class="project-image">\n' +
    '  <img src="project-photo.jpg" alt="">\n' +
    '  <span class="project-scrim"></span>\n\n' +
    '  <div class="project-safe frame-markers">\n' +
    "    <!-- The four corner squares first: .frame-markers selects them with\n" +
    "         :nth-child, so anything added above would take their place. -->\n" +
    "    <i></i><i></i><i></i><i></i>\n" +
    "    <!-- The same four lines, running out to the frame's edges. -->\n" +
    "    <b></b><b></b><b></b><b></b>" +
    chrome +
    "\n  </div>\n\n" +
    '  <div class="project-logo"><img src="client-lockup-white.svg" alt="Client name"></div>\n' +
    "</figure>"
  );
}

function html(layout) {
  return htmlDocument({
    title: `Project image — ${layout.name}`,
    css: projectImageCss(layout),
    markup:
      "<!-- Two assets to supply: a photograph of the client's product in use, and\n" +
      "     their logo as a white, single-colour SVG. -->\n" +
      markup(layout),
  });
}

function prompt(layout) {
  return specPrompt({
    component: "Project image",
    config: `${layout.name} layout`,
    sections: [
      [
        "Frame",
        [
          ["Proportion", "whatever the card needs — every measurement below is a share of it"],
          ["Photograph", "a client's product in use, cropped to fill"],
          ["Scrim", `${namedColor("#05142E")} at 20% over the whole frame`],
        ],
      ],
      [
        "Safe box",
        [
          ["Aspect", layout.measure.box],
          ["Position", "inset 24px from the top and bottom of the frame, centred horizontally"],
          ["Stroke", "2px white, centred on the edge"],
          ["Extensions", "the same four lines continue to the frame's edges at 1px"],
          ["Corners", `8px squares in ${namedColor("#186BF3")}, straddling each corner, over the lines`],
        ],
      ],
      [
        "Lockup",
        [
          ["Size", `${layout.measure.logo} at a 532px-wide frame — a fixed share of the frame's width`],
          ["Position", "centred on the frame"],
          ["Artwork", "the client's logo in white, single-colour"],
        ],
      ],
      [
        "Chrome",
        [["Marks", layout.specs.find(([label]) => label === "Chrome")[1]]],
      ],
    ],
    notes: [
      "The layout is not a style choice — it follows from what the project shipped. Desktop for a web app, Mobile for a phone app, Logo for work with no interface to show.",
      "The box is inset 24px top and bottom in all three layouts. Only its aspect changes, and the aspect is the shape of the thing the project produced.",
      "The scrim is fixed at 20% and the lockup is white, so a bright photograph will swallow it. Brief the photograph darker rather than deepening the scrim.",
      "The corner squares paint over every line they straddle. A border or an outline on the box will cross them — see the CSS below for what to use instead.",
    ],
    reference: html(layout),
  });
}

export function projectSnippets(layout) {
  return { html: html(layout), prompt: prompt(layout) };
}
