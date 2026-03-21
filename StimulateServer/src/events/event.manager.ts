import { BaseEvent } from "./event";

export class EventManager {
  private static eventMap = new Map<string, ((e: any) => void)[]>();
  public static Register<T extends BaseEvent>(callback: (e: T) => void): void {
    const eventType = nameof<T>();
    if (!EventManager.eventMap.has(eventType)) {
      this.eventMap.set(eventType, []);
    }
    this.eventMap.get(eventType)?.push(callback);
  }

  public static Unregister<T extends BaseEvent>(
    callback: (e: T) => void,
  ): void {
    const eventType = nameof<T>();

    const callbacks = this.eventMap.get(eventType);

    if (callbacks) {
      const filtered = callbacks.filter((cb) => cb !== callback);

      if (filtered.length === 0) {
        this.eventMap.delete(eventType);
      } else {
        this.eventMap.set(eventType, filtered);
      }
    }
  }

  public static Publish<T extends BaseEvent>(data: T): void {
    const eventType = nameof<T>();
    const callbacks = this.eventMap.get(eventType);
    if (callbacks) {
      callbacks.forEach((cb) => cb(data));
    }
  }
}
