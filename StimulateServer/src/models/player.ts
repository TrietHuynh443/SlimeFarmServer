export interface PlayerState {
  id: string;
  position: {
    x: number;
    y: number;
  };
}

export interface PlayerAddresses {
  ipAddress: string;
  port: number;
}

export interface Player {
  address: PlayerAddresses;
  state: PlayerState;
}
