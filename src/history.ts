import { clone } from "./clone";
import {
  HistoryController,
  HistoryOptions,
  HistoryState,
  HistoryStore,
  Snapshot,
} from "./types";

export function createHistory<T>(
  store: HistoryStore<T>,
  options: HistoryOptions = {}
): HistoryController<T> {
  const max = options.max ?? 100;
  let id = 0;
  let silent = false;

  const history: HistoryState<T> = {
    past: [],
    present: {
      id: id++,
      timestamp: Date.now(),
      state: clone(store.get()),
    },
    future: [],
  };

  // track changes from the store
  store.subscribe((next) => {
    if (silent) return;

    history.past.push(history.present);

    if (history.past.length > max) {
      history.past.shift();
    }

    history.present = {
      id: id++,
      timestamp: Date.now(),
      state: clone(next),
    };

    history.future = [];
  });

  function apply(snapshot: Snapshot<T>) {
    silent = true;
    store.set(clone(snapshot.state), { silent: true });
    silent = false;
  }

  return {
    undo() {
      if (history.past.length === 0) return;

      history.future.unshift(history.present);
      history.present = history.past.pop()!;
      apply(history.present);
    },

    redo() {
      if (history.future.length === 0) return;

      history.past.push(history.present);
      history.present = history.future.shift()!;
      apply(history.present);
    },

    jump(index: number) {
      const all = [...history.past, history.present, ...history.future];
      const target = all[index];
      if (!target) return;

      history.past = all.slice(0, index);
      history.present = target;
      history.future = all.slice(index + 1);
      apply(target);
    },

    mark(label: string) {
      history.present.label = label;
    },

    clear() {
      history.past = [];
      history.future = [];
    },

    list() {
      return {
        past: history.past,
        present: history.present,
        future: history.future,
      };
    },

    current() {
      return history.present;
    },
  };
}
