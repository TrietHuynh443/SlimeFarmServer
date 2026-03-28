import dgram, { Socket } from "node:dgram";
import { handleMessage } from "../handlers/handler.message";
import { deserializeMessage } from "../models/message";

let SOCKET_INSTANCE: Socket | null = null;

export const getUDPSocketInstance = (): Socket => {
  if (!SOCKET_INSTANCE) {
    SOCKET_INSTANCE = dgram.createSocket("udp4");

    SOCKET_INSTANCE.on("error", (err) => {
      console.error(`UDP Server Error:\n${err.stack}`);
      SOCKET_INSTANCE?.close();
    });

    SOCKET_INSTANCE.on("message", (raw, rinfo) => {
      console.log("[MESSAGE] received from ", rinfo.address, rinfo.port);
      const message = deserializeMessage(raw);
      if (!message) return;
      handleMessage(message, rinfo.address, rinfo.port);
      console.log(`server got: ${message} from ${rinfo.address}:${rinfo.port}`);
    });

    SOCKET_INSTANCE.on("listening", () => {
      const address = SOCKET_INSTANCE?.address();
      console.log(`server listening ${address?.address}:${address?.port}`);
    });
  }
  return SOCKET_INSTANCE;
};
