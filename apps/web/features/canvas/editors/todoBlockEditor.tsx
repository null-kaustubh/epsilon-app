"use client";

import { Pencil, Plus, Trash } from "phosphor-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { BaseEditorProps } from "../lib/blockRegistry";
import {
  newTodoItem,
  parseTodoBlockContent,
  type TodoBlockPayload,
} from "../lib/todoBlockContent";

export default function TodoBlockEditor({
  value,
  blockStyle,
  onChangeAction,
  onGrowAction,
  onRequestCloseAction,
}: BaseEditorProps) {
  const [payload, setPayload] = useState<TodoBlockPayload>(() =>
    parseTodoBlockContent(value),
  );
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setPayload(parseTodoBlockContent(value));
  }, [value]);

  const persist = useCallback(
    (next: TodoBlockPayload) => {
      setPayload(next);
      onChangeAction(JSON.stringify(next));
    },
    [onChangeAction],
  );

  const measure = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    onGrowAction(el.scrollHeight);
  }, [onGrowAction]);

  useEffect(() => {
    measure();
  }, [payload, measure]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onOut = (e: FocusEvent) => {
      const next = e.relatedTarget as Node | null;
      if (next && el.contains(next)) return;
      onRequestCloseAction();
    };
    el.addEventListener("focusout", onOut);
    return () => el.removeEventListener("focusout", onOut);
  }, [onRequestCloseAction]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onRequestCloseAction();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onRequestCloseAction]);

  const addItem = () => {
    persist({ ...payload, items: [...payload.items, newTodoItem()] });
  };

  const removeItem = (id: string) => {
    persist({
      ...payload,
      items: payload.items.filter((i) => i.id !== id),
    });
  };

  const updateItem = (
    id: string,
    patch: Partial<{ text: string; done: boolean }>,
  ) => {
    persist({
      ...payload,
      items: payload.items.map((i) => (i.id === id ? { ...i, ...patch } : i)),
    });
  };

  return (
    <div
      ref={containerRef}
      className="block-editor flex h-full min-h-0 flex-col overflow-hidden rounded-lg bg-secondary p-1"
    >
      <header className="shrink-0 border-b border-border px-3 py-1.5 flex items-center">
        <input
          type="text"
          value={payload.title}
          onChange={(e) => persist({ ...payload, title: e.target.value })}
          className="block-editor w-full bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground"
          style={{ fontSize: blockStyle?.fontSize, color: blockStyle?.color }}
          placeholder="List name"
          spellCheck={false}
          aria-label="Todo block title"
        />
        <Pencil size={16} />
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-auto p-2">
        {payload.items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No items yet.</p>
        ) : (
          payload.items.map((item) => (
            <div key={item.id} className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={item.done}
                onChange={(e) =>
                  updateItem(item.id, { done: e.target.checked })
                }
                className="block-editor mt-0.5 size-3.5 shrink-0 rounded border border-accent/50
                            bg-transparent
                            appearance-none
                            checked:bg-accent
                            relative
                          "
                aria-label="Done"
              />
              <input
                type="text"
                value={item.text}
                onChange={(e) => updateItem(item.id, { text: e.target.value })}
                className={`block-editor min-w-0 flex-1 bg-transparent text-sm leading-5 outline-none ${
                  item.done
                    ? "text-muted-foreground line-through"
                    : "text-foreground"
                }`}
                style={{ fontSize: blockStyle?.fontSize, color: blockStyle?.color }}
                placeholder="Todo…"
                spellCheck={false}
                aria-label="Todo text"
              />
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="block-editor mt-0.5 shrink-0 rounded p-1 text-muted-foreground hover:bg-muted hover:text-destructive"
                aria-label="Remove todo"
              >
                <Trash size={14} />
              </button>
            </div>
          ))
        )}

        <button
          type="button"
          onClick={addItem}
          className="block-editor mt-1 flex w-fit items-center gap-1 rounded-md border border-dashed border-border px-2 py-1 text-xs text-muted-foreground hover:border-accent hover:bg-muted/30 hover:text-foreground"
        >
          <Plus size={13} />
          add todo
        </button>
      </div>
    </div>
  );
}
