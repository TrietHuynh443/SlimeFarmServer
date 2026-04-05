export abstract class BaseEvent {
  static readonly EVENT_ID: string;
  constructor() {}
}

export enum EventType {
  PlayerMoveEvent = "player-move",
  PlayerConnectedEvent = "player-connected",
  PlayerDisconnectedEvent = "player-disconnected",
  ServerUpdateEvent = "server-update-event",
  PackedSyncDataMessageCompletedEvent = "packed-sync-data-completed",
  PlayerHealthCheckEvent = "health-check",
}
