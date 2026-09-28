import { COLS, ROWS, VOID, ghostY, type Game, type Matrix } from "./game";
import { PATTERNS, type Pattern } from "./patterns";

const SIZE = 30;
const COLORS: Record<number, string> = {
  1: "#9dd8ff",
  2: "#b0a1fa",
  3: "#f39c8d",
  4: "#75d3d0",
  5: "#e2c293",
  6: "#819fef",
  7: "#cb9fce",
  [VOID]: "#384660",
};

function cell(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  alpha = 1,
): void {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fillRect(x + 1, y + 1, size - 2, size - 2);
  ctx.fillStyle = "rgba(255,255,255,.27)";
  ctx.fillRect(x + 2, y + 2, size - 4, 2);
  ctx.fillStyle = "rgba(17,15,35,.2)";
  ctx.fillRect(x + 2, y + size - 4, size - 4, 2);
  ctx.globalAlpha = 1;
}

function piece(
  ctx: CanvasRenderingContext2D,
  cells: Matrix,
  x: number,
  y: number,
  alpha = 1,
): void {
  cells.forEach((row, rowIndex) =>
    row.forEach((value, colIndex) => {
      if (value && y + rowIndex >= 0)
        cell(
          ctx,
          (x + colIndex) * SIZE,
          (y + rowIndex) * SIZE,
          SIZE,
          COLORS[value]!,
          alpha,
        );
    }),
  );
}

export function drawBoard(
  ctx: CanvasRenderingContext2D,
  game: Game,
  position = game.current,
): void {
  ctx.fillStyle = "#0d1320";
  ctx.fillRect(0, 0, COLS * SIZE, ROWS * SIZE);
  ctx.strokeStyle = "#1b273b";
  ctx.lineWidth = 1;
  for (let x = 0; x <= COLS; x++) {
    ctx.beginPath();
    ctx.moveTo(x * SIZE + 0.5, 0);
    ctx.lineTo(x * SIZE + 0.5, ROWS * SIZE);
    ctx.stroke();
  }
  for (let y = 0; y <= ROWS; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * SIZE + 0.5);
    ctx.lineTo(COLS * SIZE, y * SIZE + 0.5);
    ctx.stroke();
  }
  game.board.forEach((row, y) =>
    row.forEach((value, x) => {
      if (value) cell(ctx, x * SIZE, y * SIZE, SIZE, COLORS[value]!);
    }),
  );
  if (game.phase === "playing" || game.phase === "paused") {
    const ghost = ghostY(game);
    if (ghost !== game.current.y)
      piece(ctx, game.current.cells, game.current.x, ghost, 0.22);
    piece(ctx, game.current.cells, position.x, position.y);
  }
}

export function drawPattern(
  ctx: CanvasRenderingContext2D,
  target: Pattern,
): void {
  ctx.fillStyle = "#101828";
  ctx.fillRect(0, 0, 120, 120);
  const size = 19;
  const offset = 12;
  target.cells.forEach((row, y) =>
    row.forEach((value, x) => {
      ctx.fillStyle = value ? "#b0a1fa" : "#24314a";
      ctx.fillRect(
        offset + x * size + 1,
        offset + y * size + 1,
        size - 3,
        size - 3,
      );
    }),
  );
}

export function drawNext(ctx: CanvasRenderingContext2D, matrix: Matrix): void {
  ctx.fillStyle = "#111827";
  ctx.fillRect(0, 0, 120, 75);
  const size = 22;
  const width = matrix[0]!.length * size;
  const x0 = (120 - width) / 2;
  const y0 = (75 - matrix.length * size) / 2;
  matrix.forEach((row, y) =>
    row.forEach((value, x) => {
      if (value) cell(ctx, x0 + x * size, y0 + y * size, size, COLORS[value]!);
    }),
  );
}

export function patternNumber(target: Pattern): string {
  return String(PATTERNS.indexOf(target) + 1).padStart(2, "0");
}
