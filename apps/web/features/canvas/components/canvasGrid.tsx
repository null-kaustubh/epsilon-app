import { Responsive } from "react-grid-layout/legacy";
import { Layout } from "react-grid-layout/legacy";
import { Block } from "../lib/createBlockHelper";
import { ROW_HEIGHT, MARGIN, CONTAINER_PADDING } from "../lib/gridConstants";
import CanvasBlockItem from "./canvasBlockItem";

type Layouts = Partial<Record<string, Layout>>;

interface CanvasGridProps {
  blocks: Block[];
  layouts: Layouts;
  containerWidth: number;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  onLayoutChange: (current: Layout, all: Layouts) => void;
  onBlockGrow: (id: string, heightPx: number) => void;
  onChangeContent: (id: string, next: string) => void;
  isDraggable?: boolean;
}

export default function CanvasGrid({
  blocks,
  layouts,
  containerWidth,
  editingId,
  setEditingId,
  onLayoutChange,
  onBlockGrow,
  onChangeContent,
  isDraggable = true,
}: CanvasGridProps) {
  return (
    <Responsive
      className="layout canvas-grid"
      width={containerWidth}
      layouts={layouts}
      onLayoutChange={onLayoutChange}
      resizeHandles={["s", "w", "e", "n", "sw", "nw", "se", "ne"]}
      breakpoints={{ lg: 1200 }}
      cols={{ lg: 27 }}
      rowHeight={ROW_HEIGHT}
      margin={MARGIN}
      containerPadding={CONTAINER_PADDING}
      isResizable
      isDraggable={isDraggable}
      compactType={null}
      preventCollision
      draggableCancel=".block-editor"
    >
      {blocks.map((block) => (
        <div key={block.id}>
          <CanvasBlockItem
            block={block}
            isEditing={editingId === block.id}
            onStartEditingAction={setEditingId}
            onStopEditingAction={() => setEditingId(null)}
            onChangeContentAction={onChangeContent}
            onGrowAction={onBlockGrow}
          />
        </div>
      ))}
    </Responsive>
  );
}
