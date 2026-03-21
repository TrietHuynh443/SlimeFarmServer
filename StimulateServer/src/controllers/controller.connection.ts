import { EventManager } from "../events/event.manager";
import { PlayerConnectedEvent } from "../events/event.network";
import { connectionModels } from "../models/connection";

export class ConnectionController {
  private readonly connections = connectionModels;
  constructor() {
    EventManager.Register<PlayerConnectedEvent>(this.OnPlayerConnected);
  }
  private OnPlayerConnected(evt: PlayerConnectedEvent): void {
    if (!this.connections.has(evt.roomId)) {
      this.connections.set(evt.roomId, []);
    }
    var connection = this.connections
      .get(evt.roomId)
      ?.find((con) => con.address === evt.playerConnectionInfo.address);
    if (!connection) {
      this.connections.get(evt.roomId)?.push(evt.playerConnectionInfo);
    }
  }
}
