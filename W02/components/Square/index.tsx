import { ThemedText } from "@/components/ThemedText";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

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

export default Square;

const styles = StyleSheet.create({
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
});
