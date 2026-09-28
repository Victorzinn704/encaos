export type Pattern = { name: string; cells: readonly (readonly number[])[] };

// O desenho precisa coincidir com toda a janela 5 × 5, inclusive os espaços vazios.
export const PATTERNS: readonly Pattern[] = [
  {
    name: "Null Pointer",
    cells: [
      [0, 1, 1, 1, 0],
      [0, 1, 0, 1, 0],
      [0, 1, 1, 1, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 1, 0, 0],
    ],
  },
  {
    name: "Memory Leak",
    cells: [
      [0, 1, 1, 1, 0],
      [1, 0, 0, 0, 1],
      [1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1],
      [1, 0, 0, 0, 1],
    ],
  },
  {
    name: "Off By One",
    cells: [
      [0, 0, 1, 0, 0],
      [0, 1, 1, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 1, 1, 1, 0],
    ],
  },
  {
    name: "Race Condition",
    cells: [
      [1, 1, 1, 1, 0],
      [1, 0, 0, 0, 1],
      [1, 1, 1, 1, 0],
      [1, 0, 0, 1, 0],
      [1, 0, 0, 0, 1],
    ],
  },
  {
    name: "Infinite Loop",
    cells: [
      [0, 1, 1, 1, 0],
      [1, 0, 0, 0, 1],
      [1, 0, 0, 0, 1],
      [1, 0, 0, 0, 1],
      [0, 1, 1, 1, 0],
    ],
  },
  {
    name: "Syntax Error",
    cells: [
      [1, 1, 1, 1, 1],
      [0, 0, 1, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 1, 0, 0],
    ],
  },
  {
    name: "Type Mismatch",
    cells: [
      [1, 0, 0, 0, 1],
      [0, 1, 0, 1, 0],
      [0, 0, 1, 0, 0],
      [0, 1, 0, 1, 0],
      [1, 0, 0, 0, 1],
    ],
  },
];
