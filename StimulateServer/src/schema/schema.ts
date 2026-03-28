import {
  createCompressedJsonSchema,
  createCompressionTable,
} from "jsonschema-key-compression";
import { writeFile } from "node:fs";
import path from "node:path";
import { MessageSchemas } from "../models/message";
import { GameJsonSchema, MetaSchema } from "./additionalSchema";
const sharedOutput =
  "/Users/inceptech/Netcode/Client/SlimeFarm/SlimeFarm/Assets/JSON";

const exportSchema = (data: GameJsonSchema) => {
  const compressedSchema = createCompressedJsonSchema(
    createCompressionTable(data),
    data,
  );
  const res = { ...compressedSchema, title: data.title };

  writeFile(
    path.join(sharedOutput, `${data.title}.json`),
    JSON.stringify(data),
    (err) => {
      console.error(err);
    },
  );
  writeFile(
    path.join(sharedOutput, `${data.title}-compressed.json`),
    JSON.stringify(res),
    (err) => {
      console.error(err);
    },
  );
};

Object.values(MessageSchemas).forEach(
  (schema) => schema && exportSchema(schema),
);

exportSchema(MetaSchema);
