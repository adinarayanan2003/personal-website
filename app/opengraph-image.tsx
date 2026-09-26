import { ImageResponse } from "next/og";

import { site } from "@/lib/data";
import { createValueNoise, renderField, TEAL } from "@/lib/pixel";

export const alt = `${site.name}. Founder of Owly, database engineer.`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const CELL = 12;

/** The same pixel field as the site hero, drawn once as SVG rects (runs merged per row). */
function fieldSvg() {
  const cols = Math.ceil(size.width / CELL);
  const rows = Math.ceil(size.height / CELL);
  const levels = new Uint8Array(cols * rows);
  renderField(
    levels,
    cols,
    rows,
    6.5,
    { originX: 0.84, originY: 0.3, radius: 0.62, intensity: 0.86, levels: TEAL.length },
    createValueNoise(11),
  );

  let rects = "";
  for (let y = 0; y < rows; y++) {
    let x = 0;
    while (x < cols) {
      const level = levels[y * cols + x];
      let run = 1;
      while (x + run < cols && levels[y * cols + x + run] === level) run++;
      if (level) {
        rects += `<rect x="${x * CELL}" y="${y * CELL}" width="${run * CELL}" height="${CELL}" fill="${TEAL[level - 1]}"/>`;
      }
      x += run;
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${cols * CELL}" height="${rows * CELL}" shape-rendering="crispEdges">${rects}</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

function Mark() {
  const cells = [
    [2, 1], [3, 1], [4, 1], [5, 1],
    [1, 2], [2, 2], [5, 2], [6, 2],
    [1, 3], [2, 3], [5, 3], [6, 3],
    [1, 4], [2, 4], [3, 4], [4, 4], [5, 4], [6, 4],
    [1, 5], [2, 5], [5, 5], [6, 5],
    [1, 6], [2, 6], [5, 6], [6, 6],
  ];
  const s = 5;
  return (
    <div style={{ position: "relative", display: "flex", width: 8 * s, height: 8 * s }}>
      {cells.map(([x, y]) => (
        <div
          key={`${x}-${y}`}
          style={{ position: "absolute", left: x * s, top: y * s, width: s, height: s, background: "#2fc9cf" }}
        />
      ))}
    </div>
  );
}

export default function OpengraphImage() {
  const field = fieldSvg();

  return new ImageResponse(
    (
      <div style={{ position: "relative", display: "flex", width: "100%", height: "100%", background: "#1b1b1a" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={field} width={1200} height={636} alt="" style={{ position: "absolute", left: 0, top: 0 }} />
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: size.width,
            height: size.height,
            display: "flex",
            background:
              "linear-gradient(90deg, rgba(27,27,26,0.95) 0%, rgba(27,27,26,0.9) 42%, rgba(27,27,26,0.45) 66%, rgba(27,27,26,0) 84%)",
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            padding: "64px 72px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Mark />
            <div style={{ display: "flex", fontSize: 30, color: "#f4efe7", letterSpacing: "-0.01em" }}>{site.name}</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", color: "#f4efe7", fontSize: 76, lineHeight: 1.04, letterSpacing: "-0.04em" }}>
            <div style={{ display: "flex" }}>{site.headline[0]}</div>
            <div style={{ display: "flex" }}>{site.headline[1]}</div>
          </div>

          <div style={{ display: "flex", gap: 28, fontSize: 24, color: "#969088" }}>
            <div style={{ display: "flex" }}>Bengaluru, India</div>
            <div style={{ display: "flex", color: "#625e59" }}>/</div>
            <div style={{ display: "flex" }}>AI agents, databases, video</div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
