export type EventCallback = (payload: any) => void | Promise<void>;

export class EventBus {
  private static instance: EventBus;
  private listeners: Map<string, EventCallback[]> = new Map();

  private constructor() {}

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  public subscribe(eventType: string, callback: EventCallback): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(callback);
  }

  public publish(eventType: string, payload: any): void {
    const handlers = this.listeners.get(eventType) || [];
    for (const handler of handlers) {
      try {
        const result = handler(payload);
        if (result instanceof Promise) {
          result.catch(err => console.error(`Error in async event handler for ${eventType}:`, err));
        }
      } catch (err) {
        console.error(`Error in event handler for ${eventType}:`, err);
      }
    }
  }

  public clearAll(): void {
    this.listeners.clear();
  }
}
