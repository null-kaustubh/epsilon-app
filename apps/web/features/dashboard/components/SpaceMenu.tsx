"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { DotsThree, PencilSimple, Trash } from "phosphor-react";

type SpaceMenuProps = {
  onRename: () => void;
  onDelete: () => void;
};

export default function SpaceMenu({ onRename, onDelete }: SpaceMenuProps) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Position the portal menu relative to the trigger button
  const openMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY + 4,
        left: rect.right + window.scrollX,
      });
    }
    setOpen((v) => !v);
  };

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Close on scroll / resize so it doesn't drift
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  const menu = open ? (
    <div
      ref={menuRef}
      style={{
        position: "absolute",
        top: coords.top,
        left: coords.left,
        transform: "translateX(-100%)",
        zIndex: 9999,
        animation: "menuIn 0.1s ease-out both",
      }}
    >
      <div
        className="flex items-center gap-0.5 bg-secondary border border-border
                    rounded-lg shadow-popover p-1"
      >
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen(false);
            onRename();
          }}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground
                      hover:bg-muted transition-colors cursor-pointer"
          aria-label="Rename space"
          title="Rename"
        >
          <PencilSimple size={14} weight="bold" />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen(false);
            onDelete();
          }}
          className="p-1.5 rounded-md text-muted-foreground hover:text-destructive
                      hover:bg-destructive/10 transition-colors cursor-pointer"
          aria-label="Delete space"
          title="Delete"
        >
          <Trash size={14} weight="bold" />
        </button>
      </div>

      <style>{`
        @keyframes menuIn {
          from { opacity: 0; transform: translateX(-100%) translateY(-4px); }
          to   { opacity: 1; transform: translateX(-100%) translateY(0); }
        }
      `}</style>
    </div>
  ) : null;

  return (
    <>
      <button
        ref={triggerRef}
        onClick={openMenu}
        className="p-1.5 cursor-pointer"
        aria-label="Space options"
      >
        <DotsThree
          size={18}
          weight="bold"
          className="text-muted-foreground hover:text-foreground transition-[color]"
        />
      </button>

      {typeof document !== "undefined" &&
        menu &&
        createPortal(menu, document.body)}
    </>
  );
}
