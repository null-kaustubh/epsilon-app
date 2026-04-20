"use client";

import { useState } from "react";
import { CaretDown, CaretUp, PlusCircle } from "phosphor-react";
import { Space } from "../../../lib/spaces";
import { PendingDelete, ghostSpace } from "../hooks/useSpaces";
import SpaceCard from "./SpaceCard";
import { cn } from "../../../lib/utils";

const COLS = 3;
const ROW_H = 140;
const VISIBLE_ROWS = 2;

type Props = {
  spaces: Space[];
  creating: boolean;
  setCreating: (v: boolean) => void;
  pendingDeletes: PendingDelete[];
  addRecent: (slug: string, name: string) => void;
  onCreateSpace: (name: string, desc: string, icon: string) => void;
  onRenameSpace: (
    space: Space,
    name: string,
    desc: string,
    icon: string,
  ) => void;
  onDeleteSpace: (space: Space) => void;
};

export function YourSpaces({
  spaces,
  creating,
  setCreating,
  pendingDeletes,
  addRecent,
  onCreateSpace,
  onRenameSpace,
  onDeleteSpace,
}: Props) {
  const [rowOffset, setRowOffset] = useState(0);

  const allCards = [...(creating ? [null] : []), ...spaces];
  const rows: (Space | null)[][] = [];
  for (let i = 0; i < allCards.length; i += COLS) {
    rows.push(allCards.slice(i, i + COLS));
  }

  const totalRows = rows.length;
  const canScrollUp = rowOffset > 0;
  const canScrollDown = rowOffset + VISIBLE_ROWS < totalRows;

  return (
    <div>
      <div className="flex items-center gap-3">
        <h2 className="text-xl text-secondary-foreground font-head">
          Your spaces
        </h2>
        <button
          onClick={() => setCreating(true)}
          className="rounded-md text-accent flex items-center justify-center cursor-pointer"
        >
          <PlusCircle size={20} />
        </button>
      </div>

      <div className="relative">
        {/* Up caret */}
        <div className="flex justify-center mb-2 h-4">
          {canScrollUp && (
            <button
              onClick={() => setRowOffset((r) => r - 1)}
              className="w-7 h-7 flex items-center justify-center
                         text-muted-foreground hover:text-foreground
                         transition-[color] cursor-pointer"
            >
              <CaretUp size={14} weight="bold" />
            </button>
          )}
        </div>

        {/* Clipping window */}
        <div
          className="overflow-hidden relative"
          style={{ height: VISIBLE_ROWS * ROW_H + (VISIBLE_ROWS - 1) * 12 }}
        >
          {/* Top fade */}
          <div
            className={cn(
              "absolute top-0 left-0 right-0 h-12 z-10 pointer-events-none",
              "bg-linear-to-b from-background to-transparent transition-opacity duration-200",
              canScrollUp ? "opacity-100" : "opacity-0",
            )}
          />

          {/* Bottom fade */}
          <div
            className={cn(
              "absolute bottom-0 left-0 right-0 h-12 z-10 pointer-events-none",
              "bg-linear-to-t from-background to-transparent transition-opacity duration-200",
              canScrollDown ? "opacity-100" : "opacity-0",
            )}
          />

          {/* Sliding track */}
          <div
            className="flex flex-col gap-3 transition-transform duration-300 ease-in-out"
            style={{ transform: `translateY(-${rowOffset * (ROW_H + 12)}px)` }}
          >
            {rows.map((row, ri) => (
              <div
                key={ri}
                className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3"
              >
                {row.map((space) =>
                  space === null ? (
                    <SpaceCard
                      key="__new__"
                      space={ghostSpace}
                      isNew
                      onRename={(name, desc, icon) =>
                        onCreateSpace(name, desc, icon)
                      }
                      onCancel={() => setCreating(false)}
                    />
                  ) : (
                    <SpaceCard
                      key={space.id}
                      space={space}
                      onClick={() => addRecent(space.slug, space.name)}
                      onRename={(name, desc, icon) =>
                        onRenameSpace(space, name, desc, icon)
                      }
                      isPendingDelete={pendingDeletes.some(
                        (p) => p.space.id === space.id,
                      )}
                      onDelete={() => onDeleteSpace(space)}
                    />
                  ),
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Down caret */}
        <div className="flex justify-center mt-2 h-9">
          {canScrollDown && (
            <button
              onClick={() => setRowOffset((r) => r + 1)}
              className="w-7 h-7 flex items-center justify-center
                         text-muted-foreground hover:text-foreground
                         transition-[color] cursor-pointer"
            >
              <CaretDown size={14} weight="bold" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
