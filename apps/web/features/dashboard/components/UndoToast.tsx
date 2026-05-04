"use client";

import { useEffect, useRef, useState } from "react";
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
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

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

    const timer = setTimeout(() => onExpireRef.current(), duration);
    return () => {
      cancelAnimationFrame(rafRef.current!);
      clearTimeout(timer);
    };
  }, [duration]);

  return (
    <>
      <div
        className="relative flex items-center gap-3 px-4 py-2.5 rounded-xl
                  bg-secondary border border-border shadow-popover overflow-hidden
                  min-w-65 max-w-sm pointer-events-auto"
        style={{ animation: "toastIn 0.2s ease-out both" }}
      >
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
    </>
  );
}
