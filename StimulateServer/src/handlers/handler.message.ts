import { AnyMessage, IMessage, OpCode } from "../models/message";
import { createPlayer, kickPlayer } from "../services/rapierService";

export const handleMessage = (
  message: AnyMessage,
  address: string,
  port: number,
) => {
  console.log("[EVENT] handle message", message.meta.code);

  switch (message.meta.code) {
    case OpCode.PLAYER_JOIN:
      const playerJoinMessage = message as IMessage<OpCode.PLAYER_JOIN>;
      createPlayer(
        playerJoinMessage.data.roomId,
        playerJoinMessage.data.playerId,
        address,
        port,
      );

      break;
    case OpCode.PLAYER_LEAVE:
      const playerLeaveMessage = message as IMessage<OpCode.PLAYER_LEAVE>;

      kickPlayer(
        playerLeaveMessage.data.roomId,
        playerLeaveMessage.data.playerId,
      );
      break;
  }
};
