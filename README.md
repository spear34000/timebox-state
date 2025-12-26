# stend-history

[`stend`](https://www.npmjs.com/package/stend) 스토어를 위한 되돌리기/다시하기 히스토리 헬퍼입니다. 스토어 변경을 구독해 스냅샷을 쌓고, 스토어 내부를 건드리지 않고 시간 여행을 할 수 있게 만듭니다.

## 설치

```bash
npm install stend-history
```

## 사용법

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

## 특징

- 구독 기반: Stend API를 수정하지 않음
- silent 적용: 피드백 루프 방지
- 스냅샷 기반: 독립 패키지로 즉시 배포 가능
