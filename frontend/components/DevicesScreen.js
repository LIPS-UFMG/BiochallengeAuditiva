import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import { BleManager, Device } from '@react-native-ble/plx';

const DeviceScreen = () => {
  const [manager, setManager] = useState<BleManager | null>(null);
  const [device, setDevice] = useState<Device | null>(null);

  useEffect(() => {
    const bleManager = new BleManager();
    setManager(bleManager);

    return () => {
      bleManager.destroy();
    };
  }, []);

  const scanAndConnectToDevice = async () => {
    try {
      const devices = await manager?.startDeviceScan(null, null, (error, scannedDevice) => {
        if (error) {
          console.error('Error scanning for devices:', error.message);
          return;
        }
        
        if (scannedDevice?.name === 'MeuDispositivoBLE') { // Substitua com o nome do seu dispositivo
          manager?.stopDeviceScan();
          scannedDevice.connect()
            .then((connectedDevice) => {
              console.log('Connected to device:', connectedDevice.name);
              setDevice(connectedDevice);
            })
            .catch((connectError) => {
              console.error('Failed to connect to device:', connectError.message);
            });
        }
      });
      
      setTimeout(() => {
        manager?.stopDeviceScan();
      }, 10000); // Parar a varredura após 10 segundos
    } catch (scanError) {
      console.error('Error scanning for devices:', scanError.message);
    }
  };

  const disconnectFromDevice = () => {
    if (device) {
      device.cancelConnection()
        .then(() => {
          console.log('Disconnected from device');
          setDevice(null);
        })
        .catch((disconnectError) => {
          console.error('Failed to disconnect:', disconnectError.message);
        });
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Biblioteca React Native BLE PLX</Text>
      <Button title="Escanear e Conectar" onPress={scanAndConnectToDevice} />
      <Button title="Desconectar" onPress={disconnectFromDevice} disabled={!device} />
      {device && (
        <View>
          <Text>Dispositivo Conectado: {device.name}</Text>
          {/* Aqui você pode adicionar mais interações com o dispositivo */}
        </View>
      )}
    </View>
  );
};

export default DeviceScreen;
