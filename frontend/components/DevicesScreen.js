import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
} from "react-native";
import axios from "axios";

const BACKEND_URL = "http://192.168.0.156:3000";

const DevicesScreen = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [device, setDevice] = useState(null);
  const [message, setMessage] = useState("");

  const checkStatus = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/status`);
      setIsConnected(response.data.isConnected);
      setDevice(response.data.device);
    } catch (error) {
      console.error("Error checking status:", error);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const connectDevice = async () => {
    try {
      const response = await axios.post(`${BACKEND_URL}/connect`);
      if (response.data.message === "Connected successfully.") {
        setIsConnected(true);
        setDevice(response.data.device);
      }
    } catch (error) {
      console.error("Error connecting to device:", error);
    }
  };

  const disconnectDevice = async () => {
    try {
      const response = await axios.post(`${BACKEND_URL}/disconnect`);
      if (response.data.message === "Disconnected successfully.") {
        setIsConnected(false);
        setDevice(null);
      }
    } catch (error) {
      console.error("Error disconnecting from device:", error);
    }
  };

  const sendMessage = async () => {
    if (message.trim()) {
      try {
        await axios.post(`${BACKEND_URL}/send`, { message });
        console.log("Message sent successfully");
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.statusText}>
        {isConnected ? `Conectado a: ${device}` : "Desconectado"}
      </Text>
      <TouchableOpacity
        style={[
          styles.button,
          isConnected ? styles.disconnectButton : styles.connectButton,
        ]}
        onPress={isConnected ? disconnectDevice : connectDevice}
      >
        <Text style={styles.buttonText}>
          {isConnected ? "Desconectar" : "Conectar"}
        </Text>
      </TouchableOpacity>
      {isConnected && (
        <View style={styles.messageContainer}>
          <TextInput
            style={styles.input}
            placeholder="Digite a mensagem"
            value={message}
            onChangeText={setMessage}
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Text style={styles.buttonText}>Enviar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  statusText: {
    fontSize: 18,
    marginBottom: 20,
  },
  button: {
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    width: "60%",
  },
  connectButton: {
    backgroundColor: "#4CAF50",
  },
  disconnectButton: {
    backgroundColor: "#F44336",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  messageContainer: {
    marginTop: 20,
    width: "80%",
    alignItems: "center",
  },
  input: {
    width: "100%",
    padding: 10,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
  },
  sendButton: {
    backgroundColor: "#1E90FF",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    width: "100%",
  },
});

export default DevicesScreen;
