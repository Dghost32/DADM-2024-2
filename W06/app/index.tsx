import Board from "@/components/Board";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useGame } from "@/contexts/gameContext";
import React, { useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import * as ScreenOrientation from "expo-screen-orientation";

export default function Game() {
  const { xIsNext, currentSquares, handlePlay, oWins, xWins } = useGame();

  const [orientation, setOrientation] = useState(
    ScreenOrientation.OrientationLock.PORTRAIT,
  );

  return (
    <ThemedView
      style={
        orientation === ScreenOrientation.OrientationLock.PORTRAIT
          ? styles.game
          : stylesLandscape.game
      }
    >
      <ThemedView
        style={
          orientation === ScreenOrientation.OrientationLock.PORTRAIT
            ? styles.gameBoard
            : stylesLandscape.gameBoard
        }
      >
        <Pressable
          onPress={() => {
            if (orientation === ScreenOrientation.OrientationLock.PORTRAIT) {
              ScreenOrientation.lockAsync(
                ScreenOrientation.OrientationLock.LANDSCAPE,
              );
              setOrientation(ScreenOrientation.OrientationLock.LANDSCAPE);
              console.log(orientation);
            } else {
              ScreenOrientation.lockAsync(
                ScreenOrientation.OrientationLock.PORTRAIT,
              );
              setOrientation(ScreenOrientation.OrientationLock.PORTRAIT);
              console.log(orientation);
            }
          }}
        >
          <ThemedText type="title">rotate</ThemedText>
        </Pressable>
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </ThemedView>
      <ThemedView
        style={
          orientation === ScreenOrientation.OrientationLock.PORTRAIT
            ? styles.scoreBoard
            : stylesLandscape.scoreBoard
        }
      >
        <ThemedText
          style={
            orientation === ScreenOrientation.OrientationLock.PORTRAIT
              ? styles.scoreText
              : stylesLandscape.scoreText
          }
          type="subtitle"
        >
          Player (X) Wins: {xWins}
        </ThemedText>
        <ThemedText
          style={
            orientation === ScreenOrientation.OrientationLock.PORTRAIT
              ? styles.scoreText
              : stylesLandscape.scoreText
          }
          type="subtitle"
        >
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
