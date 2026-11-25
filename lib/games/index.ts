import { createDns } from "./dns";
import { createExpos } from "./expos";
import { createSarcophagus } from "./sarcophagus";
import type { GameDef } from "./types";

export type { Game, GameDef, GameFrame } from "./types";

/** Mini-games that turn the project diagrams into something you can play. */
export const GAMES = {
  dns: {
    title: "Resolve",
    how: "Click the root server, then the right TLD, then the domain's own server (or press 1 to 9), and grab the CACHE chip when a domain comes back.",
    seconds: 30,
    create: createDns,
  },
  sarcophagus: {
    title: "Heartbeat",
    how: "Press Space or tap while the marker is inside the bright zone to send a heartbeat; miss three times and the vault opens.",
    seconds: 30,
    create: createSarcophagus,
  },
  expos: {
    title: "Page fault",
    how: "When a page isn't in memory, click a frame or press 1 to 8 to swap it out, and pick the dimmest one (least recently used) for a bonus.",
    seconds: 30,
    create: createExpos,
  },
} satisfies Record<string, GameDef>;

export type GameName = keyof typeof GAMES;
