import calculateWinner from "./calculateWinner";

export default function minimax(
  board: (string | null)[],
  depth: number,
  isMaximizing: boolean,
): number {
  const winner = calculateWinner(board);
  if (winner === "O") return 10 - depth; // Machine wins
  if (winner === "X") return depth - 10; // Player wins
  if (board.every((square) => square !== null)) return 0; // Draw

  const emptyIndices = board
    .map((value, index) => (value === null ? index : -1))
    .filter((index) => index !== -1);

  let bestScore = isMaximizing ? -Infinity : Infinity;

  emptyIndices.forEach((index) => {
    const newBoard = board.slice();
    newBoard[index] = isMaximizing ? "O" : "X";

    const score = minimax(newBoard, depth + 1, !isMaximizing);
    bestScore = isMaximizing
      ? Math.max(bestScore, score)
      : Math.min(bestScore, score);
  });

  return bestScore;
}
