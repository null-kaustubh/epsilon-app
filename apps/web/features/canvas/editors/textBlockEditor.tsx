"use client";

import { useEffect, useRef, useState } from "react";
import { BaseEditorProps } from "../lib/blockRegistry";

export default function TextBlockEditor({
  value,
  blockStyle,
  onChangeAction,
  onGrowAction,
  onRequestCloseAction,
}: BaseEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [draftValue, setDraftValue] = useState(() => value);

  const selectionRef = useRef<{ start: number; end: number } | null>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
    onGrowAction(el.scrollHeight);

    el.focus();
    el.setSelectionRange(el.value.length, el.value.length);
  }, [onGrowAction]);

  useEffect(() => {
    const el = textareaRef.current;
    const selection = selectionRef.current;

    if (!el || !selection) return;

    el.setSelectionRange(selection.start, selection.end);
  }, [draftValue]);

  return (
    <div className="relative w-full">
      <textarea
        ref={textareaRef}
        value={draftValue}
        onChange={(e) => {
          const el = e.target;

          selectionRef.current = {
            start: el.selectionStart,
            end: el.selectionEnd,
          };

          el.style.height = "auto";
          el.style.height = el.scrollHeight + "px";

          setDraftValue(el.value);
          onChangeAction(el.value);
          onGrowAction(el.scrollHeight);
        }}
        onBlur={onRequestCloseAction}
        onKeyDown={(e) => {
          if (e.key === "Escape") onRequestCloseAction();
        }}
        className="block-editor w-full resize-none overflow-hidden bg-transparent p-4 text-sm leading-5 text-foreground whitespace-pre-wrap wrap-break-word outline-none"
        style={{
          height: "auto",
          fontSize: blockStyle?.fontSize,
          color: blockStyle?.color,
        }}
        spellCheck={false}
        aria-label="Text block"
      />
    </div>
  );
}
