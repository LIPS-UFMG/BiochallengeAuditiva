import React, { useState, useEffect } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { BleManager } from "react-native-ble-plx";

const DeviceName = "ESP32_BLE_Device"; // Nome do dispositivo ESP32 BLE
const ServiceUUID = "0000ffe1-0000-1000-8000-00805f9b34fb"; // UUID do serviço
const CharacteristicUUID = "0000ffe1-0000-1000-8000-00805f9b34fb"; // UUID da característica

const DeviceScreen = () => {
  const [bleManager, setBleManager] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [device, setDevice] = useState(null);
  const [characteristic, setCharacteristic] = useState(null);

  useEffect(() => {
    const manager = new BleManager();
    setBleManager(manager);

    return () => {
      if (manager) {
        manager.destroy();
      }
    };
  }, []);

  const handleScan = () => {
    if (!bleManager) {
      console.error("BleManager não foi inicializado corretamente.");
      return;
    }

    setIsScanning(true);
    bleManager.startDeviceScan(null, null, (error, scannedDevice) => {
      if (error) {
        console.error("Erro ao escanear dispositivos:", error);
        setIsScanning(false);
        return;
      }
      if (scannedDevice?.name === DeviceName) {
        connectToDevice(scannedDevice);
        bleManager.stopDeviceScan();
        setIsScanning(false);
      }
    });
  };

  const connectToDevice = (device) => {
    if (!bleManager) {
      console.error("BleManager não foi inicializado corretamente.");
      return;
    }

    device
      .connect()
      .then((connectedDevice) => {
        setDevice(connectedDevice);
        setIsConnected(true);
        console.log("Conectado ao dispositivo:", connectedDevice.id);
        discoverServicesAndCharacteristics(connectedDevice);
      })
      .catch((error) => {
        console.error("Erro ao conectar:", error);
      });
  };

  const discoverServicesAndCharacteristics = (device) => {
    if (!bleManager) {
      console.error("BleManager não foi inicializado corretamente.");
      return;
    }

    device
      .discoverAllServicesAndCharacteristics()
      .then((services) => {
        const service = services.find((s) => s.uuid === ServiceUUID);
        if (!service) {
          console.warn("Serviço não encontrado");
          return;
        }
        const characteristic = service.characteristics.find(
          (c) => c.uuid === CharacteristicUUID
        );
        if (characteristic) {
          setCharacteristic(characteristic);
        } else {
          console.warn("Característica não encontrada");
        }
      })
      .catch((error) => {
        console.error("Erro ao descobrir serviços e características:", error);
      });
  };

  const sendMessageToDevice = () => {
    if (!bleManager || !characteristic) {
      console.error(
        "BleManager não foi inicializado corretamente ou característica não está pronta."
      );
      return;
    }

    const message = "Hello ESP32!";
    const messageBase64 = Buffer.from(message).toString("base64"); // Convertendo mensagem para base64

    characteristic
      .writeWithoutResponse(messageBase64)
      .then(() => {
        console.log("Mensagem enviada com sucesso");
      })
      .catch((error) => {
        console.error("Erro ao enviar mensagem:", error);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.statusText}>
        {isConnected ? "Conectado com ESP32!" : "Não conectado"}
      </Text>
      {!isConnected && (
        <Button
          title="Conectar com ESP32"
          onPress={handleScan}
          disabled={isScanning}
        />
      )}
      {isConnected && (
        <Button title="Enviar mensagem" onPress={sendMessageToDevice} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  statusText: {
    fontSize: 20,
    marginBottom: 20,
  },
});

export default DeviceScreen;
