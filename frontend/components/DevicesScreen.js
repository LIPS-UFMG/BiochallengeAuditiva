// DevicesScreen.js
import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import axios from "axios";

const BACKEND_URL = "http://192.168.0.84:3000";

const DevicesScreen = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [device, setDevice] = useState(null);

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
      setIsConnected(true);
      setDevice(response.data.device);
    } catch (error) {
      console.error("Error connecting to device:", error);
    }
  };

  const disconnectDevice = async () => {
    try {
      await axios.post(`${BACKEND_URL}/disconnect`);
      setIsConnected(false);
      setDevice(null);
    } catch (error) {
      console.error("Error disconnecting from device:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.statusText}>
        {isConnected ? `Conectado a: ${device}` : "Desconectado"}
      </Text>
      <TouchableOpacity
        style={[styles.button, isConnected ? styles.disconnectButton : styles.connectButton]}
        onPress={isConnected ? disconnectDevice : connectDevice}
      >
        <Text style={styles.buttonText}>
          {isConnected ? "Desconectar" : "Conectar"}
        </Text>
      </TouchableOpacity>
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
});

export default DevicesScreen;
