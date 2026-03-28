import { getUDPSocketInstance } from "./network/socket.udp";
import { getWorldAsync } from "./services/rapierService";
import { GameController } from "./controllers/controller.game";
import { ConnectionController } from "./controllers/controller.connection";
import { IMessage, OpCode } from "./models/message";

const port = 7777;

let currentTick: number = 0;
const gameController = new GameController();
const connectionController = new ConnectionController();
const socket = getUDPSocketInstance();
function update() {
  ++currentTick;
  for (let roomId of gameController.RoomIterator()) {
    const gameData = gameController.GetGameData(roomId);

    if (!gameData) continue;
    const message = {
      meta: {
        code: OpCode.SYNC_GAME_STATE,
        tick: currentTick,
      },
      data: gameData,
    } as IMessage<OpCode.SYNC_GAME_STATE>;
    connectionController.BroadcastToRoom(roomId, message, socket);
  }
  // console.log(`[WORLD UPDATE] at ${currentTick}`);
}

async function setupPhysics() {
  await getWorldAsync();
  setInterval(() => {
    update();
  }, 50);
}

setupPhysics().then(() => {
  const server = getUDPSocketInstance();
  server.bind(port);
});
