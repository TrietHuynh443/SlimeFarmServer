export interface PlayerJoinMessage {
  roomId: string;
  playerId: string;
}

export class PlayerLeaveMessage {
  roomId: string = "";
  playerId: string = "";
}
export enum InputType {
  NONE = 0,
  UP = 1,
  DOWN = 2,
  LEFT = 3,
  RIGHT = 4,
  FIGHT = 5,
}
export interface PlayerInputMessage {
  input: InputType;
}
