"use client";

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { useCanvasBlocks } from "./hooks/useCanvasBlock";
import { useContainerWidth } from "./hooks/useContainerWidth";
import CanvasGrid from "./components/canvasGrid";
import { useCallback, useMemo, useState } from "react";
import CanvasToolbar from "./components/toolbar/CanvasToolbar";
import ThemeToggle from "./components/theme/ThemeToggle";
import { Space, SpaceBlock } from "../../lib/spaces";
import { useSaveBlocks } from "./hooks/useSaveBlocks";

type SaveStatus = "saved" | "saving" | "error";

interface CanvasProps {
  space: Space;
  initialBlocks: SpaceBlock[];
}

export default function Canvas({ space, initialBlocks }: CanvasProps) {
  const { ref, width } = useContainerWidth();
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");

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
    handleDeleteBlock,
  } = useCanvasBlocks(initialBlocks, space.slug);

  const handleStatusChange = useCallback((status: SaveStatus) => {
    setSaveStatus(status);
  }, []);

  useSaveBlocks({
    slug: space.slug,
    spaceId: space.id,
    blocks,
    layoutsRef,
    onStatusChange: handleStatusChange,
  });

  const [mode, setMode] = useState<"cursor" | "delete">("cursor");
  // Avoid mounting RGL with a guessed width (causes a visible "jump" as it re-measures).
  const gridWidth = useMemo(() => (width > 0 ? Math.floor(width) : 0), [width]);

  return (
    <div className="canvas-wrapper w-full h-full overflow-visible">
      {/* Save status indicator — minimal, top left */}
      <div className="fixed top-3 left-4 z-50 text-[11px] text-muted-foreground select-none">
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

      <ThemeToggle />

      <div className="canvas-scroll h-full overflow-x-hidden overflow-y-scroll p-4 [scrollbar-gutter:stable]">
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
