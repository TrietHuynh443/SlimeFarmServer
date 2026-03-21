import { BaseEvent } from "./event";

export class PlayerMoveEvent extends BaseEvent {
  constructor(
    public roomId: string,
    public playerId: string,
    public position: number[],
  ) {
    super();
  }
}

export class PlayerCreatedEvent extends BaseEvent {
  constructor(
    public roomId: string,
    public playerId: string,
    public position: number[],
  ) {
    super();
  }
}

export class PlayerKickedEvent extends BaseEvent {
  constructor(
    public roomId: string,
    public playerId: string,
  ) {
    super();
  }
}
