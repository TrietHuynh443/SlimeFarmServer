import { Expose } from "class-transformer";
import { PlayerState } from "./player";

export class Aggregator {
  @Expose({ name: "pss" })
  playerStates: PlayerState[] = [];
}

export const gameDataModel = new Map<string, Aggregator>();
