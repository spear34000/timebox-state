# stend-history

Undo/redo history helper for [`stend`](https://www.npmjs.com/package/stend) stores. It listens to store updates, captures snapshots, and lets you travel through time without touching the store’s internals.  
`stend` 스토어를 위한 되돌리기/다시하기 히스토리 헬퍼입니다. 스토어 변경을 구독해 스냅샷을 쌓고, 스토어 내부를 건드리지 않고 시간 여행을 할 수 있게 만듭니다.

- Snapshot-based history with undo/redo/jump
- Works with any Stend store shape—no schema required
- Avoids feedback loops via silent writes

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

## API

### `createHistory(store, options?)`
- `store`: `{ get(): T; set(state: T, options?: any): void; subscribe(fn: (next: T, prev: T) => void): () => void; }`
- `options.max`: `number` (default: `100`) — 최대 보관할 과거 스냅샷 개수

### Controller methods
- `undo() / redo()`: 이동 가능할 때만 현재 스냅샷을 과거/미래로 이동
- `jump(index: number)`: `past + present + future` 전체 배열에서 지정 인덱스로 이동
- `mark(label: string)`: 현재 스냅샷에 라벨 추가
- `clear()`: `past`와 `future`를 모두 비움(현재 상태 유지)
- `list()`: `{ past, present, future }` 반환
- `current()`: 현재 스냅샷 반환

모든 이동은 내부적으로 `store.set(..., { silent: true })`로 적용되어 구독 루프를 방지합니다.

## 작동 방식 / How it works
1) 스토어 변경을 구독하고, 변경 시 현재 스냅샷을 `past`에 쌓은 뒤 새 스냅샷을 `present`로 설정합니다.  
2) `max`를 넘어가는 오래된 `past` 항목은 FIFO로 제거됩니다.  
3) `undo/redo/jump`는 `silent` 플래그를 사용해 재적용하면서 스냅샷 간 이동을 안전하게 수행합니다.

## 주의 사항 / Notes
- 상태에 함수나 `Map`/`Set` 등 `structuredClone`이 지원하지 않는 값이 있으면 JSON 복제 경로가 깨질 수 있습니다. 브라우저/런타임의 `structuredClone` 지원을 권장합니다.
- 스냅샷은 전체 상태를 복제하므로 대형 상태의 경우 `max`를 조절해 메모리 사용량을 관리하세요.
