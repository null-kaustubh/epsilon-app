export const GRID_COLS = 27;
export const BLOCK_W = 4;
export const BLOCK_H = 4;
export const BLOCK_MIN_W = 2;
export const BLOCK_MIN_H = 3;
export const ROW_HEIGHT = 34;
export const MARGIN: [number, number] = [10, 10];
export const CONTAINER_PADDING: [number, number] = [10, 10];

export const BLOCK_DEFAULT_H_PX = 180;

export const CODE_BLOCK_W = 8;
export const CODE_BLOCK_H = 6;

// Keep block sizing consistent across laptop/desktop by preventing the grid from
// shrinking below the design width; narrower viewports will scroll horizontally.
export const CANVAS_MIN_WIDTH_PX = 1870;

export function visibleCols(viewportWidth: number): number {
  const [marginX] = MARGIN;
  const [padX] = CONTAINER_PADDING;
  const colWidth =
    (CANVAS_MIN_WIDTH_PX - 2 * padX - (GRID_COLS + 1) * marginX) / GRID_COLS;
  return Math.floor(
    (viewportWidth - 2 * padX - marginX) / (colWidth + marginX),
  );
}
