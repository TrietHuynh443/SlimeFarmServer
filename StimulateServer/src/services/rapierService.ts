import RAPIER, { Collider } from "@dimforge/rapier2d-compat";
import { EventManager } from "../events/event.manager";
import {
  PlayerCreatedEvent,
  PlayerKickedEvent,
  PlayerMoveEvent,
} from "../events/event.game";
import { EventType } from "../events/event";
import { PlayerConnectedEvent } from "../events/event.network";

let WORLD: RAPIER.World | null = null;

let bodyMap = new Map<string, RAPIER.RigidBody>();

export const getWorldAsync = async () => {
  if (!WORLD) {
    await RAPIER.init();
    WORLD = new RAPIER.World({ x: 0, y: 0 });
  }
  return WORLD;
};

export const createPlayer = (
  roomId: string,
  playerId: string,
  ip: string,
  port: number,
): Collider | undefined => {
  if (!WORLD) {
    console.warn("NO WORLD CREATED getWorldAsync first");
    return undefined;
  }

  if (bodyMap.has(playerId)) {
    console.log("Player already exists");
    return undefined;
  }

  const rbDesc = RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(
    0,
    0,
  );
  const playerBody = WORLD.createRigidBody(rbDesc);

  bodyMap.set(playerId, playerBody);

  EventManager.Publish(
    EventType.PlayerConnectedEvent,
    new PlayerConnectedEvent(
      { address: { ipAddress: ip, port: port } },
      roomId,
    ),
  );

  EventManager.Publish(
    EventType.PlayerCreatedEvent,
    new PlayerCreatedEvent(roomId, playerId, [0, 0]),
  );

  return WORLD.createCollider(RAPIER.ColliderDesc.capsule(1, 0.5), playerBody);
};

export const kickPlayer = (roomId: string, playerId: string) => {
  if (!WORLD) {
    console.warn("NO WORLD CREATED getWorldAsync first");
    return;
  }

  if (!bodyMap.has(playerId)) {
    console.warn("NO WORLD CREATED getWorldAsync first");
    return;
  }

  bodyMap.delete(playerId);
  EventManager.Publish(
    EventType.PlayerKickedEvent,
    new PlayerKickedEvent(roomId, playerId),
  );
};

export const movePlayer = (
  horizontal: number,
  vertical: number,
  roomId: string,
  playerId: string,
): void => {
  if (!WORLD) {
    console.warn("NO WORLD CREATED getWorldAsync first");
    return;
  }

  const playerBody = bodyMap.get(playerId);
  if (!playerBody) {
    console.warn(`PLAYER ID ${playerId} not found`);
    return;
  }

  const nextPos = playerBody.translation();

  nextPos.x += horizontal;
  nextPos.y += vertical;

  playerBody.setTranslation(nextPos, true);

  EventManager.Publish(
    EventType.PlayerMoveEvent,
    new PlayerMoveEvent(roomId, playerId, [nextPos.x, nextPos.y]),
  );

  console.log(`Player ${playerId} move to ${nextPos}`);
};
