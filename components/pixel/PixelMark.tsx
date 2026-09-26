import { cn } from "@/lib/utils";

/** Pixel "A" monogram on an 8x8 grid. Same shape as app/icon.svg. */
const GRID = [
  "........",
  "..####..",
  ".##..##.",
  ".##..##.",
  ".######.",
  ".##..##.",
  ".##..##.",
  "........",
];

const CELLS = GRID.flatMap((row, y) => [...row].flatMap((ch, x) => (ch === "#" ? [{ x, y }] : [])));

export function PixelMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 8 8" shapeRendering="crispEdges" aria-hidden className={cn("block", className)}>
      {CELLS.map(({ x, y }) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="currentColor" />
      ))}
    </svg>
  );
}
