import { Expose } from "class-transformer";

export class PlayerJoinMessage {
  @Expose({ name: "rid" })
  roomId: string = "";

  @Expose({ name: "pid" })
  playerId: string = "";
}

export class PlayerLeaveMessage {
  @Expose({ name: "rid" })
  roomId: string = "";
  @Expose({ name: "pid" })
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
export class PlayerInputMessage {
  @Expose({ name: "i" })
  input: InputType = InputType.NONE;
}
