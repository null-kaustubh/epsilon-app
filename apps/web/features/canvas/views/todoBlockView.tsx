"use client";

import { Plus, Trash } from "phosphor-react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { BaseViewProps } from "../lib/blockRegistry";
import {
  newTodoItem,
  parseTodoBlockContent,
  type TodoBlockPayload,
} from "../lib/todoBlockContent";

export default function TodoBlockView({
  blockId,
  content,
  blockStyle,
  onGrowAction,
  onChangeContentAction,
}: BaseViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const payload = useMemo(() => parseTodoBlockContent(content), [content]);

  const persist = useCallback(
    (next: TodoBlockPayload) => {
      onChangeContentAction?.(JSON.stringify(next));
    },
    [onChangeContentAction],
  );

  const measureAndGrow = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const prev = el.style.height;
    el.style.height = "auto";
    const measured = el.scrollHeight;
    el.style.height = prev;
    onGrowAction(blockId, measured);
  }, [blockId, onGrowAction]);

  useEffect(() => {
    measureAndGrow();
  }, [content, measureAndGrow]);

  const toggle = (id: string) => {
    persist({
      ...payload,
      items: payload.items.map((i) =>
        i.id === id ? { ...i, done: !i.done } : i,
      ),
    });
  };

  const removeItem = (id: string) => {
    persist({
      ...payload,
      items: payload.items.filter((i) => i.id !== id),
    });
  };

  const addItem = () => {
    persist({
      ...payload,
      items: [...payload.items, newTodoItem()],
    });
  };

  const interactive = Boolean(onChangeContentAction);

  return (
    <div
      ref={containerRef}
      className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg bg-secondary select-none p-1"
    >
      <header className="shrink-0 px-2 py-2">
        <span
          className="block truncate text-sm font-medium text-foreground"
          style={{ fontSize: blockStyle?.fontSize, color: blockStyle?.color }}
        >
          {payload.title || "Todo list"}
        </span>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-auto p-2">
        {payload.items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No items yet.</p>
        ) : (
          payload.items.map((item) => (
            <div key={item.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={item.done}
                disabled={!interactive}
                onChange={() => interactive && toggle(item.id)}
                onPointerDown={(e) => e.stopPropagation()}
                className="block-editor size-3.5 shrink-0 rounded-full border border-accent/50
                            bg-transparent
                            appearance-none
                            checked:bg-accent
                            relative disabled:opacity-60"
                aria-label="Done"
              />
              <span
                className={`min-w-0 flex-1 text-sm leading-5 ${
                  item.done
                    ? "text-muted-foreground line-through"
                    : "text-foreground"
                }`}
                style={{
                  fontSize: blockStyle?.fontSize,
                  color: blockStyle?.color,
                }}
              >
                {item.text || "\u00a0"}
              </span>
              {interactive ? (
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="block-editor shrink-0 rounded p-1 text-muted-foreground hover:bg-muted hover:text-destructive"
                  aria-label="Remove todo"
                >
                  <Trash size={14} />
                </button>
              ) : null}
            </div>
          ))
        )}

        {interactive ? (
          <button
            type="button"
            onClick={addItem}
            onPointerDown={(e) => e.stopPropagation()}
            className="block-editor mt-1 flex w-fit items-center gap-1 rounded-md border border-dashed border-border px-2 py-1 text-xs text-muted-foreground hover:border-accent hover:bg-muted/30 hover:text-foreground"
          >
            <Plus size={13} />
            add todo
          </button>
        ) : null}
      </div>
    </div>
  );
}
