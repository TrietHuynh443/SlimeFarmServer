import * as net from "net";
import { EventManager } from "../events/event.manager";
import { PlayerConnectedEvent } from "../events/event.network";
import { EventType } from "../events/event";
import { ConnectionInfo } from "../models/connection";

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    console.log(`[Server] Received: ${data.toString()}`);
    socket.write(Buffer.alloc(1, 1));
  });
});

server.on("connection", async (socket) => {
  const clientIp = socket.remoteAddress;
  const clientPort = socket.remotePort;
  const clientFamily = socket.remoteFamily;
  EventManager.Publish<PlayerConnectedEvent>(
    EventType.PlayerConnectedEvent,
    new PlayerConnectedEvent(
      {
        address: { ipAddress: clientIp, port: clientPort },
      } as ConnectionInfo,
      "1",
    ),
  );
  console.log(`Connection from ${clientIp}:${clientPort} (${clientFamily})`);
});

server.listen(7778, "0.0.0.0", () => {
  console.log(`[Server] Listening on 0.0.0.0:7778`);
});
