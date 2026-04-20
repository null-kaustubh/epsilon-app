import { BLOCK_W, CODE_BLOCK_W } from "./gridConstants";
import { initialBlockH } from "./blockToLayout";
import { v4 as uuidv4 } from "uuid";

export type BlockStyle = {
  fontSize?: number;
  color?: string;
};

export type Block = {
  id: string;
  type: "note" | "code" | "todo" | "image" | "markdown";
  x: number;
  y: number;
  w: number;
  h: number;
  content: string;
  style?: BlockStyle;
};

/**
 * Creates a new block at the given (x, y).
 * Position is determined by the caller (Canvas) using findNextAvailablePosition
 * so that the block never overlaps existing items regardless of their current
 * dragged positions.
 */
export function createBlock(type: Block["type"], x: number, y: number): Block {
  const content =
    type === "code"
      ? JSON.stringify({
          filename: "snippet.ts",
          language: "typescript",
          code: "",
        })
      : type === "todo"
        ? JSON.stringify({ title: "Todo list", items: [] })
        : "";
  const w = type === "code" ? CODE_BLOCK_W : BLOCK_W;
  const h = initialBlockH(type);

  return {
    id: uuidv4(),
    type,
    x,
    y,
    w,
    h,
    content,
  };
}
