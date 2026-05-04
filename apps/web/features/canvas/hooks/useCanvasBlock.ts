import { useState, useCallback, useRef, useEffect } from "react";
import { Layout } from "react-grid-layout/legacy";
import { Block, BlockStyle, createBlock } from "../lib/createBlockHelper";
import {
  blockToLayout,
  findNextAvailablePosition,
  initialBlockH,
} from "../lib/blockToLayout";
import { contentHeightToRows } from "../lib/blockSizing";
import { SpaceBlock, spacesApi } from "../../../lib/spaces";
import { BLOCK_W, CODE_BLOCK_W, visibleCols } from "../lib/gridConstants";

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
    style: (b.style as BlockStyle | undefined) ?? undefined,
  }));

  const lg: Layout = blocks.map((b) => blockToLayout(b));

  return { blocks, layouts: { lg } };
}

export function useCanvasBlocks(
  initialBlocks: SpaceBlock[] = [],
  slug: string,
  viewportWidthRef: React.RefObject<number>,
) {
  const init = blocksFromDB(initialBlocks);

  const [blocks, setBlocks] = useState<Block[]>(init.blocks);
  const [layouts, setLayouts] = useState<Layouts>(init.layouts);
  const [editingId, setEditingId] = useState<string | null>(null);

  const savedBlockIdsRef = useRef<Set<string>>(
    new Set(initialBlocks.map((b) => b.id)),
  );

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
      setLayouts(latest);
    });
  }, []);

  const handleAddBlock = useCallback((type: Block["type"]) => {
    const cols = visibleCols(viewportWidthRef.current ?? 0);
    const currentLayouts = layoutsRef.current;
    const currentItems = currentLayouts.lg ?? [];

    const desiredW = type === "code" ? CODE_BLOCK_W : BLOCK_W;
    const desiredH = initialBlockH(type);
    const { x, y } = findNextAvailablePosition(
      currentItems,
      desiredW,
      desiredH,
      cols,
    );

    const newBlock = createBlock(type, x, y);
    const newItem = blockToLayout(newBlock);

    const nextLayouts = {
      ...currentLayouts,
      lg: [...currentItems, newItem],
    };

    setBlocks((prev) => [...prev, newBlock]);

    layoutsRef.current = nextLayouts;
    setLayouts(nextLayouts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const handleChangeBlockStyle = useCallback(
    (id: string, style: BlockStyle) => {
      setBlocks((prev) =>
        prev.map((block) => (block.id === id ? { ...block, style } : block)),
      );
    },
    [],
  );

  const handleDeleteBlock = useCallback(
    async (id: string) => {
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

      if (!savedBlockIdsRef.current.has(id)) return;
      savedBlockIdsRef.current.delete(id);

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
    handleChangeBlockStyle,
    handleDeleteBlock,
    savedBlockIdsRef,
  };
}
