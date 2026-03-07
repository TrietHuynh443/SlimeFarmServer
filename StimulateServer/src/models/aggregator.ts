import { PlayerState } from "./player";

export interface Aggregator {
  playerStates: PlayerState[];
}

export const gameDataModel = new Map<string, Aggregator>();
