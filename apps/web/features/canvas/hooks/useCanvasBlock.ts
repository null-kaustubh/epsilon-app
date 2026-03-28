import { useState, useCallback, useRef, useEffect } from "react";
import { Layout } from "react-grid-layout/legacy";
import { Block, createBlock } from "../lib/createBlockHelper";
import { blockToLayout, findNextAvailablePosition } from "../lib/blockToLayout";
import { contentHeightToRows } from "../lib/blockSizing";

type Layouts = Partial<Record<string, Layout>>;

export function useCanvasBlocks() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [layouts, setLayouts] = useState<Layouts>({ lg: [] });
  const [editingId, setEditingId] = useState<string | null>(null);

  // Cursor/handle desync under load (e.g. console open) is commonly caused by
  // React state updates racing the drag/resize loop. We keep the latest
  // layout in a ref and only commit it to React state when the interaction ends.
  const layoutsRef = useRef<Layouts>(layouts);
  useEffect(() => {
    layoutsRef.current = layouts;
  }, [layouts]);
  const isInteractingRef = useRef(false);
  const syncRafRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (syncRafRef.current != null) {
        cancelAnimationFrame(syncRafRef.current);
      }
    };
  }, []);

  const handleLayoutChange = useCallback(
    (_current: Layout, allLayouts: Layouts) => {
      layoutsRef.current = allLayouts;
    },
    [],
  );

  const handleInteractionStart = useCallback(() => {
    isInteractingRef.current = true;
  }, []);

  const handleInteractionStop = useCallback(() => {
    isInteractingRef.current = false;

    // Ensure the last `onLayoutChange` (which updates `layoutsRef`) has run
    // before we commit React state. Under load (console open) the ordering can
    // otherwise cause a "snap back" on the next render/add.
    if (syncRafRef.current != null) cancelAnimationFrame(syncRafRef.current);
    syncRafRef.current = requestAnimationFrame(() => {
      syncRafRef.current = null;
      setLayouts(layoutsRef.current);
    });
  }, []);

  const handleAddBlock = useCallback((type: Block["type"]) => {
    const currentLayouts = layoutsRef.current;
    const currentItems = currentLayouts.lg ?? [];

    const { x, y } = findNextAvailablePosition(currentItems);

    const newBlock = createBlock(type, x, y);
    const newItem = blockToLayout(newBlock);

    const nextLayouts = {
      ...currentLayouts,
      lg: [...currentItems, newItem],
    };

    setBlocks((prev) => [...prev, newBlock]);

    // update both
    layoutsRef.current = nextLayouts;
    setLayouts(nextLayouts);
  }, []);

  // Batch "auto-grow" updates so rendering many blocks doesn't trigger
  // dozens of synchronous layout state commits.
  const pendingGrowRef = useRef<Map<string, number>>(new Map());
  const growRafRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (growRafRef.current != null) cancelAnimationFrame(growRafRef.current);
    };
  }, []);

  const flushGrow = useCallback(() => {
    growRafRef.current = null;
    if (isInteractingRef.current) {
      pendingGrowRef.current.clear();
      return;
    }

    const pending = pendingGrowRef.current;
    if (pending.size === 0) return;

    pendingGrowRef.current = new Map();

    setLayouts((prev) => {
      const lg = prev.lg ?? [];
      if (!lg.length) return prev;

      let changed = false;
      const nextLg = lg.map((item) => {
        const nextH = pending.get(item.i);
        if (nextH == null) return item;
        if (nextH <= item.h) return item;
        changed = true;
        return { ...item, h: nextH };
      });

      if (!changed) return prev;

      const nextLayouts = { ...prev, lg: nextLg };
      layoutsRef.current = nextLayouts;
      return nextLayouts;
    });
  }, []);

  const handleBlockGrow = useCallback(
    (id: string, contentHeightPx: number) => {
      if (isInteractingRef.current) return;

      const nextH = contentHeightToRows(contentHeightPx);

      const currentPending = pendingGrowRef.current.get(id);
      if (currentPending == null || nextH > currentPending) {
        pendingGrowRef.current.set(id, nextH);
      }

      if (growRafRef.current == null) {
        growRafRef.current = requestAnimationFrame(flushGrow);
      }
    },
    [flushGrow],
  );

  const handleChangeContent = useCallback((id: string, next: string) => {
    setBlocks((prev) =>
      prev.map((block) =>
        block.id === id ? { ...block, content: next } : block,
      ),
    );
  }, []);

  const handleDeleteBlock = useCallback((id: string) => {
    // Remove only the clicked block item + its layout entry.
    // `compactType={null}` ensures other blocks don't reflow after deletion.
    pendingGrowRef.current.delete(id);

    setBlocks((prev) => prev.filter((b) => b.id !== id));
    setEditingId((prev) => (prev === id ? null : prev));

    setLayouts((prev) => {
      const lg = prev.lg ?? [];
      const nextLg = lg.filter((item) => item.i !== id);
      const nextLayouts = { ...prev, lg: nextLg };
      layoutsRef.current = nextLayouts;
      return nextLayouts;
    });
  }, []);

  return {
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
  };
}
