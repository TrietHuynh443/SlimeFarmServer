import { Socket } from "node:dgram";
import { EventManager } from "../events/event.manager";
import {
  PlayerConnectedEvent,
  PlayerDisconnectedEvent,
  PlayerHealCheckEvent,
} from "../events/event.network";
import { ConnectionInfo } from "../models/connection";
import { EventType } from "../events/event";
import { getUDPSocketInstance } from "../network/socket.udp";
import { PackedSyncDataMessageCompletedEvent } from "../events/event.game";

const HEALTH_CHECK_TIMEOUT = 10000;

export class ConnectionController {
  private readonly connectionMap = new Map<string, ConnectionInfo[]>();
  private readonly playerIds = new Set<string>();
  private readonly connections: ConnectionInfo[] = [];
  private readonly socket: Socket;
  private lastHealCheckTime: number = 0;
  private readonly successMessage: Uint8Array;
  private readonly failedMessage: Uint8Array;
  constructor() {
    this.socket = getUDPSocketInstance();
    this.successMessage = Buffer.alloc(1, 0);
    this.failedMessage = Buffer.alloc(1, 1);
    EventManager.Register<PlayerConnectedEvent>(
      EventType.PlayerConnectedEvent,
      this.OnPlayerConnected,
    );

    EventManager.Register<PackedSyncDataMessageCompletedEvent>(
      EventType.PackedSyncDataMessageCompletedEvent,
      this.OnPackedSyncDataMessageCompleted,
    );

    EventManager.Register<PlayerDisconnectedEvent>(
      EventType.PlayerDisconnectedEvent,
      this.OnPlayerDisconnected,
    );

    EventManager.Register<PlayerHealCheckEvent>(EventType.PlayerHealthCheckEvent, this.OnHealCheck);
    setInterval(this.CheckConnections, 10000);
  }

  private CheckConnections = (): void => {
    for (const [rid, connections] of this.connectionMap) {
      connections.forEach((con) => {
        if (this.lastHealCheckTime - con.lastHealCheckTime >= HEALTH_CHECK_TIMEOUT) {
          EventManager.Publish(
            EventType.PlayerDisconnectedEvent,
            new PlayerDisconnectedEvent(con, rid),
          );
        }
      });
    }
    this.lastHealCheckTime = Date.now();
  };

  private OnHealCheck = ({ playerConnectionInfo }: PlayerHealCheckEvent) => {
    const con = this.connections.find(
      (x) =>
        x.address.ipAddress === playerConnectionInfo.address.ipAddress &&
        x.address.port === playerConnectionInfo.address.port,
    );
    if (!con) return;
    con.lastHealCheckTime = Date.now();
  };

  private OnPlayerConnected = ({ roomId, playerConnectionInfo }: PlayerConnectedEvent): void => {
    if (this.playerIds.has(playerConnectionInfo.playerId)) {
      this.SendMessageToClient(playerConnectionInfo, this.failedMessage);
      return;
    }

    if (!this.connectionMap.has(roomId)) {
      this.connectionMap.set(roomId, []);
    }
    this.playerIds.add(playerConnectionInfo.playerId);
    this.connectionMap.get(roomId)?.push(playerConnectionInfo);
    this.connections.push(playerConnectionInfo);

    this.SendMessageToClient(playerConnectionInfo, this.successMessage);
  };

  private OnPackedSyncDataMessageCompleted = ({
    packedMessageMap,
  }: PackedSyncDataMessageCompletedEvent): void => {
    packedMessageMap.forEach((message, roomId) => {
      this.BroadcastToRoom(roomId, message);
    });
  };

  private OnPlayerDisconnected = ({
    roomId,
    playerConnectionInfo,
  }: PlayerDisconnectedEvent): void => {
    this.playerIds.delete(playerConnectionInfo.playerId);

    const globalIdx = this.connections.findIndex(
      (con) => con.address.ipAddress === playerConnectionInfo.address.ipAddress,
    );
    if (globalIdx !== -1) this.connections.splice(globalIdx, 1);

    const roomConnections = this.connectionMap.get(roomId);
    if (roomConnections) {
      const roomIdx = roomConnections.findIndex(
        (con) => con.address.ipAddress === playerConnectionInfo.address.ipAddress,
      );
      if (roomIdx !== -1) roomConnections.splice(roomIdx, 1);
    }
  };

  private BroadcastToRoom(roomId: string, buffer: Uint8Array): void {
    const roomConnections = this.connectionMap.get(roomId);
    if (!roomConnections) return;

    roomConnections.forEach((con) => this.SendMessageToClient(con, buffer));
  }

  private SendMessageToClient({ address }: ConnectionInfo, buffer: Uint8Array) {
    if (!this.socket) return;
    this.socket.send(buffer, address.port, address.ipAddress);
  }
}
