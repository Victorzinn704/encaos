import { PATTERNS, type Pattern } from "./patterns";

export const COLS = 10;
export const ROWS = 20;
export const VOID = 8;
export type Matrix = number[][];
export type Phase = "ready" | "playing" | "paused" | "over";
export type Piece = { cells: Matrix; x: number; y: number };
export type Game = {
  board: Matrix;
  current: Piece;
  next: Matrix;
  target: Pattern;
  score: number;
  level: number;
  cleared: number;
  phase: Phase;
  message: string;
};

// O bloco vazio ocupa espaço ao cair, mas equivale a uma lacuna na conferência do padrão.
export const SHAPES: readonly (readonly (readonly number[])[])[] = [
  [[1]],
  [[2, 2]],
  [[3], [3]],
  [
    [4, 4],
    [4, 4],
  ],
  [[5, 5, 5]],
  [[6, 6, 6, 6]],
  [
    [7, 0],
    [7, 7],
  ],
  [[VOID]],
  [[VOID, VOID]],
];

const copy = (matrix: readonly (readonly number[])[]): Matrix =>
  matrix.map((row) => [...row]);
const pick = <T>(items: readonly T[], random: () => number): T =>
  items[
    Math.min(items.length - 1, Math.max(0, Math.floor(random() * items.length)))
  ]!;

export function createGame(random: () => number = Math.random): Game {
  const cells = copy(pick(SHAPES, random));
  return {
    board: Array.from({ length: ROWS }, () => Array(COLS).fill(0) as number[]),
    current: { cells, x: Math.floor((COLS - cells[0]!.length) / 2), y: 0 },
    next: copy(pick(SHAPES, random)),
    target: pick(PATTERNS, random),
    score: 0,
    level: 1,
    cleared: 0,
    phase: "ready",
    message: "Monte o desenho alvo em qualquer área 5 × 5 do tabuleiro.",
  };
}

export function collides(
  board: Matrix,
  cells: Matrix,
  x: number,
  y: number,
): boolean {
  for (let row = 0; row < cells.length; row++) {
    for (let col = 0; col < cells[row]!.length; col++) {
      if (!cells[row]![col]) continue;
      const bx = x + col;
      const by = y + row;
      if (
        bx < 0 ||
        bx >= COLS ||
        by >= ROWS ||
        (by >= 0 && board[by]![bx] !== 0)
      )
        return true;
    }
  }
  return false;
}

export function rotate(cells: Matrix): Matrix {
  return cells[0]!.map((_, col) => cells.map((row) => row[col]!).reverse());
}

export function matchesAt(
  board: Matrix,
  pattern: Pattern,
  startY: number,
  startX: number,
): boolean {
  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 5; x++) {
      const occupied =
        board[startY + y]![startX + x] !== 0 &&
        board[startY + y]![startX + x] !== VOID;
      if (occupied !== (pattern.cells[y]![x] === 1)) return false;
    }
  }
  return true;
}

export function findMatch(
  board: Matrix,
  pattern: Pattern,
): { x: number; y: number } | null {
  for (let y = 0; y <= ROWS - 5; y++) {
    for (let x = 0; x <= COLS - 5; x++) {
      if (matchesAt(board, pattern, y, x)) return { x, y };
    }
  }
  return null;
}

export function clearMatch(board: Matrix, x: number, y: number): void {
  // Limpa somente a janela resolvida; os demais blocos permanecem no tabuleiro.
  for (let row = y; row < y + 5; row++) {
    for (let col = x; col < x + 5; col++) board[row]![col] = 0;
  }
}

function lock(game: Game): void {
  const { cells, x, y } = game.current;
  for (let row = 0; row < cells.length; row++) {
    for (let col = 0; col < cells[row]!.length; col++) {
      if (cells[row]![col] && y + row >= 0)
        game.board[y + row]![x + col] = cells[row]![col]!;
    }
  }
}

function spawn(game: Game, random: () => number): void {
  const cells = game.next;
  game.current = { cells, x: Math.floor((COLS - cells[0]!.length) / 2), y: 0 };
  game.next = copy(pick(SHAPES, random));
  if (collides(game.board, cells, game.current.x, 0)) {
    game.phase = "over";
    game.message = "Sinal interrompido: a próxima peça não cabe.";
  }
}

function settle(game: Game, random: () => number): void {
  lock(game);
  const match = findMatch(game.board, game.target);
  if (match) {
    const solved = game.target.name;
    clearMatch(game.board, match.x, match.y);
    game.score += 100;
    game.cleared++;
    game.level = 1 + Math.floor(game.cleared / 5);
    const options = PATTERNS.filter((pattern) => pattern !== game.target);
    game.target = pick(options, random);
    game.message = `${solved} resolvido! +100 pontos.`;
  }
  spawn(game, random);
}

export function dropInterval(level: number): number {
  return Math.max(180, 900 - (level - 1) * 85);
}

export function ghostY(game: Game): number {
  let y = game.current.y;
  while (!collides(game.board, game.current.cells, game.current.x, y + 1)) y++;
  return y;
}

export function act(
  game: Game,
  action: "left" | "right" | "rotate" | "down" | "drop",
  random: () => number = Math.random,
): boolean {
  if (game.phase !== "playing") return false;
  const piece = game.current;
  if (action === "left" || action === "right") {
    const x = piece.x + (action === "left" ? -1 : 1);
    if (collides(game.board, piece.cells, x, piece.y)) return false;
    piece.x = x;
  } else if (action === "rotate") {
    const cells = rotate(piece.cells);
    const offset = [0, -1, 1, -2, 2].find(
      (dx) => !collides(game.board, cells, piece.x + dx, piece.y),
    );
    if (offset === undefined) return false;
    piece.cells = cells;
    piece.x += offset;
  } else if (action === "drop") {
    piece.y = ghostY(game);
    settle(game, random);
  } else if (collides(game.board, piece.cells, piece.x, piece.y + 1)) {
    settle(game, random);
  } else {
    piece.y++;
  }
  return true;
}
