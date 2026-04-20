"use client";

import React, { useCallback } from "react";
import {
  TextBolder,
  TextItalic,
  Code,
  ListBullets,
  TextHOne,
  TextHTwo,
  Minus,
  Plus,
} from "phosphor-react";
import { Block, BlockStyle } from "../lib/createBlockHelper";

const FONT_STEP = 2;
const MIN_FONT = 10;
const MAX_FONT = 32;
const DEFAULT_FONT = 14;

const COLOR_SWATCHES = [
  { value: undefined, label: "Default" },
  { value: "#ef4444", label: "Red" },
  { value: "#f97316", label: "Orange" },
  { value: "#eab308", label: "Yellow" },
  { value: "#22c55e", label: "Green" },
  { value: "#3b82f6", label: "Blue" },
  { value: "#a855f7", label: "Purple" },
  { value: "#ec4899", label: "Pink" },
] as const;

export type MarkdownEditorHandle = {
  wrapSelection: (wrapper: string) => void;
  insertAtLineStart: (prefix: string) => void;
};

interface BlockEditToolbarProps {
  blockType: Block["type"];
  blockStyle?: BlockStyle;
  onChangeStyle: (style: BlockStyle) => void;
  editorRef?: React.RefObject<MarkdownEditorHandle | null>;
}

export default function BlockEditToolbar({
  blockType,
  blockStyle,
  onChangeStyle,
  editorRef,
}: BlockEditToolbarProps) {
  const currentSize = blockStyle?.fontSize ?? DEFAULT_FONT;

  const adjustSize = useCallback(
    (delta: number) => {
      const next = Math.min(MAX_FONT, Math.max(MIN_FONT, currentSize + delta));
      onChangeStyle({ ...blockStyle, fontSize: next });
    },
    [currentSize, blockStyle, onChangeStyle],
  );

  const setColor = useCallback(
    (color: string | undefined) => {
      const next = { ...blockStyle, color };
      if (color === undefined) delete next.color;
      onChangeStyle(next);
    },
    [blockStyle, onChangeStyle],
  );

  // prevent toolbar clicks from blurring the editor
  const prevent = (e: React.MouseEvent) => e.preventDefault();

  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-[calc(100%+6px)] z-50
                 flex items-center gap-1 rounded-xl px-2 py-1.5
                 bg-background/90 backdrop-blur-md border border-border shadow-lg"
      onMouseDown={prevent}
    >
      {/* ── Font size ── */}
      <ToolbarGroup>
        <ToolbarBtn
          title="Decrease font size"
          onClick={() => adjustSize(-FONT_STEP)}
          disabled={currentSize <= MIN_FONT}
        >
          <Minus size={14} />
        </ToolbarBtn>

        <span className="min-w-[2ch] text-center text-xs text-muted-foreground select-none tabular-nums">
          {currentSize}
        </span>

        <ToolbarBtn
          title="Increase font size"
          onClick={() => adjustSize(FONT_STEP)}
          disabled={currentSize >= MAX_FONT}
        >
          <Plus size={14} />
        </ToolbarBtn>
      </ToolbarGroup>

      <Divider />

      {/* ── Color swatches ── */}
      <ToolbarGroup>
        {COLOR_SWATCHES.map((swatch) => (
          <button
            key={swatch.label}
            type="button"
            title={swatch.label}
            onMouseDown={prevent}
            onClick={() => setColor(swatch.value)}
            className="relative flex h-5 w-5 shrink-0 items-center justify-center rounded-full
                       border border-border/60 transition-transform hover:scale-110"
            style={{
              backgroundColor: swatch.value ?? "var(--foreground)",
            }}
          >
            {(blockStyle?.color ?? undefined) === swatch.value && (
              <span className="absolute inset-0 rounded-full ring-2 ring-accent ring-offset-1 ring-offset-background" />
            )}
          </button>
        ))}
      </ToolbarGroup>

      {/* ── Markdown-specific formatting ── */}
      {blockType === "markdown" && editorRef && (
        <>
          <Divider />
          <ToolbarGroup>
            <ToolbarBtn
              title="Bold (Ctrl+B)"
              onClick={() => editorRef.current?.wrapSelection("**")}
            >
              <TextBolder size={15} />
            </ToolbarBtn>
            <ToolbarBtn
              title="Italic (Ctrl+I)"
              onClick={() => editorRef.current?.wrapSelection("*")}
            >
              <TextItalic size={15} />
            </ToolbarBtn>
            <ToolbarBtn
              title="Inline code (Ctrl+E)"
              onClick={() => editorRef.current?.wrapSelection("`")}
            >
              <Code size={15} />
            </ToolbarBtn>
            <ToolbarBtn
              title="Heading 1 (Ctrl+1)"
              onClick={() => editorRef.current?.insertAtLineStart("# ")}
            >
              <TextHOne size={15} />
            </ToolbarBtn>
            <ToolbarBtn
              title="Heading 2 (Ctrl+2)"
              onClick={() => editorRef.current?.insertAtLineStart("## ")}
            >
              <TextHTwo size={15} />
            </ToolbarBtn>
            <ToolbarBtn
              title="Bullet list (Ctrl+Shift+L)"
              onClick={() => editorRef.current?.insertAtLineStart("- ")}
            >
              <ListBullets size={15} />
            </ToolbarBtn>
          </ToolbarGroup>
        </>
      )}
    </div>
  );
}

/* ── tiny internal helpers ── */

function ToolbarGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-1">{children}</div>;
}

function Divider() {
  return <div className="mx-1 h-5 w-px bg-border/60" />;
}

function ToolbarBtn({
  children,
  title,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  title: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="flex h-7 w-7 items-center justify-center rounded-md
                 text-muted-foreground transition-colors
                 hover:bg-muted hover:text-foreground
                 disabled:opacity-30 disabled:pointer-events-none"
    >
      {children}
    </button>
  );
}
