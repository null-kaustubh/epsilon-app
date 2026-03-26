import { BLOCK_MIN_H, MARGIN, ROW_HEIGHT } from "./gridConstants";

export const SINGLE_LINE_PX = 20;
export const EDITOR_PADDING_PX = 32;

export function contentHeightToRows(contentHeightPx: number): number {
  const marginY = MARGIN[1];
  // RGL item height formula:
  // heightPx = h * rowH + (h - 1) * marginY
  // => h >= (contentHeightPx + marginY) / (rowH + marginY)
  const desiredRows = Math.ceil(
    (contentHeightPx + marginY) / (ROW_HEIGHT + marginY),
  );
  return Math.max(BLOCK_MIN_H, desiredRows);
}
