"use client";

import { useCallback } from "react";
import {
  TextBolder,
  TextItalic,
  TextUnderline,
  TextStrikethrough,
  AlignLeft,
  AlignCenterHorizontal,
  AlignRight,
  Minus,
  Plus,
} from "phosphor-react";

const FONT_STEP = 4;
const MIN_FONT = 20;
const MAX_FONT = 96;

const COLOR_SWATCHES = [
  { value: "default", label: "Default", hex: "#1A1A1A" },
  { value: "#e05555", label: "Red", hex: "#e05555" },
  { value: "#f77824", label: "Orange", hex: "#f77824" },
  { value: "#f0c93a", label: "Yellow", hex: "#f0c93a" },
  { value: "#42b872", label: "Green", hex: "#42b872" },
  { value: "#4d8fe0", label: "Blue", hex: "#4d8fe0" },
  { value: "#a06ee0", label: "Purple", hex: "#a06ee0" },
] as const;

type SwatchValue = (typeof COLOR_SWATCHES)[number]["value"];
type Align = "left" | "center" | "right";

export interface LandingToolbarState {
  fontSize: number;
  color: SwatchValue;
  align: Align;
}

interface LandingToolbarProps {
  state: LandingToolbarState;
  onChange: (next: Partial<LandingToolbarState>) => void;
  onFormat: (cmd: "bold" | "italic" | "underline" | "strikeThrough") => void;
  activeFormats?: Set<"bold" | "italic" | "underline" | "strikeThrough">;
}

export default function LandingToolbar({
  state,
  onChange,
  onFormat,
  activeFormats = new Set(),
}: LandingToolbarProps) {
  const prevent = (e: React.MouseEvent) => e.preventDefault();

  const adjSize = useCallback(
    (delta: number) => {
      const next = Math.min(
        MAX_FONT,
        Math.max(MIN_FONT, state.fontSize + delta),
      );
      onChange({ fontSize: next });
    },
    [state.fontSize, onChange],
  );

  return (
    <div
      onMouseDown={prevent}
      className="
        rounded-full bg-landing-surface overflow-x-auto z-20
        shadow-[0_10px_40px_rgba(28,28,28,0.08),0_4px_12px_rgba(28,28,28,0.05)]
        border border-landing-border
      "
      style={
        {
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        } as React.CSSProperties
      }
    >
      <div className="flex flex-nowrap items-center gap-1 px-2 py-2 w-max">
        {/* Font size */}
        <div className="flex items-center gap-0.5 rounded-full shrink-0 mr-1">
          <TBtn
            title="Decrease size"
            onClick={() => adjSize(-FONT_STEP)}
            disabled={state.fontSize <= MIN_FONT}
          >
            <Minus size={14} />
          </TBtn>
          <span className="min-w-5.5 select-none text-center text-xs tabular-nums text-landing-foreground">
            {state.fontSize}
          </span>
          <TBtn
            title="Increase size"
            onClick={() => adjSize(FONT_STEP)}
            disabled={state.fontSize >= MAX_FONT}
          >
            <Plus size={14} />
          </TBtn>
        </div>

        {/* Color swatches */}
        <div className="flex items-center gap-1 rounded-full bg-landing-surface-3 backdrop-blur-2xl px-2 py-2 shrink-0 shadow-[0_1px_5px_rgba(0,0,0,0.16),0_0_0_1px_rgba(0,0,0,0.05)] border border-landing-border">
          {COLOR_SWATCHES.map((s) => (
            <button
              key={s.value}
              type="button"
              title={s.label}
              onMouseDown={prevent}
              onClick={() => onChange({ color: s.value })}
              className="
            relative h-5 w-5 shrink-0 rounded-full
            border border-landing-surface transition-transform hover:scale-110
            "
              style={{ backgroundColor: s.hex ?? "#111" }}
            >
              {state.color === s.value && (
                <span className="absolute inset-0 rounded-full ring-2 ring-neutral-900 ring-offset-1 ring-offset-landing-surface" />
              )}
            </button>
          ))}
        </div>

        {/* Format */}
        <div className="flex items-center gap-1 rounded-full px-2 shrink-0">
          <TBtn
            title="Bold"
            onClick={() => onFormat("bold")}
            active={activeFormats.has("bold")}
          >
            <TextBolder size={14} />
          </TBtn>
          <TBtn
            title="Italic"
            onClick={() => onFormat("italic")}
            active={activeFormats.has("italic")}
          >
            <TextItalic size={14} />
          </TBtn>
          <TBtn
            title="Underline"
            onClick={() => onFormat("underline")}
            active={activeFormats.has("underline")}
          >
            <TextUnderline size={14} />
          </TBtn>
          <TBtn
            title="Strikethrough"
            onClick={() => onFormat("strikeThrough")}
            active={activeFormats.has("strikeThrough")}
          >
            <TextStrikethrough size={14} />
          </TBtn>
        </div>

        {/* Align */}
        <div className="flex items-center gap-0.5 rounded-full bg-landing-surface-3 px-1 py-1 shrink-0 shadow-[0_1px_5px_rgba(0,0,0,0.16),0_0_0_1px_rgba(0,0,0,0.05)] border border-landing-border">
          <TBtn
            title="Align left"
            onClick={() => onChange({ align: "left" })}
            active={state.align === "left"}
          >
            <AlignLeft size={14} />
          </TBtn>
          <TBtn
            title="Align center"
            onClick={() => onChange({ align: "center" })}
            active={state.align === "center"}
          >
            <AlignCenterHorizontal size={14} />
          </TBtn>
          <TBtn
            title="Align right"
            onClick={() => onChange({ align: "right" })}
            active={state.align === "right"}
          >
            <AlignRight size={14} />
          </TBtn>
        </div>
      </div>
    </div>
  );
}

/* ── helpers ── */

function TBtn({
  children,
  title,
  onClick,
  disabled,
  active,
}: {
  children: React.ReactNode;
  title: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`
        flex h-8 w-8 items-center justify-center rounded-full
        text-landing-foreground-soft transition-[color]
        hover:bg-landing-surface-2 hover:border hover:border-landing-border bg-landing-surface-3 backdrop-blur-2xl
        disabled:pointer-events-none disabled:opacity-25 cursor-pointer shadow-[0_2px_4px_rgba(0,0,0,0.16),0_0_0_1px_rgba(0,0,0,0.05)]
        ${active ? "bg-white shadow-[0_2px_6px_rgba(28,28,28,0.16)]" : ""}
      `}
    >
      {children}
    </button>
  );
}
