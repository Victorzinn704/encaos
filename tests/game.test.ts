import { describe, expect, it } from "vitest";
import {
  act,
  clearMatch,
  collides,
  createGame,
  dropInterval,
  findMatch,
  ghostY,
  matchesAt,
  rotate,
  ROWS,
  COLS,
  VOID,
} from "../src/game";
import { PATTERNS } from "../src/patterns";

describe("regras do tabuleiro", () => {
  it("cria linhas independentes e impede atravessar bordas ou blocos", () => {
    const game = createGame(() => 0);
    game.board[0]![0] = 1;
    expect(game.board[1]![0]).toBe(0);
    expect(collides(game.board, [[1]], -1, 0)).toBe(true);
    expect(collides(game.board, [[1]], COLS, 0)).toBe(true);
    expect(collides(game.board, [[1]], 0, ROWS)).toBe(true);
    expect(collides(game.board, [[1]], 0, 0)).toBe(true);
  });

  it("gira a matriz sem modificar a peça original", () => {
    const original = [
      [1, 0],
      [1, 1],
    ];
    expect(rotate(original)).toEqual([
      [1, 1],
      [1, 0],
    ]);
    expect(original).toEqual([
      [1, 0],
      [1, 1],
    ]);
  });

  it("considera o bloco void como vazio no padrão e preserva o resto do tabuleiro", () => {
    const game = createGame(() => 0);
    const target = PATTERNS[0]!;
    target.cells.forEach((row, y) =>
      row.forEach((value, x) => {
        game.board[y]![x] = value ? 2 : 0;
      }),
    );
    game.board[0]![0] = VOID;
    game.board[10]![9] = 7;
    expect(matchesAt(game.board, target, 0, 0)).toBe(true);
    expect(findMatch(game.board, target)).toEqual({ x: 0, y: 0 });
    clearMatch(game.board, 0, 0);
    expect(game.board[0]![0]).toBe(0);
    expect(game.board[1]![1]).toBe(0);
    expect(game.board[10]![9]).toBe(7);
  });

  it("só pontua após travar a peça e aumenta o nível a cada cinco padrões", () => {
    const game = createGame(() => 0);
    game.phase = "playing";
    game.target = PATTERNS[5]!;
    game.target.cells.forEach((row, y) =>
      row.forEach((value, x) => {
        game.board[y]![x] = value;
      }),
    );
    game.current = { cells: [[1]], x: 9, y: 0 };
    game.next = [[2]];
    expect(act(game, "drop", () => 0)).toBe(true);
    expect(game.score).toBe(100);
    expect(game.cleared).toBe(1);
    expect(game.level).toBe(1);
    expect(game.board[19]![9]).toBe(1);
    expect(game.board[0]![0]).toBe(0);
    game.cleared = 4;
    game.target = PATTERNS[5]!;
    game.target.cells.forEach((row, y) =>
      row.forEach((value, x) => {
        game.board[y]![x] = value;
      }),
    );
    game.current = { cells: [[1]], x: 8, y: 0 };
    expect(act(game, "drop", () => 0)).toBe(true);
    expect(game.level).toBe(2);
    expect(dropInterval(game.level)).toBeLessThan(dropInterval(1));
  });

  it("encerra quando a próxima peça não cabe", () => {
    const game = createGame(() => 0);
    game.phase = "playing";
    game.board[0]![4] = 2;
    game.current = { cells: [[1]], x: 0, y: 18 };
    game.next = [[1]];
    expect(ghostY(game)).toBe(19);
    act(game, "drop", () => 0);
    expect(game.phase).toBe("over");
    expect(act(game, "left", () => 0)).toBe(false);
  });
});
