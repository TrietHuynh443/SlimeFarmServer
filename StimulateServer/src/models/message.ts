import { encode, decode } from "@msgpack/msgpack";
import { Aggregator } from "./aggregator";
import "reflect-metadata";
import {
  InputType,
  PlayerInputMessage,
  PlayerJoinMessage,
  PlayerLeaveMessage,
} from "./message.event";
import {
  compressObject,
  createCompressionTable,
  decompressObject,
} from "jsonschema-key-compression";
import { GameJsonSchema, MetaSchema } from "../schema/additionalSchema";

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
  [OpCode.SYNC_CLOCK]: null;
  [OpCode.PLAYER_INPUT]: PlayerInputMessage;
}

export interface MetaData {
  code: number;
  tick: number;
}

export interface IMessage<T extends keyof IMessageMap> {
  meta: MetaData;
  data: IMessageMap[T];
}

export type AnyMessage = {
  [K in keyof IMessageMap]: IMessage<K>;
}[keyof IMessageMap];

export const MessageSchemas: Record<OpCode, GameJsonSchema | null> = {
  [OpCode.PLAYER_JOIN]: {
    type: "object",
    properties: { roomId: { type: "string" }, playerId: { type: "string" } },
    title: "PlayerJoinMessage",
  },
  [OpCode.PLAYER_LEAVE]: {
    type: "object",
    properties: { roomId: { type: "string" }, playerId: { type: "string" } },
    title: "PlayerLeaveMessage",
  },
  [OpCode.PLAYER_INPUT]: {
    type: "object",
    properties: {
      input: {
        type: "integer",
        enum: Object.values(InputType).filter((v) => typeof v === "number"),
      },
    },
    required: ["input"],
    title: "PlayerInputMessage",
  },
  [OpCode.SYNC_GAME_STATE]: {
    type: "object",
    additionalProperties: false,
    properties: {
      playerStates: {
        type: "array",
        items: {
          additionalProperties: false,
          properties: {
            id: {
              type: "string",
            },
            position: {
              items: {
                type: "number",
              },
              type: "array",
            },
          },
          required: ["id", "position"],
          type: "object",
        },
      },
    },
    title: "GameData",
    required: ["playerStates"],
  },
  [OpCode.SYNC_CLOCK]: null,
};

const MetaCompressionTable = createCompressionTable(MetaSchema);

const CompressionTables = Object.entries(MessageSchemas).reduce(
  (acc, [op, schema]) => {
    if (schema) {
      const numericKey = Number(op);
      acc[numericKey as OpCode] = createCompressionTable(schema);
    }
    return acc;
  },
  {} as Partial<Record<OpCode, any>>,
);

export const serializeMessage = <T extends keyof IMessageMap>(
  message: IMessage<T>,
): Uint8Array<ArrayBuffer> => {
  const opCode = message.meta.code;
  const table = CompressionTables[opCode as OpCode];
  if (table) {
    const plainObject = {
      meta: {},
      data: {},
    };
    if (message.data) {
      plainObject.data = compressObject(table, message.data);
    }
    plainObject.meta = compressObject(MetaCompressionTable, message.meta);

    return encode(plainObject);
  }

  return encode(message);
};

export const deserializeMessage = (
  data: Uint8Array<ArrayBuffer>,
): AnyMessage | null => {
  try {
    const decoded = decode(data) as AnyMessage;
    const res = { meta: { code: -1 }, data: {} };
    res.meta = decompressObject(MetaCompressionTable, decoded.meta) as MetaData;
    if (!res.meta || typeof res.meta.code !== "number") {
      return null;
    }

    const table = CompressionTables[res.meta.code as OpCode];
    if (table && decoded.data) {
      res.data = decompressObject(table, decoded.data);
    }

    console.log("decoded", res);

    return res as AnyMessage;
  } catch (e) {
    console.error("decode exception", e);
    return null;
  }
};
