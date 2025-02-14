import { StatusBar } from "expo-status-bar";
import { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Ionicons } from "@expo/vector-icons";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef();

  const genAI = new GoogleGenerativeAI("AIzaSyDmWFPFA5JlkPOFanFQjQDhkTPI9o8FecE");
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  useEffect(() => {
    request("Hola");
  }, []);

  const request = async (prompt) => {
    setIsLoading(true);
    try {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      setMessages([
        ...messages,
        { text: prompt, sender: "user" },
        { text: responseText, sender: "bot" },
      ]);
    } catch (error) {
      console.error("Error en la solicitud:", error);
      setMessages([
        ...messages,
        { text: prompt, sender: "user" },
        { text: "Error al obtener la respuesta.", sender: "bot" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (message.trim() !== "") {
      request(message);
      setMessage("");
    }
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI - Gemini</Text>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollViewContent}
      >
        {messages.map((msg, index) => (
          <View
            key={index}
            style={
              msg.sender === "user" ? styles.userMessage : styles.botMessage
            }
          >
            <Text style={styles.messageText}>{msg.text}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Escribe tu mensaje..."
          onChangeText={setMessage}
          value={message}
          multiline
        />
        {isLoading ? (
          <ActivityIndicator size="small" color="#007AFF" />
        ) : (
          <TouchableOpacity onPress={handleSendMessage}>
            <Ionicons name="send" size={24} color="#007AFF" />
          </TouchableOpacity>
        )}
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  scrollViewContent: {
    paddingVertical: 10,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#007AFF",
    borderRadius: 20,
    padding: 12,
    marginVertical: 5,
    maxWidth: "70%",
    alignItems: "flex-end",
  },
  botMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#232324",
    borderRadius: 10,
    padding: 12,
    marginVertical: 5,
    maxWidth: "70%",
  },
  messageText: {
    color: "#fff",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#007AFF",
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginTop: 10,
  },
  input: {
    flex: 1,
    height: 40,
    paddingHorizontal: 10,
  },
});
