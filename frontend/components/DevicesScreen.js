import React, { useEffect, useState } from "react";
import { View, Text, Button } from "react-native";
import { BleManager } from "react-native-ble-plx";

const DeviceScreen = () => {
  const [manager, setManager] = useState(null);
  const [device, setDevice] = useState(null);

  useEffect(() => {
    const bleManager = new BleManager();
    setManager(bleManager);

    return () => {
      bleManager.destroy();
    };
  }, []);

  const scanAndConnectToDevice = async () => {
    try {
      if (!manager) {
        console.error("BleManager não inicializado.");
        return;
      }

      manager.startDeviceScan(null, null, (error, scannedDevice) => {
        if (error) {
          console.error("Erro ao escanear dispositivos:", error.message);
          return;
        }

        if (scannedDevice && scannedDevice.name === "MeuDispositivoBLE") {
          manager.stopDeviceScan();
          scannedDevice
            .connect()
            .then((connectedDevice) => {
              console.log("Conectado ao dispositivo:", connectedDevice.name);
              setDevice(connectedDevice);
            })
            .catch((connectError) => {
              console.error("Falha ao conectar:", connectError.message);
            });
        }
      });

      setTimeout(() => {
        if (manager.isScanning) {
          manager.stopDeviceScan();
        }
      }, 10000); // Parar a varredura após 10 segundos
    } catch (scanError) {
      console.error("Erro ao escanear dispositivos:", scanError.message);
    }
  };

  const disconnectFromDevice = () => {
    if (device) {
      device
        .cancelConnection()
        .then(() => {
          console.log("Desconectado do dispositivo");
          setDevice(null);
        })
        .catch((disconnectError) => {
          console.error("Falha ao desconectar:", disconnectError.message);
        });
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Biblioteca React Native BLE PLX</Text>
      <Button title="Escanear e Conectar" onPress={scanAndConnectToDevice} />
      <Button
        title="Desconectar"
        onPress={disconnectFromDevice}
        disabled={!device}
      />
      {device && (
        <View>
          <Text>Dispositivo Conectado: {device.name}</Text>
        </View>
      )}
    </View>
  );
};

export default DeviceScreen;
