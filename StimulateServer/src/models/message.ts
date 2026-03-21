import { encode, decode } from "@msgpack/msgpack";
import { Aggregator } from "./aggregator";
import "reflect-metadata";
import {
  Expose,
  instanceToPlain,
  plainToInstance,
  Transform,
  Type,
} from "class-transformer";
import {
  PlayerInputMessage,
  PlayerJoinMessage,
  PlayerLeaveMessage,
} from "./message.event";

export enum OpCode {
  SYNC_CLOCK = 0,
  PLAYER_INPUT = 1,
  SYNC_GAME_STATE = 2,
  PLAYER_JOIN = 3,
  PLAYER_LEAVE = 4,
}

// Map OpCodes to their TypeScript interfaces
export interface IMessageMap {
  [OpCode.PLAYER_JOIN]: PlayerJoinMessage;
  [OpCode.PLAYER_LEAVE]: PlayerLeaveMessage;
  [OpCode.SYNC_GAME_STATE]: Aggregator;
  [OpCode.SYNC_CLOCK]: Object;
  [OpCode.PLAYER_INPUT]: PlayerInputMessage;
}

export class MetaData {
  @Expose({ name: "c" })
  code: number = 0;

  @Expose({ name: "t" })
  tick: number = 0;
}

export class Message {
  @Expose({ name: "m" })
  @Type(() => MetaData)
  meta: MetaData = new MetaData();
  @Expose({ name: "d" })
  @Type((options) => {
    // Look into the raw object's 'm.c' (meta.code) to decide the type
    const code = options?.newObject?.meta?.code;
    switch (code) {
      case OpCode.PLAYER_JOIN:
        return PlayerJoinMessage;
      case OpCode.PLAYER_INPUT:
        return PlayerInputMessage;
      case OpCode.SYNC_GAME_STATE:
        return Aggregator;
      default:
        return Object; // Fallback
    }
  })
  @Transform(({ obj }) => {
    return Array.isArray(obj.d) ? obj.d[1] : obj.d;
  })
  data: any;
}

export type AnyMessage = {
  [K in keyof IMessageMap]: Message;
}[keyof IMessageMap];

export const serializeMessage = (message: Message) => {
  const raw = instanceToPlain(message);
  console.log("message encoded", raw);
  return encode(raw);
};

export const deserializeMessage = (
  data: Uint8Array<ArrayBuffer>,
): AnyMessage | null => {
  try {
    const raw = decode(data) as any;
    console.log("raw decoded", raw);

    if (!raw.m || typeof raw.m.c !== "number") {
      return null;
    }

    const message: Message = plainToInstance(Message, raw);

    console.log("message decoded", message);

    return message;
  } catch (e) {
    return null;
  }
};
