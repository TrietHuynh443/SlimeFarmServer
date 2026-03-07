import dgram, { Socket } from "node:dgram";
import { handleMessage } from "./handlers/message.handler";
import { deserializeMessage } from "./models/message";

let SOCKET_INSTANCE: Socket | null = null;

export const getSocketInstance = (): Socket => {
  if (!SOCKET_INSTANCE) {
    SOCKET_INSTANCE = dgram.createSocket("udp4");

    SOCKET_INSTANCE.on("error", (err) => {
      console.error(`UDP Server Error:\n${err.stack}`);
      SOCKET_INSTANCE?.close();
    });

    SOCKET_INSTANCE.on("message", (raw, rinfo) => {
      const message = deserializeMessage(raw);
      if (!message) return;
      handleMessage(message);
      console.log(`server got: ${raw} from ${rinfo.address}:${rinfo.port}`);
    });

    SOCKET_INSTANCE.on("listening", () => {
      const address = SOCKET_INSTANCE?.address();
      console.log(`server listening ${address?.address}:${address?.port}`);
    });
  }
  return SOCKET_INSTANCE;
};
