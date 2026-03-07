import RAPIER from "@dimforge/rapier2d-compat";
import { PlayerState } from "../models/player";
import { gameDataModel } from "../models/aggregator";
let WORLD: RAPIER.World | null = null;

let bodyMap = new Map<string, RAPIER.RigidBody>();

export const getWorldAsync = async () => {
  if (!WORLD) {
    await RAPIER.init();
    WORLD = new RAPIER.World({ x: 0, y: 0 });
  }
  return WORLD;
};

export const createPlayer = (roomId: string, state: PlayerState) => {
  if (!WORLD) {
    console.warn("NO WORLD CREATED getWorldAsync first");
    return;
  }
  let aggregator = gameDataModel.get(roomId);
  if (!aggregator) {
    aggregator = { playerStates: [] };
    gameDataModel.set(roomId, aggregator);
  }

  const rbDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(
    state.position.x,
    state.position.y,
  );
  const playerBody = WORLD.createRigidBody(rbDesc);

  aggregator.playerStates.push(state);
  bodyMap.set(state.id, playerBody);

  return WORLD.createCollider(RAPIER.ColliderDesc.ball(0.5), playerBody);
};

export const kickPlayer = (roomId: string, playerId: string) => {
  if (!WORLD) {
    console.warn("NO WORLD CREATED getWorldAsync first");
    return;
  }
  let aggregator = gameDataModel.get(roomId);
  if (aggregator) {
    aggregator.playerStates = aggregator.playerStates.filter(
      (x) => x.id !== playerId,
    );
  }

  bodyMap.delete(playerId);
};
