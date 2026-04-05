import RAPIER from "@dimforge/rapier2d-compat";
import { EventManager } from "../events/event.manager";
import { PlayerMoveEvent } from "../events/event.game";
import { EventType } from "../events/event";
import { InputType } from "../models/message.event";
import {
  ActionType,
  AnyAction,
  IMoveAction,
  createDefaultActionPayload,
} from "../controllers/actions/actions";
import { PlayerConnectedEvent, PlayerDisconnectedEvent } from "../events/event.network";

let WORLD: RAPIER.World | null = null;

let bodyMap = new Map<string, RAPIER.Collider>();
let currentTick: number = 0;

const INPUT_CONFIG = {
  [InputType.UP]: ActionType.MOVE,
  [InputType.DOWN]: ActionType.MOVE,
  [InputType.LEFT]: ActionType.MOVE,
  [InputType.RIGHT]: ActionType.MOVE,

  [InputType.FIGHT]: ActionType.CAST,
} as Record<InputType, ActionType>;

const MOVEMENT_CONFIG: Partial<
  Record<InputType, { axis: "vertical" | "horizontal"; value: number }>
> = {
  [InputType.UP]: { axis: "vertical", value: 1 },
  [InputType.DOWN]: { axis: "vertical", value: -1 },
  [InputType.LEFT]: { axis: "horizontal", value: -1 },
  [InputType.RIGHT]: { axis: "horizontal", value: 1 },
};

const handlePlayerInput = (roomId: string, playerId: string, inputBatch: InputType[]) => {
  const res = Array.from(
    { length: Object.keys(ActionType).length },
    () => null,
  ) as (AnyAction | null)[];

  const handle = (inputType: InputType) => {
    const actionType = INPUT_CONFIG[inputType];

    if (!actionType) return;

    res[actionType] ??= createDefaultActionPayload(actionType);

    if (!res[actionType]) return;

    switch (inputType) {
      case InputType.UP:
      case InputType.DOWN:
      case InputType.LEFT:
      case InputType.RIGHT: {
        const moveAction = res[actionType] as IMoveAction;
        const moveCfg = MOVEMENT_CONFIG[inputType];

        moveAction[moveCfg!.axis] += moveCfg!.value;
        actions.handlePlayerMove(roomId, playerId, moveAction.horizontal, moveAction.vertical);
        break;
      }
    }
  };

  inputBatch.forEach((input) => handle(input));
};

const actions = {
  handlePlayerMove(roomId: string, playerId: string, horizontal: number, vertical: number) {
    if (!WORLD) {
      console.warn("NO WORLD CREATED getWorldAsync first");
      return;
    }
    const collider = bodyMap.get(playerId);

    if (!collider) {
      console.warn("NO WORLD CREATED getWorldAsync first");
      return;
    }

    const rigidBody = collider.parent();

    if (!rigidBody) return;

    const offset = 0.01; // small gap to avoid getting stuck
    const controller = WORLD.createCharacterController(offset);
    const desiredTranslation = { x: horizontal, y: vertical };

    controller.computeColliderMovement(collider, desiredTranslation);

    const correctedMovement = controller.computedMovement();
    const position = rigidBody.translation();
    position.x += correctedMovement.x;
    position.y += correctedMovement.y;
    rigidBody.setTranslation(position, true);

    EventManager.Publish(
      EventType.PlayerMoveEvent,
      new PlayerMoveEvent(roomId, playerId, [position.x, position.y]),
    );
  },

  createPlayer(playerId: string): RAPIER.Collider | undefined {
    if (!WORLD) {
      console.warn("NO WORLD CREATED getWorldAsync first");
      return undefined;
    }

    if (bodyMap.has(playerId)) {
      console.log("Player already exists");
      return undefined;
    }

    const rbDesc = RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(0, 0);
    const playerBody = WORLD.createRigidBody(rbDesc);

    bodyMap.set(playerId, WORLD.createCollider(RAPIER.ColliderDesc.capsule(1, 0.5), playerBody));

    return bodyMap.get(playerId);
  },

  kickPlayer(playerId: string) {
    if (!WORLD) {
      console.warn("NO WORLD CREATED getWorldAsync first");
      return;
    }
    const rigid = bodyMap.get(playerId)?.parent();
    if (!rigid) {
      console.warn("NO WORLD CREATED getWorldAsync first");
      return;
    }

    WORLD.removeRigidBody(rigid);
    bodyMap.delete(playerId);
  },
};

const update = () => {
  ++currentTick;
  // EventManager.Publish(EventType.ServerUpdateEvent, new ServerUpdateEvent(++currentTick));
  WORLD?.step();
};

const runAsync = async () => {
  if (!WORLD) {
    await RAPIER.init();
    WORLD = new RAPIER.World({ x: 0, y: 0 });
    registerEvents();
  }

  setInterval(update, 33);
};

function registerEvents() {
  EventManager.Register<PlayerDisconnectedEvent>(
    EventType.PlayerDisconnectedEvent,
    ({ playerConnectionInfo }) => rapierService.kickPlayer(playerConnectionInfo.playerId),
  );

  EventManager.Register<PlayerConnectedEvent>(
    EventType.PlayerConnectedEvent,
    ({ playerConnectionInfo }) => rapierService.createPlayer(playerConnectionInfo.playerId),
  );
}

export const rapierService = {
  runAsync,
  createPlayer: actions.createPlayer,
  kickPlayer: actions.kickPlayer,
  handlePlayerInput,
};
