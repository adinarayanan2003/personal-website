import type { Gfx, Pointer } from "@/lib/scenes/engine";

/** One step of a mini-game. Pointer and clicks are in cells; keys are KeyboardEvent.key values since the last frame. */
export type GameFrame = { g: Gfx; t: number; dt: number; pointer: Pointer; clicks: { x: number; y: number }[]; keys: string[] };

export type Game = { step(frame: GameFrame): void; score(): number; over(): boolean };

export type GameDef = { title: string; how: string; seconds: number; create: (seed: number) => Game };
