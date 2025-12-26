# stend-history

독립적인 상태 히스토리 유틸리티입니다. `get / set / subscribe` 인터페이스를 가진 어떤 스토어든 연결해 스냅샷 기반의 되돌리기(undo) · 다시하기(redo) · 타임라인 점프(jump)를 제공합니다. 스토어 구현이나 이름에 종속되지 않으며, 필요하면 Stend 같은 스토어도 그대로 사용할 수 있습니다.

## 특징
- 스냅샷 기반 타임트래블: undo/redo/jump, 현재 스냅샷 라벨링, past/future 초기화
- 비침습적: 스토어의 기존 API(`get / set / subscribe`)만 사용
- 확장 옵션: `max`(보관 개수), `shouldRecord`(필터), `clone`(커스텀 복제)로 세밀한 제어
- 타입 안전: TypeScript 기반

## 설치

```bash
npm install stend-history
```

## 빠른 시작

```ts
import { createHistory } from "stend-history";

// get / set / subscribe를 제공하는 스토어라면 무엇이든 사용 가능합니다.
const store = createStore({ count: 0 }); // 예시

const history = createHistory(store, {
  max: 100,
  shouldRecord: (next, prev) => next.count !== prev.count,
  clone: (state) => structuredClone(state),
});

store.set({ count: 1 });
store.set({ count: 2 });

history.undo(); // count: 1
history.redo(); // count: 2

history.jump(0); // 최초 스냅샷으로 이동
history.mark("초기 상태");

console.log(history.list()); // { past, present, future }
```

## API

### `createHistory(store, options?)`
- `store`: `{ get(): T; set(state: T, options?: any): void; subscribe(fn: (next: T, prev: T) => void): () => void; }`
- `options.max` (`number`, 기본 100): 보관할 과거 스냅샷 최대 개수
- `options.shouldRecord` (`(next, prev) => boolean`): `false`를 반환하면 스냅샷을 만들지 않음
- `options.clone` (`(state) => state`): 커스텀 복제 함수. `Map`, 함수 등 JSON 직렬화가 어려운 상태를 다룰 때 사용

### 컨트롤러 메서드
- `undo() / redo()`: 과거·미래 스냅샷으로 이동
- `jump(index: number)`: `past + present + future` 통합 타임라인에서 인덱스로 이동
- `mark(label: string)`: 현재 스냅샷에 라벨 추가
- `clear()`: `past`와 `future` 초기화(현재 유지)
- `list()`: `{ past, present, future }` 반환
- `current()`: 현재 스냅샷 반환

## 주의 사항
- `max`를 초과하면 가장 오래된 `past` 스냅샷부터 FIFO로 제거됩니다.
- 복제 방식은 기본 `structuredClone` → JSON fallback 순서입니다. 비직렬화 값이 있다면 `clone` 옵션을 제공하세요.

## 라이선스

GNU General Public License v3.0 (GPL-3.0). 상업적 이용은 가능하지만, 프로그램을 변경·배포할 경우 동일한 라이선스로 소스 코드를 공개해야 합니다.
