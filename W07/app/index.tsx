import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  useWindowDimensions,
  FlatList,
  TextInput,
  TouchableOpacity,
  Pressable,
} from "react-native";
import * as ScreenOrientation from "expo-screen-orientation";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { supabase } from "@/utils/supabase";
import { useRouter } from "expo-router";

interface Channel {
  id: number;
  name: string;
}

export default function Game() {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const router = useRouter();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [newChannelName, setNewChannelName] = useState("");

  useEffect(() => {
    (async () => {
      await ScreenOrientation.unlockAsync();
    })();

    fetchChannels();
    const subscription = supabase
      .channel("realtime:channels")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "channels" },
        (payload) => {
          console.log("New channel added:", payload);
          setChannels((prev) => [...prev, payload.new as Channel]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchChannels = async () => {
    const { data, error } = await supabase.from("channels").select("*");
    if (error) {
      console.error("Error fetching channels:", error);
      setChannels([]);
    } else {
      console.log("Fetched channels:", data);
      setChannels((data as Channel[]) ?? []);
    }
  };

  const createChannel = async () => {
    if (!newChannelName.trim()) return;

    const { data, error } = await supabase
      .from("channels")
      .insert([{ name: newChannelName }])
      .select();

    if (error) {
      console.error("Error creating channel:", error);
    } else {
      console.log("Created channel:", data);
    }

    setNewChannelName("");
  };

  const renderChannel = ({ item }: { item: Channel }) => (
    <Pressable
      style={styles.channelItem}
      onPress={() => router.push({ pathname: `/${item.id}` })}
    >
      <ThemedText type="subtitle" style={styles.channelText}>
        {item.name}
      </ThemedText>
    </Pressable>
  );

  return (
    <ThemedView style={isLandscape ? stylesLandscape.container : styles.container}>
      {/* Title */}
      <ThemedText type="title" style={styles.title}>
        Available Boards
      </ThemedText>

      <FlatList
        data={channels}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderChannel}
        contentContainerStyle={styles.channelList}
      />

      <TextInput
        style={styles.input}
        placeholder="Enter channel name"
        placeholderTextColor="#aaa"
        value={newChannelName}
        onChangeText={setNewChannelName}
      />

      <TouchableOpacity style={styles.createButton} onPress={createChannel}>
        <ThemedText type="subtitle">Create Channel</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#1e1e2e",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    color: "#b7bdf8",
    marginBottom: 20,
    textAlign: "center",
  },
  channelList: {
    width: "100%",
    paddingVertical: 10,
  },
  channelItem: {
    backgroundColor: "#2d2d44",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  channelText: {
    fontSize: 18,
    color: "#b7bdf8",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    width: "100%",
    borderRadius: 5,
    marginVertical: 10,
    color: "#fff",
  },
  createButton: {
    backgroundColor: "#4c4cff",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
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
  container: {
    flex: 1,
    flexDirection: "row",
    padding: 20,
    backgroundColor: "#1e1e2e",
  },
});
