#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>

BLEServer* pServer = NULL;
BLECharacteristic* pCharacteristic = NULL;
bool deviceConnected = false;
bool oldDeviceConnected = false;

class MyServerCallbacks : public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) {
        deviceConnected = true;
    };

    void onDisconnect(BLEServer* pServer) {
        deviceConnected = false;
    }
};

void setup() {
    Serial.begin(115200);

    // Create the BLE Device
    BLEDevice::init("ESP32_BLE_Device");

    // Create the BLE Server
    pServer = BLEDevice::createServer();
    pServer->setCallbacks(new MyServerCallbacks());

    // Create the BLE Service
    BLEService* pService = pServer->createService("0000ffe1-0000-1000-8000-00805f9b34fb");

    // Create a BLE Characteristic
    pCharacteristic = pService->createCharacteristic(
        "0000ffe1-0000-1000-8000-00805f9b34fb",
        BLECharacteristic::PROPERTY_NOTIFY);

    // Start the service
    pService->start();

    // Start advertising
    pServer->getAdvertising()->start();
    Serial.println("Waiting a client connection to notify...");
}

void loop() {
    // Notify BLE characteristic value change
    if (deviceConnected) {
        pCharacteristic->setValue("Hello from ESP32!");
        pCharacteristic->notify();
        delay(1000);  // Delay before next notification
    }

    // Disconnecting
    if (!deviceConnected && oldDeviceConnected) {
        delay(500);  // Give the BLE stack the chance to get things ready
        pServer->startAdvertising();
        Serial.println("Start advertising");
        oldDeviceConnected = deviceConnected;
    }

    // Connecting
    if (deviceConnected && !oldDeviceConnected) {
        oldDeviceConnected = deviceConnected;
    }
}