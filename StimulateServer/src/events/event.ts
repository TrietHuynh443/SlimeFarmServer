export abstract class BaseEvent {
  static readonly EVENT_ID: string;
  constructor() {}
}

export enum EventType {
  PlayerMoveEvent = "player-move",
  PlayerCreatedEvent = "player-created",
  PlayerKickedEvent = "player-kicked",
  PlayerConnectedEvent = "player-connected",
  PlayerDisconnectedEvent = "player-disconnected",
}
