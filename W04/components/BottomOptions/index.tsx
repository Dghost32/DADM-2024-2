import React, { useState } from "react";
import { ThemedView } from "../ThemedView";
import { ThemedText } from "../ThemedText";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Alert, BackHandler, Pressable, StyleSheet } from "react-native";
import {
  ArrowPathIcon,
  BeakerIcon,
  XCircleIcon,
} from "react-native-heroicons/outline";
import { useGame } from "@/contexts/gameContext";
import DifficultyModal from "../DifficultyModal";

const BottomOptions = () => {
  const { bottom } = useSafeAreaInsets();
  const { resetGame } = useGame();
  const [modalShown, setModalShown] = useState(false);
  const styles = getStyles(bottom);

  return (
    <ThemedView style={styles.container}>
      <Pressable
        style={styles.option}
        onPress={() => {
          Alert.alert("Reset", "Are you sure you want to reset the game?", [
            {
              text: "Cancel",
              onPress: () => {},
              style: "cancel",
            },
            { text: "OK", onPress: () => resetGame() },
          ]);
        }}
      >
        <ArrowPathIcon color="white" size={32} />
        <ThemedText style={{ color: "white" }}>New Game</ThemedText>
      </Pressable>

      <Pressable
        style={styles.option}
        onPress={() => {
          setModalShown(true);
        }}
      >
        <BeakerIcon color="white" size={32} />
        <ThemedText style={{ color: "white" }}>Difficulty</ThemedText>
      </Pressable>

      <Pressable
        style={styles.option}
        onPress={() => {
          Alert.alert("Quit", "Are you sure you want to quit?", [
            {
              text: "Cancel",
              onPress: () => {},
              style: "cancel",
            },
            { text: "OK", onPress: () => BackHandler.exitApp() },
          ]);
        }}
      >
        <XCircleIcon color="white" size={32} />
        <ThemedText style={{ color: "white" }}>Quit</ThemedText>
      </Pressable>

      <DifficultyModal
        modalVisible={modalShown}
        close={() => setModalShown(false)}
      />
    </ThemedView>
  );
};

const getStyles = (bottom: number) =>
  StyleSheet.create({
    container: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      padding: 10,
      paddingBottom: bottom + 20,
      paddingTop: 20,
      display: "flex",
      paddingHorizontal: 20,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      textAlign: "center",
      backgroundColor: "#363a4f",
    },
    option: {
      width: 100,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: 5,
    },
  });

export default BottomOptions;
