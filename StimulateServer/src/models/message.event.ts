export interface PlayerJoinMessage {
  roomId: string;
  playerId: string;
}

export interface PlayerLeaveMessage {
  roomId: string;
  playerId: string;
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
  roomId: string;
  playerId: string;
  input: InputType[];
}

export interface HealthCheckMessage {
  roomId: string;
  playerId: string;
}
