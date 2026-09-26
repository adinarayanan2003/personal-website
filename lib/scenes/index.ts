import { diag } from "./diag";
import { dns } from "./dns";
import type { Scene } from "./engine";
import { expos } from "./expos";
import { genparse } from "./genparse";
import { owly } from "./owly";
import { sarcophagus } from "./sarcophagus";
import { subcompiq } from "./subcompiq";
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
} satisfies Record<string, (seed: number) => Scene>;

export type SceneName = keyof typeof SCENES;
