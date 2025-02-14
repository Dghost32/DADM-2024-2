import React, { useEffect, useState } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import * as ScreenOrientation from "expo-screen-orientation";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import Board from "@/components/Board";
import { useGame } from "@/contexts/gameContext";
import BottomOptions from "@/components/BottomOptions";

export default function Game() {
  const { xIsNext, currentSquares, handlePlay, oWins, xWins } = useGame();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  useEffect(() => {
    (async () => {
      await ScreenOrientation.unlockAsync();
    })();
  }, []);

  return (
    <>
      <ThemedView style={isLandscape ? stylesLandscape.game : styles.game}>
        <ThemedView
          style={isLandscape ? stylesLandscape.gameBoard : styles.gameBoard}
        >
          <Board
            xIsNext={xIsNext}
            squares={currentSquares}
            onPlay={handlePlay}
          />
        </ThemedView>
        <ThemedView
          style={isLandscape ? stylesLandscape.scoreBoard : styles.scoreBoard}
        >
          <ThemedText style={styles.scoreText} type="subtitle">
            Player (X) Wins: {xWins}
          </ThemedText>
          <ThemedText style={styles.scoreText} type="subtitle">
            Machine (O) Wins: {oWins}
          </ThemedText>
        </ThemedView>
      </ThemedView>
      <BottomOptions hidden={isLandscape} />
    </>
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

const stylesLandscape = StyleSheet.create({
  game: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  gameBoard: {
    marginRight: 20,
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
