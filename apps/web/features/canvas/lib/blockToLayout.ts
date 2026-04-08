import { Layout } from "react-grid-layout/legacy";
import { Block } from "./createBlockHelper";
import { contentHeightToRows } from "./blockSizing";
import {
  BLOCK_DEFAULT_H_PX,
  BLOCK_H,
  BLOCK_MIN_H,
  BLOCK_MIN_W,
  BLOCK_W,
  CODE_BLOCK_H,
  CODE_BLOCK_W,
  GRID_COLS,
} from "./gridConstants";

export type GridItem = Layout[number];

export function initialBlockH(type: Block["type"]): number {
  switch (type) {
    case "note":
    case "markdown":
    case "todo":
    case "image":
      return contentHeightToRows(BLOCK_DEFAULT_H_PX);
    case "code":
      return CODE_BLOCK_H;
    default:
      return BLOCK_H;
  }
}

export function findNextAvailablePosition(
  existingItems: Layout,
  w: number = BLOCK_W,
  h: number = BLOCK_H,
): { x: number; y: number } {
  const occupied = new Set<string>();
  for (const item of existingItems) {
    for (let row = item.y; row < item.y + item.h; row++) {
      for (let col = item.x; col < item.x + item.w; col++) {
        occupied.add(`${col},${row}`);
      }
    }
  }

  const fits = (x: number, y: number): boolean => {
    if (x + w > GRID_COLS) return false;
    for (let row = y; row < y + h; row++) {
      for (let col = x; col < x + w; col++) {
        if (occupied.has(`${col},${row}`)) return false;
      }
    }
    return true;
  };

  const maxY =
    existingItems.length === 0
      ? 0
      : Math.max(...existingItems.map((i) => i.y + i.h));

  for (let y = 0; y <= maxY + h; y++) {
    for (let x = 0; x <= GRID_COLS - w; x++) {
      if (fits(x, y)) return { x, y };
    }
  }

  return { x: 0, y: maxY + 1 };
}

export function blockToLayout(block: Block): GridItem {
  const w = block.type === "code" ? CODE_BLOCK_W : BLOCK_W;
  const h = initialBlockH(block.type);
  // Keep code blocks from shrinking too aggressively; it's easier to keep editor overlay aligned.
  const minW = block.type === "code" ? BLOCK_MIN_W + 3 : BLOCK_MIN_W;

  return {
    i: block.id,
    x: block.x,
    y: block.y,
    w,
    h,
    minW,
    minH: BLOCK_MIN_H,
  };
}
