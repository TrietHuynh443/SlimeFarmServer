import { getUDPSocketInstance } from "./network/socket.udp";
import { rapierService } from "./services/rapierService";
import { WebSocketServer } from "ws";
import { createControllers } from "./controllers/controller";

const port = 7777;
async function setupPhysics() {
  await rapierService.runAsync();
}

setupPhysics().then(() => {
  new WebSocketServer({ host: "0.0.0.0", port: 8080 }, () => {
    console.log("Server is listening on ws://localhost:8080");
  });
  createControllers();
  const server = getUDPSocketInstance();
  server.bind(port);
});
