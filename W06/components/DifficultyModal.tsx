import { useGame } from "@/contexts/gameContext";
import React from "react";
import { Alert, Modal, StyleSheet, Pressable } from "react-native";
import { ThemedView } from "./ThemedView";
import { ThemedText } from "./ThemedText";
import { XMarkIcon } from "react-native-heroicons/outline";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  modalVisible: boolean;
  close: () => void;
};

const DifficultyModal = ({ modalVisible, close }: Props) => {
  const { bottom } = useSafeAreaInsets();
  const { difficulty, setDifficulty } = useGame();

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        Alert.alert("Modal has been closed.");
        close();
      }}
    >
      <ThemedView style={{ ...styles.centeredView, marginBottom: bottom }}>
        <ThemedView style={styles.modalView}>
          <ThemedText type="title" style={{ color: "#c6a0f6" }}>
            Difficulty
          </ThemedText>

          <ThemedView id="close-icon" style={styles.close}>
            <Pressable onPress={close}>
              <XMarkIcon color="#ed8796" size={24} />
            </Pressable>
          </ThemedView>
          <ThemedText type="default">Select one of the following</ThemedText>

          <Pressable
            style={[styles.button]}
            onPress={() => setDifficulty("easy")}
          >
            <ThemedText
              type="default"
              style={[
                styles.difficultyOption,
                difficulty === "easy" ? styles.currentDifficulty : {},
              ]}
            >
              Easy
            </ThemedText>
          </Pressable>

          <Pressable
            style={[styles.button]}
            onPress={() => setDifficulty("medium")}
          >
            <ThemedText
              type="default"
              style={[
                styles.difficultyOption,
                difficulty === "medium" ? styles.currentDifficulty : {},
              ]}
            >
              Medium
            </ThemedText>
          </Pressable>

          <Pressable
            style={[styles.button]}
            onPress={() => setDifficulty("hard")}
          >
            <ThemedText
              type="default"
              style={[
                styles.difficultyOption,
                difficulty === "hard" ? styles.currentDifficulty : {},
              ]}
            >
              Hard
            </ThemedText>
          </Pressable>
        </ThemedView>
      </ThemedView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-end",
    backgroundColor: "transparent",
    alignItems: "center",
  },
  modalView: {
    margin: 20,
    borderRadius: 20,
    borderColor: "#fff",
    borderWidth: 2,
    width: "80%",
    padding: 35,
    alignItems: "center",
    position: "relative",
    elevation: 5,
  },
  close: {
    position: "absolute",
    top: 16,
    right: 16,
  },
  button: {
    borderRadius: 10,
    padding: 10,
  },
  difficultyOption: {
    fontWeight: "bold",
    paddingTop: 10,
    fontSize: 20,
    color: "#7dc4e4",
  },
  currentDifficulty: {
    color: "#a6da95",
  },
});

export default DifficultyModal;
