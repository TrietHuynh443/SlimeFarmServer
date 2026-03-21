import { AnyMessage, Message, OpCode } from "../models/message";
import { createPlayer, kickPlayer } from "../services/rapierService";

export const handleMessage = (message: AnyMessage) => {
  switch (message.meta.code) {
    case OpCode.PLAYER_JOIN:
      console.log("on player join: ", JSON.stringify(message));
      createPlayer(
        (message as Message).data.roomId,
        (message as Message).data.playerId,
      );
      break;
    case OpCode.PLAYER_LEAVE:
      kickPlayer(
        (message as Message).data.roomId,
        (message as Message).data.playerId,
      );
      break;
  }
};
