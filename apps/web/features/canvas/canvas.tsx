"use client";

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import AddBlockButton from "./components/addBlockButton";
import { useCanvasBlocks } from "./hooks/useCanvasBlock";
import { useContainerWidth } from "./hooks/useContainerWidth";
import CanvasGrid from "./components/canvasGrid";
import { useMemo } from "react";

export default function Canvas() {
  const { ref, width } = useContainerWidth();
  const {
    blocks,
    layouts,
    editingId,
    setEditingId,
    handleLayoutChange,
    handleAddBlock,
    handleBlockGrow,
    handleChangeContent,
  } = useCanvasBlocks();
  const gridWidth = useMemo(
    () => (width > 0 ? Math.floor(width) : 1200),
    [width],
  );

  return (
    <div className="canvas-wrapper w-full h-[calc(100vh-3rem)] overflow-visible">
      <div className="fixed bottom-6 right-6 z-50">
        <AddBlockButton onAdd={handleAddBlock} />
      </div>

      <div className="canvas-scroll h-full overflow-x-hidden overflow-y-scroll p-4 [scrollbar-gutter:stable]">
        <div ref={ref} className="w-full">
          <CanvasGrid
            blocks={blocks}
            layouts={layouts}
            containerWidth={gridWidth}
            editingId={editingId}
            setEditingId={setEditingId}
            onLayoutChange={handleLayoutChange}
            onBlockGrow={handleBlockGrow}
            onChangeContent={handleChangeContent}
            isDraggable
          />
        </div>
      </div>
    </div>
  );
}
