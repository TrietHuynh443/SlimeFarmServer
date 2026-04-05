import { PlayerAddresses } from "./player";

export interface ConnectionInfo {
  address: PlayerAddresses;
  playerId: string;
  lastHealCheckTime: number;
}
