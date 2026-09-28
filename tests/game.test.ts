import { describe, expect, it } from "vitest";
import {
  act,
  clearLines,
  collides,
  createGame,
  dropInterval,
  ghostY,
  rotate,
  ROWS,
  COLS,
  SHAPES,
} from "../src/game";

describe("regras de linhas e peças", () => {
  it("cria linhas independentes e impede atravessar bordas ou blocos", () => {
    const game = createGame(() => 0);
    game.board[0]![0] = 1;
    expect(game.board[1]![0]).toBe(0);
    expect(collides(game.board, [[1]], -1, 0)).toBe(true);
    expect(collides(game.board, [[1]], COLS, 0)).toBe(true);
    expect(collides(game.board, [[1]], 0, ROWS)).toBe(true);
    expect(collides(game.board, [[1]], 0, 0)).toBe(true);
  });
  it("gira sem modificar a matriz original e ajusta a peça na parede", () => {
    const original = [
      [0, 3, 0],
      [3, 3, 3],
    ];
    expect(rotate(original)).toEqual([
      [3, 0],
      [3, 3],
      [3, 0],
    ]);
    expect(original).toEqual([
      [0, 3, 0],
      [3, 3, 3],
    ]);
    const game = createGame(() => 0);
    game.phase = "playing";
    game.current = { cells: [[1], [1], [1], [1]], x: 9, y: 0 };
    expect(act(game, "rotate")).toBe(true);
    expect(game.current.x).toBe(6);
    expect(
      collides(game.board, game.current.cells, game.current.x, game.current.y),
    ).toBe(false);
  });
  it("remove linhas completas e desce os blocos acima preservando lacunas", () => {
    const game = createGame(() => 0);
    game.board[19]!.fill(1);
    game.board[17]!.fill(2);
    game.board[18]![3] = 3;
    game.board[16]![7] = 4;
    expect(clearLines(game.board)).toEqual([17, 19]);
    expect(game.board).toHaveLength(ROWS);
    expect(game.board[19]![3]).toBe(3);
    expect(game.board[19]![4]).toBe(0);
    expect(game.board[18]![7]).toBe(4);
    expect(game.board[0]!.every((value) => value === 0)).toBe(true);
    game.board[0]![0] = 6;
    expect(game.board[1]![0]).toBe(0);
  });
  it("preserva uma linha incompleta e só pontua ao travar a peça", () => {
    const game = createGame(() => 0);
    game.phase = "playing";
    game.board[19]!.fill(2);
    game.board[19]![9] = 0;
    const before = game.board.map((row) => [...row]);
    expect(clearLines(game.board)).toEqual([]);
    expect(game.board).toEqual(before);
    game.current = { cells: [[1], [1], [1], [1]], x: 9, y: 0 };
    expect(act(game, "down")).toBe(true);
    expect(game.score).toBe(0);
    expect(act(game, "drop", () => 0)).toBe(true);
    expect(game.score).toBe(100);
    expect(game.cleared).toBe(1);
    expect(game.lastClear).toEqual([19]);
    expect(game.board[19]![0]).toBe(0);
    expect(game.board[19]![9]).toBe(1);
  });
  it("limpa quatro linhas juntas, pontua e aumenta o nível a cada dez linhas", () => {
    const game = createGame(() => 0);
    game.phase = "playing";
    game.cleared = 6;
    for (let y = 16; y < 20; y++) {
      game.board[y]!.fill(2);
      game.board[y]![9] = 0;
    }
    game.current = { cells: [[1], [1], [1], [1]], x: 9, y: 0 };
    act(game, "drop", () => 0);
    expect(game.lastClear).toEqual([16, 17, 18, 19]);
    expect(game.score).toBe(800);
    expect(game.cleared).toBe(10);
    expect(game.level).toBe(2);
    expect(game.board.flat().every((value) => value === 0)).toBe(true);
    expect(dropInterval(2)).toBeLessThan(dropInterval(1));
  });
  it("entrega os sete tetrominós sem repetição dentro de uma sacola", () => {
    expect(
      SHAPES.every((shape) => shape.flat().filter(Boolean).length === 4),
    ).toBe(true);
    const game = createGame(() => 0.999);
    game.phase = "playing";
    const shapes: string[] = [];
    for (let i = 0; i < 7; i++) {
      shapes.push(JSON.stringify(game.current.cells));
      act(game, "drop", () => 0.999);
      game.board.forEach((row) => row.fill(0));
    }
    expect(new Set(shapes).size).toBe(7);
  });
  it("encerra quando a próxima peça não cabe e bloqueia ações fora da partida", () => {
    const game = createGame(() => 0);
    expect(act(game, "drop")).toBe(false);
    game.phase = "playing";
    game.board[0]![4] = 2;
    game.current = { cells: [[1]], x: 0, y: 18 };
    game.next = [
      [
        [2, 2],
        [2, 2],
      ],
      game.next[1],
    ];
    expect(ghostY(game)).toBe(19);
    act(game, "drop", () => 0);
    expect(game.phase).toBe("over");
    expect(act(game, "left")).toBe(false);
  });
  it("avança a fila mantendo a ordem das duas próximas peças", () => {
    const game = createGame(() => 0.999);
    game.phase = "playing";
    for (let i = 0; i < 14; i++) {
      const [first, second] = game.next;
      act(game, "drop", () => 0.999);
      expect(game.current.cells).toBe(first);
      expect(game.next[0]).toBe(second);
      expect(game.next).toHaveLength(2);
      expect(game.next[0]).not.toBe(game.next[1]);
      game.board.forEach((row) => row.fill(0));
    }
  });
  it("premia limpezas consecutivas e encerra o combo só ao travar sem limpar", () => {
    const game = createGame(() => 0.999);
    game.phase = "playing";
    const clear = () => {
      game.board.forEach((row) => row.fill(0));
      game.board[19]!.fill(2);
      game.board[19]![9] = 0;
      game.current = { cells: [[1], [1], [1], [1]], x: 9, y: 0 };
      act(game, "drop", () => 0.999);
    };
    clear();
    expect(game.combo).toBe(1);
    expect(game.comboBonus).toBe(0);
    expect(game.score).toBe(100);
    act(game, "left");
    act(game, "rotate");
    act(game, "down");
    expect(game.combo).toBe(1);
    game.phase = "paused";
    expect(act(game, "drop")).toBe(false);
    expect(game.combo).toBe(1);
    game.phase = "playing";
    clear();
    expect(game.combo).toBe(2);
    expect(game.comboBonus).toBe(50);
    expect(game.score).toBe(250);
    clear();
    expect(game.combo).toBe(3);
    expect(game.comboBonus).toBe(100);
    expect(game.score).toBe(450);
    game.board.forEach((row) => row.fill(0));
    act(game, "drop", () => 0.999);
    expect(game.combo).toBe(0);
    expect(game.comboBonus).toBe(0);
    expect(game.score).toBe(450);
    clear();
    expect(game.combo).toBe(1);
    expect(game.score).toBe(550);
    expect(createGame().combo).toBe(0);
  });
  it("calcula bônus com o nível da jogada, inclusive quando ela avança o nível", () => {
    const game = createGame(() => 0.999);
    game.phase = "playing";
    game.level = 2;
    game.cleared = 19;
    game.combo = 1;
    game.board[19]!.fill(2);
    game.board[19]![9] = 0;
    game.current = { cells: [[1], [1], [1], [1]], x: 9, y: 0 };
    act(game, "drop", () => 0.999);
    expect(game.score).toBe(300);
    expect(game.comboBonus).toBe(100);
    expect(game.level).toBe(3);
  });
});
