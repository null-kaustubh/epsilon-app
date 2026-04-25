"use client";

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { BaseEditorProps } from "../lib/blockRegistry";
import type { MarkdownEditorHandle } from "../components/blockEditToolbar";

const MarkdownBlockEditor = forwardRef<MarkdownEditorHandle, BaseEditorProps>(
  function MarkdownBlockEditor(
    { value, blockStyle, onChangeAction, onGrowAction, onRequestCloseAction },
    ref,
  ) {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const [draftValue, setDraftValue] = useState(value);

    useEffect(() => {
      setDraftValue(value);
    }, [value]);

    const autoResize = useCallback(() => {
      const el = textareaRef.current;
      if (!el) return;

      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";

      onGrowAction(el.scrollHeight);
    }, [onGrowAction]);

    useEffect(() => {
      autoResize();
    }, [draftValue, autoResize]);

    useEffect(() => {
      const el = textareaRef.current;
      if (!el) return;

      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    }, []);

    const wrapSelection = (wrapper: string) => {
      const el = textareaRef.current;
      if (!el) return;

      const start = el.selectionStart ?? 0;
      const end = el.selectionEnd ?? 0;

      const before = draftValue.slice(0, start);
      const selected = draftValue.slice(start, end);
      const after = draftValue.slice(end);

      const wl = wrapper.length;
      const hasWrapBefore = draftValue.slice(start - wl, start) === wrapper;
      const hasWrapAfter = draftValue.slice(end, end + wl) === wrapper;

      if (hasWrapBefore && hasWrapAfter) {
        // already wrapped → remove
        const next =
          draftValue.slice(0, start - wl) +
          selected +
          draftValue.slice(end + wl);
        setDraftValue(next);
        onChangeAction(next);
        requestAnimationFrame(() => {
          el.setSelectionRange(start - wl, start - wl + selected.length);
        });
        return;
      }

      // not wrapped → add
      const next = before + wrapper + selected + wrapper + after;
      setDraftValue(next);
      onChangeAction(next);
      requestAnimationFrame(() => {
        el.setSelectionRange(start + wl, start + wl + selected.length);
      });
    };

    const insertAtLineStart = (prefix: string) => {
      const el = textareaRef.current;
      if (!el) return;

      const start = el.selectionStart ?? 0;
      const before = draftValue.slice(0, start);

      const lineStart = before.lastIndexOf("\n") + 1;

      const next =
        draftValue.slice(0, lineStart) + prefix + draftValue.slice(lineStart);

      setDraftValue(next);
      onChangeAction(next);

      requestAnimationFrame(() => {
        el.setSelectionRange(start + prefix.length, start + prefix.length);
      });
    };

    useImperativeHandle(ref, () => ({ wrapSelection, insertAtLineStart }));

    return (
      <div className="relative w-full">
        <textarea
          ref={textareaRef}
          value={draftValue}
          onChange={(e) => {
            const next = e.target.value;
            setDraftValue(next);
            onChangeAction(next);

            // 🔥 resize immediately on typing
            e.target.style.height = "auto";
            e.target.style.height = e.target.scrollHeight + "px";
          }}
          onBlur={onRequestCloseAction}
          onKeyDown={(e) => {
            if (e.key === "Escape") onRequestCloseAction();

            const key = e.key.toLowerCase();
            const isCmd = e.ctrlKey || e.metaKey;

            if (isCmd && key === "b") {
              e.preventDefault();
              wrapSelection("**");
            }

            if (isCmd && key === "i") {
              e.preventDefault();
              wrapSelection("*");
            }

            if (isCmd && key === "e") {
              e.preventDefault();
              wrapSelection("`");
            }

            if (isCmd && key === "1") {
              e.preventDefault();
              insertAtLineStart("# ");
            }

            if (isCmd && key === "2") {
              e.preventDefault();
              insertAtLineStart("## ");
            }

            if (isCmd && e.shiftKey && key === "l") {
              e.preventDefault();
              insertAtLineStart("- ");
            }
          }}
          className="block-editor w-full resize-none overflow-hidden bg-transparent p-4 text-sm leading-5 text-foreground whitespace-pre-wrap wrap-break-word outline-none"
          style={{
            height: "auto",
            fontSize: blockStyle?.fontSize,
            color: blockStyle?.color,
          }}
          spellCheck={false}
          aria-label="Markdown block"
        />
      </div>
    );
  },
);

export default MarkdownBlockEditor;
