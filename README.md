# stend-history

Undo/redo history helper for [`stend`](https://www.npmjs.com/package/stend) stores. It listens to store updates, captures snapshots, and lets you travel through time without touching the store’s internals.

## Installation

```bash
npm install stend-history
```

## Usage

```ts
import { stend } from "stend";
import { createHistory } from "stend-history";

const store = stend({ count: 0 });

const history = createHistory(store);

store.set({ count: 1 });
store.set({ count: 2 });

history.undo(); // count: 1
history.redo(); // count: 2

history.mark("카운트 증가");
console.log(history.list());
```

## Why this approach

- Subscribe-only: no changes to Stend’s API surface
- Silent apply to prevent feedback loops
- Snapshot-based, ready to ship as an independent package
