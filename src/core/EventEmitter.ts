import type { EventsMap } from "@/core/EventsMap";

type EventHandlerDefault = (...args: any[]) => void;
type EventMapBase = Record<string | symbol, EventHandlerDefault>;

export default class EventEmitter<Events extends EventMapBase = EventsMap> {
  private listeners: Map<keyof Events, Set<EventHandlerDefault>> = new Map();

  constructor() {
    this.listeners = new Map();
  }

  on<K extends keyof Events>(event: K, fn: Events[K]): void {
    const listeners = this.listeners.get(event) ?? new Set<EventHandlerDefault>();

    if (!this.listeners.has(event)) {
      this.listeners.set(event, listeners);
    }

    listeners.add(fn);
  }

  off<K extends keyof Events>(event: K, fn: Events[K]): void {
    const listeners = this.listeners.get(event);

    if (!listeners) return;

    listeners.delete(fn);
  }

  emit<K extends keyof Events>(event: K, ...args: Parameters<Events[K]>): void {
    const listeners = this.listeners.get(event);

    if (!listeners) return;

    listeners.forEach((fn) => fn(...args));
  }
}

export const GlobalEventEmitter = new EventEmitter();
