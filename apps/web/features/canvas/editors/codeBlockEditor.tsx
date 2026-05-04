"use client";

import { CopySimple, Pencil } from "phosphor-react";
import { useCallback, useEffect, useRef, useState } from "react";
import Editor from "react-simple-code-editor";
import { BaseEditorProps } from "../lib/blockRegistry";
import {
  extFromFilename,
  langFromFilename,
  parseCodeBlockContent,
  type CodeBlockPayload,
} from "../lib/codeBlockContent";
import LanguageBadge from "../lib/languageBadge";
import { highlighterPromise } from "../lib/shiki";

async function highlight(code: string, lang: string): Promise<string> {
  const h = await highlighterPromise;
  const langs = h.getLoadedLanguages();
  const safeLang = langs.includes(lang as never) ? lang : "plaintext";
  return h.codeToHtml(code, {
    lang: safeLang,
    themes: { light: "one-light", dark: "one-dark-pro" },
    defaultColor: false,
  });
}

export default function CodeBlockEditor({
  value,
  onChangeAction,
  onGrowAction,
  onRequestCloseAction,
}: BaseEditorProps) {
  const [payload, setPayload] = useState<CodeBlockPayload>(() =>
    parseCodeBlockContent(value),
  );
  const containerRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [highlightedHtml, setHighlightedHtml] = useState("");

  useEffect(() => {
    setPayload(parseCodeBlockContent(value));
  }, [value]);

  const persist = useCallback(
    (next: CodeBlockPayload) => {
      setPayload(next);
      onChangeAction(JSON.stringify(next));
    },
    [onChangeAction],
  );

  useEffect(() => {
    let cancelled = false;
    const lang = langFromFilename(payload.filename);
    highlight(payload.code, lang).then((html) => {
      if (!cancelled) setHighlightedHtml(html);
    });
    return () => {
      cancelled = true;
    };
  }, [payload.code, payload.filename]);

  const measure = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const prev = el.style.height;
    el.style.height = "auto";
    const measured = el.scrollHeight;
    el.style.height = prev;
    onGrowAction(measured);
  }, [onGrowAction]);

  useEffect(() => {
    measure();
  }, [payload, highlightedHtml, measure]);

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

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(payload.code);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    const textarea = editorRef.current?.querySelector("textarea");
    if (!textarea) return;

    textarea.focus();

    const len = textarea.value.length;
    textarea.setSelectionRange(len, len);
  }, []);

  const ext = extFromFilename(payload.filename);

  return (
    <div
      ref={containerRef}
      className="block-editor flex h-full min-h-0 flex-col overflow-hidden rounded-lg bg-secondary"
    >
      <header className="flex shrink-0 items-center justify-center border-b border-border gap-2 px-3 pt-3 py-1.5">
        <LanguageBadge ext={ext} />
        <div className="flex w-full items-center justify-center">
          <input
            type="text"
            value={payload.filename}
            onChange={(e) => persist({ ...payload, filename: e.target.value })}
            className="block-editor min-w-0 flex-1 text-sm text-foreground outline-none placeholder:text-muted-foreground"
            placeholder="filename.ts"
            spellCheck={false}
            aria-label="Filename"
          />
          <Pencil size={16} />
        </div>
        <button
          type="button"
          onClick={() => void copyCode()}
          className="block-editor flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
          aria-label="Copy code"
        >
          <CopySimple size={16} />
        </button>
      </header>

      <div
        ref={editorRef}
        className="rsce-wrapper min-h-0 flex-1 overflow-auto"
      >
        <Editor
          value={payload.code}
          onValueChange={(code) => persist({ ...payload, code })}
          highlight={() => highlightedHtml}
          padding={{ top: 12, right: 12, bottom: 12, left: 16 }}
          onKeyDown={(e) => {
            if (e.key === "Escape") onRequestCloseAction();
          }}
          style={{
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "14px",
            lineHeight: "22px",
            minHeight: "100%",
          }}
          textareaClassName="block-editor code-editor-textarea outline-none"
          preClassName="rsce-pre"
        />
      </div>
    </div>
  );
}
