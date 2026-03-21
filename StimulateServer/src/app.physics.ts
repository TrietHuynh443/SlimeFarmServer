import { getSocketInstance } from "./socket.udp";
import { Message, OpCode, serializeMessage } from "./models/message";
import { getWorldAsync } from "./services/rapierService";
import { gameDataModel } from "./models/aggregator";
import { GameController } from "./controllers/controller.game";

const port = 7777;

let currentTick: number = 0;
const gameController = new GameController();

function update() {
  ++currentTick;
  // roomsModel.forEach((room) => {
  //   const gameData = gameDataModel.get(room.id);

  //   if (!gameData) return;

  //   const message = {
  //     meta: {
  //       code: OpCode.SYNC_GAME_STATE,
  //       tick: currentTick,
  //     },
  //     data: gameData,
  //   } as Message;

  //   const buffer = serializeMessage(message);

  //   const players = room.players;
  //   const len = players.length;

  //   for (let i = 0; i < len; i++) {
  //     const addr = players[i]?.address;
  //     if (!addr) continue;
  //     getSocketInstance().send(buffer, addr.port, addr.ipAddress);
  //   }
  // });
  // if (roomsModel.length > 0)
  //   console.log(`sync data to ${roomsModel.length} rooms`);
}

async function setupPhysics() {
  await getWorldAsync();
  setInterval(() => {
    update();
  }, 500);
}

setupPhysics().then(() => {
  const server = getSocketInstance();
  server.bind(port);
});
