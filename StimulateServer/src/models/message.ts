import { encode, decode } from "@msgpack/msgpack";
import { Aggregator } from "./aggregator";
import { PlayerState } from "./player";

export enum OpCode {
  SYNC_CLOCK = 0,
  PLAYER_INPUT = 1,
  SYNC_GAME_STATE = 2,
  PLAYER_JOIN = 3,
  PLAYER_LEAVE = 4,
}

// Map OpCodes to their TypeScript interfaces
export interface IMessageMap {
  [OpCode.PLAYER_JOIN]: { roomId: string; state: PlayerState };
  [OpCode.PLAYER_LEAVE]: { roomId: string; playerId: string };
  [OpCode.SYNC_GAME_STATE]: Aggregator;
  [OpCode.SYNC_CLOCK]: null;
}

export interface IMetaData {
  code: number;
  tick: number;
}

export interface IMessage<T extends keyof IMessageMap> {
  meta: IMetaData;
  data: IMessageMap[T];
}

export type AnyMessage = {
  [K in keyof IMessageMap]: IMessage<K>;
}[keyof IMessageMap];

export const serializeMessage = <T extends keyof IMessageMap>(
  message: IMessage<T>,
) => {
  console.log(message);
  return encode<IMessage<T>>(message);
};

export const deserializeMessage = (data: Buffer): AnyMessage | null => {
  try {
    const decoded = decode(data) as AnyMessage;

    if (!decoded.meta || typeof decoded.meta.code !== "number") {
      return null;
    }

    return decoded as AnyMessage;
  } catch (e) {
    return null;
  }
};
