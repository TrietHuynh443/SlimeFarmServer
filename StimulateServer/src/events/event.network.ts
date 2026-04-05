import { ConnectionInfo } from "../models/connection";
import { BaseEvent } from "./event";

export class PlayerConnectedEvent extends BaseEvent {
  constructor(
    public playerConnectionInfo: ConnectionInfo,
    public roomId: string,
  ) {
    super();
  }
}

export class PlayerHealCheckEvent extends BaseEvent {
  constructor(
    public playerConnectionInfo: ConnectionInfo,
    public roomId: string,
  ) {
    super();
  }
}

export class PlayerDisconnectedEvent extends BaseEvent {
  constructor(
    public playerConnectionInfo: ConnectionInfo,
    public roomId: string,
  ) {
    super();
  }
}
