import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import React, { useState, useEffect } from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";

interface SquareProps {
  value: string | null;
  onSquareClick: () => void;
}

function Square({ value, onSquareClick }: SquareProps) {
  return (
    <TouchableOpacity style={styles.square} onPress={onSquareClick}>
      <ThemedText style={styles.squareText}>{value}</ThemedText>
    </TouchableOpacity>
  );
}

interface BoardProps {
  xIsNext: boolean;
  squares: (string | null)[];
  onPlay: (nextSquares: (string | null)[]) => void;
}

function Board({ xIsNext, squares, onPlay }: BoardProps) {
  function handleClick(i: number) {
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? "X" : "O";
    onPlay(nextSquares);
  }

  const winner = calculateWinner(squares);
  const status = winner
    ? "Winner: " + winner
    : "Next player: " + (xIsNext ? "X" : "O");

  return (
    <ThemedView>
      <Text style={styles.status}>{status}</Text>
      {[0, 3, 6].map((rowStart) => (
        <ThemedView key={rowStart} style={styles.boardRow}>
          {Array.from({ length: 3 }, (_, index) => (
            <Square
              key={rowStart + index}
              value={squares[rowStart + index]}
              onSquareClick={() => handleClick(rowStart + index)}
            />
          ))}
        </ThemedView>
      ))}
      <TouchableOpacity
        onPress={() => {
          onPlay(Array(9).fill(null));
        }}
        style={styles.moveButton}
      >
        <Text style={styles.moveText}>Start new game</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          onPlay(Array(9).fill(null));
        }}
        style={styles.moveButton}
      >
        <Text style={styles.moveText}>Start new game with X</Text>
      </TouchableOpacity>
    </ThemedView>
  );
}

function isBoardEmpty(squares: (string | null)[]): boolean {
  return squares.every((square) => square === null);
}

export default function Game() {
  const [history, setHistory] = useState<(string | null)[][]>([
    Array(9).fill(null),
  ]);
  const [currentMove, setCurrentMove] = useState(0);
  const [xWins, setXWins] = useState(0);
  const [oWins, setOWins] = useState(0);
  let xIsNext = currentMove % 2 === 0;

  const currentSquares = history[currentMove];

  useEffect(() => {
    // Randomly decide who starts the game
    const startsWithX = Math.random() < 0.5;
    xIsNext !== startsWithX && handlePlay(currentSquares);
  }, []);

  function handlePlay(nextSquares: (string | null)[]) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    const nextMove = isBoardEmpty(nextSquares)
      ? Math.random() > 0.5
        ? 0
        : 1
      : currentMove + 1;
    setHistory(nextHistory);
    setCurrentMove(nextMove);

    const winner = calculateWinner(nextSquares);
    if (winner === "X") {
      setXWins(xWins + 1);
    } else if (winner === "O") {
      setOWins(oWins + 1);
    }
  }

  // Automatically play "O" if it's the system's turn and the game is ongoing
  useEffect(() => {
    if (!xIsNext && !calculateWinner(currentSquares)) {
      const bestMove = getBestMove(currentSquares);
      const nextSquares = currentSquares.slice();
      nextSquares[bestMove] = "O";
      handlePlay(nextSquares);
    }
  }, [currentMove, xIsNext, currentSquares]);

  return (
    <ThemedView style={styles.game}>
      <ThemedView style={styles.gameBoard}>
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </ThemedView>
      <ThemedView style={styles.scoreBoard}>
        <Text style={styles.scoreText}>Player (X) Wins: {xWins}</Text>
        <Text style={styles.scoreText}>Machine (O) Wins: {oWins}</Text>
      </ThemedView>
    </ThemedView>
  );
}

function calculateWinner(squares: (string | null)[]): string | null {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

function minimax(
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

function getBestMove(board: (string | null)[]): number {
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

const styles = StyleSheet.create({
  game: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  gameBoard: {
    marginBottom: 20,
  },
  boardRow: {
    flexDirection: "row",
  },
  square: {
    width: 100,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  squareText: {
    fontSize: 24,
  },
  status: {
    fontSize: 20,
    marginBottom: 20,
  },
  moveButton: {
    padding: 10,
    borderWidth: 1,
    marginVertical: 5,
  },
  moveText: {
    fontSize: 16,
  },
  gameInfo: {
    width: "100%",
    padding: 10,
  },
  scoreBoard: {
    marginTop: 20,
    alignItems: "center",
  },
  scoreText: {
    fontSize: 18,
    marginVertical: 5,
  },
});
