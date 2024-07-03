import React, { useState, useEffect } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { BleManager } from "react-native-ble-plx";
import { Buffer } from "buffer";

const DeviceName = "ESP32_BLE_Device"; // Nome do dispositivo ESP32 BLE
const ServiceUUID = "0000ffe1-0000-1000-8000-00805f9b34fb"; // UUID do serviço
const CharacteristicUUID = "0000ffe1-0000-1000-8000-00805f9b34fb"; // UUID da característica

const DeviceScreen = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [device, setDevice] = useState(null);
  const [characteristic, setCharacteristic] = useState(null);

  useEffect(() => {
    const manager = new BleManager();

    return () => {
      manager.destroy();
    };
  }, []);

  const handleScan = (manager) => {
    setIsScanning(true);
    manager.startDeviceScan(null, null, (error, scannedDevice) => {
      if (error) {
        console.error("Erro ao escanear dispositivos:", error);
        setIsScanning(false);
        return;
      }

      if (scannedDevice?.name === DeviceName) {
        connectToDevice(manager, scannedDevice);
        manager.stopDeviceScan();
        setIsScanning(false);
      }
    });
  };

  const connectToDevice = (manager, device) => {
    device
      .connect()
      .then((connectedDevice) => {
        setDevice(connectedDevice);
        setIsConnected(true);
        console.log("Conectado ao dispositivo:", connectedDevice.id);
        return connectedDevice.discoverAllServicesAndCharacteristics();
      })
      .then((device) => {
        const service = device.services().find((s) => s.uuid === ServiceUUID);
        const characteristic = service.characteristics.find(
          (c) => c.uuid === CharacteristicUUID
        );
        setCharacteristic(characteristic);
      })
      .catch((error) => {
        console.error("Erro ao conectar:", error);
      });
  };

  const sendMessageToDevice = () => {
    if (!characteristic) {
      console.error("Característica não está pronta.");
      return;
    }

    const message = "Hello ESP32!";
    const messageBase64 = Buffer.from(message).toString("base64");

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
          onPress={() => handleScan(bleManager)}
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
