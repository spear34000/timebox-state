export type Snapshot<T> = {
  id: number;
  timestamp: number;
  state: T;
  label?: string;
};

export type HistoryState<T> = {
  past: Snapshot<T>[];
  present: Snapshot<T>;
  future: Snapshot<T>[];
};

export type HistoryOptions = {
  max?: number;
};

export type HistoryStore<T> = {
  get(): T;
  set(state: T, options?: unknown): void;
  subscribe(fn: (next: T, prev: T) => void): () => void;
};

export type HistoryController<T> = {
  undo(): void;
  redo(): void;
  jump(index: number): void;
  mark(label: string): void;
  clear(): void;
  list(): HistoryState<T>;
  current(): Snapshot<T>;
};
