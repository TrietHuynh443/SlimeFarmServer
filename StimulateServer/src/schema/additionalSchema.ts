import { JsonSchema } from "jsonschema-key-compression";

export interface GameJsonSchema extends JsonSchema {
  title: string;
}

export const MetaSchema: GameJsonSchema = {
  type: "object",
  properties: { code: { type: "integer" }, tick: { type: "integer" } },
  required: ["code", "tick"],
  title: "Meta",
};

export const PlayerStateSchema: GameJsonSchema = {
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
  title: "PlayerState",
};
