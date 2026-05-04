"use client";

/* eslint-disable @next/next/no-img-element */

import Image from "next/image";
import { Check, Plus } from "phosphor-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { BaseEditorProps } from "../lib/blockRegistry";

export default function ImageBlockEditor({
  value,
  onChangeAction,
  onGrowAction,
  onRequestCloseAction,
}: BaseEditorProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imageAreaRef = useRef<HTMLDivElement | null>(null);

  const [localSrc, setLocalSrc] = useState<string>(value);
  const measureImgRef = useRef<HTMLImageElement | null>(null);
  const [measureWidthPx, setMeasureWidthPx] = useState<number>(0);

  const openPicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const measureAndGrow = useCallback(() => {
    const img = measureImgRef.current;
    if (!img) return;
    if (measureWidthPx <= 0) return;
    const measuredHeight = img.clientHeight;
    if (!measuredHeight) return;
    const PADDING_Y_PX = 32;
    onGrowAction(measuredHeight + PADDING_Y_PX);
  }, [measureWidthPx, onGrowAction]);

  useEffect(() => {
    setLocalSrc(value);
  }, [value]);

  useEffect(() => {
    const el = imageAreaRef.current;
    if (!el) return;

    const ro = new ResizeObserver(() => {
      setMeasureWidthPx(el.clientWidth);
    });
    ro.observe(el);
    setMeasureWidthPx(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!localSrc) return;
    if (!measureWidthPx) return;
    requestAnimationFrame(() => measureAndGrow());
  }, [localSrc, measureWidthPx, measureAndGrow]);

  return (
    <div className="h-full w-full p-4 rounded-sm">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;

          const reader = new FileReader();
          reader.onload = () => {
            const next = typeof reader.result === "string" ? reader.result : "";
            if (!next) return;
            setLocalSrc(next);
            onChangeAction(next);
          };
          reader.readAsDataURL(file);
        }}
      />

      <div
        ref={imageAreaRef}
        className="relative h-full w-full rounded-sm overflow-hidden"
      >
        {localSrc ? (
          <img
            ref={measureImgRef}
            src={localSrc}
            alt=""
            style={{
              position: "absolute",
              top: -9999,
              left: -9999,
              visibility: "hidden",
              width: measureWidthPx || undefined,
              height: "auto",
            }}
            onLoad={() => measureAndGrow()}
          />
        ) : null}

        {localSrc ? (
          <>
            <Image
              src={localSrc}
              alt=""
              fill
              unoptimized
              sizes="100vw"
              style={{ objectFit: "contain" }}
            />
            <button
              type="button"
              onClick={openPicker}
              className="absolute top-2.5 right-2.5 flex items-center justify-center p-3 rounded-full bg-muted/90 hover:bg-muted transition-[color]"
            >
              <Plus size={16} />
            </button>
            <button
              type="button"
              onClick={onRequestCloseAction}
              className="absolute bottom-2.5 right-2.5 p-3 flex items-center justify-center rounded-full bg-muted/90 hover:bg-muted transition-[color]"
            >
              <Check size={16} />
            </button>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center rounded-sm border-2 border-border/60 bg-transparent">
            <button
              type="button"
              onClick={openPicker}
              className="flex items-center gap-2 px-3 py-3 rounded-full bg-muted hover:bg-muted/70 transition-[color]"
            >
              <Plus size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
