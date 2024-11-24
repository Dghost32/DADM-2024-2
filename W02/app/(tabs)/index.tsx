import Board from "@/components/Board";
import { ThemedView } from "@/components/ThemedView";
import calculateWinner from "@/utils/calculateWinner";
import getBestMove from "@/utils/getBestMove";
import React, { useState, useEffect } from "react";
import { Text, StyleSheet } from "react-native";

export default function Game() {
  const [history, setHistory] = useState<(string | null)[][]>([
    Array(9).fill(null),
  ]);
  const [currentMove, setCurrentMove] = useState(0);
  const [xWins, setXWins] = useState(0);
  const [oWins, setOWins] = useState(0);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];

  useEffect(() => {
    const startsWithX = Math.random() < 0.5;
    xIsNext !== startsWithX && handlePlay(currentSquares);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function isBoardEmpty(squares: (string | null)[]): boolean {
    return squares.every((square) => square === null);
  }

  function handlePlay(nextSquares: (string | null)[]) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);

    if (isBoardEmpty(nextSquares)) {
      setCurrentMove(0);
    }

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

const styles = StyleSheet.create({
  game: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  gameBoard: {
    marginBottom: 20,
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
