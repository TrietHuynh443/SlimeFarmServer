import { EventType } from "../events/event";
import { PlayerCreatedEvent } from "../events/event.game";
import { EventManager } from "../events/event.manager";
import { Aggregator, gameDataModel } from "../models/aggregator";

export class GameController {
  constructor() {
    EventManager.Register<PlayerCreatedEvent>(
      EventType.PlayerCreatedEvent,
      this.OnPlayerCreated,
    );
  }

  private OnPlayerCreated = (evt: PlayerCreatedEvent): void => {
    if (!gameDataModel.has(evt.roomId)) {
      gameDataModel.set(evt.roomId, { playerStates: [] });
    }

    const state = gameDataModel
      .get(evt.roomId)
      ?.playerStates.find((state) => state.id === evt.playerId);

    if (!state) {
      gameDataModel
        .get(evt.roomId)
        ?.playerStates.push({ id: evt.playerId, position: [...evt.position] });
    } else {
      state.position = evt.position;
    }
  };

  public GetGameData(roomId: string): Aggregator | undefined {
    return gameDataModel.get(roomId);
  }

  public RoomIterator(): Iterable<string> {
    return gameDataModel.keys();
  }
}
