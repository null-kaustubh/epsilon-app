"use client";

import { cn } from "../../../../lib/utils";

type ToolbarButtonProps = {
  active?: boolean;
  onClick: () => void;
  icon: React.ReactNode;
};

export default function ToolbarButton({
  active,
  onClick,
  icon,
}: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "p-2 rounded-xl bg-muted hover:bg-muted/70 transition-[color] flex items-center justify-center cursor-pointer",
        active && "outline outline-ring/50",
      )}
    >
      {icon}
    </button>
  );
}
