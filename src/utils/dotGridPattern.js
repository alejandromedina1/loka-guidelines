// Renders a tileable field of square dots as a background-image, built from a
// tiny inline SVG so the square size and the horizontal/vertical gap between
// squares can each vary independently (a plain CSS gradient can't isolate a
// square without distorting an arbitrary fill color).
function svgTile({ size, gapX, gapY, color }) {
  const cellW = size + gapX;
  const cellH = size + gapY;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${cellW}' height='${cellH}'><rect width='${size}' height='${size}' fill='${color}'/></svg>`;
  return { cellW, cellH, encoded: encodeURIComponent(svg) };
}

export function dotGridStyle({ size, gapX, gapY, color }) {
  const { cellW, cellH, encoded } = svgTile({ size, gapX, gapY, color });
  return {
    backgroundImage: `url("data:image/svg+xml,${encoded}")`,
    backgroundSize: `${cellW}px ${cellH}px`,
  };
}

export function dotGridCss({ size, gapX, gapY, color }) {
  const { backgroundImage, backgroundSize } = dotGridStyle({ size, gapX, gapY, color });
  return `background-image: ${backgroundImage};\nbackground-size: ${backgroundSize};`;
}
