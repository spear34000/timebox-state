import { describe, expect, it, vi } from "vitest";
import { createHistory } from "../src/history";

type Listener<T> = (next: T, prev: T) => void;

function createStore<T>(initial: T) {
  let state = initial;
  const listeners = new Set<Listener<T>>();

  return {
    get: () => state,
    set: (next: T) => {
      const prev = state;
      state = next;
      listeners.forEach((l) => l(next, prev));
    },
    subscribe: (fn: Listener<T>) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}

describe("createHistory", () => {
  it("records snapshots and performs undo/redo", () => {
    const store = createStore({ count: 0 });
    const history = createHistory(store);

    store.set({ count: 1 });
    store.set({ count: 2 });

    expect(store.get().count).toBe(2);

    history.undo();
    expect(store.get().count).toBe(1);

    history.redo();
    expect(store.get().count).toBe(2);
  });

  it("jumps to arbitrary snapshot and clears future", () => {
    const store = createStore({ count: 0 });
    const history = createHistory(store);

    store.set({ count: 1 });
    store.set({ count: 2 });
    store.set({ count: 3 });

    // Jump to the first recorded snapshot (count: 1)
    history.jump(1);
    expect(store.get().count).toBe(1);

    // After jump, redo should move forward along the rebuilt future timeline
    history.redo();
    expect(store.get().count).toBe(2);
  });

  it("respects max history length", () => {
    const store = createStore({ count: 0 });
    const history = createHistory(store, { max: 2 });

    store.set({ count: 1 });
    store.set({ count: 2 });
    store.set({ count: 3 });

    const snapshots = history.list().past.map((s) => s.state.count);
    expect(snapshots).toEqual([1, 2]); // oldest (0) is evicted because max = 2
  });

  it("skips recording when shouldRecord returns false", () => {
    const store = createStore({ count: 0 });
    const history = createHistory(store, {
      shouldRecord: (next, prev) => next.count !== prev.count,
    });

    store.set({ count: 0 });
    expect(history.list().past).toHaveLength(0);

    store.set({ count: 1 });
    expect(history.list().past).toHaveLength(1);
  });

  it("uses custom clone function when provided", () => {
    const cloneSpy = vi.fn(<T,>(state: T) => ({ ...(state as any) }));
    const store = createStore({ count: 0 });
    const history = createHistory(store, { clone: cloneSpy });

    store.set({ count: 1 });
    store.set({ count: 2 });
    history.undo();
    history.redo();

    expect(cloneSpy).toHaveBeenCalled();
    expect(cloneSpy.mock.calls.length).toBeGreaterThanOrEqual(5);
    expect(store.get().count).toBe(2);
  });
});
