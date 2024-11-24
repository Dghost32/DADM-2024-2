import Board from "@/components/Board";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useGame } from "@/contexts/gameContext";
import React from "react";
import { StyleSheet } from "react-native";

export default function Game() {
  const { xIsNext, currentSquares, handlePlay, oWins, xWins } = useGame();

  return (
    <ThemedView style={styles.game}>
      <ThemedView style={styles.gameBoard}>
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </ThemedView>
      <ThemedView style={styles.scoreBoard}>
        <ThemedText style={styles.scoreText} type="subtitle">
          Player (X) Wins: {xWins}
        </ThemedText>
        <ThemedText style={styles.scoreText} type="subtitle">
          Machine (O) Wins: {oWins}
        </ThemedText>
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
    color: "#b7bdf8",
    marginVertical: 5,
  },
});
