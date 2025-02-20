import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import Board from "@/components/Board";
import { supabase } from "@/utils/supabase";
import BottomOptions from "@/components/BottomOptions";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface GameData {
  state: (string | null)[];
  xIsNext: boolean;
  player_cat: string | null;
  player_robot: string | null;
}

export default function Game() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [localPlayerId, setLocalPlayerId] = useState<string | null>(null);

  // Generate a unique local player ID using AsyncStorage
  useEffect(() => {
    const fetchLocalPlayerId = async () => {
      const key = `game_${id}_playerId`;
      let playerId = await AsyncStorage.getItem(key);
      if (!playerId) {
        playerId = Math.random().toString(36).substring(2, 10);
        await AsyncStorage.setItem(key, playerId);
      }
      setLocalPlayerId(playerId);
    };
    fetchLocalPlayerId();
  }, [id]);

  useEffect(() => {
    (async () => {
      await ScreenOrientation.unlockAsync();
    })();

    fetchGameState();

    const subscription = supabase
      .channel(`realtime:game_${id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "games",
          filter: `id=eq.${id}`,
        },
        (payload) => {
          setGameData(payload.new as GameData);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [id, localPlayerId]);

  const fetchGameState = async () => {
    const { data, error } = await supabase
      .from("games")
      .select("state, xIsNext, player_cat, player_robot")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No game row found, so create one.
        const defaultState = Array(9).fill(null);
        const { data: newGameData, error: insertError } = await supabase
          .from("games")
          .insert({ id, state: defaultState, xIsNext: true })
          .select("state, xIsNext, player_cat, player_robot")
          .single();
        if (insertError) {
          console.error("Error creating game state:", insertError);
        } else if (newGameData) {
          // Assign local player to player_cat if available.
          if (localPlayerId && !newGameData.player_cat) {
            newGameData.player_cat = localPlayerId;
            await supabase
              .from("games")
              .update({ player_cat: localPlayerId })
              .eq("id", id);
          }
          setGameData(newGameData);
        }
      } else {
        console.error("Error fetching game state:", error);
      }
    } else if (data) {
      const game = data as GameData;
      if (localPlayerId) {
        if (!game.player_cat) {
          game.player_cat = localPlayerId;
          await supabase
            .from("games")
            .update({ player_cat: localPlayerId })
            .eq("id", id);
        } else if (game.player_cat !== localPlayerId && !game.player_robot) {
          game.player_robot = localPlayerId;
          await supabase
            .from("games")
            .update({ player_robot: localPlayerId })
            .eq("id", id);
        }
      }
      setGameData(game);
    }
  };

  const handlePlay = async (nextSquares: (string | null)[]) => {
    if (!gameData) return;
    const isReset = nextSquares.every((s) => s === null);
    // Only block moves if not resetting and there's a winner.
    if (!isReset && checkWinner(gameData.state)) return;

    const newState = nextSquares;
    const newXIsNext = isReset ? true : !gameData.xIsNext;
    setGameData({ ...gameData, state: newState, xIsNext: newXIsNext });
    const { error } = await supabase
      .from("games")
      .update({ state: newState, xIsNext: newXIsNext })
      .eq("id", id);
    if (error) {
      console.error("Error updating game state:", error);
    }
  };

  const checkWinner = (squares: (string | null)[]) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let [a, b, c] of lines) {
      if (
        squares[a] &&
        squares[a] === squares[b] &&
        squares[a] === squares[c]
      ) {
        return squares[a];
      }
    }
    return null;
  };

  if (!gameData || !localPlayerId) {
    return (
      <ThemedView style={styles.game}>
        <ThemedText type="subtitle">Loading game...</ThemedText>
      </ThemedView>
    );
  }

  // Check if both players are assigned.
  const playersReady = gameData.player_cat && gameData.player_robot;
  // Determine if it's the local player's turn.
  const yourTurn =
    (gameData.xIsNext && gameData.player_cat === localPlayerId) ||
    (!gameData.xIsNext && gameData.player_robot === localPlayerId);

  return (
    <>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push("/")}
      >
        <ThemedText type="subtitle">Back</ThemedText>
      </TouchableOpacity>

      <ThemedView style={isLandscape ? stylesLandscape.game : styles.game}>
        {/* Title */}
        <ThemedText type="title" style={styles.title}>
          Tic Tac Toe
        </ThemedText>
        {!playersReady ? (
          <ThemedText style={styles.waitingText} type="subtitle">
            Waiting for opponent to join...
          </ThemedText>
        ) : (
          <>
            <ThemedView
              style={isLandscape ? stylesLandscape.gameBoard : styles.gameBoard}
            >
              <Board
                squares={gameData.state}
                xIsNext={gameData.xIsNext}
                onPlay={handlePlay}
                disabled={!yourTurn}
              />
            </ThemedView>
            <ThemedView>
              <ThemedText style={styles.statusText} type="subtitle">
                {checkWinner(gameData.state)
                  ? `Winner: ${checkWinner(gameData.state) === "X" ? "🐱" : "🤖"}`
                  : `Next Player: ${gameData.xIsNext ? "🐱" : "🤖"} ${
                      yourTurn ? "(Your turn)" : "(Opponent's turn)"
                    }`}
              </ThemedText>
              <TouchableOpacity
                style={styles.restartButton}
                onPress={() => handlePlay(Array(9).fill(null))}
              >
                <ThemedText type="subtitle">Restart Game</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </>
        )}
      </ThemedView>
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
  title: {
    fontSize: 28,
    color: "#b7bdf8",
    marginBottom: 10,
    textAlign: "center",
  },
  statusText: {
    fontSize: 18,
    color: "#b7bdf8",
    marginVertical: 5,
    textAlign: "center",
  },
  waitingText: {
    fontSize: 16,
    color: "#ed8796",
    marginBottom: 10,
    textAlign: "center",
  },
  restartButton: {
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
    borderColor: "#c6a0f6",
    borderWidth: 2,
    borderRadius: 10,
    marginTop: 10,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 10,
    padding: 10,
    backgroundColor: "#333",
    borderRadius: 5,
  },
});

const stylesLandscape = StyleSheet.create({
  game: {
    flex: 1,
    flexDirection: "row",
    paddingHorizontal: 40,
    paddingVertical: 20,
    justifyContent: "space-between",
    alignItems: "center",
  },
  gameBoard: {
    flex: 1,
    marginRight: 20,
  },
  title: {
    fontSize: 32,
    color: "#b7bdf8",
    marginBottom: 20,
    textAlign: "center",
  },
  statusText: {
    fontSize: 20,
    color: "#b7bdf8",
    marginVertical: 10,
    textAlign: "center",
  },
  waitingText: {
    fontSize: 18,
    color: "#ed8796",
    marginBottom: 10,
    textAlign: "center",
  },
  restartButton: {
    padding: 12,
    borderColor: "#c6a0f6",
    borderWidth: 2,
    borderRadius: 10,
    marginTop: 20,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 10,
    padding: 10,
    backgroundColor: "#333",
    borderRadius: 5,
  },
});
