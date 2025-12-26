import { HistoryStore } from "./types.js";

import { HistoryStore } from "./types";


export type StoreOptions = {
  silent?: boolean;
};

export function createStore<T>(initial: T): HistoryStore<T> {
  let state = initial;
  const listeners = new Set<(next: T, prev: T) => void>();

  return {
    get: () => state,
    set: (next: T, options?: StoreOptions) => {
      const prev = state;
      state = next;
      if (options?.silent) return;
      listeners.forEach((listener) => listener(next, prev));
    },
    subscribe: (fn: (next: T, prev: T) => void) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}
