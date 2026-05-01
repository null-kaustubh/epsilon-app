"use client";

import { useCallback, useRef, useState } from "react";
import LandingToolbar, { LandingToolbarState } from "./LandingToolbar";
import Image from "next/image";

const DEFAULT_TEXT = "Ideas. Notes. Clarity.\nWherever your mind goes.";

const COLOR_HEX_MAP: Record<string, string | undefined> = {
  default: undefined,
  "#111111": "#111111",
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
    fontSize: 54,
    color: "default",
    align: "center",
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
      {/* ② Background image */}
      <Image
        src="/ascii-art.webp"
        alt="Epsilon background"
        fill
        sizes="100vw"
        priority
        quality={90}
        className="object-cover object-center"
      />

      <div className="relative z-2 flex h-full flex-col items-center justify-center gap-4">
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
              fontSize: `${toolbar.fontSize}px`,
              textAlign: toolbar.align,
              color: COLOR_HEX_MAP[toolbar.color] ?? undefined,
            }}
            className="
            whitespace-pre-wrap wrap-break-word text-center font-sans font-normal
            leading-[1.12] text-landing-surface outline-none
            min-w-50 max-w-175 px-3 py-2
            rounded-sm border-2 border-dashed border-landing-border
            transition-[color] cursor-text
          "
            data-placeholder={DEFAULT_TEXT}
          >
            {DEFAULT_TEXT}
          </h1>
        </div>

        <div className="text-balance text-center w-140 font-mono">
          Combine note-taking, idea tracking, and daily planning in one smart
          notebook, ready whenever inspiration hits.
        </div>

        {/* Floating toolbar */}
        <LandingToolbar
          state={toolbar}
          onChange={handleChange}
          onFormat={handleFormat}
          activeFormats={activeFormats}
        />
      </div>
    </section>
  );
}
