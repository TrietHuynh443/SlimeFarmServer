import { Socket } from "node:dgram";
import { EventManager } from "../events/event.manager";
import { PlayerConnectedEvent } from "../events/event.network";
import { AnyMessage, serializeMessage } from "../models/message";
import { ConnectionInfo } from "../models/connection";
import { EventType } from "../events/event";

export class ConnectionController {
  private readonly connections = new Map<string, ConnectionInfo[]>();

  constructor() {
    EventManager.Register<PlayerConnectedEvent>(
      EventType.PlayerConnectedEvent,
      this.OnPlayerConnected,
    );
  }
  private OnPlayerConnected = (evt: PlayerConnectedEvent): void => {
    if (!this.connections.has(evt.roomId)) {
      this.connections.set(evt.roomId, []);
    }
    // ... rest of your logic
    var connection = this.connections
      .get(evt.roomId)
      ?.find((con) => con.address === evt.playerConnectionInfo.address);
    if (!connection) {
      this.connections.get(evt.roomId)?.push(evt.playerConnectionInfo);
    }
  };

  public GetAllConnections(roomId: string): ConnectionInfo[] {
    return this.connections?.get(roomId || "") ?? [];
  }

  public BroadcastToRoom<T extends AnyMessage>(
    roomId: string,
    message: T,
    socket: Socket,
  ): void {
    const roomConnections = this.connections.get(roomId);
    if (!roomConnections) return;
    const buffer = serializeMessage(message);
    roomConnections.forEach((con) => {
      const addr = con.address;
      if (!addr) return;
      socket.send(buffer, addr.port, addr.ipAddress);
    });
  }

  public BroadcastToAllRooms(message: AnyMessage, socket: Socket) {
    for (let roomId of this.connections.keys()) {
      this.BroadcastToRoom(roomId, message, socket);
    }
  }
}
