import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import calculateWinner from "@/utils/calculateWinner";
import Square from "@/components/Square";

interface BoardProps {
  xIsNext: boolean;
  squares: (string | null)[];
  onPlay: (nextSquares: (string | null)[]) => void;
}

export default function Board({ xIsNext, squares, onPlay }: BoardProps) {
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

  const winnerStyle = !winner
    ? { color: "black" }
    : winner === "X"
      ? { color: "green" }
      : { color: "red" };

  return (
    <ThemedView>
      <Text style={{ ...styles.status, ...winnerStyle }}>{status}</Text>
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
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  status: {
    fontSize: 20,
    marginBottom: 20,
  },
  boardRow: {
    flexDirection: "row",
  },
  moveButton: {
    padding: 10,
    borderWidth: 1,
    marginVertical: 5,
  },
  moveText: {
    fontSize: 16,
  },
});
