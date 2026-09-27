import { COLS, ROWS, VOID, ghostY, type Game, type Matrix } from "./game";
import { PATTERNS, type Pattern } from "./patterns";

const SIZE = 30;
const COLORS: Record<number, string> = {
  1: "#f68777", 2: "#54c8bc", 3: "#e5a86f", 4: "#b69af5",
  5: "#e6cf7b", 6: "#74b8f6", 7: "#a4d387", [VOID]: "#3a4654",
};

function cell(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, alpha = 1): void {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fillRect(x + 1, y + 1, size - 2, size - 2);
  ctx.fillStyle = "rgba(255,255,255,.15)";
  ctx.fillRect(x + 1, y + 1, size - 2, 2);
  ctx.globalAlpha = 1;
}

function piece(ctx: CanvasRenderingContext2D, cells: Matrix, x: number, y: number, alpha = 1): void {
  cells.forEach((row, rowIndex) => row.forEach((value, colIndex) => {
    if (value && y + rowIndex >= 0) cell(ctx, (x + colIndex) * SIZE, (y + rowIndex) * SIZE, SIZE, COLORS[value]!, alpha);
  }));
}

export function drawBoard(ctx: CanvasRenderingContext2D, game: Game): void {
  ctx.fillStyle = "#111a23";
  ctx.fillRect(0, 0, COLS * SIZE, ROWS * SIZE);
  ctx.strokeStyle = "#25323e";
  ctx.lineWidth = 1;
  for (let x = 0; x <= COLS; x++) {
    ctx.beginPath(); ctx.moveTo(x * SIZE + .5, 0); ctx.lineTo(x * SIZE + .5, ROWS * SIZE); ctx.stroke();
  }
  for (let y = 0; y <= ROWS; y++) {
    ctx.beginPath(); ctx.moveTo(0, y * SIZE + .5); ctx.lineTo(COLS * SIZE, y * SIZE + .5); ctx.stroke();
  }
  game.board.forEach((row, y) => row.forEach((value, x) => {
    if (value) cell(ctx, x * SIZE, y * SIZE, SIZE, COLORS[value]!);
  }));
  if (game.phase === "playing" || game.phase === "paused") {
    const ghost = ghostY(game);
    if (ghost !== game.current.y) piece(ctx, game.current.cells, game.current.x, ghost, .22);
    piece(ctx, game.current.cells, game.current.x, game.current.y);
  }
}

export function drawPattern(ctx: CanvasRenderingContext2D, target: Pattern): void {
  ctx.fillStyle = "#101921";
  ctx.fillRect(0, 0, 120, 120);
  const size = 19;
  const offset = 12;
  target.cells.forEach((row, y) => row.forEach((value, x) => {
    ctx.fillStyle = value ? "#f68777" : "#25333c";
    ctx.fillRect(offset + x * size + 1, offset + y * size + 1, size - 3, size - 3);
  }));
}

export function drawNext(ctx: CanvasRenderingContext2D, matrix: Matrix): void {
  ctx.fillStyle = "#101921";
  ctx.fillRect(0, 0, 120, 75);
  const size = 22;
  const width = matrix[0]!.length * size;
  const x0 = (120 - width) / 2;
  const y0 = (75 - matrix.length * size) / 2;
  matrix.forEach((row, y) => row.forEach((value, x) => {
    if (value) cell(ctx, x0 + x * size, y0 + y * size, size, COLORS[value]!);
  }));
}

export function patternNumber(target: Pattern): string {
  return String(PATTERNS.indexOf(target) + 1).padStart(2, "0");
}
