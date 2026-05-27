import { useCallback, useEffect, useRef } from "react";
import { Layout } from "react-grid-layout/legacy";
import { Block } from "../lib/createBlockHelper";
import { spacesApi, UpsertBlockPayload } from "../../../lib/spaces";

type Layouts = Partial<Record<string, Layout>>;

type SaveStatus = "saved" | "saving" | "error";

interface UseSaveBlocksOptions {
  slug: string;
  spaceId: string;
  blocks: Block[];
  layoutsRef: React.MutableRefObject<Layouts>;
  savedBlockIdsRef: React.MutableRefObject<Set<string>>;
  onStatusChange: (status: SaveStatus) => void;
}

export function useSaveBlocks({
  slug,
  spaceId,
  blocks,
  layoutsRef,
  savedBlockIdsRef,
  onStatusChange,
}: UseSaveBlocksOptions) {
  const blocksRef = useRef(blocks);
  const isSavingRef = useRef(false);
  useEffect(() => {
    blocksRef.current = blocks;
  }, [blocks]);

  const save = useCallback(async () => {
    if (isSavingRef.current) return;
    const currentBlocks = blocksRef.current;
    const currentLayouts = layoutsRef.current;
    const lgItems = currentLayouts.lg ?? [];

    const payload: UpsertBlockPayload[] = currentBlocks.map((block) => {
      const layoutItem = lgItems.find((item) => item.i === block.id);
      return {
        id: block.id,
        space_id: spaceId,
        type: block.type,
        content: block.content,
        x: layoutItem?.x ?? block.x,
        y: layoutItem?.y ?? block.y,
        w: layoutItem?.w ?? block.w,
        h: layoutItem?.h ?? block.h,
        style: block.style ?? {},
      };
    });

    if (payload.length === 0) return;

    onStatusChange("saving");
    isSavingRef.current = true;
    try {
      await spacesApi.saveBlocks(slug, payload);
      payload.forEach((b) => savedBlockIdsRef.current.add(b.id));
      onStatusChange("saved");
    } catch {
      onStatusChange("error");
    } finally {
      isSavingRef.current = false;
    }
  }, [slug, spaceId, layoutsRef, savedBlockIdsRef, onStatusChange]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        save();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [save]);

  return { save };
}
