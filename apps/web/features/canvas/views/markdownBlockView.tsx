"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { parseMarkdownBlocks } from "../components/markdownRender";
import { BaseViewProps } from "../lib/blockRegistry";

export default function MarkdownBlockView({
  content,
  blockId,
  onGrowAction,
}: BaseViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const measureAndGrow = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    // The view container is height-constrained by the grid (`h-full`), so
    // measuring `scrollHeight` would mostly reflect the constrained height.
    // To get intrinsic content height, measure with `height: auto`.
    const prevHeight = el.style.height;
    el.style.height = "auto";
    const measured = el.scrollHeight;
    el.style.height = prevHeight;
    onGrowAction(blockId, measured);
  }, [blockId, onGrowAction]);

  useEffect(() => {
    measureAndGrow();
  }, [content, measureAndGrow]);

  const blocks = useMemo(() => parseMarkdownBlocks(content || ""), [content]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full p-4 text-sm leading-5 text-foreground"
    >
      {blocks.length ? blocks : <span style={{ opacity: 0.65 }}>&nbsp;</span>}
    </div>
  );
}
