import { ReactNode } from "react";
import clsx from "clsx";

type SectionDividerProps = {
  children: ReactNode;
  className?: string;
  top?: boolean;
  bottom?: boolean;
  padded?: boolean;
  contentClassName?: string;
};

export default function SectionDivider({
  children,
  className,
  top = false,
  bottom = false,
  padded = true,
  contentClassName,
}: SectionDividerProps) {
  return (
    <section className={clsx("relative w-full", className)}>
      {/* full-width horizontal lines */}
      {top && (
        <div className="absolute top-0 left-0 right-0 h-px bg-landing-border" />
      )}
      {bottom && (
        <div className="absolute bottom-0 left-0 right-0 h-px bg-landing-border" />
      )}

      {/* constrained container — rails + crosses relative to this */}
      <div className="relative mx-auto w-full max-w-6xl">
        {/* vertical rails */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-px bg-landing-border" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-landing-border" />

        {/* top crosses */}
        {top && (
          <>
            <Cross pos="top-left" />
            <Cross pos="top-right" />
          </>
        )}

        {/* bottom crosses */}
        {bottom && (
          <>
            <Cross pos="bottom-left" />
            <Cross pos="bottom-right" />
          </>
        )}

        <div
          className={clsx(
            padded && "px-6 py-20 lg:px-10 lg:py-28",
            contentClassName,
          )}
        >
          {children}
        </div>
      </div>
    </section>
  );
}

function Cross({
  pos,
}: {
  pos: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}) {
  const isTop = pos.startsWith("top");
  const isLeft = pos.endsWith("left");

  return (
    <span
      aria-hidden
      className={clsx(
        "pointer-events-none absolute z-10 bg-landing-background",
        "px-1.5",
        "py-1.5",
        isTop ? "-top-3" : "-bottom-3",
        isLeft ? "-left-3" : "-right-3",
      )}
    >
      <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
        <line
          x1="9"
          y1="0"
          x2="9"
          y2="18"
          stroke="var(--landing-text-secondary)"
          strokeWidth="1.25"
        />
        <line
          x1="0"
          y1="9"
          x2="18"
          y2="9"
          stroke="var(--landing-text-secondary)"
          strokeWidth="1.25"
        />
      </svg>
    </span>
  );
}
