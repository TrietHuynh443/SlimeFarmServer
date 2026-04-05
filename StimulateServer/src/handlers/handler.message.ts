import { RemoteInfo } from "node:dgram";
import { AnyMessage, IMessage, OpCode } from "../models/message";
import { rapierService } from "../services/rapierService";
import { EventManager } from "../events/event.manager";
import { EventType } from "../events/event";
import {
  PlayerConnectedEvent,
  PlayerDisconnectedEvent,
  PlayerHealCheckEvent,
} from "../events/event.network";
import { ConnectionInfo } from "../models/connection";
import { PlayerAddresses } from "../models/player";

export const handleMessage = (message: AnyMessage, rinfo: RemoteInfo) => {
  console.log("[EVENT] handle message", message.meta.code);
  const address = { ipAddress: rinfo.address, port: rinfo.port } as PlayerAddresses;

  switch (message.meta.code) {
    case OpCode.PLAYER_JOIN: {
      const { playerId, roomId } = (message as IMessage<OpCode.PLAYER_JOIN>).data;
      EventManager.Publish(
        EventType.PlayerConnectedEvent,
        new PlayerConnectedEvent(
          {
            address: address,
            playerId: playerId,
            lastHealCheckTime: Date.now(),
          } as ConnectionInfo,
          roomId,
        ),
      );
      break;
    }
    case OpCode.PLAYER_LEAVE: {
      const { playerId, roomId } = (message as IMessage<OpCode.PLAYER_LEAVE>).data;
      EventManager.Publish(
        EventType.PlayerDisconnectedEvent,
        new PlayerDisconnectedEvent(
          {
            address: address,
            playerId: playerId,
            lastHealCheckTime: Date.now(),
          } as ConnectionInfo,
          roomId,
        ),
      );
      break;
    }
    case OpCode.PLAYER_INPUT: {
      const { roomId, playerId, input } = (message as IMessage<OpCode.PLAYER_INPUT>).data;

      rapierService.handlePlayerInput(roomId, playerId, input);
      break;
    }
    case OpCode.HEALTH_CHECK: {
      const { roomId, playerId } = (message as IMessage<OpCode.HEALTH_CHECK>).data;
      EventManager.Publish(
        EventType.PlayerHealthCheckEvent,
        new PlayerHealCheckEvent(
          {
            address: address,
            playerId: playerId,
            lastHealCheckTime: Date.now(),
          } as ConnectionInfo,
          roomId,
        ),
      );
      break;
    }
  }
};
