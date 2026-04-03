"use client";

import { CopySimple } from "phosphor-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BaseViewProps } from "../lib/blockRegistry";
import {
  extFromFilename,
  langFromFilename,
  parseCodeBlockContent,
} from "../lib/codeBlockContent";
import LanguageBadge from "../lib/languageBadge";
import { highlighterPromise } from "../lib/shiki";

export default function CodeBlockView({
  blockId,
  content,
  onGrowAction,
}: BaseViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const payload = useMemo(() => parseCodeBlockContent(content), [content]);
  const [highlighted, setHighlighted] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    const lang = langFromFilename(payload.filename);
    highlighterPromise.then((h) => {
      const html = h.codeToHtml(payload.code, {
        lang,
        themes: { light: "one-light", dark: "one-dark-pro" },
        defaultColor: false,
      });
      if (!cancelled) setHighlighted(html);
    });
    return () => {
      cancelled = true;
    };
  }, [payload.code, payload.filename]);

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
  }, [content, highlighted, measureAndGrow]);

  const ext = extFromFilename(payload.filename);

  const copyCode = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(payload.code);
    } catch {
      /* ignore */
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg bg-secondary select-none"
    >
      <header className="flex shrink-0 items-center justify-center gap-1 px-3 pt-3 pb-1.5">
        <LanguageBadge ext={ext} />

        <span className="min-w-0 flex-1 truncate text-sm text-foreground">
          {payload.filename || "snippet"}
        </span>
        <button
          type="button"
          onClick={(e) => void copyCode(e)}
          onPointerDown={(e) => e.stopPropagation()}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
          aria-label="Copy code"
        >
          <CopySimple size={16} />
        </button>
      </header>

      <div
        className="shiki-wrapper min-w-0 flex-1 overflow-auto my-3"
        dangerouslySetInnerHTML={{ __html: highlighted }}
      />
    </div>
  );
}
