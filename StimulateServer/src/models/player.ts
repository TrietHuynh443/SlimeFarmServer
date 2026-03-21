import { Expose } from "class-transformer";

export class PlayerState {
  @Expose({ name: "id" })
  id: string = "";
  @Expose({ name: "p" })
  position: number[] = [0, 0];

  public constructor(pid: string, pos: number[]) {
    this.id = pid;
    this.position = pos;
  }
}

export interface PlayerAddresses {
  ipAddress: string;
  port: number;
}

export interface ConnectionInfo {
  address: PlayerAddresses;
}
