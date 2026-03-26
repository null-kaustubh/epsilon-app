import { useState, useCallback } from "react";
import { Layout } from "react-grid-layout/legacy";
import { Block, createBlock } from "../lib/createBlockHelper";
import { blockToLayout, findNextAvailablePosition } from "../lib/blockToLayout";
import { contentHeightToRows } from "../lib/blockSizing";

type Layouts = Partial<Record<string, Layout>>;

export function useCanvasBlocks() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [layouts, setLayouts] = useState<Layouts>({ lg: [] });
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleLayoutChange = useCallback(
    (_current: Layout, allLayouts: Layouts) => {
      setLayouts(allLayouts);
    },
    [],
  );

  const handleAddBlock = useCallback(
    (type: Block["type"]) => {
      const currentItems = layouts.lg ?? [];
      const { x, y } = findNextAvailablePosition(currentItems);
      const newBlock = createBlock(type, x, y);
      const newItem = blockToLayout(newBlock);

      setBlocks((prev) => [...prev, newBlock]);
      setLayouts((prev) => ({
        ...prev,
        lg: [...(prev.lg ?? []), newItem],
      }));
    },
    [layouts],
  );

  const handleBlockGrow = useCallback((id: string, contentHeightPx: number) => {
    const nextH = contentHeightToRows(contentHeightPx);

    setLayouts((prev) => {
      const lg = prev.lg ?? [];
      let changed = false;
      const nextLg = lg.map((item) => {
        if (item.i !== id) return item;
        if (nextH <= item.h) return item;
        changed = true;
        return { ...item, h: nextH };
      });
      return changed ? { ...prev, lg: nextLg } : prev;
    });
  }, []);

  const handleChangeContent = useCallback((id: string, next: string) => {
    setBlocks((prev) =>
      prev.map((block) =>
        block.id === id ? { ...block, content: next } : block,
      ),
    );
  }, []);

  return {
    blocks,
    layouts,
    editingId,
    setEditingId,
    handleLayoutChange,
    handleAddBlock,
    handleBlockGrow,
    handleChangeContent,
  };
}
