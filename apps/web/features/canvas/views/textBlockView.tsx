"use client";

import { useEffect, useRef } from "react";
import { BaseViewProps } from "../lib/blockRegistry";

export default function TextBlockView({
  blockId,
  content,
  blockStyle,
  onGrowAction,
}: BaseViewProps) {
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const prev = el.style.height;
    el.style.height = "auto";
    const measured = el.scrollHeight;
    el.style.height = prev;

    onGrowAction(blockId, measured);
  }, [content, blockId, onGrowAction]);

  return (
    <div className="relative w-full select-none">
      <div
        ref={contentRef}
        className="w-full p-4 text-sm leading-5 whitespace-pre-wrap wrap-break-word"
        style={{
          fontSize: blockStyle?.fontSize,
          color: blockStyle?.color,
        }}
      >
        {content || " "}
      </div>
    </div>
  );
}
