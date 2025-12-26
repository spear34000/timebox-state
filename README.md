# stend-history

Undo/redo history helper for [`stend`](https://www.npmjs.com/package/stend) stores. It listens to store updates, captures snapshots, and lets you travel through time without touching the store’s internals.

`stend` 스토어를 위한 되돌리기/다시하기 히스토리 헬퍼입니다. 스토어 변경을 구독해 스냅샷을 쌓고, 스토어 내부를 건드리지 않고 시간 여행을 할 수 있게 만듭니다.

## 설치 / Installation

```bash
npm install stend-history
```

## 사용법 / Usage

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

## 특징 / Why this approach

- Subscribe-only: no changes to Stend’s API surface  
  구독 기반으로 Stend API를 침범하지 않습니다.
- Silent apply to prevent feedback loops  
  silent 옵션으로 피드백 루프를 차단합니다.
- Snapshot-based, ready to ship as an independent package  
  스냅샷 기반이라 바로 패키지로 배포할 수 있습니다.
