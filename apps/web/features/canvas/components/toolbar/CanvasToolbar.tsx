"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  CaretDown,
  Code,
  Cursor,
  Image,
  ListChecks,
  TextT,
  Trash,
} from "phosphor-react";

import ToolbarButton from "./ToolbarButton";
import type { Block } from "../../lib/createBlockHelper";

type CanvasToolbarProps = {
  mode: "cursor" | "delete";
  setMode: (mode: "cursor" | "delete") => void;
  setEditingId: (id: string | null) => void;
  onAdd: (type: Block["type"]) => void;
};

export default function CanvasToolbar({
  mode,
  setMode,
  setEditingId,
  onAdd,
}: CanvasToolbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed left-1/2 -translate-x-1/2 z-50">
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
        className="bg-background backdrop-blur-md flex items-center overflow-hidden border-x border-b border-white/10"
        animate={{
          width: isOpen ? 380 : 72,
          height: isOpen ? 56 : 28,
          borderWidth: 1,
          borderTopWidth: 0,
          borderStyle: "solid",
          borderColor: "rgba(255,255,255,0.08)",
          boxShadow: isOpen
            ? "0 4px 12px rgba(0,0,0,0.2)"
            : "0 4px 16px rgba(0,0,0,0.25)",
        }}
        style={{
          borderBottomLeftRadius: isOpen ? 16 : 999,
          borderBottomRightRadius: isOpen ? 16 : 999,
        }}
      >
        {/* CLOSED STATE (NOTCH) */}
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="w-full h-full flex items-center justify-center"
          >
            <CaretDown size={14} />
          </button>
        )}

        {/* OPEN STATE */}
        {isOpen && (
          <div className="flex items-center gap-2 px-3 w-full transition-none">
            {/* Modes */}
            <ToolbarButton
              icon={<Cursor size={18} />}
              active={mode === "cursor"}
              onClick={() => setMode("cursor")}
            />

            <ToolbarButton
              icon={<Trash size={18} />}
              active={mode === "delete"}
              onClick={() => {
                setMode("delete");
                setEditingId(null);
              }}
            />

            {/* Divider */}
            <div className="w-px h-6 bg-border mx-1" />

            {/* Add block */}
            <ToolbarButton
              icon={<TextT size={18} />}
              onClick={() => onAdd("note")}
            />

            <ToolbarButton
              icon={<Image size={18} />}
              onClick={() => onAdd("image")}
            />

            <ToolbarButton
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  fill="#000000"
                  viewBox="0 0 256 256"
                >
                  <path
                    d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40v72a8,8,0,0,0,16,0V40h88V88a8,8,0,0,0,8,8h48V224a8,8,0,0,0,16,0V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM144,144H128a8,8,0,0,0-8,8v56a8,8,0,0,0,8,8h16a36,36,0,0,0,0-72Zm0,56h-8V160h8a20,20,0,0,1,0,40Zm-40-48v56a8,8,0,0,1-16,0V177.38L74.55,196.59a8,8,0,0,1-13.1,0L48,177.38V208a8,8,0,0,1-16,0V152a8,8,0,0,1,14.55-4.59L68,178.05l21.45-30.64A8,8,0,0,1,104,152Z"
                    fill="currentColor"
                  ></path>
                </svg>
              }
              onClick={() => onAdd("markdown")}
            />

            <ToolbarButton
              icon={<Code size={18} />}
              onClick={() => onAdd("code")}
            />

            <ToolbarButton
              icon={<ListChecks size={18} />}
              onClick={() => onAdd("todo")}
            />

            {/* Spacer */}
            <div className="w-px h-6 bg-border mx-1" />

            {/* Close */}
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 opacity-70 hover:opacity-100 transition"
            >
              <CaretDown size={14} className="rotate-180" />
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
