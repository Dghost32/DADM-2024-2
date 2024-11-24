import minimax from "./minimax";

export default function getBestMove(board: (string | null)[]): number {
  const emptyIndices = board
    .map((value, index) => (value === null ? index : -1))
    .filter((index) => index !== -1);

  let bestScore = -Infinity;
  let bestMove = -1;

  emptyIndices.forEach((index) => {
    const newBoard = board.slice();
    newBoard[index] = "O";
    const score = minimax(newBoard, 0, false); // Machine's turn
    if (score > bestScore) {
      bestScore = score;
      bestMove = index;
    }
  });

  // Reduce difficulty by adding randomness here
  if (Math.random() < 0.2) {
    // Introduce 20% randomness where the machine might not pick the best move
    bestMove = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
  }

  return bestMove;
}
