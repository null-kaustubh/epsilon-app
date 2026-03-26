import { Layout } from "react-grid-layout/legacy";
import { Block } from "./createBlockHelper";
import { contentHeightToRows } from "./blockSizing";
import {
  BLOCK_DEFAULT_H_PX,
  BLOCK_H,
  BLOCK_MIN_H,
  BLOCK_MIN_W,
  BLOCK_W,
  GRID_COLS,
} from "./gridConstants";

export type GridItem = Layout[number];

function initialBlockH(type: Block["type"]): number {
  switch (type) {
    case "note":
    case "markdown":
      return contentHeightToRows(BLOCK_DEFAULT_H_PX);
    case "image":
      return BLOCK_H;
    case "code":
    case "todo":
      return BLOCK_H;
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
  return {
    i: block.id,
    x: block.x,
    y: block.y,
    w: BLOCK_W,
    h: initialBlockH(block.type),
    minW: BLOCK_MIN_W,
    minH: BLOCK_MIN_H,
  };
}
