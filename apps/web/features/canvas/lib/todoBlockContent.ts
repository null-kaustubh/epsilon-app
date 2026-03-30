import { nanoid } from "nanoid";

export type TodoItem = {
  id: string;
  text: string;
  done: boolean;
};

export type TodoBlockPayload = {
  title: string;
  items: TodoItem[];
};

export function defaultTodoBlockPayload(): TodoBlockPayload {
  return { title: "Todo list", items: [] };
}

export function parseTodoBlockContent(raw: string): TodoBlockPayload {
  if (!raw.trim()) return defaultTodoBlockPayload();
  try {
    const p = JSON.parse(raw) as Partial<TodoBlockPayload>;
    if (typeof p.title === "string" && Array.isArray(p.items)) {
      return {
        title: p.title,
        items: p.items.map((i) => ({
          id: typeof i?.id === "string" ? i.id : nanoid(),
          text: typeof i?.text === "string" ? i.text : "",
          done: Boolean(i?.done),
        })),
      };
    }
  } catch {
    /* ignore */
  }
  return defaultTodoBlockPayload();
}

export function newTodoItem(): TodoItem {
  return { id: nanoid(), text: "", done: false };
}
