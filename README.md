# timebox-state-history

`timebox-state`를 포함한 모든 `get / set / subscribe` 스토어에 바로 붙여 undo / redo / jump 타임트래블을 제공하는 스냅샷 기반 히스토리 유틸리티입니다. 스토어 구현을 바꾸지 않고 상태 히스토리를 추가하세요.

## 특징 / Features
- 스냅샷 기반 undo / redo / jump
- 라벨(`mark`), 과거·미래 초기화(`clear`) 지원
- `max`/`shouldRecord`/`clone` 등 세밀한 옵션
- timebox-state 외에도 어떤 스토어 모양에도 적용 가능

## 설치 / Installation
```bash
npm install timebox-state-history
```

## 빠른 시작 / Quickstart
```ts
import { createHistory } from "timebox-state-history";
import { createState } from "timebox-state";

const store = createState({ count: 0 });

const history = createHistory(store, {
  max: 100,
  shouldRecord: (next, prev) => next.count !== prev.count,
});

store.set({ count: 1 });
store.set({ count: 2 });

history.undo(); // { count: 1 }
history.redo(); // { count: 2 }
history.mark("초기 상태");

console.log(history.list()); // { past, present, future }
```

## 예제 / Example
- 폼 빌더 & UX 프로토타이핑: 필드 추가·삭제와 테마 변경을 히스토리로 관리. [`examples/form-builder.ts`](./examples/form-builder.ts)

## API

### `createHistory(store, options?)`
- `store`: `{ get(): T; set(state: T, options?: any): void; subscribe(fn: (next: T, prev: T) => void): () => void; }`
- `options.max` (`number`, 기본 100): 보관할 과거 스냅샷 최대 개수
- `options.shouldRecord` (`(next, prev) => boolean`): `false` 반환 시 기록 생략
- `options.clone` (`(state) => state`): 커스텀 복제 함수. `Map`/`Set`/함수 등 비직렬화 값이 있을 때 제공

### 컨트롤러 메서드
- `undo() / redo()`: 과거·미래 스냅샷으로 이동
- `jump(index: number)`: `past + present + future` 타임라인 인덱스로 이동
- `mark(label: string)`: 현재 스냅샷에 라벨 추가
- `clear()`: `past`와 `future` 초기화(현재 유지)
- `list()`: `{ past, present, future }` 반환
- `current()`: 현재 스냅샷 반환

## 동작 노트 / Notes
- `max`를 넘으면 가장 오래된 `past`부터 FIFO로 제거됩니다.
- 모든 이동은 `store.set(..., { silent: true })`를 사용해 구독 루프를 막습니다.
- 복제가 필요한 값이 있으면 `clone`을 제공하세요. 기본은 `structuredClone` → JSON fallback입니다.
