import { EventType } from "../events/event";
import {
  PackedSyncDataMessageCompletedEvent,
  PlayerMoveEvent,
  ServerUpdateEvent,
} from "../events/event.game";
import { EventManager } from "../events/event.manager";
import { PlayerConnectedEvent, PlayerDisconnectedEvent } from "../events/event.network";
import { gameDataModel } from "../models/aggregator";
import { IMessage, MetaData, OpCode, serializeMessage } from "../models/message";
import { PlayerState } from "../models/player";

export class GameController {
  constructor() {
    EventManager.Register<PlayerConnectedEvent>(
      EventType.PlayerConnectedEvent,
      this.OnPlayerConnected,
    );
    EventManager.Register<PlayerDisconnectedEvent>(
      EventType.PlayerDisconnectedEvent,
      this.OnPlayerDisconnected,
    );
    EventManager.Register<ServerUpdateEvent>(EventType.ServerUpdateEvent, this.OnServerUpdated);
    EventManager.Register<PlayerMoveEvent>(EventType.PlayerMoveEvent, this.OnPlayerMove);
  }

  public GetPlayerState(roomId: string, pid: string): PlayerState | undefined {
    return gameDataModel.get(roomId)?.playerStates.find((p) => p.id === pid);
  }

  private OnPlayerConnected = ({ roomId, playerConnectionInfo }: PlayerConnectedEvent): void => {
    if (!gameDataModel.has(roomId)) {
      gameDataModel.set(roomId, { playerStates: [] });
    }

    const state = gameDataModel
      .get(roomId)
      ?.playerStates.find((state) => state.id === playerConnectionInfo.playerId);

    if (!state) {
      gameDataModel.get(roomId)?.playerStates.push({
        id: playerConnectionInfo.playerId,
        position: [0, 0],
      });
    } else {
      state.position = [0, 0];
    }
  };

  private OnServerUpdated = (evt: ServerUpdateEvent): void => {
    const meta = {
      tick: evt.serverTick,
      code: OpCode.SYNC_GAME_STATE,
    } as MetaData;
    const messageMap = new Map<string, Uint8Array>();

    for (let roomId in gameDataModel.keys()) {
      const decodedMessage = serializeMessage({
        meta: meta,
        data: gameDataModel.get(roomId),
      } as IMessage<OpCode.SYNC_GAME_STATE>);

      messageMap.set(roomId, decodedMessage);
    }

    EventManager.Publish(
      EventType.PackedSyncDataMessageCompletedEvent,
      new PackedSyncDataMessageCompletedEvent(messageMap),
    );
  };

  private OnPlayerMove = (evt: PlayerMoveEvent): void => {
    const playerState = this.GetPlayerState(evt.roomId, evt.playerId);
    if (playerState) {
      playerState.position = { ...evt.position };
    }
  };

  private OnPlayerDisconnected = ({
    roomId,
    playerConnectionInfo,
  }: PlayerDisconnectedEvent): void => {
    const playerStates = gameDataModel.get(roomId);
    if (playerStates) {
      const index = playerStates.playerStates.findIndex(
        (p) => p.id === playerConnectionInfo.playerId,
      );
      if (index !== -1) playerStates.playerStates.splice(index, 1);
    }
  };
}
