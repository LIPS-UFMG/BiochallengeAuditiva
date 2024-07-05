import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import axios from "axios";

const BACKEND_URL = "http://172.20.10.5:3000";
const STATUS_CHECK_INTERVAL = 5000; // Intervalo de verificação em milissegundos

const DevicesScreen = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusIntervalId, setStatusIntervalId] = useState(null);

  const checkStatus = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/status`);
      setIsConnected(response.data.isConnected);
      setDevice(response.data.device);
    } catch (error) {
      console.error("Error checking status:", error);
      setIsConnected(false); // Define como desconectado em caso de erro
      setDevice(null);
    }
  };

  useEffect(() => {
    // Inicia a verificação de status ao montar o componente
    checkStatus();

    // Define o intervalo para verificar o status periodicamente
    const intervalId = setInterval(checkStatus, STATUS_CHECK_INTERVAL);
    setStatusIntervalId(intervalId);

    // Limpa o intervalo ao desmontar o componente
    return () => {
      if (statusIntervalId) {
        clearInterval(statusIntervalId);
      }
    };
  }, []);

  const connectDevice = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/connect`);
      if (response.data.message === "Scanning for device...") {
        // Continue verificando o status até conectar
        const intervalId = setInterval(async () => {
          await checkStatus(); // Verifica o status imediatamente após o connect
          if (isConnected) {
            clearInterval(intervalId);
          }
        }, 1000);
        setStatusIntervalId(intervalId); // Define o novo intervalo de status
      }
    } catch (error) {
      console.error("Error connecting to device:", error);
    } finally {
      setLoading(false); // Define loading como false mesmo em caso de erro
    }
  };

  const disconnectDevice = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/disconnect`);
      if (response.data.message === "Disconnected successfully.") {
        setIsConnected(false);
        setDevice(null);
      }
    } catch (error) {
      console.error("Error disconnecting from device:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.statusText}>
        {isConnected ? "Conectado a:\nEsp32 Bluetooth" : "Desconectado"}
      </Text>
      <TouchableOpacity
        style={[
          styles.button,
          isConnected ? styles.disconnectButton : styles.connectButton,
        ]}
        onPress={isConnected ? disconnectDevice : connectDevice}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.buttonText}>
            {isConnected ? "Desconectar" : "Conectar"}
          </Text>
        )}
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
  textAlign: "center",
    fontSize: 18,
    marginBottom: 20,
  },
  button: {
    padding: 15,
    borderRadius: 35,
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
