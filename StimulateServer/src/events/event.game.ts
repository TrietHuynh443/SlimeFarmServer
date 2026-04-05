import { InputType } from "../models/message.event";
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
export class HandleInputBeginEvent extends BaseEvent {
  constructor(
    public playerId: string,
    public inputs: InputType[],
  ) {
    super();
  }
}
export class ServerUpdateEvent extends BaseEvent {
  constructor(public readonly serverTick: number) {
    super();
  }
}
export class PackedSyncDataMessageCompletedEvent extends BaseEvent {
  constructor(public readonly packedMessageMap: Map<string, Uint8Array>) {
    super();
  }
}
