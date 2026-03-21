import { PlayerCreatedEvent } from "../events/event.game";
import { EventManager } from "../events/event.manager";
import { Aggregator, gameDataModel } from "../models/aggregator";
import { PlayerState } from "../models/player";

export class GameController {
  constructor() {
    EventManager.Register<PlayerCreatedEvent>(this.OnPlayerCreated);
  }

  private OnPlayerCreated(evt: PlayerCreatedEvent): void {
    if (!gameDataModel.has(evt.roomId)) {
      gameDataModel.set(evt.roomId, new Aggregator());
    }

    const state = gameDataModel
      .get(evt.roomId)
      ?.playerStates.find((state) => state.id === evt.playerId);

    if (!state) {
      gameDataModel
        .get(evt.roomId)
        ?.playerStates.push(new PlayerState(evt.playerId, evt.position));
    }
  }
}
