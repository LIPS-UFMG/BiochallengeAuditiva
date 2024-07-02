#include <BluetoothSerial.h>

BluetoothSerial SerialBT;

#define LED_BUILTIN 2  // Substitua pelo pino onde o LED está conectado
#define MOTOR_PIN 12   // Exemplo: usar GPIO 12 para controlar o motor de vibração

void setup() {
    Serial.begin(115200);
    SerialBT.begin("ESP32 Bluetooth");  // Nome do dispositivo Bluetooth
    Serial.println("Espere pela conexão Bluetooth...");
    pinMode(MOTOR_PIN, OUTPUT);
    pinMode(LED_BUILTIN, OUTPUT);  // LED integrado para indicar a conexão Bluetooth
}

void loop() {
    if (SerialBT.available()) {
        String data = SerialBT.readStringUntil('\n');  // Ler até o caractere de nova linha (\n)
        data.trim();                                   // Remover espaços em branco do início e do fim da string

        if (data.length() > 0) {
            Serial.print("Dados Bluetooth recebidos: ");
            Serial.println(data);

            if (data.equals("galo")) {
                digitalWrite(MOTOR_PIN, HIGH);
                Serial.println("Motor de vibração ligado por 4 segundos...");
                delay(4000);  // Motor vibra por 4 segundos se a mensagem for "galo"
            } else {
                digitalWrite(MOTOR_PIN, HIGH);
                Serial.println("Motor de vibração ligado por 1 segundo...");
                delay(1000);  // Motor vibra por 1 segundo para qualquer outra mensagem
            }

            digitalWrite(MOTOR_PIN, LOW);
            Serial.println("Motor de vibração desligado...");
        }
    }

    // Verifica a conexão Bluetooth
    if (SerialBT.connected()) {
        digitalWrite(LED_BUILTIN, HIGH);  // LED aceso se estiver conectado
    } else {
        digitalWrite(LED_BUILTIN, LOW);  // LED apagado se não estiver conectado
    }

    delay(1000);
}