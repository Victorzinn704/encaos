export const COLS = 10;
export const ROWS = 20;
export type Matrix = number[][];
export type Phase = "ready" | "playing" | "paused" | "over";
export type Piece = { cells: Matrix; x: number; y: number };
export type Game = {
  board: Matrix;
  current: Piece;
  next: [Matrix, Matrix];
  bag: Matrix[];
  score: number;
  level: number;
  cleared: number;
  lastClear: number[];
  combo: number;
  comboBonus: number;
  phase: Phase;
  message: string;
};

// Todas as peças têm quatro blocos. A sacola entrega cada formato uma vez antes de renovar.
export const SHAPES: readonly (readonly (readonly number[])[])[] = [
  [[1, 1, 1, 1]],
  [
    [2, 2],
    [2, 2],
  ],
  [
    [0, 3, 0],
    [3, 3, 3],
  ],
  [
    [0, 4, 4],
    [4, 4, 0],
  ],
  [
    [5, 5, 0],
    [0, 5, 5],
  ],
  [
    [6, 0, 0],
    [6, 6, 6],
  ],
  [
    [0, 0, 7],
    [7, 7, 7],
  ],
];
const copy = (matrix: readonly (readonly number[])[]): Matrix =>
  matrix.map((row) => [...row]);
function takePiece(bag: Matrix[], random: () => number): Matrix {
  if (!bag.length) {
    bag.push(...SHAPES.map(copy));
    for (let i = bag.length - 1; i > 0; i--) {
      const j = Math.max(0, Math.min(i, Math.floor(random() * (i + 1))));
      [bag[i], bag[j]] = [bag[j]!, bag[i]!];
    }
  }
  return bag.shift()!;
}
function atSpawn(cells: Matrix): Piece {
  return { cells, x: Math.floor((COLS - cells[0]!.length) / 2), y: 0 };
}
export function createGame(random: () => number = Math.random): Game {
  const bag: Matrix[] = [];
  return {
    board: Array.from({ length: ROWS }, () => Array(COLS).fill(0) as number[]),
    current: atSpawn(takePiece(bag, random)),
    next: [takePiece(bag, random), takePiece(bag, random)],
    bag,
    score: 0,
    level: 1,
    cleared: 0,
    lastClear: [],
    combo: 0,
    comboBonus: 0,
    phase: "ready",
    message: "Complete uma linha com dez blocos para limpar o tabuleiro.",
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
      const bx = x + col,
        by = y + row;
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
export function clearLines(board: Matrix): number[] {
  const rows: number[] = [];
  const remaining = board.filter((row, y) => {
    if (!row.every((value) => value !== 0)) return true;
    rows.push(y);
    return false;
  });
  if (rows.length) {
    // As linhas sobreviventes descem juntas; lacunas dentro delas permanecem intactas.
    const empty = Array.from(
      { length: rows.length },
      () => Array(COLS).fill(0) as number[],
    );
    board.splice(0, ROWS, ...empty, ...remaining);
  }
  return rows;
}
function settle(game: Game, random: () => number): void {
  const { cells, x, y } = game.current;
  cells.forEach((row, dy) =>
    row.forEach((value, dx) => {
      if (value && y + dy >= 0) game.board[y + dy]![x + dx] = value;
    }),
  );
  game.lastClear = clearLines(game.board);
  game.comboBonus = 0;
  if (game.lastClear.length) {
    const count = game.lastClear.length;
    const points = [0, 100, 300, 500, 800][count]! * game.level;
    // Só limpar linhas em peças consecutivas prolonga a sequência; mover ou pausar não a quebra.
    game.combo++;
    game.comboBonus = (game.combo - 1) * 50 * game.level;
    game.score += points + game.comboBonus;
    game.cleared += count;
    game.level = 1 + Math.floor(game.cleared / 10);
    game.message = `${count === 1 ? "Linha limpa" : `${count} linhas limpas`}! +${points} pontos.${game.comboBonus ? ` Combo ×${game.combo}: +${game.comboBonus} extra!` : ""}`;
  } else {
    game.message =
      game.combo > 0
        ? "Sequência encerrada. Complete outra linha!"
        : "Complete linhas de ponta a ponta.";
    game.combo = 0;
  }
  game.current = atSpawn(game.next[0]);
  game.next = [game.next[1], takePiece(game.bag, random)];
  if (collides(game.board, game.current.cells, game.current.x, 0)) {
    game.phase = "over";
    game.message = "A pilha chegou ao topo. Tente novamente.";
  }
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
  game.lastClear = [];
  const piece = game.current;
  if (action === "left" || action === "right") {
    const x = piece.x + (action === "left" ? -1 : 1);
    if (collides(game.board, piece.cells, x, piece.y)) return false;
    piece.x = x;
  } else if (action === "rotate") {
    const cells = rotate(piece.cells);
    const offset = [0, -1, 1, -2, 2, -3, 3].find(
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
