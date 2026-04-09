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
  onStatusChange: (status: SaveStatus) => void;
}

export function useSaveBlocks({
  slug,
  spaceId,
  blocks,
  layoutsRef,
  onStatusChange,
}: UseSaveBlocksOptions) {
  const blocksRef = useRef(blocks);
  useEffect(() => {
    blocksRef.current = blocks;
  }, [blocks]);

  const save = useCallback(async () => {
    const currentBlocks = blocksRef.current;
    const currentLayouts = layoutsRef.current;
    const lgItems = currentLayouts.lg ?? [];

    // merge block content with live layout positions
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
      };
    });

    if (payload.length === 0) return;

    onStatusChange("saving");
    try {
      console.log("payload being sent:", JSON.stringify(payload));
      await spacesApi.saveBlocks(slug, payload);
      onStatusChange("saved");
    } catch {
      onStatusChange("error");
    }
  }, [slug, spaceId, layoutsRef, onStatusChange]);

  // Ctrl+S handler
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
