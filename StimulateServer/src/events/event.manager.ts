import { BaseEvent, EventType } from "./event";

export class EventManager {
  private static eventMap = new Map<string, ((e: any) => void)[]>();
  public static Register<T extends BaseEvent>(
    eventType: EventType,
    callback: (e: T) => void,
  ): void {
    if (!EventManager.eventMap.has(eventType)) {
      this.eventMap.set(eventType, []);
    }
    this.eventMap.get(eventType)?.push(callback);
  }

  public static Unregister<T extends BaseEvent>(
    eventType: EventType,
    callback: (e: T) => void,
  ): void {
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

  public static Publish<T extends BaseEvent>(
    eventType: EventType,
    data: T,
  ): void {
    const callbacks = this.eventMap.get(eventType);
    console.log(
      `[EVT MANAGER] published event: ${eventType} ${JSON.stringify(data)}`,
    );

    if (callbacks) {
      callbacks.forEach((cb) => cb(data));
    }
  }
}
