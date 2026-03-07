import { Player } from "./player";

export interface Room {
  id: string;
  players: Player[];
}

export const roomsModel: Room[] = [];
