"use client";

import { useEffect, useRef, useState } from "react";
import { DotsThree, PencilSimple, Trash } from "phosphor-react";

type SpaceMenuProps = {
  onRename: () => void;
  onDelete: () => void;
};

export default function SpaceMenu({ onRename, onDelete }: SpaceMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="p-1.5 rounded-md hover:bg-muted/80 transition-colors cursor-pointer"
        aria-label="Space options"
      >
        <DotsThree size={18} weight="bold" className="text-muted-foreground" />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 w-36 bg-secondary border border-border
                      rounded-lg shadow-popover py-1 z-50"
          style={{
            animation: "menuIn 0.12s ease-out both",
          }}
        >
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpen(false);
              onRename();
            }}
            className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-foreground
                        hover:bg-muted transition-colors cursor-pointer"
          >
            <PencilSimple size={14} />
            Rename
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpen(false);
              onDelete();
            }}
            className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-destructive
                        hover:bg-muted transition-colors cursor-pointer"
          >
            <Trash size={14} />
            Delete
          </button>
        </div>
      )}

      <style>{`
        @keyframes menuIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
