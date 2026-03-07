import { AnyMessage, IMessage, OpCode } from "../models/message";
import { createPlayer, kickPlayer } from "../services/rapierService";

export const handleMessage = (message: AnyMessage) => {
  switch (message.meta.code) {
    case OpCode.PLAYER_JOIN:
      createPlayer(
        (message as IMessage<OpCode.PLAYER_JOIN>).data.roomId,
        (message as IMessage<OpCode.PLAYER_JOIN>).data.state,
      );
      break;
    case OpCode.PLAYER_LEAVE:
      kickPlayer(
        (message as IMessage<OpCode.PLAYER_LEAVE>).data.roomId,
        (message as IMessage<OpCode.PLAYER_LEAVE>).data.playerId,
      );
      break;
  }
};
