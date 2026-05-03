"use client";

import { useCallback, useRef, useState } from "react";
import LandingToolbar, { LandingToolbarState } from "./LandingToolbar";
import Image from "next/image";

const DEFAULT_TEXT = "Notes that become you.";

const COLOR_HEX_MAP: Record<string, string | undefined> = {
  default: "#1a1a1a",
  "#c04a4a": "#c04a4a",
  "#d4924e": "#d4924e",
  "#c9a84c": "#c9a84c",
  "#3d8f5f": "#3d8f5f",
  "#4477c4": "#4477c4",
  "#8a5fc7": "#8a5fc7",
};

type FormatCmd = "bold" | "italic" | "underline" | "strikeThrough";

export default function EditableHero() {
  const headingRef = useRef<HTMLHeadingElement>(null);

  const [toolbar, setToolbar] = useState<LandingToolbarState>({
    fontSize: 72,
    color: "default",
    align: "left",
  });

  const [activeFormats, setActiveFormats] = useState<Set<FormatCmd>>(new Set());

  /* sync active format states after execCommand / selection change */
  const syncFormats = useCallback(() => {
    const cmds: FormatCmd[] = ["bold", "italic", "underline", "strikeThrough"];
    setActiveFormats(
      new Set(cmds.filter((c) => document.queryCommandState(c)) as FormatCmd[]),
    );
  }, []);

  const handleFormat = useCallback(
    (cmd: FormatCmd) => {
      headingRef.current?.focus();
      document.execCommand(cmd, false, undefined);
      syncFormats();
    },
    [syncFormats],
  );

  const handleChange = useCallback((next: Partial<LandingToolbarState>) => {
    setToolbar((prev) => {
      const merged = { ...prev, ...next };

      /* Apply font size */
      if (next.fontSize !== undefined && headingRef.current) {
        headingRef.current.style.fontSize = `${next.fontSize}px`;
      }

      /* Apply color — if selection exists apply via execCommand, else whole heading */
      if (next.color !== undefined && headingRef.current) {
        const hex = COLOR_HEX_MAP[next.color];
        const sel = window.getSelection();
        const hasSelection =
          sel && sel.rangeCount > 0 && !sel.getRangeAt(0).collapsed;

        if (hasSelection) {
          headingRef.current.focus();
          if (hex) {
            document.execCommand("foreColor", false, hex);
          } else {
            document.execCommand("removeFormat", false, undefined);
          }
        } else {
          headingRef.current.style.color = hex ?? "";
        }
      }

      /* Apply align */
      if (next.align !== undefined && headingRef.current) {
        headingRef.current.style.textAlign = next.align;
      }

      return merged;
    });
  }, []);

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* SVG container — replaces <Image> */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Main collage: woman + floating cards */}
        <Image
          src="/Untitled_design.svg"
          alt="Epsilon collage"
          width={1152}
          height={768}
          unoptimized
          priority
          className="absolute right-0 top-0 h-full w-auto max-w-none"
        />
        {/* Stair decoration */}
        <Image
          src="/stair.svg"
          alt="Stair decoration"
          width={1152}
          height={768}
          unoptimized
          priority
          className="absolute bottom-20 right-20 h-[30%] w-auto max-w-none opacity-90"
        />
      </div>

      <div className="relative z-2 flex h-full flex-col items-center justify-center gap-4 -pl-10 max-w-[40%]">
        {/* Floating toolbar */}
        <LandingToolbar
          state={toolbar}
          onChange={handleChange}
          onFormat={handleFormat}
          activeFormats={activeFormats}
        />

        {/* Editable heading */}
        <div className="relative group">
          <h1
            ref={headingRef}
            contentEditable
            suppressContentEditableWarning
            spellCheck={false}
            onKeyUp={syncFormats}
            onMouseUp={syncFormats}
            onFocus={syncFormats}
            style={{
              textAlign: toolbar.align,
              color: COLOR_HEX_MAP[toolbar.color] ?? "#1a1a1a",
              fontSize: `${toolbar.fontSize}px`,
            }}
            className="
            whitespace-pre-wrap wrap-break-word text-left font-inter font-medium
            leading-[1.12] outline-none
            w-150 min-h-40 px-3 py-2
            rounded-sm border-2 border-dashed border-landing-border
            transition-[color] cursor-text overflow-hidden
          "
            data-placeholder={DEFAULT_TEXT}
          >
            Notes that <br />
            <span className="font-bodoni italic font-normal">
              become <span className="text-landing-accent-surface ">you.</span>
            </span>
          </h1>
        </div>

        <div className="text-balance text-left w-150 font-mono text-landing-foreground">
          A block-based canvas that lets you shape ideas your way. No rigid
          layouts. Just infinite freedom to think and create.
        </div>
      </div>
    </section>
  );
}
