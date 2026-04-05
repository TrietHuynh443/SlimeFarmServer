export enum ActionType {
  MOVE = 1,
  CAST = 2,
}

export interface IActionMap {
  [ActionType.MOVE]: IMoveAction;
  [ActionType.CAST]: ICastAction;
}

export interface IMoveAction {
  horizontal: number;
  vertical: number;
}
export interface ICastAction {}

export type AnyAction = {
  [K in keyof IActionMap]: IActionMap[K];
}[keyof IActionMap];

export interface Action<T extends keyof IActionMap> {
  payload: IActionMap[T];
}

export const createDefaultActionPayload = (
  type: ActionType,
): AnyAction | null => {
  switch (type) {
    case ActionType.MOVE: {
      return { horizontal: 0, vertical: 0 } as IMoveAction;
    }
    case ActionType.CAST: {
      return {} as ICastAction;
    }
    default:
      return null;
  }
};
