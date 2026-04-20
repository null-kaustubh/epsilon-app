"use client";

import { CaretLeft, CaretRight } from "phosphor-react";
import { Space } from "../../../lib/spaces";
import { RecentSpace } from "../../../hooks/useRecents";
import { useHorizontalScroll } from "../hooks/useHorizontalScroll";
import { SpaceCardSkeleton } from "./SpaceCardSkeleton";
import SpaceCard from "./SpaceCard";
import { cn } from "../../../lib/utils";
import { useEffect } from "react";

type Props = {
  spaces: Space[];
  recents: RecentSpace[];
  hydrated: boolean;
  addRecent: (slug: string, name: string) => void;
};

export function RecentlyVisited({
  spaces,
  recents,
  hydrated,
  addRecent,
}: Props) {
  const { scrollRef, canScrollLeft, canScrollRight, scroll, checkScroll } =
    useHorizontalScroll(hydrated);

  const recentSpaces = recents
    .map((r) => spaces.find((s) => s.slug === r.slug))
    .filter(Boolean) as Space[];

  useEffect(() => {
    checkScroll();
  }, [recentSpaces.length, checkScroll]);
  return (
    <div>
      <h2 className="text-xl text-secondary-foreground font-head mb-4">
        Recently visited
      </h2>

      <div className="relative">
        {/* Left fade */}
        <div
          className={cn(
            "absolute left-0 top-0 bottom-0 w-12 z-10 pointer-events-none",
            "bg-linear-to-r from-background to-transparent transition-opacity duration-200",
            canScrollLeft ? "opacity-100" : "opacity-0",
          )}
        />

        {/* Right fade */}
        <div
          className={cn(
            "absolute right-0 top-0 bottom-0 w-12 z-10 pointer-events-none",
            "bg-linear-to-l from-background to-transparent transition-opacity duration-200",
            canScrollRight ? "opacity-100" : "opacity-0",
          )}
        />

        {/* Left button */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20
                       w-7 h-7 flex items-center justify-center
                       text-muted-foreground hover:text-foreground
                       transition-[color] cursor-pointer"
          >
            <CaretLeft size={14} weight="bold" />
          </button>
        )}

        {/* Right button */}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20
                       w-7 h-7 flex items-center justify-center
                       text-muted-foreground hover:text-foreground
                       transition-[color] cursor-pointer"
          >
            <CaretRight size={14} weight="bold" />
          </button>
        )}

        {/* Scroll container */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {!hydrated ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="shrink-0 w-90">
                <SpaceCardSkeleton />
              </div>
            ))
          ) : recentSpaces.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent spaces.</p>
          ) : (
            recentSpaces.map((space) => (
              <div key={space.id} className="shrink-0 w-90">
                <SpaceCard
                  space={space}
                  onClick={() => addRecent(space.slug, space.name)}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
