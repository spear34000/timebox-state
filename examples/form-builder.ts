import { createHistory } from "../src";

type FieldType = "text" | "email" | "number" | "checkbox";

type Field = {
  id: string;
  label: string;
  type: FieldType;
  required?: boolean;
};

type FormBuilderState = {
  pages: Array<{
    id: string;
    title: string;
    fields: Field[];
  }>;
  theme: {
    primary: string;
    accent: string;
  };
};

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

const store = createStore<FormBuilderState>({
  pages: [
    {
      id: "page-1",
      title: "회원가입",
      fields: [
        { id: "email", label: "이메일", type: "email", required: true },
        { id: "name", label: "이름", type: "text" },
      ],
    },
  ],
  theme: { primary: "#0b6", accent: "#f60" },
});

const history = createHistory(store, {
  max: 50,
  shouldRecord: (next, prev) => JSON.stringify(next) !== JSON.stringify(prev),
});

history.mark("기본 폼");

function addField(pageId: string, field: Field) {
  const pages = store.get().pages.map((page) =>
    page.id === pageId
      ? { ...page, fields: [...page.fields, field] }
      : page
  );

  store.set({ ...store.get(), pages });
  history.mark(`필드 추가: ${field.label}`);
}

function changeTheme(primary: string, accent: string) {
  store.set({ ...store.get(), theme: { primary, accent } });
  history.mark("테마 변경");
}

addField("page-1", { id: "phone", label: "전화번호", type: "text" });
changeTheme("#4a38e6", "#ff8c00");

history.undo(); // 테마 변경을 되돌림
history.undo(); // 전화번호 필드 추가를 되돌림
history.redo(); // 전화번호 필드 다시 추가

console.log(history.list());
