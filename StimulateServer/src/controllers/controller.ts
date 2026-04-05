import { ConnectionController } from "./controller.connection";
import { GameController } from "./controller.game";

let isCreated = false;

const createControllers = () => {
  if (isCreated) return;

  isCreated = true;
  new GameController();
  new ConnectionController();
};

export { createControllers };
