"use client";

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { useCanvasBlocks } from "./hooks/useCanvasBlock";
import { useContainerWidth } from "./hooks/useContainerWidth";
import CanvasGrid from "./components/canvasGrid";
import { useMemo, useState } from "react";
import CanvasToolbar from "./components/toolbar/CanvasToolbar";
import ThemeToggle from "./components/theme/ThemeToggle";

export default function Canvas() {
  const { ref, width } = useContainerWidth();
  const {
    blocks,
    layouts,
    editingId,
    setEditingId,
    handleLayoutChange,
    handleInteractionStart,
    handleInteractionStop,
    handleAddBlock,
    handleBlockGrow,
    handleChangeContent,
    handleDeleteBlock,
  } = useCanvasBlocks();

  const [mode, setMode] = useState<"cursor" | "delete">("cursor");
  const gridWidth = useMemo(
    () => (width > 0 ? Math.floor(width) : 1200),
    [width],
  );

  return (
    <div className="canvas-wrapper w-full h-full overflow-visible">
      <CanvasToolbar
        mode={mode}
        setMode={setMode}
        setEditingId={setEditingId}
        onAdd={handleAddBlock}
      />

      <ThemeToggle />

      <div className="canvas-scroll h-full overflow-x-hidden overflow-y-scroll p-4 [scrollbar-gutter:stable]">
        <div ref={ref} className="w-full">
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
        </div>
      </div>
    </div>
  );
}
