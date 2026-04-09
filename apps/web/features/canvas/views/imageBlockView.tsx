"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import { BaseViewProps } from "../lib/blockRegistry";
import { Plus } from "phosphor-react";

export default function ImageBlockView({
  blockId,
  content,
  onRequestEditAction,
}: BaseViewProps) {
  const [ratio, setRatio] = useState<number | null>(null);

  const handleLoad = useCallback(
    (img: HTMLImageElement) => {
      const r = img.naturalHeight / img.naturalWidth;
      setRatio(r);
    },
    [],
  );

  if (!content) {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onRequestEditAction?.();
        }}
        className="absolute inset-4 flex items-center justify-center rounded-sm border-2 border-dashed border-border/60 bg-transparent hover:bg-muted/50 transition-[color]"
      >
        <div className="flex items-center gap-2 px-3 py-3 rounded-full bg-muted">
          <Plus size={16} />
        </div>
      </button>
    );
  }

  return (
    <div className="absolute inset-4 rounded-sm overflow-hidden">
      {content && (
        <div
          style={{
            width: "100%",
            aspectRatio: ratio ? `${1 / ratio}` : "1 / 1",
            position: "relative",
          }}
        >
          <Image
            src={content}
            alt=""
            fill
            sizes="100vw"
            style={{ objectFit: "contain" }}
            onLoadingComplete={handleLoad}
          />
        </div>
      )}
    </div>
  );
}
