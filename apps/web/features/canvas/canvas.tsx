"use client";

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import AddBlockButton from "./components/addBlockButton";
import { useCanvasBlocks } from "./hooks/useCanvasBlock";
import { useContainerWidth } from "./hooks/useContainerWidth";
import CanvasGrid from "./components/canvasGrid";
import { useMemo, useState } from "react";

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
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 items-end">
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => {
              setMode("cursor");
            }}
            className={`px-3 py-2 rounded-xl bg-muted hover:bg-muted/70 transition ${
              mode === "cursor" ? "outline outline-ring/50" : ""
            }`}
          >
            Cursor
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("delete");
              setEditingId(null);
            }}
            className={`px-3 py-2 rounded-xl bg-muted hover:bg-muted/70 transition ${
              mode === "delete" ? "outline outline-ring/50" : ""
            }`}
          >
            Delete
          </button>
        </div>

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
