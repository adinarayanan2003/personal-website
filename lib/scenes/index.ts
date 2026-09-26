import { diag } from "./diag";
import { dj } from "./dj";
import { dns } from "./dns";
import type { Scene } from "./engine";
import { expos } from "./expos";
import { fitness } from "./fitness";
import { genparse } from "./genparse";
import { owly } from "./owly";
import { sarcophagus } from "./sarcophagus";
import { subcompiq } from "./subcompiq";
import { trading } from "./trading";
import { video } from "./video";

export const SCENES = {
  owly: () => owly(),
  subcompiq: (seed: number) => subcompiq(seed),
  diag: (seed: number) => diag(seed),
  video: () => video(),
  expos: (seed: number) => expos(seed),
  genparse: (seed: number) => genparse(seed),
  dns: () => dns(),
  sarcophagus: () => sarcophagus(),
  trading: (seed: number) => trading(seed),
  fitness: () => fitness(),
  dj: (seed: number) => dj(seed),
} satisfies Record<string, (seed: number) => Scene>;

export type SceneName = keyof typeof SCENES;
