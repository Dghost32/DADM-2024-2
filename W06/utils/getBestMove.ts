import minimax from "./minimax";

export function getEasyMove(board: (string | null)[]): number {
  const emptyIndices = board
    .map((value, index) => (value === null ? index : -1))
    .filter((index) => index !== -1);

  // Selección completamente aleatoria
  return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
}

export function getMediumMove(board: (string | null)[]): number {
  const emptyIndices = board
    .map((value, index) => (value === null ? index : -1))
    .filter((index) => index !== -1);

  let bestScore = -Infinity;
  let bestMove = -1;

  emptyIndices.forEach((index) => {
    const newBoard = board.slice();
    newBoard[index] = "O";
    const score = minimax(newBoard, 0, false); // Máquina
    if (score > bestScore) {
      bestScore = score;
      bestMove = index;
    }
  });

  // Introduce aleatoriedad para hacerlo más fácil
  if (Math.random() < 0.2) {
    bestMove = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
  }

  return bestMove;
}

export function getHardMove(board: (string | null)[]): number {
  const emptyIndices = board
    .map((value, index) => (value === null ? index : -1))
    .filter((index) => index !== -1);

  let bestScore = -Infinity;
  let bestMove = -1;

  emptyIndices.forEach((index) => {
    const newBoard = board.slice();
    newBoard[index] = "O";
    const score = minimax(newBoard, 0, false); // Máquina
    if (score > bestScore) {
      bestScore = score;
      bestMove = index;
    }
  });

  return bestMove; // Sin aleatoriedad, siempre óptimo
}
