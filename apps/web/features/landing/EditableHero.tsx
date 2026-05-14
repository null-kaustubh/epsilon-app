"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import LandingToolbar, { LandingToolbarState } from "./LandingToolbar";
import Image from "next/image";
import Link from "next/link";

const DEFAULT_TEXT = "Notes that become you.";

declare global {
  interface Window {
    Supademo?: {
      open: (id: string) => void;
    };
  }
}

const COLOR_HEX_MAP: Record<string, string | undefined> = {
  default: "#1a1a1a",
  "#e05555": "#e05555",
  "#f77824": "#f77824",
  "#f0c93a": "#f0c93a",
  "#42b872": "#42b872",
  "#4d8fe0": "#4d8fe0",
  "#a06ee0": "#a06ee0",
};

type FormatCmd = "bold" | "italic" | "underline" | "strikeThrough";

export default function EditableHero() {
  const desktopRef = useRef<HTMLHeadingElement>(null);
  const mobileRef = useRef<HTMLHeadingElement>(null);

  const [mounted, setMounted] = useState(false);

  const [toolbar, setToolbar] = useState<LandingToolbarState>({
    fontSize: 72,
    color: "default",
    align: "left",
  });

  useEffect(() => {
    setMounted(true);
    setToolbar((prev) => ({
      ...prev,
      fontSize: window.innerWidth < 768 ? 46 : 72,
    }));
  }, []);

  const [activeFormats, setActiveFormats] = useState<Set<FormatCmd>>(new Set());

  const syncFormats = useCallback(() => {
    const cmds: FormatCmd[] = ["bold", "italic", "underline", "strikeThrough"];
    setActiveFormats(
      new Set(cmds.filter((c) => document.queryCommandState(c)) as FormatCmd[]),
    );
  }, []);

  const handleFormat = useCallback(
    (cmd: FormatCmd) => {
      const active = window.innerWidth < 768 ? mobileRef : desktopRef;
      active.current?.focus();
      document.execCommand(cmd, false, undefined);
      syncFormats();
    },
    [syncFormats],
  );

  const handleChange = useCallback((next: Partial<LandingToolbarState>) => {
    setToolbar((prev) => {
      const merged = { ...prev, ...next };
      const refs = [desktopRef, mobileRef];

      if (next.fontSize !== undefined) {
        refs.forEach(
          (r) => r.current && (r.current.style.fontSize = `${next.fontSize}px`),
        );
      }

      if (next.color !== undefined) {
        const hex = COLOR_HEX_MAP[next.color];
        const sel = window.getSelection();
        const hasSelection =
          sel && sel.rangeCount > 0 && !sel.getRangeAt(0).collapsed;

        if (hasSelection) {
          const active = window.innerWidth < 768 ? mobileRef : desktopRef;
          active.current?.focus();
          if (hex) {
            document.execCommand("foreColor", false, hex);
          } else {
            document.execCommand("removeFormat", false, undefined);
          }
        } else {
          refs.forEach((r) => r.current && (r.current.style.color = hex ?? ""));
        }
      }

      if (next.align !== undefined) {
        refs.forEach(
          (r) => r.current && (r.current.style.textAlign = next.align!),
        );
      }

      return merged;
    });
  }, []);

  const openDemo = () => {
    window.Supademo?.open("cmp3zx0zp0mml5lqm72t41zng");
  };

  return (
    <section className="relative w-full min-h-screen bg-landing-background">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
        linear-gradient(to right, #e7e5e4 1px, transparent 1px),
        linear-gradient(to bottom, #e7e5e4 1px, transparent 1px)
      `,
          backgroundSize: "20px 20px",
          backgroundPosition: "0 0, 0 0",
          maskImage: `
        repeating-linear-gradient(
              to right,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            ),
            repeating-linear-gradient(
              to bottom,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            ),
            radial-gradient(ellipse 70% 60% at 50% 0%, #000 60%, transparent 100%)
      `,
          WebkitMaskImage: `
 repeating-linear-gradient(
              to right,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            ),
            repeating-linear-gradient(
              to bottom,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            ),
            radial-gradient(ellipse 70% 60% at 50% 0%, #000 60%, transparent 100%)
      `,
          maskComposite: "intersect",
          WebkitMaskComposite: "source-in",
        }}
      />
      {/* Desktop */}
      <div className="hidden md:block absolute inset-y-0 right-0 w-[60%] pointer-events-none">
        <Image
          src="https://assets.kaustubh.cloud/epsilon/epsilon.svg"
          alt="Epsilon collage"
          width={1152}
          height={768}
          unoptimized
          priority
          fetchPriority="high"
          className="absolute right-0 top-0 h-full w-auto max-w-none select-none"
        />
      </div>

      {/* Desktop layout */}
      <div className="hidden md:flex absolute inset-0 flex-col items-start justify-center pl-25 max-w-[42%] gap-4">
        <div className="flex flex-col items-center gap-3 w-130">
          <LandingToolbar
            state={toolbar}
            onChange={handleChange}
            onFormat={handleFormat}
            activeFormats={activeFormats}
          />
          <div className="relative group">
            {/* Top-left */}
            <span className="absolute -top-1.5 -left-1.5 pointer-events-none">
              <span className="absolute top-0 left-1.5 w-0.5 h-6 bg-landing-foreground-soft" />
              <span className="absolute top-1.5 left-0 h-0.5 w-6 bg-landing-foreground-soft" />
            </span>
            {/* Top-right */}
            <span className="absolute -top-1.5 -right-1.5 pointer-events-none">
              <span className="absolute top-0 right-1.5 w-0.5 h-6 bg-landing-foreground-soft" />
              <span className="absolute top-1.5 right-0 h-0.5 w-6 bg-landing-foreground-soft" />
            </span>
            {/* Bottom-left */}
            <span className="absolute -bottom-1.5 -left-1.5 pointer-events-none">
              <span className="absolute bottom-0 left-1.5 w-0.5 h-6 bg-landing-foreground-soft" />
              <span className="absolute bottom-1.5 left-0 h-0.5 w-6 bg-landing-foreground-soft" />
            </span>
            {/* Bottom-right */}
            <span className="absolute -bottom-1.5 -right-1.5 pointer-events-none">
              <span className="absolute bottom-0 right-1.5 w-0.5 h-6 bg-landing-foreground-soft" />
              <span className="absolute bottom-1.5 right-0 h-0.5 w-6 bg-landing-foreground-soft" />
            </span>

            <h1
              ref={desktopRef}
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
              w-135 min-h-40 px-3 py-2
              rounded-sm border-2 border-dashed border-landing-foreground-soft/40
              transition-[color] cursor-text overflow-hidden
            "
              data-placeholder={DEFAULT_TEXT}
            >
              Notes that <br />
              <span className="font-bodoni italic font-normal">
                become <span className="text-landing-accent-surface">you.</span>
              </span>
              <span className="blinking-cursor">|</span>
            </h1>
          </div>
        </div>
        <div className="text-balance text-left w-130 font-mono text-landing-foreground">
          A block-based canvas that lets you shape ideas your way. No rigid
          layouts. Just infinite freedom to think and create.
        </div>
        {/* CTA Buttons */}
        <div className="flex items-center gap-3 z-20">
          <Link
            href="/signup"
            className="flex items-center gap-2 bg-landing-foreground-soft text-landing-background font-inter font-medium text-sm px-5 py-3 rounded-full hover:opacity-80 transition-opacity cursor-pointer"
          >
            Start for free
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 10L10 2M10 2H4M10 2V8"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>

          <button
            onClick={openDemo}
            className="flex group items-center gap-2 font-inter font-medium text-sm text-landing-foreground-soft px-4 py-3 rounded-full cursor-pointer hover:text-landing-foreground-soft/70 transition-[color]"
          >
            <span className="flex items-center justify-center w-10 h-10 rounded-full border border-landing-foreground group-hover:border-landing-foreground/70">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="icon icon-tabler icons-tabler-filled icon-tabler-player-play"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M6 4v16a1 1 0 0 0 1.524 .852l13 -8a1 1 0 0 0 0 -1.704l-13 -8a1 1 0 0 0 -1.524 .852z" />
              </svg>
            </span>
            Watch demo
          </button>
        </div>
      </div>

      {/* Mobile layout */}
      <div
        className="flex md:hidden flex-col items-center px-4 gap-4"
        style={{
          paddingTop: "env(safe-area-inset-top, 16px)",
          minHeight: "100dvh",
        }}
      >
        <div style={{ height: "100px" }} />

        <div className="w-full flex flex-col gap-3">
          <div className="flex justify-center">
            <LandingToolbar
              state={toolbar}
              onChange={handleChange}
              onFormat={handleFormat}
              activeFormats={activeFormats}
            />
          </div>
          <div className="relative group w-full">
            {/* Top-left */}
            <span className="absolute -top-1.5 -left-1.5 pointer-events-none">
              <span className="absolute top-0 left-1.5 w-0.5 h-6 bg-landing-foreground-soft" />
              <span className="absolute top-1.5 left-0 h-0.5 w-6 bg-landing-foreground-soft" />
            </span>
            {/* Top-right */}
            <span className="absolute -top-1.5 -right-1.5 pointer-events-none">
              <span className="absolute top-0 right-1.5 w-0.5 h-6 bg-landing-foreground-soft" />
              <span className="absolute top-1.5 right-0 h-0.5 w-6 bg-landing-foreground-soft" />
            </span>
            {/* Bottom-left */}
            <span className="absolute -bottom-1.5 -left-1.5 pointer-events-none">
              <span className="absolute bottom-0 left-1.5 w-0.5 h-6 bg-landing-foreground-soft" />
              <span className="absolute bottom-1.5 left-0 h-0.5 w-6 bg-landing-foreground-soft" />
            </span>
            {/* Bottom-right */}
            <span className="absolute -bottom-1.5 -right-1.5 pointer-events-none">
              <span className="absolute bottom-0 right-1.5 w-0.5 h-6 bg-landing-foreground-soft" />
              <span className="absolute bottom-1.5 right-0 h-0.5 w-6 bg-landing-foreground-soft" />
            </span>
            <h1
              ref={mobileRef}
              contentEditable
              suppressContentEditableWarning
              suppressHydrationWarning
              spellCheck={false}
              onKeyUp={syncFormats}
              onMouseUp={syncFormats}
              onFocus={syncFormats}
              style={{
                textAlign: toolbar.align,
                color: COLOR_HEX_MAP[toolbar.color] ?? "#1a1a1a",
                fontSize: mounted ? `${toolbar.fontSize}px` : undefined,
              }}
              aria-hidden="true"
              className="
              whitespace-pre-wrap wrap-break-word text-left font-inter font-medium text-[46px]
              leading-[1.12] outline-none
              w-full min-h-20 px-3 py-2
              rounded-sm border-2 border-dashed border-landing-border
              transition-[color] cursor-text overflow-hidden
            "
              data-placeholder={DEFAULT_TEXT}
            >
              Notes that <br />
              <span className="font-bodoni italic font-normal">
                become <span className="text-landing-accent-surface">you.</span>
              </span>
            </h1>
          </div>
        </div>
        <div className="text-balance text-left w-full font-mono text-landing-foreground text-xs pl-4">
          A block-based canvas that lets you shape ideas your way. No rigid
          layouts. Just infinite freedom to think and create.
        </div>
        {/* CTA Buttons */}
        <div className="flex items-center gap-3 z-20">
          <Link
            href={"/signup"}
            className="flex items-center gap-2 bg-landing-foreground-soft text-white font-inter font-medium text-xs px-5 py-3 rounded-full hover:opacity-80 transition-opacity"
          >
            Start for free
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 10L10 2M10 2H4M10 2V8"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>

          <button
            onClick={openDemo}
            className="flex items-center gap-2 font-inter font-medium text-sm text-landing-foreground-soft px-4 py-3 rounded-full"
          >
            <span className="flex items-center justify-center w-9 h-9 rounded-full border border-landing-foreground-soft">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="icon icon-tabler icons-tabler-filled icon-tabler-player-play"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M6 4v16a1 1 0 0 0 1.524 .852l13 -8a1 1 0 0 0 0 -1.704l-13 -8a1 1 0 0 0 -1.524 .852z" />
              </svg>
            </span>
            Watch demo
          </button>
        </div>
        <div className="pointer-events-none w-screen -mx-4 relative h-[55vh]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://assets.kaustubh.cloud/epsilon/epsilon.svg"
            alt="Epsilon collage"
            loading="lazy"
            fetchPriority="low"
            className="absolute inset-0 w-full h-full object-cover object-top"
          />
        </div>
      </div>
    </section>
  );
}
