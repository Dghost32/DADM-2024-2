import { StyleSheet, TouchableOpacity } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import calculateWinner from "@/utils/calculateWinner";
import Square from "@/components/Square";
import { ThemedText } from "../ThemedText";
import { useEffect, useState } from "react";
import { Audio } from "expo-av";
import { useAssets } from "expo-asset";

interface BoardProps {
  xIsNext: boolean;
  squares: (string | null)[];
  onPlay: (nextSquares: (string | null)[]) => void;
}

export default function Board({ xIsNext, squares, onPlay }: BoardProps) {
  const [mario] = useAssets([require("../../assets/sounds/mario.mp3")]);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  // This useEffect — fixes the bug you've encountered on iOS. Does work on normal sim
  // but can't figure out how to turn up volume here in the snack for iOS sim
  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
    });
  }, []);

  // Unload the song on clean up
  useEffect(() => {
    return sound
      ? () => {
          sound?.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const playSound = async (uri: string) => {
    try {
      if (!mario) return;
      const { sound, status } = await Audio.Sound.createAsync({
        uri,
      });
      setSound(sound);

      await sound.getStatusAsync();
      await sound.playAsync();
      // eslint-disable-next-line no-console
      console.log("Playing Sound", status);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log("Error playing sound", err);
    }
  };

  function handleClick(i: number) {
    if (calculateWinner(squares) || squares[i]) {
      return;
    }

    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? "X" : "O";

    if (!mario) return;

    playSound(mario[0].uri).then(() => {
      onPlay(nextSquares);
    });
  }

  const winner = calculateWinner(squares);
  let status = "Next player " + (xIsNext ? "🐱" : "🤖");

  if (winner) status = "Winner is " + (winner === "X" ? "🐱" : "🤖");
  else if (!squares.includes(null)) status = "It's a draw!";

  const winnerStyle = !winner
    ? {}
    : winner === "X"
      ? { color: "#91d7e3" }
      : { color: "#ed8796" };

  return (
    <ThemedView>
      <ThemedText type="subtitle" style={{ ...styles.status, ...winnerStyle }}>
        {status}
      </ThemedText>
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
        <ThemedText
          style={{
            textAlign: "center",
            fontWeight: "300",
          }}
          type="subtitle"
        >
          Start new game
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  status: {
    fontSize: 32,
    color: "#b7bdf8",
    marginBottom: 20,
  },
  boardRow: {
    display: "flex",
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  moveButton: {
    borderColor: "#c6a0f6",
    borderRadius: 10,
    padding: 10,
    borderWidth: 2,
    marginVertical: 5,
  },
  moveText: {
    fontSize: 16,
  },
});
