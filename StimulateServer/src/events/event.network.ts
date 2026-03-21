import { ConnectionInfo } from "../models/player";
import { BaseEvent } from "./event";

export class PlayerConnectedEvent extends BaseEvent {
  constructor(
    public playerConnectionInfo: ConnectionInfo,
    public roomId: string,
  ) {
    super();
  }
}
