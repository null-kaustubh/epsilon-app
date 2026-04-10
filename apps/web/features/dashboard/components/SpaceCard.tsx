"use client";

import Link from "next/link";
import { Space } from "../../../lib/spaces";
import { cn } from "../../../lib/utils";
import SpaceMenu from "./SpaceMenu";

type SpaceCardProps = {
  space: Space;
  onClick?: () => void;
  onRename?: () => void;
  onDelete?: () => void;
  variant?: "default" | "compact";
};

const GRADIENTS = [
  "from-accent/12 to-accent/4",
  "from-success/12 to-success/4",
  "from-link/12 to-link/4",
  "from-destructive/12 to-destructive/4",
  "from-ring/12 to-ring/4",
];

const ICON_COLORS = [
  "bg-accent/20 text-accent",
  "bg-success/20 text-success",
  "bg-link/20 text-link",
  "bg-destructive/20 text-destructive",
  "bg-ring/20 text-ring",
];

function hashName(name: string) {
  return name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function SpaceCard({
  space,
  onClick,
  onRename,
  onDelete,
  variant = "default",
}: SpaceCardProps) {
  const idx = hashName(space.name) % GRADIENTS.length;
  const isCompact = variant === "compact";

  return (
    <Link
      href={`/spaces/${space.slug}`}
      onClick={onClick}
      className="group block"
    >
      <div
        className="rounded-xl border border-border bg-secondary hover:border-accent/40
                    transition-all duration-200 hover:shadow-md overflow-hidden"
      >
        {/* Cover */}
        <div
          className={cn(
            "bg-linear-to-br flex items-center justify-center relative",
            isCompact ? "h-28" : "h-32",
            GRADIENTS[idx],
          )}
        >
          {/* 3-dot menu */}
          {(onRename || onDelete) && (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <SpaceMenu
                onRename={onRename ?? (() => {})}
                onDelete={onDelete ?? (() => {})}
              />
            </div>
          )}

          <span
            className={cn(
              "rounded-xl font-bold flex items-center justify-center",
              "group-hover:scale-110 transition-transform duration-200",
              isCompact
                ? "w-10 h-10 text-lg"
                : "w-12 h-12 text-xl",
              ICON_COLORS[idx],
            )}
          >
            {space.name.charAt(0).toUpperCase()}
          </span>
        </div>

        {/* Info */}
        <div className={isCompact ? "px-3 py-2.5" : "px-4 py-3"}>
          <h3
            className={cn(
              "font-medium text-foreground truncate group-hover:text-accent transition-colors",
              isCompact ? "text-sm" : "text-[15px]",
            )}
          >
            {space.name}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {timeAgo(space.updated_at)}
          </p>
        </div>
      </div>
    </Link>
  );
}
