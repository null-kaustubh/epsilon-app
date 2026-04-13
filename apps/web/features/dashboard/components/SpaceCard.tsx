"use client";

import { useState } from "react";
import Link from "next/link";
import { Space } from "../../../lib/spaces";
import { cn } from "../../../lib/utils";
import SpaceMenu from "./SpaceMenu";
import UndoToast from "./UndoToast";

type SpaceCardProps = {
  space: Space;
  onClick?: () => void;
  onRename?: () => void;
  onDelete?: () => void;
};

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
}: SpaceCardProps) {
  const [pendingDelete, setPendingDelete] = useState(false);
  const idx = hashName(space.name) % ICON_COLORS.length;

  const handleDeleteRequest = () => setPendingDelete(true);

  const handleUndo = () => setPendingDelete(false);

  const handleExpire = () => {
    setPendingDelete(false);
    onDelete?.();
  };

  return (
    <>
      <Link
        href={`/spaces/${space.slug}`}
        onClick={onClick}
        className="group block"
      >
        <div
          className={cn(
            "flex items-center gap-3.5 p-2.5 rounded-lg border border-border",
            "bg-secondary hover:border-accent/60 transition-all duration-200 hover:shadow-sm",
            pendingDelete && "opacity-40 pointer-events-none",
          )}
        >
          {/* Icon thumbnail */}
          <div
            className={cn(
              "w-11 h-11 rounded-md flex items-center justify-center shrink-0",
              ICON_COLORS[idx],
            )}
          >
            <span className="text-lg font-bold">
              {space.name.charAt(0).toUpperCase()}
            </span>
          </div>

          {/* Text content */}
          <div className="min-w-0 flex-1">
            <h3
              className="text-sm font-medium font-head text-foreground truncate
                         group-hover:text-accent transition-colors"
            >
              {space.name}
            </h3>
            {space.description && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {space.description}
              </p>
            )}
            <p className="text-[11px] text-muted-foreground/70 mt-0.5">
              {timeAgo(space.updated_at)}
            </p>
          </div>

          {/* 3-dot menu */}
          {(onRename || onDelete) && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 self-start">
              <SpaceMenu
                onRename={onRename ?? (() => {})}
                onDelete={handleDeleteRequest}
              />
            </div>
          )}
        </div>
      </Link>

      {pendingDelete && (
        <UndoToast
          spaceName={space.name}
          onUndo={handleUndo}
          onExpire={handleExpire}
        />
      )}
    </>
  );
}
