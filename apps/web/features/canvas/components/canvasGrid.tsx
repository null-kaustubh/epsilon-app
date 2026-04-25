import React from "react";
import { Responsive } from "react-grid-layout/legacy";
import { Layout } from "react-grid-layout/legacy";
import { Block, BlockStyle } from "../lib/createBlockHelper";
import { ROW_HEIGHT, MARGIN, CONTAINER_PADDING, CANVAS_MIN_WIDTH_PX } from "../lib/gridConstants";
import CanvasBlockItem from "./canvasBlockItem";

type Layouts = Partial<Record<string, Layout>>;

interface CanvasGridProps {
  blocks: Block[];
  layouts: Layouts;
  containerWidth: number;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  onLayoutChange: (current: Layout, all: Layouts) => void;
  onInteractionStart: () => void;
  onInteractionStop: () => void;
  onBlockGrow: (id: string, heightPx: number) => void;
  onChangeContent: (id: string, next: string) => void;
  onChangeBlockStyle: (id: string, style: BlockStyle) => void;
  onDeleteBlock: (id: string) => void;
  isDraggable?: boolean;
  mode: "cursor" | "delete";
}

function CanvasGrid({
  blocks,
  layouts,
  editingId,
  setEditingId,
  onLayoutChange,
  onInteractionStart,
  onInteractionStop,
  onBlockGrow,
  onChangeContent,
  onChangeBlockStyle,
  onDeleteBlock,
  isDraggable = true,
  mode,
}: CanvasGridProps) {
  const isInteractionModeNormal = mode === "cursor";

  return (
    <Responsive
      className="layout canvas-grid"
      width={CANVAS_MIN_WIDTH_PX}
      layouts={layouts}
      onLayoutChange={onLayoutChange}
      onDragStart={() => onInteractionStart()}
      onDragStop={() => onInteractionStop()}
      onResizeStart={() => onInteractionStart()}
      onResizeStop={() => onInteractionStop()}
      resizeHandles={["s", "w", "e", "n", "sw", "nw", "se", "ne"]}
      breakpoints={{ lg: 1200 }}
      cols={{ lg: 27 }}
      rowHeight={ROW_HEIGHT}
      margin={MARGIN}
      containerPadding={CONTAINER_PADDING}
      isResizable={isInteractionModeNormal}
      isDraggable={isInteractionModeNormal && isDraggable}
      compactType={null}
      preventCollision
      draggableCancel=".block-editor"
      // Transforms are significantly smoother with many items; keep React work
      // low so the cursor/placeholder remain visually in sync.
      useCSSTransforms={true}
    >
      {blocks.map((block) => (
        <div key={block.id}>
          <CanvasBlockItem
            block={block}
            isEditing={editingId === block.id}
            isDeleteMode={mode === "delete"}
            onDeleteBlock={onDeleteBlock}
            onStartEditingAction={setEditingId}
            onStopEditingAction={() => setEditingId(null)}
            onChangeContentAction={onChangeContent}
            onChangeBlockStyleAction={onChangeBlockStyle}
            onGrowAction={onBlockGrow}
          />
        </div>
      ))}
    </Responsive>
  );
}

export default React.memo(CanvasGrid);
