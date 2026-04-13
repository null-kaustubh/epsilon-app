"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowCounterClockwise } from "phosphor-react";

type UndoToastProps = {
  spaceName: string;
  onUndo: () => void;
  onExpire: () => void;
  duration?: number;
};

export default function UndoToast({
  spaceName,
  onUndo,
  onExpire,
  duration = 10000,
}: UndoToastProps) {
  const [progress, setProgress] = useState(100);
  const startRef = useRef<number>(Date.now());
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const tick = () => {
      const elapsed = Date.now() - startRef.current;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining > 0) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);

    const timer = setTimeout(onExpire, duration);
    return () => {
      cancelAnimationFrame(rafRef.current!);
      clearTimeout(timer);
    };
  }, [duration, onExpire]);

  return createPortal(
    <div
      className="fixed bottom-5 left-0 right-0 z-9999 flex justify-center pointer-events-none"
      style={{ animation: "toastIn 0.2s ease-out both" }}
    >
      <div
        className="relative flex items-center gap-3 px-4 py-2.5 rounded-xl
                    bg-secondary border border-border shadow-popover overflow-hidden
                    min-w-65 max-w-sm pointer-events-auto"
      >
        {/* Progress bar */}
        <div
          className="absolute bottom-0 left-0 h-0.5 bg-destructive/50 transition-none"
          style={{ width: `${progress}%` }}
        />

        <span className="text-sm text-muted-foreground flex-1 truncate">
          <span className="text-foreground font-medium">
            &quot;{spaceName}&quot;
          </span>{" "}
          deleted
        </span>

        <button
          onClick={onUndo}
          className="flex items-center gap-1.5 text-xs font-medium text-accent
                      hover:text-accent/80 transition-colors cursor-pointer shrink-0"
        >
          <ArrowCounterClockwise size={13} weight="bold" />
          Undo
        </button>
      </div>

      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>,
    document.body,
  );
}
