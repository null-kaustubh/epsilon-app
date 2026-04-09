import { useState, useCallback, useRef, useEffect } from "react";
import { Layout } from "react-grid-layout/legacy";
import { Block, createBlock } from "../lib/createBlockHelper";
import {
  blockToLayout,
  findNextAvailablePosition,
  initialBlockH,
} from "../lib/blockToLayout";
import { contentHeightToRows } from "../lib/blockSizing";
import { SpaceBlock, spacesApi } from "../../../lib/spaces";
import { BLOCK_W, CODE_BLOCK_W } from "../lib/gridConstants";

type Layouts = Partial<Record<string, Layout>>;

function blocksFromDB(dbBlocks: SpaceBlock[]): {
  blocks: Block[];
  layouts: Layouts;
} {
  const blocks: Block[] = dbBlocks.map((b) => ({
    id: b.id,
    type: b.type,
    content: b.content,
    x: b.x,
    y: b.y,
    w: b.w,
    h: b.h,
  }));

  const lg: Layout = blocks.map((b) => blockToLayout(b));

  return { blocks, layouts: { lg } };
}

export function useCanvasBlocks(
  initialBlocks: SpaceBlock[] = [],
  slug: string,
) {
  const init = blocksFromDB(initialBlocks);

  const [blocks, setBlocks] = useState<Block[]>(init.blocks);
  const [layouts, setLayouts] = useState<Layouts>(init.layouts);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Cursor/handle desync under load (e.g. console open) is commonly caused by
  // React state updates racing the drag/resize loop. We keep the latest
  // layout in a ref and only commit it to React state when the interaction ends.
  const layoutsRef = useRef<Layouts>(init.layouts);

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
    if (syncRafRef.current != null) cancelAnimationFrame(syncRafRef.current);
    syncRafRef.current = requestAnimationFrame(() => {
      syncRafRef.current = null;
      const latest = layoutsRef.current;
      setLayouts(latest); // commit ref → state, not the other way around
    });
  }, []);

  const handleAddBlock = useCallback((type: Block["type"]) => {
    const currentLayouts = layoutsRef.current;
    const currentItems = currentLayouts.lg ?? [];

    const desiredW = type === "code" ? CODE_BLOCK_W : BLOCK_W;
    const desiredH = initialBlockH(type);
    const { x, y } = findNextAvailablePosition(
      currentItems,
      desiredW,
      desiredH,
    );

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

  const handleDeleteBlock = useCallback(
    async (id: string) => {
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

      // then delete from DB
      try {
        await spacesApi.deleteBlock(slug, id);
      } catch {
        // optionally show an error toast here later
        console.error("Failed to delete block from DB");
      }
    },
    [slug],
  );

  return {
    blocks,
    layouts,
    editingId,
    layoutsRef,
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
