import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import Square from "@/components/Square";
import calculateWinner from "@/utils/calculateWinner";

export interface BoardProps {
  squares: (string | null)[];
  xIsNext: boolean;
  onPlay: (nextSquares: (string | null)[]) => void;
  disabled?: boolean;
}

export default function Board({ squares, xIsNext, onPlay, disabled = false }: BoardProps) {
  const handleClick = (i: number) => {
    if (disabled) return;
    if (calculateWinner(squares) || squares[i]) return;
    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? "X" : "O";
    onPlay(nextSquares);
  };

  return (
    <View>
      {[0, 3, 6].map((rowStart) => (
        <View key={rowStart} style={styles.boardRow}>
          {Array.from({ length: 3 }, (_, index) => (
            <Square
              key={rowStart + index}
              value={squares[rowStart + index]}
              onSquareClick={() => handleClick(rowStart + index)}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  boardRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
});
