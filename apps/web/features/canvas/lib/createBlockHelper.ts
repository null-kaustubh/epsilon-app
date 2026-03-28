import { nanoid } from "nanoid";

export type Block = {
  id: string;
  type: "note" | "code" | "todo" | "image" | "markdown";
  x: number;
  y: number;
  content: string;
};

/**
 * Creates a new block at the given (x, y).
 * Position is determined by the caller (Canvas) using findNextAvailablePosition
 * so that the block never overlaps existing items regardless of their current
 * dragged positions.
 */
export function createBlock(type: Block["type"], x: number, y: number): Block {
  return {
    id: nanoid(),
    type,
    x,
    y,
    content: "",
  };
}
