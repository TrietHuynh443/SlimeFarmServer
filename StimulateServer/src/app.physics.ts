import { getSocketInstance } from "./socket.udp";
import { IMessage, OpCode, serializeMessage } from "./models/message";
import { getWorldAsync } from "./services/rapierService";
import { roomsModel } from "./models/room";
import { gameDataModel } from "./models/aggregator";

const port = 3000;

let currentTick: number = 0;

function update() {
  if (roomsModel.length === 0) return;
  ++currentTick;
  roomsModel.forEach((room) => {
    const gameData = gameDataModel.get(room.id);

    if (!gameData) return;

    const message = {
      meta: {
        code: OpCode.SYNC_GAME_STATE,
        tick: currentTick,
      },
      data: gameData,
    } as IMessage<OpCode.SYNC_GAME_STATE>;

    const buffer = serializeMessage(message);

    const players = room.players;
    const len = players.length;

    for (let i = 0; i < len; i++) {
      const addr = players[i]?.address;
      if (!addr) continue;
      getSocketInstance().send(buffer, addr.port, addr.ipAddress);
    }
  });
  console.log(`sync data to ${roomsModel.length} rooms`);
}

async function setupPhysics() {
  await getWorldAsync();

  setInterval(() => {
    update();
  }, 50);
}

setupPhysics().then(() => {
  const server = getSocketInstance();
  server.bind(port);
});
