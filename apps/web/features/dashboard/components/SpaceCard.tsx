"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Space } from "../../../lib/spaces";
import { cn } from "../../../lib/utils";
import SpaceMenu from "./SpaceMenu";
import { X } from "phosphor-react";
import { uploadImage } from "@/lib/upload";

type SpaceCardProps = {
  space: Space;
  onClick?: () => void;
  onRename?: (name: string, description: string, iconUrl: string) => void;
  onDelete?: () => void;
  isNew?: boolean;
  onCancel?: () => void;
  isPendingDelete?: boolean;
};

const defaultIcon = process.env.NEXT_PUBLIC_DEFAULT_SPACE_ICON!;

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
  return new Date(dateStr).toLocaleDateString("en-GB");
}

export default function SpaceCard({
  space,
  onClick,
  onRename,
  onDelete,
  isNew,
  onCancel,
  isPendingDelete,
}: SpaceCardProps) {
  const [renaming, setRenaming] = useState(isNew ?? false);
  const [draftName, setDraftName] = useState(space.name);
  const [draftDesc, setDraftDesc] = useState(space.description ?? "");
  const nameRef = useRef<HTMLInputElement>(null);
  const idx = hashName(space.name) % ICON_COLORS.length;
  const containerRef = useRef<HTMLDivElement>(null);
  const [draftIcon, setDraftIcon] = useState(space.icon_url ?? defaultIcon);
  const fileRef = useRef<HTMLInputElement>(null);
  const isPickingFile = useRef(false);

  const handleDeleteRequest = () => onDelete?.();

  const startRename = () => {
    setDraftName(space.name);
    setDraftDesc(space.description ?? "");
    setDraftIcon(space.icon_url || defaultIcon);
    setRenaming(true);
    setTimeout(() => nameRef.current?.focus(), 0);
  };

  const handleBlur = (e: React.FocusEvent) => {
    if (isPickingFile.current) return;
    if (containerRef.current?.contains(e.relatedTarget as Node)) return;
    commitRename(draftName, draftDesc, draftIcon);
  };

  const commitRename = (
    name = draftName,
    desc = draftDesc,
    icon = draftIcon,
  ) => {
    setRenaming(false);
    const trimName = name.trim();
    if (!trimName) {
      if (isNew) {
        onCancel?.();
        return;
      }
      setDraftName(space.name);
      setDraftDesc(space.description ?? "");
      setDraftIcon(space.icon_url || defaultIcon);
      return;
    }

    const unchanged =
      trimName === space.name &&
      desc.trim() === (space.description ?? "") &&
      icon === (space.icon_url || defaultIcon);
    if (unchanged) return;

    onRename?.(trimName, desc.trim(), icon);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitRename();
    }
    if (e.key === "Escape") {
      if (isNew) {
        onCancel?.();
        return;
      }
      setDraftName(space.name);
      setDraftDesc(space.description ?? "");
      setDraftIcon(space.icon_url || defaultIcon);
      setRenaming(false);
    }
    e.stopPropagation();
  };

  const cardContent = (
    <div
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg border border-border w-full",
        "bg-secondary hover:border-accent/60 transition-[color] duration-200 hover:shadow-sm",
        renaming && "border-accent/60",
        isPendingDelete && "opacity-40 pointer-events-none",
      )}
    >
      {/* Icon thumbnail */}
      <div
        className={cn(
          "w-23 h-23 rounded-md flex items-center justify-center shrink-0 overflow-hidden relative",
          !draftIcon && !space.icon_url && ICON_COLORS[idx],
          renaming && "cursor-pointer",
        )}
        onMouseDown={
          renaming
            ? (e) => {
                e.preventDefault();
                e.stopPropagation();
                isPickingFile.current = true;
                fileRef.current?.click();
              }
            : undefined
        }
      >
        {(renaming ? draftIcon : space.icon_url || defaultIcon) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={
              (renaming ? draftIcon : space.icon_url || defaultIcon) as string
            }
            alt={space.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-xl font-bold">
            {space.name.charAt(0).toUpperCase()}
          </span>
        )}
        {renaming && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-lg">
            <span className="text-white text-[10px] font-medium">edit</span>
          </div>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          isPickingFile.current = false;
          if (!file) return;

          const localPreview = URL.createObjectURL(file);
          setDraftIcon(localPreview);

          try {
            const fileUrl = await uploadImage(file, "spaces");
            setDraftIcon(fileUrl);
          } catch {
            setDraftIcon(space.icon_url || defaultIcon);
          }

          e.target.value = "";
        }}
        onBlur={() => {
          isPickingFile.current = false;
        }}
      />

      {/* Text content */}
      <div className="min-w-0 flex-1 overflow-hidden">
        {renaming ? (
          <div
            ref={containerRef}
            className="flex flex-col gap-1"
            onClick={(e) => e.preventDefault()}
          >
            <input
              ref={nameRef}
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              placeholder="Space name"
              className="text-base font-semibold font-head text-foreground bg-transparent border-b border-border focus:border-accent/40 outline-none w-full placeholder:text-muted-foreground/40"
            />
            <input
              value={draftDesc}
              onChange={(e) => setDraftDesc(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              placeholder="Add a description…"
              className="text-sm text-muted-foreground bg-transparent border-b border-border outline-none w-full mt-0.5 placeholder:text-muted-foreground/30 focus:border-accent/40 transition-[color]"
            />
          </div>
        ) : (
          <>
            <h3 className="text-base font-semibold font-head text-foreground truncate group-hover:text-accent transition-[color]">
              {space.name}
            </h3>
            {space.description && (
              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2 wrap-break-word">
                {space.description}
              </p>
            )}
            <p className="text-[11px] text-muted-foreground mt-1">
              {timeAgo(space.updated_at)}
            </p>
          </>
        )}
      </div>

      {/* 3-dot menu */}
      {(onRename || onDelete) && !renaming && (
        <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5">
          <SpaceMenu onRename={startRename} onDelete={handleDeleteRequest} />
        </div>
      )}

      {isNew && (
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onCancel?.();
          }}
          className="shrink-0 self-start mt-0.5 p-1.5 rounded-md
               text-muted-foreground hover:text-destructive
               hover:bg-destructive/10 transition-colors cursor-pointer"
          aria-label="Cancel"
        >
          <X size={14} weight="bold" />
        </button>
      )}
    </div>
  );

  return (
    <>
      {renaming ? (
        <div className="group block">{cardContent}</div>
      ) : (
        <Link
          href={`/spaces/${space.slug}`}
          onClick={onClick}
          className="group block"
        >
          {cardContent}
        </Link>
      )}
    </>
  );
}
