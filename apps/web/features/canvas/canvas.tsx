"use client";

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { useCanvasBlocks } from "./hooks/useCanvasBlock";
import { useContainerWidth } from "./hooks/useContainerWidth";
import CanvasGrid from "./components/canvasGrid";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CanvasToolbar from "./components/toolbar/CanvasToolbar";
import ThemeToggle from "./components/theme/ThemeToggle";
import { Space, SpaceBlock } from "../../lib/spaces";
import { useSaveBlocks } from "./hooks/useSaveBlocks";
import { CANVAS_MIN_WIDTH_PX } from "./lib/gridConstants";
import { HouseSimple } from "phosphor-react";
import Link from "next/link";

type SaveStatus = "saved" | "saving" | "error";

interface CanvasProps {
  space: Space;
  initialBlocks: SpaceBlock[];
}

export default function Canvas({ space, initialBlocks }: CanvasProps) {
  const { ref, width } = useContainerWidth();
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const viewportWidthRef = useRef(0);
  useEffect(() => {
    viewportWidthRef.current = width;
  }, [width]);

  const {
    blocks,
    layouts,
    layoutsRef,
    editingId,
    setEditingId,
    handleLayoutChange,
    handleInteractionStart,
    handleInteractionStop,
    handleAddBlock,
    handleBlockGrow,
    handleChangeContent,
    handleChangeBlockStyle,
    handleDeleteBlock,
    savedBlockIdsRef,
  } = useCanvasBlocks(initialBlocks, space.slug, viewportWidthRef);

  const handleStatusChange = useCallback((status: SaveStatus) => {
    setSaveStatus(status);
  }, []);

  useSaveBlocks({
    slug: space.slug,
    spaceId: space.id,
    blocks,
    layoutsRef,
    savedBlockIdsRef,
    onStatusChange: handleStatusChange,
  });

  const [mode, setMode] = useState<"cursor" | "delete">("cursor");
  const gridWidth = useMemo(() => {
    if (width <= 0) return 0;
    return Math.max(CANVAS_MIN_WIDTH_PX, Math.floor(width));
  }, [width]);

  return (
    <div className="canvas-wrapper w-full h-full overflow-visible">
      {/* Save status indicator — minimal, top left */}
      <div className="fixed top-1.5 left-3 z-50 text-sm text-muted-foreground select-none lowercase">
        {saveStatus === "saving" && "Saving…"}
        {saveStatus === "saved" && "Saved"}
        {saveStatus === "error" && "Save failed"}
      </div>

      <CanvasToolbar
        mode={mode}
        setMode={setMode}
        setEditingId={setEditingId}
        onAdd={handleAddBlock}
      />

      <Link
        href={"/home"}
        className="fixed top-3 right-18 z-50 p-2 rounded-xl
                 bg-background/80 backdrop-blur-md border shadow-sm
                 hover:bg-muted/70 transition-opacity cursor-pointer"
      >
        <HouseSimple size={18} />
      </Link>

      <ThemeToggle />

      <div className="canvas-scroll h-full overflow-x-auto overflow-y-scroll p-4 [scrollbar-gutter:stable]">
        <div ref={ref} className="w-full">
          {gridWidth > 0 ? (
            <CanvasGrid
              blocks={blocks}
              layouts={layouts}
              containerWidth={gridWidth}
              editingId={editingId}
              setEditingId={setEditingId}
              onLayoutChange={handleLayoutChange}
              onInteractionStart={handleInteractionStart}
              onInteractionStop={handleInteractionStop}
              onBlockGrow={handleBlockGrow}
              onChangeContent={handleChangeContent}
              onChangeBlockStyle={handleChangeBlockStyle}
              onDeleteBlock={handleDeleteBlock}
              mode={mode}
              isDraggable
            />
          ) : (
            <div className="min-h-[60vh]" />
          )}
        </div>
      </div>
    </div>
  );
}
